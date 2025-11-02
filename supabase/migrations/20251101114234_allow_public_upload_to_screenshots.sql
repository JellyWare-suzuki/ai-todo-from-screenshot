/*
  # スクリーンショットバケットへのパブリックアップロードを許可

  1. セキュリティポリシーの変更
    - 認証なしでもスクリーンショットのアップロードを許可
    - 誰でも読み取り、作成、更新、削除が可能
    
  注意: このアプリには認証機能がないため、パブリックアクセスを許可します
*/

-- Drop existing authenticated-only policies
DROP POLICY IF EXISTS "Authenticated users can upload screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete screenshots" ON storage.objects;

-- Allow anyone to upload screenshots
CREATE POLICY "Anyone can upload screenshots"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'screenshots');

-- Allow anyone to update screenshots
CREATE POLICY "Anyone can update screenshots"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'screenshots');

-- Allow anyone to delete screenshots
CREATE POLICY "Anyone can delete screenshots"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'screenshots');
