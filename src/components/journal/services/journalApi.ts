import { FlowRequest, FlowResponse } from "@/types/flow";

export interface JournalEntry {
  id: string;
  user_id: string;
  content: string;
  created_at: Date;
}

export class JournalApiService {
  private apiBaseUrl: string;

  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl;
  }

  // 사용자 메시지 로드
  async loadUserEntries(userId: string, limit: number = 100, offset: number = 0): Promise<JournalEntry[]> {
    const apiUrl = `${this.apiBaseUrl}/messages?user_id=${userId}&limit=${limit}&offset=${offset}`;
    console.log('API 호출 시도:', apiUrl);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
    }
    
    const messages = await response.json();
    console.log('API 응답 성공:', messages.length, '개의 메시지');
    
    // API 응답의 created_at을 Date 객체로 변환
    return messages.map((msg: any) => ({
      ...msg,
      created_at: new Date(msg.created_at)
    }));
  }

  // Flow API를 통한 입력 처리
  async processEntry(flowRequest: FlowRequest): Promise<FlowResponse> {
    const response = await fetch(`${this.apiBaseUrl}/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(flowRequest)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }

  // 메시지 삭제
  async deleteEntry(entryId: string): Promise<void> {
    const response = await fetch(`${this.apiBaseUrl}/messages/${entryId}`, { 
      method: 'DELETE' 
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  // 메시지 내용 가져오기 (요약용)
  async getMessagesContent(userId: string, limit: number = 100, offset: number = 0): Promise<{ contents: string }> {
    const response = await fetch(`${this.apiBaseUrl}/messages/content?user_id=${userId}&limit=${limit}&offset=${offset}`);
    
    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status}`);
    }
    
    return await response.json();
  }

  // 히스토리 확인
  async checkHistory(userId: string): Promise<{ exists: boolean; record_date?: string; id?: string }> {
    const response = await fetch(`${this.apiBaseUrl}/summary/check/${userId}`);
    
    if (!response.ok) {
      throw new Error(`히스토리 확인 실패: ${response.status}`);
    }
    
    return await response.json();
  }

  // 히스토리 저장
  async saveHistory(historyData: any, isOverwrite: boolean = false, existingHistoryId?: string): Promise<any> {
    let response;
    
    if (isOverwrite && existingHistoryId) {
      // 덮어쓰기: PUT 요청으로 기존 히스토리 업데이트
      response = await fetch(`${this.apiBaseUrl}/history/${existingHistoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(historyData)
      });
    } else {
      // 새로 저장: POST 요청
      response = await fetch(`${this.apiBaseUrl}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(historyData)
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  // S3 키 확인
  async checkS3Key(historyId: string): Promise<{ s3_key: string | null }> {
    const response = await fetch(`${this.apiBaseUrl}/history/${historyId}/check-s3`);
    
    if (!response.ok) {
      throw new Error(`check-s3 API 호출 실패: ${response.status}`);
    }
    
    return await response.json();
  }

  // 날짜로 S3 키 확인
  async checkS3KeyByDate(userId: string, recordDate: string): Promise<{ found: boolean; s3_key?: string; history_id?: string }> {
    const response = await fetch(`${this.apiBaseUrl}/history/check-s3-by-date?user_id=${userId}&record_date=${recordDate}`);
    
    if (!response.ok) {
      throw new Error(`check-s3-by-date API 호출 실패: ${response.status}`);
    }
    
    return await response.json();
  }

  // 오늘 날짜 메시지 필터링
  filterTodayMessages(messages: JournalEntry[]): JournalEntry[] {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    console.log('오늘 날짜 (로컬):', todayStr);
    
    return messages.filter((msg: JournalEntry) => {
      const msgDate = new Date(msg.created_at);
      const msgDateStr = `${msgDate.getFullYear()}-${String(msgDate.getMonth() + 1).padStart(2, '0')}-${String(msgDate.getDate()).padStart(2, '0')}`;
      
      console.log('메시지 날짜 (로컬):', msgDateStr, '원본:', msg.created_at, '내용:', msg.content.substring(0, 20));
      
      return msgDateStr === todayStr;
    });
  }
}