import type { PhotoPage } from '../types';

interface PageNavigationBarProps {
  pages: PhotoPage[];
  currentPageId: string;
  onSelectPage: (pageId: string) => void;
  onAddPage: () => void;
  onRemovePage: (pageId: string) => void;
}

export default function PageNavigationBar({
  pages,
  currentPageId,
  onSelectPage,
  onAddPage,
  onRemovePage,
}: PageNavigationBarProps) {
  const getPageThumbnail = (page: PhotoPage) => {
    if (page.photos.length === 0) {
      return null;
    }
    return page.photos[0].preview;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-30" style={{ borderTop: '1px solid #e5e7eb', height: '136px' }}>
      <div className="flex items-center gap-3 px-4 py-3 overflow-x-auto scrollbar-thin h-full">
        {pages.map((page, index) => {
          const thumbnail = getPageThumbnail(page);
          const isActive = page.id === currentPageId;
          
          return (
            <div
              key={page.id}
              className="relative flex-shrink-0 group"
            >
              <button
                onClick={() => onSelectPage(page.id)}
                className={`
                  w-20 h-28 overflow-hidden transition-all duration-200
                  ${isActive
                    ? 'ring-2 ring-blue-500 shadow-[0_4px_12px_rgba(59,130,246,0.3)] scale-105'
                    : 'shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)] hover:scale-[1.02]'
                  }
                `}
                style={{ borderRadius: '12px' }}
              >
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt={`Page ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <span className="text-2xl text-gray-400">📄</span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs font-semibold py-1 text-center">
                  {index + 1}
                </div>
              </button>
              
              {pages.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemovePage(page.id);
                  }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs shadow-lg hover:bg-red-600"
                  aria-label="Xóa trang"
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
        
        {/* Add New Page Button */}
        <button
          onClick={onAddPage}
          className="flex-shrink-0 w-20 h-28 border-2 border-dashed border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-2 group shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
          style={{ borderRadius: '12px' }}
        >
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-xs font-medium text-gray-600 group-hover:text-blue-600">
            Thêm trang
          </span>
        </button>
      </div>
    </div>
  );
}
