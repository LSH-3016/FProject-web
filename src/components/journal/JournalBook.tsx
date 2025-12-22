import { useState, KeyboardEvent, useEffect, useRef } from "react";
import { Send, Sparkles, Feather } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmotionCard } from "@/components/journal/EmotionCard";

// export default 대신 'export const'를 사용하여 외부에서 { JournalBook }으로 부를 수 있게 합니다.
export const JournalBook = () => {
  const [entries, setEntries] = useState<string[]>([]);
  const [currentEntry, setCurrentEntry] = useState("");
  const [showAnalysis, setShowAnalysis] = useState(false);
  const entriesContainerRef = useRef<HTMLDivElement>(null);

  // 스크롤 로직 개선: behavior를 'smooth'로 하여 부드럽게 이동
  useEffect(() => {
    if (entriesContainerRef.current) {
      entriesContainerRef.current.scrollTo({
        top: entriesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [entries]);

  const addEntry = () => {
    if (currentEntry.trim()) {
      setEntries((prev) => [...prev, currentEntry.trim()]);
      setCurrentEntry("");
      // 새로운 글을 쓰면 분석 결과를 초기화하고 싶을 경우 아래 주석 해제
      // setShowAnalysis(false); 
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // 한글 입력 시 중복 이벤트 발생 방지 (isComposing 체크)
    if (e.nativeEvent.isComposing) return;

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addEntry();
    }
  };

  const mockEmotions = [
    { type: "positive" as const, label: "평온", percentage: 45 },
    { type: "neutral" as const, label: "그리움", percentage: 35 },
    { type: "negative" as const, label: "쓸쓸함", percentage: 20 },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 p-4">
      <div className="library-card p-6 md:p-8 animate-slide-up border rounded-xl shadow-sm bg-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Feather className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">오늘을 기록하세요</h2>
            <p className="text-sm text-muted-foreground">간편하게 오늘을 기록해보세요</p>
          </div>
        </div>

        {entries.length > 0 && (
          <div 
            ref={entriesContainerRef}
            className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted"
          >
            {entries.map((entry, idx) => (
              <div 
                key={`entry-${idx}`}
                className="flex items-start gap-3 p-3 rounded-lg bg-accent/30 animate-in fade-in slide-in-from-left-2 duration-300 border-l-4 border-primary"
              >
                <span className="text-xs text-muted-foreground font-mono mt-1 opacity-50">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <p className="text-foreground text-sm flex-1 leading-relaxed">{entry}</p>
              </div>
            ))}
          </div>
        )}

        <div className="relative group">
          <textarea
            value={currentEntry}
            onChange={(e) => setCurrentEntry(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="여기에 적어보세요..."
            className="w-full h-32 px-4 py-3 rounded-xl bg-secondary/20 border border-input focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none text-foreground placeholder:text-muted-foreground/50 outline-none transition-all duration-300 font-serif"
          />
          <div className="absolute bottom-3 right-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={addEntry}
              disabled={!currentEntry.trim()}
              className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {entries.length > 0 && (
          <div className="mt-6 flex justify-end">
            <Button onClick={() => setShowAnalysis(true)} className="gap-2 shadow-md hover:shadow-lg transition-all">
              <Sparkles className="w-4 h-4" />
              기억 분석하기
            </Button>
          </div>
        )}
      </div>

      {showAnalysis && (
        <div className="animate-in fade-in zoom-in-95 duration-500">
          <EmotionCard
            title="오늘의 기억 분석"
            emotions={mockEmotions}
            summary="오늘의 기록에서는 잔잔한 평온함이 느껴집니다. 과거를 그리워하는 마음과 함께, 고요한 쓸쓸함도 함께 담겨 있네요. 이 모든 감정이 모여 당신만의 하루가 됩니다."
          >
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">총 {entries.length}개의 기록</span>
                <Button variant="link" size="sm" className="px-0 h-auto text-primary">
                  책장에 보관하기
                </Button>
              </div>
            </div>
          </EmotionCard>
        </div>
      )}
    </div>
  );
};