import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MemoryGallery from '../components/MemoryGallery';
import type { PhotoPage } from '../types';

export default function MemoryGalleryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [memoryBook, setMemoryBook] = useState<{
    name: string;
    type: string;
    pages: PhotoPage[];
  } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('memoryBook');
    if (saved) {
      const data = JSON.parse(saved);
      setMemoryBook({
        name: data.name,
        type: data.type,
        pages: data.pages || [],
      });
    } else {
      navigate('/create');
    }
  }, [navigate]);

  const handlePageClick = (pageId: string) => {
    // Navigate to edit mode with this page selected
    navigate('/pages', { state: { pageId } });
  };

  if (!memoryBook) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
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
