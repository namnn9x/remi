import type { PhotoPage, PhotoLayout } from '../types';

interface SinglePagePreviewProps {
  page: PhotoPage;
  memoryBookName: string;
  memoryBookType: string;
  pageNumber: number;
}

export default function SinglePagePreview({
  page,
  memoryBookName,
  memoryBookType,
  pageNumber,
}: SinglePagePreviewProps) {
  const renderPhotoLayout = (page: PhotoPage) => {
    const { photos, layout } = page;

    const getGridStyle = (layout: PhotoLayout) => {
      const baseStyle: React.CSSProperties = {
        display: 'grid',
        gap: '3px',
        width: '100%',
        height: '100%',
        minHeight: '400px',
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
      <div style={gridStyle} className="rounded-xl overflow-hidden">
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

  const isEven = pageNumber % 2 === 0;
  const hasPhotos = page.photos.length > 0;
  const hasNote = page.note && page.note.trim().length > 0;

  // If no photos but has note, show text-only layout
  if (!hasPhotos && hasNote) {
    return (
      <div className="bg-white overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.12)]" style={{ maxWidth: '800px', width: '100%', borderRadius: '16px' }}>
        <div className="flex items-center justify-center p-8 md:p-12 bg-white overflow-hidden min-h-[400px]">
          <div className="w-full max-w-2xl overflow-hidden">
            <div className="relative overflow-hidden">
              <div className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full left-0"></div>
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-base md:text-lg font-serif overflow-wrap-anywhere break-words pl-6" style={{ wordBreak: 'break-word', overflow: 'hidden', maxWidth: '100%' }}>
                {page.note}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.12)]" style={{ maxWidth: '800px', width: '100%', borderRadius: '16px' }}>
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
        <div className={`w-full ${hasPhotos ? 'md:w-1/2' : ''} flex items-center justify-center p-8 md:p-12 bg-white overflow-hidden`}>
          <div className="w-full max-w-md overflow-hidden">
            {hasNote ? (
              <div className="relative overflow-hidden">
                <div className={`absolute top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full ${isEven ? 'left-0' : 'right-0'}`}></div>
                <p className={`text-gray-800 whitespace-pre-wrap leading-relaxed text-base md:text-lg font-serif overflow-wrap-anywhere break-words ${isEven ? 'pl-6' : 'pr-6'}`} style={{ wordBreak: 'break-word', overflow: 'hidden', maxWidth: '100%' }}>
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
                <p className="text-gray-400 italic text-base">
                  {hasPhotos ? 'Khoảnh khắc đáng nhớ...' : 'Viết cảm xúc của bạn...'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
