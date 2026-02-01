import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMemoryBook } from '../contexts/MemoryBookContext';
import { api, ApiError } from '../api/client';
import {
  photoResponseToPhoto,
  photoPageResponseToPhotoPage,
  photoPageToPhotoPageResponse,
} from '../utils/photoUtils';
import PageEditorSidebar from '../components/PageEditorSidebar';
import SinglePagePreview from '../components/SinglePagePreview';
import PageNavigationBar from '../components/PageNavigationBar';
import type { Photo, PhotoPage } from '../types';

const PROMPTS = [
  'Khoảnh khắc này xảy ra khi…',
  'Điều không ai biết về bức ảnh này là…',
  'Nếu quay lại ngày hôm đó, điều muốn nói nhất là…',
];

export default function CreatePages() {
  const navigate = useNavigate();
  const location = useLocation();
  const { memoryBookId, setMemoryBookId } = useMemoryBook();
  const [pages, setPages] = useState<PhotoPage[]>([]);
  const [allPhotos, setAllPhotos] = useState<Photo[]>([]);
  const [memoryBook, setMemoryBook] = useState<{ name: string; type: string; id: string } | null>(null);
  const [currentPageId, setCurrentPageId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load memory book from API
  useEffect(() => {
    const loadMemoryBook = async () => {
      if (!memoryBookId) {
        navigate('/create');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await api.getMemoryBook(memoryBookId);
        setMemoryBook({
          id: data.id,
          name: data.name,
          type: data.type,
        });

        // Convert API responses to UI types
        const convertedPages = data.pages.map(photoPageResponseToPhotoPage);
        setPages(convertedPages);

        // Extract all photos from pages
        const allPhotosFromPages = convertedPages.flatMap((page) => page.photos);
        // Remove duplicates by id
        const uniquePhotos = Array.from(
          new Map(allPhotosFromPages.map((p) => [p.id, p])).values()
        );
        setAllPhotos(uniquePhotos);

        // Auto-create first page if no pages exist
        if (convertedPages.length === 0) {
          const newPage: PhotoPage = {
            id: Math.random().toString(36).substr(2, 9),
            photos: [],
            layout: 'single',
            note: '',
          };
          setPages([newPage]);
          setCurrentPageId(newPage.id);
        } else {
          // Check if there's a pageId from navigation state (from gallery click)
          const statePageId = (location.state as { pageId?: string })?.pageId;
          if (statePageId && convertedPages.find((p) => p.id === statePageId)) {
            setCurrentPageId(statePageId);
          } else {
            setCurrentPageId(convertedPages[0].id);
          }
        }
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.error?.message || 'Không thể tải nhật ký');
        console.error('Error loading memory book:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMemoryBook();
  }, [memoryBookId, navigate, location.state]);

  const getRandomPrompt = () => PROMPTS[Math.floor(Math.random() * PROMPTS.length)];

  // Save pages to API
  const savePages = useCallback(
    async (pagesToSave: PhotoPage[]) => {
      if (!memoryBookId || saving) return;

      setSaving(true);
      try {
        const pagesResponse = pagesToSave.map(photoPageToPhotoPageResponse);
        await api.updateMemoryBook(memoryBookId, { pages: pagesResponse });
      } catch (err) {
        const apiError = err as ApiError;
        console.error('Error saving pages:', err);
        setError(apiError.error?.message || 'Không thể lưu trang');
      } finally {
        setSaving(false);
      }
    },
    [memoryBookId, saving]
  );

  // Upload photos
  const handleFileSelect = async (files: FileList | null, pageId?: string) => {
    if (!files || !memoryBookId) return;

    setUploading(true);
    setError(null);

    try {
      const uploadPromises = Array.from(files)
        .filter((file) => file.type.startsWith('image/'))
        .map((file) => api.uploadPhoto(file, memoryBookId));

      const uploadResults = await Promise.all(uploadPromises);

      // Convert upload results to Photo objects
      const newPhotos: Photo[] = uploadResults.map((result) => {
        const photoUrl = api.getImageUrl(result.filename);
        return {
          id: result.id,
          url: photoUrl,
          preview: photoUrl,
          note: '',
          prompt: getRandomPrompt(),
        };
      });

      const updatedPhotos = [...allPhotos, ...newPhotos];
      setAllPhotos(updatedPhotos);

      // Auto-add photos to the page that uploaded them
      if (pageId && newPhotos.length > 0) {
        setPages((currentPages) => {
          const page = currentPages.find((p) => p.id === pageId);
          if (page && page.photos.length < 4) {
            const photosToAdd = newPhotos.slice(0, 4 - page.photos.length);
            const updatedPage = {
              ...page,
              photos: [...page.photos, ...photosToAdd],
            };
            const newPages = currentPages.map((p) =>
              p.id === updatedPage.id ? updatedPage : p
            );
            // Save after a short delay to debounce
            setTimeout(() => savePages(newPages), 500);
            return newPages;
          }
          return currentPages;
        });
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error?.message || 'Không thể upload ảnh');
      console.error('Error uploading photos:', err);
    } finally {
      setUploading(false);
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
      // Debounce save
      setTimeout(() => savePages(newPages), 500);
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

  if (!memoryBook) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
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

  const currentPage = pages.find((p) => p.id === currentPageId) || pages[0];
  const currentPageIndex = pages.findIndex((p) => p.id === currentPageId);

  return (
    <>
      <div className="bg-gray-100 h-screen overflow-hidden flex flex-col">
        {/* Header - Fixed */}
        <div className="bg-white shadow-sm border-b border-gray-200 z-30 flex-shrink-0" style={{ height: '72px' }}>
          <div className="w-full h-full px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/my-books')}
                className="px-4 py-2 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
              >
                ← Quay lại
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{memoryBook.name}</h1>
                {saving && (
                  <p className="text-xs text-gray-500">Đang lưu...</p>
                )}
                {uploading && (
                  <p className="text-xs text-blue-500">Đang upload ảnh...</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {error && (
                <div className="px-3 py-1 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
              <button
                onClick={() => navigate('/gallery')}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Xem Gallery
              </button>
            </div>
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
    </>
  );
}
