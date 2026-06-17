import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch, getAccessToken } from '../services/apiService';
import { getCart, removeFromCart, clearCart } from '../services/cartUtils';

const formatPrice = (v) => {
  if (v === 0 || v == null) return '0đ';
  return new Intl.NumberFormat('vi-VN').format(v) + 'đ';
};

// Skeleton item
const SkeletonItem = () => (
  <div style={{ display: 'flex', gap: '16px', padding: '20px 0', borderTop: '1px solid #E5E7EB' }}>
    <div style={{
      width: '120px', height: '80px', borderRadius: '4px', flexShrink: 0,
      background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
      backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
    }} />
    <div style={{ flex: 1 }}>
      <div style={{ height: '16px', width: '60%', background: '#E5E7EB', borderRadius: '4px', marginBottom: '8px' }} />
      <div style={{ height: '13px', width: '30%', background: '#E5E7EB', borderRadius: '4px' }} />
    </div>
    <div style={{ width: '80px' }}>
      <div style={{ height: '16px', background: '#E5E7EB', borderRadius: '4px' }} />
    </div>
  </div>
);

const Cart = () => {
  const navigate = useNavigate();

  // ── State ──
  const [cartItems, setCartItems] = useState([]);        // items từ localStorage
  const [previews, setPreviews] = useState({});        // { courseId: previewData }
  const [previewLoading, setPreviewLoading] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [removingId, setRemovingId] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutMsg, setCheckoutMsg] = useState(null);      // { type, text }

  // ── Load giỏ hàng từ localStorage ──
  const loadCart = useCallback(() => {
    setCartItems(getCart());
  }, []);

  useEffect(() => {
    loadCart();
    // Lắng nghe sự kiện cart-updated (từ cartUtils)
    window.addEventListener('cart-updated', loadCart);
    return () => window.removeEventListener('cart-updated', loadCart);
  }, [loadCart]);

  // ── Gọi POST /api/orders/preview để lấy giá chính xác ──
  useEffect(() => {
    if (cartItems.length === 0) return;
    const fetchPreviews = async () => {
      setPreviewLoading(true);
      const results = await Promise.allSettled(
        cartItems.map(item =>
          apiFetch('/api/orders/preview', {
            method: 'POST',
            body: JSON.stringify({
              courseId: item.courseId,
              voucherCode: voucherCode || undefined,
            }),
          }).then(async res => {
            if (!res.ok) return null;
            const text = await res.text();
            if (!text || text.trim() === '') return null;
            try { return JSON.parse(text); } catch { return null; }
          })
        )
      );
      const previewMap = {};
      results.forEach((r, i) => {
        if (r.status === 'fulfilled' && r.value) {
          previewMap[cartItems[i].courseId] = r.value;
        }
      });
      setPreviews(previewMap);
      setPreviewLoading(false);
    };
    fetchPreviews();
  }, [cartItems, voucherCode]);

  // ── Xóa item khỏi giỏ (localStorage) ──
  const handleRemove = (courseId) => {
    setRemovingId(courseId);
    removeFromCart(courseId);
    // loadCart sẽ được gọi tự động qua event 'cart-updated'
    setTimeout(() => setRemovingId(null), 300);
  };

  // ── Checkout: POST /api/orders/checkout cho từng khóa học ──
  const handleCheckout = async () => {
    // Kiểm tra đăng nhập — token sẽ được apiFetch tự gắn vào Authorization header
    const token = getAccessToken();
    if (!token) {
      setCheckoutMsg({ type: 'error', text: 'Vui lòng đăng nhập để tiến hành thanh toán.' });
      setTimeout(() => setCheckoutMsg(null), 4000);
      return;
    }
    setCheckingOut(true);
    setCheckoutMsg(null);

    // Helper: parse JSON an toàn — không crash khi body rỗng (204/201)
    const safeJson = async (res) => {
      const text = await res.text();
      if (!text || text.trim() === '') return {};
      try { return JSON.parse(text); } catch { return {}; }
    };

    try {
      const results = await Promise.allSettled(
        cartItems.map(item =>
          apiFetch('/api/orders/checkout', {
            method: 'POST',
            body: JSON.stringify({
              courseId: item.courseId,
              voucherCode: voucherCode || undefined,
              paymentMethod: 'MOCK',
            }),
          }).then(async res => {
            const body = await safeJson(res);
            if (!res.ok) {
              // Gắn status vào error để hiển thị thông báo rõ ràng hơn
              const statusMsg = {
                400: 'Dữ liệu không hợp lệ.',
                401: 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.',
                403: 'Bạn không có quyền thực hiện thao tác này hoặc đã mua khóa học này rồi.',
                404: 'Không tìm thấy khóa học.',
                409: 'Bạn đã mua khóa học này rồi.',
              }[res.status];
              return Promise.reject({
                message: body?.message || statusMsg || `Lỗi ${res.status}`,
                status: res.status,
              });
            }
            return body;
          })
        )
      );

      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected');

      if (succeeded === cartItems.length) {
        clearCart();
        setCheckoutMsg({ type: 'success', text: `Đặt hàng thành công ${succeeded} khóa học! Đang chuyển hướng...` });
        setTimeout(() => navigate('/orders'), 1200);
      } else if (succeeded > 0) {
        const errMsg = failed[0]?.reason?.message || '';
        setCheckoutMsg({ type: 'error', text: `${succeeded}/${cartItems.length} đơn thành công. ${errMsg}` });
        setTimeout(() => navigate('/orders'), 2000);
      } else {
        const errMsg = failed[0]?.reason?.message || 'Lỗi không xác định';
        setCheckoutMsg({ type: 'error', text: errMsg });
        setTimeout(() => setCheckoutMsg(null), 6000);
      }
    } catch {
      setCheckoutMsg({ type: 'error', text: 'Lỗi kết nối. Vui lòng thử lại.' });
      setTimeout(() => setCheckoutMsg(null), 4000);
    } finally {
      setCheckingOut(false);
    }
  };

  // Tính tổng: dùng preview nếu có, fallback sang giá localStorage
  const total = cartItems.reduce((sum, item) => {
    const p = previews[item.courseId];
    return sum + (p?.totalAmount ?? p?.originalAmount ?? item.price ?? 0);
  }, 0);

  const totalDiscount = cartItems.reduce((sum, item) => {
    const p = previews[item.courseId];
    return sum + (p?.discountAmount ?? 0);
  }, 0);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>Giỏ hàng</h1>
      <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '32px' }}>
        {cartItems.length} khóa học trong giỏ hàng
      </p>

      {cartItems.length === 0 ? (
        /* Empty state */
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#6B7280' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛒</div>
          <p style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#111827' }}>Giỏ hàng trống</p>
          <p style={{ fontSize: '15px', marginBottom: '24px' }}>Hãy thêm khóa học bạn muốn học nhé!</p>
          <Link to="/" style={{
            background: '#0056D2', color: '#fff', padding: '12px 32px',
            borderRadius: '6px', fontWeight: 700, fontSize: '15px',
            display: 'inline-block',
          }}>Khám phá khóa học →</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>

          {/* ─── Cart Items ─── */}
          <div style={{ flex: 1 }}>
            {cartItems.map(item => {
              const preview = previews[item.courseId];
              const finalPrice = preview?.totalAmount ?? preview?.originalAmount ?? item.price ?? 0;
              const origPrice = preview?.originalAmount ?? item.price ?? 0;
              const discount = preview?.discountAmount ?? 0;

              return (
                <div key={item.courseId} style={{
                  display: 'flex', gap: '16px', padding: '20px 0',
                  borderTop: '1px solid #E5E7EB',
                  opacity: removingId === item.courseId ? 0.4 : 1,
                  transition: 'opacity 0.3s',
                }}>
                  {/* Thumbnail */}
                  <Link to={`/course/${item.courseId}`} style={{ flexShrink: 0 }}>
                    {item.thumbnailUrl ? (
                      <img src={item.thumbnailUrl} alt={item.courseTitle}
                        style={{ width: '120px', height: '80px', borderRadius: '4px', objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div style={{
                        width: '120px', height: '80px', borderRadius: '4px',
                        background: 'linear-gradient(135deg, #E8F1FF, #D1E3FF)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px',
                      }}>📚</div>
                    )}
                  </Link>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <Link to={`/course/${item.courseId}`}>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px', color: '#111827' }}>
                        {item.courseTitle}
                      </h3>
                    </Link>
                    {item.instructorName && (
                      <p style={{ color: '#6B7280', fontSize: '13px', marginBottom: '6px' }}>{item.instructorName}</p>
                    )}
                    {item.level && (
                      <span style={{
                        fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
                        color: '#0056D2', letterSpacing: '0.5px',
                      }}>{item.level}</span>
                    )}
                  </div>

                  {/* Price + Remove */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    {previewLoading ? (
                      <div style={{ height: '20px', width: '80px', background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite', borderRadius: '4px', marginBottom: '8px' }} />
                    ) : (
                      <>
                        <p style={{ fontWeight: 700, fontSize: '16px', color: '#111827', marginBottom: '2px' }}>
                          {formatPrice(finalPrice)}
                        </p>
                        {discount > 0 && (
                          <p style={{ fontSize: '12px', color: '#9CA3AF', textDecoration: 'line-through', marginBottom: '2px' }}>
                            {formatPrice(origPrice)}
                          </p>
                        )}
                        {discount > 0 && (
                          <p style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>
                            -{formatPrice(discount)}
                          </p>
                        )}
                      </>
                    )}
                    <button
                      onClick={() => handleRemove(item.courseId)}
                      disabled={removingId === item.courseId}
                      style={{
                        color: '#EF4444', fontSize: '13px', fontWeight: 500,
                        background: 'none', border: 'none', cursor: 'pointer',
                        textDecoration: 'underline', marginTop: '6px',
                      }}
                    >{removingId === item.courseId ? 'Đang xóa...' : 'Xóa'}</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ─── Summary Sidebar ─── */}
          <div style={{ width: '300px', flexShrink: 0 }}>
            <div style={{
              background: '#F9FAFB', borderRadius: '8px', padding: '24px',
              border: '1px solid #E5E7EB', position: 'sticky', top: '80px',
            }}>
              {/* Voucher input */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>
                  Mã voucher
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Nhập mã..."
                    value={voucherCode}
                    onChange={e => setVoucherCode(e.target.value.toUpperCase())}
                    style={{
                      flex: 1, height: '38px', border: '1px solid #D1D5DB', borderRadius: '6px',
                      padding: '0 10px', fontSize: '13px', outline: 'none',
                    }}
                    onFocus={e => e.target.style.borderColor = '#0056D2'}
                    onBlur={e => e.target.style.borderColor = '#D1D5DB'}
                  />
                  <button
                    onClick={() => setPreviews({})} // trigger re-fetch preview
                    style={{
                      padding: '0 12px', background: '#0056D2', color: '#fff',
                      border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                    }}
                  >Áp dụng</button>
                </div>
              </div>

              {/* Price summary */}
              <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px', marginBottom: '16px' }}>
                {totalDiscount > 0 && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
                      <span>Tạm tính</span>
                      <span>{formatPrice(total + totalDiscount)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#10B981', fontWeight: 600, marginBottom: '6px' }}>
                      <span>Giảm giá</span>
                      <span>-{formatPrice(totalDiscount)}</span>
                    </div>
                  </>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 700, color: '#111827' }}>
                  <span>Tổng cộng</span>
                  <span>{previewLoading ? '...' : formatPrice(total)}</span>
                </div>
              </div>

              {/* Checkout message */}
              {checkoutMsg && (
                <div style={{
                  padding: '10px 14px', borderRadius: '6px', fontSize: '13px',
                  fontWeight: 600, marginBottom: '12px', textAlign: 'center',
                  background: checkoutMsg.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                  color: checkoutMsg.type === 'success' ? '#065F46' : '#DC2626',
                  border: `1px solid ${checkoutMsg.type === 'success' ? '#6EE7B7' : '#FECACA'}`,
                }}>
                  {checkoutMsg.type === 'success' ? '✓ ' : '⚠️ '}{checkoutMsg.text}
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={checkingOut || previewLoading}
                style={{
                  width: '100%', padding: '14px',
                  background: (checkingOut || previewLoading) ? '#6B9FE8' : '#0056D2',
                  color: '#fff', border: 'none', borderRadius: '4px',
                  fontWeight: 700, fontSize: '16px', marginBottom: '12px',
                  cursor: (checkingOut || previewLoading) ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                }}
              >{checkingOut ? 'Đang xử lý...' : 'Đặt hàng'}</button>

              <Link to="/" style={{ display: 'block', textAlign: 'center', color: '#0056D2', fontSize: '14px', fontWeight: 500 }}>
                Tiếp tục tìm khóa học
              </Link>

              {/* Link xem đơn hàng */}
              <Link to="/orders" style={{ display: 'block', textAlign: 'center', color: '#6B7280', fontSize: '13px', marginTop: '8px' }}>
                Xem lịch sử đơn hàng →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;