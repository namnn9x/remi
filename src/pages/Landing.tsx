import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col px-4 py-12 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header with Auth */}
      <div className="max-w-3xl mx-auto w-full mb-8 flex justify-end">
        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Xin chào, <strong>{user?.name}</strong></span>
            <button
              onClick={() => navigate('/gallery')}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              Gallery
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              Đăng xuất
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              Đăng nhập
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Đăng ký
            </button>
          </div>
        )}
      </div>

      <div className="max-w-3xl mx-auto text-center flex-1 flex items-center justify-center">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="inline-block mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-3xl flex items-center justify-center text-5xl shadow-xl transform rotate-6 hover:rotate-0 transition-transform duration-300">
              📔
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Nhật Ký
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Kỷ Niệm
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
            Lưu lại những khoảnh khắc đẹp nhất,<br />
            những cảm xúc chân thật nhất của bạn
          </p>
        </div>

        {/* CTA Button */}
        {isAuthenticated ? (
          <button
            onClick={() => navigate('/create')}
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 mb-8 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <span>Bắt đầu tạo nhật ký</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        ) : (
          <div className="mb-8">
            <p className="text-gray-600 mb-4">Vui lòng đăng nhập để tạo nhật ký kỷ niệm</p>
            <button
              onClick={() => navigate('/login')}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span>Đăng nhập</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-3">✨</div>
            <h3 className="font-semibold text-gray-900 mb-2">Đơn giản</h3>
            <p className="text-sm text-gray-600">Dễ sử dụng, không cần kỹ thuật</p>
          </div>
          <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-3">💝</div>
            <h3 className="font-semibold text-gray-900 mb-2">Miễn phí</h3>
            <p className="text-sm text-gray-600">Tạo không giới hạn, không phí</p>
          </div>
          <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-3">📸</div>
            <h3 className="font-semibold text-gray-900 mb-2">Đầy cảm xúc</h3>
            <p className="text-sm text-gray-600">Lưu giữ kỷ niệm đẹp nhất</p>
          </div>
        </div>
      </div>
    </div>
  );
}
