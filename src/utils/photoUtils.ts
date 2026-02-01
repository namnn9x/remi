import type { Photo, PhotoPage } from '../types';
import type { PhotoResponse, PhotoPageResponse } from '../api/client';
import { api } from '../api/client';

/**
 * Convert PhotoResponse from API to Photo for UI
 */
export function photoResponseToPhoto(photoResponse: PhotoResponse): Photo {
  // If URL is already a full URL, use it directly
  // Otherwise, construct full URL from API base
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  const preview = photoResponse.url.startsWith('http')
    ? photoResponse.url
    : photoResponse.url.startsWith('/')
    ? `${apiBase}${photoResponse.url}`
    : `${apiBase}/images/${photoResponse.url}`;
  
  return {
    id: photoResponse.id,
    url: photoResponse.url,
    note: photoResponse.note,
    prompt: photoResponse.prompt,
    preview,
  };
}

/**
 * Convert PhotoPageResponse from API to PhotoPage for UI
 */
export function photoPageResponseToPhotoPage(
  pageResponse: PhotoPageResponse
): PhotoPage {
  return {
    id: pageResponse.id,
    photos: pageResponse.photos.map(photoResponseToPhoto),
    layout: pageResponse.layout as PhotoPage['layout'],
    note: pageResponse.note,
  };
}

/**
 * Convert Photo for UI to PhotoResponse for API
 * Note: This assumes the photo has been uploaded and has a URL
 */
export function photoToPhotoResponse(photo: Photo): PhotoResponse {
  // Extract filename from URL if it's a full URL
  let url = photo.url || photo.preview;
  
  // If it's a blob URL (local preview), we need to handle it differently
  // For now, we'll assume photos with file property need to be uploaded first
  if (photo.file) {
    throw new Error('Photo must be uploaded before converting to PhotoResponse');
  }

  // If preview is a blob URL, try to extract from it
  if (photo.preview && photo.preview.startsWith('blob:')) {
    // This shouldn't happen if we've uploaded properly
    throw new Error('Photo with blob URL must be uploaded first');
  }

  // Extract relative path from full URL if needed
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  if (url.startsWith(apiBase)) {
    url = url.replace(apiBase, '');
  }

  return {
    id: photo.id,
    url: url,
    note: photo.note || '',
    prompt: photo.prompt || '',
  };
}

/**
 * Convert PhotoPage for UI to PhotoPageResponse for API
 */
export function photoPageToPhotoPageResponse(
  page: PhotoPage
): PhotoPageResponse {
  return {
    id: page.id,
    photos: page.photos.map(photoToPhotoResponse),
    layout: page.layout,
    note: page.note,
  };
}
