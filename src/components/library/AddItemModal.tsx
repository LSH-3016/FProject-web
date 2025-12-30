import { useState, useRef } from "react";
import { Globe, Lock, Plus, Upload, X, FileIcon, ImageIcon, VideoIcon, FileTextIcon } from "lucide-react";
import { LibraryItemType, LibraryItemVisibility } from "@/types/library";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemType: LibraryItemType;
  typeLabel: string;
  onAdd: (item: any) => void;
}

export function AddItemModal({
  isOpen,
  onClose,
  itemType,
  typeLabel,
  onAdd,
}: AddItemModalProps) {
  const [name, setName] = useState("");
  const [visibility, setVisibility] = useState<LibraryItemVisibility>("private");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // 파일 타입별 아이콘
  const getFileIcon = (type: LibraryItemType) => {
    switch (type) {
      case "image": return <ImageIcon className="w-5 h-5" />;
      case "video": return <VideoIcon className="w-5 h-5" />;
      case "document": return <FileTextIcon className="w-5 h-5" />;
      default: return <FileIcon className="w-5 h-5" />;
    }
  };

  // 파일 타입별 허용 확장자
  const getAcceptedTypes = (type: LibraryItemType): string => {
    switch (type) {
      case "image":
        return "image/*";
      case "video":
        return "video/*";
      case "document":
        return ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf";
      default:
        return "*/*";
    }
  };

  // 파일 선택 처리
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!name) {
        // 파일명에서 확장자 제거하여 기본 이름 설정
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        setName(nameWithoutExt);
      }
    }
  };

  // 파일 제거
  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 파일 크기 포맷
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  // 폼 제출 처리
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "오류",
        description: "파일 이름을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedFile) {
      toast({
        title: "오류",
        description: "업로드할 파일을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // API 서비스를 통해 파일 업로드
      const uploadedItem = await apiService.uploadFile(
        selectedFile,
        name.trim(),
        visibility,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      toast({
        title: "업로드 완료",
        description: `${name}이(가) 성공적으로 업로드되었습니다.`,
      });

      // 부모 컴포넌트에 새 아이템 전달
      onAdd(uploadedItem);
      
      // 폼 초기화
      setName("");
      setVisibility("private");
      setSelectedFile(null);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      onClose();
    } catch (error) {
      console.error("업로드 실패:", error);
      toast({
        title: "업로드 실패",
        description: error instanceof Error ? error.message : "파일 업로드 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // 모달 닫기 처리
  const handleClose = () => {
    if (isUploading) {
      toast({
        title: "업로드 중",
        description: "파일 업로드가 진행 중입니다. 잠시만 기다려주세요.",
        variant: "destructive",
      });
      return;
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md paper-texture border border-ink/10">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif flex items-center gap-2 text-ink">
            <Plus className="w-5 h-5 text-gold" />
            새 {typeLabel} 추가
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* 파일 선택 영역 */}
          <div className="space-y-2">
            <Label className="text-ink/80">파일 선택</Label>
            
            {!selectedFile ? (
              <div className="border-2 border-dashed border-ink/20 rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={getAcceptedTypes(itemType)}
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={isUploading}
                />
                <div className="flex flex-col items-center gap-2">
                  {getFileIcon(itemType)}
                  <p className="text-sm text-ink/60">
                    클릭하여 {typeLabel} 파일을 선택하세요
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    파일 선택
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border border-ink/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getFileIcon(itemType)}
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-ink/60">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                  {!isUploading && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFile}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 파일 이름 입력 */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-ink/80">
              표시 이름
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={`${typeLabel} 이름을 입력하세요`}
              className="bg-background"
              disabled={isUploading}
            />
          </div>

          {/* 공개 상태 선택 */}
          <div className="space-y-2">
            <Label htmlFor="visibility" className="text-ink/80">
              공개 상태
            </Label>
            <Select 
              value={visibility} 
              onValueChange={(value) => setVisibility(value as LibraryItemVisibility)}
              disabled={isUploading}
            >
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-ink/10">
                <SelectItem value="private">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Private
                  </div>
                </SelectItem>
                <SelectItem value="public">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Public
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 업로드 진행률 */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-ink/80">업로드 진행률</span>
                <span className="text-ink/80">{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* 버튼 영역 */}
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1" 
              onClick={handleClose}
              disabled={isUploading}
            >
              취소
            </Button>
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={!name.trim() || !selectedFile || isUploading}
            >
              {isUploading ? "업로드 중..." : "추가"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}