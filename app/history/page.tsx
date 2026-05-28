export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl text-arcana-accent">履歴</h1>
      <p className="text-arcana-muted">
        過去に引いた占いの結果がここに並びます。データはあなたのブラウザの localStorage にのみ保存されます。
      </p>
      <div className="rounded-2xl border border-dashed border-white/10 bg-arcana-surface/40 p-6 text-sm text-arcana-muted">
        <p>このページは M1 ではプレースホルダーです。</p>
        <p className="mt-2">M5 で localStorage（キー: <code className="text-arcana-accentSoft">arcana:history:v1</code>）からの読み込み・削除UIを実装します。</p>
      </div>
    </div>
  );
}
