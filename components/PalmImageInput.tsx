'use client';

import { useRef, useState } from 'react';

interface Props {
  /** リサイズ済み JPEG dataURL (data:image/jpeg;base64,...) */
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  disabled?: boolean;
}

const MAX_DIM = 1280; // 長辺の最大ピクセル数（Anthropic Vision推奨: ≤1568px）
const JPEG_QUALITY = 0.85;

async function resizeToJpegDataUrl(file: File): Promise<string> {
  // HEIC/HEIF などブラウザがdecodeできない形式は createImageBitmap がエラーになる
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error('この画像形式には対応していません（JPEG / PNG / WebPで保存し直してください）。');
  }
  const { width, height } = bitmap;
  const scale = Math.min(1, MAX_DIM / Math.max(width, height));
  const targetW = Math.round(width * scale);
  const targetH = Math.round(height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('画像処理に失敗しました（canvas取得不可）。');
  }
  ctx.drawImage(bitmap, 0, 0, targetW, targetH);
  bitmap.close?.();

  return await new Promise<string>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('画像処理に失敗しました。'));
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result;
          if (typeof result === 'string') resolve(result);
          else reject(new Error('画像処理に失敗しました（reader）。'));
        };
        reader.onerror = () => reject(new Error('画像処理に失敗しました（reader）。'));
        reader.readAsDataURL(blob);
      },
      'image/jpeg',
      JPEG_QUALITY
    );
  });
}

export function PalmImageInput({ value, onChange, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File | undefined | null) {
    if (!file) return;
    setError(null);
    setProcessing(true);
    try {
      const dataUrl = await resizeToJpegDataUrl(file);
      onChange(dataUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : '画像の処理に失敗しました。');
    } finally {
      setProcessing(false);
    }
  }

  function clear() {
    onChange(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        disabled={disabled || processing}
        onChange={(e) => handleFile(e.target.files?.[0])}
        className="hidden"
        id="palm-image-input"
      />
      {value ? (
        <div className="space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="手のひらのプレビュー"
            className="mx-auto max-h-72 w-auto rounded-xl border border-arcana-accent/30"
          />
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={disabled || processing}
              className="rounded-full border border-arcana-accent/40 px-4 py-2 text-xs text-arcana-accent transition hover:bg-arcana-accent/10 disabled:opacity-50"
            >
              撮り直す
            </button>
            <button
              type="button"
              onClick={clear}
              disabled={disabled || processing}
              className="rounded-full border border-white/10 px-4 py-2 text-xs text-arcana-muted transition hover:text-arcana-danger disabled:opacity-50"
            >
              削除
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor="palm-image-input"
          className={`flex aspect-square w-full max-w-xs cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-arcana-accent/40 bg-arcana-surface/40 p-6 text-center transition hover:border-arcana-accent/70 ${
            disabled || processing ? 'pointer-events-none opacity-50' : ''
          }`}
        >
          <span className="font-serif text-3xl text-arcana-accent">✦</span>
          <span className="mt-2 text-sm text-arcana-text">
            {processing ? '読み込み中…' : '写真を撮る / 選ぶ'}
          </span>
          <span className="mt-1 text-[10px] text-arcana-muted">
            タップしてカメラ起動またはライブラリから選択
          </span>
        </label>
      )}
      {error && (
        <p className="rounded-lg border border-arcana-danger/40 bg-arcana-danger/10 px-3 py-2 text-xs text-arcana-danger">
          {error}
        </p>
      )}
    </div>
  );
}
