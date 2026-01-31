import { useState, useRef } from 'react';
import type { Photo } from '../types';

interface PhotoUploaderProps {
  photos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
  maxPhotos?: number;
}

const PROMPTS = [
  'Khoảnh khắc này xảy ra khi…',
  'Điều không ai biết về bức ảnh này là…',
  'Nếu quay lại ngày hôm đó, điều muốn nói nhất là…',
];

export default function PhotoUploader({ photos, onPhotosChange, maxPhotos = 20 }: PhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const getRandomPrompt = () => PROMPTS[Math.floor(Math.random() * PROMPTS.length)];

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newPhotos: Photo[] = [];
    const remainingSlots = maxPhotos - photos.length;

    Array.from(files).slice(0, remainingSlots).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const id = Math.random().toString(36).substr(2, 9);
        const preview = URL.createObjectURL(file);
        newPhotos.push({
          id,
          file,
          preview,
          note: '',
          prompt: getRandomPrompt(),
        });
      }
    });

    onPhotosChange([...photos, ...newPhotos]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const removePhoto = (id: string) => {
    const photo = photos.find((p) => p.id === id);
    if (photo) {
      URL.revokeObjectURL(photo.preview);
    }
    onPhotosChange(photos.filter((p) => p.id !== id));
  };

  const canAddMore = photos.length < maxPhotos;

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      {canAddMore && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer
            ${dragging
              ? 'border-blue-500 bg-blue-50 scale-[1.02]'
              : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50/50'
            }
          `}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="text-gray-700 font-medium mb-2">
              Kéo thả ảnh vào đây hoặc{' '}
              <span className="text-blue-600 font-semibold">chọn từ máy tính</span>
            </p>
            <p className="text-sm text-gray-500">
              {photos.length}/{maxPhotos} ảnh đã thêm
            </p>
          </div>
        </div>
      )}

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Ảnh đã thêm ({photos.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group aspect-square">
                <img
                  src={photo.preview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-xl border-2 border-gray-200 shadow-md group-hover:shadow-lg transition-all"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removePhoto(photo.id);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-red-600"
                  aria-label="Xóa ảnh"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {photos.length >= maxPhotos && (
        <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-sm text-yellow-800 font-medium">
            Đã đạt giới hạn {maxPhotos} ảnh
          </p>
        </div>
      )}
    </div>
  );
}
