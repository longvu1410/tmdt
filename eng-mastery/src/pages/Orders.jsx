import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../services/apiService';

const statusMap = {
  PENDING:   { label: 'Chờ thanh toán', color: '#F59E0B', bg: '#FFFBEB' },
  PAID:      { label: 'Đã thanh toán', color: '#10B981', bg: '#ECFDF5' },
  COMPLETED: { label: 'Hoàn thành',    color: '#0056D2', bg: '#EFF6FF' },
  CANCELLED: { label: 'Đã hủy',       color: '#EF4444', bg: '#FEF2F2' },
  REFUNDED:  { label: 'Hoàn tiền',     color: '#8B5CF6', bg: '#F5F3FF' },
};

const getStatus = (s) => statusMap[s?.toUpperCase()] || { label: s || 'Không rõ', color: '#6B7280', bg: '#F9FAFB' };

const formatPrice = (v) => {
  if (v === 0 || v == null) return '0đ';
  return new Intl.NumberFormat('vi-VN').format(v) + 'đ';
};

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

// ── Skeleton row ──
const SkeletonRow = () => (
  <tr>
    {[120, 200, 100, 100, 90, 120].map((w, i) => (
      <td key={i} style={{ padding: '16px 12px' }}>
        <div style={{
          height: '14px', width: `${w}px`, maxWidth: '100%',
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
          borderRadius: '4px',
        }} />
      </td>
    ))}
  </tr>
);

const FILTERS = [
  { key: 'ALL',       label: 'Tất cả' },
  { key: 'PENDING',   label: 'Chờ thanh toán' },
  { key: 'PAID',      label: 'Đã thanh toán' },
  { key: 'COMPLETED', label: 'Hoàn thành' },
  { key: 'CANCELLED', label: 'Đã hủy' },
];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [payingId, setPayingId] = useState(null);   // order.id đang xử lý pay
  const [payMsg, setPayMsg] = useState(null);        // { id, type, text }

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiFetch('/api/orders/my');
        if (!res.ok) throw new Error(`Lỗi ${res.status}: Không thể tải đơn hàng`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.content ?? data.data ?? [];
        setOrders(list);
      } catch (err) {
        console.error('Fetch orders error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // ── Thanh toán đơn hàng PENDING ──
  const handlePay = async (orderId) => {
    setPayingId(orderId);
    setPayMsg(null);
    try {
      const safeJson = async (res) => {
        const text = await res.text();
        if (!text || !text.trim()) return {};
        try { return JSON.parse(text); } catch { return {}; }
      };
      const res = await apiFetch(`/api/orders/${orderId}/pay`, { method: 'POST' });
      const body = await safeJson(res);
      if (res.ok) {
        // Cập nhật order trong state ngay, không cần refetch
        setOrders(prev => prev.map(o =>
          o.id === orderId
            ? { ...o, status: 'PAID', paidAt: body.paidAt || new Date().toISOString() }
            : o
        ));
        setPayMsg({ id: orderId, type: 'success', text: 'Thanh toán thành công!' });
        setTimeout(() => setPayMsg(null), 3000);
      } else {
        const statusMsg = {
          400: 'Dữ liệu không hợp lệ.',
          403: 'Không có quyền thanh toán đơn hàng này.',
          404: 'Không tìm thấy đơn hàng.',
          409: 'Đơn hàng đã được thanh toán rồi.',
        }[res.status];
        setPayMsg({ id: orderId, type: 'error', text: body.message || statusMsg || `Lỗi ${res.status}` });
        setTimeout(() => setPayMsg(null), 5000);
      }
    } catch {
      setPayMsg({ id: orderId, type: 'error', text: 'Lỗi kết nối. Vui lòng thử lại.' });
      setTimeout(() => setPayMsg(null), 4000);
    } finally {
      setPayingId(null);
    }
  };

  const filtered = filter === 'ALL'
    ? orders
    : orders.filter(o => o.status?.toUpperCase() === filter);

  const totalSpent = orders
    .filter(o => ['PAID', 'COMPLETED'].includes(o.status?.toUpperCase()))
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '4px' }}>Quản lý đơn hàng</p>
          <h1 style={{ fontSize: '28px', fontWeight: 700 }}>Lịch sử đơn hàng</h1>
        </div>
        <Link to="/dashboard" style={{
          color: '#0056D2', fontWeight: 600, fontSize: '14px',
          padding: '8px 16px', border: '1px solid #0056D2', borderRadius: '6px',
        }}>← Về Dashboard</Link>
      </div>

      {/* Stats row */}
      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
          {[
            { label: 'Tổng đơn hàng', value: orders.length, icon: '📦' },
            { label: 'Đã thanh toán', value: orders.filter(o => ['PAID', 'COMPLETED'].includes(o.status?.toUpperCase())).length, icon: '✅' },
            { label: 'Tổng chi tiêu', value: formatPrice(totalSpent), icon: '💰' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px',
              padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px',
            }}>
              <div style={{ fontSize: '28px' }}>{stat.icon}</div>
              <div>
                <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '2px' }}>{stat.label}</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: '#111827' }}>{stat.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
            border: filter === f.key ? '2px solid #0056D2' : '1px solid #E5E7EB',
            background: filter === f.key ? '#EFF6FF' : '#fff',
            color: filter === f.key ? '#0056D2' : '#6B7280',
            cursor: 'pointer', transition: 'all 0.2s',
          }}>{f.label}</button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px',
          padding: '16px 20px', color: '#DC2626', fontSize: '14px', marginBottom: '16px',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>⚠️ {error}</div>
      )}

      {/* Orders table */}
      <div style={{
        border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden',
        background: '#fff',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              {['Mã đơn', 'Khóa học', 'Số tiền', 'Giảm giá', 'Trạng thái', 'Ngày đặt', 'Hành động'].map(h => (
                <th key={h} style={{
                  padding: '12px 12px', textAlign: 'left', fontWeight: 600,
                  color: '#6B7280', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Loading */}
            {loading && [1, 2, 3, 4].map(i => <SkeletonRow key={i} />)}

            {/* Data */}
            {!loading && filtered.map(order => {
              const st = getStatus(order.status);
              return (
                <tr key={order.id} style={{
                  borderBottom: '1px solid #F3F4F6',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                >
                  <td style={{ padding: '16px 12px' }}>
                    <span style={{ fontWeight: 600, color: '#111827' }}>#{order.id}</span>
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <Link to={`/course/${order.courseId}`} style={{
                      color: '#0056D2', fontWeight: 600, fontSize: '14px',
                    }}>{order.courseTitle || `Khóa học #${order.courseId}`}</Link>
                    {order.voucherCode && (
                      <div style={{ fontSize: '11px', color: '#8B5CF6', marginTop: '2px' }}>
                        🎟️ {order.voucherCode}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <div style={{ fontWeight: 700, color: '#111827' }}>{formatPrice(order.totalAmount)}</div>
                    {order.originalAmount !== order.totalAmount && order.originalAmount > 0 && (
                      <div style={{ fontSize: '12px', color: '#9CA3AF', textDecoration: 'line-through' }}>
                        {formatPrice(order.originalAmount)}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '16px 12px', color: order.discountAmount > 0 ? '#10B981' : '#9CA3AF' }}>
                    {order.discountAmount > 0 ? `-${formatPrice(order.discountAmount)}` : '—'}
                  </td>
                  <td style={{ padding: '16px 12px' }}>
                    <span style={{
                      display: 'inline-block', padding: '4px 10px', borderRadius: '12px',
                      fontSize: '12px', fontWeight: 600,
                      color: st.color, background: st.bg,
                    }}>{st.label}</span>
                  </td>
                  <td style={{ padding: '16px 12px', color: '#6B7280', fontSize: '13px' }}>
                    {formatDate(order.createdAt)}
                    {order.paidAt && (
                      <div style={{ fontSize: '11px', color: '#10B981', marginTop: '2px' }}>
                        ✓ Thanh toán: {formatDate(order.paidAt)}
                      </div>
                    )}
                  </td>

                  {/* Cột hành động */}
                  <td style={{ padding: '16px 12px' }}>
                    {order.status?.toUpperCase() === 'PENDING' && (
                      <div>
                        <button
                          onClick={() => handlePay(order.id)}
                          disabled={payingId === order.id}
                          style={{
                            padding: '7px 16px', borderRadius: '6px', fontSize: '13px',
                            fontWeight: 700, border: 'none', cursor: payingId === order.id ? 'not-allowed' : 'pointer',
                            background: payingId === order.id ? '#6B9FE8' : '#0056D2',
                            color: '#fff', transition: 'background 0.2s', whiteSpace: 'nowrap',
                          }}
                        >
                          {payingId === order.id ? 'Đang xử lý...' : '💳 Thanh toán ngay'}
                        </button>
                        {/* Thông báo kết quả pay */}
                        {payMsg?.id === order.id && (
                          <div style={{
                            marginTop: '6px', fontSize: '12px', fontWeight: 600,
                            color: payMsg.type === 'success' ? '#065F46' : '#DC2626',
                          }}>
                            {payMsg.type === 'success' ? '✓ ' : '⚠️ '}{payMsg.text}
                          </div>
                        )}
                      </div>
                    )}
                    {order.status?.toUpperCase() === 'PAID' && (
                      <span style={{ fontSize: '13px', color: '#10B981', fontWeight: 600 }}>✓ Đã thanh toán</span>
                    )}
                    {order.status?.toUpperCase() === 'COMPLETED' && (
                      <span style={{ fontSize: '13px', color: '#0056D2', fontWeight: 600 }}>✓ Hoàn thành</span>
                    )}
                  </td>
                </tr>
              );
            })}

            {/* Empty */}
            {!loading && !error && filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '48px', color: '#6B7280', fontSize: '15px' }}>
                  {filter === 'ALL' ? 'Bạn chưa có đơn hàng nào.' : 'Không có đơn hàng nào với trạng thái này.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
