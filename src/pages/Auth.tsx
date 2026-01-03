import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { BookOpen, Feather, Mail, Lock, User, ArrowRight, KeyRound, Loader2, HelpCircle, RefreshCcw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { getAuthErrorMessage } from "@/lib/auth";
import { LoginForm } from "@/components/auth/LoginForm";

type AuthMode = "login" | "signup" | "verify" | "forgot" | "confirmReset";

const Auth = () => {
  const navigate = useNavigate();
  const { login, signUp, confirmSignUp, resendConfirmationCode, forgotPassword, confirmPassword, isLoading, isAuthenticated, isCognitoConfigured } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [isBookOpen, setIsBookOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    nickname: "",
    code: "",
    newPassword: "",
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const timer = setTimeout(() => setIsBookOpen(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // 로그인 완료 후 일기 페이지로 이동
      navigate("/journal", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (mode === "signup") {
      if (!formData.name.trim()) {
        newErrors.name = "이름을 입력해주세요.";
      }
      if (!formData.nickname.trim()) {
        newErrors.nickname = "닉네임을 입력해주세요.";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
      }
    }

    if (mode !== "verify" && mode !== "confirmReset" && !formData.email.trim()) {
      newErrors.email = "이메일 주소를 입력해주세요.";
    }

    if ((mode === "login" || mode === "signup") && !formData.password) {
      newErrors.password = "비밀번호를 입력해주세요.";
    }

    if ((mode === "verify" || mode === "confirmReset") && !formData.code.trim()) {
      newErrors.code = "6자리 코드를 입력해주세요.";
    }

    if (mode === "confirmReset" && !formData.newPassword) {
      newErrors.newPassword = "새 비밀번호를 입력해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return; 
    }

    try {
      switch (mode) {
        case "login":
          await login(formData.email, formData.password);
          toast({ title: "환영합니다!", description: "기억의 도서관으로 이동합니다." });
          // 로그인 성공 시 일기 페이지로 이동 (useEffect에서 처리됨)
          break;
          
        case "signup":
          await signUp(formData.email, formData.password, formData.name, formData.nickname);
          toast({ title: "인증 메일 발송", description: "이메일로 전송된 코드를 입력해주세요." });
          setMode("verify");
          break;
          
        case "verify":
          await confirmSignUp(formData.email, formData.code);
          toast({ title: "인증 완료", description: "환영합니다! 이제 로그인해주세요." });
          setMode("login");
          break;
          
        case "forgot":
          await forgotPassword(formData.email);
          toast({ title: "코드 발송", description: "비밀번호 재설정 코드를 보냈습니다." });
          setMode("confirmReset");
          break;
          
        case "confirmReset":
          await confirmPassword(formData.email, formData.code, formData.newPassword);
          toast({ title: "비밀번호 재설정 완료", description: "새 비밀번호로 로그인해주세요." });
          setMode("login");
          break;
      }
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error);
      toast({ 
        title: "오류", 
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleResendCode = async () => {
    try {
      await resendConfirmationCode(formData.email);
      toast({ title: "코드 재전송", description: "인증 코드를 재전송했습니다." });
    } catch (error: any) {
      const errorMessage = getAuthErrorMessage(error);
      toast({ 
        title: "오류", 
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const renderInput = (
    icon: React.ElementType,
    name: string,
    type: string,
    placeholder: string,
    label: string
  ) => {
    const hasError = !!errors[name];

    return (
      <div className="space-y-1.5">
        
        <label className={cn(
          "font-serif text-sm block ml-1 transition-colors",
          hasError ? "text-red-800/80" : "text-ink/80"
        )}>
          {label}
        </label>
        
        <div className="relative group">
          <div className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300",
            hasError ? "text-red-800/60" : "text-ink/40 group-focus-within:text-gold"
          )}>
            {icon === User && <User className="w-5 h-5" />}
            {icon === Mail && <Mail className="w-5 h-5" />}
            {icon === Lock && <Lock className="w-5 h-5" />}
            {icon === KeyRound && <KeyRound className="w-5 h-5" />}
          </div>
          
          <input
            type={type}
            name={name}
            value={formData[name as keyof typeof formData]}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={cn(
              "w-full pl-11 pr-4 py-3.5 rounded-md border transition-all duration-300",
              "font-handwriting text-lg text-ink placeholder:text-ink/30",
              "focus:outline-none focus:bg-aged-paper",
              hasError 
                ? "bg-red-50/50 border-red-800/30 focus:border-red-800/50 focus:ring-1 focus:ring-red-800/20" 
                : "bg-aged-paper/60 border-ink/10 group-hover:border-ink/30 focus:border-gold/60 focus:ring-1 focus:ring-gold/30"
            )}
          />
        </div>
        
        {hasError && (
          <div className="flex items-center gap-1.5 mt-1 ml-1 animate-in slide-in-from-left-1 duration-300">
            <AlertCircle className="w-3 h-3 text-red-800/70" />
            <p className="font-handwriting text-sm text-red-800/80">
              {errors[name]}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <MainLayout showSidebar={false}>
      <div className="min-h-screen flex items-center justify-center py-12 px-4">
        <div className="relative w-full max-w-md perspective-1000">
          
          {/* 1. 닫힌 책 커버 */}
          <div
            className={cn(
              "absolute inset-0 book-cover rounded-lg transition-all duration-1000 origin-left ease-in-out",
              isBookOpen ? "rotate-y-180 opacity-0 pointer-events-none" : "rotate-y-0 opacity-100"
            )}
            style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
          >
            <div className="h-[600px] flex flex-col items-center justify-center p-8 border-r-4 border-r-black/20 rounded-r-sm">
              <BookOpen className="w-20 h-20 text-gold mb-6 drop-shadow-md" />
              <h2 className="font-serif text-3xl text-sepia mb-2 font-bold tracking-wide">기억의 서</h2>
              <p className="font-handwriting text-muted-foreground text-lg">당신의 모든 순간을 기록합니다</p>
            </div>
          </div>

          {/* 2. 펼쳐진 책 */}
          <div
            className={cn(
              "relative transition-all duration-1000 ease-in-out",
              isBookOpen ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-95 translate-x-4"
            )}
          >
            <div className="paper-texture rounded-lg shadow-2xl overflow-hidden min-h-[600px] flex flex-col">
              <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-black/10 via-transparent to-transparent z-10 pointer-events-none" />
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-leather/80 z-20" />

              <div className="flex-1 p-8 pl-12 flex flex-col">
                
                {/* 헤더 */}
                <div className="text-center mb-8 relative">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-leather/10 mb-4 ring-4 ring-leather/5">
                    {mode === "verify" ? <KeyRound className="w-6 h-6 text-gold" /> :
                     mode === "forgot" ? <HelpCircle className="w-6 h-6 text-gold" /> :
                     mode === "signup" ? <Feather className="w-6 h-6 text-gold" /> :
                     <User className="w-6 h-6 text-gold" />}
                  </div>

                  <div key={mode} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <h1 className="font-serif text-2xl text-ink font-bold mb-1">
                      {mode === "login" && "로그인"}
                      {mode === "signup" && "도서관 회원 등록"}
                      {mode === "verify" && "본인 확인"}
                      {mode === "forgot" && "비밀번호 찾기"}
                      {mode === "confirmReset" && "새 비밀번호 설정"}
                    </h1>
                    <p className="font-handwriting text-ink/60 text-sm">
                      {mode === "verify" && "이메일로 전송된 6자리 코드를 입력하세요"}
                      {mode === "confirmReset" && "인증 코드와 새 비밀번호를 입력하세요"}
                    </p>
                  </div>
                </div>

                {/* 로그인 모드일 때는 LoginForm 컴포넌트 사용 */}
                {mode === "login" ? (
                  <div className="flex-1">
                    <LoginForm
                      onSuccess={() => {
                        toast({ title: "환영합니다!", description: "기억의 도서관으로 이동합니다." });
                      }}
                      onSignUpClick={() => setMode("signup")}
                      onForgotPasswordClick={() => setMode("forgot")}
                    />
                  </div>
                ) : (
                  <>
                    {/* 기존 폼 (회원가입, 인증 등) */}
                    <form 
                      key={mode} 
                      onSubmit={handleSubmit}
                      noValidate
                      className="space-y-5 flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards"
                    >
                  {mode === "signup" && (
                    <>
                      {renderInput(User, "name", "text", "홍길동", "이름")}
                      {renderInput(User, "nickname", "text", "닉네임", "닉네임")}
                    </>
                  )}
                  
                  {mode !== "verify" && mode !== "confirmReset" && renderInput(Mail, "email", "email", "example@email.com", "이메일")}

                  {mode === "signup" && (
                    <div className="space-y-1.5">
                       <div className="flex justify-between items-end">
                        <label className={cn("font-serif text-sm block ml-1 transition-colors", errors.password ? "text-red-800/80" : "text-ink/80")}>
                          비밀번호
                        </label>
                       </div>
                       <div className="relative group">
                        <div className={cn(
                            "absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300",
                            errors.password ? "text-red-800/60" : "text-ink/40 group-focus-within:text-gold"
                        )}>
                          <Lock className="w-5 h-5" />
                        </div>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          className={cn(
                            "w-full pl-11 pr-4 py-3.5 rounded-md border transition-all duration-300",
                            "font-handwriting text-lg text-ink placeholder:text-ink/30",
                            "focus:outline-none focus:bg-aged-paper",
                            errors.password
                                ? "bg-red-50/50 border-red-800/30 focus:border-red-800/50 focus:ring-1 focus:ring-red-800/20" 
                                : "bg-aged-paper/60 border-ink/10 group-hover:border-ink/30 focus:border-gold/60 focus:ring-1 focus:ring-gold/30"
                          )}
                        />
                       </div>
                       {errors.password && (
                        <div className="flex items-center gap-1.5 mt-1 ml-1 animate-in slide-in-from-left-1 duration-300">
                            <AlertCircle className="w-3 h-3 text-red-800/70" />
                            <p className="font-handwriting text-sm text-red-800/80">{errors.password}</p>
                        </div>
                       )}
                       
                       {!errors.password && (
                         <p className="text-[10px] text-ink/40 pl-1 font-sans">* 8자 이상, 대소문자, 숫자, 특수문자 포함</p>
                       )}
                    </div>
                  )}

                  {mode === "signup" && (
                    <div className="space-y-1.5">
                       <label className={cn("font-serif text-sm block ml-1 transition-colors", errors.confirmPassword ? "text-red-800/80" : "text-ink/80")}>
                         비밀번호 확인
                       </label>
                       <div className="relative group">
                        <div className={cn(
                            "absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300",
                            errors.confirmPassword ? "text-red-800/60" : "text-ink/40 group-focus-within:text-gold"
                        )}>
                          <Lock className="w-5 h-5" />
                        </div>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          className={cn(
                            "w-full pl-11 pr-4 py-3.5 rounded-md border transition-all duration-300",
                            "font-handwriting text-lg text-ink placeholder:text-ink/30",
                            "focus:outline-none focus:bg-aged-paper",
                            errors.confirmPassword
                                ? "bg-red-50/50 border-red-800/30 focus:border-red-800/50 focus:ring-1 focus:ring-red-800/20" 
                                : "bg-aged-paper/60 border-ink/10 group-hover:border-ink/30 focus:border-gold/60 focus:ring-1 focus:ring-gold/30"
                          )}
                        />
                       </div>
                       {errors.confirmPassword && (
                        <div className="flex items-center gap-1.5 mt-1 ml-1 animate-in slide-in-from-left-1 duration-300">
                            <AlertCircle className="w-3 h-3 text-red-800/70" />
                            <p className="font-handwriting text-sm text-red-800/80">{errors.confirmPassword}</p>
                        </div>
                       )}
                    </div>
                  )}

                  {(mode === "verify" || mode === "confirmReset") && (
                    <div className="space-y-4">
                      {renderInput(KeyRound, "code", "text", "123456", "인증 코드")}
                      
                      {mode === "verify" && (
                        <div className="text-center">
                          <button 
                            type="button"
                            className="inline-flex items-center gap-1.5 text-xs font-handwriting text-ink/50 hover:text-gold transition-colors"
                            onClick={handleResendCode}
                          >
                            <RefreshCcw className="w-3 h-3" />
                            코드가 오지 않았나요? 재전송
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {mode === "confirmReset" && (
                    <div className="space-y-1.5">
                       <label className={cn("font-serif text-sm block ml-1 transition-colors", errors.newPassword ? "text-red-800/80" : "text-ink/80")}>
                         새 비밀번호
                       </label>
                       <div className="relative group">
                        <div className={cn(
                            "absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300",
                            errors.newPassword ? "text-red-800/60" : "text-ink/40 group-focus-within:text-gold"
                        )}>
                          <Lock className="w-5 h-5" />
                        </div>
                        <input
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          placeholder="••••••••"
                          className={cn(
                            "w-full pl-11 pr-4 py-3.5 rounded-md border transition-all duration-300",
                            "font-handwriting text-lg text-ink placeholder:text-ink/30",
                            "focus:outline-none focus:bg-aged-paper",
                            errors.newPassword
                                ? "bg-red-50/50 border-red-800/30 focus:border-red-800/50 focus:ring-1 focus:ring-red-800/20" 
                                : "bg-aged-paper/60 border-ink/10 group-hover:border-ink/30 focus:border-gold/60 focus:ring-1 focus:ring-gold/30"
                          )}
                        />
                       </div>
                       {errors.newPassword && (
                        <div className="flex items-center gap-1.5 mt-1 ml-1 animate-in slide-in-from-left-1 duration-300">
                            <AlertCircle className="w-3 h-3 text-red-800/70" />
                            <p className="font-handwriting text-sm text-red-800/80">{errors.newPassword}</p>
                        </div>
                       )}
                       
                       {!errors.newPassword && (
                         <p className="text-[10px] text-ink/40 pl-1 font-sans">* 8자 이상, 대소문자, 숫자, 특수문자 포함</p>
                       )}
                    </div>
                  )}

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isLoading || !isCognitoConfigured}
                      className={cn(
                        "w-full py-4 rounded-md flex items-center justify-center gap-3 font-serif transition-all duration-300 group disabled:opacity-70 disabled:cursor-not-allowed",
                        isCognitoConfigured 
                          ? "bg-[hsl(var(--leather))] text-[hsl(var(--sepia))] shadow-md hover:brightness-110 hover:shadow-lg"
                          : "bg-gray-400 text-gray-600"
                      )}
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <span>
                            {mode === "signup" && "회원 등록"}
                            {mode === "verify" && "인증 확인"}
                            {mode === "forgot" && "코드 전송"}
                            {mode === "confirmReset" && "비밀번호 재설정"}
                          </span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>

                </form>
                </>
                )}

                {/* 하단 링크 - 로그인 모드가 아닐 때만 표시 */}
                {mode !== "login" && (
                  <div className="mt-8 text-center pt-6 border-t border-ink/5">
                    <button
                      onClick={() => {
                        if (mode === "signup") setMode("login");
                        else if (mode === "forgot") setMode("login");
                        else if (mode === "confirmReset") setMode("login");
                        else setMode("login");
                        setErrors({});
                      }}
                      className="font-handwriting text-ink/60 hover:text-gold transition-colors text-sm"
                    >
                      {mode === "signup" && "이미 계정이 있으신가요? 로그인"}
                      {(mode === "verify" || mode === "forgot" || mode === "confirmReset") && "로그인 화면으로 돌아가기"}
                    </button>
                    
                    {/* API 연동 오류 안내 */}
                    {!isCognitoConfigured && (
                      <div className="mt-4 p-3 bg-red-50/50 border border-red-200/50 rounded-md">
                        <p className="text-xs text-red-800">
                          ⚠️ API 연동 오류: Cognito 설정을 확인해주세요.
                        </p>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
            
            <div className="absolute -bottom-2 left-4 right-4 h-4 bg-white/50 rounded-b-lg border-x border-b border-black/5 -z-10" />
            <div className="absolute -bottom-4 left-6 right-6 h-4 bg-white/30 rounded-b-lg border-x border-b border-black/5 -z-20" />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Auth;