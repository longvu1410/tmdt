import React, { useState, useEffect, useRef, useCallback } from 'react';
import { apiFetch } from '../services/apiService';

/* ──────────────── Canvas Line Chart Component ──────────────── */
const RevenueChart = ({ data, loading }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  const formatCurrency = (amount) => (amount || 0).toLocaleString('vi-VN') + ' ₫';

  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !data || data.length === 0) return;

    // Calculate cumulative order count
    let cumulative = 0;
    const chartData = data.map(d => {
      cumulative += d.orderCount || 0;
      return {
        ...d,
        cumulativeCount: cumulative
      };
    });

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = 340;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // Padding
    const padTop = 30, padRight = 20, padBottom = 60, padLeft = 80;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;

    // Data range
    const maxCount = Math.max(...chartData.map(d => d.cumulativeCount), 1);
    let niceMax = Math.ceil(maxCount / 5) * 5;
    if (niceMax < 5) niceMax = 5;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Grid & Y-axis labels
    ctx.strokeStyle = '#F3F4F6';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '11px Inter, system-ui, sans-serif';
    ctx.textAlign = 'right';
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const val = Math.round((niceMax / gridLines) * i);
      const y = padTop + chartH - (val / niceMax) * chartH;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();
      ctx.fillText(val + ' bản', padLeft - 10, y + 4);
    }

    // X-axis labels (show every Nth label to avoid overlap)
    ctx.textAlign = 'center';
    ctx.fillStyle = '#6B7280';
    ctx.font = '10px Inter, system-ui, sans-serif';
    const maxLabels = Math.floor(chartW / 50);
    const labelStep = Math.max(1, Math.ceil(chartData.length / maxLabels));
    for (let i = 0; i < chartData.length; i += labelStep) {
      const x = padLeft + (chartData.length > 1 ? (i / (chartData.length - 1)) * chartW : chartW / 2);
      const dateStr = chartData[i].date;
      const parts = dateStr.split('-');
      const label = parts[2] + '/' + parts[1];
      ctx.save();
      ctx.translate(x, padTop + chartH + 14);
      ctx.rotate(-Math.PI / 6);
      ctx.fillText(label, 0, 0);
      ctx.restore();
    }

    // Build points based on cumulativeCount
    const points = chartData.map((d, i) => ({
      x: padLeft + (chartData.length > 1 ? (i / (chartData.length - 1)) * chartW : chartW / 2),
      y: padTop + chartH - ((d.cumulativeCount || 0) / niceMax) * chartH,
    }));

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
    gradient.addColorStop(0, 'rgba(79, 70, 229, 0.25)');
    gradient.addColorStop(0.5, 'rgba(79, 70, 229, 0.08)');
    gradient.addColorStop(1, 'rgba(79, 70, 229, 0.01)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, padTop + chartH);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, padTop + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = '#4F46E5';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();

    // Dots for days with actual new sales
    chartData.forEach((d, i) => {
      if ((d.orderCount || 0) > 0) {
        ctx.beginPath();
        ctx.arc(points[i].x, points[i].y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#4F46E5';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // Store points for hover
    canvas._chartPoints = points;
    canvas._chartData = chartData;
    canvas._padLeft = padLeft;
    canvas._padTop = padTop;
    canvas._chartW = chartW;
    canvas._chartH = chartH;
  }, [data]);

  useEffect(() => {
    drawChart();
    const handleResize = () => drawChart();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawChart]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas._chartPoints) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const points = canvas._chartPoints;
    const chartData = canvas._chartData;

    let closest = 0;
    let closestDist = Infinity;
    points.forEach((p, i) => {
      const dist = Math.abs(p.x - mouseX);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });

    if (closestDist < 30) {
      const d = chartData[closest];
      const p = points[closest];
      setTooltip({
        x: p.x,
        y: p.y,
        date: d.date,
        cumulativeCount: d.cumulativeCount,
        revenue: d.revenue,
        orderCount: d.orderCount,
      });
    } else {
      setTooltip(null);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: '#9CA3AF' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #E5E7EB', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        Đang tải biểu đồ...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '60px 0', textAlign: 'center', color: '#9CA3AF' }}>
        Không có dữ liệu doanh thu cho quý này
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
        style={{ display: 'block', cursor: 'crosshair' }}
      />
      {tooltip && (
        <div
          ref={tooltipRef}
          style={{
            position: 'absolute',
            left: Math.min(tooltip.x, (containerRef.current?.offsetWidth || 300) - 200) + 'px',
            top: Math.max(tooltip.y - 100, 0) + 'px',
            background: 'rgba(17, 24, 39, 0.95)',
            color: '#F9FAFB',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '13px',
            lineHeight: 1.6,
            pointerEvents: 'none',
            zIndex: 10,
            minWidth: '185px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(8px)',
            transform: 'translateX(-50%)',
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: '6px', color: '#A5B4FC' }}>
            📅 {new Date(tooltip.date).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}
          </div>
          <div>📈 Lũy kế đã bán: <strong style={{ color: '#34D399', fontSize: '14px' }}>{tooltip.cumulativeCount} bản</strong></div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '6px', paddingTop: '6px', fontSize: '11px', color: '#9CA3AF' }}>
            <div>Doanh thu ngày: {formatCurrency(tooltip.revenue)}</div>
            <div>Đơn hàng ngày: {tooltip.orderCount} bản</div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ──────────────── Stats Card Component ──────────────── */
const StatCard = ({ label, value, icon, gradient, textColor, border }) => (
  <div style={{
    background: gradient,
    border: `1px solid ${border}`,
    borderRadius: '16px',
    padding: '24px',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'default',
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
  >
    <div style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: textColor, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ fontSize: '16px' }}>{icon}</span> {label}
    </div>
    <div style={{ fontSize: '28px', fontWeight: 800, color: textColor, filter: 'brightness(0.7)' }}>
      {value}
    </div>
  </div>
);

/* ──────────────── Main Page ──────────────── */
const TeacherRevenue = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [quarter, setQuarter] = useState(Math.floor((new Date().getMonth() + 3) / 3));
  const [revenueData, setRevenueData] = useState(null);
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
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
      const res = await apiFetch(`/api/teacher/payouts/quarter-revenue?year=${year}&quarter=${quarter}`, { method: 'GET' });
      if (!res.ok) throw new Error('Không thể lấy dữ liệu doanh thu');
      const data = await res.json();
      setRevenueData(data);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyRevenue = async () => {
    setChartLoading(true);
    try {
      const res = await apiFetch(`/api/teacher/payouts/daily-revenue?year=${year}&quarter=${quarter}`, { method: 'GET' });
      if (!res.ok) throw new Error('Không thể lấy dữ liệu biểu đồ');
      const data = await res.json();
      setDailyData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load daily revenue:', err);
      setDailyData([]);
    } finally {
      setChartLoading(false);
    }
  };

  const fetchWithdrawals = async () => {
    setLoadingWithdrawals(true);
    setWithdrawalError('');
    try {
      const res = await apiFetch('/api/teacher/payouts/withdrawals', { method: 'GET' });
      if (!res.ok) throw new Error('Không thể tải lịch sử rút tiền');
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
    fetchDailyRevenue();
    fetchWithdrawals();
  }, [year, quarter]);

  const formatCurrency = (amount) => (amount || 0).toLocaleString('vi-VN') + ' ₫';
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const quarterLabel = `Q${quarter}/${year}`;
  const totalDailyRevenue = dailyData.reduce((s, d) => s + (d.revenue || 0), 0);
  const totalDailyOrders = dailyData.reduce((s, d) => s + (d.orderCount || 0), 0);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Global animation styles */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '28px', animation: 'fadeInUp 0.4s ease' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: '0 0 4px', fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>📊</span>
          Báo cáo doanh thu
        </h1>
        <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>Theo dõi hiệu quả kinh doanh và quản lý tài chính khóa học</p>
      </div>

      {/* Filter Section */}
      <div style={{
        background: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px',
        padding: '16px 20px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center',
        flexWrap: 'wrap', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        animation: 'fadeInUp 0.4s ease 0.1s both',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontWeight: 600, color: '#374151', fontSize: '14px' }}>Năm:</label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none', background: '#F9FAFB', cursor: 'pointer' }}
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
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none', background: '#F9FAFB', cursor: 'pointer' }}
          >
            {[1, 2, 3, 4].map(q => (
              <option key={q} value={q}>Quý {q}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => { fetchRevenue(); fetchDailyRevenue(); }}
          disabled={loading}
          style={{
            padding: '8px 24px', background: 'linear-gradient(135deg, #4F46E5, #6366F1)', color: '#fff', border: 'none',
            borderRadius: '8px', fontWeight: 600, cursor: loading ? 'wait' : 'pointer', fontSize: '14px',
            transition: 'all 0.2s ease', boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 4px 16px rgba(79, 70, 229, 0.45)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(79, 70, 229, 0.3)'; }}
        >
          {loading ? 'Đang tải...' : 'Lọc dữ liệu'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '14px 16px', borderRadius: '10px', color: '#DC2626', marginBottom: '24px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Loading */}
      {loading && !revenueData && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#6B7280' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #E5E7EB', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          Đang tải dữ liệu doanh thu...
        </div>
      )}

      {/* Revenue Data */}
      {revenueData && !loading && (
        <div style={{ animation: 'fadeInUp 0.4s ease 0.2s both' }}>
          <div style={{ marginBottom: '20px', color: '#6B7280', fontSize: '14px' }}>
            Báo cáo từ <span style={{ fontWeight: 600, color: '#374151' }}>{formatDate(revenueData.periodStart)}</span> đến <span style={{ fontWeight: 600, color: '#374151' }}>{formatDate(revenueData.periodEnd)}</span>
          </div>

          {/* Stats Grid - 5 cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            <StatCard
              icon="💰" label="Tổng doanh thu" value={formatCurrency(revenueData.grossRevenue)}
              gradient="linear-gradient(135deg, #EEF2FF, #E0E7FF)" textColor="#4F46E5" border="#C7D2FE"
            />
            <StatCard
              icon="📦" label="Đơn hàng đã bán" value={revenueData.paidOrderCount}
              gradient="linear-gradient(135deg, #F0FDF4, #DCFCE7)" textColor="#16A34A" border="#BBF7D0"
            />
            <StatCard
              icon="📚" label="Khóa học đã bán" value={revenueData.coursesSoldCount}
              gradient="linear-gradient(135deg, #FFF7ED, #FFEDD5)" textColor="#EA580C" border="#FED7AA"
            />
            <StatCard
              icon="🏦" label="Đã yêu cầu / Đã thanh toán" value={formatCurrency(revenueData.requestedOrPaidAmount)}
              gradient="linear-gradient(135deg, #FFFBEB, #FEF3C7)" textColor="#D97706" border="#FDE68A"
            />
            <div style={{
              background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
              border: '1px solid #A7F3D0',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#059669', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '16px' }}>💸</span> Số dư khả dụng
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#064E3B', marginBottom: '12px' }}>
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
                  background: (revenueData.availableAmount && revenueData.availableAmount > 0)
                    ? 'linear-gradient(135deg, #059669, #10B981)' : '#D1D5DB',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 600,
                  cursor: (revenueData.availableAmount && revenueData.availableAmount > 0) ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                  fontSize: '14px',
                  boxShadow: (revenueData.availableAmount && revenueData.availableAmount > 0) ? '0 2px 8px rgba(5, 150, 105, 0.3)' : 'none',
                }}
              >
                💸 Yêu cầu rút tiền
              </button>
            </div>
          </div>

          {/* Daily Revenue Chart */}
          <div style={{
            background: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '28px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📈 Lũy kế sản phẩm đã bán
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#6B7280', background: '#F3F4F6', padding: '2px 10px', borderRadius: '99px' }}>{quarterLabel}</span>
                </h2>
                <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0 }}>Di chuột vào biểu đồ để xem tổng số sản phẩm đã bán lũy kế</p>
              </div>
              <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: '#6B7280' }}>
                <div>
                  Tổng: <strong style={{ color: '#4F46E5' }}>{formatCurrency(totalDailyRevenue)}</strong>
                </div>
                <div>
                  Đơn: <strong style={{ color: '#16A34A' }}>{totalDailyOrders}</strong>
                </div>
              </div>
            </div>
            <RevenueChart data={dailyData} loading={chartLoading} />
          </div>

          {/* Teacher Info */}
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px', marginBottom: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: '#111827' }}>Thông tin giảng viên</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <p style={{ color: '#6B7280', fontSize: '13px', margin: '0 0 4px' }}>Tên giảng viên</p>
                <p style={{ fontWeight: 600, margin: 0, color: '#111827' }}>{revenueData.teacherName}</p>
              </div>
              <div>
                <p style={{ color: '#6B7280', fontSize: '13px', margin: '0 0 4px' }}>Mã giảng viên</p>
                <p style={{ fontWeight: 600, margin: 0, color: '#111827' }}>{revenueData.teacherId}</p>
              </div>
            </div>
          </div>

          {/* Withdrawal History */}
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>📋 Lịch sử yêu cầu rút tiền</span>
              <button
                onClick={fetchWithdrawals}
                disabled={loadingWithdrawals}
                style={{ background: 'none', border: 'none', color: '#4F46E5', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
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
              <div style={{ textAlign: 'center', padding: '32px', color: '#9CA3AF', background: '#F9FAFB', borderRadius: '10px', border: '1px dashed #D1D5DB' }}>
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
                      <tr key={w.id} style={{ borderBottom: '1px solid #E5E7EB', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
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
            background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '500px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E5E7EB',
            overflow: 'hidden', animation: 'fadeInUp 0.3s ease',
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #F9FAFB, #F3F4F6)' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>💸 Tạo yêu cầu rút tiền</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#9CA3AF', cursor: 'pointer', padding: '4px' }}>✕</button>
            </div>

            <form onSubmit={handleWithdrawalSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '12px 16px', borderRadius: '10px', color: '#065F46', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Số dư khả dụng hiện tại:</span>
                <strong style={{ fontSize: '15px' }}>{formatCurrency(revenueData?.availableAmount)}</strong>
              </div>

              {submitError && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '12px', borderRadius: '10px', color: '#DC2626', fontSize: '13px' }}>
                  ⚠️ {submitError}
                </div>
              )}

              {submitSuccess && (
                <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '12px', borderRadius: '10px', color: '#059669', fontSize: '13px' }}>
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
                  style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={e => e.currentTarget.style.borderColor = '#4F46E5'}
                  onBlur={e => e.currentTarget.style.borderColor = '#D1D5DB'}
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
                  style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none', background: '#fff', cursor: 'pointer' }}
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
                    style={{ marginTop: '8px', padding: '10px 12px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none' }}
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
                  style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none' }}
                  onFocus={e => e.currentTarget.style.borderColor = '#4F46E5'}
                  onBlur={e => e.currentTarget.style.borderColor = '#D1D5DB'}
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
                  style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none' }}
                  onFocus={e => e.currentTarget.style.borderColor = '#4F46E5'}
                  onBlur={e => e.currentTarget.style.borderColor = '#D1D5DB'}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Ghi chú gửi Admin</label>
                <textarea
                  placeholder="Lưu ý khi chuyển khoản (nếu có)..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                  onFocus={e => e.currentTarget.style.borderColor = '#4F46E5'}
                  onBlur={e => e.currentTarget.style.borderColor = '#D1D5DB'}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ flex: 1, padding: '12px', border: '1px solid #D1D5DB', color: '#6B7280', background: '#fff', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 2, padding: '12px', background: 'linear-gradient(135deg, #4F46E5, #6366F1)', color: '#fff', border: 'none', borderRadius: '10px',
                    cursor: submitting ? 'wait' : 'pointer', fontWeight: 600, opacity: submitting ? 0.7 : 1,
                    transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
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
