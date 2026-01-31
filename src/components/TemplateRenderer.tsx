import type { PhotoPage, PhotoLayout } from '../types';

interface TemplateRendererProps {
  pages: PhotoPage[];
  memoryBookName: string;
  memoryBookType: string;
}

export default function TemplateRenderer({
  pages,
  memoryBookName,
  memoryBookType,
}: TemplateRendererProps) {
  const renderPhotoLayout = (page: PhotoPage) => {
    const { photos, layout } = page;

    const getGridStyle = (layout: PhotoLayout) => {
      const baseStyle: React.CSSProperties = {
        display: 'grid',
        gap: '3px',
        width: '100%',
        height: '100%',
        minHeight: '450px',
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
      <div style={gridStyle} className="rounded-2xl overflow-hidden">
        {photos.map((photo, index) => {
          const areaName = `photo${index + 1}`;
          return (
            <div
              key={photo.id}
              style={{
                gridArea: areaName,
              }}
              className="overflow-hidden rounded-lg"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 md:py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Journal Cover - Enhanced */}
        <div className="text-center mb-12 md:mb-20 relative">
          <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-3xl shadow-2xl p-8 md:p-16 border border-white/50 backdrop-blur-sm relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl -ml-32 -mb-32"></div>
            
            <div className="relative z-10">
              <div className="inline-block mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center text-5xl shadow-xl transform hover:scale-105 transition-transform duration-300">
                  📔
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
                {memoryBookName}
              </h1>
              <div className="flex items-center justify-center gap-3 text-gray-700 mb-6">
                <span className="text-2xl">✨</span>
                <p className="text-xl font-semibold">{memoryBookType}</p>
                <span className="text-2xl">✨</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 rounded-full shadow-md">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-600">
                  {new Date().toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Journal Pages - Enhanced */}
        <div className="space-y-10 md:space-y-16">
          {pages.map((page, index) => {
            const isEven = index % 2 === 0;
            const hasPhotos = page.photos.length > 0;
            const hasNote = page.note && page.note.trim().length > 0;

            // If no photos but has note, show text-only layout
            if (!hasPhotos && hasNote) {
              return (
                <div
                  key={page.id}
                  className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 transform hover:shadow-2xl transition-shadow duration-300"
                >
                  <div className="flex items-center justify-center p-8 md:p-16 bg-white min-h-[400px]">
                    <div className="w-full max-w-3xl">
                      <div className="relative">
                        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full"></div>
                        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-lg md:text-xl font-serif pl-6">
                          {page.note}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={page.id}
                className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 transform hover:shadow-2xl transition-shadow duration-300"
              >
                <div
                  className={`flex flex-col ${
                    isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                  } gap-0`}
                >
                  {/* Image Side */}
                  {hasPhotos && (
                    <div className="w-full md:w-1/2 p-6 bg-gradient-to-br from-gray-50 to-gray-100">
                      {renderPhotoLayout(page)}
                    </div>
                  )}

                  {/* Text Side */}
                  <div className={`w-full ${hasPhotos ? 'md:w-1/2' : ''} flex items-center justify-center p-8 md:p-16 bg-white`}>
                    <div className="w-full max-w-md">
                      {hasNote ? (
                        <div className="relative">
                          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full"></div>
                          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-lg md:text-xl font-serif pl-6">
                            {page.note}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          {!hasPhotos && (
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          <p className="text-gray-400 italic text-lg">
                            {hasPhotos ? 'Khoảnh khắc đáng nhớ...' : 'Viết cảm xúc của bạn...'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer spacing */}
        <div className="h-16"></div>
      </div>
    </div>
  );
}
