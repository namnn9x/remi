// Token management utilities

const TOKEN_KEY = 'auth_token';

/**
 * Lưu token vào localStorage
 */
export const saveToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Lấy token từ localStorage
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Xóa token khỏi localStorage
 */
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Kiểm tra có token không
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};
