# 구현 계획

- [ ] 1. 프로젝트 구조 및 핵심 인터페이스 설정
  - Node.js/Express 프로젝트 초기화
  - TypeScript 설정 및 필요한 의존성 설치 (express, pg, aws-jwt-verify, fast-check 등)
  - 디렉토리 구조 생성 (controllers, services, repositories, middlewares, types)
  - 환경 변수 설정 (.env 파일)
  - _요구사항: 6.1, 7.1_

- [ ] 2. 데이터 모델 및 데이터베이스 설정
  - [ ] 2.1 TypeScript 인터페이스 및 타입 정의
    - Message, CreateMessageDTO, MessageQueryParams 인터페이스 작성
    - Emotion, Summary, SummaryRequest 인터페이스 작성
    - ErrorCode enum 및 에러 타입 정의
    - _요구사항: 7.1_

  - [ ] 2.2 데이터베이스 스키마 생성
    - PostgreSQL messages 테이블 마이그레이션 스크립트 작성
    - 인덱스 생성 (user_id, created_at 복합 인덱스)
    - _요구사항: 1.1, 3.1_

  - [ ]* 2.3 속성 테스트 작성 - Property 19: null 값 필드 포함
    - **Property 19: null 값 필드 포함**
    - **검증: 요구사항 7.5**

- [ ] 3. 인증 미들웨어 구현
  - [ ] 3.1 AWS Cognito JWT 검증 미들웨어 작성
    - aws-jwt-verify를 사용한 토큰 검증 로직
    - req.user에 Cognito 사용자 정보 설정
    - _요구사항: 6.1, 6.2, 6.4_

  - [ ]* 3.2 속성 테스트 작성 - Property 15: 인증 토큰 검증
    - **Property 15: 인증 토큰 검증**
    - **검증: 요구사항 6.1, 6.2**

- [ ] 4. 에러 처리 시스템 구현
  - [ ] 4.1 커스텀 에러 클래스 작성
    - ValidationError, UnauthorizedError, ForbiddenError, NotFoundError 클래스
    - _요구사항: 5.1, 5.2, 5.3, 5.4_

  - [ ] 4.2 전역 에러 처리 미들웨어 작성
    - 에러 로깅 및 일관된 JSON 응답 형식
    - _요구사항: 5.1, 5.5_

  - [ ]* 4.3 속성 테스트 작성 - Property 14: 오류 응답 형식 일관성
    - **Property 14: 오류 응답 형식 일관성**
    - **검증: 요구사항 5.1**

- [ ] 5. 메시지 리포지토리 구현
  - [ ] 5.1 MessageRepository 클래스 작성
    - findByUserId 메서드 (페이지네이션 지원)
    - create 메서드
    - deleteById 메서드
    - findById 메서드
    - _요구사항: 1.1, 1.2, 2.1, 3.1_

  - [ ]* 5.2 단위 테스트 작성
    - 리포지토리 메서드 단위 테스트
    - _요구사항: 1.1, 2.1, 3.1_

- [ ] 6. 메시지 서비스 구현
  - [ ] 6.1 MessageService 클래스 작성
    - getUserMessages 메서드 (정렬 및 페이지네이션)
    - createMessage 메서드 (유효성 검증 포함)
    - deleteMessage 메서드 (권한 검증 포함)
    - _요구사항: 1.1, 1.2, 2.1, 2.2, 3.1, 3.3_

  - [ ]* 6.2 속성 테스트 작성 - Property 1: 메시지 조회 시 시간 역순 정렬
    - **Property 1: 메시지 조회 시 시간 역순 정렬**
    - **검증: 요구사항 1.1**

  - [ ]* 6.3 속성 테스트 작성 - Property 2: 페이지네이션 정확성
    - **Property 2: 페이지네이션 정확성**
    - **검증: 요구사항 1.2**

  - [ ]* 6.4 속성 테스트 작성 - Property 4: 유효한 메시지 생성 성공
    - **Property 4: 유효한 메시지 생성 성공**
    - **검증: 요구사항 2.1**

  - [ ]* 6.5 속성 테스트 작성 - Property 5: 공백 메시지 거부
    - **Property 5: 공백 메시지 거부**
    - **검증: 요구사항 2.2**

  - [ ]* 6.6 속성 테스트 작성 - Property 6: 생성 시간 자동 설정
    - **Property 6: 생성 시간 자동 설정**
    - **검증: 요구사항 2.3**

  - [ ]* 6.7 속성 테스트 작성 - Property 8: 메시지 삭제 후 조회 불가
    - **Property 8: 메시지 삭제 후 조회 불가**
    - **검증: 요구사항 3.1, 3.4**

  - [ ]* 6.8 속성 테스트 작성 - Property 9: 타인 메시지 삭제 거부
    - **Property 9: 타인 메시지 삭제 거부**
    - **검증: 요구사항 3.3**

- [ ] 7. 메시지 컨트롤러 및 라우터 구현
  - [ ] 7.1 MessageController 클래스 작성
    - getMessages 핸들러
    - createMessage 핸들러
    - deleteMessage 핸들러
    - 요청 파라미터 파싱 및 응답 형식화
    - _요구사항: 1.1, 1.2, 1.4, 2.1, 2.4, 3.1, 7.1, 7.2, 7.3_

  - [ ] 7.2 메시지 라우터 설정
    - GET /api/users/:userId/messages
    - POST /api/messages
    - DELETE /api/messages/:messageId
    - 인증 미들웨어 적용
    - _요구사항: 6.1_

  - [ ]* 7.3 속성 테스트 작성 - Property 3: 메시지 응답 필수 필드 포함
    - **Property 3: 메시지 응답 필수 필드 포함**
    - **검증: 요구사항 1.4**

  - [ ]* 7.4 속성 테스트 작성 - Property 7: 메시지 생성 응답 형식
    - **Property 7: 메시지 생성 응답 형식**
    - **검증: 요구사항 2.4**

  - [ ]* 7.5 속성 테스트 작성 - Property 16: 응답 필드 명명 규칙
    - **Property 16: 응답 필드 명명 규칙**
    - **검증: 요구사항 7.1**

  - [ ]* 7.6 속성 테스트 작성 - Property 17: 타임스탬프 형식
    - **Property 17: 타임스탬프 형식**
    - **검증: 요구사항 7.2**

  - [ ]* 7.7 속성 테스트 작성 - Property 18: 페이지네이션 메타데이터
    - **Property 18: 페이지네이션 메타데이터**
    - **검증: 요구사항 7.3**

- [ ] 8. 체크포인트 - 메시지 기능 테스트
  - 모든 테스트가 통과하는지 확인
  - 질문이 있으면 사용자에게 문의

- [ ] 9. AI 요약 서비스 구현
  - [ ] 9.1 OpenAI API 클라이언트 설정
    - OpenAI SDK 설정 및 프롬프트 템플릿 작성
    - _요구사항: 4.1_

  - [ ] 9.2 SummaryService 클래스 작성
    - generateSummary 메서드 (날짜 범위 필터링)
    - 메시지 분석 및 감정 추출 로직
    - OpenAI API 호출 및 응답 파싱
    - _요구사항: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 9.3 속성 테스트 작성 - Property 10: 요약 생성 성공
    - **Property 10: 요약 생성 성공**
    - **검증: 요구사항 4.1**

  - [ ]* 9.4 속성 테스트 작성 - Property 11: 요약 감정 최소 개수
    - **Property 11: 요약 감정 최소 개수**
    - **검증: 요구사항 4.2**

  - [ ]* 9.5 속성 테스트 작성 - Property 12: 요약 서술 텍스트 존재
    - **Property 12: 요약 서술 텍스트 존재**
    - **검증: 요구사항 4.3**

  - [ ]* 9.6 속성 테스트 작성 - Property 13: 날짜 범위 필터링
    - **Property 13: 날짜 범위 필터링**
    - **검증: 요구사항 4.4**

- [ ] 10. 요약 컨트롤러 및 라우터 구현
  - [ ] 10.1 SummaryController 클래스 작성
    - generateSummary 핸들러
    - 날짜 범위 파라미터 검증
    - 응답 형식화
    - _요구사항: 4.1, 4.5_

  - [ ] 10.2 요약 라우터 설정
    - POST /api/users/:userId/summaries
    - 인증 미들웨어 적용
    - _요구사항: 6.1_

  - [ ]* 10.3 통합 테스트 작성
    - 전체 요약 생성 플로우 테스트
    - OpenAI API 모킹
    - _요구사항: 4.1, 4.2, 4.3_

- [ ] 11. 최종 체크포인트
  - 모든 테스트가 통과하는지 확인
  - API 문서 작성 (OpenAPI/Swagger)
  - 질문이 있으면 사용자에게 문의
