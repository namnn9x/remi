import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMemoryBook } from '../contexts/MemoryBookContext';
import { api, ApiError } from '../api/client';
import type { MemoryBookType } from '../types';

export default function CreateMemoryBook() {
  const navigate = useNavigate();
  const { setMemoryBookId } = useMemoryBook();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const defaultType: MemoryBookType = 'Lớp học';
      const memoryBook = await api.createMemoryBook(name.trim(), defaultType);
      setMemoryBookId(memoryBook.id);
      navigate('/pages');
    } catch (err) {
      const apiError = err as ApiError;
      const errorMessage = apiError?.error?.message || 'Có lỗi xảy ra khi tạo nhật ký';
      setError(errorMessage);
      console.error('Error creating memory book:', {
        error: apiError,
        apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
        fullError: err,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-12">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => navigate('/my-books')}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Memory Books của tôi
            </button>
          </div>
          <div className="inline-block mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
              📝
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Tạo nhật ký mới
          </h1>
          <p className="text-gray-600">
            Bắt đầu hành trình lưu giữ kỷ niệm của bạn
          </p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
          {/* Name Input */}
          <div className="mb-8">
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-3">
              Tên nhật ký
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Lớp 12A1 - Kỷ niệm tốt nghiệp"
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-gray-900 placeholder-gray-400"
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Đang tạo...' : 'Tiếp tục'}
          </button>
        </form>
      </div>
    </div>
  );
}
