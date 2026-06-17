/**
 * cartUtils.js
 * Quản lý giỏ hàng trên localStorage (backend không có /api/cart)
 * Mỗi item: { courseId, courseTitle, courseSlug, price, thumbnailUrl, instructorName, level }
 */

const CART_KEY = 'eng_mastery_cart';

/** Lấy toàn bộ giỏ hàng */
export const getCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
};

/** Thêm khóa học vào giỏ (bỏ qua nếu đã có) */
export const addToCart = (course) => {
  const cart = getCart();
  const exists = cart.some(i => i.courseId === course.courseId);
  if (exists) return { added: false, reason: 'already_in_cart' };
  cart.push(course);
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event('cart-updated'));
  return { added: true };
};

/** Xóa một khóa học khỏi giỏ */
export const removeFromCart = (courseId) => {
  const cart = getCart().filter(i => i.courseId !== courseId);
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event('cart-updated'));
};

/** Xóa toàn bộ giỏ hàng */
export const clearCart = () => {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event('cart-updated'));
};

/** Kiểm tra khóa học đã trong giỏ chưa */
export const isInCart = (courseId) => getCart().some(i => i.courseId === courseId);

/** Số lượng item trong giỏ */
export const getCartCount = () => getCart().length;
