import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { 
  Calendar, Heart, Target, AlertTriangle, 
  Briefcase, Gift, MessageCircle, Hash, Smile, Frown,
  CheckCircle, ChevronUp, ChevronDown, X
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { reportApiService, ReportResponse } from "@/services/reportApi";

// 리포트 콘텐츠만 렌더링하는 컴포넌트
const ReportContent = ({ report }: { report: ReportResponse }) => {
  // 날짜 포맷팅
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // week_period 또는 week_start/week_end 처리
  const weekStart = report.week_start || report.week_period?.start || '';
  const weekEnd = report.week_end || report.week_period?.end || '';

  return (
    <>
      {/* 한 줄 요약 */}
      <div className="bg-violet-100 rounded-xl p-4 border-2 border-violet-300">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-5 h-5 text-violet-600" />
          <h3 className="font-semibold text-violet-800">🎯 주간 평가</h3>
        </div>
        <p className="text-violet-900 text-sm leading-relaxed">
          평균 점수: {report.average_score.toFixed(1)}점 ({report.evaluation})
        </p>
      </div>

      {/* 일별 분석 */}
      {report.daily_analysis && report.daily_analysis.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="font-serif text-lg text-amber-900 font-bold">📅 일별 분석</h2>
          </div>
          <div className="space-y-2">
            {report.daily_analysis.map((day, i) => (
              <div key={i} className="bg-blue-100 rounded-lg p-3 border-2 border-blue-300">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-blue-800 font-bold text-sm">{formatDate(day.date)}</span>
                  <span className="text-blue-600 text-sm">점수: {day.score} | {day.sentiment}</span>
                </div>
                <p className="text-blue-700 text-xs line-clamp-2">{day.diary_content}</p>
                {day.key_themes && day.key_themes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {day.key_themes.map((theme, j) => (
                      <span key={j} className="px-2 py-0.5 bg-blue-500 text-white rounded-full text-xs">
                        {theme}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 패턴 분석 */}
      {report.patterns && report.patterns.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Hash className="w-5 h-5 text-purple-600" />
            <h2 className="font-serif text-lg text-amber-900 font-bold">🔍 패턴 분석</h2>
          </div>
          <div className="space-y-2">
            {report.patterns.map((pattern, i) => (
              <div key={i} className="bg-purple-100 rounded-lg p-3 border-2 border-purple-300">
                <div className="flex items-center justify-between">
                  <span className="text-purple-800 font-bold text-sm">{pattern.value}</span>
                  <span className="text-purple-600 text-xs">
                    {pattern.frequency}회 | 평균 {pattern.average_score.toFixed(1)}점
                  </span>
                </div>
                <p className="text-purple-700 text-xs mt-1">
                  {pattern.type} - {pattern.correlation} 영향
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 피드백 */}
      {report.feedback && report.feedback.length > 0 && (
        <div className="bg-sky-100 rounded-xl p-5 border-2 border-sky-400">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="w-5 h-5 text-sky-600" />
            <h2 className="font-serif text-lg text-amber-900 font-bold">💬 AI 피드백</h2>
          </div>
          <div className="space-y-2">
            {report.feedback.map((fb, i) => (
              <div key={i} className="bg-white/70 rounded-lg p-3 border border-sky-300">
                <p className="text-sky-900 text-sm leading-relaxed">{fb}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

const Report = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'up' | 'down' | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const [weeklyReportData, setWeeklyReportData] = useState<ReportResponse[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);

  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { userId, isLoading: userLoading } = useCurrentUser();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // userId를 localStorage에 저장
  useEffect(() => {
    if (userId && !userLoading) {
      console.log('🔐 Report 초기화 - 사용자 ID:', userId);
      localStorage.setItem('currentUserId', userId);
    }
  }, [userId, userLoading]);

  // 리포트 목록 불러오기
  useEffect(() => {
    const loadReports = async () => {
      if (!isAuthenticated || authLoading || userLoading || !userId) return;
      
      try {
        setIsLoadingReports(true);
        const reports = await reportApiService.getReports(1, 100);
        setWeeklyReportData(reports);
        console.log('📊 리포트 목록 로드 완료:', reports);
      } catch (error: any) {
        console.error('❌ 리포트 목록 로드 실패:', error);
        // 리포트가 없거나 조회 실패 시 빈 배열로 설정
        setWeeklyReportData([]);
        
        // 404나 빈 리스트는 정상 상황이므로 에러 메시지 표시 안 함
        if (error.message && !error.message.includes('404') && !error.message.includes('조회 실패')) {
          console.warn('⚠️ 리포트 조회 중 예상치 못한 오류:', error.message);
        }
      } finally {
        setIsLoadingReports(false);
      }
    };

    loadReports();
  }, [isAuthenticated, authLoading, userLoading, userId]);

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

  // 리포트 생성 핸들러
  const handleCreateReport = async () => {
    setShowConfirmModal(false);
    setIsCreatingReport(true);

    try {
      const report = await reportApiService.createReport();
      console.log('✅ 리포트 생성 완료:', report);
      
      // 생성된 리포트를 목록에 추가
      setWeeklyReportData(prev => [report, ...prev]);
      setCurrentPage(0); // 첫 페이지로 이동
      
      alert('리포트가 성공적으로 생성되었습니다!');
    } catch (error: any) {
      console.error('❌ 리포트 생성 실패:', error);
      alert(error.message || '리포트 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsCreatingReport(false);
    }
  };

  // 리포트가 비어있을 때 표시할 빈 상태 컴포넌트
  const EmptyState = () => (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <div className="text-center space-y-6">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-amber-900 text-xl font-medium">
          일기를 꾸준히 작성하여 나만의 리포트를 받아보세요 !
        </p>
        <button
          onClick={() => setShowConfirmModal(true)}
          disabled={isCreatingReport}
          className="mt-6 px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreatingReport ? '리포트 생성 중...' : '리포트 생성'}
        </button>
      </div>
    </div>
  );

  // 확인 모달 컴포넌트
  const ConfirmModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setShowConfirmModal(false)}
      />
      
      {/* 모달 콘텐츠 */}
      <div className="relative bg-gradient-to-b from-amber-50 to-amber-100 rounded-2xl shadow-2xl border-2 border-amber-300 p-6 max-w-md w-full">
        {/* 닫기 버튼 */}
        <button
          onClick={() => setShowConfirmModal(false)}
          className="absolute top-4 right-4 text-amber-600 hover:text-amber-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 아이콘 */}
        <div className="text-center mb-4">
          <div className="text-5xl mb-3">📊</div>
          <h3 className="text-xl font-bold text-amber-900 mb-2">
            새로운 리포트를 생성할까요?
          </h3>
          <p className="text-sm text-amber-700">
            지난 주 월요일부터 일요일까지의 일기를 분석하여<br />
            리포트를 생성합니다.
          </p>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setShowConfirmModal(false)}
            className="flex-1 px-4 py-2.5 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleCreateReport}
            className="flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
          >
            예
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 확인 모달 */}
      {showConfirmModal && <ConfirmModal />}
      
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
                {weeklyReportData.length === 0 ? (
                  // 리포트가 비어있을 때
                  <>
                    <div className="flex items-center justify-between px-4 py-3 border-b-2 border-amber-300 bg-amber-50 shrink-0">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-amber-700" />
                        <span className="font-serif text-lg text-amber-900 font-bold">📊 주간 리포트</span>
                      </div>
                    </div>
                    <EmptyState />
                  </>
                ) : (
                  // 리포트가 있을 때
                  <>
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
                        <span>📅 {currentReport.week_start || currentReport.week_period?.start} ~ {currentReport.week_end || currentReport.week_period?.end}</span>
                        <span>📊 평균 {currentReport.average_score.toFixed(1)}점</span>
                        <span>✨ {currentReport.evaluation}</span>
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
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 페이지 인디케이터 - 리포트가 있을 때만 표시 */}
          {weeklyReportData.length > 0 && (
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
          )}
        </div>
      </div>
    </MainLayout>
    </>
  );
};

export default Report;
