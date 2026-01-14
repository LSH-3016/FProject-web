import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { 
  Calendar, Heart, Target, AlertTriangle, 
  Briefcase, Gift, MessageCircle, Hash, Smile, Frown,
  CheckCircle, ChevronUp, ChevronDown
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// 실제 리포트 데이터 구조 (한 페이지 = 한 주)
const weeklyReportData = [
  {
    id: 1,
    period: "12/23(월) ~ 1/11(토)",
    writeRate: "5/7일 (71%)",
    avgChars: "342자",
    summary: '"협업하며 성장하는 학습 지향 리더" - 팀과 함께 배우고, 즉시 실행하며, 새로운 역할에 도전한 한 주',
    topKeywords: [
      { word: "API", count: 15 },
      { word: "팀원", count: 12 },
      { word: "실습/공부", count: 11 },
      { word: "Cognito", count: 8 },
      { word: "Front", count: 7 },
    ],
    emotions: { positive: 60, neutral: 35, negative: 5 },
    bestDay: { date: "1/11(토)", reason: "AWS Co-Facilitator 참여로 성취감 UP" },
    worstDay: { date: "12/26(목)", reason: "영하 12도 + 지하철 지연 + 팀원 연차" },
    goodPoints: [
      {
        title: "학습→실습→공유 선순환 구조",
        details: [
          "AWS Skillbuilder 실습 후 즉시 팀 공유",
          "Terraform, Cognito 등 신기술 즉시 적용",
          '"한 번으로 부족" 인정하고 추가 학습 계획 수립',
        ],
      },
      {
        title: "배려형 협업 리더십",
        details: [
          "팀원 상황(병가, 지각, 컨디션) 세심히 체크",
          'Task 명확히 분리하고 "할 수 있는 범위 내" 현실적 조율',
          "서로 설명하며 트러블슈팅하는 집단 지성 활용",
        ],
      },
      {
        title: "역할 확장 도전",
        details: [
          "AWS 세션 Co-Facilitator로 진출",
          '"단순 참여자→조력자" 전환하며 의미있는 경험 획득',
          '"피할 수 없으면 즐기자" 긍정 마인드셋',
        ],
      },
    ],
    improvements: [
      { issue: "독감 회복 중 출근", solution: "컨디션 악화 시 적극적 휴식 결정 필요", icon: "🏥" },
      { issue: "지하철 지연 지각", solution: "중요 일정 30분 일찍 출발 루틴화", icon: "🚇" },
      { issue: "광범위한 학습", solution: "프로젝트 핵심 기술 우선순위 설정", icon: "📚" },
      { issue: "주말 세션 참여", solution: '주 2회 "개인 집중 학습 블록" 확보', icon: "⏰" },
    ],
    activities: [
      { name: "기술 학습", stars: 5, detail: "Cognito, Lambda, API Gateway, Terraform" },
      { name: "팀 협업", stars: 5, detail: "매일 상황 체크 및 task 조율" },
      { name: "문서화", stars: 4, detail: "API 명세서, 노션 정리" },
      { name: "외부 활동", stars: 3, detail: "AWS 세션 참여 및 진행" },
      { name: "자기 성찰", stars: 4, detail: "학습 부족 인지, 역할 수행 회고" },
    ],
    nextActions: [
      {
        priority: 1,
        title: "Deep Dive Day 운영",
        details: ['수요일을 "개인 집중 학습일"로 설정', "2시간 단위로 핵심 기술 하나씩 깊이 있게 파기"],
      },
      {
        priority: 2,
        title: "의사결정 간단 메모",
        details: ['기술 선택, 멘토링 피드백 등 "왜?"를 한 줄로 기록', "추후 회고 시 패턴 분석 가능"],
      },
      {
        priority: 3,
        title: "출근 리스크 관리",
        details: ["대체 교통수단 미리 확인", "중요 일정 전날 15분 일찍 출발 알람 설정"],
      },
    ],
    expertComment: {
      title: '"지속 가능한 성장"을 고민할 시점입니다.',
      content:
        '71% 작성률과 건강 이슈는 번아웃 신호일 수 있습니다. "피할 수 없으면 즐기자"는 좋지만, "휴식은 적극적으로 즐기자"도 추가하세요. 당신의 건강이 곧 팀의 자산입니다. 🚀',
    },
  },
  {
    id: 2,
    period: "12/16(월) ~ 12/22(일)",
    writeRate: "6/7일 (86%)",
    avgChars: "298자",
    summary: '"기술 탐구와 팀 빌딩의 조화" - 새로운 기술 스택을 익히며 팀원들과 함께 성장한 한 주',
    topKeywords: [
      { word: "React", count: 18 },
      { word: "TypeScript", count: 14 },
      { word: "회의", count: 10 },
      { word: "디자인", count: 8 },
      { word: "테스트", count: 6 },
    ],
    emotions: { positive: 70, neutral: 25, negative: 5 },
    bestDay: { date: "12/20(금)", reason: "프로젝트 1차 마일스톤 달성" },
    worstDay: { date: "12/18(수)", reason: "버그 수정에 하루 종일 소요" },
    goodPoints: [
      {
        title: "체계적인 코드 리뷰 문화 정착",
        details: [
          "PR 템플릿 도입으로 리뷰 품질 향상",
          "페어 프로그래밍으로 지식 공유",
        ],
      },
      {
        title: "효율적인 회의 운영",
        details: [
          "스탠드업 미팅 15분 내 완료",
          "회의록 실시간 작성 및 공유",
        ],
      },
      {
        title: "자기주도 학습",
        details: [
          "TypeScript 고급 패턴 학습",
          "테스트 코드 작성 습관화",
        ],
      },
    ],
    improvements: [
      { issue: "야근 빈도 증가", solution: "업무 우선순위 재조정 필요", icon: "🌙" },
      { issue: "문서화 지연", solution: "코드 작성과 동시에 문서화", icon: "📝" },
    ],
    activities: [
      { name: "기술 학습", stars: 4, detail: "TypeScript, Testing Library" },
      { name: "팀 협업", stars: 5, detail: "코드 리뷰, 페어 프로그래밍" },
      { name: "문서화", stars: 3, detail: "API 문서 업데이트" },
      { name: "외부 활동", stars: 2, detail: "온라인 밋업 참석" },
      { name: "자기 성찰", stars: 4, detail: "주간 회고 작성" },
    ],
    nextActions: [
      {
        priority: 1,
        title: "테스트 커버리지 80% 달성",
        details: ["핵심 비즈니스 로직 우선 테스트", "CI/CD에 테스트 자동화 추가"],
      },
      {
        priority: 2,
        title: "기술 부채 해소",
        details: ["레거시 코드 리팩토링", "의존성 업데이트"],
      },
    ],
    expertComment: {
      title: '"균형 잡힌 성장"이 핵심입니다.',
      content:
        '야근이 늘어나는 것은 경고 신호입니다. 효율성을 높이는 방법을 찾아보세요. 좋은 개발자는 오래 일하는 것이 아니라 스마트하게 일합니다.',
    },
  },
];

// 리포트 콘텐츠만 렌더링하는 컴포넌트
const ReportContent = ({ report }: { report: typeof weeklyReportData[0] }) => {
  return (
    <>
      {/* 한 줄 요약 */}
      <div className="bg-violet-100 rounded-xl p-4 border-2 border-violet-300">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-5 h-5 text-violet-600" />
          <h3 className="font-semibold text-violet-800">🎯 한 줄 요약</h3>
        </div>
        <p className="text-violet-900 text-sm leading-relaxed">{report.summary}</p>
      </div>

      {/* 핵심 수치 그리드 */}
      <div className="grid grid-cols-2 gap-4">
        {/* TOP 키워드 */}
        <div className="bg-blue-100 rounded-xl p-4 border-2 border-blue-300">
          <div className="flex items-center gap-2 mb-3">
            <Hash className="w-4 h-4 text-blue-600" />
            <h4 className="text-sm font-semibold text-blue-800">🔑 TOP 키워드</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {report.topKeywords.map((kw, i) => (
              <span key={i} className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-medium">
                {kw.word} ({kw.count})
              </span>
            ))}
          </div>
        </div>

        {/* 감정 분포 */}
        <div className="bg-pink-100 rounded-xl p-4 border-2 border-pink-300">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-pink-600" />
            <h4 className="text-sm font-semibold text-pink-800">😊 감정 분포</h4>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs w-10 text-green-700 font-medium">긍정</span>
              <div className="flex-1 h-4 bg-pink-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${report.emotions.positive}%` }} />
              </div>
              <span className="text-xs w-10 text-right text-green-700 font-bold">{report.emotions.positive}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs w-10 text-gray-600 font-medium">중립</span>
              <div className="flex-1 h-4 bg-pink-200 rounded-full overflow-hidden">
                <div className="h-full bg-gray-400 rounded-full" style={{ width: `${report.emotions.neutral}%` }} />
              </div>
              <span className="text-xs w-10 text-right text-gray-600 font-bold">{report.emotions.neutral}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs w-10 text-red-600 font-medium">부정</span>
              <div className="flex-1 h-4 bg-pink-200 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${report.emotions.negative}%` }} />
              </div>
              <span className="text-xs w-10 text-right text-red-600 font-bold">{report.emotions.negative}%</span>
            </div>
          </div>
        </div>

        {/* 최고의 날 */}
        <div className="bg-yellow-100 rounded-xl p-4 border-2 border-yellow-400">
          <div className="flex items-center gap-2 mb-2">
            <Smile className="w-4 h-4 text-yellow-600" />
            <h4 className="text-sm font-semibold text-yellow-800">⭐ 최고의 날</h4>
          </div>
          <p className="text-yellow-900 font-bold text-lg">{report.bestDay.date}</p>
          <p className="text-yellow-800 text-sm mt-1">{report.bestDay.reason}</p>
        </div>

        {/* 힘든 날 */}
        <div className="bg-slate-200 rounded-xl p-4 border-2 border-slate-400">
          <div className="flex items-center gap-2 mb-2">
            <Frown className="w-4 h-4 text-slate-600" />
            <h4 className="text-sm font-semibold text-slate-700">😔 힘든 날</h4>
          </div>
          <p className="text-slate-800 font-bold text-lg">{report.worstDay.date}</p>
          <p className="text-slate-700 text-sm mt-1">{report.worstDay.reason}</p>
        </div>
      </div>

      {/* 잘한 점 TOP 3 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <h2 className="font-serif text-lg text-amber-900 font-bold">✅ 잘한 점 TOP 3</h2>
        </div>
        <div className="space-y-3">
          {report.goodPoints.map((point, i) => (
            <div key={i} className="bg-emerald-100 rounded-xl p-4 border-2 border-emerald-400">
              <h3 className="text-emerald-800 font-bold mb-2 flex items-center gap-2">
                <span className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-sm text-white font-bold">
                  {i + 1}
                </span>
                {point.title}
              </h3>
              <ul className="space-y-1">
                {point.details.map((detail, j) => (
                  <li key={j} className="text-emerald-900 text-sm flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">✓</span>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* 개선 포인트 + 주간 활동 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 개선 포인트 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h2 className="font-serif text-base text-amber-900 font-bold">⚠️ 개선 포인트</h2>
          </div>
          <div className="space-y-2">
            {report.improvements.map((item, i) => (
              <div key={i} className="bg-orange-100 rounded-lg p-3 border-2 border-orange-300">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-orange-800 font-bold text-sm">{item.issue}</span>
                </div>
                <p className="text-orange-700 text-xs pl-7">→ {item.solution}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 주간 활동 요약 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Briefcase className="w-5 h-5 text-purple-600" />
            <h2 className="font-serif text-base text-amber-900 font-bold">💼 주간 활동 요약</h2>
          </div>
          <div className="space-y-2">
            {report.activities.map((act, i) => (
              <div key={i} className="bg-purple-100 rounded-lg p-3 border-2 border-purple-300">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-purple-800 font-bold text-sm">{act.name}</span>
                  <span className="text-yellow-500 text-sm">{"★".repeat(act.stars)}{"☆".repeat(5 - act.stars)}</span>
                </div>
                <p className="text-purple-700 text-xs">{act.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 다음 주 추천 액션 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Gift className="w-5 h-5 text-rose-600" />
          <h2 className="font-serif text-lg text-amber-900 font-bold">🎁 다음 주 추천 액션</h2>
        </div>
        <div className={`grid gap-3 ${report.nextActions.length >= 3 ? 'grid-cols-3' : report.nextActions.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {report.nextActions.map((action) => (
            <div key={action.priority} className="bg-rose-100 rounded-xl p-3 border-2 border-rose-300">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                  {action.priority}
                </span>
                <h4 className="text-rose-800 font-bold text-sm">{action.title}</h4>
              </div>
              <ul className="space-y-1">
                {action.details.map((d, i) => (
                  <li key={i} className="text-rose-700 text-xs flex items-start gap-1">
                    <span className="text-rose-500">•</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* 전문가 한마디 */}
      <div className="bg-sky-100 rounded-xl p-5 border-2 border-sky-400">
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="w-5 h-5 text-sky-600" />
          <h2 className="font-serif text-lg text-amber-900 font-bold">💬 전문가 한마디</h2>
        </div>
        <div className="bg-white/70 rounded-lg p-4 border border-sky-300">
          <p className="text-sky-800 font-bold mb-2 text-base">{report.expertComment.title}</p>
          <p className="text-sky-900 text-sm leading-relaxed">{report.expertComment.content}</p>
        </div>
        <p className="text-center text-sky-700 mt-4 text-base font-bold">다음 주도 화이팅! 💪</p>
      </div>
    </>
  );
};

const Report = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'up' | 'down' | null>(null);

  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const backgroundStyle = useMemo(() => ({
    backgroundImage: "url(/library-bg.png)",
    backgroundSize: "cover" as const,
    backgroundPosition: "center" as const,
    backgroundRepeat: "no-repeat" as const,
    backgroundAttachment: "fixed" as const,
  }), []);

  const goToPage = (direction: 'up' | 'down') => {
    if (isFlipping) return;
    
    const nextPage = direction === 'down' 
      ? Math.min(currentPage + 1, weeklyReportData.length - 1)
      : Math.max(currentPage - 1, 0);
    
    if (nextPage === currentPage) return;
    
    setIsFlipping(true);
    setFlipDirection(direction);
    
    setTimeout(() => {
      setCurrentPage(nextPage);
      setIsFlipping(false);
      setFlipDirection(null);
    }, 600);
  };

  const currentReport = weeklyReportData[currentPage];

  return (
    <MainLayout>
      <style>{`
        .report-scrollbar::-webkit-scrollbar { width: 8px; }
        .report-scrollbar::-webkit-scrollbar-track { background: rgba(217,119,6,0.15); border-radius: 4px; }
        .report-scrollbar::-webkit-scrollbar-thumb { background: rgba(217,119,6,0.5); border-radius: 4px; }
        .report-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(217,119,6,0.7); }
        .report-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(217,119,6,0.5) rgba(217,119,6,0.15); }
        
        .flip-container {
          perspective: 2000px;
        }
        .flip-card {
          transform-style: preserve-3d;
          transition: transform 0.6s ease-in-out;
        }
        .flip-card:hover {
          transform: rotateX(2deg) rotateY(1deg);
        }
        .flip-card.flipping-down {
          animation: flipDown 0.6s ease-in-out;
        }
        .flip-card.flipping-up {
          animation: flipUp 0.6s ease-in-out;
        }
        @keyframes flipDown {
          0% { transform: rotateX(0deg); }
          50% { transform: rotateX(-90deg) scale(0.95); }
          100% { transform: rotateX(0deg); }
        }
        @keyframes flipUp {
          0% { transform: rotateX(0deg); }
          50% { transform: rotateX(90deg) scale(0.95); }
          100% { transform: rotateX(0deg); }
        }
      `}</style>
      <div className="h-screen bg-background relative overflow-hidden w-full">
        <div className="fixed inset-0 pointer-events-none" style={backgroundStyle}>
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center py-4 px-4">
          {/* 메인 리포트 카드 */}
          <div className="flip-container w-full max-w-[1500px] flex-1 min-h-0">
            <div 
              className={`flip-card h-full ${
                isFlipping ? (flipDirection === 'down' ? 'flipping-down' : 'flipping-up') : ''
              }`}
            >
              <div className="h-full bg-gradient-to-b from-amber-50 to-amber-100 rounded-3xl flex flex-col overflow-hidden relative
                shadow-[0_10px_40px_rgba(0,0,0,0.3),0_0_0_1px_rgba(217,119,6,0.2),inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-1px_0_rgba(0,0,0,0.1)]
                border border-amber-200/50"
              >
                {/* 헤더 - 클릭하면 이전 페이지 */}
                <div 
                  onClick={() => currentPage > 0 && goToPage('up')}
                  className={`flex items-center justify-between px-4 py-3 border-b-2 border-amber-300 bg-amber-50 shrink-0 relative ${
                    currentPage > 0 ? 'cursor-pointer hover:bg-amber-100 transition-colors' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-amber-700" />
                    <span className="font-serif text-lg text-amber-900 font-bold">📊 주간 리포트</span>
                  </div>
                  {currentPage > 0 && (
                    <div className="absolute left-1/2 -translate-x-1/2">
                      <ChevronUp className="w-5 h-5 text-amber-500" />
                    </div>
                  )}
                  <div className="flex gap-4 text-xs text-amber-700">
                    <span>📅 {currentReport.period}</span>
                    <span>✍️ {currentReport.writeRate}</span>
                    <span>📝 평균 {currentReport.avgChars}</span>
                  </div>
                </div>

                {/* 스크롤 가능한 콘텐츠 영역 */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 report-scrollbar min-h-0">
                  <ReportContent report={currentReport} />
                </div>

                {/* 푸터 - 클릭하면 다음 페이지 */}
                <div 
                  onClick={() => currentPage < weeklyReportData.length - 1 && goToPage('down')}
                  className={`text-center py-2 border-t-2 border-amber-300 bg-amber-100 shrink-0 flex items-center justify-center gap-2 ${
                    currentPage < weeklyReportData.length - 1 ? 'cursor-pointer hover:bg-amber-200 transition-colors' : ''
                  }`}
                >
                  <span className="text-amber-600 text-xs font-medium">
                    {currentPage + 1} / {weeklyReportData.length}
                  </span>
                  {currentPage < weeklyReportData.length - 1 && <ChevronDown className="w-4 h-4 text-amber-500" />}
                </div>
              </div>
            </div>
          </div>

          {/* 페이지 인디케이터 */}
          <div className="flex gap-2 mt-3">
            {weeklyReportData.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (idx !== currentPage && !isFlipping) {
                    setCurrentPage(idx);
                  }
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentPage ? "bg-amber-600 w-4" : "bg-amber-400/50 hover:bg-amber-400"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Report;
