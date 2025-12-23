import { MainLayout } from "@/components/layout/MainLayout";
import { Award, CheckCircle2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Achievement {
  label: string;
  earned: boolean;
}

const achievements: Achievement[] = [
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

const Achievements = () => {
  return (
    <MainLayout>
      {/* [해결책: 순수 CSS 주입]
        Tailwind 설정을 우회하여 브라우저에 직접 스타일을 명령합니다.
        클래스명: .brown-scroll-container
      */}
      <style>{`
        /* 스크롤바 전체 너비 */
        .brown-scroll-container::-webkit-scrollbar {
          width: 8px !important;
          display: block !important;
        }

        /* 스크롤바 트랙 (배경) - 투명 */
        .brown-scroll-container::-webkit-scrollbar-track {
          background: transparent !important;
        }

        /* 스크롤바 핸들 (움직이는 막대) - 브라운 */
        .brown-scroll-container::-webkit-scrollbar-thumb {
          background-color: #855a30 !important; /* 진한 브라운 */
          border-radius: 4px !important;
          border: 2px solid transparent !important; /* 막대 주변 여백 효과 */
          background-clip: content-box !important;
        }

        /* 호버 시 색상 */
        .brown-scroll-container::-webkit-scrollbar-thumb:hover {
          background-color: #5c3d1f !important;
        }

        /* 파이어폭스 호환성 */
        .brown-scroll-container {
          scrollbar-width: thin !important;
          scrollbar-color: #855a30 transparent !important;
        }
      `}</style>

      <div className="min-h-screen py-12 px-4 bg-background">
        <div className="max-w-2xl mx-auto space-y-10">
          <section className="bg-card rounded-xl shadow-md border border-border p-6">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-foreground">업적 전체보기</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              전체 업적과 달성 여부를 확인할 수 있어요.
            </p>

            {/* [적용 부분]
              className에 "brown-scroll-container"를 추가했습니다.
              h-[500px]: 높이를 500px로 고정하여 내용이 넘치게 만듭니다.
              overflow-y-auto: 넘치는 내용을 스크롤로 처리합니다.
            */}
            <div className="brown-scroll-container h-[500px] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {achievements.map((achievement) => (
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
                          "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
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
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default Achievements;