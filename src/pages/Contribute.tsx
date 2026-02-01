import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, ApiError } from '../api/client';
import type { Photo } from '../types';

const PROMPTS = [
  'Khoảnh khắc này xảy ra khi…',
  'Điều không ai biết về bức ảnh này là…',
  'Nếu quay lại ngày hôm đó, điều muốn nói nhất là…',
];

export default function Contribute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [memoryBook, setMemoryBook] = useState<{
    id: string;
    name: string;
    type: string;
  } | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadMemoryBook = async () => {
      if (!id) {
        navigate('/');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await api.getMemoryBookByContributeId(id);
        setMemoryBook({
          id: data.id,
          name: data.name,
          type: data.type,
        });
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.error?.message || 'Không thể tải thông tin nhật ký');
        console.error('Error loading memory book:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMemoryBook();
  }, [id, navigate]);

  const getRandomPrompt = () => PROMPTS[Math.floor(Math.random() * PROMPTS.length)];

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newPhotos: Photo[] = [];
    Array.from(files).slice(0, 10 - photos.length).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const photoId = Math.random().toString(36).substr(2, 9);
        const preview = URL.createObjectURL(file);
        newPhotos.push({
          id: photoId,
          file,
          preview,
          note: '',
          prompt: getRandomPrompt(),
        });
      }
    });

    setPhotos([...photos, ...newPhotos]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const removePhoto = (photoId: string) => {
    const photo = photos.find((p) => p.id === photoId);
    if (photo) {
      URL.revokeObjectURL(photo.preview);
    }
    setPhotos(photos.filter((p) => p.id !== photoId));
  };

  const updatePhotoNote = (photoId: string, note: string) => {
    setPhotos(
      photos.map((p) => (p.id === photoId ? { ...p, note } : p))
    );
  };

  const handleSubmit = async () => {
    if (photos.length === 0 || !memoryBook) {
      alert('Vui lòng thêm ít nhất một ảnh');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const files = photos.map((p) => p.file!).filter((f) => f !== undefined);
      const notes = photos.map((p) => p.note);
      const prompts = photos.map((p) => p.prompt);

      await api.submitContributions(memoryBook.id, files, notes, prompts);
      setSubmitted(true);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error?.message || 'Không thể gửi đóng góp');
      console.error('Error submitting contributions:', err);
    } finally {
      setSubmitting(false);
    }
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

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Cảm ơn bạn đã đóng góp! 💕
          </h2>
          <p className="text-gray-600 mb-8">
            Ảnh của bạn đã được gửi thành công. Chủ nhật ký sẽ xem và thêm vào nhật ký sớm nhất có thể.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  if (!memoryBook) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
              📸
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Đóng góp ảnh
          </h1>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl px-6 py-3 inline-block shadow-md">
            <p className="text-sm text-gray-600 mb-1">Cho nhật ký:</p>
            <p className="text-lg font-semibold text-gray-900">{memoryBook.name}</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* Upload Area */}
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-4">
            Chọn ảnh ({photos.length}/10)
          </label>

          {photos.length < 10 && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-xl p-8 text-center mb-6 cursor-pointer transition-all
                ${dragging
                  ? 'border-blue-500 bg-blue-50 scale-[1.02]'
                  : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
              <div className="mb-2">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="text-sm text-gray-700 font-medium">
                  Kéo thả ảnh vào đây hoặc{' '}
                  <span className="text-blue-600 font-semibold">chọn từ máy tính</span>
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Tối đa 10 ảnh
                </p>
              </div>
            </div>
          )}

          {/* Photo Grid with Notes */}
          {photos.length > 0 && (
            <div className="space-y-4">
              {photos.map((photo) => (
                <div key={photo.id} className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                  <div className="flex gap-4 mb-3">
                    <img
                      src={photo.preview}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-xs text-gray-500 font-medium mb-2">{photo.prompt}</p>
                        <button
                          onClick={() => removePhoto(photo.id)}
                          className="text-red-500 hover:text-red-700 text-xl font-bold"
                          aria-label="Xóa ảnh"
                        >
                          ×
                        </button>
                      </div>
                      <textarea
                        value={photo.note}
                        onChange={(e) => updatePhotoNote(photo.id, e.target.value)}
                        placeholder="Viết cảm xúc về khoảnh khắc này..."
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none bg-white text-sm text-gray-900 placeholder-gray-400"
                        rows={2}
                        maxLength={200}
                      />
                      <p className="text-xs text-gray-500 mt-1 text-right">
                        {photo.note.length}/200
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={photos.length === 0 || submitting}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {submitting ? 'Đang gửi...' : 'Gửi ảnh đóng góp'}
          </button>
        </div>
      </div>
    </div>
  );
}
