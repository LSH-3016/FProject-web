import { useState } from "react";
import { LibrarySidebar } from "./LibrarySidebar";
import { SidebarTrigger } from "./SidebarTrigger";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    // 1. 전체 컨테이너가 화면 너비를 꽉 채우도록 w-full 보장
    <div className="min-h-screen bg-background relative overflow-hidden w-full">
      {/* Ambient lighting effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl animate-candle-flicker" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Sidebar trigger */}
      <SidebarTrigger
        onClick={() => setIsSidebarOpen(true)}
        isOpen={isSidebarOpen}
      />

      {/* Sidebar */}
      <LibrarySidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main content: 
        2. w-full을 통해 내부 콘텐츠(index.tsx)가 가로로 펴질 공간을 확보합니다.
        3. flex flex-col을 주어 내부 요소들이 세로로 쌓이되 너비를 가질 수 있게 합니다.
      */}
      <main className="relative min-h-screen w-full flex flex-col">
        {children}
      </main>
    </div>
  );
}