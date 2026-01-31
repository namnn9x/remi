import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PhotoPage, PhotoLayout } from '../types';

interface MemoryGalleryProps {
  pages: PhotoPage[];
  memoryBookName: string;
  memoryBookType: string;
  onPageClick?: (pageId: string) => void;
}

export default function MemoryGallery({
  pages,
  memoryBookName,
  memoryBookType,
  onPageClick,
}: MemoryGalleryProps) {
  const navigate = useNavigate();
  const [hoveredPageId, setHoveredPageId] = useState<string | null>(null);

  // Calculate card sizes based on content
  const getCardSize = (page: PhotoPage): 'small' | 'medium' | 'large' => {
    const photoCount = page.photos.length;
    const textLength = page.note?.length || 0;
    
    if (photoCount >= 3 || textLength > 150) return 'large';
    if (photoCount === 2 || textLength > 50) return 'medium';
    return 'small';
  };

  const renderPhotoLayout = (page: PhotoPage) => {
    const { photos, layout } = page;
    
    if (photos.length === 0) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">📷</div>
            <p className="text-xs text-gray-400">Chưa có ảnh</p>
          </div>
        </div>
      );
    }

    const getGridStyle = (layout: PhotoLayout) => {
      const baseStyle: React.CSSProperties = {
        display: 'grid',
        gap: '2px',
        width: '100%',
        height: '100%',
      };

      switch (layout) {
        case 'single':
          return {
            ...baseStyle,
            gridTemplateColumns: '1fr',
            gridTemplateRows: '1fr',
            gridTemplateAreas: '"photo1"',
          };
        case 'two-horizontal':
          return {
            ...baseStyle,
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '1fr',
            gridTemplateAreas: '"photo1 photo2"',
          };
        case 'two-vertical':
          return {
            ...baseStyle,
            gridTemplateColumns: '1fr',
            gridTemplateRows: '1fr 1fr',
            gridTemplateAreas: '"photo1" "photo2"',
          };
        case 'three-left':
          return {
            ...baseStyle,
            gridTemplateColumns: '2fr 1fr',
            gridTemplateRows: '1fr 1fr',
            gridTemplateAreas: '"photo1 photo2" "photo1 photo3"',
          };
        case 'three-right':
          return {
            ...baseStyle,
            gridTemplateColumns: '1fr 2fr',
            gridTemplateRows: '1fr 1fr',
            gridTemplateAreas: '"photo1 photo3" "photo2 photo3"',
          };
        case 'three-top':
          return {
            ...baseStyle,
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '2fr 1fr',
            gridTemplateAreas: '"photo1 photo1" "photo2 photo3"',
          };
        case 'three-bottom':
          return {
            ...baseStyle,
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '1fr 2fr',
            gridTemplateAreas: '"photo1 photo2" "photo3 photo3"',
          };
        case 'four-grid':
          return {
            ...baseStyle,
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '1fr 1fr',
            gridTemplateAreas: '"photo1 photo2" "photo3 photo4"',
          };
        default:
          return baseStyle;
      }
    };

    const gridStyle = getGridStyle(layout);

    return (
      <div style={gridStyle} className="rounded-lg overflow-hidden">
        {photos.slice(0, 4).map((photo, index) => {
          const areaName = `photo${index + 1}`;
          return (
            <div
              key={photo.id}
              style={{ gridArea: areaName }}
              className="overflow-hidden"
            >
              <img
                src={photo.preview}
                alt={`Memory ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          );
        })}
      </div>
    );
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleCardClick = (pageId: string) => {
    if (onPageClick) {
      onPageClick(pageId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {memoryBookName}
              </h1>
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-xl">✨</span>
                <p className="text-lg font-medium">{memoryBookType}</p>
                <span className="text-xl">✨</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/pages')}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Chỉnh sửa
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      {pages.length === 0 ? (
        <div className="max-w-7xl mx-auto text-center py-16">
          <div className="inline-block mb-4">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center text-5xl">
              📔
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Chưa có khoảnh khắc nào</h2>
          <p className="text-gray-500 mb-6">Bắt đầu tạo những trang đầu tiên của bạn</p>
          <button
            onClick={() => navigate('/pages')}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all"
          >
            Tạo trang mới
          </button>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 text-sm text-gray-600">
            <span className="font-semibold">{pages.length}</span> khoảnh khắc
          </div>
          
          {/* Masonry Grid */}
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {pages.map((page, index) => {
              const hasPhotos = page.photos.length > 0;
              const hasNote = page.note && page.note.trim().length > 0;
              const cardSize = getCardSize(page);
              const heightClass = {
                small: 'h-64',
                medium: 'h-80',
                large: 'h-96',
              }[cardSize];

              // Text-only card (no photos)
              if (!hasPhotos && hasNote) {
                return (
                  <div
                    key={page.id}
                    className="break-inside-avoid mb-4"
                    onMouseEnter={() => setHoveredPageId(page.id)}
                    onMouseLeave={() => setHoveredPageId(null)}
                  >
                    <div
                      className={`
                        bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl shadow-lg overflow-hidden
                        transform transition-all duration-300 cursor-pointer border border-blue-100
                        ${hoveredPageId === page.id ? 'scale-105 shadow-2xl' : 'hover:shadow-xl'}
                      `}
                      onClick={() => handleCardClick(page.id)}
                    >
                      {/* Text-only content */}
                      <div className="p-6 min-h-[200px] flex flex-col">
                        <div className="flex-1 flex items-start">
                          <div className="relative w-full">
                            <div className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full left-0"></div>
                            <p className="text-sm text-gray-800 line-clamp-6 leading-relaxed font-serif pl-6">
                              {page.note}
                            </p>
                          </div>
                        </div>
                        
                        {/* Footer */}
                        <div className="mt-4 pt-4 border-t border-blue-200/50">
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Chỉ có cảm xúc
                            </span>
                            <span>{page.note.length} ký tự</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={page.id}
                  className="break-inside-avoid mb-4"
                  onMouseEnter={() => setHoveredPageId(page.id)}
                  onMouseLeave={() => setHoveredPageId(null)}
                >
                  <div
                    className={`
                      bg-white rounded-2xl shadow-lg overflow-hidden
                      transform transition-all duration-300 cursor-pointer
                      ${hoveredPageId === page.id ? 'scale-105 shadow-2xl' : 'hover:shadow-xl'}
                    `}
                    onClick={() => handleCardClick(page.id)}
                  >
                    {/* Image Section */}
                    {hasPhotos && (
                      <div className={`relative ${heightClass} overflow-hidden`}>
                        {renderPhotoLayout(page)}
                        
                        {/* Overlay on hover */}
                        <div
                          className={`
                            absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent
                            transition-opacity duration-300 flex items-end
                            ${hoveredPageId === page.id ? 'opacity-100' : 'opacity-0'}
                          `}
                        >
                          <div className="p-4 text-white w-full">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <span className="text-sm font-bold">{index + 1}</span>
                              </div>
                              <span className="text-sm font-medium">Trang {index + 1}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Text Section */}
                    {hasNote && (
                      <div className="p-4 bg-white">
                        <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
                          {truncateText(page.note, 120)}
                        </p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{page.photos.length} ảnh</span>
                        <span>{page.note?.length || 0} ký tự</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
