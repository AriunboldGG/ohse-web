 "use client";

import { Button } from "@/components/ui/button";
import { CartItem, useCart } from "@/context/CartContext";
import { useState } from "react";
import { saveQuoteToFirestore } from "@/lib/quotes";
import { CheckCircle } from "lucide-react";

type QuoteModalProps = {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
};

export function QuoteModal({ open, onClose, items }: QuoteModalProps) {
  const { clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);

    const firstName = (formData.get("firstName") as string) ?? "";
    const lastName = (formData.get("lastName") as string) ?? "";
    const email = (formData.get("email") as string) ?? "";
    const phone = (formData.get("phone") as string) ?? "";
    const note = (formData.get("note") as string) ?? "";
    const company = (formData.get("company") as string) ?? "";

    try {
      // Ensure items is an array and create a copy
      const itemsToSave = Array.isArray(items) ? [...items] : [];
      
      if (itemsToSave.length === 0) {
        setError("Сагсанд бүтээгдэхүүн байхгүй байна.");
        setSubmitting(false);
        return;
      }

      // Save to Firestore
      await saveQuoteToFirestore({
        firstName,
        lastName,
        email,
        phone,
        note,
        company,
        items: itemsToSave,
      });

      setSuccess(true);
      // Clear cart after successful submission
      clear();
      
      // Close modal after 3 seconds
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setSubmitting(false);
    }
  }

  // Show success modal
  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 sm:px-4">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-4 sm:p-6 md:p-8 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Амжилттай!</h2>
          <p className="text-sm text-gray-600 mb-6">
            Үнийн санал амжилттай илгээгдлээ. Бид удахгүй тань руу холбогдох болно.
          </p>
          <Button
            onClick={() => {
              onClose();
              setSuccess(false);
            }}
            className="w-full bg-[#8DC63F] hover:bg-[#7AB82E] text-white cursor-pointer"
          >
            Хаах
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 sm:px-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl my-4 sm:my-8">
        <div className="border-b px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Үнийн санал авах</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
          >
            <span className="sr-only">Хаах</span>
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-4 sm:py-5 space-y-3 sm:space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Компаний нэр <span className="text-red-500">*</span>
              </label>
              <input
                required
                name="company"
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8DC63F]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Холбоо барих ажилтны овог <span className="text-red-500">*</span>
              </label>
              <input
                required
                name="lastName"
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8DC63F]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Холбоо барих ажилтны нэр <span className="text-red-500">*</span>
              </label>
              <input
                required
                name="firstName"
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8DC63F]"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Үнийн санал хүлээн авах и-мэйл хаяг <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                name="email"
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8DC63F]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Утас <span className="text-red-500">*</span>
              </label>
              <input
                required
                name="phone"
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8DC63F]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Нэмэлт мэдээлэл
              </label>
              <textarea
                rows={3}
                name="note"
                className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8DC63F] resize-none"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              className="text-sm cursor-pointer"
              onClick={onClose}
              disabled={submitting}
            >
              Болих
            </Button>
            <Button
              type="submit"
              className="bg-[#8DC63F] hover:bg-[#7AB82E] text-sm cursor-pointer"
              disabled={submitting}
            >
              {submitting ? "Илгээж байна..." : "Илгээх"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


