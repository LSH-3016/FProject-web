# AI 요약 기능 구현 가이드

## 개요
JournalBook 컴포넌트에 AWS Bedrock을 활용한 AI 요약 기능을 구현했습니다. 사용자가 작성한 일기 내용을 Claude 3 모델이 분석하여 따뜻하고 공감적인 요약을 생성합니다.

## 1. AWS Bedrock 설정

### 1.1 AWS 계정 준비
```bash
# 필요한 AWS 서비스
- Amazon Bedrock
- IAM (Identity and Access Management)
```

### 1.2 IAM 사용자 생성 및 권한 설정
1. AWS Console → IAM → Users → Create user
2. 사용자 이름: `bedrock-journal-user`
3. 권한 정책 연결: `AmazonBedrockFullAccess`
4. Access Key 생성 (Application running outside AWS)

### 1.3 Bedrock 모델 액세스 활성화
```bash
# AWS Console → Amazon Bedrock → Model access
# 활성화할 모델:
- anthropic.claude-3-haiku-20240307-v1:0 (권장: 빠르고 경제적)
- anthropic.claude-3-sonnet-20240229-v1:0 (균형잡힌 성능)
- anthropic.claude-3-5-sonnet-20241022-v2:0 (최고 성능)
```

## 2. 프로젝트 설정

### 2.1 패키지 설치
```bash
npm install @aws-sdk/client-bedrock-runtime
```

### 2.2 환경 변수 설정
```env
# .env 파일
VITE_API_BASE_URL=http://localhost:8000

# AWS Bedrock Configuration
VITE_AWS_ACCESS_KEY_ID=your_actual_access_key_here
VITE_AWS_SECRET_ACCESS_KEY=your_actual_secret_key_here
VITE_AWS_REGION=us-east-1
VITE_BEDROCK_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
```

## 3. 코드 구현

### 3.1 Bedrock 클라이언트 설정 (`src/lib/bedrock.ts`)

#### AWS SDK 클라이언트 초기화
```typescript
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

const client = new BedrockRuntimeClient({
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});
```

#### 타입 정의
```typescript
export interface JournalEntry {
  id: string;
  content: string;
  created_at: Date;
}

export interface SummaryResult {
  summary: string;
}
```

### 3.2 AI 요약 함수 구현

#### API 엔드포인트 호출
```typescript
export async function summarizeJournalEntries(userId: string, apiBaseUrl: string): Promise<SummaryResult> {
  try {
    console.log('Bedrock 요약 시작 - 사용자:', userId);
    
    // 새로운 API 엔드포인트에서 메시지 내용 가져오기
    const response = await fetch(`${apiBaseUrl}/messages/content?user_id=${userId}&limit=100&offset=0`);
    
    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const combinedContent = data.contents; // 콤마로 구분된 모든 메시지 내용
    
    // Bedrock API로 요약 요청...
  }
}
```

#### 프롬프트 엔지니어링
```typescript
const prompt = `Human: 다음은 한 사람이 하루 동안 작성한 일기 내용들입니다. 이를 바탕으로 따뜻하고 공감적인 톤으로 요약해주세요.

일기 내용:
${combinedContent}

요약은 2-3문단으로 작성하되, 개인적이고 따뜻한 톤으로 작성해주세요. 일기 작성자에게 격려와 위로가 되도록 해주세요.
Assistant: `;
```

#### Bedrock API 호출
```typescript
export async function summarizeJournalEntries(entries: JournalEntry[]): Promise<SummaryResult> {
  try {
    // 1. 일기 내용들을 하나의 텍스트로 합치기
    const combinedContent = entries.map((entry, idx) => 
      `${idx + 1}. ${entry.content}`
    ).join('\n\n');

    // 2. Claude 모델 ID 설정
    const modelId = import.meta.env.VITE_BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0';

    // 3. Bedrock 요청 페이로드 구성
    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    };

    // 4. Bedrock API 호출
    const command = new InvokeModelCommand({
      modelId,
      body: JSON.stringify(payload),
      contentType: 'application/json',
    });

    const response = await client.send(command);
    
    // 5. 응답 파싱
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const summary = responseBody.content[0].text.trim();
    
    return { summary };
    
  } catch (error) {
    // 에러 처리 및 폴백
    console.error('Bedrock 요약 실패:', error);
    return getFallbackSummary(entries.length);
  }
}
```

### 3.3 React 컴포넌트 통합 (`JournalBook.tsx`)

#### 상태 관리
```typescript
// AI 요약 관련 상태
const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);
const [summaryError, setSummaryError] = useState<string | null>(null);
const [dialogStep, setDialogStep] = useState<"confirm" | "loading" | "result">("confirm");
```

#### React 컴포넌트에서 호출
```typescript
const proceedToResult = async () => {
  setDialogStep("loading");
  setSummaryError(null);
  
  try {
    setLoadingMessage("API에서 일기 내용을 가져오는 중...");
    
    // 새로운 API 엔드포인트를 사용하여 요약 생성
    const result = await summarizeJournalEntries(currentUserId, API_BASE_URL);
    
    setSummaryResult(result);
    setDialogStep("result");
  } catch (error) {
    // 에러 처리...
  }
};
```

#### UI 렌더링
```typescript
// AI 요약 텍스트 표시
<div className="font-handwriting text-xl text-stone-800">
  {summaryResult?.summary || "요약을 불러오는 중입니다..."}
</div>
```

## 4. 데이터 플로우

### 4.1 요약 생성 과정
```
1. 사용자가 "요약하기" 버튼 클릭
   ↓
2. 확인 다이얼로그 표시
   ↓
3. 사용자 확인 시 로딩 상태로 전환
   ↓
4. `/messages/content` API에서 사용자의 모든 메시지 내용 가져오기
   ↓
5. 가져온 내용을 AWS Bedrock Claude 모델에 프롬프트로 전송
   ↓
6. AI 응답을 요약으로 파싱
   ↓
7. 결과를 UI에 표시
```

### 4.2 API 엔드포인트 활용
```
GET /messages/content?user_id={userId}&limit=100&offset=0

응답 형태:
{
  "contents": "첫 번째 메시지, 두 번째 메시지, 세 번째 메시지, ..."
}
```

이 엔드포인트는:
- 사용자의 모든 메시지를 시간순으로 정렬
- 콤마로 구분된 하나의 문자열로 반환
- Bedrock API에 바로 전송할 수 있는 형태로 제공

### 4.2 에러 처리
```typescript
// 네트워크 오류, API 오류 등에 대한 폴백
catch (error) {
  console.error('Bedrock 요약 실패:', error);
  return {
    summary: `기본 요약 메시지...`
  };
}
```

## 5. 보안 고려사항

### 5.1 환경 변수 보안
- `.env` 파일을 `.gitignore`에 추가
- 프로덕션에서는 환경 변수를 안전하게 관리
- AWS IAM 권한을 최소한으로 제한

### 5.2 API 키 관리
```bash
# 개발 환경
VITE_AWS_ACCESS_KEY_ID=개발용_키

# 프로덕션 환경 (서버 사이드에서 처리 권장)
# 클라이언트 사이드에서 직접 AWS 키 사용은 보안상 위험
```

## 6. 성능 최적화

### 6.1 모델 선택 기준
- **Claude 3 Haiku**: 빠른 응답, 저비용 (일반적인 요약용)
- **Claude 3 Sonnet**: 균형잡힌 성능 (복잡한 내용 분석)
- **Claude 3.5 Sonnet**: 최고 품질 (정교한 분석 필요시)

### 6.2 비용 관리
```typescript
// 토큰 수 제한으로 비용 관리
const payload = {
  max_tokens: 1000, // 응답 길이 제한
  // ...
};
```

## 7. 확장 가능성

### 7.1 추가 기능 아이디어
- 요약 스타일 선택 (간결한/상세한/격려적인)
- 개인화된 조언 생성
- 다국어 요약 지원
- 음성 요약 기능

### 7.2 다른 AI 모델 통합
```typescript
// 다른 Bedrock 모델 사용 예시
const modelOptions = {
  'claude': 'anthropic.claude-3-haiku-20240307-v1:0',
  'titan': 'amazon.titan-text-express-v1',
  'llama': 'meta.llama2-70b-chat-v1'
};
```

이 구현을 통해 사용자의 일기를 AI가 분석하여 의미있는 요약을 제공하는 개인화된 저널링 경험을 만들 수 있습니다.