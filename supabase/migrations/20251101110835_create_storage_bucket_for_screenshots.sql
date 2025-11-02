/*
  # ストレージバケットの作成

  1. 新しいストレージバケット
    - `screenshots` バケット - スクリーンショット画像を保存
    - パブリックアクセスを許可
    
  2. セキュリティ
    - 認証済みユーザーのみアップロード可能
    - 全てのユーザーが読み取り可能
*/

-- Create storage bucket for screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('screenshots', 'screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload screenshots
CREATE POLICY "Authenticated users can upload screenshots"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'screenshots');

-- Allow everyone to read screenshots
CREATE POLICY "Anyone can read screenshots"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'screenshots');

-- Allow authenticated users to update their own screenshots
CREATE POLICY "Authenticated users can update screenshots"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'screenshots');

-- Allow authenticated users to delete screenshots
CREATE POLICY "Authenticated users can delete screenshots"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'screenshots');
