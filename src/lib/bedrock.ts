import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

// AWS Bedrock 클라이언트 설정
const client = new BedrockRuntimeClient({
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});

export interface JournalEntry {
  id: string;
  content: string;
  created_at: Date;
}

export interface SummaryResult {
  summary: string;
}

export async function summarizeJournalEntries(userId: string, apiBaseUrl: string): Promise<SummaryResult> {
  try {
    console.log('Bedrock 요약 시작 - 사용자:', userId);
    
    // 새로운 API 엔드포인트에서 메시지 내용 가져오기
    console.log('API에서 메시지 내용 가져오는 중...');
    const apiResponse = await fetch(`${apiBaseUrl}/messages/content?user_id=${userId}&limit=100&offset=0`);
    
    if (!apiResponse.ok) {
      throw new Error(`API 호출 실패: ${apiResponse.status} ${apiResponse.statusText}`);
    }
    
    const data = await apiResponse.json();
    const combinedContent = data.contents;
    
    if (!combinedContent || combinedContent.trim() === '') {
      throw new Error('요약할 내용이 없습니다.');
    }
    
    console.log('메시지 내용 가져오기 완료, 길이:', combinedContent.length);
    console.log('프롬프트 생성 완료, Bedrock API 호출 중...');

    // Claude 3 Haiku 모델을 위한 프롬프트 구성
    const prompt = `Human: 다음은 한 사람이 하루 동안 작성한 일기 내용들입니다. 이를 바탕으로 따뜻하고 공감적인 톤으로 요약해주세요.

일기 내용:
${combinedContent}

요약은 2-3문단으로 작성하되, 개인적이고 따뜻한 톤으로 작성해주세요. 일기 작성자에게 격려와 위로가 되도록 해주세요.
Assistant: `;

    const modelId = import.meta.env.VITE_BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0';

    // Bedrock 요청 페이로드 구성
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

    // Bedrock API 호출
    const command = new InvokeModelCommand({
      modelId,
      body: JSON.stringify(payload),
      contentType: 'application/json',
    });

    console.log('Bedrock API 요청 전송 중...');
    const bedrockResponse = await client.send(command);
    console.log('Bedrock API 응답 수신 완료');
    
    // Bedrock 응답 body 처리 (Uint8Array를 문자열로 변환)
    const responseBodyBytes = bedrockResponse.body;
    if (!responseBodyBytes) {
      throw new Error('Bedrock API 응답이 비어있습니다.');
    }
    
    const responseBodyText = new TextDecoder().decode(responseBodyBytes);
    const responseBody = JSON.parse(responseBodyText);
    
    // Claude 응답에서 텍스트 추출
    const summary = responseBody.content[0].text.trim();
    
    console.log('요약 생성 완료:', summary.length, '자');

    return {
      summary
    };

  } catch (error) {
    console.error('Bedrock 요약 실패:', error);
    
    // 구체적인 에러 정보 로깅
    if (error instanceof Error) {
      console.error('에러 메시지:', error.message);
      console.error('에러 스택:', error.stack);
    }
    
    // 에러를 다시 throw하여 UI에서 처리할 수 있도록 함
    throw new Error(`AI 요약 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}