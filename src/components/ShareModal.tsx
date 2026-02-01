import { useState } from 'react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  memoryBookId: string; // This is actually shareId
  memoryBookName: string;
  contributeId?: string; // Optional contributeId
}

export default function ShareModal({ isOpen, onClose, memoryBookId, memoryBookName, contributeId }: ShareModalProps) {
  const [copied, setCopied] = useState<'view' | 'contribute' | 'text' | null>(null);

  const viewLink = `${window.location.origin}/view/${memoryBookId}`;
  const contributeLink = contributeId 
    ? `${window.location.origin}/contribute/${contributeId}`
    : `${window.location.origin}/contribute/${memoryBookId}`;
  const shareText = `Xem nhật ký "${memoryBookName}" của chúng mình nhé! 📔💕\n\n${viewLink}`;

  const copyToClipboard = async (text: string, type: 'view' | 'contribute' | 'text') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8 border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Chia sẻ nhật ký</h2>
            <p className="text-sm text-gray-500">Chia sẻ với bạn bè và người thân</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors"
            aria-label="Đóng"
          >
            ×
          </button>
        </div>

        <div className="space-y-5">
          {/* View Link */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Link xem nhật ký
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={viewLink}
                readOnly
                className="flex-1 px-3 py-2.5 border-2 border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-900 focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(viewLink, 'view')}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  copied === 'view'
                    ? 'bg-green-500 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copied === 'view' ? '✓ Đã copy' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Contribute Link */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Link đóng góp ảnh
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={contributeLink}
                readOnly
                className="flex-1 px-3 py-2.5 border-2 border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-900 focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(contributeLink, 'contribute')}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  copied === 'contribute'
                    ? 'bg-green-500 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {copied === 'contribute' ? '✓ Đã copy' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Share Text */}
          <div className="pt-4 border-t border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Text chia sẻ gợi ý
            </label>
            <textarea
              value={shareText}
              readOnly
              rows={4}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-900 focus:outline-none resize-none"
            />
            <button
              onClick={() => copyToClipboard(shareText, 'text')}
              className={`mt-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                copied === 'text'
                  ? 'bg-green-500 text-white'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg'
              }`}
            >
              {copied === 'text' ? '✓ Đã copy text' : 'Copy text chia sẻ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
