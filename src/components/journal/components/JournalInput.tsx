import { useState, KeyboardEvent } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JournalInputProps {
  onSubmit: (content: string) => Promise<void>;
  isSaving: boolean;
}

export const JournalInput = ({ onSubmit, isSaving }: JournalInputProps) => {
  const [currentEntry, setCurrentEntry] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!currentEntry.trim()) return;
    
    try {
      await onSubmit(currentEntry);
      setCurrentEntry("");
    } catch (error) {
      console.error("입력 처리 실패:", error);
    }
  };

  return (
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
          onClick={handleSubmit} 
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
  );
};