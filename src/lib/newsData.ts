import { db } from "./firebase";
import { collection, getDocs, doc, getDoc, query, orderBy } from "firebase/firestore";

export type NewsPost = {
  id: string;
  title: string;
  date: string;
  category: string;
  img: string;
  description?: string;
  content?: string;
  author?: string;
};

/**
 * Fetch all news from Firestore
 */
export async function getAllNews(): Promise<NewsPost[]> {
  if (!db) {
    return [];
  }

  try {
    const newsRef = collection(db, "news");
    let snapshot;
    
    try {
      // Try to order by createdAt descending (newest first)
      const q = query(newsRef, orderBy("createdAt", "desc"));
      snapshot = await getDocs(q);
    } catch (error) {
      // If createdAt field doesn't exist or ordering fails, fetch without order
      snapshot = await getDocs(newsRef);
    }

    const news: NewsPost[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      
      // Extract date from createdAt timestamp
      let dateStr = "";
      if (data.createdAt) {
        const date = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
        dateStr = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      }
      
      // Extract description from body (first 150 characters)
      const description = data.body 
        ? (data.body.length > 150 ? data.body.substring(0, 150) + "..." : data.body)
        : undefined;

      news.push({
        id: doc.id,
        title: data.title || "",
        date: dateStr,
        category: data.category || "",
        img: data.coverImageUrl || "",
        description: description,
        content: data.body || "",
        author: data.author || undefined,
      });
    });

    // Sort by date descending if not already sorted
    if (!snapshot.empty) {
      news.sort((a, b) => {
        if (!a.date || !b.date) return 0;
        return b.date.localeCompare(a.date);
      });
    }

    return news;
  } catch (error) {
    return [];
  }
}

/**
 * Get a news post by ID from Firestore
 */
export async function getNewsById(id: string): Promise<NewsPost | undefined> {
  if (!db) {
    return undefined;
  }

  try {
    const newsDoc = await getDoc(doc(db, "news", id));
    if (!newsDoc.exists()) {
      return undefined;
    }

    const data = newsDoc.data();
    
    // Extract date from createdAt timestamp
    let dateStr = "";
    if (data.createdAt) {
      const date = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
      dateStr = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    }
    
    // Extract description from body (first 150 characters)
    const description = data.body 
      ? (data.body.length > 150 ? data.body.substring(0, 150) + "..." : data.body)
      : undefined;

    return {
      id: newsDoc.id,
      title: data.title || "",
      date: dateStr,
      category: data.category || "",
      img: data.coverImageUrl || "",
      description: description,
      content: data.body || "",
      author: data.author || undefined,
    };
  } catch (error) {
    return undefined;
  }
}
