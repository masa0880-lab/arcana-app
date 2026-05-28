export default function ReadingPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl text-arcana-accent">占う</h1>
      <p className="text-arcana-muted">
        質問を入力 → スプレッドを選ぶ → カードを引く → Claudeが鑑定文を紡ぐ、というフローをここに実装します。
      </p>
      <div className="rounded-2xl border border-dashed border-white/10 bg-arcana-surface/40 p-6 text-sm text-arcana-muted">
        <p>このページは M1 ではプレースホルダーです。</p>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>M2: 78枚デッキとシャッフルロジック</li>
          <li>M3: /api/reading でClaude鑑定文生成</li>
          <li>M4: 質問入力 → スプレッド選択 → ドロー演出 → 結果表示</li>
        </ul>
      </div>
    </div>
  );
}
