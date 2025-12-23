import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";

const EditProfile = () => {
  const navigate = useNavigate();
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [nickname, setNickname] = useState(() => {
    if (typeof window === "undefined") {
      return "상호상사";
    }
    return localStorage.getItem("profileNickname") ?? "상호상사";
  });
  const [profilePreview, setProfilePreview] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }
    return localStorage.getItem("profileImage") ?? "";
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleCancel = () => {
    navigate("/mypage");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    localStorage.setItem("profileImage", profilePreview);
    localStorage.setItem("profileNickname", nickname);
    setIsCompleteOpen(true);
  };

  const handleConfirm = () => {
    setIsCompleteOpen(false);
    navigate("/mypage");
  };

  const handleProfileClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfilePreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProfileClear = () => {
    setProfilePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    localStorage.removeItem("profileImage");
  };

  return (
    <MainLayout>
      <div className="min-h-screen py-12 px-4 bg-background">
        <div className="max-w-2xl mx-auto space-y-10">
          <section className="bg-card rounded-xl shadow-md border border-border p-6">
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              정보 수정
            </h2>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  프로필 사진
                </label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={handleProfileClick}
                    className="flex flex-1 items-center justify-center gap-4 rounded-lg border border-border bg-secondary/30 px-4 py-3 text-center transition-colors hover:bg-secondary/40"
                  >
                    <span className="h-16 w-16 overflow-hidden rounded-full border border-border bg-background flex items-center justify-center">
                      {profilePreview ? (
                        <img
                          src={profilePreview}
                          alt="프로필 사진"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-7 w-7 text-muted-foreground" />
                      )}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      사진을 눌러 변경하세요
                    </span>
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/40"
                    onClick={handleProfileClear}
                  >
                    삭제
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfileChange}
                />
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="nickname"
                  className="text-sm font-medium text-foreground"
                >
                  닉네임
                </label>
                <input
                  id="nickname"
                  name="nickname"
                  type="text"
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="새 닉네임을 입력하세요"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  비밀번호
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="새 비밀번호를 입력하세요"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row pt-2">
                <button
                  type="button"
                  className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/40"
                  onClick={handleCancel}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  수정
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>

      {isCompleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="닫기"
            onClick={handleConfirm}
          />
          <div className="relative w-full max-w-sm bg-card rounded-xl shadow-xl border border-border p-6 text-center">
            <p className="text-sm text-foreground">수정 되었습니다.</p>
            <button
              type="button"
              className="mt-5 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              onClick={handleConfirm}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default EditProfile;