/*
  # ToDoリストアプリ用のデータベーススキーマ作成

  1. 新規テーブル
    - `screenshots`
      - `id` (uuid, 主キー)
      - `image_url` (text, 画像URL)
      - `analyzed` (boolean, 解析済みフラグ)
      - `created_at` (timestamptz, 作成日時)
      - `updated_at` (timestamptz, 更新日時)
    
    - `todos`
      - `id` (uuid, 主キー)
      - `screenshot_id` (uuid, 外部キー)
      - `title` (text, ToDoタイトル)
      - `description` (text, 説明)
      - `completed` (boolean, 完了フラグ)
      - `created_at` (timestamptz, 作成日時)
      - `updated_at` (timestamptz, 更新日時)
  
  2. セキュリティ
    - 両テーブルでRLSを有効化
    - すべてのユーザーがデータの読み書き可能なポリシーを設定
*/

CREATE TABLE IF NOT EXISTS screenshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  analyzed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  screenshot_id uuid REFERENCES screenshots(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view screenshots"
  ON screenshots FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert screenshots"
  ON screenshots FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update screenshots"
  ON screenshots FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete screenshots"
  ON screenshots FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view todos"
  ON todos FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert todos"
  ON todos FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update todos"
  ON todos FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete todos"
  ON todos FOR DELETE
  TO anon, authenticated
  USING (true);