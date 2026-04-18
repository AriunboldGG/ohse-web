"use client";
import Header from "@/components/Header";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getNewsById, type NewsPost } from "@/lib/newsData";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const newsId = typeof params.id === 'string' ? params.id : '';
  const [news, setNews] = useState<NewsPost | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      if (!newsId) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const newsData = await getNewsById(newsId);
        setNews(newsData);
      } catch (error) {
        setNews(undefined);
      } finally {
        setIsLoading(false);
      }
    }

    fetchNews();
  }, [newsId]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-8">
            <div className="text-gray-500">Ачаалж байна...</div>
          </div>
        </div>
      </main>
    );
  }

  if (!news) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Мэдээ олдсонгүй</h1>
            <Link href="/news" className="text-[#8DC63F] hover:underline inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Мэдээний жагсаалт руу буцах
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-gray-700 hover:text-[#8DC63F]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Буцах
        </Button>

        <article className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-6">
            <div className="text-sm text-gray-500 mb-2">
              {news.date} • {news.category}
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {news.title}
            </h1>
           
          </header>

          {/* Featured Image */}
          {news.img && news.img.trim() !== '' && (
            <div className="relative w-full h-64 md:h-96 mb-8 rounded-lg overflow-hidden bg-gray-100">
              <Image
                src={news.img}
                alt={news.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1024px"
              />
            </div>
          )}

          {/* Description */}
          {news.description && (
            <div className="mb-6 text-lg text-gray-700 font-medium leading-relaxed">
              {news.description}
            </div>
          )}

          {/* Content */}
          {news.content && (
            <div className="mb-8">
              <div 
                className="text-gray-700 leading-relaxed whitespace-pre-wrap"
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {news.content}
              </div>
            </div>
          )}

          {!news.content && !news.description && (
            <div className="text-gray-500 italic mb-8">
              Контент оруулаагүй байна.
            </div>
          )}

        </article>
      </div>
    </main>
  );
}
