import type React from "react";
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  User,
  MessageCircle,
  AlertTriangle,
  Edit,
  LogOut,
  Rocket,
  Award,
  Target,
  CheckCircle2,
  Lock,
  X,
} from "lucide-react";

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
    id: "logout",
    label: "로그아웃",
    icon: LogOut,
    description: "계정에서 로그아웃합니다",
  },
  {
    id: "withdraw",
    label: "회원 탈퇴",
    icon: LogOut,
    description: "계정을 삭제합니다",
    variant: "danger",
  },
];

const achievementHighlights = [
  { icon: "🌟", label: "첫 기록", earned: true },
  { icon: "🔥", label: "7일 연속", earned: true },
  { icon: "📸", label: "사진 50장", earned: true },
  { icon: "🧭", label: "30일 연속", earned: false },
];

const allAchievements = [
  { label: "첫 기록", earned: true },
  { label: "7일 연속", earned: true },
  { label: "30일 연속", earned: false },
  { label: "100일 연속", earned: false },
  { label: "1년 연속", earned: false },
  { label: "2년 연속", earned: false },
  { label: "3년 연속", earned: false },
  { label: "첫 사진", earned: true },
  { label: "사진 10장", earned: true },
  { label: "사진 30장", earned: true },
  { label: "사진 50장", earned: true },
  { label: "사진 100장", earned: false },
  { label: "사진 200장", earned: false },
  { label: "사진 300장", earned: false },
  { label: "사진 400장", earned: false },
  { label: "사진 500장", earned: false },
];

const MyPage = () => {
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);

  return (
    <MainLayout>
      <div className="min-h-screen py-12 px-4 bg-background">
        <div className="max-w-2xl mx-auto space-y-10">
          {/* Profile / Level Section */}
          <section className="bg-card rounded-xl shadow-md border border-border p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-secondary p-1">
                  <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                    <User className="w-8 h-8 text-muted-foreground" />
                  </div>
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-yellow-600/30" />
              </div>

              <div className="flex-1">
                <h2 className="font-serif text-2xl text-primary gold-accent">
                  사용자님
                </h2>
                <p className="text-sm text-muted-foreground">
                  레벨 3 · 경험치 85%
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-700 to-yellow-500"
                  style={{ width: "85%" }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>레벨 3</span>
                <span>레벨 4까지 150P 남음</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-secondary/40">
                <p className="text-2xl font-bold text-yellow-600">127</p>
                <p className="text-sm text-muted-foreground">총 기록</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/40">
                <p className="text-2xl font-bold text-yellow-600">14</p>
                <p className="text-sm text-muted-foreground">연속 기록</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/40">
                <p className="text-2xl font-bold text-yellow-600">2,450</p>
                <p className="text-sm text-muted-foreground">포인트</p>
              </div>
            </div>
          </section>

          {/* Achievements */}
          <section className="bg-card rounded-xl shadow-md border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-foreground">업적</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAchievementsOpen(true)}
                className="text-sm text-yellow-600 hover:underline"
              >
                전체보기
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {achievementHighlights.map((a, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex flex-col items-center p-3 rounded-lg transition-all",
                    a.earned
                      ? "bg-yellow-700/10 border border-yellow-700/20"
                      : "bg-secondary/30 opacity-50"
                  )}
                >
                  <span className="text-2xl mb-1">{a.icon}</span>
                  <span className="text-xs text-muted-foreground text-center">
                    {a.label}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Missions */}
          <section className="bg-card rounded-xl shadow-md border border-border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-foreground">
                진행 중인 미션
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/40">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📝</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      오늘 5개의 감상 기록하기
                    </p>
                    <p className="text-xs text-muted-foreground">3/5 완료</p>
                  </div>
                </div>
                <span className="text-xs text-yellow-600 font-medium">
                  +50P
                </span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/40">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📷</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      사진 업로드하기
                    </p>
                    <p className="text-xs text-muted-foreground">0/1 완료</p>
                  </div>
                </div>
                <span className="text-xs text-yellow-600 font-medium">
                  +30P
                </span>
              </div>
            </div>
          </section>

          {/* Menu */}
          <div className="space-y-6">
            <div className="bg-card rounded-lg shadow-md overflow-hidden border border-border">
              {menuItems
                .filter((item) => item.variant !== "danger")
                .map((item, index, arr) => {
                  const Icon = item.icon;
                  const isAssistant = item.id === "assistant";
                  const isLast = index === arr.length - 1;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {}}
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

            <div className="bg-card rounded-lg shadow-md overflow-hidden border border-border">
              {menuItems
                .filter((item) => item.variant === "danger")
                .map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {}}
                      className="w-full p-5 text-left transition-all duration-200 group relative hover:bg-red-50/10"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500/50 group-hover:bg-red-500 transition-colors" />

                      <div className="flex items-center gap-4 pl-2">
                        <div className="w-10 h-10 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-red-500" />
                        </div>

                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-red-500">
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

      {isAchievementsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="닫기"
            onClick={() => setIsAchievementsOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-card rounded-xl shadow-xl border border-border p-6 max-h-[80vh] overflow-auto">
            <button
              type="button"
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setIsAchievementsOpen(false)}
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-foreground">업적 전체보기</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              전체 업적과 달성 여부를 확인할 수 있어요.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {allAchievements.map((achievement) => (
                <div
                  key={achievement.label}
                  className={cn(
                    "rounded-lg border p-4 transition-colors",
                    achievement.earned
                      ? "bg-yellow-700/10 border-yellow-700/20"
                      : "bg-secondary/30 border-border"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        achievement.earned
                          ? "bg-yellow-700/10 text-yellow-700"
                          : "bg-secondary text-muted-foreground"
                      )}
                    >
                      {achievement.earned ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Lock className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">
                        {achievement.label}
                      </p>
                      <p
                        className={cn(
                          "text-xs",
                          achievement.earned
                            ? "text-yellow-700"
                            : "text-muted-foreground"
                        )}
                      >
                        {achievement.earned ? "달성" : "미달성"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default MyPage;