# 📱 AI Screenshot ToDo App

このアプリは、スマートフォンのスクリーンショット画像から AI を使って自動的に ToDo リストを生成する React Native + Expo アプリです。

---

## 🚀 主な機能
- 📸 スクリーンショットをアップロード
- 🧠 LM Studio（ローカルLLM）によるタスク抽出
- 🗂 Supabase によるタスクデータ管理
- 📱 Expo アプリでのリアルタイム表示

---

## 🧩 使用技術スタック
| 分類 | 技術 |
|------|------|
| フロントエンド | React Native (Expo) |
| バックエンド | Supabase Functions |
| AIモデル | LM Studio（ローカル LLM） |
| その他 | TypeScript / Tailwind / ngrok |

---

## ⚙️ セットアップ手順
```bash
# リポジトリをクローン
git clone https://github.com/JellyWare-suzuki/ai-todo-from-screenshot.git
cd ai-todo-from-screenshot

# パッケージをインストール
npm install

# 環境変数を設定（.env.local）
SUPABASE_URL=xxxx
SUPABASE_ANON_KEY=xxxx
LMSTUDIO_API_URL=https://xxxxx.ngrok.io/v1/chat/completions

# 開発サーバーを起動
npx expo start
