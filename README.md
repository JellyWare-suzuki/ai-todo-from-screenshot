# 📱 AI Screenshot ToDo App

このアプリは、スマートフォンのスクリーンショット画像から **Gemini API（Googleの生成AI）** を使って自動的に ToDo リストを生成する React Native + Expo アプリです。

---

## 🚀 主な機能
- 📸 スマホのスクリーンショットをアップロード  
- 🧠 Gemini API が画像内容を解析してタスクを抽出  
- 🗂 Supabase にタスクを保存・管理  
- 📱 Expo アプリ上でリアルタイムにToDoを表示・更新  

---

## 🧩 使用技術スタック

| 分類 | 技術 |
|------|------|
| フロントエンド | React Native (Expo) |
| バックエンド | Supabase Functions |
| AIモデル | **Gemini API（Google Generative AI / 無料枠対応）** |
| ストレージ | Supabase Storage（スクリーンショット画像の保存） |
| 言語 | TypeScript |
| その他 | Prettier / ESLint / dotenv |

---

## ⚙️ セットアップ手順

```bash
# リポジトリをクローン
git clone https://github.com/JellyWare-suzuki/ai-todo-from-screenshot.git
cd ai-todo-from-screenshot

# パッケージをインストール
npm install

# 環境変数を設定（.env）
SUPABASE_URL=xxxxx
SUPABASE_ANON_KEY=xxxxx
GEMINI_API_KEY=xxxxx

# Expoアプリを起動
npx expo start
