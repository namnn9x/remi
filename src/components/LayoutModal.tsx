import type { PhotoLayout } from '../types';

interface LayoutOption {
  id: PhotoLayout;
  name: string;
  icon: string;
  preview: string;
}

const LAYOUT_OPTIONS: Record<number, LayoutOption[]> = {
  1: [
    {
      id: 'single',
      name: '1 ảnh',
      icon: '🖼️',
      preview: 'grid-template-columns: 1fr; grid-template-rows: 1fr;',
    },
  ],
  2: [
    {
      id: 'two-horizontal',
      name: '2 ảnh ngang',
      icon: '↔️',
      preview: 'grid-template-columns: 1fr 1fr; grid-template-rows: 1fr;',
    },
    {
      id: 'two-vertical',
      name: '2 ảnh dọc',
      icon: '↕️',
      preview: 'grid-template-columns: 1fr; grid-template-rows: 1fr 1fr;',
    },
  ],
  3: [
    {
      id: 'three-left',
      name: '1 lớn trái',
      icon: '⬅️',
      preview: 'grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr;',
    },
    {
      id: 'three-right',
      name: '1 lớn phải',
      icon: '➡️',
      preview: 'grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr;',
    },
    {
      id: 'three-top',
      name: '1 lớn trên',
      icon: '⬆️',
      preview: 'grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr;',
    },
    {
      id: 'three-bottom',
      name: '1 lớn dưới',
      icon: '⬇️',
      preview: 'grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr;',
    },
  ],
  4: [
    {
      id: 'four-grid',
      name: 'Grid 2x2',
      icon: '⊞',
      preview: 'grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr;',
    },
  ],
};

interface LayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoCount: number;
  selectedLayout: PhotoLayout;
  onSelect: (layout: PhotoLayout) => void;
  previewPhotos: string[];
}

export default function LayoutModal({
  isOpen,
  onClose,
  photoCount,
  selectedLayout,
  onSelect,
  previewPhotos,
}: LayoutModalProps) {
  const availableLayouts = LAYOUT_OPTIONS[photoCount] || [];

  const renderLayoutPreview = (layout: PhotoLayout) => {
    const getGridAreas = (layout: PhotoLayout) => {
      switch (layout) {
        case 'single':
          return { gridTemplateAreas: '"photo1"' };
        case 'two-horizontal':
          return { gridTemplateAreas: '"photo1 photo2"' };
        case 'two-vertical':
          return { gridTemplateAreas: '"photo1" "photo2"' };
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
      ...getGridAreas(layout),
    };

    return (
      <div style={gridStyle} className="w-full h-full rounded-lg overflow-hidden">
        {Array.from({ length: photoCount }).map((_, idx) => (
          <div
            key={idx}
            style={{
              gridArea: `photo${idx + 1}`,
              backgroundImage: previewPhotos[idx]
                ? `url(${previewPhotos[idx]})`
                : 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            className="bg-gray-100"
          />
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  const handleSelect = (layout: PhotoLayout) => {
    onSelect(layout);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Minimal */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Chọn layout
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            aria-label="Đóng"
          >
            ×
          </button>
        </div>

        {/* Layout Options - Facebook style */}
        {availableLayouts.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Vui lòng chọn 1-4 ảnh để xem layout
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {availableLayouts.map((layout) => {
              const isSelected = selectedLayout === layout.id;
              return (
                <button
                  key={layout.id}
                  onClick={() => handleSelect(layout.id)}
                  className={`
                    relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200
                    transform hover:scale-105
                    ${
                      isSelected
                        ? 'border-blue-500 shadow-lg ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  {/* Preview */}
                  <div className="w-full h-full">
                    {renderLayoutPreview(layout.id)}
                  </div>
                  
                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
