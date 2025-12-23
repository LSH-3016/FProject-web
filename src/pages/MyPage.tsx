import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isWithdrawAgreed, setIsWithdrawAgreed] = useState(false);
  const [isWithdrawCompleteOpen, setIsWithdrawCompleteOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isLogoutCompleteOpen, setIsLogoutCompleteOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isReportCompleteOpen, setIsReportCompleteOpen] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [isInquiryCompleteOpen, setIsInquiryCompleteOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState<
    Array<{ id: number; role: "user" | "assistant"; text: string }>
  >([
    {
      id: 1,
      role: "assistant",
      text: "안녕하세요! 궁금한 내용을 입력해 주세요.",
    },
  ]);
  const [assistantInput, setAssistantInput] = useState("");
  const assistantScrollRef = useRef<HTMLDivElement | null>(null);
  const defaultNickname = "상호상사";
  const storedProfileImage =
    typeof window !== "undefined" ? localStorage.getItem("profileImage") : null;
  const storedNickname =
    typeof window !== "undefined"
      ? localStorage.getItem("profileNickname")
      : null;
  const profileImage = storedProfileImage ?? "";
  const profileNickname = storedNickname ?? defaultNickname;

  const closeWithdrawModal = () => {
    setIsWithdrawOpen(false);
    setIsWithdrawAgreed(false);
  };

  const handleWithdrawConfirm = () => {
    setIsWithdrawOpen(false);
    setIsWithdrawAgreed(false);
    setIsWithdrawCompleteOpen(true);
  };

  const closeWithdrawCompleteModal = () => {
    setIsWithdrawCompleteOpen(false);
  };

  const openLogoutConfirm = () => {
    setIsLogoutConfirmOpen(true);
  };

  const closeLogoutConfirm = () => {
    setIsLogoutConfirmOpen(false);
  };

  const handleLogoutConfirm = () => {
    setIsLogoutConfirmOpen(false);
    setIsLogoutCompleteOpen(true);
  };

  const closeLogoutComplete = () => {
    setIsLogoutCompleteOpen(false);
  };

  const closeReportModal = () => {
    setIsReportOpen(false);
  };

  const handleReportSubmit = () => {
    setIsReportOpen(false);
    setIsReportCompleteOpen(true);
  };

  const closeReportComplete = () => {
    setIsReportCompleteOpen(false);
  };

  const closeInquiryModal = () => {
    setIsInquiryOpen(false);
  };

  const handleInquirySubmit = () => {
    setIsInquiryOpen(false);
    setIsInquiryCompleteOpen(true);
  };

  const closeInquiryComplete = () => {
    setIsInquiryCompleteOpen(false);
  };

  const toggleAssistant = () => {
    setIsAssistantOpen((prev) => !prev);
  };

  const handleAssistantSend = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = assistantInput.trim();
    if (!trimmed) {
      return;
    }
    const userMessage = {
      id: Date.now(),
      role: "user" as const,
      text: trimmed,
    };
    const replyMessage = {
      id: Date.now() + 1,
      role: "assistant" as const,
      text: "현재는 데모 모드라 자동 응답만 제공됩니다.",
    };
    setAssistantMessages((prev) => [...prev, userMessage, replyMessage]);
    setAssistantInput("");
  };

  useEffect(() => {
    if (!isAssistantOpen) {
      return;
    }
    const container = assistantScrollRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [assistantMessages, isAssistantOpen]);

  return (
    <MainLayout>
      <div className="min-h-screen py-12 px-4 bg-background">
        <div className="max-w-2xl mx-auto space-y-10">
          {/* Profile / Level Section */}
          <section className="bg-card rounded-xl shadow-md border border-border p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-secondary p-1">
                  <div className="w-full h-full rounded-full bg-background overflow-hidden flex items-center justify-center">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="프로필 사진"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-yellow-600/30" />
              </div>

              <div className="flex-1">
                <h2 className="font-serif text-2xl text-primary gold-accent">
                  {profileNickname}님
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
                      onClick={() => {
                        if (item.id === "logout") {
                          openLogoutConfirm();
                        }
                        if (item.id === "edit") {
                          navigate("/edit-profile");
                        }
                        if (item.id === "report") {
                          setIsReportOpen(true);
                        }
                        if (item.id === "inquiry") {
                          setIsInquiryOpen(true);
                        }
                        if (item.id === "assistant") {
                          toggleAssistant();
                        }
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

            <div className="bg-card rounded-lg shadow-md overflow-hidden border border-border">
              {menuItems
                .filter((item) => item.variant === "danger")
                .map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setIsWithdrawOpen(true)}
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

      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="닫기"
            onClick={closeWithdrawModal}
          />
          <div className="relative w-full max-w-lg bg-card rounded-xl shadow-xl border border-border p-6">
            <button
              type="button"
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
              onClick={closeWithdrawModal}
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-foreground">회원 탈퇴</h3>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-line mb-6">
              회원정보 및 기록, 사진 등 서비스 이용기록은 모두 삭제되며, 삭제된 데이터는 복구되지 않습니다.
              {"\n"}삭제되는 내용을 확인하시고 필요한 데이터는 미리 백업을 해주세요.
            </p>

            <label className="flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-4">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-red-500"
                checked={isWithdrawAgreed}
                onChange={(event) => setIsWithdrawAgreed(event.target.checked)}
              />
              <span className="text-sm text-foreground">
                안내 사항을 확인하였으며, 이에 동의합니다.
              </span>
            </label>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/40"
                onClick={closeWithdrawModal}
              >
                취소
              </button>
              <button
                type="button"
                className={cn(
                  "flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600",
                  !isWithdrawAgreed && "pointer-events-none opacity-60"
                )}
                disabled={!isWithdrawAgreed}
                onClick={handleWithdrawConfirm}
              >
                회원 탈퇴
              </button>
            </div>
          </div>
        </div>
      )}

      {isWithdrawCompleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="닫기"
            onClick={closeWithdrawCompleteModal}
          />
          <div className="relative w-full max-w-sm bg-card rounded-xl shadow-xl border border-border p-6 text-center">
            <p className="text-sm text-foreground">회원 탈퇴 되었습니다.</p>
            <button
              type="button"
              className="mt-5 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              onClick={closeWithdrawCompleteModal}
            >
              확인
            </button>
          </div>
        </div>
      )}

      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="닫기"
            onClick={closeLogoutConfirm}
          />
          <div className="relative w-full max-w-sm bg-card rounded-xl shadow-xl border border-border p-6 text-center">
            <p className="text-sm text-foreground">로그아웃하시겠습니까?</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/40"
                onClick={closeLogoutConfirm}
              >
                취소
              </button>
              <button
                type="button"
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                onClick={handleLogoutConfirm}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {isLogoutCompleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="닫기"
            onClick={closeLogoutComplete}
          />
          <div className="relative w-full max-w-sm bg-card rounded-xl shadow-xl border border-border p-6 text-center">
            <p className="text-sm text-foreground">로그아웃 되었습니다.</p>
            <button
              type="button"
              className="mt-5 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              onClick={closeLogoutComplete}
            >
              확인
            </button>
          </div>
        </div>
      )}

      {isReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="닫기"
            onClick={closeReportModal}
          />
          <div className="relative w-full max-w-lg bg-card rounded-xl shadow-xl border border-border p-6">
            <button
              type="button"
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
              onClick={closeReportModal}
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-foreground">회원 신고</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              신고 대상과 사유를 입력해 주세요.
            </p>

            <div className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="report-nickname"
                  className="text-sm font-medium text-foreground"
                >
                  회원 닉네임
                </label>
                <input
                  id="report-nickname"
                  name="report-nickname"
                  type="text"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="닉네임을 입력하세요"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="report-userid"
                  className="text-sm font-medium text-foreground"
                >
                  회원 아이디
                </label>
                <input
                  id="report-userid"
                  name="report-userid"
                  type="text"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="아이디를 입력하세요"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="report-reason"
                  className="text-sm font-medium text-foreground"
                >
                  신고 사유
                </label>
                <textarea
                  id="report-reason"
                  name="report-reason"
                  rows={4}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="신고 사유를 입력하세요"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/40"
                onClick={closeReportModal}
              >
                취소
              </button>
              <button
                type="button"
                className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600"
                onClick={handleReportSubmit}
              >
                신고
              </button>
            </div>
          </div>
        </div>
      )}

      {isReportCompleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="닫기"
            onClick={closeReportComplete}
          />
          <div className="relative w-full max-w-sm bg-card rounded-xl shadow-xl border border-border p-6 text-center">
            <p className="text-sm text-foreground">
              신고가 성공적으로 접수되었습니다.
            </p>
            <button
              type="button"
              className="mt-5 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              onClick={closeReportComplete}
            >
              확인
            </button>
          </div>
        </div>
      )}

      {isInquiryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="닫기"
            onClick={closeInquiryModal}
          />
          <div className="relative w-full max-w-lg bg-card rounded-xl shadow-xl border border-border p-6">
            <button
              type="button"
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
              onClick={closeInquiryModal}
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-foreground">문의</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              문의할 내용을 자유롭게 작성해주세요.
            </p>

            <div className="space-y-2">
              <label
                htmlFor="inquiry-message"
                className="text-sm font-medium text-foreground"
              >
                문의 내용
              </label>
              <textarea
                id="inquiry-message"
                name="inquiry-message"
                rows={5}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="문의 내용을 입력하세요"
              />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/40"
                onClick={closeInquiryModal}
              >
                취소
              </button>
              <button
                type="button"
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                onClick={handleInquirySubmit}
              >
                문의
              </button>
            </div>
          </div>
        </div>
      )}

      {isInquiryCompleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="닫기"
            onClick={closeInquiryComplete}
          />
          <div className="relative w-full max-w-sm bg-card rounded-xl shadow-xl border border-border p-6 text-center">
            <p className="text-sm text-foreground">
              문의가 성공적으로 접수되었습니다.
            </p>
            <button
              type="button"
              className="mt-5 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              onClick={closeInquiryComplete}
            >
              확인
            </button>
          </div>
        </div>
      )}

      {isAssistantOpen && (
        <div className="fixed bottom-6 right-6 z-40 w-[320px] sm:w-[360px]">
          <div className="rounded-xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Rocket className="w-4 h-4 text-yellow-600" />
                <h4 className="text-sm font-semibold text-foreground">
                  도우미
                </h4>
              </div>
              <button
                type="button"
                onClick={toggleAssistant}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div
              ref={assistantScrollRef}
              className="max-h-72 overflow-y-auto px-4 py-3 space-y-3"
            >
              {assistantMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm",
                    message.role === "user"
                      ? "bg-yellow-700/10 text-foreground ml-auto"
                      : "bg-secondary/40 text-muted-foreground"
                  )}
                >
                  {message.text}
                </div>
              ))}
            </div>

            <form
              className="border-t border-border px-3 py-3 flex items-center gap-2"
              onSubmit={handleAssistantSend}
            >
              <input
                type="text"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="궁금한 내용을 입력하세요"
                value={assistantInput}
                onChange={(event) => setAssistantInput(event.target.value)}
              />
              <button
                type="submit"
                className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                전송
              </button>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default MyPage;