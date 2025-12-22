import { BookMarked } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarTriggerProps {
  onClick: () => void;
  isOpen: boolean;
}

export function SidebarTrigger({ onClick, isOpen }: SidebarTriggerProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed left-0 top-1/2 -translate-y-1/2 z-30 transition-all duration-500",
        isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
    >
      {/* Bookmark shape */}
      <div className="relative group">
        {/* Bookmark body */}
        <div className="bookmark w-10 h-24 rounded-r-md flex items-center justify-center transition-transform duration-300 group-hover:translate-x-2">
          {/* Decorative ribbon end */}
          <div className="absolute bottom-0 left-0 right-0 h-4 overflow-hidden">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[20px] border-r-[20px] border-b-[16px] border-l-transparent border-r-transparent border-b-background" />
          </div>
          
          <BookMarked className="w-5 h-5 text-sepia/90 -rotate-90 transition-all duration-300 group-hover:text-gold" />
        </div>

        {/* Tooltip */}
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 bg-card rounded-md shadow-soft opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
          <span className="font-serif text-sm text-foreground">책장 열기</span>
          {/* Arrow */}
          <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-r-[6px] border-t-transparent border-b-transparent border-r-card" />
        </div>
      </div>
    </button>
  );
}
