import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageEditorSidebar from '../components/PageEditorSidebar';
import SinglePagePreview from '../components/SinglePagePreview';
import PageNavigationBar from '../components/PageNavigationBar';
import ShareModal from '../components/ShareModal';
import type { Photo, PhotoPage } from '../types';

const PROMPTS = [
  'Khoảnh khắc này xảy ra khi…',
  'Điều không ai biết về bức ảnh này là…',
  'Nếu quay lại ngày hôm đó, điều muốn nói nhất là…',
];

export default function CreatePages() {
  const navigate = useNavigate();
  const [pages, setPages] = useState<PhotoPage[]>([]);
  const [allPhotos, setAllPhotos] = useState<Photo[]>([]);
  const [memoryBook, setMemoryBook] = useState<{ name: string; type: string } | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentPageId, setCurrentPageId] = useState<string>('');
  const [memoryBookId] = useState(() => Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    const saved = localStorage.getItem('memoryBook');
    if (saved) {
      const data = JSON.parse(saved);
      setMemoryBook({
        name: data.name,
        type: data.type,
      });
      if (data.pages && data.pages.length > 0) {
        setPages(data.pages);
      }
      if (data.photos && data.photos.length > 0) {
        setAllPhotos(data.photos);
      }
      // Auto-create first page if no pages exist
      if (!data.pages || data.pages.length === 0) {
        const newPage: PhotoPage = {
          id: Math.random().toString(36).substr(2, 9),
          photos: [],
          layout: 'single',
          note: '',
        };
        setPages([newPage]);
        setCurrentPageId(newPage.id);
        savePages([newPage]);
      } else {
        setCurrentPageId(data.pages[0].id);
      }
    } else {
      navigate('/create');
    }
  }, [navigate]);

  const getRandomPrompt = () => PROMPTS[Math.floor(Math.random() * PROMPTS.length)];

  const handleFileSelect = (files: FileList | null, pageId?: string) => {
    if (!files) return;

    const newPhotos: Photo[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const id = Math.random().toString(36).substr(2, 9);
        const preview = URL.createObjectURL(file);
        newPhotos.push({
          id,
          file,
          preview,
          note: '',
          prompt: getRandomPrompt(),
        });
      }
    });

    const updatedPhotos = [...allPhotos, ...newPhotos];
    setAllPhotos(updatedPhotos);
    savePhotos(updatedPhotos);

    // Auto-add photos to the page that uploaded them
    if (pageId && newPhotos.length > 0) {
      // Use updatedPhotos (which includes newPhotos) to ensure we have the latest
      setPages((currentPages) => {
        const page = currentPages.find((p) => p.id === pageId);
        if (page && page.photos.length < 4) {
          const photosToAddIds = newPhotos.slice(0, 4 - page.photos.length).map((p) => p.id);
          const photosToAdd = updatedPhotos.filter((p) => photosToAddIds.includes(p.id));
          const updatedPage = {
            ...page,
            photos: [...page.photos, ...photosToAdd],
          };
          const newPages = currentPages.map((p) =>
            p.id === updatedPage.id ? updatedPage : p
          );
          savePages(newPages);
          return newPages;
        }
        return currentPages;
      });
    }
  };

  const savePhotos = (photosToSave: Photo[]) => {
    const saved = localStorage.getItem('memoryBook');
    if (saved) {
      const data = JSON.parse(saved);
      data.photos = photosToSave.map((p) => ({
        id: p.id,
        preview: p.preview,
        note: p.note,
        prompt: p.prompt,
      }));
      localStorage.setItem('memoryBook', JSON.stringify(data));
    }
  };

  const handleAddPage = () => {
    const newPage: PhotoPage = {
      id: Math.random().toString(36).substr(2, 9),
      photos: [],
      layout: 'single',
      note: '',
    };
    const newPages = [...pages, newPage];
    setPages(newPages);
    setCurrentPageId(newPage.id);
    savePages(newPages);
  };

  const handleSelectPage = (pageId: string) => {
    setCurrentPageId(pageId);
  };

  const handleUpdatePage = (updatedPage: PhotoPage) => {
    // Ensure photos are from current allPhotos
    const updatedPageWithLatestPhotos = {
      ...updatedPage,
      photos: updatedPage.photos
        .map((pagePhoto) => allPhotos.find((p) => p.id === pagePhoto.id))
        .filter((p): p is Photo => p !== undefined),
    };
    
    setPages((currentPages) => {
      const newPages = currentPages.map((p) =>
        p.id === updatedPageWithLatestPhotos.id ? updatedPageWithLatestPhotos : p
      );
      savePages(newPages);
      return newPages;
    });
  };

  // Update currentPageId when pages change
  useEffect(() => {
    if (pages.length > 0 && (!currentPageId || !pages.find((p) => p.id === currentPageId))) {
      setCurrentPageId(pages[0].id);
    }
  }, [pages, currentPageId]);

  const handleRemovePage = (pageId: string) => {
    const newPages = pages.filter((p) => p.id !== pageId);
    setPages(newPages);
    savePages(newPages);
    
    // Select a new current page if the removed one was selected
    if (currentPageId === pageId) {
      if (newPages.length > 0) {
        setCurrentPageId(newPages[0].id);
      } else {
        setCurrentPageId('');
      }
    }
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

  const currentPage = pages.find((p) => p.id === currentPageId) || pages[0];
  const currentPageIndex = pages.findIndex((p) => p.id === currentPageId);

  return (
    <>
      <div className="bg-gray-100 h-screen overflow-hidden flex flex-col">
        {/* Header - Fixed */}
        <div className="bg-white shadow-sm border-b border-gray-200 z-30 flex-shrink-0" style={{ height: '72px' }}>
          <div className="w-full h-full px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/create')}
                className="px-4 py-2 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
              >
                ← Quay lại
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{memoryBook.name}</h1>
              </div>
            </div>
            <button
              onClick={() => setShowShareModal(true)}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.493 9 12c0-.493-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              Chia sẻ
            </button>
          </div>
        </div>

        {/* Main Canvas Layout */}
        <div className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 72px - 136px)', minHeight: 0 }}>
          {/* Left Sidebar - Editor Tools */}
          <div 
            className="w-[280px] bg-white shadow-lg flex flex-col flex-shrink-0"
            style={{ 
              height: 'calc(100vh - 72px - 136px)',
              overflowY: 'hidden',
            }}
          >
            {currentPage && (
              <PageEditorSidebar
                page={currentPage}
                allPhotos={allPhotos}
                onUpdate={handleUpdatePage}
                onUploadPhotos={(files) => handleFileSelect(files, currentPage.id)}
                pageNumber={currentPageIndex + 1}
                onRemove={() => handleRemovePage(currentPage.id)}
              />
            )}
          </div>

          {/* Right Area - Preview */}
          <div className="flex-1 bg-gray-100 flex items-center justify-center p-8 overflow-y-auto scrollbar-thin">
            {currentPage ? (
              <SinglePagePreview
                page={currentPage}
                memoryBookName={memoryBook.name}
                memoryBookType={memoryBook.type}
                pageNumber={currentPageIndex + 1}
              />
            ) : (
              <div className="text-center text-gray-400">
                <p>Chưa có trang nào</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Bar - Page Navigation */}
        <PageNavigationBar
          pages={pages}
          currentPageId={currentPageId}
          onSelectPage={handleSelectPage}
          onAddPage={handleAddPage}
          onRemovePage={handleRemovePage}
        />
      </div>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        memoryBookId={memoryBookId}
        memoryBookName={memoryBook.name}
      />
    </>
  );
}
