import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const items = [
  {
    id: "s1",
    title: "Өвлийн бээлий",
    desc: "Мэдээлэл",
    img: "/images/prod1.jpg",
  },
  {
    id: "s2",
    title: "Амь олс",
    desc: "Дэлгэрэнгүй тайлбар",
    img: "/images/prod2.jpg",
  },
  {
    id: "s3",
    title: "Хамгаалалтын нүдний шил",
    desc: "Дэлгэрэнгүй тайлбар",
    img: "/images/prod3.jpg",
  },
  {
    id: "s4",
    title: "Өндрийн олс",
    desc: "Дэлгэрэнгүй тайлбар",
    img: "/images/prod4.jpg",
  },
];

export default function Suggestions() {
  return (
    <div className="rounded-xl border border-gray-200 shadow-sm p-4 md:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-semibold text-[#1E293B]">
          ТАНЬД САНАЛ БОЛГОХ
        </div>
        <Link
          href="/suggestions"
          className="text-xs text-gray-500 hover:text-[#8DC63F]"
        >
          Бүгдийг Харах
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((it) => (
          <Card key={it.id} className="overflow-hidden">
            <CardContent className="p-3">
              <div className="relative h-36 w-full rounded-md overflow-hidden lg:h-[230px] lg:w-[302px] mx-auto">
                {it.img && it.img.trim() !== "" ? (
                  <Image
                    src={it.img}
                    alt={it.title}
                    fill
                    className="object-contain bg-white"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">Зураг байхгүй</span>
                  </div>
                )}
              </div>
              <div className="mt-3 text-sm font-medium text-gray-800 line-clamp-2">
                {it.title}
              </div>
              <div className="mt-1 text-xs text-gray-500 line-clamp-2">
                {it.desc}
              </div>
              <Button variant="outline" size="sm" className="mt-3">
                ДЭЛГЭРЭНГҮЙ
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


