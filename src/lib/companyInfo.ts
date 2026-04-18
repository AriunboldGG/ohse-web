import { collection, getDocs, limit, query } from "firebase/firestore";
import { db } from "./firebase";

export type CompanyInfo = {
  email: string;
  phone: string;
  mobilePhone: string;
  facebookUrl: string;
  wechatUrl: string;
  whatsappUrl: string;
  address: string;
  mapEmbedUrl: string;
  aboutDescription: string;
  aboutImageUrl: string;
  partnersImages: string[];
  riimImages: string[];
};

export const defaultCompanyInfo: CompanyInfo = {
  email: "",
  phone: "",
  mobilePhone: "",
  facebookUrl: "",
  wechatUrl: "",
  whatsappUrl: "",
  address: "",
  mapEmbedUrl: "",
  aboutDescription: "",
  aboutImageUrl: "",
  partnersImages: [],
  riimImages: [],
};

function readStringField(data: Record<string, any>, keys: string[]): string {
  for (const key of keys) {
    const value = data?.[key];
    if (typeof value === "string") {
      return value;
    }
    if (typeof value === "number") {
      return String(value);
    }
    if (value && typeof value === "object" && typeof value.stringValue === "string") {
      return value.stringValue;
    }
    if (value && typeof value === "object" && typeof value.numberValue !== "undefined") {
      return String(value.numberValue);
    }
  }
  return "";
}

function readStringArrayField(data: Record<string, any>, keys: string[]): string[] {
  for (const key of keys) {
    const value = data?.[key];
    if (Array.isArray(value)) {
      return value.map((item) => String(item).trim()).filter(Boolean);
    }
    if (value && typeof value === "object" && Array.isArray(value.arrayValue?.values)) {
      const values = value.arrayValue.values
        .map((item: any) => item?.stringValue ?? item?.mapValue ?? item?.numberValue ?? "")
        .map((item: any) => String(item).trim())
        .filter(Boolean);
      return values;
    }
    if (typeof value === "string") {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }
  return [];
}

function normalizeFacebookUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("www.")) {
    return `https://${trimmed}`;
  }
  if (trimmed.includes("facebook.com") || trimmed.includes("fb.com")) {
    return `https://${trimmed}`;
  }
  return `https://facebook.com/${trimmed.replace(/^@/, "")}`;
}

function normalizeWhatsAppUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("wa.me/") || trimmed.startsWith("www.wa.me/")) {
    return `https://${trimmed.replace(/^www\./, "")}`;
  }
  const digitsOnly = trimmed.replace(/[^\d]/g, "");
  if (digitsOnly) {
    return `https://wa.me/${digitsOnly}`;
  }
  return trimmed;
}

function normalizeWeChatUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("www.")) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

export async function getCompanyInfo(): Promise<CompanyInfo> {
  if (!db) {
    return defaultCompanyInfo;
  }

  try {
    const companyRef = collection(db, "companyInfo");
    const snapshot = await getDocs(query(companyRef, limit(1)));

    if (snapshot.empty) {
      return defaultCompanyInfo;
    }

    const data = snapshot.docs[0].data() || {};

    return {
      email:
        readStringField(data, ["email"]) ||
        defaultCompanyInfo.email,
      phone:
        readStringField(data, ["company_phone"]) ||
        defaultCompanyInfo.phone,
      mobilePhone:
        readStringField(data, ["mobile_phone"]) ||
        defaultCompanyInfo.mobilePhone,
      facebookUrl:
        normalizeFacebookUrl(
          readStringField(data, [
            "fb",
          ])
        ) ||
        defaultCompanyInfo.facebookUrl,
      wechatUrl:
        normalizeWeChatUrl(
          readStringField(data, [
            "wechat",
          ])
        ) ||
        defaultCompanyInfo.wechatUrl,
      whatsappUrl:
        normalizeWhatsAppUrl(
          readStringField(data, [
            "whatsup",
          ])
        ) ||
        defaultCompanyInfo.whatsappUrl,
      address:
        readStringField(data, ["address"]) ||
        defaultCompanyInfo.address,
      mapEmbedUrl:
        readStringField(data, ["mapEmbedUrl", "mapUrl", "mapEmbed"]) ||
        defaultCompanyInfo.mapEmbedUrl,
      aboutDescription:
        readStringField(data, [
          "aboutDescription",
          "about_description",
          "description",
          "companyDescription",
          "company_description",
        ]) || defaultCompanyInfo.aboutDescription,
      aboutImageUrl:
        readStringField(data, [
          "aboutImageUrl",
          "about_image",
          "aboutImage",
          "image",
          "imageUrl",
          "companyImage",
          "company_image",
          "company_image_url",
        ]) || defaultCompanyInfo.aboutImageUrl,
      partnersImages:
        readStringArrayField(data, ["partners_images", "partnersImages", "partners"]) ||
        defaultCompanyInfo.partnersImages,
      riimImages:
        readStringArrayField(data, ["riim_images", "riimImages", "riim"]) ||
        defaultCompanyInfo.riimImages,
    };
  } catch {
    return defaultCompanyInfo;
  }
}
