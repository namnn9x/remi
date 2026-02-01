import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMemoryBook } from '../contexts/MemoryBookContext';
import { api, ApiError, MemoryBookResponse } from '../api/client';
import type { MemoryBookType } from '../types';

type TabType = 'myBooks' | 'contributed';

export default function MyMemoryBooks() {
  const navigate = useNavigate();
  const { setMemoryBookId } = useMemoryBook();
  const [activeTab, setActiveTab] = useState<TabType>('myBooks');
  const [myBooks, setMyBooks] = useState<MemoryBookResponse[]>([]);
  const [contributedBooks, setContributedBooks] = useState<MemoryBookResponse[]>([]);
  const [total, setTotal] = useState({ myBooks: 0, contributedBooks: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Create form state
  const [createName, setCreateName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    const loadMemoryBooks = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await api.getMyMemoryBooks(50, 0);
        setMyBooks(result.data.myBooks);
        setContributedBooks(result.data.contributedBooks);
        setTotal(result.total);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.error?.message || 'Không thể tải danh sách nhật ký');
        console.error('Error loading memory books:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMemoryBooks();
  }, []);

  const handleBookClick = (bookId: string) => {
    setMemoryBookId(bookId);
    navigate(`/gallery`, { state: { memoryBookId: bookId } });
  };

  const handleEditClick = (bookId: string) => {
    setMemoryBookId(bookId);
    navigate(`/pages`, { state: { memoryBookId: bookId } });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) return;

    setCreateLoading(true);
    setCreateError(null);

    try {
      const defaultType: MemoryBookType = 'Lớp học';
      const memoryBook = await api.createMemoryBook(createName.trim(), defaultType);
      setMemoryBookId(memoryBook.id);
      
      // Reload the list
      const result = await api.getMyMemoryBooks(50, 0);
      setMyBooks(result.data.myBooks);
      setContributedBooks(result.data.contributedBooks);
      setTotal(result.total);
      
      // Reset form
      setCreateName('');
      
      // Navigate to pages editor
      navigate('/pages', { state: { memoryBookId: memoryBook.id } });
    } catch (err) {
      const apiError = err as ApiError;
      setCreateError(apiError?.error?.message || 'Có lỗi xảy ra khi tạo nhật ký');
      console.error('Error creating memory book:', err);
    } finally {
      setCreateLoading(false);
    }
  };

  const getBookThumbnail = (book: MemoryBookResponse): string | null => {
    if (book.pages && book.pages.length > 0) {
      const firstPage = book.pages[0];
      if (firstPage.photos && firstPage.photos.length > 0) {
        return firstPage.photos[0].url;
      }
    }
    return null;
  };

  const renderBookCard = (book: MemoryBookResponse, isLeader: boolean) => {
    const thumbnail = getBookThumbnail(book);
    const date = new Date(book.createdAt).toLocaleDateString('vi-VN');

    return (
      <div
        key={book.id}
        className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden cursor-pointer group"
        onClick={() => handleBookClick(book.id)}
      >
        {/* Thumbnail */}
        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={book.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl text-gray-300">📔</span>
            </div>
          )}
          {isLeader && (
            <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
              Leader
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {book.name}
          </h3>
          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <span className="flex items-center gap-1">
              <span>✨</span>
              <span>{book.type}</span>
            </span>
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{book.pages?.length || 0} trang</span>
            <span>•</span>
            <span>{book.pages?.reduce((acc, page) => acc + (page.photos?.length || 0), 0) || 0} ảnh</span>
          </div>
          {isLeader && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditClick(book.id);
              }}
              className="mt-3 w-full py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium text-sm transition-colors"
            >
              Chỉnh sửa
            </button>
          )}
        </div>
      </div>
    );
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const currentBooks = activeTab === 'myBooks' ? myBooks : contributedBooks;

  // Show list view
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Memory Books của tôi
            </h1>
            <p className="text-gray-600">
              Xem và quản lý tất cả Memory Books của bạn
            </p>
          </div>

          {/* Create Form - Compact */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <form onSubmit={handleCreateSubmit} className="flex gap-4 items-end">
              <div className="flex-1">
                <label htmlFor="create-name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Tạo Memory Book mới
                </label>
                <input
                  id="create-name"
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="Ví dụ: Lớp 12A1 - Kỷ niệm tốt nghiệp"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-gray-900 placeholder-gray-400"
                  required
                />
                {createError && (
                  <div className="mt-2 text-sm text-red-600">{createError}</div>
                )}
              </div>
              <button
                type="submit"
                disabled={createLoading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none whitespace-nowrap"
              >
                {createLoading ? 'Đang tạo...' : 'Tạo mới'}
              </button>
            </form>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('myBooks')}
              className={`px-6 py-3 font-semibold transition-colors relative ${
                activeTab === 'myBooks'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Memory Books của tôi
              {total.myBooks > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
                  {total.myBooks}
                </span>
              )}
              {activeTab === 'myBooks' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('contributed')}
              className={`px-6 py-3 font-semibold transition-colors relative ${
                activeTab === 'contributed'
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Đã đóng góp
              {total.contributedBooks > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
                  {total.contributedBooks}
                </span>
              )}
              {activeTab === 'contributed' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        {currentBooks.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📔</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {activeTab === 'myBooks'
                ? 'Bạn chưa tạo Memory Book nào'
                : 'Bạn chưa đóng góp cho Memory Book nào'}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'myBooks'
                ? 'Hãy tạo Memory Book đầu tiên để bắt đầu lưu giữ kỷ niệm'
                : 'Hãy đóng góp ảnh cho Memory Books của bạn bè'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentBooks.map((book) =>
              renderBookCard(book, activeTab === 'myBooks' || book.isLeader === true)
            )}
          </div>
        )}
      </div>
    </div>
  );
}
