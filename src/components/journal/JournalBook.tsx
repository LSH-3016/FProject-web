import { useState, KeyboardEvent, useEffect, useRef } from "react";
import { Send, Sparkles, Feather, HelpCircle, Loader2, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { summarizeJournalEntries, type SummaryResult } from "@/lib/bedrock";

export const JournalBook = () => {
  const [entries, setEntries] = useState<Array<{ id: string; user_id: string; content: string; created_at: Date }>>([]);
  const [currentEntry, setCurrentEntry] = useState("");
  const entriesContainerRef = useRef<HTMLDivElement>(null);
  
  // 요약(Analysis) 관련 상태
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogStep, setDialogStep] = useState<"confirm" | "loading" | "result">("confirm");
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>("AI가 기록을 분석하고 있어요...");

  // 삭제 관련 상태
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTargetIndex, setDeleteTargetIndex] = useState<number | null>(null);

  // 히스토리 덮어쓰기 확인 관련 상태
  const [isOverwriteDialogOpen, setIsOverwriteDialogOpen] = useState(false);
  const [existingHistoryDate, setExistingHistoryDate] = useState<string | null>(null);
  const [existingHistoryId, setExistingHistoryId] = useState<string | null>(null);

  // 히스토리 저장 완료 알림 상태
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);

  // 에러 다이얼로그 상태
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // API 관련 상태
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const currentUserId = "user_001"; // 실제로는 인증된 사용자 ID를 사용
  const API_BASE_URL = import.meta.env.VITE_JOURNAL_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (entriesContainerRef.current) {
      entriesContainerRef.current.scrollTo({ top: entriesContainerRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [entries]);

  // 컴포넌트 마운트 시 사용자 메시지 로드
  useEffect(() => {
    loadUserEntries();
  }, []);

  // API 함수들
  const loadUserEntries = async () => {
    setIsLoadingEntries(true);
    try {
      // 올바른 API 엔드포인트 사용 (/messages?user_id=...)
      const apiUrl = `${API_BASE_URL}/messages?user_id=${currentUserId}&limit=100&offset=0`;
      console.log('API 호출 시도:', apiUrl);
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
      }
      
      const messages = await response.json();
      console.log('API 응답 성공:', messages.length, '개의 메시지');
      
      // API 응답의 created_at을 Date 객체로 변환
      const formattedMessages = messages.map((msg: any) => ({
        ...msg,
        created_at: new Date(msg.created_at)
      }));
      
      // 오늘 날짜의 메시지만 필터링
      const today = new Date();
      today.setHours(0, 0, 0, 0); // 오늘 00:00:00
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1); // 내일 00:00:00
      
      const todayMessages = formattedMessages.filter((msg: any) => {
        const msgDate = new Date(msg.created_at);
        return msgDate >= today && msgDate < tomorrow;
      });
      
      console.log('오늘 날짜 메시지:', todayMessages.length, '개');
      setEntries(todayMessages);
      
    } catch (error) {
      console.error("기록 로드 실패:", error);
      setEntries([]);
    } finally {
      setIsLoadingEntries(false);
    }
  };

  const addEntry = async () => {
    if (!currentEntry.trim()) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUserId,
          content: currentEntry.trim()
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const savedEntry = await response.json();
      
      // API 응답의 created_at을 Date 객체로 변환
      const formattedEntry = {
        ...savedEntry,
        created_at: new Date(savedEntry.created_at)
      };
      
      setEntries(prev => [...prev, formattedEntry]);
      setCurrentEntry("");
      
    } catch (error) {
      console.error("기록 저장 실패:", error);
      setErrorMessage("기록 저장에 실패했습니다. 다시 시도해주세요.");
      setIsErrorDialogOpen(true);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEntry = async (entryId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/${entryId}`, { 
        method: 'DELETE' 
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setEntries(prev => prev.filter(entry => entry.id !== entryId));
      
    } catch (error) {
      console.error("기록 삭제 실패:", error);
      setErrorMessage("기록 삭제에 실패했습니다. 다시 시도해주세요.");
      setIsErrorDialogOpen(true);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addEntry();
    }
  };

  // 삭제 요청 핸들러
  const handleDeleteRequest = (entryId: string) => {
    setDeleteTargetIndex(entries.findIndex(entry => entry.id === entryId));
    setIsDeleteDialogOpen(true);
  };

  // 삭제 확정 핸들러
  const confirmDelete = async () => {
    if (deleteTargetIndex !== null) {
      const entryToDelete = entries[deleteTargetIndex];
      await deleteEntry(entryToDelete.id);
      setIsDeleteDialogOpen(false);
      setDeleteTargetIndex(null);
    }
  };

  const handleOpenAnalysis = () => {
    setDialogStep("confirm");
    setSummaryResult(null);
    setSummaryError(null);
    setLoadingMessage("AI가 기록을 분석하고 있어요...");
    setIsDialogOpen(true);
  };

  const proceedToResult = async () => {
    setDialogStep("loading");
    setSummaryError(null);
    
    try {
      // 로딩 메시지 업데이트
      setLoadingMessage("백엔드 API에 연결하는 중...");
      
      // 약간의 지연을 두어 사용자가 메시지를 볼 수 있도록
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLoadingMessage("사용자 메시지를 가져오는 중...");
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setLoadingMessage("AI가 일기를 분석하고 있어요...");
      
      // FastAPI 백엔드의 요약 API 호출
      const result = await summarizeJournalEntries(currentUserId, API_BASE_URL);
      
      setLoadingMessage("요약을 완성하는 중...");
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setSummaryResult(result);
      setDialogStep("result");
    } catch (error) {
      console.error('요약 생성 실패:', error);
      
      // 에러 발생 시 폴백 요약 생성
      const fallbackSummary = {
        summary: ` ※ AI 요약 서비스에 일시적인 문제가 있어 기본 메시지를 표시합니다. `
      };
      
      setSummaryResult(fallbackSummary);
      setSummaryError(`AI 요약 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
      setDialogStep("result");
    }
  };

  const checkAndSaveToHistory = async () => {
    if (!summaryResult) return;
    
    try {
      // 오늘 날짜의 히스토리가 이미 존재하는지 확인
      const todayDate = new Date().toISOString().split('T')[0];
      const checkResponse = await fetch(`${API_BASE_URL}/summary/check/${currentUserId}`);
      
      if (!checkResponse.ok) {
        throw new Error(`히스토리 확인 실패: ${checkResponse.status}`);
      }
      
      const checkData = await checkResponse.json();
      
      // 이미 오늘 날짜의 히스토리가 존재하는 경우
      if (checkData.exists) {
        setExistingHistoryDate(checkData.record_date);
        // 기존 히스토리 ID 저장 (API 응답에 id가 있다고 가정)
        setExistingHistoryId(checkData.id || null);
        setIsOverwriteDialogOpen(true);
        return;
      }
      
      // 존재하지 않으면 바로 저장
      await performSaveToHistory(false);
      
    } catch (error) {
      console.error("히스토리 확인 실패:", error);
      setErrorMessage("히스토리 확인에 실패했습니다. 다시 시도해주세요.");
      setIsErrorDialogOpen(true);
    }
  };

  const performSaveToHistory = async (isOverwrite: boolean = false) => {
    if (!summaryResult) return;
    
    try {
      // 백엔드 API에서 상세 기록 가져오기
      const response = await fetch(`${API_BASE_URL}/messages/content?user_id=${currentUserId}&limit=100&offset=0`);
      
      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`);
      }
      
      const data = await response.json();
      const combinedContent = data.contents;

      const fullContent = `[요약]\n${summaryResult.summary}\n\n[상세 기록]\n${combinedContent}`;

      let historyResponse;
      
      if (isOverwrite && existingHistoryId) {
        // 덮어쓰기: PUT 요청으로 기존 히스토리 업데이트
        historyResponse = await fetch(`${API_BASE_URL}/history/${existingHistoryId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: currentUserId,
            content: fullContent,
            record_date: new Date().toISOString().split('T')[0],
            tags: []
          })
        });
      } else {
        // 새로 저장: POST 요청
        historyResponse = await fetch(`${API_BASE_URL}/history`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: currentUserId,
            content: fullContent,
            record_date: new Date().toISOString().split('T')[0],
            tags: []
          })
        });
      }

      if (!historyResponse.ok) {
        throw new Error(`HTTP error! status: ${historyResponse.status}`);
      }

      const savedHistory = await historyResponse.json();
      console.log('히스토리 저장 완료:', savedHistory);
      
      // 성공 다이얼로그 표시
      setIsDialogOpen(false);
      setIsOverwriteDialogOpen(false);
      setIsSuccessDialogOpen(true);
      
    } catch (error) {
      console.error("히스토리 저장 실패:", error);
      setErrorMessage("히스토리 저장에 실패했습니다. 다시 시도해주세요.");
      setIsErrorDialogOpen(true);
    }
  };

  // 기본 감정 데이터 제거 (더 이상 사용하지 않음)

  const defaultScrollbarStyle = `
    pr-2 overflow-y-auto
    [&::-webkit-scrollbar]:w-1.5
    [&::-webkit-scrollbar-track]:bg-transparent
    [&::-webkit-scrollbar-thumb]:bg-primary/20
    [&::-webkit-scrollbar-thumb]:rounded-full
    [&::-webkit-scrollbar-thumb]:hover:bg-primary/40
    transition-colors
  `;

  const paperScrollbarStyle = `
    pr-4 overflow-y-auto
    [&::-webkit-scrollbar]:w-1.5
    [&::-webkit-scrollbar-track]:bg-transparent
    [&::-webkit-scrollbar-thumb]:bg-stone-300
    [&::-webkit-scrollbar-thumb]:rounded-full
    [&::-webkit-scrollbar-thumb]:hover:bg-stone-400
    transition-colors
  `;

  const linedPaperStyle = {
    backgroundImage: "linear-gradient(transparent 37px, #e5e7eb 38px)",
    backgroundSize: "100% 38px",
    lineHeight: "38px",
    paddingTop: "0px",
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-4">
      {/* 메인 화면 */}
      <div className="library-card p-6 md:p-8 animate-slide-up border rounded-xl shadow-sm bg-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Feather className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">오늘의 추억</h2>
            <p className="text-sm text-muted-foreground">오늘은 어떤 일이 있었나요?</p>
          </div>
        </div>

        {(isLoadingEntries || entries.length > 0) && (
          <div 
            ref={entriesContainerRef}
            className={`space-y-3 mb-6 max-h-[250px] ${defaultScrollbarStyle}`}
          >
            {isLoadingEntries && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            )}
            
            {entries.map((entry, idx) => (
              <div 
                key={entry.id}
                className="group flex items-start gap-3 p-4 rounded-lg bg-[#ebe5da] shadow-sm border border-[#dcd6cc] animate-in fade-in slide-in-from-left-2 duration-300 border-l-4 border-l-primary relative"
              >
                <span className="text-xs text-stone-500 font-mono mt-1 font-medium shrink-0">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <p className="text-stone-800 text-sm leading-relaxed font-medium whitespace-pre-wrap break-all">
                    {entry.content}
                  </p>
                  <p className="text-xs text-stone-400 mt-1">
                    {entry.created_at.toLocaleString("ko-KR", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDeleteRequest(entry.id)}
                  className="h-6 w-6 shrink-0 text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  aria-label="이 기록 삭제"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="relative group">
          <textarea
            value={currentEntry}
            onChange={(e) => setCurrentEntry(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="이곳에 오늘 있었던 일을 적어보세요..."
            className="w-full h-13 px-4 py-3 rounded-xl bg-secondary/20 border border-input focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none text-foreground placeholder:text-muted-foreground/50 outline-none transition-all duration-300 font-serif"
          />
          <div className="absolute bottom-3 right-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={addEntry} 
              disabled={!currentEntry.trim() || isSaving} 
              className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          {entries.length > 0 && (
            <Button onClick={handleOpenAnalysis} className="gap-2 shadow-md hover:shadow-lg transition-all">
              <Sparkles className="w-4 h-4" />
              요약하기
            </Button>
          )}
        </div>
      </div>

      {/* 삭제 확인 팝업 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm bg-card/95 backdrop-blur-md border border-primary/10 shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              기록 삭제
            </DialogTitle>
            <DialogDescription className="pt-2">
              이 메시지를 정말 삭제하시겠습니까?<br/>
              삭제된 기록은 복구할 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              아니요
            </Button>
            <Button variant="destructive" onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              네, 삭제할래요
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 히스토리 덮어쓰기 확인 팝업 */}
      <Dialog open={isOverwriteDialogOpen} onOpenChange={setIsOverwriteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-md border border-primary/10 shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <HelpCircle className="w-5 h-5" />
              히스토리 덮어쓰기
            </DialogTitle>
            <DialogDescription className="pt-2">
              {existingHistoryDate && (
                <>
                  <span className="font-semibold text-foreground">
                    {new Date(existingHistoryDate).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </span>
                  에 이미 저장된 히스토리가 있습니다.
                  <br/><br/>
                  기존 내용을 덮어쓰시겠습니까?
                  <br/>
                  <span className="text-amber-600 text-sm">덮어쓴 내용은 복구할 수 없습니다.</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => setIsOverwriteDialogOpen(false)}>
              취소
            </Button>
            <Button 
              variant="default" 
              onClick={() => performSaveToHistory(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              네, 덮어쓸래요
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 히스토리 저장 완료 팝업 */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-md border border-primary/10 shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <Sparkles className="w-5 h-5" />
              저장 완료
            </DialogTitle>
            <DialogDescription className="pt-4 pb-2">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center animate-in zoom-in-95 duration-300">
                  <Sparkles className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-center text-base text-foreground font-medium">
                  히스토리에 성공적으로 등록되었습니다!
                </p>
                <p className="text-center text-sm text-muted-foreground">
                  오늘의 소중한 기록이 저장되었어요.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button 
              variant="default" 
              onClick={() => setIsSuccessDialogOpen(false)}
              className="w-full bg-primary hover:bg-primary/90"
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 에러 팝업 */}
      <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-md border border-red-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <X className="w-5 h-5" />
              오류 발생
            </DialogTitle>
            <DialogDescription className="pt-4 pb-2">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center animate-in zoom-in-95 duration-300">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-center text-base text-foreground font-medium">
                  {errorMessage}
                </p>
                <p className="text-center text-sm text-muted-foreground">
                  잠시 후 다시 시도해주세요.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button 
              variant="default" 
              onClick={() => setIsErrorDialogOpen(false)}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 기존 요약 팝업 (Dialog) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent 
          className={`
            bg-transparent border-none shadow-none p-0 
            transition-all duration-300 ease-in-out flex flex-col items-center justify-center
            ${dialogStep === "result" ? "sm:max-w-2xl h-[85vh]" : "sm:max-w-lg h-auto"}
          `}
        >
          {dialogStep === "confirm" && (
            <div className="bg-card/95 backdrop-blur-md border border-primary/20 shadow-2xl rounded-lg p-6 w-full animate-in fade-in zoom-in-95 duration-300 space-y-4">
              <DialogHeader>
                <DialogTitle className="font-display text-xl flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  기록 요약
                </DialogTitle>
                <DialogDescription className="text-base pt-2">
                  오늘 작성하신 {entries.length}개의 기록을 바탕으로 AI가 요약을 진행할까요?
                  {summaryError && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                      {summaryError}
                    </div>
                  )}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-0 mt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-primary/20 hover:bg-primary/5 hover:text-primary">
                  아니요, 더 쓸래요
                </Button>
                <Button onClick={proceedToResult} className="bg-primary text-primary-foreground shadow-sm gap-2">
                  <Sparkles className="w-4 h-4" />
                  네, 요약해주세요
                </Button>
              </DialogFooter>
            </div>
          )}

          {dialogStep === "loading" && (
            <div className="bg-card/95 backdrop-blur-md border border-primary/20 shadow-2xl rounded-lg p-10 w-full flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in-95 duration-500">
              <div className="relative">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <Sparkles className="w-4 h-4 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-50 animate-pulse" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-lg font-medium font-display text-foreground">{loadingMessage}</p>
                <p className="text-sm text-muted-foreground animate-pulse">당신의 소중한 하루를 정리하는 중입니다.</p>
                <p className="text-xs text-muted-foreground/70 mt-2">잠시만 기다려주세요. 보통 10-30초 정도 소요됩니다.</p>
              </div>
            </div>
          )}

          {dialogStep === "result" && (
            <div className="relative w-full h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              <div className="paper-texture bg-[#fdfbf7] w-full h-full rounded-r-lg shadow-2xl flex flex-col relative overflow-hidden text-stone-800">
                <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/10 to-transparent pointer-events-none z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-black/5 to-transparent pointer-events-none z-10" />

                <div className="h-full flex flex-col relative p-6 pl-8 md:p-8 md:pl-10">
                  <div className="shrink-0 border-b border-stone-300 pb-4 mb-1">
                    <h3 className="font-serif text-stone-500 text-base">
                      {new Date().toLocaleDateString("ko-KR", {
                        year: "numeric", month: "long", day: "numeric", weekday: "long",
                      })}
                    </h3>
                    {summaryError && (
                      <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-700 text-xs">
                        {summaryError}
                      </div>
                    )}
                  </div>

                  <div className={`flex-1 ${paperScrollbarStyle}`} style={{ marginTop: '10px' }}>
                    <div 
                      className="font-handwriting text-xl text-stone-800 tracking-wide whitespace-pre-wrap min-h-full"
                      style={linedPaperStyle}
                    >
                      {summaryResult?.summary || "요약을 불러오는 중입니다..."}
                    </div>
                  </div>

                  <div className="shrink-0 pt-4 mt-2 border-t border-stone-300/50 flex items-center justify-between text-stone-500 text-sm font-serif">
                    <span>총 {summaryResult?.message_count || entries.length}개의 기록</span>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setIsDialogOpen(false)} className="hover:bg-stone-200/50 hover:text-stone-800">
                        덮기
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={checkAndSaveToHistory}
                        className="bg-stone-800 text-[#fdfbf7] hover:bg-stone-700 shadow-sm font-sans"
                      >
                        히스토리에 등록
                      </Button>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};