import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MemoryBookType } from '../types';

export default function CreateMemoryBook() {
  const navigate = useNavigate();
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      // Set default type
      const defaultType: MemoryBookType = 'Lớp học';
      localStorage.setItem('memoryBook', JSON.stringify({ name, type: defaultType, photos: [], pages: [] }));
      navigate('/pages');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-12">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
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

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
          >
            Tiếp tục
          </button>
        </form>
      </div>
    </div>
  );
}
