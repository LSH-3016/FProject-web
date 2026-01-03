# AWS Cognito 인증 시스템 설정 가이드

이 문서는 프로젝트에 통합된 AWS Cognito 인증 시스템의 설정 및 사용 방법을 설명합니다.

## 📋 목차

1. [개요](#개요)
2. [환경 변수 설정](#환경-변수-설정)
3. [Cognito 설정](#cognito-설정)
4. [인증 기능](#인증-기능)
5. [컴포넌트 구조](#컴포넌트-구조)
6. [사용 방법](#사용-방법)
7. [문제 해결](#문제-해결)

## 🔍 개요

이 프로젝트는 AWS Cognito를 사용하여 다음과 같은 인증 기능을 제공합니다:

- 이메일 기반 회원가입 및 이메일 인증
- 로그인/로그아웃
- 비밀번호 재설정
- Google OAuth 소셜 로그인 (설정 시)
- JWT 토큰 기반 세션 관리
- 자동 토큰 갱신

## ⚙️ 환경 변수 설정

### 1. 환경 변수 파일 생성

`.env.example` 파일을 복사하여 `.env` 파일을 생성하고 다음 값들을 설정하세요:

```env
# AWS Cognito 기본 설정
VITE_COGNITO_REGION=ap-northeast-2
VITE_COGNITO_USER_POOL_ID=ap-northeast-2_vjP7q3xVS
VITE_COGNITO_CLIENT_ID=your_actual_client_id_here
VITE_COGNITO_DOMAIN=ap-northeast-2vjp7q3xvs

# OAuth 리다이렉트 URI
VITE_OAUTH_REDIRECT_URI=http://localhost:5173/auth/callback

# 서버 사이드 작업용 AWS 설정
VITE_AWS_REGION=ap-northeast-2
VITE_AWS_USER_POOL_ID=ap-northeast-2_vjP7q3xVS
VITE_AWS_USER_POOL_WEB_CLIENT_ID=your_actual_client_id_here
```

### 2. 필수 값 확인

- `VITE_COGNITO_CLIENT_ID`: AWS Cognito 콘솔에서 확인 가능한 앱 클라이언트 ID
- 다른 값들은 현재 설정된 User Pool 정보와 일치

## 🛠️ Cognito 설정

### User Pool 설정 (cognito-config.json 참조)

현재 User Pool은 다음과 같이 설정되어 있습니다:

- **User Pool ID**: `ap-northeast-2_vjP7q3xVS`
- **리전**: `ap-northeast-2` (서울)
- **도메인**: `ap-northeast-2vjp7q3xvs`

### 비밀번호 정책

- 최소 8자 이상
- 대문자 포함 필수
- 소문자 포함 필수
- 숫자 포함 필수
- 특수문자 포함 필수

### 사용자 속성

- **이메일** (필수, 로그인 ID로 사용)
- **이름** (필수)
- **preferred_username** (닉네임, 필수)
- 기타 선택적 속성들 (생년월일, 성별, 프로필 사진 등)

## 🔐 인증 기능

### 1. 회원가입 플로우

1. 사용자가 이메일, 비밀번호, 이름, 닉네임 입력
2. Cognito에 사용자 등록 요청
3. 이메일로 6자리 인증 코드 발송
4. 사용자가 인증 코드 입력하여 이메일 확인
5. 계정 활성화 완료

### 2. 로그인 플로우

1. 이메일과 비밀번호로 로그인 시도
2. Cognito에서 인증 처리
3. 성공 시 JWT 토큰 (Access, ID, Refresh) 발급
4. 토큰을 사용하여 사용자 정보 추출 및 세션 생성

### 3. 비밀번호 재설정 플로우

1. 사용자가 이메일 주소 입력
2. Cognito에서 재설정 코드 이메일 발송
3. 사용자가 코드와 새 비밀번호 입력
4. 비밀번호 재설정 완료

## 🏗️ 컴포넌트 구조

### 서비스 레이어

- **`authService.ts`**: JWT 토큰 검증, 사용자 속성 업데이트, 비밀번호 재설정 등
- **`cognitoService.ts`**: Cognito SDK를 사용한 인증 작업 (로그인, 회원가입, OAuth 등)

### 컨텍스트 및 훅

- **`AuthContext.tsx`**: 전역 인증 상태 관리
- **`useAuth.ts`**: 인증 컨텍스트 접근을 위한 커스텀 훅

### UI 컴포넌트

- **`LoginForm.tsx`**: 로그인 폼
- **`SignUpForm.tsx`**: 회원가입 폼 (비밀번호 강도 표시 포함)
- **`EmailConfirmationForm.tsx`**: 이메일 인증 폼
- **`ForgotPasswordForm.tsx`**: 비밀번호 재설정 요청 폼
- **`ConfirmPasswordResetForm.tsx`**: 비밀번호 재설정 확인 폼

### 유틸리티

- **`auth.ts`**: 인증 관련 유틸리티 함수들 (에러 메시지, 유효성 검사 등)
- **`auth.ts` (types)**: TypeScript 타입 정의

## 📖 사용 방법

### 1. 기본 사용법 - 인증 상태 확인

```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (isAuthenticated) {
    return (
      <div>
        <p>안녕하세요, {user?.name}님!</p>
        <p>사용자 ID: {user?.sub}</p>
        <button onClick={logout}>로그아웃</button>
      </div>
    );
  }

  return <div>로그인이 필요합니다.</div>;
}
```

### 2. 간편한 사용자 정보 접근

```tsx
import { useCurrentUser } from '@/hooks/useCurrentUser';

function UserProfile() {
  const { 
    userId,           // Cognito sub (고유 ID)
    displayName,      // 표시용 이름
    email,           // 이메일
    isReady          // 인증 완료 및 사용자 ID 존재 여부
  } = useCurrentUser();

  if (!isReady) {
    return <div>로그인이 필요합니다.</div>;
  }

  return (
    <div>
      <h1>{displayName}님의 프로필</h1>
      <p>ID: {userId}</p>
      <p>Email: {email}</p>
    </div>
  );
}
```

### 3. 데이터베이스 연동 사용법

```tsx
import { useUserSync } from '@/hooks/useUserSync';

function JournalComponent() {
  const { 
    dbUser,          // 데이터베이스의 사용자 정보
    userId,          // 사용자 고유 ID
    userName,        // DB에서 가져온 이름
    isLoading,       // 동기화 중 여부
    isSynced,        // 동기화 완료 여부
    updateProfile    // 프로필 업데이트 함수
  } = useUserSync();

  const handleUpdateProfile = async () => {
    try {
      await updateProfile({
        name: '새로운 이름',
        nickname: '새로운 닉네임'
      });
      alert('프로필이 업데이트되었습니다!');
    } catch (error) {
      alert('업데이트 실패');
    }
  };

  if (isLoading) {
    return <div>사용자 데이터 동기화 중...</div>;
  }

  return (
    <div>
      <h1>{userName}님의 일기장</h1>
      <p>사용자 ID: {userId}</p>
      {isSynced && <p>✅ 데이터베이스와 동기화됨</p>}
      <button onClick={handleUpdateProfile}>프로필 업데이트</button>
    </div>
  );
}
```

### 4. JournalBook.tsx에서의 실제 사용 예시

```tsx
// JournalBook.tsx에서 사용자 정보 활용
export const JournalBook = () => {
  const { userId, isReady } = useCurrentUser();
  const { dbUser, userName, userNickname } = useUserSync();
  
  // 사용자 ID를 API 호출에 사용
  const currentUserId = userId; // Cognito sub 사용
  
  // 표시용 이름 결정 (DB 데이터 우선)
  const displayName = userName || userNickname || '사용자';
  
  // 커스텀 훅에 사용자 ID 전달
  const { entries, addEntry } = useJournalEntries(currentUserId, API_BASE_URL);
  
  if (!isReady) {
    return <div>로그인이 필요합니다</div>;
  }
  
  return (
    <div>
      <h1>{displayName}님의 추억 기록</h1>
      {/* 일기 컨텐츠 */}
    </div>
  );
};
```

### 5. 에러 처리

```tsx
import { getAuthErrorMessage } from '@/lib/auth';

try {
  await login(email, password);
} catch (error) {
  const message = getAuthErrorMessage(error);
  toast({ title: "로그인 실패", description: message });
}
```

## 🔧 문제 해결

### 자주 발생하는 문제들

#### 1. "Cognito configuration missing" 에러

**원인**: 환경 변수가 제대로 설정되지 않음

**해결책**:
- `.env` 파일이 존재하는지 확인
- 모든 필수 환경 변수가 설정되어 있는지 확인
- 개발 서버 재시작

#### 2. "Invalid or expired verification code" 에러

**원인**: 인증 코드가 만료되었거나 잘못 입력됨

**해결책**:
- 새로운 인증 코드 요청
- 이메일에서 최신 코드 확인
- 코드 입력 시 공백 제거

#### 3. "Password does not meet requirements" 에러

**원인**: 비밀번호가 정책을 만족하지 않음

**해결책**:
- 최소 8자 이상
- 대문자, 소문자, 숫자, 특수문자 각각 최소 1개씩 포함

#### 4. Google OAuth 관련 에러

**원인**: OAuth 설정이 완료되지 않음

**해결책**:
- AWS Cognito 콘솔에서 Google Identity Provider 설정
- `VITE_OAUTH_REDIRECT_URI` 환경 변수 확인
- Google Cloud Console에서 OAuth 클라이언트 설정

### 디버깅 팁

1. **브라우저 개발자 도구 콘솔 확인**: 자세한 에러 메시지 확인
2. **네트워크 탭 확인**: API 요청/응답 상태 확인
3. **로컬 스토리지 확인**: 토큰 저장 상태 확인
4. **환경 변수 로딩 확인**: `console.log(import.meta.env)` 사용

## 📞 지원

추가 도움이 필요하시면:

1. AWS Cognito 공식 문서 참조
2. 프로젝트 이슈 트래커에 문제 보고
3. 개발팀에 문의

---

이 가이드가 도움이 되셨기를 바랍니다! 🚀