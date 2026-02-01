import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMemoryBook } from '../contexts/MemoryBookContext';
import { api, ApiError } from '../api/client';
import { photoPageResponseToPhotoPage } from '../utils/photoUtils';
import TemplateRenderer from '../components/TemplateRenderer';
import ShareModal from '../components/ShareModal';
import type { PhotoPage } from '../types';

export default function MemoryPreview() {
  const navigate = useNavigate();
  const { shareId } = useParams<{ shareId?: string }>();
  const { memoryBookId } = useMemoryBook();
  const [memoryBook, setMemoryBook] = useState<{
    id: string;
    name: string;
    type: string;
    pages: PhotoPage[];
    shareId?: string;
    contributeId?: string;
  } | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMemoryBook = async () => {
      setLoading(true);
      setError(null);

      try {
        let data;
        if (shareId) {
          // Load via shareId (public view)
          data = await api.getMemoryBookByShareId(shareId);
        } else if (memoryBookId) {
          // Load via memoryBookId (owner view)
          data = await api.getMemoryBook(memoryBookId);
        } else {
          navigate('/');
          return;
        }

        setMemoryBook({
          id: data.id,
          name: data.name,
          type: data.type,
          pages: data.pages.map(photoPageResponseToPhotoPage),
          shareId: data.shareId,
          contributeId: data.contributeId,
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
  }, [shareId, memoryBookId, navigate]);

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
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="sticky top-0 bg-white/98 backdrop-blur-md border-b border-gray-200/50 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900 transition font-medium flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Về trang chủ</span>
          </button>
          {!shareId && memoryBook.shareId && (
            <button
              onClick={() => setShowShareModal(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>Chia sẻ</span>
            </button>
          )}
        </div>
      </div>

      <TemplateRenderer
        pages={memoryBook.pages}
        memoryBookName={memoryBook.name}
        memoryBookType={memoryBook.type}
      />

      {memoryBook.shareId && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          memoryBookId={memoryBook.shareId}
          memoryBookName={memoryBook.name}
          contributeId={memoryBook.contributeId}
        />
      )}
    </>
  );
}
