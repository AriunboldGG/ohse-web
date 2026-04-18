import type { Metadata } from "next";
import Header from "@/components/Header";
import AboutContent from "@/components/AboutContent";

export const metadata: Metadata = {
  title: "Бидний тухай",
  description: "OHSE компанийн тухай мэдээлэл. ХАБЭА хамгаалах хувцас хэрэгсэл, аврах багаж хэрэгсэл нийлүүлэгч.",
  openGraph: {
    title: "Бидний тухай | OHSE",
    description: "OHSE компанийн тухай мэдээлэл",
    url: "/about",
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <AboutContent />
    </main>
  );
}

