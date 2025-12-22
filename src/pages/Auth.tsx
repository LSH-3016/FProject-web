import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { BookOpen, Feather, Mail, Lock, User, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

type AuthMode = "login" | "signup";

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("login");
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  // Animate book opening on mount
  useState(() => {
    const timer = setTimeout(() => setIsBookOpen(true), 300);
    return () => clearTimeout(timer);
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Demo: Show success and navigate
    toast({
      title: mode === "login" ? "로그인 성공" : "회원가입 완료",
      description: mode === "login" 
        ? "다시 오신 것을 환영합니다." 
        : "새로운 기록의 여정을 시작하세요.",
    });
    
    setTimeout(() => navigate("/"), 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        {/* Book cover that opens */}
        <div className="relative w-full max-w-md">
          {/* Closed book cover (visible before animation) */}
          <div
            className={cn(
              "absolute inset-0 book-cover rounded-lg transition-all duration-700 origin-left",
              isBookOpen ? "rotate-y-180 opacity-0" : "rotate-y-0 opacity-100"
            )}
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
          >
            <div className="h-[500px] flex flex-col items-center justify-center p-8">
              <BookOpen className="w-16 h-16 text-gold mb-6" />
              <h2 className="font-serif text-2xl text-sepia mb-2">과거의 나</h2>
              <p className="font-handwriting text-muted-foreground">
                기억의 첫 페이지를 열어보세요
              </p>
            </div>
          </div>

          {/* Open book with form */}
          <div
            className={cn(
              "relative transition-all duration-700",
              isBookOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
            )}
          >
            {/* Paper background */}
            <div className="paper-texture rounded-lg shadow-book overflow-hidden">
              {/* Decorative binding edge */}
              <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-leather to-transparent" />

              <div className="p-8 pl-10">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-leather/20 mb-4">
                    <Feather className="w-6 h-6 text-gold" />
                  </div>
                  <h1 className="font-serif text-2xl text-ink mb-2">
                    {mode === "login" ? "로그인" : "회원가입"}
                  </h1>
                  <p className="font-handwriting text-ink/60">
                    {mode === "login"
                      ? "다시 돌아오셨군요"
                      : "새로운 기록을 시작하세요"}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                {mode === "signup" && (
                    <div className="space-y-2">
                      <label className="font-serif text-base text-ink/80 block">
                        이름
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/50" />
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="홍길동"
                          className="w-full pl-11 pr-4 py-3.5 bg-aged-paper/60 border border-ink/15 rounded-md font-handwriting text-lg text-ink placeholder:text-ink/40 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/40 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="font-serif text-base text-ink/80 block">
                      이메일
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/50" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your@email.com"
                        className="w-full pl-11 pr-4 py-3.5 bg-aged-paper/60 border border-ink/15 rounded-md font-handwriting text-lg text-ink placeholder:text-ink/40 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/40 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-serif text-base text-ink/80 block">
                      비밀번호
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink/50" />
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-4 py-3.5 bg-aged-paper/60 border border-ink/15 rounded-md font-handwriting text-lg text-ink placeholder:text-ink/40 focus:outline-none focus:border-gold/60 focus:ring-1 focus:ring-gold/40 transition-all"
                      />
                    </div>
                  </div>

                  {/* Submit button styled as wax seal */}
                  <button
                    type="submit"
                    className="w-full vintage-btn py-4 rounded-md flex items-center justify-center gap-3 font-serif text-sepia hover:text-gold transition-colors group"
                  >
                    <span>{mode === "login" ? "기록 공간으로" : "시작하기"}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>

                {/* Mode switch */}
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setMode(mode === "login" ? "signup" : "login")}
                    className="font-handwriting text-ink/60 hover:text-gold transition-colors"
                  >
                    {mode === "login"
                      ? "아직 기록을 시작하지 않으셨나요? 회원가입"
                      : "이미 기록이 있으신가요? 로그인"}
                  </button>
                </div>
              </div>
            </div>

            {/* Book edge effect */}
            <div className="absolute -bottom-1 left-2 right-2 h-1 bg-sepia/30 rounded-b" />
            <div className="absolute -bottom-2 left-3 right-3 h-1 bg-sepia/20 rounded-b" />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Auth;
