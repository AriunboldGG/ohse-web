import type { Metadata } from "next";
import Header from "@/components/Header";
import ContactInfoSection from "@/components/ContactInfoSection";
import ContactMapSection from "@/components/ContactMapSection";

export const metadata: Metadata = {
  title: "Холбоо барих",
  description: "БАЯН ӨНДӨР компанитай холбогдох. Утас: 70118585, Имэйл: info@bayan-undur.mn. ХАБЭА хамгаалах хувцас хэрэгсэл, аврах багаж хэрэгсэл захиалга.",
  openGraph: {
    title: "Холбоо барих | БАЯН ӨНДӨР",
    description: "БАЯН ӨНДӨР компанитай холбогдох",
    url: "/contact",
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-4 py-12 md:py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">ХОЛБОО БАРИХ</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Contact Information */}
          <ContactInfoSection />
          <ContactMapSection />
        </div>
      </div>
    </main>
  );
}

