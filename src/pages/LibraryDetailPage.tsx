import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MoreVertical, Plus, Trash2, X, Eye, EyeOff } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { LibraryItemCard } from "@/components/library/LibraryItemCard";
import { DeleteConfirmModal } from "@/components/library/DeleteConfirmModal";
import { AddItemModal } from "@/components/library/AddItemModal";
import { useLibraryContext } from "@/contexts/LibraryContext";
import { LibraryItem, LibraryItemType, LibraryItemVisibility, LibraryTypeConfig } from "@/types/library";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const libraryTypeConfigs: LibraryTypeConfig[] = [
  {
    type: "image",
    label: "사진",
    icon: "Image",
    color: "type-image",
    route: "/library/image",
  },
  {
    type: "document",
    label: "문서",
    icon: "FileText",
    color: "type-document",
    route: "/library/document",
  },
  {
    type: "file",
    label: "파일",
    icon: "Folder",
    color: "type-file",
    route: "/library/file",
  },
  {
    type: "video",
    label: "동영상",
    icon: "Video",
    color: "type-video",
    route: "/library/video",
  },
];

const LibraryDetailPage = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, isCognitoConfigured } = useAuth();
  const { displayName, isLoading: userLoading, userId } = useCurrentUser();
  const { getItemsByType, deleteItems, addItem, updateItemsVisibility } = useLibraryContext();
  const menuRef = useRef<HTMLDivElement | null>(null);

  const itemType = type as LibraryItemType;
  const config = libraryTypeConfigs.find((item) => item.type === itemType);

  // 프로필 정보 상태 (백엔드 API에서 가져옴)
  const [profileNickname, setProfileNickname] = useState<string>("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // 프로필 정보 로드
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
        if (!clientId) {
          setIsLoadingProfile(false);
          return;
        }

        const cognitoKeys = Object.keys(localStorage).filter(key => 
          key.includes('CognitoIdentityServiceProvider') && 
          key.includes(clientId) &&
          key.endsWith('.idToken')
        );

        if (cognitoKeys.length === 0) {
          setIsLoadingProfile(false);
          return;
        }

        const token = localStorage.getItem(cognitoKeys[0]);
        if (!token) {
          setIsLoadingProfile(false);
          return;
        }

        const authApiUrl = `${import.meta.env.VITE_API_URL || "https://api.aws11.shop"}${import.meta.env.AUTH_API_PREFIX || "/auth"}`;
        const response = await fetch(`${authApiUrl}/user/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const profile = data.data;
          setProfileNickname(profile.nickname || profile.preferred_username || '');
        }
      } catch (error) {
        console.error('LibraryDetailPage - 프로필 로드 오류:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [userId]);

  // 표시할 닉네임 (API 우선, 로딩 중에는 "사용자")
  const userDisplayName = isLoadingProfile ? "사용자" : (profileNickname || displayName || "사용자");

  // 인증 확인 및 리다이렉트
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth', { replace: true });
      return;
    }
  }, [isAuthenticated, authLoading, navigate]);

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<LibraryItem | null>(null);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
  const [isVisibilityMode, setIsVisibilityMode] = useState(false);

  const items = useMemo(() => getItemsByType(itemType), [getItemsByType, itemType]);

  useEffect(() => {
    // 메뉴 외부 클릭 시 닫기.
    if (!isMenuOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  if (!config) {
    navigate("/library");
    return null;
  }

  // 로딩 상태 처리
  if (authLoading || userLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
            <p className="font-serif text-muted-foreground">{config.label}을 불러오는 중...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // 인증되지 않은 경우 (리다이렉트 전까지의 fallback)
  if (!isAuthenticated) {
    return null;
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]));
  };

  const handleEnterDeleteMode = () => {
    setIsMenuOpen(false);
    setIsSelectionMode(true);
    setIsVisibilityMode(false);
    setSelectedIds([]);
  };

  const handleEnterVisibilityMode = () => {
    setIsMenuOpen(false);
    setIsSelectionMode(true);
    setIsVisibilityMode(true);
    setSelectedIds([]);
  };

  const handleCancelSelection = () => {
    setIsSelectionMode(false);
    setIsVisibilityMode(false);
    setSelectedIds([]);
  };

  const handleDeleteConfirm = () => {
    deleteItems(selectedIds);
    setIsSelectionMode(false);
    setIsVisibilityMode(false);
    setSelectedIds([]);
  };

  const handleVisibilityChange = async (newVisibility: LibraryItemVisibility) => {
    if (selectedIds.length === 0 || isTogglingVisibility) return;
    
    try {
      setIsTogglingVisibility(true);
      await updateItemsVisibility(selectedIds, newVisibility);
      setIsSelectionMode(false);
      setIsVisibilityMode(false);
      setSelectedIds([]);
    } catch (error) {
      console.error('Visibility 변경 실패:', error);
    } finally {
      setIsTogglingVisibility(false);
    }
  };

  const handleToggleSelectedVisibility = async () => {
    if (selectedIds.length === 0 || isTogglingVisibility) return;
    
    try {
      setIsTogglingVisibility(true);
      
      // 선택된 각 아이템의 현재 visibility를 반대로 변경
      for (const itemId of selectedIds) {
        const item = items.find(item => item.id === itemId);
        if (item) {
          const newVisibility: LibraryItemVisibility = item.visibility === 'public' ? 'private' : 'public';
          await updateItemsVisibility([itemId], newVisibility);
        }
      }
      
      setIsSelectionMode(false);
      setIsVisibilityMode(false);
      setSelectedIds([]);
    } catch (error) {
      console.error('Visibility 토글 실패:', error);
    } finally {
      setIsTogglingVisibility(false);
    }
  };

  const handleAddItem = (item: LibraryItem) => {
    addItem(item);
  };

  const handleOpenPreview = (item: LibraryItem) => {
    if (item.type === "image" || item.type === "video") {
      // 이미지/영상만 크게 미리보기로 열기.
      setPreviewItem(item);
    }
  };

  const handleToggleAllVisibility = async () => {
    if (items.length === 0 || isTogglingVisibility) return;
    
    try {
      setIsTogglingVisibility(true);
      
      // 현재 아이템들의 visibility 상태 확인
      const publicItems = items.filter(item => item.visibility === 'public');
      const privateItems = items.filter(item => item.visibility === 'private');
      
      // 대부분이 public이면 private으로, 대부분이 private이면 public으로
      const shouldMakePublic = privateItems.length >= publicItems.length;
      const newVisibility: LibraryItemVisibility = shouldMakePublic ? 'public' : 'private';
      
      // 모든 아이템의 visibility 변경
      const allItemIds = items.map(item => item.id);
      await updateItemsVisibility(allItemIds, newVisibility);
      
    } catch (error) {
      console.error('Visibility 변경 실패:', error);
    } finally {
      setIsTogglingVisibility(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-ink hover:text-gold transition-colors"
                onClick={() => navigate("/library")}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="font-serif text-2xl text-primary gold-accent">{config.label}</h1>
                <p className="font-handwriting text-base text-muted-foreground">
                  {userDisplayName}님의 {items.length}개 항목
                  {!isCognitoConfigured && <span className="text-yellow-600 ml-2">(데모 모드)</span>}
                </p>
              </div>
            </div>

            {isSelectionMode ? (
              <div className="flex items-center gap-3">
                <span className="font-serif text-sm text-ink">
                  선택 중 ({selectedIds.length}개)
                </span>
                <button
                  type="button"
                  className="vintage-btn px-4 py-2 rounded-md text-sm font-serif text-sepia hover:text-gold transition-colors"
                  onClick={handleCancelSelection}
                >
                  <X className="w-4 h-4 inline-block mr-1" />
                  취소
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {/* Visibility Toggle Button */}
                <button
                  type="button"
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-ink hover:text-gold transition-colors"
                  onClick={handleEnterVisibilityMode}
                  disabled={items.length === 0}
                  title="아이템 공개/비공개 설정"
                >
                  <Eye className="w-5 h-5" />
                </button>
                
                {/* Dropdown Menu Button */}
                <div ref={menuRef} className="relative">
                  <button
                    type="button"
                    className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-ink hover:text-gold transition-colors"
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {isMenuOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-2 w-40 rounded-md border border-ink/10 bg-background/95 shadow-page backdrop-blur-sm z-20"
                    >
                      <button
                        type="button"
                        className="w-full text-left px-4 py-2 text-sm font-serif text-sepia hover:bg-gold/10 hover:text-gold transition-colors"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsAddModalOpen(true);
                        }}
                      >
                        <Plus className="w-4 h-4 inline-block mr-2" />
                        추가
                      </button>
                      <button
                        type="button"
                        className="w-full text-left px-4 py-2 text-sm font-serif text-red-800 hover:bg-red-100/50 hover:text-red-900 transition-colors"
                        onClick={handleEnterDeleteMode}
                      >
                        <Trash2 className="w-4 h-4 inline-block mr-2" />
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </header>

          {items.length === 0 ? (
            <div className="text-center py-20 paper-texture rounded-lg">
              <Plus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="font-serif text-xl text-ink mb-2">항목이 없습니다</h2>
              <p className="font-handwriting text-base text-muted-foreground mb-4">
                새 {config.label}을(를) 추가해보세요
              </p>
              <button
                type="button"
                className="vintage-btn px-5 py-3 rounded-md font-serif text-sepia hover:text-gold transition-colors"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus className="w-4 h-4 inline-block mr-2" />
                추가하기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item, index) => (
                <div key={item.id} style={{ animationDelay: `${index * 0.05}s` }}>
                  <LibraryItemCard
                    item={item}
                    isSelectionMode={isSelectionMode}
                    isSelected={selectedIds.includes(item.id)}
                    onSelect={handleToggleSelect}
                    onOpen={handleOpenPreview}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isSelectionMode && selectedIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 border-t border-ink/10 p-4 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto flex justify-end gap-3">
            {isVisibilityMode ? (
              <button
                type="button"
                className={`vintage-btn px-5 py-3 rounded-md font-serif transition-colors ${
                  isTogglingVisibility 
                    ? 'text-ink/50 cursor-not-allowed' 
                    : 'text-sepia hover:text-gold'
                }`}
                onClick={handleToggleSelectedVisibility}
                disabled={isTogglingVisibility}
              >
                <Eye className="w-4 h-4 inline-block mr-2" />
                {selectedIds.length}개 변경
              </button>
            ) : (
              <button
                type="button"
                className="vintage-btn px-5 py-3 rounded-md font-serif text-sepia hover:text-gold transition-colors"
                onClick={() => setIsDeleteModalOpen(true)}
              >
                <Trash2 className="w-4 h-4 inline-block mr-2" />
                {selectedIds.length}개 삭제
              </button>
            )}
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemCount={selectedIds.length}
      />

      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        itemType={itemType}
        typeLabel={config.label}
        onAdd={handleAddItem}
      />

      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>{previewItem?.name || "미리보기"}</DialogTitle>
          </DialogHeader>
          {previewItem?.type === "video" ? (
            // 동영상: fileUrl(원본) 또는 previewUrl(프리뷰) 사용
            <video
              controls
              autoPlay
              className="w-full h-full object-contain max-h-[80vh]"
              crossOrigin="anonymous"
            >
              <source src={previewItem.fileUrl || previewItem.previewUrl} type="video/mp4" />
              {previewItem.subtitleUrl && (
                <track
                  kind="subtitles"
                  src={previewItem.subtitleUrl}
                  srcLang="ko"
                  label="한국어"
                  default
                />
              )}
              브라우저가 동영상을 지원하지 않습니다.
            </video>
          ) : previewItem?.thumbnail ? (
            <img
              src={previewItem.thumbnail}
              alt={previewItem.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="p-8 text-center font-serif text-ink">
              미리보기가 없습니다.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default LibraryDetailPage;
