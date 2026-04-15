-- 점령 타이머 기능을 위한 DB 마이그레이션
-- Supabase SQL 에디터에서 실행하세요

-- 1. 기존 captured_tiles 테이블에 새 컬럼 추가
ALTER TABLE captured_tiles
ADD COLUMN IF NOT EXISTS capture_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS capture_status TEXT DEFAULT 'captured';

-- 2. capture_status 인덱스 추가 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_captured_tiles_status ON captured_tiles(capture_status);

-- 3. RLS (Row Level Security) 활성화 (이미 활성화되어 있다면 생략)
-- ALTER TABLE captured_tiles ENABLE ROW LEVEL SECURITY;

-- 4.所有人 읽기/쓰기 권한 설정
CREATE POLICY "Allow all access to captured_tiles" ON captured_tiles
FOR ALL USING (true) WITH CHECK (true);
