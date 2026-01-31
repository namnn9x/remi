import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PhotoUploader from '../components/PhotoUploader';
import PhotoPageEditor from '../components/PhotoPageEditor';
import type { Photo, PhotoPage, PhotoLayout } from '../types';

export default function UploadPhotos() {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [pages, setPages] = useState<PhotoPage[]>([]);
  const [currentStep, setCurrentStep] = useState<'upload' | 'pages'>('upload');

  useEffect(() => {
    const saved = localStorage.getItem('memoryBook');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.photos && data.photos.length > 0) {
        setPhotos(data.photos);
      }
      if (data.pages && data.pages.length > 0) {
        setPages(data.pages);
      }
    }
  }, []);

  const handlePhotosChange = (newPhotos: Photo[]) => {
    setPhotos(newPhotos);
    const saved = localStorage.getItem('memoryBook');
    if (saved) {
      const data = JSON.parse(saved);
      data.photos = newPhotos.map((p) => ({
        id: p.id,
        preview: p.preview,
        note: p.note,
        prompt: p.prompt,
      }));
      localStorage.setItem('memoryBook', JSON.stringify(data));
    }
  };

  const handleContinue = () => {
    if (photos.length === 0) {
      alert('Vui lòng thêm ít nhất một ảnh');
      return;
    }
    if (pages.length === 0) {
      const firstPhoto = photos[0];
      const newPage: PhotoPage = {
        id: Math.random().toString(36).substr(2, 9),
        photos: [firstPhoto],
        layout: 'single',
        note: '',
      };
      setPages([newPage]);
    }
    setCurrentStep('pages');
  };

  const handleAddPage = () => {
    const usedPhotoIds = new Set(
      pages.flatMap((page) => page.photos.map((p) => p.id))
    );
    const availablePhoto = photos.find((p) => !usedPhotoIds.has(p.id));

    if (!availablePhoto) {
      alert('Đã sử dụng hết ảnh. Vui lòng thêm ảnh mới.');
      return;
    }

    const newPage: PhotoPage = {
      id: Math.random().toString(36).substr(2, 9),
      photos: [availablePhoto],
      layout: 'single',
      note: '',
    };
    const newPages = [...pages, newPage];
    setPages(newPages);
    savePages(newPages);
  };

  const handleUpdatePage = (updatedPage: PhotoPage) => {
    const newPages = pages.map((p) =>
      p.id === updatedPage.id ? updatedPage : p
    );
    setPages(newPages);
    savePages(newPages);
  };

  const handleRemovePage = (pageId: string) => {
    const newPages = pages.filter((p) => p.id !== pageId);
    setPages(newPages);
    savePages(newPages);
  };

  const savePages = (pagesToSave: PhotoPage[]) => {
    const saved = localStorage.getItem('memoryBook');
    if (saved) {
      const data = JSON.parse(saved);
      data.pages = pagesToSave.map((page) => ({
        id: page.id,
        photos: page.photos.map((p) => ({
          id: p.id,
          preview: p.preview,
          note: p.note,
          prompt: p.prompt,
        })),
        layout: page.layout,
        note: page.note,
      }));
      localStorage.setItem('memoryBook', JSON.stringify(data));
    }
  };

  const handleFinish = () => {
    if (pages.length === 0) {
      alert('Vui lòng tạo ít nhất một trang nhật ký');
      return;
    }
    navigate('/preview');
  };

  const usedPhotoIds = new Set(
    pages.flatMap((page) => page.photos.map((p) => p.id))
  );
  const unusedPhotosCount = photos.filter((p) => !usedPhotoIds.has(p.id)).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {currentStep === 'upload' ? '📸 Thêm ảnh' : '📖 Tạo trang nhật ký'}
          </h1>
          <p className="text-gray-600 text-lg">
            {currentStep === 'upload' 
              ? 'Chọn những khoảnh khắc đáng nhớ nhất' 
              : 'Sắp xếp ảnh và viết cảm xúc cho từng trang'}
          </p>
        </div>

        {currentStep === 'upload' ? (
          <>
            <PhotoUploader
              photos={photos}
              onPhotosChange={handlePhotosChange}
              maxPhotos={20}
            />
            <div className="mt-8 text-center">
              <button
                onClick={handleContinue}
                disabled={photos.length === 0}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Tiếp tục →
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-6 mb-8">
              {pages.map((page, index) => (
                <PhotoPageEditor
                  key={page.id}
                  page={page}
                  allPhotos={photos}
                  onUpdate={handleUpdatePage}
                  onRemove={() => handleRemovePage(page.id)}
                  pageNumber={index + 1}
                />
              ))}
            </div>

            <div className="mb-8 text-center">
              <button
                onClick={handleAddPage}
                disabled={unusedPhotosCount === 0}
                className="px-6 py-3 border-2 border-dashed border-gray-300 text-gray-600 font-medium rounded-xl hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white"
              >
                + Thêm trang mới
              </button>
              {unusedPhotosCount > 0 && (
                <p className="text-sm text-gray-500 mt-3">
                  Còn {unusedPhotosCount} ảnh chưa sử dụng
                </p>
              )}
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setCurrentStep('upload')}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all bg-white"
              >
                ← Quay lại
              </button>
              <button
                onClick={handleFinish}
                disabled={pages.length === 0}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Xem nhật ký
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
