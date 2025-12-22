import type React from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useNavigate } from "react-router-dom";
import { User, MessageCircle, AlertTriangle, Edit, LogOut, Rocket } from "lucide-react";

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  variant?: "default" | "danger";
}

const menuItems: MenuItem[] = [
  { id: "inquiry", label: "문의", icon: MessageCircle, description: "궁금한 점을 물어보세요" },
  { id: "assistant", label: "도우미", icon: Rocket, description: "작은 우주선이 도와드려요" },
  { id: "report", label: "회원 신고", icon: AlertTriangle, description: "부적절한 활동을 신고하세요" },
  { id: "edit", label: "정보 수정", icon: Edit, description: "프로필 정보를 변경하세요" },
  { id: "withdraw", label: "회원 탈퇴", icon: LogOut, description: "계정을 삭제합니다", variant: "danger" },
];

const MyPage = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="min-h-screen py-12 px-4 bg-background">
        <div className="max-w-2xl mx-auto">
          {/* Header with profile */}
          <header className="text-center mb-12">
            {/* Profile picture frame */}
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 rounded-full bg-secondary p-1">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                  <User className="w-10 h-10 text-muted-foreground" />
                </div>
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-yellow-600/30" />
            </div>

            {/* ✅ 여기만 기존 handwriting -> vintage 제목 스타일로 변경 */}
            <h1 className="font-serif text-3xl text-primary mb-2 gold-accent">
              마이페이지
            </h1>

            <p className="handwriting text-2xl md:text-3xl text-muted-foreground">
              나의 기록 공간
            </p>

            {/* Stats */}
            <div className="flex justify-center gap-8 mt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">42</p>
                <p className="text-sm text-muted-foreground">기록</p>
              </div>
              <div className="w-px bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">7</p>
                <p className="text-sm text-muted-foreground">파일</p>
              </div>
              <div className="w-px bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">14일</p>
                <p className="text-sm text-muted-foreground">함께한 날</p>
              </div>
            </div>
          </header>

          {/* Menu items */}
          <div className="space-y-6">
            {/* Settings group */}
            <div className="bg-card rounded-lg shadow-md overflow-hidden border border-border">
              {menuItems.slice(0, 4).map((item, index) => {
                const Icon = item.icon;
                const isAssistant = item.id === "assistant";
                const isLast = index === 3;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      // 예: if (item.id === "edit") navigate("/profile/edit");
                    }}
                    className={cn(
                      "w-full p-5 text-left transition-all duration-200 group relative hover:bg-secondary/30",
                      !isLast && "border-b border-border"
                    )}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-700 group-hover:bg-yellow-600 transition-colors" />

                    <div className="flex items-center gap-4 pl-2">
                      <div className="w-10 h-10 flex items-center justify-center">
                        {isAssistant ? (
                          <Rocket className="w-6 h-6 text-yellow-600" />
                        ) : (
                          <Icon className="w-6 h-6 text-foreground/60 group-hover:text-yellow-600 transition-colors" />
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-yellow-600 transition-colors">
                          {item.label}
                        </h3>

                        <p className="handwriting text-lg text-muted-foreground leading-snug">
                          {item.description}
                        </p>
                      </div>

                      <div className="text-muted-foreground group-hover:text-foreground transition-colors">
                        →
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Danger zone */}
            <div className="bg-card rounded-lg shadow-md overflow-hidden border border-border">
              {menuItems.slice(4).map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      // 예: if (item.id === "withdraw") navigate("/withdraw");
                    }}
                    className="w-full p-5 text-left transition-all duration-200 group relative hover:bg-red-50/10"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500/50 group-hover:bg-red-500 transition-colors" />

                    <div className="flex items-center gap-4 pl-2">
                      <div className="w-10 h-10 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-red-500 transition-colors" />
                      </div>

                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-red-500 transition-colors">
                          {item.label}
                        </h3>

                        <p className="handwriting text-lg text-muted-foreground leading-snug">
                          {item.description}
                        </p>
                      </div>

                      <div className="text-muted-foreground group-hover:text-red-500/70 transition-colors">
                        →
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MyPage;