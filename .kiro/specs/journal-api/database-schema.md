# 데이터베이스 스키마 설계

## 개요

이 문서는 Journal API를 위한 PostgreSQL 데이터베이스 스키마를 정의합니다. AWS Cognito를 통한 사용자 인증을 사용하며, 메시지 저장 및 조회에 최적화된 구조를 제공합니다.

## ERD (Entity Relationship Diagram)

```
┌─────────────────────────┐
│        users            │
├─────────────────────────┤
│ id (PK)                 │ VARCHAR(255)
│ cognito_sub             │ VARCHAR(255) UNIQUE
│ email                   │ VARCHAR(255)
│ username                │ VARCHAR(255)
│ created_at              │ TIMESTAMP WITH TIME ZONE
│ updated_at              │ TIMESTAMP WITH TIME ZONE
└─────────────────────────┘
            │
            │ 1:N
            ▼
┌─────────────────────────┐
│       messages          │
├─────────────────────────┤
│ id (PK)                 │ VARCHAR(255)
│ user_id (FK)            │ VARCHAR(255)
│ content                 │ TEXT
│ created_at              │ TIMESTAMP WITH TIME ZONE
│ updated_at              │ TIMESTAMP WITH TIME ZONE
│ deleted_at              │ TIMESTAMP WITH TIME ZONE (nullable)
└─────────────────────────┘
            │
            │ 1:N
            ▼
┌─────────────────────────┐
│      summaries          │
├─────────────────────────┤
│ id (PK)                 │ VARCHAR(255)
│ user_id (FK)            │ VARCHAR(255)
│ narrative               │ TEXT
│ message_count           │ INTEGER
│ start_date              │ TIMESTAMP WITH TIME ZONE
│ end_date                │ TIMESTAMP WITH TIME ZONE
│ created_at              │ TIMESTAMP WITH TIME ZONE
└─────────────────────────┘
            │
            │ 1:N
            ▼
┌─────────────────────────┐
│   summary_emotions      │
├─────────────────────────┤
│ id (PK)                 │ SERIAL
│ summary_id (FK)         │ VARCHAR(255)
│ type                    │ VARCHAR(50)
│ label                   │ VARCHAR(100)
│ percentage              │ DECIMAL(5,2)
└─────────────────────────┘
```

## 테이블 정의

### 1. users 테이블

사용자 정보를 저장하는 테이블입니다. AWS Cognito와 연동되며, Cognito의 `sub` 값을 저장합니다.

```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  cognito_sub VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  username VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE UNIQUE INDEX idx_users_cognito_sub ON users(cognito_sub);
CREATE INDEX idx_users_email ON users(email);

-- 코멘트
COMMENT ON TABLE users IS '사용자 정보 테이블 (AWS Cognito 연동)';
COMMENT ON COLUMN users.id IS '사용자 고유 ID';
COMMENT ON COLUMN users.cognito_sub IS 'AWS Cognito User Pool의 sub 값';
COMMENT ON COLUMN users.email IS '사용자 이메일';
COMMENT ON COLUMN users.username IS '사용자 이름';
```

**필드 설명:**
- `id`: 시스템 내부에서 사용하는 사용자 고유 식별자 (UUID 권장)
- `cognito_sub`: AWS Cognito User Pool의 `sub` 클레임 값 (고유 식별자)
- `email`: 사용자 이메일 주소
- `username`: 사용자 표시 이름
- `created_at`: 레코드 생성 시간
- `updated_at`: 레코드 수정 시간

**제약 조건:**
- `cognito_sub`는 UNIQUE 제약 조건으로 중복 방지
- `email`은 NOT NULL

### 2. messages 테이블

사용자가 작성한 일기 메시지를 저장하는 핵심 테이블입니다.

```sql
CREATE TABLE messages (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  
  CONSTRAINT fk_messages_user
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE
);

-- 인덱스
CREATE INDEX idx_messages_user_created ON messages(user_id, created_at DESC);
CREATE INDEX idx_messages_user_deleted ON messages(user_id, deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- 코멘트
COMMENT ON TABLE messages IS '사용자 일기 메시지 테이블';
COMMENT ON COLUMN messages.id IS '메시지 고유 ID';
COMMENT ON COLUMN messages.user_id IS '메시지 작성자 ID (users 테이블 참조)';
COMMENT ON COLUMN messages.content IS '메시지 내용';
COMMENT ON COLUMN messages.deleted_at IS 'Soft delete를 위한 삭제 시간 (NULL이면 활성 상태)';
```

**필드 설명:**
- `id`: 메시지 고유 식별자 (UUID 또는 `msg_` 접두사 + 고유값)
- `user_id`: 메시지를 작성한 사용자의 ID (users 테이블 외래키)
- `content`: 메시지 본문 (TEXT 타입으로 긴 내용 지원)
- `created_at`: 메시지 생성 시간
- `updated_at`: 메시지 수정 시간
- `deleted_at`: Soft delete를 위한 삭제 시간 (NULL이면 활성 상태)

**제약 조건:**
- `user_id`는 users 테이블의 `id`를 참조하는 외래키
- `ON DELETE CASCADE`: 사용자 삭제 시 해당 사용자의 모든 메시지도 삭제
- `content`는 NOT NULL (빈 메시지 방지)

**인덱스 전략:**
- `idx_messages_user_created`: 사용자별 메시지 조회 및 시간순 정렬에 최적화 (복합 인덱스)
- `idx_messages_user_deleted`: Soft delete된 메시지 제외 조회 최적화 (부분 인덱스)
- `idx_messages_created_at`: 전체 메시지 시간순 조회 최적화

### 3. summaries 테이블

AI가 생성한 메시지 요약 정보를 저장하는 테이블입니다.

```sql
CREATE TABLE summaries (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  narrative TEXT NOT NULL,
  message_count INTEGER NOT NULL DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_summaries_user
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE,
  
  CONSTRAINT chk_summaries_date_range
    CHECK (end_date >= start_date),
  
  CONSTRAINT chk_summaries_message_count
    CHECK (message_count >= 0)
);

-- 인덱스
CREATE INDEX idx_summaries_user_created ON summaries(user_id, created_at DESC);
CREATE INDEX idx_summaries_date_range ON summaries(user_id, start_date, end_date);

-- 코멘트
COMMENT ON TABLE summaries IS 'AI 생성 메시지 요약 테이블';
COMMENT ON COLUMN summaries.id IS '요약 고유 ID';
COMMENT ON COLUMN summaries.user_id IS '요약 대상 사용자 ID';
COMMENT ON COLUMN summaries.narrative IS 'AI가 생성한 서술형 요약 텍스트';
COMMENT ON COLUMN summaries.message_count IS '요약에 포함된 메시지 수';
COMMENT ON COLUMN summaries.start_date IS '요약 대상 기간 시작일';
COMMENT ON COLUMN summaries.end_date IS '요약 대상 기간 종료일';
```

**필드 설명:**
- `id`: 요약 고유 식별자
- `user_id`: 요약을 요청한 사용자 ID
- `narrative`: AI가 생성한 서술형 요약 텍스트
- `message_count`: 요약에 포함된 메시지 개수
- `start_date`: 요약 대상 기간의 시작 날짜/시간
- `end_date`: 요약 대상 기간의 종료 날짜/시간
- `created_at`: 요약 생성 시간

**제약 조건:**
- `end_date`는 `start_date`보다 크거나 같아야 함
- `message_count`는 0 이상이어야 함

### 4. summary_emotions 테이블

요약에 포함된 감정 분석 결과를 저장하는 테이블입니다.

```sql
CREATE TABLE summary_emotions (
  id SERIAL PRIMARY KEY,
  summary_id VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  label VARCHAR(100) NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  
  CONSTRAINT fk_emotions_summary
    FOREIGN KEY (summary_id) 
    REFERENCES summaries(id) 
    ON DELETE CASCADE,
  
  CONSTRAINT chk_emotions_type
    CHECK (type IN ('positive', 'neutral', 'negative')),
  
  CONSTRAINT chk_emotions_percentage
    CHECK (percentage >= 0 AND percentage <= 100)
);

-- 인덱스
CREATE INDEX idx_emotions_summary ON summary_emotions(summary_id);

-- 코멘트
COMMENT ON TABLE summary_emotions IS '요약 감정 분석 결과 테이블';
COMMENT ON COLUMN summary_emotions.id IS '감정 레코드 고유 ID';
COMMENT ON COLUMN summary_emotions.summary_id IS '연관된 요약 ID';
COMMENT ON COLUMN summary_emotions.type IS '감정 유형 (positive/neutral/negative)';
COMMENT ON COLUMN summary_emotions.label IS '감정 레이블 (예: 평온, 그리움, 쓸쓸함)';
COMMENT ON COLUMN summary_emotions.percentage IS '감정 비율 (0-100)';
```

**필드 설명:**
- `id`: 감정 레코드 고유 식별자 (자동 증가)
- `summary_id`: 연관된 요약의 ID (summaries 테이블 외래키)
- `type`: 감정 유형 (`positive`, `neutral`, `negative` 중 하나)
- `label`: 감정을 나타내는 한글 레이블 (예: "평온", "그리움", "쓸쓸함")
- `percentage`: 해당 감정의 비율 (0-100 사이의 값)

**제약 조건:**
- `type`은 `positive`, `neutral`, `negative` 중 하나만 허용
- `percentage`는 0 이상 100 이하의 값만 허용
- `summary_id`는 summaries 테이블의 `id`를 참조하는 외래키

## 데이터 타입 선택 이유

### VARCHAR(255) vs UUID
- **VARCHAR(255)**: 유연성을 위해 선택. `msg_`, `user_` 등의 접두사를 사용한 가독성 있는 ID 생성 가능
- 대안으로 UUID 타입 사용 가능 (성능 최적화 시 고려)

### TEXT vs VARCHAR
- **TEXT**: 메시지 내용과 요약 텍스트는 길이 제한이 없어야 하므로 TEXT 사용
- PostgreSQL에서 TEXT와 VARCHAR의 성능 차이는 거의 없음

### TIMESTAMP WITH TIME ZONE
- 글로벌 서비스를 고려하여 시간대 정보를 포함하는 타입 사용
- ISO 8601 형식 지원으로 API 응답과 일관성 유지

### DECIMAL(5,2) for percentage
- 소수점 2자리까지 정확한 백분율 표현 (예: 45.67%)
- FLOAT보다 정확한 계산 가능

## 인덱스 전략

### 복합 인덱스 (Composite Index)
```sql
CREATE INDEX idx_messages_user_created ON messages(user_id, created_at DESC);
```
- 사용자별 메시지 조회 + 시간순 정렬을 한 번의 인덱스 스캔으로 처리
- 가장 빈번한 쿼리 패턴에 최적화

### 부분 인덱스 (Partial Index)
```sql
CREATE INDEX idx_messages_user_deleted ON messages(user_id, deleted_at) WHERE deleted_at IS NULL;
```
- Soft delete된 메시지를 제외한 활성 메시지만 인덱싱
- 인덱스 크기 감소 및 조회 성능 향상

### 커버링 인덱스 고려사항
필요시 다음과 같은 커버링 인덱스 추가 가능:
```sql
CREATE INDEX idx_messages_user_created_covering 
ON messages(user_id, created_at DESC) 
INCLUDE (id, content);
```

## Soft Delete 전략

메시지는 물리적으로 삭제하지 않고 `deleted_at` 필드를 사용한 Soft Delete 방식을 사용합니다.

**장점:**
- 실수로 삭제한 데이터 복구 가능
- 감사(Audit) 및 분석 목적으로 삭제된 데이터 보존
- 데이터 무결성 유지

**쿼리 예시:**
```sql
-- 활성 메시지만 조회
SELECT * FROM messages 
WHERE user_id = $1 AND deleted_at IS NULL
ORDER BY created_at DESC;

-- Soft delete 수행
UPDATE messages 
SET deleted_at = NOW() 
WHERE id = $1;

-- 영구 삭제 (필요시)
DELETE FROM messages 
WHERE deleted_at < NOW() - INTERVAL '30 days';
```

## 마이그레이션 스크립트

### 초기 스키마 생성 (V1)

```sql
-- V1__initial_schema.sql

-- users 테이블 생성
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  cognito_sub VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  username VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_users_cognito_sub ON users(cognito_sub);
CREATE INDEX idx_users_email ON users(email);

-- messages 테이블 생성
CREATE TABLE messages (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  
  CONSTRAINT fk_messages_user
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE
);

CREATE INDEX idx_messages_user_created ON messages(user_id, created_at DESC);
CREATE INDEX idx_messages_user_deleted ON messages(user_id, deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- summaries 테이블 생성
CREATE TABLE summaries (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  narrative TEXT NOT NULL,
  message_count INTEGER NOT NULL DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_summaries_user
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE,
  
  CONSTRAINT chk_summaries_date_range
    CHECK (end_date >= start_date),
  
  CONSTRAINT chk_summaries_message_count
    CHECK (message_count >= 0)
);

CREATE INDEX idx_summaries_user_created ON summaries(user_id, created_at DESC);
CREATE INDEX idx_summaries_date_range ON summaries(user_id, start_date, end_date);

-- summary_emotions 테이블 생성
CREATE TABLE summary_emotions (
  id SERIAL PRIMARY KEY,
  summary_id VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  label VARCHAR(100) NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  
  CONSTRAINT fk_emotions_summary
    FOREIGN KEY (summary_id) 
    REFERENCES summaries(id) 
    ON DELETE CASCADE,
  
  CONSTRAINT chk_emotions_type
    CHECK (type IN ('positive', 'neutral', 'negative')),
  
  CONSTRAINT chk_emotions_percentage
    CHECK (percentage >= 0 AND percentage <= 100)
);

CREATE INDEX idx_emotions_summary ON summary_emotions(summary_id);
```

### 트리거 설정 (updated_at 자동 갱신)

```sql
-- V2__add_updated_at_triggers.sql

-- updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- users 테이블 트리거
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- messages 테이블 트리거
CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

## 샘플 데이터

```sql
-- 테스트용 샘플 데이터
INSERT INTO users (id, cognito_sub, email, username) VALUES
('user_001', 'cognito-sub-123456', 'user1@example.com', '사용자1'),
('user_002', 'cognito-sub-789012', 'user2@example.com', '사용자2');

INSERT INTO messages (id, user_id, content) VALUES
('msg_001', 'user_001', '오늘은 정말 좋은 하루였다. 친구들과 즐거운 시간을 보냈다.'),
('msg_002', 'user_001', '날씨가 좋아서 산책을 했다. 기분이 상쾌하다.'),
('msg_003', 'user_001', '조금 피곤하지만 보람찬 하루였다.');
```

## 성능 최적화 권장사항

### 1. 파티셔닝 (Partitioning)
메시지 데이터가 많아질 경우 날짜 기반 파티셔닝 고려:
```sql
-- 월별 파티셔닝 예시
CREATE TABLE messages_2025_01 PARTITION OF messages
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

### 2. 아카이빙 전략
오래된 메시지는 별도 아카이브 테이블로 이동:
```sql
CREATE TABLE messages_archive (LIKE messages INCLUDING ALL);
```

### 3. 연결 풀링 (Connection Pooling)
- 애플리케이션 레벨에서 pg-pool 또는 pgbouncer 사용
- 최대 연결 수 제한 및 재사용

### 4. 쿼리 최적화
```sql
-- EXPLAIN ANALYZE로 쿼리 성능 분석
EXPLAIN ANALYZE
SELECT * FROM messages 
WHERE user_id = 'user_001' AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 100;
```

## 백업 및 복구 전략

### 정기 백업
```bash
# 전체 데이터베이스 백업
pg_dump -h localhost -U postgres journal_db > backup_$(date +%Y%m%d).sql

# 특정 테이블만 백업
pg_dump -h localhost -U postgres -t messages journal_db > messages_backup.sql
```

### Point-in-Time Recovery (PITR)
- WAL (Write-Ahead Logging) 아카이빙 활성화
- 특정 시점으로 복구 가능

## 보안 고려사항

### 1. 행 수준 보안 (Row Level Security)
```sql
-- RLS 활성화
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 정책 생성: 사용자는 자신의 메시지만 조회 가능
CREATE POLICY messages_select_policy ON messages
FOR SELECT
USING (user_id = current_setting('app.current_user_id'));
```

### 2. 암호화
- 민감한 데이터는 애플리케이션 레벨에서 암호화
- PostgreSQL의 pgcrypto 확장 사용 가능

### 3. 접근 제어
```sql
-- 읽기 전용 사용자 생성
CREATE USER readonly_user WITH PASSWORD 'secure_password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
```

## 모니터링 쿼리

### 테이블 크기 확인
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 인덱스 사용률 확인
```sql
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### 느린 쿼리 확인
```sql
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```
