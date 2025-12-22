import { MainLayout } from "@/components/layout/MainLayout";
import { User, MessageCircle, AlertTriangle, Edit, LogOut, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  variant?: "default" | "danger";
}

const menuItems: MenuItem[] = [
  {
    id: "inquiry",
    label: "문의",
    icon: MessageCircle,
    description: "궁금한 점을 물어보세요",
  },
  {
    id: "assistant",
    label: "도우미",
    icon: Rocket,
    description: "작은 우주선이 도와드려요",
  },
  {
    id: "report",
    label: "회원 신고",
    icon: AlertTriangle,
    description: "부적절한 활동을 신고하세요",
  },
  {
    id: "edit",
    label: "정보 수정",
    icon: Edit,
    description: "프로필 정보를 변경하세요",
  },
  {
    id: "withdraw",
    label: "회원 탈퇴",
    icon: LogOut,
    description: "계정을 삭제합니다",
    variant: "danger",
  },
];

const MyPage = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header with profile */}
          <header className="text-center mb-12 animate-fade-in">
            {/* Profile picture frame */}
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 rounded-full book-cover p-1">
                <div className="w-full h-full rounded-full paper-texture flex items-center justify-center">
                  <User className="w-10 h-10 text-ink/50" />
                </div>
              </div>
              {/* Gold frame accent */}
              <div className="absolute inset-0 rounded-full border-2 border-gold/30" />
            </div>

            <h1 className="font-serif text-3xl text-primary mb-2 gold-accent">
              마이페이지
            </h1>
            <p className="font-handwriting text-xl text-muted-foreground">
              나의 기록 공간
            </p>

            {/* Stats */}
            <div className="flex justify-center gap-8 mt-6">
              <div className="text-center">
                <p className="font-serif text-2xl text-gold">42</p>
                <p className="font-serif text-sm text-muted-foreground">기록</p>
              </div>
              <div className="w-px bg-border" />
              <div className="text-center">
                <p className="font-serif text-2xl text-gold">7</p>
                <p className="font-serif text-sm text-muted-foreground">파일</p>
              </div>
              <div className="w-px bg-border" />
              <div className="text-center">
                <p className="font-serif text-2xl text-gold">14일</p>
                <p className="font-serif text-sm text-muted-foreground">함께한 날</p>
              </div>
            </div>
          </header>

          {/* Menu items as archive cards */}
          <div className="space-y-3">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isAssistant = item.id === "assistant";

              return (
                <button
                  key={item.id}
                  className={cn(
                    "w-full paper-texture rounded-lg p-5 text-left transition-all duration-300 animate-fade-in group",
                    "shadow-page hover:shadow-soft hover:-translate-y-0.5",
                    item.variant === "danger" && "hover:bg-destructive/5"
                  )}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Book edge */}
                  <div
                    className={cn(
                      "absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg transition-colors",
                      item.variant === "danger"
                        ? "bg-destructive/50 group-hover:bg-destructive"
                        : "bg-leather group-hover:bg-gold"
                    )}
                  />

                  <div className="flex items-center gap-4 pl-2">
                    {/* Icon container */}
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-colors relative",
                        item.variant === "danger"
                          ? "bg-destructive/10 group-hover:bg-destructive/20"
                          : "bg-secondary group-hover:bg-secondary/80"
                      )}
                    >
                      {isAssistant ? (
                        // Animated spaceship for assistant
                        <div className="animate-gentle-float">
                          <Rocket className="w-6 h-6 text-gold" />
                        </div>
                      ) : (
                        <Icon
                          className={cn(
                            "w-6 h-6 transition-colors",
                            item.variant === "danger"
                              ? "text-destructive"
                              : "text-ink/60 group-hover:text-gold"
                          )}
                        />
                      )}
                    </div>

                    {/* Text */}
                    <div className="flex-1">
                      <h3
                        className={cn(
                          "font-serif text-lg transition-colors",
                          item.variant === "danger"
                            ? "text-destructive"
                            : "text-ink group-hover:text-gold"
                        )}
                      >
                        {item.label}
                      </h3>
                      <p className="font-handwriting text-ink/50 text-sm">
                        {item.description}
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="text-ink/30 group-hover:text-ink/50 transition-colors">
                      →
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MyPage;
