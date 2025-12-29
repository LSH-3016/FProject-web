# 설계 문서

## 개요

Journal API는 사용자가 일기 형식의 메시지를 작성, 조회, 삭제하고 AI 기반 요약을 생성할 수 있는 RESTful API입니다. 이 시스템은 Node.js/Express 기반으로 구축되며, PostgreSQL 데이터베이스를 사용하고, OpenAI API를 통해 감정 분석 및 요약 기능을 제공합니다.

## 아키텍처

### 시스템 구성 요소

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Client    │─────▶│  API Server │─────▶│  Database   │
│ (React App) │      │  (Express)  │      │ (PostgreSQL)│
└─────────────┘      └─────────────┘      └─────────────┘
                            │
                            ▼
                     ┌─────────────┐
                     │  OpenAI API │
                     │  (Summary)  │
                     └─────────────┘
```

### 레이어 구조

1. **라우터 레이어**: HTTP 요청을 받아 적절한 컨트롤러로 라우팅
2. **컨트롤러 레이어**: 요청 검증, 비즈니스 로직 호출, 응답 형식화
3. **서비스 레이어**: 비즈니스 로직 구현
4. **리포지토리 레이어**: 데이터베이스 접근 추상화
5. **미들웨어 레이어**: 인증, 에러 처리, 로깅

## 컴포넌트 및 인터페이스

### API 엔드포인트

#### 1. 메시지 조회
```
GET /api/users/:userId/messages
```

**쿼리 파라미터:**
- `limit` (선택, 기본값: 100): 반환할 메시지 수
- `offset` (선택, 기본값: 0): 시작 위치

**응답 (200 OK):**
```json
{
  "data": [
    {
      "id": "msg_123",
      "user_id": "user_001",
      "content": "오늘은 좋은 하루였다.",
      "created_at": "2025-12-29T10:30:00Z"
    }
  ],
  "meta": {
    "total": 150,
    "limit": 100,
    "offset": 0
  }
}
```

#### 2. 메시지 생성
```
POST /api/messages
```

**요청 본문:**
```json
{
  "content": "오늘은 좋은 하루였다."
}
```

**응답 (201 Created):**
```json
{
  "id": "msg_123",
  "user_id": "user_001",
  "content": "오늘은 좋은 하루였다.",
  "created_at": "2025-12-29T10:30:00Z"
}
```

#### 3. 메시지 삭제
```
DELETE /api/messages/:messageId
```

**응답 (204 No Content)**

#### 4. 요약 생성
```
POST /api/users/:userId/summaries
```

**요청 본문:**
```json
{
  "start_date": "2025-12-29T00:00:00Z",
  "end_date": "2025-12-29T23:59:59Z"
}
```

**응답 (200 OK):**
```json
{
  "summary": {
    "narrative": "오늘의 기록에서는 잔잔한 평온함이 느껴집니다...",
    "emotions": [
      {
        "type": "positive",
        "label": "평온",
        "percentage": 45
      },
      {
        "type": "neutral",
        "label": "그리움",
        "percentage": 35
      },
      {
        "type": "negative",
        "label": "쓸쓸함",
        "percentage": 20
      }
    ],
    "message_count": 5,
    "date_range": {
      "start": "2025-12-29T00:00:00Z",
      "end": "2025-12-29T23:59:59Z"
    }
  }
}
```

### 인증 미들웨어 (AWS Cognito)

모든 API 요청은 `Authorization` 헤더에 Cognito에서 발급한 JWT 토큰을 포함해야 합니다:

```
Authorization: Bearer <cognito_jwt_token>
```

미들웨어는 다음을 수행합니다:
1. Cognito JWT 토큰 검증 (서명, 만료 시간, issuer 확인)
2. 토큰에서 사용자 정보 추출 (sub, email 등)
3. `req.user` 객체에 사용자 정보 설정

```typescript
interface CognitoUser {
  sub: string;        // Cognito User ID (고유 식별자)
  email: string;
  email_verified: boolean;
  'cognito:username': string;
}
```

## 데이터 모델

### Message 테이블

```sql
CREATE TABLE messages (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  INDEX idx_user_created (user_id, created_at DESC),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### TypeScript 인터페이스

```typescript
interface Message {
  id: string;
  user_id: string;
  content: string;
  created_at: Date;
  updated_at?: Date;
}

interface CreateMessageDTO {
  content: string;
}

interface MessageQueryParams {
  limit?: number;
  offset?: number;
}

interface Emotion {
  type: 'positive' | 'neutral' | 'negative';
  label: string;
  percentage: number;
}

interface Summary {
  narrative: string;
  emotions: Emotion[];
  message_count: number;
  date_range: {
    start: string;
    end: string;
  };
}

interface SummaryRequest {
  start_date: string;
  end_date: string;
}
```


## 정확성 속성

*속성(Property)은 시스템의 모든 유효한 실행에서 참이어야 하는 특성 또는 동작입니다. 본질적으로 시스템이 무엇을 해야 하는지에 대한 형식적 진술입니다. 속성은 사람이 읽을 수 있는 명세와 기계가 검증할 수 있는 정확성 보장 사이의 다리 역할을 합니다.*

### Property 1: 메시지 조회 시 시간 역순 정렬
*모든* 사용자와 메시지 세트에 대해, 메시지를 조회하면 결과는 생성 시간 내림차순으로 정렬되어야 한다
**검증: 요구사항 1.1**

### Property 2: 페이지네이션 정확성
*모든* limit과 offset 조합에 대해, 반환된 메시지 수는 min(limit, 남은 메시지 수)와 같아야 하고, 메시지는 올바른 오프셋 위치에서 시작해야 한다
**검증: 요구사항 1.2**

### Property 3: 메시지 응답 필수 필드 포함
*모든* 메시지 응답에 대해, 각 메시지는 id, user_id, content, created_at 필드를 포함해야 한다
**검증: 요구사항 1.4**

### Property 4: 유효한 메시지 생성 성공
*모든* 비어있지 않은 메시지 내용에 대해, 메시지를 생성하면 고유한 ID를 가진 메시지가 반환되어야 하고, 이후 조회 시 해당 메시지가 포함되어야 한다
**검증: 요구사항 2.1**

### Property 5: 공백 메시지 거부
*모든* 공백 문자로만 구성된 문자열에 대해, 메시지 생성 요청은 거부되어야 하고 HTTP 상태 400을 반환해야 한다
**검증: 요구사항 2.2**

### Property 6: 생성 시간 자동 설정
*모든* 메시지 생성에 대해, 반환된 메시지의 created_at은 현재 서버 시간의 ±5초 이내여야 한다
**검증: 요구사항 2.3**

### Property 7: 메시지 생성 응답 형식
*모든* 성공적인 메시지 생성에 대해, HTTP 상태 201과 완전한 메시지 객체(id, user_id, content, created_at 포함)가 반환되어야 한다
**검증: 요구사항 2.4**

### Property 8: 메시지 삭제 후 조회 불가
*모든* 메시지에 대해, 메시지를 삭제한 후 조회하면 해당 메시지는 결과에 포함되지 않아야 하고 HTTP 상태 204가 반환되어야 한다
**검증: 요구사항 3.1, 3.4**

### Property 9: 타인 메시지 삭제 거부
*모든* 두 명의 서로 다른 사용자에 대해, 한 사용자가 다른 사용자의 메시지를 삭제하려고 하면 HTTP 상태 403이 반환되어야 하고 메시지는 삭제되지 않아야 한다
**검증: 요구사항 3.3**

### Property 10: 요약 생성 성공
*모든* 날짜 범위와 해당 범위 내의 메시지 세트에 대해, 요약을 요청하면 narrative, emotions, message_count를 포함하는 요약이 반환되어야 한다
**검증: 요구사항 4.1**

### Property 11: 요약 감정 최소 개수
*모든* 요약에 대해, emotions 배열은 최소 3개의 감정을 포함해야 하고, 각 감정은 type, label, percentage를 가져야 한다
**검증: 요구사항 4.2**

### Property 12: 요약 서술 텍스트 존재
*모든* 요약에 대해, narrative 필드는 비어있지 않은 문자열이어야 한다
**검증: 요구사항 4.3**

### Property 13: 날짜 범위 필터링
*모든* 날짜 범위에 대해, 요약 생성 시 해당 범위 밖에 생성된 메시지는 분석에 포함되지 않아야 한다
**검증: 요구사항 4.4**

### Property 14: 오류 응답 형식 일관성
*모든* API 오류에 대해, 응답은 JSON 형식이어야 하고 error 객체(code와 message 포함)를 포함해야 한다
**검증: 요구사항 5.1**

### Property 15: 인증 토큰 검증
*모든* API 엔드포인트에 대해, 유효한 인증 토큰 없이 요청하면 HTTP 상태 401이 반환되어야 한다
**검증: 요구사항 6.1, 6.2**

### Property 16: 응답 필드 명명 규칙
*모든* 성공 응답에 대해, JSON 객체의 모든 필드는 snake_case 명명 규칙을 따라야 한다
**검증: 요구사항 7.1**

### Property 17: 타임스탬프 형식
*모든* 타임스탬프 필드에 대해, 값은 ISO 8601 형식(YYYY-MM-DDTHH:mm:ssZ)이어야 하고 시간대 정보를 포함해야 한다
**검증: 요구사항 7.2**

### Property 18: 페이지네이션 메타데이터
*모든* 페이지네이션 응답에 대해, meta 객체는 total, limit, offset 필드를 포함해야 한다
**검증: 요구사항 7.3**

### Property 19: null 값 필드 포함
*모든* null 값을 가진 필드에 대해, 해당 필드는 응답에서 생략되지 않고 명시적으로 null 값과 함께 포함되어야 한다
**검증: 요구사항 7.5**

## 에러 처리

### 에러 응답 형식

모든 에러 응답은 다음 형식을 따릅니다:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "사람이 읽을 수 있는 에러 메시지",
    "details": {} // 선택적, 추가 정보
  }
}
```

### HTTP 상태 코드

- `200 OK`: 성공적인 조회
- `201 Created`: 리소스 생성 성공
- `204 No Content`: 성공적인 삭제
- `400 Bad Request`: 유효성 검증 실패
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 권한 부족
- `404 Not Found`: 리소스를 찾을 수 없음
- `500 Internal Server Error`: 서버 내부 오류

### 에러 코드

```typescript
enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  EMPTY_CONTENT = 'EMPTY_CONTENT',
  NO_MESSAGES_FOUND = 'NO_MESSAGES_FOUND'
}
```

### 에러 처리 미들웨어

```typescript
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // 에러 로깅
  logger.error({
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // 에러 응답
  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: err.message,
        details: err.details
      }
    });
  }

  // 기본 서버 에러
  res.status(500).json({
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: '서버 내부 오류가 발생했습니다.'
    }
  });
});
```

## 테스트 전략

### 단위 테스트

단위 테스트는 다음을 검증합니다:

1. **컨트롤러 테스트**
   - 요청 파라미터 파싱
   - 응답 형식화
   - 에러 처리

2. **서비스 테스트**
   - 비즈니스 로직 정확성
   - 엣지 케이스 처리
   - 외부 API 호출 (모킹)

3. **리포지토리 테스트**
   - 데이터베이스 쿼리 정확성
   - 트랜잭션 처리

4. **미들웨어 테스트**
   - 인증 토큰 검증
   - 에러 처리 로직

### 속성 기반 테스트 (Property-Based Testing)

속성 기반 테스트는 위에서 정의한 정확성 속성을 검증합니다. 이 프로젝트에서는 **fast-check** 라이브러리를 사용합니다.

**설정 요구사항:**
- 각 속성 기반 테스트는 최소 100회 반복 실행되어야 합니다
- 각 테스트는 설계 문서의 속성을 명시적으로 참조하는 주석을 포함해야 합니다
- 주석 형식: `// Feature: journal-api, Property {번호}: {속성 텍스트}`

**테스트 예시:**

```typescript
import fc from 'fast-check';

describe('Property-Based Tests', () => {
  // Feature: journal-api, Property 1: 메시지 조회 시 시간 역순 정렬
  it('should return messages in descending order by creation time', () => {
    fc.assert(
      fc.property(
        fc.array(messageArbitrary, { minLength: 1, maxLength: 50 }),
        async (messages) => {
          // 메시지 생성
          await Promise.all(messages.map(m => createMessage(m)));
          
          // 조회
          const result = await getMessages(userId);
          
          // 검증: 시간 역순 정렬
          for (let i = 0; i < result.length - 1; i++) {
            expect(result[i].created_at >= result[i + 1].created_at).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: journal-api, Property 5: 공백 메시지 거부
  it('should reject messages with only whitespace', () => {
    fc.assert(
      fc.property(
        fc.stringOf(fc.constantFrom(' ', '\t', '\n'), { minLength: 1 }),
        async (whitespaceContent) => {
          const response = await request(app)
            .post('/api/messages')
            .send({ content: whitespaceContent });
          
          expect(response.status).toBe(400);
          expect(response.body.error.code).toBe('EMPTY_CONTENT');
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### 통합 테스트

통합 테스트는 다음을 검증합니다:

1. **API 엔드포인트 통합**
   - 전체 요청-응답 사이클
   - 데이터베이스 상호작용
   - 인증 플로우

2. **외부 서비스 통합**
   - OpenAI API 호출
   - 에러 처리 및 재시도 로직

### 테스트 환경

- **단위 테스트**: Jest + Supertest
- **속성 기반 테스트**: fast-check
- **데이터베이스**: 테스트용 PostgreSQL (Docker)
- **모킹**: jest.mock() 및 nock (HTTP 모킹)

## 보안 고려사항

1. **인증**: AWS Cognito JWT 토큰 기반 인증
   - Cognito User Pool에서 발급한 토큰 검증
   - `aws-jwt-verify` 라이브러리 사용 권장
   - 토큰 서명 및 만료 시간 자동 검증
2. **권한 부여**: 사용자는 자신의 리소스만 접근 가능
   - Cognito `sub` (User ID)를 기준으로 리소스 소유권 확인
3. **입력 검증**: 모든 사용자 입력은 검증 및 살균(sanitization)
4. **SQL 인젝션 방지**: 파라미터화된 쿼리 사용
5. **Rate Limiting**: API 요청 속도 제한
6. **CORS**: 허용된 도메인만 접근 가능

## 성능 고려사항

1. **데이터베이스 인덱스**: user_id와 created_at에 복합 인덱스
2. **페이지네이션**: 대량 데이터 조회 시 메모리 효율성
3. **캐싱**: 자주 조회되는 데이터 캐싱 (Redis)
4. **비동기 처리**: 요약 생성은 비동기 작업으로 처리 가능

## 배포 고려사항

1. **환경 변수**: 데이터베이스 연결, API 키 등
2. **로깅**: 구조화된 로그 (Winston)
3. **모니터링**: 에러 추적 (Sentry), 성능 모니터링
4. **데이터베이스 마이그레이션**: 스키마 버전 관리
