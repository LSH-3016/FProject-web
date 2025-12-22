import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BookOpen, History, Library, User, Settings, LogIn, X, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const menuItems: MenuItem[] = [
  { id: "main", label: "메인 페이지", icon: Home, path: "/" },
  { id: "main", label: "메인 기록실", icon: Home, path: "/journal" },
  { id: "auth", label: "로그인 / 회원가입", icon: LogIn, path: "/auth" },
  { id: "history", label: "히스토리", icon: History, path: "/history" },
  { id: "library", label: "라이브러리", icon: Library, path: "/library" },
  { id: "mypage", label: "마이페이지", icon: User, path: "/mypage" },
  { id: "settings", label: "설정", icon: Settings, path: "/settings" },
];

interface LibrarySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LibrarySidebar({ isOpen, onClose }: LibrarySidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-72 z-50 transition-transform duration-500 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Wood texture background */}
        <div className="absolute inset-0 wood-texture" />
        
        {/* Bookshelf edge */}
        <div className="absolute right-0 top-0 h-full w-3 bg-gradient-to-r from-transparent to-background/50" />

        {/* Content */}
        <div className="relative h-full flex flex-col py-8 px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 px-2">
            <h2 className="font-serif text-lg text-gold gold-accent">책장</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-secondary/50 transition-colors"
            >
              <X className="w-5 h-5 text-sepia" />
            </button>
          </div>

          {/* Menu Items as Book Spines */}
          <nav className="flex-1 space-y-3">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const isHovered = hoveredItem === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.path)}
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={cn(
                    "w-full group relative transition-all duration-300",
                    isHovered && "translate-x-2"
                  )}
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  {/* Book Spine */}
                  <div
                    className={cn(
                      "relative flex items-center gap-3 px-4 py-4 rounded-r-sm transition-all duration-300",
                      "book-cover border-l-4",
                      isActive
                        ? "border-l-gold bg-leather"
                        : "border-l-bookmark hover:border-l-gold"
                    )}
                  >
                    {/* Gold foil effect on spine */}
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-0.5 h-2/3 bg-gradient-to-b from-gold/40 via-gold/80 to-gold/40 rounded-full" />
                    
                    <Icon
                      className={cn(
                        "w-5 h-5 transition-colors duration-300 ml-2",
                        isActive ? "text-gold" : "text-sepia group-hover:text-gold"
                      )}
                    />
                    <span
                      className={cn(
                        "font-serif text-sm transition-colors duration-300",
                        isActive ? "text-gold" : "text-sepia group-hover:text-primary"
                      )}
                    >
                      {item.label}
                    </span>

                    {/* Shine effect on hover */}
                    <div
                      className={cn(
                        "absolute inset-0 bg-gradient-to-r from-transparent via-gold/10 to-transparent transition-opacity duration-500",
                        isHovered ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Footer decoration */}
          <div className="mt-auto pt-6 border-t border-border/30">
            <p className="font-handwriting text-center text-muted-foreground text-sm">
              과거의 나를 기록하는 공간
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
