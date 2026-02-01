import { getToken, removeToken } from '../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Types
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface MemoryBookResponse {
  id: string;
  name: string;
  type: string;
  pages: PhotoPageResponse[];
  createdAt: string;
  shareId: string;
  contributeId: string;
  updatedAt?: string;
  isLeader?: boolean; // Field mới từ backend
}

export interface PhotoPageResponse {
  id: string;
  photos: PhotoResponse[];
  layout: string;
  note: string;
}

export interface PhotoResponse {
  id: string;
  url: string;
  note: string;
  prompt: string;
}

export interface PhotoUploadResponse {
  id: string;
  filename: string;
  url: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

export interface ContributionResponse {
  id: string;
  photoId: string;
  url: string;
  note: string;
  prompt: string;
  contributedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// Helper function to get headers with authentication token
function getAuthHeaders(includeContentType = true): HeadersInit {
  const headers: HeadersInit = {};
  
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

// Helper function to handle API errors
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      removeToken();
      // Dispatch custom event for auth context to handle
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    
    let error: ApiError;
    try {
      error = await response.json();
    } catch {
      // If response is not JSON, create a generic error
      error = {
        error: {
          code: 'HTTP_ERROR',
          message: `HTTP ${response.status}: ${response.statusText}`,
        },
      };
    }
    throw error;
  }
  return response.json();
}

// Helper function to handle network errors
function handleNetworkError(err: unknown): ApiError {
  if (err instanceof TypeError && err.message.includes('fetch')) {
    return {
      error: {
        code: 'NETWORK_ERROR',
        message: 'Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy không.',
      },
    };
  }
  if (err && typeof err === 'object' && 'error' in err) {
    return err as ApiError;
  }
  return {
    error: {
      code: 'UNKNOWN_ERROR',
      message: 'Có lỗi không xác định xảy ra',
    },
  };
}

// API Client
export const api = {
  // Memory Book Management
  async createMemoryBook(name: string, type: string): Promise<MemoryBookResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/memory-books`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, type }),
      });
      return handleResponse<MemoryBookResponse>(response);
    } catch (err) {
      const apiError = handleNetworkError(err);
      throw apiError;
    }
  },

  async getMemoryBooks(limit = 20, offset = 0): Promise<PaginatedResponse<MemoryBookResponse>> {
    const response = await fetch(
      `${API_BASE_URL}/memory-books?limit=${limit}&offset=${offset}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse<PaginatedResponse<MemoryBookResponse>>(response);
  },

  async getMemoryBook(id: string): Promise<MemoryBookResponse> {
    const response = await fetch(`${API_BASE_URL}/memory-books/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<MemoryBookResponse>(response);
  },

  async updateMemoryBook(
    id: string,
    data: {
      name?: string;
      type?: string;
      pages?: PhotoPageResponse[];
    }
  ): Promise<MemoryBookResponse> {
    const response = await fetch(`${API_BASE_URL}/memory-books/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<MemoryBookResponse>(response);
  },

  async deleteMemoryBook(id: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/memory-books/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ message: string }>(response);
  },

  // Public View & Share
  async getMemoryBookByShareId(shareId: string): Promise<MemoryBookResponse> {
    const response = await fetch(`${API_BASE_URL}/memory-books/share/${shareId}`);
    return handleResponse<MemoryBookResponse>(response);
  },

  async getMemoryBookByContributeId(contributeId: string): Promise<{
    id: string;
    name: string;
    type: string;
    contributeId: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/memory-books/contribute/${contributeId}`);
    return handleResponse<{
      id: string;
      name: string;
      type: string;
      contributeId: string;
    }>(response);
  },

  // Photo Upload
  async uploadPhoto(
    file: File,
    memoryBookId?: string
  ): Promise<PhotoUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (memoryBookId) {
      formData.append('memoryBookId', memoryBookId);
    }

    const token = getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return handleResponse<PhotoUploadResponse>(response);
  },

  getImageUrl(filename: string): string {
    return `${API_BASE_URL}/images/${filename}`;
  },

  async deleteImage(filename: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/images/${filename}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ message: string }>(response);
  },

  // Contributions
  async submitContributions(
    memoryBookId: string,
    files: File[],
    notes?: string[],
    prompts?: string[]
  ): Promise<{
    message: string;
    contributions: ContributionResponse[];
  }> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    if (notes) {
      notes.forEach((note) => {
        formData.append('notes', note);
      });
    }
    if (prompts) {
      prompts.forEach((prompt) => {
        formData.append('prompts', prompt);
      });
    }

    const token = getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_BASE_URL}/memory-books/${memoryBookId}/contributions`,
      {
        method: 'POST',
        headers,
        body: formData,
      }
    );
    return handleResponse<{
      message: string;
      contributions: ContributionResponse[];
    }>(response);
  },

  async getContributions(
    memoryBookId: string,
    limit = 50,
    offset = 0
  ): Promise<PaginatedResponse<ContributionResponse>> {
    const response = await fetch(
      `${API_BASE_URL}/memory-books/${memoryBookId}/contributions?limit=${limit}&offset=${offset}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse<PaginatedResponse<ContributionResponse>>(response);
  },

  // My Memory Books
  async getMyMemoryBooks(
    limit = 20,
    offset = 0
  ): Promise<{
    data: {
      myBooks: MemoryBookResponse[];
      contributedBooks: MemoryBookResponse[];
    };
    total: {
      myBooks: number;
      contributedBooks: number;
    };
    limit: number;
    offset: number;
  }> {
    const response = await fetch(
      `${API_BASE_URL}/memory-books/my?limit=${limit}&offset=${offset}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse<{
      data: {
        myBooks: MemoryBookResponse[];
        contributedBooks: MemoryBookResponse[];
      };
      total: {
        myBooks: number;
        contributedBooks: number;
      };
      limit: number;
      offset: number;
    }>(response);
  },
};
