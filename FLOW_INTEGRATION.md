# Flow API Integration

## 개요
JournalBook.tsx에 Bedrock Flow API를 통합하여 입력된 내용이 데이터인지 질문인지 자동으로 판단하고 적절히 처리하도록 구현했습니다.

## 변경사항

### 1. 새로운 타입 정의 (`src/types/flow.ts`)
```typescript
export interface FlowRequest {
  user_id: string;
  content: string;
  record_date: string;
  tags?: string[];
  s3_key?: string;
}

export interface FlowResponse {
  type: "data" | "answer" | "unknown";
  content: string;
  message: string;
  history_id?: string;
}
```

### 2. JournalBook.tsx 수정사항

#### 상태 추가
- `isAnswerDialogOpen`: 답변 팝업 표시 상태
- `answerContent`: 답변 내용 저장

#### API 호출 변경
기존 `/messages` 엔드포인트 대신 `/process` 엔드포인트 사용:

```typescript
const flowRequest: FlowRequest = {
  user_id: currentUserId,
  content: currentEntry.trim(),
  record_date: new Date().toISOString().split('T')[0],
  tags: []
};

const response = await fetch(`${API_BASE_URL}/process`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(flowRequest)
});
```

#### 응답 처리 로직
- **데이터인 경우 (`type: "data"`)**: 메시지 목록에 추가하여 저장된 것처럼 표시
- **질문인 경우 (`type: "answer"`)**: 답변 팝업을 띄워서 답변 내용 표시
- **알 수 없는 경우 (`type: "unknown"`)**: 에러 메시지 표시

#### 새로운 답변 팝업
질문에 대한 답변을 표시하는 모달 다이얼로그 추가:
- AI 답변을 깔끔하게 표시
- "이 답변은 저장되지 않습니다" 안내 메시지
- 확인 버튼으로 팝업 닫기

## 사용 방법

1. 사용자가 입력창에 텍스트를 입력하고 전송
2. 백엔드 Flow API가 입력 내용을 분석
3. 결과에 따라 자동으로 처리:
   - **일기/메모 등 데이터**: 메시지 목록에 추가되어 저장
   - **질문**: 답변 팝업으로 즉시 답변 표시

## 환경 설정

`.env` 파일에서 Journal API URL 설정:
```
VITE_JOURNAL_API_URL=http://localhost:8000
```

## 백엔드 요구사항

백엔드에서 다음 엔드포인트를 제공해야 합니다:
- `POST /process`: FlowRequest를 받아 FlowResponse 반환
- 응답 형식은 제공해주신 API 스펙과 동일

## 테스트 방법

1. 데이터 입력 테스트: "오늘 점심에 파스타를 먹었다"
2. 질문 입력 테스트: "파스타의 칼로리는 얼마나 될까?"
3. 각각 다른 방식으로 처리되는지 확인