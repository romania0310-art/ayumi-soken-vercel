# あゆみ所見自動生成システム カリマネ準拠版（Vercel安定版）

## 🎯 **プロジェクト概要**
- **名称**: あゆみ所見自動生成システム
- **目的**: 横浜市カリキュラム・マネジメント要領準拠の小学校総合所見自動生成
- **技術**: Next.js 15 + TypeScript + Vercel
- **対象**: 小学校教職員向け

## 🌐 **本番環境URL**
- **本番サイト**: https://ayumi-soken-vercel.vercel.app/
- **GitHub**: https://github.com/romania0310-art/ayumi-soken-vercel
- **ステータス**: ✅ 稼働中（Vercel Hobby Plan - 完全無料）

## 📊 **データ処理フロー**

### **入力形式**
- **Excel**: .xlsx, .xls（F列→E列 自動マッピング）
- **CSV**: UTF-8, Shift_JIS 自動検出
- **エピソード**: 自由記述テキスト

### **出力形式**  
- **標準CSV**: UTF-8（一般用途）
- **Excel最適化CSV**: UTF-8 BOM + CRLF（校務系システム対応）
- **文字数制限**: 200文字（横浜市基準準拠）

### **データモデル**
```typescript
interface StudentEpisode {
  studentNumber: string;  // 児童番号
  name: string;          // 氏名  
  episodes: string[];    // エピソード配列
  soken: string;         // 生成された所見
}
```

## 🏫 **横浜市カリマネ準拠機能**

### **✅ 実装済み機能**
1. **テンプレート体系**:
   - リーダーシップ・協調性
   - 体育・運動能力
   - 図工・創造性
   - 音楽・表現力
   - 国語・言語能力
   - 算数・論理的思考
   - 理科・探究心
   - 社会性・コミュニケーション

2. **文字数管理**: 200文字制限自動調整
3. **温かい表現**: 励ましの言葉自動挿入
4. **重複回避**: 同一表現の重複防止
5. **Excel互換**: F列→E列マッピング対応

### **📋 使用方法**
1. **作品確認のエピソード**が記載されたExcelファイルを準備してください
2. **F列のファイル**からExcelファイルをアップロードします
3. **所見を生成する**: ボタンをクリックします
4. **カリマネ準拠の所見入りCSVファイル**（校務システム対応）をダウンロードします

### **💡 対応ファイル形式**
- 対応形式: .xlsx, .xls, .csv

## ⚙️ **システム仕様**

### **技術スタック**
- **Frontend**: React 19 + Next.js 15 + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes (Server Components)
- **Excel処理**: SheetJS (xlsx.js) CDN
- **デプロイ**: Vercel (Edge Functions)
- **Git**: GitHub (@romania0310-art)

### **パフォーマンス**
- **レスポンス時間**: < 2秒（100件以下）
- **同時処理**: Vercel Edge制限内
- **ファイルサイズ上限**: 50MB（Vercel制限）
- **キャッシュ**: Vercel Edge Cache 有効

### **セキュリティ**
- **HTTPS**: 強制（Vercel標準）
- **ファイル検証**: アップロード時形式チェック
- **データ保持**: なし（処理後即座に削除）
- **アクセスログ**: Vercel Analytics

## 🚀 **デプロイメント情報**

### **自動デプロイ**
- **トリガー**: GitHub main ブランチへのpush
- **ビルド時間**: 約30-60秒  
- **ゼロダウンタイム**: Vercel標準機能

### **環境変数**
- 本プロジェクトでは環境変数不要（完全フロントエンド処理）

### **モニタリング**
- **稼働監視**: Vercel内蔵監視
- **エラー追跡**: Vercel Functions Logs
- **アクセス解析**: Vercel Analytics（オプション）

## 📈 **開発・運用履歴**

### **2024年 開発履歴**
1. **Express.js版**: 初期開発・機能実装
2. **Hono/Cloudflare版**: Edge対応・軽量化
3. **Next.js/Vercel版**: 安定化・永続運用化 ←現在

### **主要改善点**
- **安定性向上**: PM2管理からVercel Serverless化
- **URL固定**: 永続的な固定URLでアクセス性向上  
- **自動スケール**: Vercelによる自動スケーリング対応
- **メンテナンス性**: GitHub連携による継続的デプロイ

## 📞 **サポート・更新**

### **更新方法**
```bash
# ローカル開発環境
git clone https://github.com/romania0310-art/ayumi-soken-vercel.git
cd ayumi-soken-vercel
npm install
npm run dev

# 本番反映
git add .
git commit -m "更新内容"
git push origin main
# ↑ Vercel自動デプロイ
```

### **要望・バグ報告**  
- **GitHub Issues**: https://github.com/romania0310-art/ayumi-soken-vercel/issues

---

## 🏆 **プロジェクト完了**

**✅ 横浜市カリマネ準拠 総合所見自動生成システム**  
**✅ Express.js → Next.js 完全移行成功**  
**✅ 永続的固定URL取得: https://ayumi-soken-vercel.vercel.app/**  
**✅ 完全無料・安定運用体制確立**

---

*Last Updated: 2024年9月 - Vercel安定版リリース*