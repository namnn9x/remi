import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMemoryBook } from '../contexts/MemoryBookContext';
import { api, ApiError } from '../api/client';
import { photoPageResponseToPhotoPage } from '../utils/photoUtils';
import MemoryGallery from '../components/MemoryGallery';
import type { PhotoPage } from '../types';

export default function MemoryGalleryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { memoryBookId } = useMemoryBook();
  const [memoryBook, setMemoryBook] = useState<{
    name: string;
    type: string;
    pages: PhotoPage[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMemoryBook = async () => {
      // Get memoryBookId from state (when navigating from MyMemoryBooks) or context
      const stateBookId = (location.state as any)?.memoryBookId;
      const bookIdToLoad = stateBookId || memoryBookId;

      if (!bookIdToLoad) {
        navigate('/create');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await api.getMemoryBook(bookIdToLoad);
        setMemoryBook({
          name: data.name,
          type: data.type,
          pages: data.pages.map(photoPageResponseToPhotoPage),
        });
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.error?.message || 'Không thể tải nhật ký');
        console.error('Error loading memory book:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMemoryBook();
  }, [memoryBookId, location.state, navigate]);

  const handlePageClick = (pageId: string) => {
    // Navigate to edit mode with this page selected
    navigate('/pages', { state: { pageId } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !memoryBook) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4">
        <div className="max-w-md w-full text-center">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              {error}
            </div>
          )}
          <button
            onClick={() => navigate('/create')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Tạo nhật ký mới
          </button>
        </div>
      </div>
    );
  }

  return (
    <MemoryGallery
      pages={memoryBook.pages}
      memoryBookName={memoryBook.name}
      memoryBookType={memoryBook.type}
      onPageClick={handlePageClick}
    />
  );
}
