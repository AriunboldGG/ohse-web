import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { StockProvider } from "@/context/StockContext";
import Footer from "@/components/Footer";
import FacebookMessenger from "@/components/FacebookMessenger";
import OrganizationSchema from "@/components/OrganizationSchema";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "OHSE - Хамгаалах хувцас хэрэгсэл, багаж хэрэгсэл",
    template: "%s | OHSE",
  },
  description: "ХАБЭА хамгаалах хувцас хэрэгсэл, аврах багаж хэрэгсэл, ажлын байрны тохилог орчны бүтээгдэхүүнийг чанартай, найдвартай байдлаар нийлүүлнэ.",
  icons: {
    icon: "/svg/main-logo.svg",
    shortcut: "/svg/main-logo.svg",
    apple: "/svg/main-logo.svg",
  },
  keywords: [
    "ХАБЭА",
    "хамгаалах хувцас хэрэгсэл",
    "PPE",
    "аврах багаж хэрэгсэл",
    "ажлын байрны тохилог орчин",
    "аюулгүй байдал",
    "OHSE",
  ],
  authors: [{ name: "OHSE" }],
  creator: "OHSE",
  publisher: "OHSE",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://ohse.mn"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "mn_MN",
    url: "/",
    siteName: "OHSE",
    title: "OHSE - Хамгаалах хувцас хэрэгсэл, багаж хэрэгсэл",
    description: "ХАБЭА хамгаалах хувцас хэрэгсэл, аврах багаж хэрэгсэл, ажлын байрны тохилог орчны бүтээгдэхүнийг чанартай, найдвартай байдлаар нийлүүлнэ.",
  },
  twitter: {
    card: "summary_large_image",
    title: "OHSE - Хамгаалах хувцас хэрэгсэл",
    description: "ХАБЭА хамгаалах хувцас хэрэгсэл, аврах багаж хэрэгсэл нийлүүлнэ",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <OrganizationSchema />
        <CartProvider>
          <StockProvider>
            {children}
          </StockProvider>
        </CartProvider>
        <Footer />
        {/* <FacebookMessenger /> */}
      </body>
    </html>
  );
}
