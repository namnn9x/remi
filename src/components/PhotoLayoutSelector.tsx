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

interface PhotoLayoutSelectorProps {
  photoCount: number;
  selectedLayout: PhotoLayout;
  onSelect: (layout: PhotoLayout) => void;
  previewPhotos: string[];
}

export default function PhotoLayoutSelector({
  photoCount,
  selectedLayout,
  onSelect,
  previewPhotos,
}: PhotoLayoutSelectorProps) {
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
      <div style={gridStyle} className="w-full h-12 rounded overflow-hidden bg-gray-100">
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
            className="bg-blue-100"
          />
        ))}
      </div>
    );
  };

  if (availableLayouts.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4 text-sm">
        Vui lòng chọn 1-4 ảnh để xem layout
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="mb-2">
        <p className="text-sm font-semibold text-gray-700 mb-0.5">
          Chọn cách sắp xếp ảnh
        </p>
        <p className="text-xs text-gray-500">
          Layout cho {photoCount} ảnh
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {availableLayouts.map((layout) => {
          const isSelected = selectedLayout === layout.id;
          return (
            <button
              key={layout.id}
              onClick={() => onSelect(layout.id)}
              className={`
                p-2 rounded-lg border-2 transition-all duration-200
                transform hover:scale-105 bg-white
                ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="text-lg mb-1">{layout.icon}</div>
              <div className={`text-[10px] font-semibold mb-1 ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                {layout.name}
              </div>
              {renderLayoutPreview(layout.id)}
              {isSelected && (
                <div className="mt-1 text-center">
                  <span className="text-blue-600 text-xs font-bold">✓</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
