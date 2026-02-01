import { ApiError } from './client';
import { getToken } from '../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Types
export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

interface AuthApiResponse {
  message?: string;
  data: {
    user: User;
    token?: string;
  };
}

interface UserApiResponse {
  data: User;
}

// Helper function to handle API errors
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let error: ApiError;
    try {
      error = await response.json();
    } catch {
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

/**
 * Đăng ký tài khoản mới
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await handleResponse<AuthApiResponse>(response);
    return {
      user: result.data.user,
      token: result.data.token!,
    };
  } catch (err) {
    const apiError = handleNetworkError(err);
    throw apiError;
  }
};

/**
 * Đăng nhập
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await handleResponse<AuthApiResponse>(response);
    return {
      user: result.data.user,
      token: result.data.token!,
    };
  } catch (err) {
    const apiError = handleNetworkError(err);
    throw apiError;
  }
};

/**
 * Lấy thông tin user hiện tại
 */
export const getCurrentUser = async (): Promise<User> => {
  try {
    const token = getToken();
    if (!token) {
      throw {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Không có token xác thực',
        },
      } as ApiError;
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const result = await handleResponse<UserApiResponse>(response);
    return result.data;
  } catch (err) {
    const apiError = handleNetworkError(err);
    throw apiError;
  }
};
