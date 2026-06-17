import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/apiService';

const TeacherRevenue = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [quarter, setQuarter] = useState(Math.floor((new Date().getMonth() + 3) / 3));
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [withdrawals, setWithdrawals] = useState([]);
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(false);
  const [withdrawalError, setWithdrawalError] = useState('');

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [bankNameSelect, setBankNameSelect] = useState('Vietcombank');
  const [bankName, setBankName] = useState('Vietcombank');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const popularBanks = [
    'Vietcombank',
    'Techcombank',
    'BIDV',
    'VietinBank',
    'MBBank',
    'Agribank',
    'ACB',
    'Sacombank',
    'Khác'
  ];

  const getStatusBadgeStyle = (status) => {
    const map = {
      PENDING: { bg: '#FEF3C7', color: '#92400E' },
      APPROVED: { bg: '#D1FAE5', color: '#065F46' },
      REJECTED: { bg: '#FEE2E2', color: '#991B1B' },
    };
    const style = map[status] || { bg: '#F3F4F6', color: '#374151' };
    return {
      background: style.bg,
      color: style.color,
      padding: '4px 10px',
      borderRadius: '99px',
      fontSize: '12px',
      fontWeight: 600,
      display: 'inline-block',
    };
  };

  const fetchRevenue = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch(`/api/teacher/payouts/quarter-revenue?year=${year}&quarter=${quarter}`, {
        method: 'GET',
      });
      if (!res.ok) {
        throw new Error('Không thể lấy dữ liệu doanh thu');
      }
      const data = await res.json();
      setRevenueData(data);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawals = async () => {
    setLoadingWithdrawals(true);
    setWithdrawalError('');
    try {
      const res = await apiFetch('/api/teacher/payouts/withdrawals', {
        method: 'GET',
      });
      if (!res.ok) {
        throw new Error('Không thể tải lịch sử rút tiền');
      }
      const data = await res.json();
      setWithdrawals(Array.isArray(data) ? data : []);
    } catch (err) {
      setWithdrawalError(err.message || 'Có lỗi xảy ra khi tải lịch sử rút tiền');
    } finally {
      setLoadingWithdrawals(false);
    }
  };

  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setSubmitError('Số tiền rút phải lớn hơn 0');
      return;
    }

    if (numAmount > (revenueData?.availableAmount || 0)) {
      setSubmitError('Số tiền rút không được vượt quá số dư khả dụng');
      return;
    }

    if (!bankName.trim()) {
      setSubmitError('Vui lòng chọn hoặc nhập tên ngân hàng');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch('/api/teacher/payouts/withdrawals', {
        method: 'POST',
        body: JSON.stringify({
          amount: numAmount,
          bankName: bankName.trim(),
          bankAccountNumber: bankAccountNumber.trim(),
          bankAccountName: bankAccountName.trim(),
          note: note.trim(),
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Có lỗi xảy ra khi tạo yêu cầu rút tiền');
      }

      setSubmitSuccess('Đã gửi yêu cầu rút tiền thành công!');
      setAmount('');
      setNote('');
      fetchRevenue();
      fetchWithdrawals();
      
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess('');
      }, 1500);
    } catch (err) {
      setSubmitError(err.message || 'Có lỗi xảy ra khi gửi yêu cầu');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchRevenue();
    fetchWithdrawals();
  }, [year, quarter]);

  const formatCurrency = (amount) => {
    return (amount || 0).toLocaleString('vi-VN') + ' ₫';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '24px', color: '#111827' }}>
        📊 Báo cáo doanh thu
      </h1>

      {/* Filter Section */}
      <div style={{
        background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px',
        padding: '20px', marginBottom: '24px', display: 'flex', gap: '20px', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontWeight: 600, color: '#374151', fontSize: '14px' }}>Năm:</label>
          <select 
            value={year} 
            onChange={(e) => setYear(Number(e.target.value))}
            style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none' }}
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontWeight: 600, color: '#374151', fontSize: '14px' }}>Quý:</label>
          <select 
            value={quarter} 
            onChange={(e) => setQuarter(Number(e.target.value))}
            style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none' }}
          >
            {[1, 2, 3, 4].map(q => (
              <option key={q} value={q}>Quý {q}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={fetchRevenue}
          disabled={loading}
          style={{
            padding: '8px 20px', background: '#0056D2', color: '#fff', border: 'none', 
            borderRadius: '4px', fontWeight: 600, cursor: loading ? 'wait' : 'pointer'
          }}
        >
          {loading ? 'Đang tải...' : 'Lọc dữ liệu'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '16px', borderRadius: '8px', color: '#DC2626', marginBottom: '24px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Loading State */}
      {loading && !revenueData && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
          Đang tải dữ liệu doanh thu...
        </div>
      )}

      {/* Revenue Data Cards */}
      {revenueData && !loading && (
        <div>
          <div style={{ marginBottom: '20px', color: '#4B5563', fontSize: '15px' }}>
            Báo cáo từ <span style={{ fontWeight: 600 }}>{formatDate(revenueData.periodStart)}</span> đến <span style={{ fontWeight: 600 }}>{formatDate(revenueData.periodEnd)}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {/* Card 1 */}
            <div style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: '12px', padding: '24px' }}>
              <div style={{ color: '#4F46E5', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Tổng doanh thu
              </div>
              <div style={{ color: '#312E81', fontSize: '32px', fontWeight: 800 }}>
                {formatCurrency(revenueData.grossRevenue)}
              </div>
            </div>

            {/* Card 2 */}
            <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: '#059669', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Số dư khả dụng
                </div>
                <div style={{ color: '#064E3B', fontSize: '32px', fontWeight: 800, marginBottom: '12px' }}>
                  {formatCurrency(revenueData.availableAmount)}
                </div>
              </div>
              <button
                onClick={() => {
                  setSubmitError('');
                  setSubmitSuccess('');
                  setAmount('');
                  setNote('');
                  setIsModalOpen(true);
                }}
                disabled={!revenueData.availableAmount || revenueData.availableAmount <= 0}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: (revenueData.availableAmount && revenueData.availableAmount > 0) ? '#059669' : '#D1D5DB',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: (revenueData.availableAmount && revenueData.availableAmount > 0) ? 'pointer' : 'not-allowed',
                  transition: 'background 0.2s',
                  fontSize: '14px',
                }}
              >
                💸 Yêu cầu rút tiền
              </button>
            </div>

            {/* Card 3 */}
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '12px', padding: '24px' }}>
              <div style={{ color: '#D97706', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Đã yêu cầu / Đã thanh toán
              </div>
              <div style={{ color: '#78350F', fontSize: '32px', fontWeight: 800 }}>
                {formatCurrency(revenueData.requestedOrPaidAmount)}
              </div>
            </div>

            {/* Card 4 */}
            <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px' }}>
              <div style={{ color: '#4B5563', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Số đơn hàng đã bán
              </div>
              <div style={{ color: '#111827', fontSize: '32px', fontWeight: 800 }}>
                {revenueData.paidOrderCount}
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '32px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px' }}>
             <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Thông tin giảng viên</h2>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
               <div>
                 <p style={{ color: '#6B7280', fontSize: '13px', margin: '0 0 4px' }}>Tên giảng viên</p>
                 <p style={{ fontWeight: 600, margin: 0 }}>{revenueData.teacherName}</p>
               </div>
               <div>
                 <p style={{ color: '#6B7280', fontSize: '13px', margin: '0 0 4px' }}>Mã giảng viên</p>
                 <p style={{ fontWeight: 600, margin: 0 }}>{revenueData.teacherId}</p>
               </div>
             </div>
          </div>

          {/* Withdrawal History Section */}
          <div style={{ marginTop: '32px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📋 Lịch sử yêu cầu rút tiền</span>
              <button 
                onClick={fetchWithdrawals}
                disabled={loadingWithdrawals}
                style={{ background: 'none', border: 'none', color: '#0056D2', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
              >
                {loadingWithdrawals ? 'Đang tải...' : '🔄 Làm mới'}
              </button>
            </h2>

            {withdrawalError && (
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '12px', borderRadius: '8px', color: '#DC2626', fontSize: '13px', marginBottom: '16px' }}>
                ⚠️ {withdrawalError}
              </div>
            )}

            {loadingWithdrawals && withdrawals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#6B7280' }}>Đang tải lịch sử rút tiền...</div>
            ) : withdrawals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: '#9CA3AF', background: '#F9FAFB', borderRadius: '8px', border: '1px dashed #D1D5DB' }}>
                Chưa có yêu cầu rút tiền nào được tạo.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E5E7EB', background: '#F9FAFB', textAlign: 'left' }}>
                      <th style={{ padding: '12px 16px', color: '#4B5563', fontWeight: 600 }}>Mã số</th>
                      <th style={{ padding: '12px 16px', color: '#4B5563', fontWeight: 600 }}>Ngày tạo</th>
                      <th style={{ padding: '12px 16px', color: '#4B5563', fontWeight: 600 }}>Số tiền</th>
                      <th style={{ padding: '12px 16px', color: '#4B5563', fontWeight: 600 }}>Thông tin tài khoản</th>
                      <th style={{ padding: '12px 16px', color: '#4B5563', fontWeight: 600 }}>Trạng thái</th>
                      <th style={{ padding: '12px 16px', color: '#4B5563', fontWeight: 600 }}>Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map((w) => (
                      <tr key={w.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                        <td style={{ padding: '14px 16px', color: '#6B7280', fontWeight: 500 }}>#{w.id}</td>
                        <td style={{ padding: '14px 16px', color: '#4B5563' }}>{formatDate(w.createdAt)}</td>
                        <td style={{ padding: '14px 16px', color: '#111827', fontWeight: 700 }}>{formatCurrency(w.amount)}</td>
                        <td style={{ padding: '14px 16px', color: '#4B5563', lineHeight: 1.4 }}>
                          <div><strong>{w.bankName}</strong></div>
                          <div style={{ fontSize: '12px', color: '#6B7280' }}>STK: {w.bankAccountNumber}</div>
                          <div style={{ fontSize: '12px', color: '#6B7280' }}>Chủ TK: {w.bankAccountName}</div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={getStatusBadgeStyle(w.status)}>
                            {w.status === 'PENDING' ? 'Chờ duyệt' : w.status === 'APPROVED' ? 'Đã duyệt' : w.status === 'REJECTED' ? 'Từ chối' : w.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#4B5563', maxWidth: '240px', wordBreak: 'break-word', fontSize: '13px' }}>
                          {w.note && <div>📝 <em>Thầy cô:</em> {w.note}</div>}
                          {w.adminNote && <div style={{ marginTop: '4px', color: w.status === 'APPROVED' ? '#065F46' : '#991B1B' }}>
                            ⚙️ <em>Admin:</em> {w.adminNote}
                          </div>}
                          {!w.note && !w.adminNote && <span style={{ color: '#9CA3AF' }}>—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Withdrawal Request Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px', backdropFilter: 'blur(4px)',
        }}
          onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
        >
          <div style={{
            background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '500px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E5E7EB',
            overflow: 'hidden', animation: 'fadeIn 0.2s ease',
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F9FAFB' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>💸 Tạo yêu cầu rút tiền</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#9CA3AF', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleWithdrawalSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '12px 16px', borderRadius: '8px', color: '#065F46', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Số dư khả dụng hiện tại:</span>
                <strong style={{ fontSize: '15px' }}>{formatCurrency(revenueData?.availableAmount)}</strong>
              </div>

              {submitError && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '12px', borderRadius: '8px', color: '#DC2626', fontSize: '13px' }}>
                  ⚠️ {submitError}
                </div>
              )}

              {submitSuccess && (
                <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '12px', borderRadius: '8px', color: '#059669', fontSize: '13px' }}>
                  ✅ {submitSuccess}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Số tiền rút (₫) <span style={{ color: '#EF4444' }}>*</span></label>
                <input
                  type="number"
                  required
                  placeholder="Nhập số tiền muốn rút..."
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Ngân hàng <span style={{ color: '#EF4444' }}>*</span></label>
                <select
                  value={bankNameSelect}
                  onChange={(e) => {
                    setBankNameSelect(e.target.value);
                    if (e.target.value !== 'Khác') {
                      setBankName(e.target.value);
                    } else {
                      setBankName('');
                    }
                  }}
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none', background: '#fff' }}
                >
                  {popularBanks.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>

                {bankNameSelect === 'Khác' && (
                  <input
                    type="text"
                    required
                    placeholder="Nhập tên ngân hàng khác..."
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    style={{ marginTop: '8px', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none' }}
                  />
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Số tài khoản <span style={{ color: '#EF4444' }}>*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Nhập số tài khoản ngân hàng..."
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value.replace(/\s/g, ''))}
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Tên chủ tài khoản (viết hoa không dấu) <span style={{ color: '#EF4444' }}>*</span></label>
                <input
                  type="text"
                  required
                  placeholder="VD: NGUYEN VAN A"
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value.toUpperCase())}
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Ghi chú gửi Admin</label>
                <textarea
                  placeholder="Lưu ý khi chuyển khoản (nếu có)..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ flex: 1, padding: '12px', border: '1px solid #D1D5DB', color: '#6B7280', background: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 2, padding: '12px', background: '#0056D2', color: '#fff', border: 'none', borderRadius: '8px', cursor: submitting ? 'wait' : 'pointer', fontWeight: 600,
                    opacity: submitting ? 0.7 : 1,
                  }}
                >
                  {submitting ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherRevenue;
