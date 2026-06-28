/**
 * apiService.js
 * Wrapper fetch tự động:
 *  - Đính kèm Authorization header
 *  - Khi nhận 401 → gọi refresh token → retry request gốc
 *  - Nếu refresh thất bại → logout (giữ giỏ hàng localStorage)
 */

//const API_BASE = 'https://api.hatruong.id.vn';
const API_BASE = 'http://localhost:8080';

// ─── Token helpers ────────────────────────────────────────────────
export const getAccessToken = () => localStorage.getItem('accessToken');
export const getRefreshToken = () => localStorage.getItem('refreshToken');

export const saveTokens = (data) => {
  if (data.accessToken) localStorage.setItem('accessToken', data.accessToken);
  if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
  // Chỉ ghi user nếu response có chứa user data
  if (data.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
  }
};

export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  // Giỏ hàng (eng_mastery_cart) KHÔNG bị xóa — giữ lại cho lần login sau
};

// ─── Refresh token ────────────────────────────────────────────────
let isRefreshing = false;
let pendingQueue = []; // requests đang chờ token mới

const processQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token);
  });
  pendingQueue = [];
};

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token');

  const res = await fetch(`${API_BASE}/api/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    // Đọc body để log lỗi chi tiết
    const errText = await res.text().catch(() => '');
    console.error('[apiService] Refresh token failed:', res.status, errText);
    throw new Error(`Refresh failed: ${res.status}`);
  }

  // Parse response an toàn
  const text = await res.text();
  if (!text || !text.trim()) throw new Error('Refresh response empty');

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Refresh response invalid JSON');
  }

  if (!data.accessToken) throw new Error('Refresh response missing accessToken');

  // Lưu tokens — giữ nguyên user cũ nếu response không trả user mới
  saveTokens(data);
  return data.accessToken;
};

// ─── Main fetch wrapper ───────────────────────────────────────────
export const apiFetch = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  const makeRequest = async (token) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };
    return fetch(url, { ...options, headers });
  };

  // Lần 1: gửi request với access token hiện tại
  const token = getAccessToken();

  // Nếu không có token → gửi luôn không cần refresh
  if (!token) {
    return makeRequest(null);
  }

  let res = await makeRequest(token);

  // Nếu 401 → thử refresh
  if (res.status === 401) {
    if (isRefreshing) {
      // Đang refresh rồi → queue request này lại, chờ token mới
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: async (newToken) => {
            try {
              resolve(await makeRequest(newToken));
            } catch (e) {
              reject(e);
            }
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      const newToken = await refreshAccessToken();
      processQueue(null, newToken);
      res = await makeRequest(newToken); // Retry với token mới
    } catch (err) {
      processQueue(err, null);
      console.warn('[apiService] Token refresh failed, logging out:', err.message);
      clearTokens();
      // Dispatch event để Navbar biết user đã logout
      window.dispatchEvent(new Event('auth-logout'));
      // Trả về response 401 gốc thay vì throw → không crash ứng dụng
      return res;
    } finally {
      isRefreshing = false;
    }
  }

  return res;
};

export default API_BASE;
