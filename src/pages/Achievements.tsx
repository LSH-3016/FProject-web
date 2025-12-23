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
      {/* [스타일 강제 적용] 
        id 선택자를 사용하여 우선순위를 높이고 !important로 강제 적용합니다.
        배경(Track)을 transparent로 설정하여 흰색 막대를 제거합니다.
      */}
      <style>{`
        #achievements-scroll-container {
          overflow-y: auto;
          scrollbar-width: thin; /* Firefox */
          scrollbar-color: #78716c transparent; /* Firefox: thumb track */
        }
        
        /* Chrome, Safari, Edge */
        #achievements-scroll-container::-webkit-scrollbar {
          width: 6px !important;
          background: transparent !important; /* 트랙 배경 투명 강제 */
        }
        
        #achievements-scroll-container::-webkit-scrollbar-track {
          background-color: transparent !important; /* 흰색 배경 제거 */
          border-radius: 10px;
        }

        #achievements-scroll-container::-webkit-scrollbar-thumb {
          background-color: #a8a29e !important; /* Stone-400 */
          border-radius: 10px !important;
          border: 1px solid transparent; /* 핸들 주변 여백 효과 */
          background-clip: content-box;
        }

        #achievements-scroll-container::-webkit-scrollbar-thumb:hover {
          background-color: #78716c !important; /* Stone-500 */
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

            {/* id="achievements-scroll-container" 추가하여 위 스타일과 연결 */}
            <div 
              id="achievements-scroll-container"
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] pr-2"
            >
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
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default Achievements;