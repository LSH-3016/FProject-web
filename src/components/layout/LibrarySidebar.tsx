import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BookOpen, History, Library, User, Settings, LogIn, X, Home, BookMarked } from "lucide-react";
import { cn } from "@/lib/utils";

// 1. 메뉴 데이터
interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const topMenuItems: MenuItem[] = [
  { id: "main", label: "메인 페이지", icon: Home, path: "/" },
  { id: "journal", label: "기록실", icon: BookOpen, path: "/journal" },
  { id: "history", label: "히스토리", icon: History, path: "/history" },
  { id: "library", label: "라이브러리", icon: Library, path: "/library" },
];

const authItem: MenuItem = { id: "auth", label: "로그인 / 회원가입", icon: LogIn, path: "/auth" };

const bottomRowItems: MenuItem[] = [
  { id: "mypage", label: "마이페이지", icon: User, path: "/mypage" },
  { id: "settings", label: "설정", icon: Settings, path: "/settings" },
];

// 2. 컴포넌트
interface LibrarySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export function LibrarySidebar({ isOpen, onClose, onToggle }: LibrarySidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  // 메뉴 렌더링 함수
  const renderMenuItem = (item: MenuItem, index: number, delayOffset: number = 0, className: string = "w-full") => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;
    const isHovered = hoveredItem === item.id;
    
    // 반반 버튼인지 확인 (여백 조정을 위해 확인은 하되, 아이콘 위치는 고정)
    const isSplitButton = className.includes("flex-1");

    return (
      <button
        key={item.id}
        onClick={() => handleNavigate(item.path)}
        onMouseEnter={() => setHoveredItem(item.id)}
        onMouseLeave={() => setHoveredItem(null)}
        className={cn(
          "group relative transition-all duration-300",
          className, 
          isHovered && "translate-x-1"
        )}
        style={{
          animationDelay: `${(index + delayOffset) * 100}ms`,
        }}
      >
        <div
          className={cn(
            // justify-center: 텍스트는 항상 중앙 정렬
            "relative flex items-center justify-center py-3 rounded-r-sm transition-all duration-300 h-full",
            // 반반 버튼일 때는 좌우 패딩을 조금 줄임 (공간 확보)
            isSplitButton ? "px-1" : "px-3",
            "book-cover border-l-4",
            isActive
              ? "border-l-gold bg-leather"
              : "border-l-bookmark hover:border-l-gold"
          )}
        >
          
          {/* 아이콘: 조건 없이 항상 absolute로 왼쪽에 고정 */}
          <Icon
            className={cn(
              "absolute transition-colors duration-300 shrink-0 w-4 h-4", 
              // 반반 버튼일 때는 왼쪽 여백을 조금 줄여서(left-2) 빡빡하지 않게 함
              // 일반 버튼은 여유 있게 left-3
              isSplitButton ? "left-2" : "left-3",
              isActive ? "text-gold" : "text-sepia group-hover:text-gold"
            )}
          />

          {/* 텍스트: 중앙 정렬 */}
          <span
            className={cn(
              "font-serif text-xs transition-colors duration-300 whitespace-nowrap z-10",
              isActive ? "text-gold" : "text-sepia group-hover:text-primary"
            )}
          >
            {item.label}
          </span>

          {/* 호버 효과 */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-r from-transparent via-gold/10 to-transparent transition-opacity duration-500",
              isHovered ? "opacity-100" : "opacity-0"
            )}
          />
        </div>
      </button>
    );
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-72 z-50 transition-transform duration-500 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="absolute left-full top-5 z-50 focus:outline-none group"
          aria-label="Toggle Sidebar"
        >
          <div
            className={cn(
              "bookmark w-10 h-24 rounded-r-md flex items-center justify-center transition-all duration-300 shadow-md",
              isOpen 
                ? "bg-[hsl(var(--bookmark))] border-l border-gold" 
                : "bg-[hsl(var(--bookmark))] border border-l-0 border-border group-hover:bg-accent"
            )}
          >
            <div className="absolute bottom-0 left-0 right-0 h-4 overflow-hidden">
              <div className={cn("absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[20px] border-r-[20px] border-b-[16px] border-l-transparent border-r-transparent", "border-b-background")} />
            </div>
            <BookMarked
              className={cn(
                "w-5 h-5 -rotate-90 transition-all duration-300",
                isOpen ? "text-gold" : "text-muted-foreground group-hover:text-primary"
              )}
            />
          </div>
          {!isOpen && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-card rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap border border-border">
              <span className="font-serif text-sm text-foreground">메뉴 열기</span>
              <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-r-[6px] border-t-transparent border-b-transparent border-r-card" />
              <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-r-[6px] border-t-transparent border-b-transparent border-r-border -z-10 -ml-[1px]" />
            </div>
          )}
        </button>

        {/* Content */}
        <div className="absolute inset-0 wood-texture" />
        <div className="absolute right-0 top-0 h-full w-3 bg-gradient-to-r from-transparent to-background/50" />

        <div className="relative h-full flex flex-col py-8 px-4">
          <div className="flex items-center justify-between mb-8 px-2">
            <h2 className="font-serif text-lg text-gold gold-accent">메뉴</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary/50 transition-colors">
              <X className="w-5 h-5 text-sepia" />
            </button>
          </div>

          <nav className="flex-1 space-y-3 overflow-y-auto overflow-x-hidden pr-1">
            {topMenuItems.map((item, index) => renderMenuItem(item, index, 0, "w-full"))}
          </nav>

          <div className="mt-4 pt-4 border-t border-border/30 flex flex-col gap-3">
             {renderMenuItem(authItem, 0, 4, "w-full")}
             <div className="flex gap-2 w-full">
               {bottomRowItems.map((item, index) => renderMenuItem(item, index, 5, "flex-1"))}
             </div>
          </div>

          <div className="mt-6 pt-2">
            <p className="font-handwriting text-center text-muted-foreground text-sm">
              나의 추억을 기록하는 공간
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}