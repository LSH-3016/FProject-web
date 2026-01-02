import { useState, useEffect, useRef } from "react";
import { Sparkles, Feather, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddItemModal } from "@/components/library/AddItemModal";

// 커스텀 훅들
import { useJournalEntries } from "./hooks/useJournalEntries";
import { useJournalSummary } from "./hooks/useJournalSummary";
import { useFileUpload } from "./hooks/useFileUpload";

// 컴포넌트들
import { JournalEntry } from "./components/JournalEntry";
import { JournalInput } from "./components/JournalInput";
import { UploadMenu } from "./components/UploadMenu";

// 다이얼로그들
import { AnswerDialog } from "./dialogs/AnswerDialog";
import { DeleteConfirmDialog } from "./dialogs/DeleteConfirmDialog";
import { ErrorDialog } from "./dialogs/ErrorDialog";
import { SummaryDialog } from "./dialogs/SummaryDialog";
import { OverwriteDialog, SavingDialog, SuccessDialog } from "./dialogs/HistoryDialogs";

export const JournalBook = () => {
  const entriesContainerRef = useRef<HTMLDivElement>(null);
  
  // 삭제 관련 상태
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteTargetIndex, setDeleteTargetIndex] = useState<number | null>(null);

  // 답변 팝업 상태
  const [isAnswerDialogOpen, setIsAnswerDialogOpen] = useState(false);
  const [answerContent, setAnswerContent] = useState<string>("");

  // 에러 다이얼로그 상태
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // API 관련 상태
  const currentUserId = "user_001"; // 실제로는 인증된 사용자 ID를 사용
  const API_BASE_URL = import.meta.env.VITE_JOURNAL_API_URL || "http://localhost:8000";
  const LIBRARY_API_URL = import.meta.env.VITE_LIBRARY_API_URL || "http://192.168.0.138:8000/api/v1";

  // 커스텀 훅 사용
  const {
    entries,
    isLoadingEntries,
    isSaving,
    addEntry,
    deleteEntry
  } = useJournalEntries(currentUserId, API_BASE_URL);

  const {
    isDialogOpen,
    setIsDialogOpen,
    dialogStep,
    summaryResult,
    summaryError,
    loadingMessage,
    isOverwriteDialogOpen,
    setIsOverwriteDialogOpen,
    existingHistoryDate,
    existingHistoryId,
    isSuccessDialogOpen,
    setIsSuccessDialogOpen,
    isSavingHistory,
    selectedImage,
    existingS3Key,
    existingImageUrl,
    isCheckingS3Key,
    handleOpenAnalysis,
    proceedToResult,
    checkAndSaveToHistory,
    performSaveToHistory,
    handleImageSelect,
    handleRemoveImage
  } = useJournalSummary(currentUserId, API_BASE_URL, LIBRARY_API_URL);

  const {
    isUploadModalOpen,
    setIsUploadModalOpen,
    selectedUploadType,
    setSelectedUploadType,
    isUploadMenuOpen,
    setIsUploadMenuOpen,
    uploadMenuRef,
    handleUploadClick,
    handleAddItem,
    getTypeLabel
  } = useFileUpload();

  // 스크롤 효과
  useEffect(() => {
    if (entriesContainerRef.current) {
      entriesContainerRef.current.scrollTo({ top: entriesContainerRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [entries]);

  // 입력 처리 함수
  const handleEntrySubmit = async (content: string) => {
    try {
      const result = await addEntry(content);
      
      if (result.type === "answer") {
        // 답변인 경우: 팝업으로 답변 표시
        setAnswerContent(result.content);
        setIsAnswerDialogOpen(true);
      } else if (result.type === "unknown") {
        // 알 수 없는 타입인 경우
        console.warn("알 수 없는 응답 타입:", result.type);
        setErrorMessage("처리 결과를 확인할 수 없습니다.");
        setIsErrorDialogOpen(true);
      }
      // data 타입인 경우는 addEntry에서 이미 처리됨
      
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "입력 처리에 실패했습니다.");
      setIsErrorDialogOpen(true);
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
      try {
        await deleteEntry(entryToDelete.id);
        setIsDeleteDialogOpen(false);
        setDeleteTargetIndex(null);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "기록 삭제에 실패했습니다.");
        setIsErrorDialogOpen(true);
      }
    }
  };

  // 히스토리 덮어쓰기 핸들러
  const handleOverwriteConfirm = async () => {
    console.log('덮어쓰기 버튼 클릭 - existingHistoryId:', existingHistoryId);
    
    let existingS3Key: string | null = null;
    if (existingHistoryId) {
      try {
        const checkUrl = `${API_BASE_URL}/history/${existingHistoryId}/check-s3`;
        console.log('check-s3 API 호출:', checkUrl);
        
        const checkResponse = await fetch(checkUrl);
        if (checkResponse.ok) {
          const checkData = await checkResponse.json();
          existingS3Key = checkData.s3_key;
          console.log('덮어쓰기 전 s3_key 확인:', existingS3Key);
        }
      } catch (error) {
        console.error('s3_key 확인 실패:', error);
      }
    }
    
    await performSaveToHistory(true, existingS3Key);
  };

  const defaultScrollbarStyle = `
    pr-2 overflow-y-auto
    [&::-webkit-scrollbar]:w-1.5
    [&::-webkit-scrollbar-track]:bg-transparent
    [&::-webkit-scrollbar-thumb]:bg-primary/20
    [&::-webkit-scrollbar-thumb]:rounded-full
    [&::-webkit-scrollbar-thumb]:hover:bg-primary/40
    transition-colors
  `;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-4">
      {/* 메인 화면 */}
      <div 
        className="library-card p-6 md:p-8 animate-slide-up border rounded-xl bg-card"
        style={{
          boxShadow: `
            0 20px 40px -10px rgba(0, 0, 0, 0.3),
            0 8px 16px -6px rgba(0, 0, 0, 0.2)
          `
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Feather className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">오늘의 추억 기록</h2>
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
              <JournalEntry
                key={entry.id}
                entry={entry}
                index={idx}
                onDelete={handleDeleteRequest}
              />
            ))}
          </div>
        )}

        <JournalInput onSubmit={handleEntrySubmit} isSaving={isSaving} />

        <div className="mt-6 flex justify-between items-center">
          <UploadMenu
            isOpen={isUploadMenuOpen}
            onToggle={() => setIsUploadMenuOpen(!isUploadMenuOpen)}
            onUploadClick={handleUploadClick}
            menuRef={uploadMenuRef}
          />

          <Button 
            onClick={handleOpenAnalysis} 
            className="gap-2 shadow-md hover:shadow-lg transition-all"
            disabled={entries.length === 0}
          >
            <Sparkles className="w-4 h-4" />
            요약하기
          </Button>
        </div>
      </div>

      {/* 모든 다이얼로그들 */}
      <AnswerDialog
        isOpen={isAnswerDialogOpen}
        onClose={() => setIsAnswerDialogOpen(false)}
        content={answerContent}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
      />

      <OverwriteDialog
        isOpen={isOverwriteDialogOpen}
        onClose={() => setIsOverwriteDialogOpen(false)}
        onConfirm={handleOverwriteConfirm}
        existingHistoryDate={existingHistoryDate}
      />

      <SavingDialog isOpen={isSavingHistory} />

      <SuccessDialog
        isOpen={isSuccessDialogOpen}
        onClose={() => setIsSuccessDialogOpen(false)}
      />

      <ErrorDialog
        isOpen={isErrorDialogOpen}
        onClose={() => setIsErrorDialogOpen(false)}
        message={errorMessage}
      />

      <SummaryDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        dialogStep={dialogStep}
        summaryResult={summaryResult}
        summaryError={summaryError}
        loadingMessage={loadingMessage}
        entriesCount={entries.length}
        selectedImage={selectedImage}
        existingS3Key={existingS3Key}
        existingImageUrl={existingImageUrl}
        isCheckingS3Key={isCheckingS3Key}
        onProceedToResult={proceedToResult}
        onSaveToHistory={checkAndSaveToHistory}
        onImageSelect={handleImageSelect}
        onRemoveImage={handleRemoveImage}
      />

      {/* 파일 업로드 모달 */}
      {selectedUploadType && (
        <AddItemModal
          isOpen={isUploadModalOpen}
          onClose={() => {
            setIsUploadModalOpen(false);
            setSelectedUploadType(null);
          }}
          itemType={selectedUploadType}
          typeLabel={getTypeLabel(selectedUploadType)}
          onAdd={handleAddItem}
        />
      )}
    </div>
  );
};