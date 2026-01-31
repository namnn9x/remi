import { useState, useRef } from 'react';
import LayoutModal from './LayoutModal';
import type { Photo, PhotoLayout } from '../types';

interface EditMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPhotoIds: string[];
  availablePhotos: Photo[];
  onAddPhoto: (photoId: string) => void;
  onRemovePhoto: (photoId: string) => void;
  onUploadPhotos?: (files: FileList | null) => void;
  selectedLayout: PhotoLayout;
  onSelectLayout: (layout: PhotoLayout) => void;
  previewPhotos: string[];
}

export default function EditMediaModal({
  isOpen,
  onClose,
  selectedPhotoIds,
  availablePhotos,
  onAddPhoto,
  onRemovePhoto,
  onUploadPhotos,
  selectedLayout,
  onSelectLayout,
  previewPhotos,
}: EditMediaModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [showLayoutModal, setShowLayoutModal] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    if (onUploadPhotos) {
      onUploadPhotos(files);
    }
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

  const renderLayoutPreview = (layout: PhotoLayout, previewUrls: string[], photoCount: number) => {
    const getGridAreas = (layout: PhotoLayout) => {
      switch (layout) {
        case 'single':
          return { gridTemplateAreas: '"photo1"', gridTemplateColumns: '1fr', gridTemplateRows: '1fr' };
        case 'two-horizontal':
          return { gridTemplateAreas: '"photo1 photo2"', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr' };
        case 'two-vertical':
          return { gridTemplateAreas: '"photo1" "photo2"', gridTemplateColumns: '1fr', gridTemplateRows: '1fr 1fr' };
        case 'three-left':
          return {
            gridTemplateAreas: '"photo1 photo2" "photo1 photo3"',
            gridTemplateColumns: '2fr 1fr',
            gridTemplateRows: '1fr 1fr',
          };
        case 'three-right':
          return {
            gridTemplateAreas: '"photo1 photo3" "photo2 photo3"',
            gridTemplateColumns: '1fr 2fr',
            gridTemplateRows: '1fr 1fr',
          };
        case 'three-top':
          return {
            gridTemplateAreas: '"photo1 photo1" "photo2 photo3"',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '2fr 1fr',
          };
        case 'three-bottom':
          return {
            gridTemplateAreas: '"photo1 photo2" "photo3 photo3"',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '1fr 2fr',
          };
        case 'four-grid':
          return {
            gridTemplateAreas: '"photo1 photo2" "photo3 photo4"',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '1fr 1fr',
          };
        default:
          return {};
      }
    };

    const gridStyle = {
      display: 'grid',
      gap: '2px',
      width: '100%',
      height: '100%',
      ...getGridAreas(layout),
    };

    return (
      <div style={gridStyle} className="w-full h-full">
        {Array.from({ length: photoCount }).map((_, idx) => (
          <div
            key={idx}
            style={{
              gridArea: `photo${idx + 1}`,
              backgroundImage: previewUrls[idx]
                ? `url(${previewUrls[idx]})`
                : 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            className="bg-gray-100 rounded"
          />
        ))}
      </div>
    );
  };

  const selectedPhotos = selectedPhotoIds.map((id, idx) => ({
    id,
    url: previewPhotos[idx] || '',
  }));

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-5 max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          style={{ scrollbarWidth: 'thin' }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Chỉnh sửa ảnh & layout
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold transition-colors w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100"
              aria-label="Đóng"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            {/* Selected Photos - Compact Grid */}
            {selectedPhotoIds.length > 0 && (
              <div>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {selectedPhotos.map((item) => (
                    <div key={item.id} className="relative group">
                      <img
                        src={item.url}
                        alt="Selected"
                        className="w-full aspect-square object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        onClick={() => onRemovePhoto(item.id)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {selectedPhotoIds.length < 4 && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all rounded-lg bg-gray-50"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Layout Selection Button - Compact */}
                <button
                  onClick={() => setShowLayoutModal(true)}
                  className="w-full p-3 border border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all bg-white rounded-lg flex items-center gap-3 group"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                    {renderLayoutPreview(selectedLayout, previewPhotos, selectedPhotoIds.length)}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900">
                      Thay đổi layout
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedPhotoIds.length} ảnh
                    </p>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            )}

            {/* Upload Area - Compact */}
            {selectedPhotoIds.length < 4 && (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  border-2 border-dashed p-4 text-center cursor-pointer transition-all rounded-lg
                  ${
                    dragging
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50'
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
                <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mb-2">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <p className="text-xs text-gray-700 font-medium">
                  Kéo thả ảnh hoặc{' '}
                  <span className="text-blue-600 font-semibold">chọn từ máy tính</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Còn {4 - selectedPhotoIds.length} chỗ trống
                </p>
              </div>
            )}

            {/* Available Photos - Compact Grid */}
            {availablePhotos.length > 0 && selectedPhotoIds.length < 4 && (
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">
                  Ảnh đã upload ({availablePhotos.length})
                </p>
                <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                  {availablePhotos.map((photo) => (
                    <button
                      key={photo.id}
                      onClick={() => onAddPhoto(photo.id)}
                      className="aspect-square overflow-hidden border-2 border-gray-200 hover:border-blue-500 hover:ring-2 hover:ring-blue-200 transition-all rounded-lg"
                    >
                      <img
                        src={photo.preview}
                        alt="Add"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <LayoutModal
        isOpen={showLayoutModal}
        onClose={() => setShowLayoutModal(false)}
        photoCount={selectedPhotoIds.length}
        selectedLayout={selectedLayout}
        onSelect={onSelectLayout}
        previewPhotos={previewPhotos}
      />
    </>
  );
}
