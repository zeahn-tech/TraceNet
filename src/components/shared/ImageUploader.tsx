import { useRef, useState } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ImageUploaderProps {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  aspect?: 'square' | 'portrait';
}

async function compressImage(file: File, maxDim = 1024, quality = 0.8): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  try {
    const img = await createImageBitmap(file);
    let { width, height } = img;
    if (width > maxDim || height > maxDim) {
      const scale = Math.min(maxDim / width, maxDim / height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, 'image/jpeg', quality)
    );
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' });
  } catch {
    return file;
  }
}

export function ImageUploader({ value, onChange, label = 'Photo', aspect = 'portrait' }: ImageUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setErr(null);
    try {
      const compressed = await compressImage(file);
      const dataUrl = await fileToDataUrl(compressed);
      onChange(dataUrl);
    } catch {
      setErr('Could not load image');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <label className="label">{label}</label>
      <div
        className={cn(
          'relative rounded-2xl border-2 border-dashed border-surface-border bg-surface-card overflow-hidden',
          aspect === 'square' ? 'aspect-square' : 'aspect-[3/4]'
        )}
      >
        {value ? (
          <>
            <img src={value} alt="preview" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-primary-900/70 text-white hover:bg-primary-900"
              aria-label="Remove"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-ink-muted gap-3 p-4">
            {busy ? (
              <Loader2 size={28} className="animate-spin text-secondary" />
            ) : (
              <>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => cameraRef.current?.click()}
                    className="btn-outline btn-sm"
                  >
                    <Camera size={16} /> Camera
                  </button>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="btn-outline btn-sm"
                  >
                    <Upload size={16} /> Upload
                  </button>
                </div>
                <p className="text-xs text-center max-w-[200px]">
                  Take a photo or upload an image. Images are compressed before upload.
                </p>
                {err && <p className="text-xs text-emergency">{err}</p>}
              </>
            )}
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
    </div>
  );
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
