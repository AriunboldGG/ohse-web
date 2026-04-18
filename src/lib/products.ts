import { db, storage } from "./firebase";
import { collection, getDocs, doc, getDoc, query, where, orderBy, limit, startAfter, type QuerySnapshot } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";


export type Product = {
  id: number;
  firestoreId: string; // Unique Firestore document ID
  name: string;
  name_en?: string;
  manufacture_country?: string;
  youtube_url?: string;
  price: string;
  sale_price?: string;
  salePriceNum?: number;
  img: string;
  images?: string[]; // Multiple images for gallery
  modelNumber: string;
  category: "ppe" | "rescue" | "workplace" | "other";
  mainCategory?: "ppe" | "rescue" | "workplace" | "other"; // Main category from backend
  subcategory: string;
  subleaf: string;
  color: string;
  brand: string;
  brandImage?: string; // Brand logo/image from Firestore
  size: string;
  priceNum: number;
  product_code?: string; // Product code from backend
  product_sector?: string | string[]; // Product sector from Firebase (product_sector field)
  sale?: boolean; // Sale flag from Firebase
  stock: number; // Stock count from Firebase: > 0 means in stock, 0 means preorder
  theme: string;
  material?: string;
  description?: string;
  feature?: string;
  productTypes?: string[]; // Array of product types from backend
};

/**
 * Get Firebase Storage URL for an image path
 * If the path is already a full URL, return it as-is
 * If it's a Firebase Storage path, get the download URL
 * Otherwise, return the path as-is (for local images)
 */
export async function getImageUrl(imagePath: string): Promise<string> {
  // If already a full URL (http/https), return as-is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // If it's a Firebase Storage path (starts with gs:// or doesn't start with /)
  // Try to get download URL from Firebase Storage
  if (storage && !imagePath.startsWith("/")) {
    try {
      const storageRef = ref(storage, imagePath);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      // Fallback to the path as-is
      return imagePath;
    }
  }

  // For local paths (starting with /), return as-is
  return imagePath;
}

/**
 * Get multiple image URLs from Firebase Storage
 */
export async function getImageUrls(imagePaths: string[]): Promise<string[]> {
  return Promise.all(imagePaths.map(path => getImageUrl(path)));
}

// Helper function to extract value from Firestore data (handles both direct values and Firestore format)
function parseFirestoreTypedValue(value: any): any {
  if (!value || typeof value !== "object") return value;
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.integerValue !== undefined) return parseInt(value.integerValue, 10);
  if (value.doubleValue !== undefined) return parseFloat(value.doubleValue);
  if (value.booleanValue !== undefined) return value.booleanValue;
  if (value.arrayValue?.values) {
    return value.arrayValue.values.map(parseFirestoreTypedValue);
  }
  if (value.mapValue?.fields) {
    const result: Record<string, any> = {};
    Object.entries(value.mapValue.fields).forEach(([key, fieldValue]) => {
      result[key] = parseFirestoreTypedValue(fieldValue);
    });
    return result;
  }
  return value;
}

function getFirestoreValue(data: any, field: string, defaultValue: any = ""): any {
  if (!data) return defaultValue;
  
  // Try exact field name first
  if (data[field] !== undefined && data[field] !== null) {
    const value = data[field];
    // Firestore might return values in different formats
    // Handle direct values
    if (typeof value !== "object" || value === null) return value;
    // Handle Firestore typed values (for REST API compatibility)
    const parsedTypedValue = parseFirestoreTypedValue(value);
    if (parsedTypedValue !== value) return parsedTypedValue;
    // Return as-is if it's already the correct format
    return value;
  }
  
  // Try camelCase variations
  const camelCaseField = field.charAt(0).toLowerCase() + field.slice(1);
  if (data[camelCaseField] !== undefined && data[camelCaseField] !== null) {
    return data[camelCaseField];
  }
  
  // Try snake_case variations
  const snakeCaseField = field.replace(/([A-Z])/g, '_$1').toLowerCase();
  if (data[snakeCaseField] !== undefined && data[snakeCaseField] !== null) {
    return data[snakeCaseField];
  }
  
  return defaultValue;
}

// Convert Firestore document to Product type
function firestoreDocToProduct(docId: string, data: any): Product {
  // Try to parse document ID as number if id field is missing
  const docIdNum = parseInt(docId, 10) || 0;
  
  // Handle images array
  const imagesValue = getFirestoreValue(data, "images");
  let images: string[] | undefined;
  if (imagesValue) {
    if (Array.isArray(imagesValue)) {
      images = imagesValue;
    } else if (typeof imagesValue === "string") {
      // If it's a comma-separated string, split it
      images = imagesValue.split(",").map((s: string) => s.trim()).filter(Boolean);
    }
  }
  
  // Read mainCategory field from Firestore (field name is mainCategory)
  const mainCategoryValue = getFirestoreValue(data, "mainCategory");
  const categoryValue = getFirestoreValue(data, "category") || "other";
  
  // Handle price - can be number or string
  const priceValue = getFirestoreValue(data, "price");
  const priceNumValue = getFirestoreValue(data, "priceNum");
  let priceStr = "0₮";
  let priceNum = 0;
  
  if (priceNumValue && typeof priceNumValue === 'number' && priceNumValue > 0) {
    priceNum = priceNumValue;
    priceStr = `${priceNum.toLocaleString()} ₮`;
  } else if (priceValue) {
    if (typeof priceValue === 'number') {
      priceNum = priceValue;
      priceStr = `${priceNum.toLocaleString()} ₮`;
    } else if (typeof priceValue === 'string' && priceValue.trim() !== '') {
      priceStr = priceValue;
      // Try to extract number from string (e.g., "85000" or "85000₮")
      const numMatch = priceValue.match(/\d+/);
      if (numMatch) {
        priceNum = parseInt(numMatch[0], 10) || 0;
      }
    }
  }

  // Handle sale price - can be number or string
  const salePriceValue = getFirestoreValue(data, "sale_price") ?? getFirestoreValue(data, "salePrice");
  let salePriceStr = "";
  let salePriceNum = 0;

  if (salePriceValue && typeof salePriceValue === "number" && salePriceValue > 0) {
    salePriceNum = salePriceValue;
    salePriceStr = `${salePriceNum.toLocaleString()} ₮`;
  } else if (typeof salePriceValue === "string" && salePriceValue.trim() !== "") {
    salePriceStr = salePriceValue;
    const numMatch = salePriceValue.match(/\d+/);
    if (numMatch) {
      salePriceNum = parseInt(numMatch[0], 10) || 0;
    }
  }
  
  return {
    id: getFirestoreValue(data, "id") || docIdNum,
    firestoreId: docId, // Always use Firestore document ID as unique identifier
    name: getFirestoreValue(data, "name") || "",
    name_en: getFirestoreValue(data, "name_en") || getFirestoreValue(data, "nameEn") || "",
    manufacture_country:
      getFirestoreValue(data, "manufacture_country") ||
      getFirestoreValue(data, "manufactureCountry") ||
      "",
    youtube_url: getFirestoreValue(data, "youtube_url") || getFirestoreValue(data, "youtubeUrl") || "",
    price: priceStr,
    sale_price: salePriceStr || "",
    salePriceNum: salePriceNum || 0,
    img: getFirestoreValue(data, "img") || getFirestoreValue(data, "image") || "",
    images: images, // Multiple images for gallery
    modelNumber: getFirestoreValue(data, "modelNumber") || "",
    category: categoryValue as Product["category"],
    mainCategory: mainCategoryValue ? (mainCategoryValue as Product["mainCategory"]) : undefined,
    subcategory: getFirestoreValue(data, "subcategory") || "",
    subleaf: getFirestoreValue(data, "subleaf") || "",
    color: getFirestoreValue(data, "color") || "",
    brand: getFirestoreValue(data, "brand") || "",
    brandImage: getFirestoreValue(data, "brandImage") || undefined, // Brand logo/image
    size: getFirestoreValue(data, "size") || "",
    priceNum: priceNum,
    product_code: getFirestoreValue(data, "product_code") || undefined, // Product code from backend
    product_sector: getFirestoreValue(data, "product_sector") || undefined, // Product sector from Firebase
    sale: Boolean(getFirestoreValue(data, "sale")), // Sale flag from Firebase
    stock: getFirestoreValue(data, "stock") || 0, // Number: > 0 = in stock, 0 = preorder
    theme: getFirestoreValue(data, "theme") || "",
    material: getFirestoreValue(data, "material") || "",
    description: getFirestoreValue(data, "description") || "",
    feature: getFirestoreValue(data, "feature") || "",
    productTypes: (() => {
      const productTypesValue = getFirestoreValue(data, "productTypes");
      if (!productTypesValue) return undefined;
      
      if (Array.isArray(productTypesValue)) {
        return productTypesValue
          .map((type: any) => (typeof type === 'string' ? type.trim() : String(type).trim()))
          .filter((type: string) => type !== '');
      } else if (typeof productTypesValue === 'string') {
        return [productTypesValue.trim()].filter((type: string) => type !== '');
      }
      return undefined;
    })(),
  };
}

/**
 * Fetch all products from Firestore
 * Uses pagination if there are many products (Firestore default limit is ~1000 documents per query)
 */
export async function getAllProducts(): Promise<Product[]> {
  if (!db) {
    return [];
  }

  try {
    const productsRef = collection(db, "products");
    const products: Product[] = [];
    const productTypesSet = new Set<string>();
    let lastDoc: QueryDocumentSnapshot<DocumentData> | null = null;
    const batchSize = 1000; // Firestore's maximum batch size
    
    // Paginate through all products using document ID ordering
    while (true) {
      let q;
      if (lastDoc) {
        // Paginate using document ID (requires orderBy)
        q = query(productsRef, orderBy("__name__"), startAfter(lastDoc), limit(batchSize));
      } else {
        q = query(productsRef, orderBy("__name__"), limit(batchSize));
      }
      
      const snapshot: QuerySnapshot<DocumentData> = await getDocs(q);
      
      if (snapshot.empty) {
        break; // No more documents
      }
      
      snapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        try {
          const data = doc.data();
          
          // Extract productTypes from raw data
          const productTypesValue = getFirestoreValue(data, "productTypes");
          if (productTypesValue) {
            if (Array.isArray(productTypesValue)) {
              productTypesValue.forEach((type: any) => {
                if (type && typeof type === 'string') {
                  productTypesSet.add(type.trim());
                }
              });
            } else if (typeof productTypesValue === 'string') {
              productTypesSet.add(productTypesValue.trim());
            }
          }
          
          const product = firestoreDocToProduct(doc.id, data);
          products.push(product);
        } catch (err) {
          // Error processing product, skip it
        }
      });
      
      // Check if there are more documents to fetch
      if (snapshot.size < batchSize) {
        break; // We've fetched all documents
      }
      
      // Get the last document for pagination
      lastDoc = snapshot.docs[snapshot.docs.length - 1];
    }

    return products;
  } catch (error: any) {
    // If orderBy("__name__") fails (e.g., index not created), try without pagination
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      try {
        const productsRef = collection(db, "products");
        const snapshot = await getDocs(productsRef);
        const products: Product[] = [];
        const productTypesSet = new Set<string>();
        
        snapshot.forEach((doc) => {
          try {
            const data = doc.data();
            
            // Extract productTypes from raw data
            const productTypesValue = getFirestoreValue(data, "productTypes");
            if (productTypesValue) {
              if (Array.isArray(productTypesValue)) {
                productTypesValue.forEach((type: any) => {
                  if (type && typeof type === 'string') {
                    productTypesSet.add(type.trim());
                  }
                });
              } else if (typeof productTypesValue === 'string') {
                productTypesSet.add(productTypesValue.trim());
              }
            }
            
            const product = firestoreDocToProduct(doc.id, data);
            products.push(product);
          } catch (err) {
            // Error processing product, skip it
          }
        });
        
        return products;
      } catch (fallbackError) {
        return [];
      }
    }
    
    return [];
  }
}

/**
 * Fetch a single product by ID from Firestore
 * Can search by firestoreId (document ID) or numeric id field
 */
export async function getProductById(productId: string | number): Promise<Product | null> {
  if (!db) {
    return null;
  }

  try {
    // First try to get by document ID (firestoreId)
    const productRef = doc(db, "products", String(productId));
    const productSnap = await getDoc(productRef);

    if (productSnap.exists()) {
      return firestoreDocToProduct(productSnap.id, productSnap.data());
    }

    // If not found by document ID, try to find by numeric id field
    const productsRef = collection(db, "products");
    const q = query(productsRef, where("id", "==", typeof productId === "number" ? productId : parseInt(String(productId), 10)));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return firestoreDocToProduct(doc.id, doc.data());
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Fetch products by category from Firestore
 */
export async function getProductsByCategory(category: Product["category"]): Promise<Product[]> {
  if (!db) {
    return [];
  }

  try {
    const productsRef = collection(db, "products");
    const q = query(productsRef, where("category", "==", category));
    const snapshot = await getDocs(q);
    
    const products: Product[] = [];
    snapshot.forEach((doc) => {
      const product = firestoreDocToProduct(doc.id, doc.data());
      products.push(product);
    });

    return products;
  } catch (error) {
    return [];
  }
}

/**
 * Main Category type from Firestore
 */
export type MainCategory = {
  id: string;
  name: string; // Mongolian category name (used for filtering)
  label?: string; // Display label in Mongolian (optional, falls back to name)
  slug?: string; // Optional slug (auto-generated from name if not provided)
  order?: number;
  icon?: string; // Icon name or identifier
  children?: string[]; // Array of category names (children of this main category)
  subchildren?: Record<string, string[]>; // Object where keys are category names, values are arrays of subcategory names
};

/**
 * Subcategory type from Firestore
 */
export type Subcategory = {
  id: string;
  name: string;
  category: Product["category"];
  order?: number;
};

/**
 * Fetch main categories from Firestore
 * Expected collection structure: "main_categories" or "categories"
 * Each document should have: { name: string, label: string, mainCategory: string, order?: number }
 * The mainCategory field should be: "ppe", "rescue", "workplace", or "other"
 */
export async function getMainCategories(): Promise<MainCategory[]> {
  if (!db) {
    return [];
  }

  try {
    const categoriesRef = collection(db, "main_categories");
    
    // Fetch ALL documents from main_categories collection
    const snapshot = await getDocs(categoriesRef);

    const categories: MainCategory[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Use name field directly (Mongolian text from Firebase)
      if (data.name) {
        categories.push({
          id: doc.id,
          name: data.name || "",
          label: data.label || data.name || "",
          slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-') || "",
          order: data.order || 0,
          icon: data.icon || "",
          children: Array.isArray(data.children) ? data.children : undefined,
          subchildren: data.subchildren && typeof data.subchildren === 'object' ? data.subchildren : undefined,
        });
      }
    });

    // Sort by order
    categories.sort((a, b) => (a.order || 0) - (b.order || 0));

    return categories;
  } catch (error) {
    return [];
  }
}

/**
 * Fetch subcategories from Firestore
 * Expected collection structure: "subcategories" or "categories"
 * Each document should have: { name: string, category: string, order?: number }
 */
export async function getSubcategories(category?: Product["category"]): Promise<Subcategory[]> {
  if (!db) {
    return [];
  }

  try {
    // Try "subcategories" collection first, fallback to "categories"
    let subcategoriesRef = collection(db, "subcategories");
    let snapshot;
    
    if (category) {
      const q = query(subcategoriesRef, where("category", "==", category), orderBy("order", "asc"));
      snapshot = await getDocs(q);
    } else {
      const q = query(subcategoriesRef, orderBy("order", "asc"));
      snapshot = await getDocs(q);
    }

    const subcategories: Subcategory[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      subcategories.push({
        id: doc.id,
        name: data.name || "",
        category: (data.category || "other") as Product["category"],
        order: data.order || 0,
      });
    });

    // If no results from "subcategories", try "categories" collection
    if (subcategories.length === 0) {
      subcategoriesRef = collection(db, "categories");
      if (category) {
        const q = query(subcategoriesRef, where("category", "==", category), orderBy("order", "asc"));
        snapshot = await getDocs(q);
      } else {
        const q = query(subcategoriesRef, orderBy("order", "asc"));
        snapshot = await getDocs(q);
      }

      snapshot.forEach((doc) => {
        const data = doc.data();
        subcategories.push({
          id: doc.id,
          name: data.name || "",
          category: (data.category || "other") as Product["category"],
          order: data.order || 0,
        });
      });
    }

    return subcategories.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    // If collection doesn't exist, return empty array (will fallback to extracting from products)
    return [];
  }
}

/**
 * Sector type from Firestore
 */
export type Sector = {
  id: string;
  name: string;
  slug?: string;
  order?: number;
  icon?: string;
  imageUrl?: string;
};

/**
 * Fetch sectors from Firestore
 * Expected collection structure: "product_sectors"
 * Each document should have: { name: string, slug?: string, order?: number, icon?: string }
 */
export async function getSectors(): Promise<Sector[]> {
  if (!db) {
    return [];
  }

  try {
    const sectorsRef = collection(db, "product_sectors");
    let snapshot;
    
    try {
      const q = query(sectorsRef, orderBy("order", "asc"));
      snapshot = await getDocs(q);
    } catch (error) {
      // If order field doesn't exist, fetch without ordering
      snapshot = await getDocs(sectorsRef);
    }

    const sectors: Sector[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      sectors.push({
        id: doc.id,
        name: data.name || "",
        slug: data.slug || data.name?.toLowerCase().replace(/\s+/g, '-') || "",
        order: data.order || 0,
        icon: data.icon || "",
        imageUrl: data.imageUrl || data.image || data.img || "",
      });
    });

    // Sort by order
    sectors.sort((a, b) => (a.order || 0) - (b.order || 0));

    return sectors;
  } catch (error) {
    // If collection doesn't exist, return empty array
    return [];
  }
}

/**
 * Category type from Firestore (middle level - categories collection)
 */
export type Category = {
  id: string;
  name: string;
  mainCategoryId?: string; // Reference to main category document ID
  mainCategory?: string; // Legacy: Reference to main category name or slug
  order?: number;
  slug?: string;
  children?: string[]; // Array of subcategory names (children of this category)
};

/**
 * Sub-subcategory type (leaf level - subcategories collection)
 */
export type SubSubcategory = {
  id: string;
  name: string;
  categoryId?: string; // Reference to category document ID
  category?: string; // Legacy: Reference to category name or id
  mainCategoryId?: string; // Reference to main category document ID (optional, for direct lookup)
  order?: number;
  slug?: string;
};

/**
 * Fetch categories from Firestore (middle level)
 * Expected collection structure: "categories"
 * Each document should have: { name: string, mainCategory: string, order?: number, slug?: string }
 */
export async function getCategories(mainCategory?: string): Promise<Category[]> {
  if (!db) {
    return [];
  }

    try {
      const categoriesRef = collection(db, "categories");
      let snapshot;
      
      // First, try to get ALL documents without any filters to test connection
      try {
        snapshot = await getDocs(categoriesRef);
      } catch (testError) {
        return [];
      }
      
      // Now apply filters if needed
      if (mainCategory && snapshot.size > 0) {
        // Filter by mainCategoryId or mainCategory
        try {
          const q = query(categoriesRef, where("mainCategoryId", "==", mainCategory));
          snapshot = await getDocs(q);
        } catch (err) {
          try {
            const q = query(categoriesRef, where("mainCategory", "==", mainCategory));
            snapshot = await getDocs(q);
          } catch (err2) {
            // Could not filter, using all documents
          }
        }
      }
      
      // Now try to order if we have results
      if (snapshot.size > 0) {
        try {
          const q = query(categoriesRef, ...(mainCategory ? [where("mainCategoryId", "==", mainCategory)] : []), orderBy("order", "asc"));
          snapshot = await getDocs(q);
        } catch (orderError) {
          // Re-fetch without order but with filter if needed
          if (mainCategory) {
            try {
              const q = query(categoriesRef, where("mainCategoryId", "==", mainCategory));
              snapshot = await getDocs(q);
            } catch (err) {
              const q = query(categoriesRef, where("mainCategory", "==", mainCategory));
              snapshot = await getDocs(q);
            }
          } else {
            snapshot = await getDocs(categoriesRef);
          }
        }
      }

    const categories: Category[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const children = Array.isArray(data.children) ? data.children : undefined;
      categories.push({
        id: doc.id,
        name: data.name || "",
        mainCategoryId: data.mainCategoryId || undefined,
        mainCategory: data.mainCategory || data.mainCategoryId || "", // Support both field names
        order: data.order || 0,
        slug: data.slug || data.name?.toLowerCase().replace(/\s+/g, '-') || "",
        children: children,
      });
    });

    // Sort by order
    categories.sort((a, b) => (a.order || 0) - (b.order || 0));

    return categories;
  } catch (error) {
    return [];
  }
}

/**
 * Fetch sub-subcategories from Firestore (leaf level)
 * Expected collection structure: "subcategories"
 * Each document should have: { name: string, category: string, order?: number, slug?: string }
 */
export async function getSubSubcategories(categoryId?: string): Promise<SubSubcategory[]> {
  if (!db) {
    return [];
  }

    try {
      const subcategoriesRef = collection(db, "subcategories");
      let snapshot;
      
      // First, try to get ALL documents without any filters to test connection
      try {
        snapshot = await getDocs(subcategoriesRef);
      } catch (testError) {
        return [];
      }
      
      // Now apply filters if needed
      if (categoryId && snapshot.size > 0) {
        // Filter by categoryId or category
        try {
          const q = query(subcategoriesRef, where("categoryId", "==", categoryId));
          snapshot = await getDocs(q);
        } catch (err) {
          try {
            const q = query(subcategoriesRef, where("category", "==", categoryId));
            snapshot = await getDocs(q);
          } catch (err2) {
            // Could not filter, using all documents
          }
        }
      }
      
      // Now try to order if we have results
      if (snapshot.size > 0) {
        try {
          const q = query(subcategoriesRef, ...(categoryId ? [where("categoryId", "==", categoryId)] : []), orderBy("order", "asc"));
          snapshot = await getDocs(q);
        } catch (orderError) {
          // Re-fetch without order but with filter if needed
          if (categoryId) {
            try {
              const q = query(subcategoriesRef, where("categoryId", "==", categoryId));
              snapshot = await getDocs(q);
            } catch (err) {
              const q = query(subcategoriesRef, where("category", "==", categoryId));
              snapshot = await getDocs(q);
            }
          } else {
            snapshot = await getDocs(subcategoriesRef);
          }
        }
      }

    const subcategories: SubSubcategory[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      subcategories.push({
        id: doc.id,
        name: data.name || "",
        categoryId: data.categoryId || undefined,
        category: data.category || data.categoryId || "", // Support both field names
        mainCategoryId: data.mainCategoryId || undefined,
        order: data.order || 0,
        slug: data.slug || data.name?.toLowerCase().replace(/\s+/g, '-') || "",
      });
    });

    // Sort by order
    subcategories.sort((a, b) => (a.order || 0) - (b.order || 0));

    return subcategories;
  } catch (error) {
    return [];
  }
}

/**
 * Category tree node for SearchBar dropdown
 */
export type CategoryTreeNode = {
  name: string;
  slug: string;
  icon?: string;
  children?: CategoryTreeNode[];
};

/**
 * Build hierarchical category tree from Firestore collections
 * Structure: main_categories -> categories -> subcategories
 */
export async function getCategoryTree(): Promise<CategoryTreeNode[]> {
  try {
    // Fetch only from main_categories collection (everything is there now)
    const mainCategories = await getMainCategories();

    // If no main categories, return empty tree
    if (mainCategories.length === 0) {
      return [];
    }

    // Sort main categories: "Бусад" should always be at the bottom
    const sortedMainCategories = [...mainCategories].sort((a, b) => {
      const aIsBuсад = a.name === "Бусад";
      const bIsBuсад = b.name === "Бусад";
      
      if (aIsBuсад && !bIsBuсад) return 1; // "Бусад" goes to bottom
      if (!aIsBuсад && bIsBuсад) return -1; // Other categories go above "Бусад"
      
      // For other categories, sort by order or name
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      return a.name.localeCompare(b.name, 'mn', { sensitivity: 'base' });
    });

    // Build the tree
    const tree: CategoryTreeNode[] = [];

    for (const mainCat of sortedMainCategories) {

      
      const categoryChildren: CategoryTreeNode[] = [];

      // Use children field directly from main category document
      if (mainCat.children && mainCat.children.length > 0) {

        
        // Use children names directly - just convert them to CategoryTreeNode format
        for (const childName of mainCat.children) {
          const subcategoryChildren: CategoryTreeNode[] = [];
          
          // Get subcategories from subchildren field (object where key is category name)
          if (mainCat.subchildren && mainCat.subchildren[childName] && Array.isArray(mainCat.subchildren[childName])) {
            const subcats = mainCat.subchildren[childName];
            
            // Use subchildren array directly - just convert to CategoryTreeNode format
            for (const subChildName of subcats) {
              subcategoryChildren.push({
                name: subChildName,
                slug: subChildName.toLowerCase().replace(/\s+/g, '-'),
              });
            }
          }
          
          categoryChildren.push({
            name: childName,
            slug: childName.toLowerCase().replace(/\s+/g, '-'),
            children: subcategoryChildren.length > 0 ? subcategoryChildren : [],
          });
        }
      }

      // Add main category
      tree.push({
        name: mainCat.name,
        slug: mainCat.slug || mainCat.name.toLowerCase().replace(/\s+/g, '-'),
        icon: mainCat.icon,
        children: categoryChildren.length > 0 ? categoryChildren : [],
      });
    }

    return tree;
  } catch (error) {
    return [];
  }
}
