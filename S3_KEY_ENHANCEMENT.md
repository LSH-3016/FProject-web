# S3 Key 확인 및 사진 버튼 개선

## 개요
요약하기 화면에서 기존 히스토리에 사진이 첨부되어 있는지 미리 확인하고, 상황에 따라 적절한 버튼을 표시하도록 개선했습니다.

## 주요 변경사항

### 1. 요약 시작 시 S3 Key 확인
- `handleOpenAnalysis` 함수에서 요약 다이얼로그를 열기 전에 기존 히스토리의 s3_key를 확인
- 히스토리가 존재하면 해당 히스토리의 s3_key 상태를 미리 조회
- 확인 중일 때는 로딩 상태 표시

### 2. 상황별 버튼 표시

#### 2-1. S3 Key 확인 중
```tsx
<Button disabled>
  <Loader2 className="animate-spin" />
  확인중...
</Button>
```

#### 2-2. 기존 사진이 있는 경우
```tsx
<Button disabled title="사진 변경 기능은 추후 지원 예정입니다">
  <Image />
  사진변경
</Button>
```
- 버튼이 비활성화되어 있음
- 툴팁으로 추후 지원 예정임을 안내

#### 2-3. 기존 사진이 없는 경우
```tsx
<Button onClick={() => imageInputRef.current?.click()}>
  <Image />
  사진추가
</Button>
```
- 기존과 동일한 사진 추가 기능

### 3. 기존 사진 정보 표시 (비활성화)
기존 사진 미리보기 기능은 API 미구현으로 현재 주석 처리되어 있습니다:
```tsx
{/* 기존 사진 미리보기 - 추후 API 구현 후 활성화 예정
{existingS3Key && !selectedImage && (
  <div className="mt-6 space-y-2">
    <p className="text-sm font-serif text-stone-600">기존 첨부 사진</p>
    <div className="inline-block p-3 bg-stone-100 rounded border border-stone-300">
      <div className="flex items-center gap-2 text-stone-600">
        <Image className="w-4 h-4" />
        <span className="text-sm">사진이 첨부되어 있습니다</span>
      </div>
    </div>
  </div>
)}
*/}
```

## 구현 세부사항

### useJournalSummary 훅 변경
- `existingS3Key` 상태 추가
- `isCheckingS3Key` 로딩 상태 추가
- `handleOpenAnalysis`에서 비동기로 s3_key 확인

### SummaryDialog 컴포넌트 변경
- 새로운 props 추가: `existingS3Key`, `isCheckingS3Key`
- 조건부 버튼 렌더링 로직 추가
- 기존 사진 정보 표시 영역은 주석 처리 (추후 구현 예정)

### JournalBook 메인 컴포넌트
- 새로운 상태값들을 SummaryDialog에 전달

## 사용자 경험 개선
1. **명확한 상태 표시**: 사진 버튼을 통해 기존 사진 존재 여부 확인 가능
2. **적절한 버튼 텍스트**: "사진추가" vs "사진변경"으로 상황에 맞는 텍스트
3. **비활성화 안내**: 사진 변경 기능이 아직 지원되지 않음을 명확히 안내
4. **로딩 피드백**: S3 키 확인 중일 때 로딩 상태 표시

## 현재 상태
- ✅ S3 키 확인 로직 구현
- ✅ 상황별 버튼 표시 구현
- ⏳ 사진 변경 기능 (API 구현 후 활성화 예정)
- ⏳ 기존 사진 미리보기 (API 구현 후 활성화 예정)

## 향후 확장 계획
1. **사진 변경 API 구현**
   - 기존 사진 삭제 후 새 사진 업로드
   - "사진변경" 버튼 활성화

2. **기존 사진 미리보기 API 구현**
   - S3에서 사진 URL 가져오기
   - 기존 사진 정보 표시 영역 활성화
   - 사진 미리보기 기능 추가

3. **추가 기능**
   - 사진 삭제 기능
   - 사진 교체 시 확인 다이얼로그