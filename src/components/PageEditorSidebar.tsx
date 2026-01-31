import { useState, useRef, useEffect } from 'react';
import EditMediaModal from './EditMediaModal';
import type { Photo, PhotoLayout, PhotoPage } from '../types';

interface PageEditorSidebarProps {
  page: PhotoPage;
  allPhotos: Photo[];
  onUpdate: (page: PhotoPage) => void;
  onUploadPhotos?: (files: FileList | null) => void;
  pageNumber?: number;
  onRemove?: () => void;
}

export default function PageEditorSidebar({
  page,
  allPhotos,
  onUpdate,
  onUploadPhotos,
  pageNumber,
  onRemove,
}: PageEditorSidebarProps) {
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>(
    page.photos.map((p) => p.id)
  );
  const [selectedLayout, setSelectedLayout] = useState<PhotoLayout>(page.layout);
  const [note, setNote] = useState(page.note);
  const [showEditMediaModal, setShowEditMediaModal] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync when page changes
  useEffect(() => {
    const currentIds = page.photos.map((p) => p.id);
    setSelectedPhotoIds(currentIds);
    setSelectedLayout(page.layout);
    setNote(page.note);
  }, [page.id, page.photos, page.layout, page.note]);

  const availablePhotos = allPhotos.filter(
    (p) => !selectedPhotoIds.includes(p.id)
  );

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
            className="bg-blue-100 rounded"
          />
        ))}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex justify-between items-center p-4 flex-shrink-0 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">
          Trang {pageNumber || ''}
        </h3>
        {onRemove && (
          <button
            onClick={onRemove}
            className="text-gray-400 hover:text-red-500 text-xl font-bold transition-colors w-6 h-6 flex items-center justify-center"
            aria-label="Xóa trang"
          >
            ×
          </button>
        )}
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-4" style={{ scrollbarWidth: 'thin' }}>
        {/* Consolidated Media Block */}
        <div className="mb-4">
          {selectedPhotoIds.length === 0 ? (
            // Compact Upload Zone
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed p-4 text-center cursor-pointer transition-all
                ${
                  dragging
                    ? 'border-blue-500 bg-blue-50 scale-[1.02]'
                    : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50'
                }
              `}
              style={{ borderRadius: '12px' }}
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
            </div>
          ) : (
            // Layout Preview Card with Edit Button
            <div
              className="relative group w-full aspect-square bg-white border-2 border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
              onClick={() => setShowEditMediaModal(true)}
            >
              {renderLayoutPreview(selectedLayout, previewUrls, selectedPhotoIds.length)}
              <button
                className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs font-semibold"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                Chỉnh sửa
              </button>
            </div>
          )}
        </div>

        {/* Note Input - Takes remaining space */}
        <div className="flex-1 flex flex-col min-h-[200px]">
          <textarea
            value={note}
            onChange={(e) => handleNoteChange(e.target.value)}
            placeholder="Viết cảm xúc về những khoảnh khắc này..."
            className="w-full flex-1 px-3 py-2.5 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none bg-white text-gray-900 placeholder-gray-400 transition-all text-sm shadow-sm focus:shadow-md"
            style={{ borderRadius: '12px' }}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1 text-right">
            {note.length}/500
          </p>
        </div>
      </div>

      {/* Edit Media Modal */}
      <EditMediaModal
        isOpen={showEditMediaModal}
        onClose={() => setShowEditMediaModal(false)}
        selectedPhotoIds={selectedPhotoIds}
        availablePhotos={availablePhotos}
        onAddPhoto={handleAddPhoto}
        onRemovePhoto={handleRemovePhoto}
        onUploadPhotos={onUploadPhotos}
        selectedLayout={selectedLayout}
        onSelectLayout={handleLayoutChange}
        previewPhotos={previewUrls}
      />
    </div>
  );
}
