import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JournalEntry as JournalEntryType } from "../services/journalApi";

interface JournalEntryProps {
  entry: JournalEntryType;
  index: number;
  onDelete: (entryId: string) => void;
}

export const JournalEntry = ({ entry, index, onDelete }: JournalEntryProps) => {
  return (
    <div 
      key={entry.id}
      className="group flex items-start gap-3 p-4 rounded-lg bg-[#ebe5da] shadow-sm border border-[#dcd6cc] animate-in fade-in slide-in-from-left-2 duration-300 border-l-4 border-l-primary relative"
    >
      <span className="text-xs text-stone-500 font-mono mt-1 font-medium shrink-0">
        {String(index + 1).padStart(2, "0")}
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
        onClick={() => onDelete(entry.id)}
        className="h-6 w-6 shrink-0 text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
        aria-label="이 기록 삭제"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};