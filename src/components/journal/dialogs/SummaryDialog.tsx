import { useRef } from "react";
import { HelpCircle, Loader2, Sparkles, Image, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { SummaryResult } from "@/lib/bedrock";

interface SummaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  dialogStep: "confirm" | "loading" | "result";
  summaryResult: SummaryResult | null;
  summaryError: string | null;
  loadingMessage: string;
  entriesCount: number;
  selectedImage: File | null;
  existingS3Key: string | null;
  isCheckingS3Key: boolean;
  onProceedToResult: () => void;
  onSaveToHistory: () => void;
  onImageSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}

export const SummaryDialog = ({
  isOpen,
  onClose,
  dialogStep,
  summaryResult,
  summaryError,
  loadingMessage,
  entriesCount,
  selectedImage,
  existingS3Key,
  isCheckingS3Key,
  onProceedToResult,
  onSaveToHistory,
  onImageSelect,
  onRemoveImage
}: SummaryDialogProps) => {
  const imageInputRef = useRef<HTMLInputElement>(null);

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
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                오늘 작성하신 {entriesCount}개의 기록을 바탕으로 AI가 요약을 진행할까요?
                {summaryError && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                    {summaryError}
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button variant="outline" onClick={onClose} className="border-primary/20 hover:bg-primary/5 hover:text-primary">
                아니요, 더 쓸래요
              </Button>
              <Button onClick={onProceedToResult} className="bg-primary text-primary-foreground shadow-sm gap-2">
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
                  
                  {selectedImage && (
                    <div className="mt-6 space-y-2">
                      <p className="text-sm font-serif text-stone-600">첨부된 사진</p>
                      <div className="relative group inline-block">
                        <img 
                          src={URL.createObjectURL(selectedImage)} 
                          alt="선택된 사진"
                          className="w-32 h-32 object-cover rounded border border-stone-300"
                        />
                        <button
                          onClick={onRemoveImage}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* 기존 사진 미리보기 - 추후 API 구현 후 활성화 예정
                  {existingS3Key && !selectedImage && (
                    <div className="mt-6 space-y-2">
                      <p className="text-sm font-serif text-stone-600">기존 첨부 사진</p>
                      <div className="inline-block p-3 bg-stone-100 rounded border border-stone-300">
                        <div className="flex items-center gap-2 text-stone-600">
                          <Image className="w-4 h-4" />
                          <span className="text-sm">사진이 첨부되어 있습니다</span>
                        </div>
                      </div>
                    </div>
                  )}
                  */}
                </div>

                <div className="shrink-0 pt-4 mt-2 border-t border-stone-300/50 flex items-center justify-between text-stone-500 text-sm font-serif">
                  <span>총 {summaryResult?.message_count || entriesCount}개의 기록</span>
                  <div className="flex gap-2">
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={onImageSelect}
                      className="hidden"
                    />
                    
                    {/* s3_key 확인 중일 때 로딩 표시 */}
                    {isCheckingS3Key ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        disabled
                        className="hover:bg-stone-200/50 hover:text-stone-800"
                      >
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        확인중...
                      </Button>
                    ) : existingS3Key ? (
                      /* 기존 사진이 있는 경우 - 사진 변경 버튼 (비활성화) */
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        disabled
                        className="hover:bg-stone-200/50 hover:text-stone-800 opacity-50 cursor-not-allowed"
                        title="사진 변경 기능은 추후 지원 예정입니다"
                      >
                        <Image className="w-4 h-4 mr-1" />
                        사진변경
                      </Button>
                    ) : (
                      /* 기존 사진이 없는 경우 - 사진 추가 버튼 */
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => imageInputRef.current?.click()}
                        className="hover:bg-stone-200/50 hover:text-stone-800"
                      >
                        <Image className="w-4 h-4 mr-1" />
                        사진추가
                      </Button>
                    )}
                    
                    <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-stone-200/50 hover:text-stone-800">
                      덮기
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={onSaveToHistory}
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
  );
};