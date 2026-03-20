# プロフェッショナルな品質管理（ESLint）のガイド

このドキュメントでは、KiriLogプロジェクトに導入した「コードの品質を自動で担保する仕組み」について解説します。他のプロジェクトでも応用できる普遍的な内容です。

---

## 1. なぜ静的解析が必要なのか？

大規模な開発や、本番環境へのデプロイ（Netlifyなど）を行うプロジェクトでは、人間がどんなに気をつけても「うっかりミス」をゼロにすることはできません。

- **未使用のインポート**: アプリのサイズが無駄に大きくなる、またはビルドエラーの原因になる。
- **any型の多用**: TypeScriptの恩恵（バグの事前検知）を無効化してしまう。
- **一貫性のないスタイル**: チーム開発でコードが読みづらくなる。

これらを「人間がチェックする」のではなく、**「システムに自動でチェックさせる」**のがプロの現場の標準です。

---

## 2. ESLintの導入と設定 (Vite/React/TS)

このプロジェクトでは、最新の **ESLint (Flat Config)** を導入しています。

### 必要なパッケージ
以下のパッケージを `devDependencies` としてインストールしています：
- `eslint`: 本体
- `typescript-eslint`: TypeScriptを理解するためのエンジン
- `eslint-plugin-react-hooks`: React Hooksの正しい使い方を強制
- `eslint-plugin-react-refresh`: 高速な開発体験（HMR）を維持するためのルール

### 設定ファイル (`eslint.config.js`) のポイント
このプロジェクトで特に厳格に設定したルールは以下の通りです：

```javascript
// eslint.config.js の抜粋
rules: {
  // 未使用の変数を「エラー」として報告（ビルドを止める）
  '@typescript-eslint/no-unused-vars': ['error', { 
    argsIgnorePattern: '^_', // 引数が _ で始まる場合は無視（例: _index）
    varsIgnorePattern: '^_' 
  }],

  // any型の使用を「エラー」にする（型安全性の確保）
  '@typescript-eslint/no-explicit-any': 'error',

  // React Fast Refreshのための規則
  'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
}
```

---

## 3. 運用方法

### ローカルでのチェック
開発中、またはコミット前に以下のコマンドを実行します：
```bash
npm run lint
```
ここでエラーが出た場合は、**必ず修正してからプッシュする**のが「プロのワークフロー」です。

### ビルド前チェックの自動化
`package.json` の `build` スクリプトを以下のように設定することで、問題があるコードは本番ビルドさせないようにしています：
```json
"scripts": {
  "build": "tsc -b && vite build"
}
```
※ `tsc -b` はTypeScriptの型チェックを厳格に行います。

---

## 4. 他のプロジェクトへの応用ステップ

1.  **インストール**: `npm install -D eslint typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh`
2.  **設定ファイルのコピー**: このプロジェクトの `eslint.config.js` をコピーして配置。
3.  **エディタの連携**: VS Codeを使っている場合は「ESLint」拡張機能をインストール。これにより、保存するたびに自動で修正（Auto Fix）したり、その場で赤線を表示したりできるようになります。

---

### まとめ
「自動チェック」は、最初は厳しくて面倒に感じるかもしれません。しかし、これによって**「本番環境で動かない」という最悪の事態（そしてその修正に追われる時間）を未然に防ぐ**ことができます。これがプロの品質管理の第一歩です。
