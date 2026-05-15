-- =============================================
-- ระบบแจ้งซ่อมอุปกรณ์คอมพิวเตอร์
-- รร.ราชประชานุเคราะห์ 60 เชียงใหม่
-- รัน SQL นี้ใน Supabase Dashboard → SQL Editor
-- =============================================

-- 1. สร้างตาราง tickets
CREATE TABLE IF NOT EXISTS tickets (
  id          TEXT    PRIMARY KEY,
  title       TEXT    NOT NULL,
  device_type TEXT    NOT NULL,
  asset       TEXT    DEFAULT '',
  department  TEXT    NOT NULL,
  reporter    TEXT    NOT NULL,
  contact     TEXT    DEFAULT '',
  priority    TEXT    NOT NULL DEFAULT 'LOW',
  detail      TEXT    DEFAULT '',
  status      TEXT    NOT NULL DEFAULT 'NEW',
  tech        TEXT,
  images      JSONB   DEFAULT '[]'::jsonb,
  history     JSONB   DEFAULT '[]'::jsonb,
  created_at  BIGINT  NOT NULL,
  updated_at  BIGINT  NOT NULL
);

-- 2. เปิด Row Level Security
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- 3. ทุกคนอ่านได้ (สำหรับตรวจสอบสถานะ)
CREATE POLICY "public_read_tickets"
  ON tickets FOR SELECT USING (true);

-- 4. ทุกคนแจ้งซ่อมได้
CREATE POLICY "public_insert_tickets"
  ON tickets FOR INSERT WITH CHECK (true);

-- 5. เฉพาะผู้ login แล้วอัพเดทได้ (admin/tech)
CREATE POLICY "auth_update_tickets"
  ON tickets FOR UPDATE
  USING (auth.role() = 'authenticated');

-- =============================================
-- Storage: สร้าง bucket สำหรับรูปภาพ
-- ตรงนี้ทำใน Supabase Dashboard → Storage → New Bucket
--   Name: ticket-images
--   Public: เปิด ✓
-- หรือรัน SQL ด้านล่าง:
-- =============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ticket-images',
  'ticket-images',
  true,
  5242880,
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public_upload_images"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (bucket_id = 'ticket-images');

CREATE POLICY "public_read_images"
  ON storage.objects FOR SELECT TO anon
  USING (bucket_id = 'ticket-images');

-- =============================================
-- หลัง setup database เสร็จ:
-- ไปที่ Authentication → Users → Add user
-- สร้างบัญชีดังนี้:
--   admin@r60.ac.th  รหัสผ่านตามต้องการ (ผู้ดูแลระบบ)
--   tech@r60.ac.th   รหัสผ่านตามต้องการ (ช่างเทคนิค)
-- =============================================
