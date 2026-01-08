# 기억의 도서관 (Memory Library)

일상의 순간을 기록하고, AI가 요약해주는 개인 일기 및 추억 관리 애플리케이션입니다.

## 📖 프로젝트 소개

기억의 도서관은 사용자의 일상을 기록하고 관리하는 웹 애플리케이션입니다. 일기 작성, AI 기반 요약, 사진 및 파일 관리 기능을 제공하며, 아름다운 책 스타일의 UI로 추억을 소중히 보관할 수 있습니다.

### 주요 기능

- **📝 일기 작성**: 오늘의 일상을 자유롭게 기록
- **🤖 AI 요약**: AWS Bedrock을 활용한 일기 자동 요약
- **📸 추억 보관**: 사진, 동영상, 문서 등 다양한 파일 업로드 및 관리
- **🔐 안전한 인증**: AWS Cognito 기반 사용자 인증
- **🌐 다국어 지원**: 한국어/영어 지원 (i18n)
- **📱 반응형 디자인**: 모바일, 태블릿, 데스크톱 모두 지원

## 🛠 기술 스택

### Frontend
- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite** - 빌드 도구
- **React Router** - 라우팅
- **TanStack Query** - 서버 상태 관리
- **Tailwind CSS** - 스타일링
- **shadcn/ui** - UI 컴포넌트
- **Framer Motion** - 애니메이션
- **i18next** - 다국어 지원

### Backend Integration
- **AWS Cognito** - 사용자 인증 및 관리
- **AWS S3** - 파일 저장소
- **AWS Bedrock** - AI 요약 (Claude)
- **FastAPI** - 백엔드 API (별도 저장소)

## 🚀 시작하기

### 필수 요구사항

- Node.js 18+ 및 npm
- AWS 계정 (Cognito, S3, Bedrock 설정 필요)
- 백엔드 API 서버 (Journal API, Library API)

### 설치 및 실행

1. **저장소 클론**
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. **의존성 설치**
```bash
npm install
```

3. **환경 변수 설정**

`.env.example` 파일을 복사하여 `.env` 파일을 생성하고 필요한 값을 설정합니다:

```bash
cp .env.example .env
```

`.env` 파일 설정:
```env
# Backend API URLs
VITE_LIBRARY_API_URL=http://localhost:8000/api/v1
VITE_JOURNAL_API_URL=http://localhost:8000
VITE_COGNITO_API_URL=http://localhost:3001

# AWS Cognito Configuration
VITE_COGNITO_REGION=ap-northeast-2
VITE_COGNITO_USER_POOL_ID=your_user_pool_id
VITE_COGNITO_CLIENT_ID=your_client_id
VITE_COGNITO_DOMAIN=your-domain.auth.ap-northeast-2.amazoncognito.com

# OAuth Configuration
VITE_OAUTH_REDIRECT_URI=http://localhost:5173/auth/callback
```

4. **개발 서버 실행**
```bash
npm run dev
```

애플리케이션이 `http://localhost:5173`에서 실행됩니다.

### 빌드

```bash
# 개발 빌드
npm run build:dev

# 프로덕션 빌드
npm run build:prod
```

## 📁 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── auth/           # 인증 관련 컴포넌트
│   ├── journal/        # 일기 관련 컴포넌트
│   ├── library/        # 라이브러리(파일 관리) 컴포넌트
│   ├── layout/         # 레이아웃 컴포넌트
│   └── ui/             # shadcn/ui 기본 컴포넌트
├── contexts/           # React Context
├── hooks/              # 커스텀 훅
├── i18n/               # 다국어 설정
├── lib/                # 유틸리티 함수
├── pages/              # 페이지 컴포넌트
├── services/           # API 서비스
├── types/              # TypeScript 타입 정의
└── utils/              # 헬퍼 함수
```

## 🔑 주요 페이지

- `/` - 홈 (랜딩 페이지)
- `/auth` - 로그인/회원가입
- `/journal` - 일기 작성
- `/library` - 추억 보관함
- `/library/:type/:id` - 파일 상세보기
- `/history` - 히스토리 (요약 기록)
- `/mypage` - 마이페이지
- `/settings` - 설정

## 🔐 AWS Cognito 설정

### 1. User Pool 생성

AWS Console에서 Cognito User Pool을 생성하고 다음 설정을 적용합니다:

- **인증 방식**: 이메일
- **비밀번호 정책**: 최소 8자, 대소문자, 숫자, 특수문자 포함
- **이메일 인증**: 필수
- **속성**: name, nickname, email

### 2. App Client 설정

- Hosted UI 활성화
- OAuth 2.0 흐름: Authorization code grant
- Callback URL: `http://localhost:5173/auth/callback`
- 허용된 OAuth 범위: email, openid, profile

### 3. 환경 변수 설정

생성된 User Pool ID와 Client ID를 `.env` 파일에 설정합니다.

자세한 설정 방법은 `COGNITO_SETUP.md` 파일을 참조하세요.

## 📝 주요 기능 상세

### 일기 작성 (Journal)

- 실시간 메시지 입력 및 저장
- 메시지 수정/삭제 기능
- AI 기반 일기 요약
- 요약과 함께 사진 첨부 가능
- 오늘 날짜 기록 자동 필터링

### 추억 보관함 (Library)

- 사진, 동영상, 문서 업로드
- 공개/비공개 설정
- 파일 미리보기
- 일괄 삭제 및 공개 설정 변경
- S3 Presigned URL을 통한 안전한 파일 업로드

### 히스토리 (History)

- AI 요약된 일기 목록
- 날짜별 검색 및 필터링
- 상세 내용 보기
- 첨부된 사진 확인

## 🌍 다국어 지원

i18next를 사용하여 한국어와 영어를 지원합니다.

언어 파일 위치: `src/i18n/locales/`

## 🎨 디자인 시스템

- **컬러 테마**: 빈티지 도서관 컨셉 (세피아, 가죽, 골드)
- **폰트**: 
  - 본문: Noto Sans KR
  - 제목: Noto Serif KR
  - 손글씨: Nanum Pen Script
- **애니메이션**: Framer Motion을 활용한 부드러운 전환

## 🔧 개발 가이드

### 코드 스타일

- ESLint 설정 준수
- TypeScript strict 모드 사용
- 컴포넌트는 함수형으로 작성
- 커스텀 훅으로 로직 분리

### 상태 관리

- 서버 상태: TanStack Query
- 전역 상태: React Context
- 로컬 상태: useState, useReducer

### API 통신

- `src/services/` 디렉토리에 API 서비스 클래스 정의
- 에러 처리 및 로딩 상태 관리
- 인증 토큰 자동 포함

## 📦 배포

### Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

### 환경 변수 설정

배포 플랫폼에서 `.env` 파일의 모든 환경 변수를 설정해야 합니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 개인 프로젝트입니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 등록해주세요.

---

**Made with ❤️ using React, TypeScript, and AWS**
