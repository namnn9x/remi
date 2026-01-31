import { useState, useRef, useEffect } from 'react';
import LayoutModal from './LayoutModal';
import type { Photo, PhotoLayout, PhotoPage } from '../types';

interface PhotoPageEditorProps {
  page: PhotoPage;
  allPhotos: Photo[];
  onUpdate: (page: PhotoPage) => void;
  onRemove: () => void;
  pageNumber?: number;
  onUploadPhotos?: (files: FileList | null) => void;
}

const PROMPTS = [
  'Khoảnh khắc này xảy ra khi…',
  'Điều không ai biết về bức ảnh này là…',
  'Nếu quay lại ngày hôm đó, điều muốn nói nhất là…',
];

export default function PhotoPageEditor({
  page,
  allPhotos,
  onUpdate,
  onRemove,
  pageNumber,
  onUploadPhotos,
}: PhotoPageEditorProps) {
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>(
    page.photos.map((p) => p.id)
  );
  const [selectedLayout, setSelectedLayout] = useState<PhotoLayout>(page.layout);
  const [note, setNote] = useState(page.note);
  const [showLayoutModal, setShowLayoutModal] = useState(false);

  // Sync when page changes from parent
  useEffect(() => {
    const currentIds = page.photos.map((p) => p.id);
    if (JSON.stringify(currentIds) !== JSON.stringify(selectedPhotoIds)) {
      setSelectedPhotoIds(currentIds);
    }
    if (page.layout !== selectedLayout) {
      setSelectedLayout(page.layout);
    }
    if (page.note !== note) {
      setNote(page.note);
    }
  }, [page.id]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availablePhotos = allPhotos.filter(
    (p) => !selectedPhotoIds.includes(p.id)
  );

  const getRandomPrompt = () => PROMPTS[Math.floor(Math.random() * PROMPTS.length)];

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    // Notify parent to save photos first
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

  const handleAddPhoto = (photoId: string) => {
    if (selectedPhotoIds.length >= 4) return;
    const newSelected = [...selectedPhotoIds, photoId];
    setSelectedPhotoIds(newSelected);
    updatePage(newSelected, selectedLayout, note);
  };

  const handleRemovePhoto = (photoId: string) => {
    const newSelected = selectedPhotoIds.filter((id) => id !== photoId);
    setSelectedPhotoIds(newSelected);
    const newLayout = getDefaultLayout(newSelected.length);
    setSelectedLayout(newLayout);
    updatePage(newSelected, newLayout, note);
  };

  const handleLayoutChange = (layout: PhotoLayout) => {
    setSelectedLayout(layout);
    updatePage(selectedPhotoIds, layout, note);
  };

  const handleNoteChange = (newNote: string) => {
    setNote(newNote);
    updatePage(selectedPhotoIds, selectedLayout, newNote);
  };

  const updatePage = (
    photoIds: string[],
    layout: PhotoLayout,
    pageNote: string
  ) => {
    const pagePhotos = allPhotos.filter((p) => photoIds.includes(p.id));
    onUpdate({
      ...page,
      photos: pagePhotos,
      layout,
      note: pageNote,
    });
  };

  const getDefaultLayout = (count: number): PhotoLayout => {
    if (count === 1) return 'single';
    if (count === 2) return 'two-horizontal';
    if (count === 3) return 'three-left';
    return 'four-grid';
  };

  const selectedPhotos = allPhotos.filter((p) => selectedPhotoIds.includes(p.id));
  const previewUrls = selectedPhotos.map((p) => p.preview);

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
            className="bg-blue-100"
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8 flex flex-col" style={{ maxHeight: 'calc(100vh - 120px)', height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4 flex-shrink-0">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            Trang {pageNumber || ''}
          </h3>
          <p className="text-sm text-gray-500">
            Chọn ảnh và viết cảm xúc cho trang này
          </p>
        </div>
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-red-500 text-2xl font-bold transition-colors"
          aria-label="Xóa trang"
        >
          ×
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pr-2 -mr-2 scrollbar-thin">
      {/* Photo Selection */}
      <div className={selectedPhotoIds.length > 0 ? 'mb-4' : 'mb-0'}>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Chọn ảnh ({selectedPhotoIds.length}/4)
        </label>
        
        {/* Upload Area */}
        {selectedPhotoIds.length < 4 && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all
              ${selectedPhotoIds.length > 0 ? 'mb-3' : 'mb-0'}
              ${dragging
                ? 'border-blue-500 bg-blue-50 scale-[1.02]'
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
            <div>
              <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mb-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-xs text-gray-700 font-medium">
                Kéo thả ảnh hoặc{' '}
                <span className="text-blue-600 font-semibold">chọn từ máy tính</span>
              </p>
            </div>
          </div>
        )}
        
        {/* Selected Photos */}
        {selectedPhotos.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedPhotos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.preview}
                  alt="Selected"
                  className="w-16 h-16 object-cover rounded-lg border-2 border-blue-500 shadow-md"
                />
                <button
                  onClick={() => handleRemovePhoto(photo.id)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-xs shadow-lg hover:bg-red-600 text-[10px]"
                >
                  ×
                </button>
              </div>
            ))}
            {selectedPhotoIds.length < 4 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors bg-gray-50"
              >
                <span className="text-xl">+</span>
              </button>
            )}
          </div>
        )}

        {/* Available Photos */}
        {availablePhotos.length > 0 && selectedPhotoIds.length < 4 && (
          <div className={selectedPhotoIds.length > 0 ? 'mt-3' : 'mt-0'}>
            <p className="text-xs text-gray-500 mb-2 font-medium">Ảnh đã upload:</p>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
              {availablePhotos.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => handleAddPhoto(photo.id)}
                  className="w-12 h-12 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-all shadow-sm hover:shadow-md"
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

      {/* Layout Selection - Only show when photos are selected */}
      {selectedPhotoIds.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Cách sắp xếp ảnh
          </label>
          <button
            onClick={() => setShowLayoutModal(true)}
            className="w-full p-3 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all bg-white group overflow-hidden relative"
          >
            <div className="flex items-center gap-3">
              {/* Layout Preview */}
              <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
                {renderLayoutPreview(selectedLayout, previewUrls, selectedPhotoIds.length)}
              </div>
              
              {/* Arrow Icon */}
              <div className="flex-shrink-0 ml-auto">
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors"
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
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Layout Modal */}
      <LayoutModal
        isOpen={showLayoutModal}
        onClose={() => setShowLayoutModal(false)}
        photoCount={selectedPhotoIds.length}
        selectedLayout={selectedLayout}
        onSelect={handleLayoutChange}
        previewPhotos={previewUrls}
      />

      {/* Note Input */}
      <div className="flex-shrink-0">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Ghi chú cho trang này
        </label>
        <textarea
          value={note}
          onChange={(e) => handleNoteChange(e.target.value)}
          placeholder="Viết cảm xúc về những khoảnh khắc này..."
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none resize-none bg-white text-gray-900 placeholder-gray-400 transition-all text-sm"
          rows={3}
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-1 text-right">
          {note.length}/500
        </p>
      </div>
      </div>
    </div>
  );
}
