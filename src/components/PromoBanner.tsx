import { Button } from "@/components/ui/button";
import { FaGift } from "react-icons/fa";

export default function PromoBanner() {
  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-[#1fb6a6] via-[#27c3a7] to-[#1fb6a6] px-5 py-4 md:px-8 md:py-6 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div className="text-white">
            <div className="text-xs opacity-90"> Багц захиалга</div>
            <div className="mt-1 text-lg md:text-xl font-bold">
              Урамшуулал
            </div>
            <div className="mt-1 text-sm opacity-90">
              Тун удахгүй...
            </div>
          </div>
          <Button size="sm" className="relative z-10 bg-white text-emerald-700 hover:bg-emerald-50 cursor-pointer">
            Хүсэлт илгээх
          </Button>
        </div>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
            <FaGift className="h-6 w-6 text-white" />
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
            <FaGift className="h-7 w-7 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}


