import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { FolderOpen, Image, FileText, Film, Plus, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import CircularGallery from "@/components/CircularGallery";


interface LibraryItem {
  id: string;
  type: "image" | "document" | "video";
  name: string;
  date: string;
  thumbnail?: string;
}

const mockItems: LibraryItem[] = [
  { id: "1", type: "image", name: "첫 번째 기억", date: "2024.12.20" },
  { id: "2", type: "document", name: "2024년 일기", date: "2024.12.21" },
  { id: "3", type: "image", name: "소중한 순간", date: "2024.12.22" },
  { id: "4", type: "video", name: "특별한 날", date: "2024.12.22" },
];

const getIcon = (type: LibraryItem["type"]) => {
  switch (type) {
    case "image":
      return Image;
    case "document":
      return FileText;
    case "video":
      return Film;
  }
};

const LibraryPage = () => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  return (
    <MainLayout>
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <header className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
              <FolderOpen className="w-8 h-8 text-gold" />
            </div>
            <h1 className="font-serif text-3xl text-primary mb-2 gold-accent">
              라이브러리
            </h1>
            <p className="font-handwriting text-xl text-muted-foreground">
              사진, 영상, 문서를 보관하세요
            </p>
          </header>

          <div className="w-full h-[450px] my-8 relative rounded-2xl bg-black/5 overflow-hidden border border-[#D9C5B2]/20 shadow-inner">
            <CircularGallery key="main-gallery" bend={3} textColor="#8C7365" borderRadius={0.05} />
          </div>

          {/* Upload button */}
          <div className="flex justify-end mb-8">
            <button className="vintage-btn px-5 py-3 rounded-md flex items-center gap-2 font-serif text-sepia hover:text-gold transition-colors">
              <Plus className="w-4 h-4" />
              <span>파일 추가</span>
            </button>
          </div>

          {/* Grid of items */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mockItems.map((item, index) => {
              const Icon = getIcon(item.type);
              
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item.id)}
                  className={cn(
                    "group relative paper-texture rounded-lg overflow-hidden transition-all duration-300 animate-fade-in",
                    selectedItem === item.id
                      ? "ring-2 ring-gold shadow-book"
                      : "shadow-page hover:shadow-soft hover:-translate-y-1"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Thumbnail area */}
                  <div className="aspect-square bg-secondary/30 flex items-center justify-center relative">
                    {/* Vintage photo frame effect */}
                    <div className="absolute inset-2 border border-ink/10 rounded" />
                    
                    <Icon className="w-12 h-12 text-ink/30 group-hover:text-gold transition-colors" />

                    {/* Menu button */}
                    <button
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Menu logic here
                      }}
                    >
                      <MoreVertical className="w-4 h-4 text-ink/60" />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-3 border-t border-ink/10">
                    <h3 className="font-serif text-sm text-ink truncate mb-1">
                      {item.name}
                    </h3>
                    <p className="font-serif text-xs text-ink/50">
                      {item.date}
                    </p>
                  </div>

                  {/* Type indicator ribbon */}
                  <div className="absolute top-2 left-2">
                    <div className="bookmark w-6 h-8 rounded-b flex items-center justify-center">
                      <Icon className="w-3 h-3 text-sepia/80" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Empty state */}
          {mockItems.length === 0 && (
            <div className="text-center py-20 paper-texture rounded-lg">
              <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="font-handwriting text-xl text-muted-foreground">
                보관함이 비어있습니다
              </p>
              <p className="font-serif text-sm text-muted-foreground mt-2">
                사진이나 문서를 추가해보세요
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default LibraryPage;
