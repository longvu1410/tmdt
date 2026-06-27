import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../services/apiService';

const formatDateTime = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('vi-VN');
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    PENDING: { bg: '#FEF3C7', color: '#92400E', label: 'Chờ duyệt' },
    APPROVED: { bg: '#D1FAE5', color: '#065F46', label: 'Đã duyệt' },
    REJECTED: { bg: '#FEE2E2', color: '#991B1B', label: 'Từ chối' },
    DRAFT: { bg: '#F3F4F6', color: '#374151', label: 'Nháp' },
  };
  const s = map[status] || { bg: '#F3F4F6', color: '#374151', label: status };
  return (
    <span style={{
      background: s.bg, color: s.color, padding: '3px 10px',
      borderRadius: '99px', fontSize: '12px', fontWeight: 600,
    }}>
      {s.label}
    </span>
  );
};

// ─── Level Badge ──────────────────────────────────────────────────────────────
const LevelBadge = ({ level }) => {
  const map = {
    BEGINNER: { bg: '#DBEAFE', color: '#1E40AF', label: 'Cơ bản' },
    INTERMEDIATE: { bg: '#FEF3C7', color: '#92400E', label: 'Trung cấp' },
    ADVANCED: { bg: '#FCE7F3', color: '#831843', label: 'Nâng cao' },
  };
  const s = map[level] || { bg: '#F3F4F6', color: '#374151', label: level };
  return (
    <span style={{
      background: s.bg, color: s.color, padding: '2px 8px',
      borderRadius: '4px', fontSize: '11px', fontWeight: 600,
    }}>
      {s.label}
    </span>
  );
};

// ─── Course Detail Modal ──────────────────────────────────────────────────────
const CourseDetailModal = ({ course, onClose, onApprove, onReject }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (idx) => {
    setExpandedSections(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (!course) return null;

  const handleApprove = async () => {
    setProcessing(true);
    await onApprove(course.id);
    setProcessing(false);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    setProcessing(true);
    await onReject(course.id, rejectionReason);
    setProcessing(false);
  };

  const tabs = [
    { id: 'overview', label: '📋 Tổng quan' },
    { id: 'content', label: '📚 Nội dung' },
    { id: 'reviews', label: `⭐ Đánh giá (${course.reviews?.length || 0})` },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', backdropFilter: 'blur(4px)',
    }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '900px',
        maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        border: '1px solid #E5E7EB', boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
      }}>
        {/* Header */}
        <div style={{
          background: '#F9FAFB', padding: '24px', borderBottom: '1px solid #E5E7EB',
          display: 'flex', gap: '20px',
        }}>
          {course.thumbnailUrl ? (
            <img src={course.thumbnailUrl} alt={course.title}
              style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
          ) : (
            <div style={{
              width: '120px', height: '80px', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ fontSize: '32px' }}>🎓</span>
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
              <h2 style={{ color: '#111827', fontSize: '20px', fontWeight: 700, margin: 0, flex: 1 }}>
                {course.title}
              </h2>
              <StatusBadge status={course.status} />
            </div>
            <p style={{ color: '#6B7280', fontSize: '13px', margin: '0 0 8px' }}>
              👨‍🏫 {course.teacherName || course.instructorName} · {course.topicName} · {course.language}
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <LevelBadge level={course.level} />
              <span style={{ color: '#6B7280', fontSize: '12px' }}>🎬 {course.lessonCount} bài</span>
              <span style={{ color: '#6B7280', fontSize: '12px' }}>⏱️ {course.totalDuration}</span>
              <span style={{ color: '#6B7280', fontSize: '12px' }}>👥 {course.studentCount} học viên</span>
              {course.rating > 0 && (
                <span style={{ color: '#D97706', fontSize: '12px' }}>⭐ {course.rating?.toFixed(1)} ({course.ratingCount})</span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
            <span style={{ color: '#4F46E5', fontWeight: 700, fontSize: '22px' }}>
              {course.price > 0 ? `${course.price.toLocaleString('vi-VN')}₫` : 'Miễn phí'}
            </span>
            <button onClick={onClose} style={{
              background: '#fff', border: '1px solid #D1D5DB', color: '#6B7280',
              borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '13px',
            }}>✕ Đóng</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', background: '#fff' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px', background: 'none', border: 'none',
                color: activeTab === tab.id ? '#4F46E5' : '#6B7280',
                borderBottom: activeTab === tab.id ? '2px solid #4F46E5' : '2px solid transparent',
                cursor: 'pointer', fontSize: '14px', fontWeight: activeTab === tab.id ? 600 : 400,
                transition: 'all 0.2s',
              }}
            >{tab.label}</button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ color: '#6B7280', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                  Mô tả khóa học
                </h3>
                <p style={{ color: '#374151', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>{course.description}</p>
              </div>
              {course.outcomes?.length > 0 && (
                <div>
                  <h3 style={{ color: '#6B7280', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
                    Kết quả học tập
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {course.outcomes.map((o, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <span style={{ color: '#059669', marginTop: '2px', flexShrink: 0 }}>✓</span>
                        <span style={{ color: '#4B5563', fontSize: '13px' }}>{o}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {course.benefits?.length > 0 && (
                <div>
                  <h3 style={{ color: '#6B7280', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
                    Lợi ích
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {course.benefits.map((b, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <span style={{ color: '#4F46E5', marginTop: '2px', flexShrink: 0 }}>→</span>
                        <span style={{ color: '#4B5563', fontSize: '13px' }}>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {course.rejectionReason && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '16px' }}>
                  <h3 style={{ color: '#991B1B', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                    ❌ Lý do từ chối trước đó
                  </h3>
                  <p style={{ color: '#7F1D1D', fontSize: '13px', margin: 0 }}>{course.rejectionReason}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'content' && (
            <div>
              <h3 style={{ color: '#6B7280', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
                Chương trình học ({course.sections?.length || 0} chương)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(course.sections || []).map((section, i) => {
                  const isExpanded = !!expandedSections[i];
                  const hasDescription = section.description && section.description.trim();
                  const hasSkills = section.skills && section.skills.length > 0;
                  const hasDetails = hasDescription || hasSkills;
                  return (
                    <div key={i} style={{
                      borderRadius: '8px', border: '1px solid #E5E7EB',
                      overflow: 'hidden', transition: 'box-shadow 0.2s',
                      boxShadow: isExpanded ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                    }}>
                      {/* Section Header - Clickable */}
                      <div
                        onClick={() => toggleSection(i)}
                        style={{
                          background: isExpanded ? '#EEF2FF' : '#F9FAFB', padding: '14px 16px',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          cursor: 'pointer', transition: 'background 0.2s',
                          userSelect: 'none',
                        }}
                        onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = '#F3F4F6'; }}
                        onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = '#F9FAFB'; }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{
                            background: isExpanded ? '#4F46E5' : '#6B7280', color: '#fff',
                            width: '24px', height: '24px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '11px', fontWeight: 700, flexShrink: 0,
                            transition: 'background 0.2s',
                          }}>{i + 1}</span>
                          <span style={{ color: '#374151', fontSize: '14px', fontWeight: isExpanded ? 600 : 500 }}>{section.title}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                          <span style={{ color: '#6B7280', fontSize: '12px' }}>🎬 {section.lessonCount} bài</span>
                          <span style={{ color: '#6B7280', fontSize: '12px' }}>⏱️ {section.duration}</span>
                          <span style={{
                            display: 'inline-block', transition: 'transform 0.2s',
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            color: '#9CA3AF', fontSize: '12px',
                          }}>▼</span>
                        </div>
                      </div>

                      {/* Section Details - Expandable */}
                      {isExpanded && (
                        <div style={{
                          padding: '16px', borderTop: '1px solid #E5E7EB',
                          background: '#fff', animation: 'fadeIn 0.2s ease',
                        }}>
                          {hasDescription && (
                            <div style={{ marginBottom: hasSkills ? '14px' : 0 }}>
                              <p style={{ color: '#6B7280', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 6px' }}>
                                📝 Mô tả
                              </p>
                              <p style={{ color: '#4B5563', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                                {section.description}
                              </p>
                            </div>
                          )}
                          {hasSkills && (
                            <div>
                              <p style={{ color: '#6B7280', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>
                                🎯 Kỹ năng
                              </p>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {section.skills.map((skill, si) => (
                                  <span key={si} style={{
                                    background: '#EEF2FF', color: '#4338CA', padding: '4px 10px',
                                    borderRadius: '99px', fontSize: '12px', fontWeight: 500,
                                    border: '1px solid #C7D2FE',
                                  }}>{skill}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          {!hasDescription && !hasSkills && (
                            <p style={{ color: '#9CA3AF', fontSize: '13px', margin: 0, fontStyle: 'italic' }}>
                              Chưa có thông tin chi tiết cho chương này.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {(!course.sections || course.sections.length === 0) && (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                    Chưa có chương trình học
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(course.reviews || []).map((r, i) => (
                  <div key={i} style={{
                    background: '#F9FAFB', borderRadius: '8px', padding: '16px',
                    border: '1px solid #E5E7EB',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%', background: '#4F46E5',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 700, fontSize: '13px',
                        }}>{(r.studentName || 'U')[0].toUpperCase()}</div>
                        <span style={{ color: '#374151', fontWeight: 600, fontSize: '14px' }}>{r.studentName}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#D97706', fontSize: '13px' }}>{'⭐'.repeat(r.rating)}</span>
                        <span style={{ color: '#9CA3AF', fontSize: '12px' }}>{formatDateTime(r.createdAt)}</span>
                      </div>
                    </div>
                    <p style={{ color: '#4B5563', fontSize: '13px', margin: 0, lineHeight: 1.6 }}>{r.comment}</p>
                  </div>
                ))}
                {(!course.reviews || course.reviews.length === 0) && (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                    Chưa có đánh giá
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {course.status === 'PENDING' && (
          <div style={{
            padding: '16px 24px', borderTop: '1px solid #E5E7EB',
            background: '#F9FAFB', display: 'flex', flexDirection: 'column', gap: '12px',
          }}>
            {showRejectForm ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <textarea
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder="Nhập lý do từ chối khóa học..."
                  rows={3}
                  style={{
                    background: '#fff', border: '1px solid #D1D5DB', borderRadius: '8px',
                    color: '#374151', padding: '10px 12px', fontSize: '14px',
                    resize: 'none', outline: 'none', fontFamily: 'inherit',
                  }}
                />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setShowRejectForm(false)} style={{
                    flex: 1, padding: '10px', background: '#fff', border: '1px solid #D1D5DB',
                    borderRadius: '8px', color: '#6B7280', cursor: 'pointer', fontSize: '14px',
                  }}>Hủy</button>
                  <button onClick={handleReject} disabled={!rejectionReason.trim() || processing} style={{
                    flex: 2, padding: '10px', background: '#DC2626', border: 'none',
                    borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                    opacity: (!rejectionReason.trim() || processing) ? 0.6 : 1,
                  }}>
                    {processing ? 'Đang xử lý...' : '❌ Xác nhận từ chối'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setShowRejectForm(true)} style={{
                  flex: 1, padding: '12px', background: '#fff', border: '1px solid #FECACA',
                  borderRadius: '8px', color: '#DC2626', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                }}>❌ Từ chối</button>
                <button onClick={handleApprove} disabled={processing} style={{
                  flex: 2, padding: '12px', background: '#059669',
                  border: 'none', borderRadius: '8px', color: '#fff',
                  cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                  opacity: processing ? 0.7 : 1,
                }}>
                  {processing ? 'Đang xử lý...' : '✅ Phê duyệt khóa học'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('COURSES'); // 'COURSES' | 'WITHDRAWALS'
  
  // Course States
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  // Withdrawal States
  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawalStats, setWithdrawalStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [withdrawalAction, setWithdrawalAction] = useState('');
  const [withdrawalNote, setWithdrawalNote] = useState('');
  const [processingWithdrawal, setProcessingWithdrawal] = useState(false);

  // Complaint States
  const [complaints, setComplaints] = useState([]);
  const [complaintStats, setComplaintStats] = useState({ total: 0, pending: 0, reviewing: 0, resolved: 0, rejected: 0 });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [complaintHandleForm, setComplaintHandleForm] = useState({ status: 'REVIEWING', adminResponse: '' });
  const [processingComplaint, setProcessingComplaint] = useState(false);

  // User Management States
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState({ total: 0, active: 0, blocked: 0 });
  const [processingUser, setProcessingUser] = useState(false);

  // Course Management States
  const [allCourses, setAllCourses] = useState([]);
  const [courseManagementStats, setCourseManagementStats] = useState({ total: 0, active: 0, inactive: 0 });
  const [processingCourseToggle, setProcessingCourseToggle] = useState(false);




  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/api/courses/pending');
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status}: ${text}`);
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.content || data.data || []);
      setCourses(list);
      setStats({
        total: list.length,
        pending: list.filter(c => c.status === 'PENDING').length,
        approved: list.filter(c => c.status === 'APPROVED').length,
        rejected: list.filter(c => c.status === 'REJECTED').length,
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWithdrawals = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch('/api/admin/payouts/withdrawals');
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Không thể lấy danh sách yêu cầu rút tiền: ${res.status} ${text}`);
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setWithdrawals(list);
      setWithdrawalStats({
        total: list.length,
        pending: list.filter(w => w.status === 'PENDING').length,
        approved: list.filter(w => w.status === 'APPROVED').length,
        rejected: list.filter(w => w.status === 'REJECTED').length,
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchComplaints = useCallback(async () => {
    try {
      const res = await apiFetch('/api/complaints');
      if (!res.ok) return;
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setComplaints(list);
      setComplaintStats({
        total: list.length,
        pending: list.filter(c => c.status === 'PENDING').length,
        reviewing: list.filter(c => c.status === 'REVIEWING').length,
        resolved: list.filter(c => c.status === 'RESOLVED').length,
        rejected: list.filter(c => c.status === 'REJECTED').length,
      });
    } catch (e) { /* silent */ }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await apiFetch('/api/admin/users');
      if (!res.ok) return;
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setUsers(list);
      setUserStats({
        total: list.length,
        active: list.filter(u => u.enabled).length,
        blocked: list.filter(u => !u.enabled).length
      });
    } catch (e) { /* silent */ }
  }, []);

  const fetchAllCoursesForAdmin = useCallback(async () => {
    try {
      const res = await apiFetch('/api/courses/admin-all');
      if (!res.ok) return;
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setAllCourses(list);
      setCourseManagementStats({
        total: list.length,
        active: list.filter(c => c.active !== false).length,
        inactive: list.filter(c => c.active === false).length,
      });
    } catch (e) { /* silent */ }
  }, []);

  useEffect(() => {
    fetchPending();
    fetchWithdrawals();
    fetchComplaints();
    fetchUsers();
    fetchAllCoursesForAdmin();
  }, [fetchPending, fetchWithdrawals, fetchComplaints, fetchUsers, fetchAllCoursesForAdmin]);




  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleToggleUserStatus = async (userId) => {
    setProcessingUser(true);
    setError('');
    try {
      const res = await apiFetch(`/api/admin/users/${userId}/toggle-status`, {
        method: 'PUT',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Thao tác thất bại');
      }
      showSuccess('✅ Cập nhật trạng thái tài khoản thành công');
      fetchUsers();
    } catch (e) {
      setError(e.message);
    } finally {
      setProcessingUser(false);
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    setProcessingUser(true);
    setError('');
    try {
      const res = await apiFetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Cập nhật vai trò thất bại');
      }
      showSuccess('✅ Thay đổi vai trò người dùng thành công');
      fetchUsers();
    } catch (e) {
      setError(e.message);
    } finally {
      setProcessingUser(false);
    }
  };

  const handleToggleCourseActive = async (courseId) => {
    setProcessingCourseToggle(true);
    setError('');
    try {
      const res = await apiFetch(`/api/courses/${courseId}/toggle-active`, {
        method: 'PUT',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Cập nhật trạng thái khóa học thất bại');
      }
      showSuccess('✅ Cập nhật trạng thái hoạt động khóa học thành công');
      fetchAllCoursesForAdmin();
      fetchPending();
    } catch (e) {
      setError(e.message);
    } finally {
      setProcessingCourseToggle(false);
    }
  };



  const handleApprove = async (courseId) => {
    try {
      const res = await apiFetch(`/api/courses/${courseId}/approve`, {
        method: 'POST',
        body: JSON.stringify({ id: String(courseId) }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Phê duyệt thất bại: ${res.status} ${text}`);
      }
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, status: 'APPROVED' } : c));
      setStats(prev => ({ ...prev, pending: prev.pending - 1, approved: prev.approved + 1 }));
      setSelectedCourse(null);
      showSuccess(`✅ Đã phê duyệt khóa học #${courseId}`);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleReject = async (courseId, reason) => {
    try {
      const res = await apiFetch(`/api/courses/${courseId}/approve`, {
        method: 'POST',
        body: JSON.stringify({ id: String(courseId), rejectionReason: reason, action: 'REJECT' }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Từ chối thất bại: ${res.status} ${text}`);
      }
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, status: 'REJECTED', rejectionReason: reason } : c));
      setStats(prev => ({ ...prev, pending: prev.pending - 1, rejected: prev.rejected + 1 }));
      setSelectedCourse(null);
      showSuccess(`❌ Đã từ chối khóa học #${courseId}`);
    } catch (e) {
      setError(e.message);
    }
  };

  // Payout actions
  const handleProcessWithdrawal = async (e) => {
    e.preventDefault();
    if (!selectedWithdrawal) return;

    setProcessingWithdrawal(true);
    setError('');
    const actionPath = withdrawalAction === 'APPROVE' ? 'approve' : 'reject';
    
    try {
      const res = await apiFetch(`/api/admin/payouts/withdrawals/${selectedWithdrawal.id}/${actionPath}`, {
        method: 'POST',
        body: JSON.stringify({ adminNote: withdrawalNote.trim() }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Xử lý yêu cầu thất bại: ${res.status} ${text}`);
      }

      const updatedWithdrawal = await res.json();
      
      setWithdrawals(prev => prev.map(w => w.id === selectedWithdrawal.id ? updatedWithdrawal : w));
      
      // Recalculate stats
      const nextWithdrawals = withdrawals.map(w => w.id === selectedWithdrawal.id ? updatedWithdrawal : w);
      setWithdrawalStats({
        total: nextWithdrawals.length,
        pending: nextWithdrawals.filter(w => w.status === 'PENDING').length,
        approved: nextWithdrawals.filter(w => w.status === 'APPROVED').length,
        rejected: nextWithdrawals.filter(w => w.status === 'REJECTED').length,
      });

      showSuccess(`${withdrawalAction === 'APPROVE' ? '✅ Đã duyệt' : '❌ Đã từ chối'} yêu cầu rút tiền #${selectedWithdrawal.id}`);
      setSelectedWithdrawal(null);
      setWithdrawalNote('');
    } catch (e) {
      setError(e.message);
    } finally {
      setProcessingWithdrawal(false);
    }
  };

  const filteredCourses = courses.filter(c => {
    const matchSearch = !searchQuery ||
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.teacherName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructorName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const filteredWithdrawals = withdrawals.filter(w => {
    const matchSearch = !searchQuery ||
      String(w.id).includes(searchQuery) ||
      w.teacherName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.bankAccountNumber?.includes(searchQuery) ||
      w.bankAccountName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || w.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const formatCurrency = (amount) => {
    return (amount || 0).toLocaleString('vi-VN') + ' ₫';
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#F9FAFB', fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: '#374151',
    }}>
      {/* Success Toast */}
      {successMsg && (
        <div style={{
          position: 'fixed', top: '80px', right: '24px', zIndex: 9998,
          background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '10px',
          padding: '14px 20px', color: '#065F46', fontSize: '14px', fontWeight: 600,
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)', animation: 'slideIn 0.3s ease',
          maxWidth: '360px',
        }}>
          {successMsg}
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div style={{
          position: 'fixed', top: '80px', right: '24px', zIndex: 9998,
          background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px',
          padding: '14px 20px', color: '#991B1B', fontSize: '14px', fontWeight: 600,
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          maxWidth: '360px', cursor: 'pointer',
        }} onClick={() => setError('')}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              width: '48px', height: '48px', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
              borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px',
            }}>⚙️</div>
            <div>
              <h1 style={{ color: '#111827', fontSize: '28px', fontWeight: 800, margin: 0 }}>
                Admin Dashboard
              </h1>
              <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>
                Hệ thống phê duyệt & quản lý EngMastery
              </p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #E5E7EB',
          marginBottom: '24px',
          gap: '8px'
        }}>
          <button
            onClick={() => {
              setActiveTab('COURSES');
              setSearchQuery('');
              setFilterStatus('ALL');
            }}
            style={{
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'COURSES' ? '3px solid #4F46E5' : '3px solid transparent',
              color: activeTab === 'COURSES' ? '#4F46E5' : '#6B7280',
              fontWeight: activeTab === 'COURSES' ? 700 : 500,
              cursor: 'pointer',
              fontSize: '15px',
              transition: 'all 0.2s'
            }}
          >
            📚 Phê duyệt khóa học {stats.pending > 0 && <span style={{ background: '#EF4444', color: '#fff', fontSize: '11px', padding: '2px 6px', borderRadius: '10px', marginLeft: '6px' }}>{stats.pending}</span>}
          </button>
          <button
            onClick={() => {
              setActiveTab('MANAGE_COURSES');
              setSearchQuery('');
              setFilterStatus('ALL');
            }}
            style={{
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'MANAGE_COURSES' ? '3px solid #10B981' : '3px solid transparent',
              color: activeTab === 'MANAGE_COURSES' ? '#10B981' : '#6B7280',
              fontWeight: activeTab === 'MANAGE_COURSES' ? 700 : 500,
              cursor: 'pointer',
              fontSize: '15px',
              transition: 'all 0.2s'
            }}
          >
            📁 Quản lý khóa học
          </button>

          <button
            onClick={() => {
              setActiveTab('WITHDRAWALS');
              setSearchQuery('');
              setFilterStatus('ALL');
            }}
            style={{
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'WITHDRAWALS' ? '3px solid #4F46E5' : '3px solid transparent',
              color: activeTab === 'WITHDRAWALS' ? '#4F46E5' : '#6B7280',
              fontWeight: activeTab === 'WITHDRAWALS' ? 700 : 500,
              cursor: 'pointer',
              fontSize: '15px',
              transition: 'all 0.2s'
            }}
          >
            💸 Yêu cầu rút tiền {withdrawalStats.pending > 0 && <span style={{ background: '#EF4444', color: '#fff', fontSize: '11px', padding: '2px 6px', borderRadius: '10px', marginLeft: '6px' }}>{withdrawalStats.pending}</span>}
          </button>
          <button
            onClick={() => {
              setActiveTab('COMPLAINTS');
              setSearchQuery('');
              setFilterStatus('ALL');
            }}
            style={{
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'COMPLAINTS' ? '3px solid #DC2626' : '3px solid transparent',
              color: activeTab === 'COMPLAINTS' ? '#DC2626' : '#6B7280',
              fontWeight: activeTab === 'COMPLAINTS' ? 700 : 500,
              cursor: 'pointer',
              fontSize: '15px',
              transition: 'all 0.2s'
            }}
          >
            🚨 Khiếu nại {complaintStats.pending > 0 && <span style={{ background: '#EF4444', color: '#fff', fontSize: '11px', padding: '2px 6px', borderRadius: '10px', marginLeft: '6px' }}>{complaintStats.pending}</span>}
          </button>
          <button
            onClick={() => {
              setActiveTab('USERS');
              setSearchQuery('');
              setFilterStatus('ALL');
            }}
            style={{
              padding: '12px 20px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'USERS' ? '3px solid #7C3AED' : '3px solid transparent',
              color: activeTab === 'USERS' ? '#7C3AED' : '#6B7280',
              fontWeight: activeTab === 'USERS' ? 700 : 500,
              cursor: 'pointer',
              fontSize: '15px',
              transition: 'all 0.2s'
            }}
          >
            👤 Quản lý tài khoản
          </button>
        </div>


        {/* Stats Row */}
        {activeTab === 'COURSES' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Tổng khóa học', value: stats.total, icon: '📚', color: '#4F46E5', bg: '#EEF2FF' },
              { label: 'Chờ duyệt', value: stats.pending, icon: '⏳', color: '#D97706', bg: '#FFFBEB' },
              { label: 'Đã duyệt', value: stats.approved, icon: '✅', color: '#059669', bg: '#ECFDF5' },
              { label: 'Từ chối', value: stats.rejected, icon: '❌', color: '#DC2626', bg: '#FEF2F2' },
            ].map((s, i) => (
              <div key={i} style={{
                background: '#fff', border: '1px solid #E5E7EB',
                borderRadius: '12px', padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ color: '#6B7280', fontSize: '12px', fontWeight: 600, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {s.label}
                    </p>
                    <p style={{ color: s.color, fontSize: '32px', fontWeight: 800, margin: 0, lineHeight: 1 }}>
                      {s.value}
                    </p>
                  </div>
                  <div style={{
                    width: '44px', height: '44px', background: s.bg, borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
                  }}>{s.icon}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'MANAGE_COURSES' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Tổng khóa học', value: courseManagementStats.total, icon: '📚', color: '#4F46E5', bg: '#EEF2FF' },
              { label: 'Đang hiển thị', value: courseManagementStats.active, icon: '✅', color: '#059669', bg: '#ECFDF5' },
              { label: 'Đang ẩn', value: courseManagementStats.inactive, icon: '🚫', color: '#DC2626', bg: '#FEF2F2' },
            ].map((s, i) => (
              <div key={i} style={{
                background: '#fff', border: '1px solid #E5E7EB',
                borderRadius: '12px', padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ color: '#6B7280', fontSize: '12px', fontWeight: 600, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {s.label}
                    </p>
                    <p style={{ color: s.color, fontSize: '32px', fontWeight: 800, margin: 0, lineHeight: 1 }}>
                      {s.value}
                    </p>
                  </div>
                  <div style={{
                    width: '44px', height: '44px', background: s.bg, borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
                  }}>{s.icon}</div>
                </div>
              </div>
            ))}
          </div>
        )}


        {activeTab === 'WITHDRAWALS' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Tổng yêu cầu', value: withdrawalStats.total, icon: '💸', color: '#4F46E5', bg: '#EEF2FF' },
              { label: 'Chờ duyệt', value: withdrawalStats.pending, icon: '⏳', color: '#D97706', bg: '#FFFBEB' },
              { label: 'Đã thanh toán', value: withdrawalStats.approved, icon: '✅', color: '#059669', bg: '#ECFDF5' },
              { label: 'Từ chối', value: withdrawalStats.rejected, icon: '❌', color: '#DC2626', bg: '#FEF2F2' },
            ].map((s, i) => (
              <div key={i} style={{
                background: '#fff', border: '1px solid #E5E7EB',
                borderRadius: '12px', padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ color: '#6B7280', fontSize: '12px', fontWeight: 600, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {s.label}
                    </p>
                    <p style={{ color: s.color, fontSize: '32px', fontWeight: 800, margin: 0, lineHeight: 1 }}>
                      {s.value}
                    </p>
                  </div>
                  <div style={{
                    width: '44px', height: '44px', background: s.bg, borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
                  }}>{s.icon}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'COMPLAINTS' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Tổng khiếu nại', value: complaintStats.total, icon: '🚨', color: '#DC2626', bg: '#FEF2F2' },
              { label: 'Chờ xử lý', value: complaintStats.pending, icon: '⏳', color: '#D97706', bg: '#FFFBEB' },
              { label: 'Đang xem xét', value: complaintStats.reviewing, icon: '🔍', color: '#1E40AF', bg: '#DBEAFE' },
              { label: 'Đã giải quyết', value: complaintStats.resolved, icon: '✅', color: '#059669', bg: '#ECFDF5' },
            ].map((s, i) => (
              <div key={i} style={{
                background: '#fff', border: '1px solid #E5E7EB',
                borderRadius: '12px', padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ color: '#6B7280', fontSize: '12px', fontWeight: 600, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {s.label}
                    </p>
                    <p style={{ color: s.color, fontSize: '32px', fontWeight: 800, margin: 0, lineHeight: 1 }}>
                      {s.value}
                    </p>
                  </div>
                  <div style={{
                    width: '44px', height: '44px', background: s.bg, borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
                  }}>{s.icon}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'USERS' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Tổng tài khoản', value: userStats.total, icon: '👥', color: '#7C3AED', bg: '#F5F3FF' },
              { label: 'Đang hoạt động', value: userStats.active, icon: '✅', color: '#059669', bg: '#ECFDF5' },
              { label: 'Bị khóa', value: userStats.blocked, icon: '🚫', color: '#DC2626', bg: '#FEF2F2' },
            ].map((s, i) => (
              <div key={i} style={{
                background: '#fff', border: '1px solid #E5E7EB',
                borderRadius: '12px', padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ color: '#6B7280', fontSize: '12px', fontWeight: 600, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {s.label}
                    </p>
                    <p style={{ color: s.color, fontSize: '32px', fontWeight: 800, margin: 0, lineHeight: 1 }}>
                      {s.value}
                    </p>
                  </div>
                  <div style={{
                    width: '44px', height: '44px', background: s.bg, borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
                  }}>{s.icon}</div>
                </div>
              </div>
            ))}
          </div>
        )}


        {/* Panel Box */}
        <div style={{
          background: '#fff', border: '1px solid #E5E7EB', borderRadius: '16px', overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          {/* Panel Header */}
          <div style={{
            padding: '20px 24px', borderBottom: '1px solid #E5E7EB',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
          }}>
            <h2 style={{ color: '#111827', fontSize: '16px', fontWeight: 700, margin: 0 }}>
              {activeTab === 'COURSES' ? '📋 Danh sách khóa học chờ duyệt' : activeTab === 'WITHDRAWALS' ? '📋 Danh sách yêu cầu rút tiền' : activeTab === 'COMPLAINTS' ? '📋 Danh sách khiếu nại' : '📋 Danh sách tài khoản người dùng'}
            </h2>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Search */}
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder={activeTab === 'COURSES' ? "Tìm kiếm khóa học..." : activeTab === 'WITHDRAWALS' ? "Tìm giảng viên, STK..." : activeTab === 'COMPLAINTS' ? "Tìm học viên, khóa học..." : "Tìm tên, email..."}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    background: '#F9FAFB', border: '1px solid #D1D5DB', borderRadius: '8px',
                    color: '#374151', padding: '8px 12px 8px 36px', fontSize: '13px',
                    outline: 'none', width: '220px',
                  }}
                />
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: '14px' }}>🔍</span>
              </div>
              {/* Filter */}
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                style={{
                  background: '#F9FAFB', border: '1px solid #D1D5DB', borderRadius: '8px',
                  color: '#374151', padding: '8px 12px', fontSize: '13px', outline: 'none', cursor: 'pointer',
                }}
              >
                {activeTab === 'USERS' ? (
                  <>
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="ACTIVE">Đang hoạt động</option>
                    <option value="BLOCKED">Bị khóa</option>
                  </>
                ) : (
                  <>
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="PENDING">Chờ duyệt</option>
                    <option value="APPROVED">Đã duyệt</option>
                    <option value="REJECTED">Từ chối</option>
                  </>
                )}
              </select>
              {/* Refresh */}
              <button
                onClick={activeTab === 'COURSES' ? fetchPending : activeTab === 'MANAGE_COURSES' ? fetchAllCoursesForAdmin : activeTab === 'WITHDRAWALS' ? fetchWithdrawals : activeTab === 'COMPLAINTS' ? fetchComplaints : fetchUsers}
                disabled={loading}
                style={{
                  background: '#fff', border: '1px solid #D1D5DB', color: '#374151',
                  padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                <span style={{ display: 'inline-block', animation: loading ? 'spin 1s linear infinite' : 'none' }}>🔄</span>
                Làm mới
              </button>
            </div>
          </div>


          {/* Render Active Tab Table */}
          {activeTab === 'COURSES' && (
            /* --- COURSES PANEL --- */
            <>
              {loading ? (
                <div style={{ padding: '60px', textAlign: 'center' }}>
                  <div style={{ fontSize: '40px', marginBottom: '16px', animation: 'pulse 1.5s infinite' }}>⏳</div>
                  <p style={{ color: '#9CA3AF' }}>Đang tải danh sách khóa học...</p>
                </div>
              ) : filteredCourses.length === 0 ? (
                <div style={{ padding: '60px', textAlign: 'center' }}>
                  <div style={{ fontSize: '40px', marginBottom: '16px' }}>📭</div>
                  <p style={{ color: '#6B7280', marginBottom: '8px' }}>Không có khóa học nào</p>
                  <p style={{ color: '#9CA3AF', fontSize: '13px' }}>
                    {searchQuery || filterStatus !== 'ALL' ? 'Thử thay đổi bộ lọc tìm kiếm' : 'Không có khóa học đang chờ phê duyệt'}
                  </p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#F9FAFB' }}>
                        {['ID', 'Khóa học', 'Giảng viên', 'Giá', 'Thống kê', 'Trạng thái', 'Thao tác'].map(h => (
                          <th key={h} style={{
                            padding: '12px 16px', textAlign: 'left', color: '#6B7280',
                            fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                            letterSpacing: '0.08em', borderBottom: '1px solid #E5E7EB',
                            whiteSpace: 'nowrap',
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCourses.map((course) => (
                        <tr key={course.id}
                          style={{
                            borderBottom: '1px solid #F3F4F6',
                            background: '#fff',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                          onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                        >
                          <td style={{ padding: '14px 16px', color: '#9CA3AF', fontSize: '13px' }}>
                            #{course.id}
                          </td>
                          <td style={{ padding: '14px 16px', minWidth: '240px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {course.thumbnailUrl ? (
                                <img src={course.thumbnailUrl} alt={course.title}
                                  style={{ width: '64px', height: '36px', borderRadius: '4px', objectFit: 'cover', display: 'block' }} />
                              ) : (
                                <div style={{ width: '64px', height: '36px', borderRadius: '4px', background: 'linear-gradient(135deg, #E8F1FF, #D1E3FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>📘</div>
                              )}
                              <div>
                                <h4 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: '#111827' }}>
                                  {course.title}
                                </h4>
                                <span style={{ color: '#9CA3AF', fontSize: '11.5px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>
                                  {course.levelLabel || course.level}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '14px 16px', color: '#4B5563', fontSize: '13.5px' }}>
                            {course.instructorName}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ fontWeight: 700, color: '#111827', fontSize: '14px' }}>
                              {course.price === 0 ? 'Miễn phí' : formatCurrency(course.price)}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', color: '#6B7280', fontSize: '12.5px', lineHeight: 1.4 }}>
                            <div>⏱️ {course.totalDuration}</div>
                            <div>📝 {course.lessonCount} bài học</div>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{
                              background: '#FEF3C7', color: '#92400E',
                              padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 600,
                            }}>
                              ⏳ Chờ duyệt
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => setSelectedCourse(course)}
                                style={{
                                  background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#2563EB',
                                  padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
                                  whiteSpace: 'nowrap', fontWeight: 600,
                                }}
                              >🔍 Chi tiết</button>
                              <button
                                onClick={() => handleApprove(course.id)}
                                style={{
                                  background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669',
                                  padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
                                  whiteSpace: 'nowrap', fontWeight: 600,
                                }}
                              >✅ Duyệt</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Course Footer */}
              {filteredCourses.length > 0 && (
                <div style={{
                  padding: '12px 24px', borderTop: '1px solid #E5E7EB',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ color: '#9CA3AF', fontSize: '13px' }}>
                    Hiển thị {filteredCourses.length} / {courses.length} khóa học
                  </span>
                  {stats.pending > 0 && (
                    <span style={{ color: '#D97706', fontSize: '13px', fontWeight: 600 }}>
                      ⏳ {stats.pending} khóa học đang chờ phê duyệt
                    </span>
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === 'MANAGE_COURSES' && (
            <>
              {loading ? (
                <div style={{ padding: '60px', textAlign: 'center' }}>
                  <div style={{ fontSize: '40px', marginBottom: '16px', animation: 'pulse 1.5s infinite' }}>⏳</div>
                  <p style={{ color: '#9CA3AF' }}>Đang tải danh sách khóa học...</p>
                </div>
              ) : allCourses.length === 0 ? (
                <div style={{ padding: '60px', textAlign: 'center' }}>
                  <div style={{ fontSize: '40px', marginBottom: '16px' }}>📭</div>
                  <p style={{ color: '#6B7280', marginBottom: '8px' }}>Chưa có khóa học nào</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                    <thead>
                      <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                        <th style={{ padding: '14px 16px', fontWeight: 600, color: '#374151', textAlign: 'left' }}>ID</th>
                        <th style={{ padding: '14px 16px', fontWeight: 600, color: '#374151', textAlign: 'left' }}>Khóa học</th>
                        <th style={{ padding: '14px 16px', fontWeight: 600, color: '#374151', textAlign: 'left' }}>Giảng viên</th>
                        <th style={{ padding: '14px 16px', fontWeight: 600, color: '#374151', textAlign: 'left' }}>Giá</th>
                        <th style={{ padding: '14px 16px', fontWeight: 600, color: '#374151', textAlign: 'left' }}>Trạng thái duyệt</th>
                        <th style={{ padding: '14px 16px', fontWeight: 600, color: '#374151', textAlign: 'left' }}>Hiển thị</th>
                        <th style={{ padding: '14px 16px', fontWeight: 600, color: '#374151', textAlign: 'left' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allCourses.filter(c => {
                        const q = searchQuery.toLowerCase();
                        const matchSearch = !searchQuery || c.title?.toLowerCase().includes(q) || c.instructorName?.toLowerCase().includes(q);
                        const matchStatus = filterStatus === 'ALL' || (filterStatus === 'ACTIVE' ? c.active !== false : c.active === false);
                        return matchSearch && matchStatus;
                      }).map((c) => {
                        const statusColors = {
                          PENDING: { color: '#D97706', bg: '#FFFBEB', label: 'Chờ duyệt' },
                          APPROVED: { color: '#059669', bg: '#ECFDF5', label: 'Đã duyệt' },
                          REJECTED: { color: '#DC2626', bg: '#FEF2F2', label: 'Từ chối' },
                        };
                        const st = statusColors[c.status] || { color: '#374151', bg: '#F3F4F6', label: c.status };
                        return (
                          <tr key={c.id} style={{ borderBottom: '1px solid #F3F4F6', transition: 'background 0.15s' }}>
                            <td style={{ padding: '14px 16px', color: '#9CA3AF' }}>#{c.id}</td>
                            <td style={{ padding: '14px 16px', fontWeight: 600 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {c.thumbnailUrl ? (
                                  <img src={c.thumbnailUrl} alt={c.title} style={{ width: '40px', height: '24px', borderRadius: '4px', objectFit: 'cover' }} />
                                ) : (
                                  <div style={{ width: '40px', height: '24px', borderRadius: '4px', background: 'linear-gradient(135deg, #E8F1FF, #D1E3FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>📘</div>
                                )}
                                <span>{c.title}</span>
                              </div>
                            </td>
                            <td style={{ padding: '14px 16px', color: '#4B5563' }}>{c.instructorName}</td>
                            <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                              {c.discountPrice ? (
                                <div>
                                  <div style={{ color: '#DC2626' }}>{formatCurrency(c.discountPrice)}</div>
                                  <div style={{ textDecoration: 'line-through', color: '#9CA3AF', fontSize: '11px' }}>{formatCurrency(c.price)}</div>
                                </div>
                              ) : (
                                <div>{formatCurrency(c.price)}</div>
                              )}
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <span style={{ color: st.color, background: st.bg, padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 600 }}>
                                {st.label}
                              </span>
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <span style={{
                                background: c.active !== false ? '#D1FAE5' : '#FEE2E2',
                                color: c.active !== false ? '#065F46' : '#991B1B',
                                padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 600,
                              }}>
                                {c.active !== false ? '✓ Đang mở' : '🚫 Đang ẩn'}
                              </span>
                            </td>
                            <td style={{ padding: '14px 16px' }}>
                              <button
                                disabled={processingCourseToggle}
                                onClick={() => handleToggleCourseActive(c.id)}
                                style={{
                                  background: c.active !== false ? '#FEF2F2' : '#EFF6FF',
                                  border: '1.5px solid',
                                  borderColor: c.active !== false ? '#FECACA' : '#BFDBFE',
                                  color: c.active !== false ? '#DC2626' : '#2563EB',
                                  padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                                  fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap',
                                }}
                              >
                                {c.active !== false ? '🔒 Ẩn' : '🔓 Hiển thị'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <div style={{ padding: '12px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#9CA3AF', fontSize: '13px' }}>Tổng cộng {allCourses.length} khóa học</span>
                <span style={{ color: '#059669', fontSize: '13px', fontWeight: 600 }}>✓ {courseManagementStats.active} hiển thị / 🚫 {courseManagementStats.inactive} ẩn</span>
              </div>
            </>
          )}

          {activeTab === 'WITHDRAWALS' && (
            /* --- WITHDRAWALS PANEL --- */
            <>
              {loading ? (
                <div style={{ padding: '60px', textAlign: 'center' }}>
                  <div style={{ fontSize: '40px', marginBottom: '16px', animation: 'pulse 1.5s infinite' }}>⏳</div>
                  <p style={{ color: '#9CA3AF' }}>Đang tải danh sách yêu cầu rút tiền...</p>
                </div>
              ) : filteredWithdrawals.length === 0 ? (
                <div style={{ padding: '60px', textAlign: 'center' }}>
                  <div style={{ fontSize: '40px', marginBottom: '16px' }}>📭</div>
                  <p style={{ color: '#6B7280', marginBottom: '8px' }}>Không có yêu cầu rút tiền nào</p>
                  <p style={{ color: '#9CA3AF', fontSize: '13px' }}>
                    {searchQuery || filterStatus !== 'ALL' ? 'Thử thay đổi bộ lọc tìm kiếm' : 'Không có yêu cầu rút tiền hiện tại'}
                  </p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#F9FAFB' }}>
                        {['Mã số', 'Giảng viên', 'Số tiền', 'Tài khoản nhận tiền', 'Ngày tạo', 'Trạng thái', 'Ghi chú', 'Thao tác'].map(h => (
                          <th key={h} style={{
                            padding: '12px 16px', textAlign: 'left', color: '#6B7280',
                            fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                            letterSpacing: '0.08em', borderBottom: '1px solid #E5E7EB',
                            whiteSpace: 'nowrap',
                          }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWithdrawals.map((w) => (
                        <tr key={w.id}
                          style={{
                            borderBottom: '1px solid #F3F4F6',
                            background: '#fff',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                          onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                        >
                          <td style={{ padding: '14px 16px', color: '#6B7280', fontSize: '13px', fontWeight: 500 }}>
                            #{w.id}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <p style={{ color: '#111827', fontSize: '13.5px', fontWeight: 600, margin: '0 0 2px' }}>
                              {w.teacherName || `Giảng viên #${w.teacherId}`}
                            </p>
                            <p style={{ color: '#9CA3AF', fontSize: '11px', margin: 0 }}>Mã số: {w.teacherId}</p>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ color: '#111827', fontWeight: 800, fontSize: '14.5px' }}>
                              {formatCurrency(w.amount)}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: '12.5px', color: '#374151', lineHeight: 1.4 }}>
                            <div><strong>{w.bankName}</strong></div>
                            <div style={{ color: '#6B7280' }}>Số TK: {w.bankAccountNumber}</div>
                            <div style={{ color: '#6B7280' }}>Chủ TK: {w.bankAccountName}</div>
                          </td>
                          <td style={{ padding: '14px 16px', color: '#6B7280', fontSize: '12.5px' }}>
                            {formatDateTime(w.createdAt)}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <StatusBadge status={w.status} />
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: '12px', color: '#6B7280', maxWidth: '200px', wordBreak: 'break-word' }}>
                            {w.note && <div>📝 <em>Thầy cô:</em> {w.note}</div>}
                            {w.adminNote && <div style={{ marginTop: '4px', color: w.status === 'APPROVED' ? '#065F46' : '#991B1B' }}>
                              ⚙️ <em>Admin:</em> {w.adminNote}
                            </div>}
                            {!w.note && !w.adminNote && <span style={{ color: '#D1D5DB' }}>—</span>}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            {w.status === 'PENDING' ? (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  onClick={() => {
                                    setSelectedWithdrawal(w);
                                    setWithdrawalAction('APPROVE');
                                    setWithdrawalNote('');
                                  }}
                                  style={{
                                    background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669',
                                    padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
                                    whiteSpace: 'nowrap', fontWeight: 600,
                                  }}
                                >✅ Duyệt</button>
                                <button
                                  onClick={() => {
                                    setSelectedWithdrawal(w);
                                    setWithdrawalAction('REJECT');
                                    setWithdrawalNote('');
                                  }}
                                  style={{
                                    background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626',
                                    padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
                                    whiteSpace: 'nowrap', fontWeight: 600,
                                  }}
                                >❌ Từ chối</button>
                              </div>
                            ) : (
                              <span style={{ color: '#9CA3AF', fontSize: '12px', fontStyle: 'italic' }}>Đã xử lý</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Withdrawals Footer */}
              {filteredWithdrawals.length > 0 && (
                <div style={{
                  padding: '12px 24px', borderTop: '1px solid #E5E7EB',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ color: '#9CA3AF', fontSize: '13px' }}>
                    Hiển thị {filteredWithdrawals.length} / {withdrawals.length} yêu cầu rút tiền
                  </span>
                  {withdrawalStats.pending > 0 && (
                    <span style={{ color: '#D97706', fontSize: '13px', fontWeight: 600 }}>
                      ⏳ {withdrawalStats.pending} yêu cầu rút tiền đang chờ xử lý
                    </span>
                  )}
                </div>
              )}
            </>
          )}

          {/* ── COMPLAINTS PANEL ── */}
          {activeTab === 'COMPLAINTS' && (
            <>
              {complaints.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
                  <p style={{ fontSize: '15px' }}>Chưa có khiếu nại nào</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {complaints.filter(c => {
                    const q = searchQuery.toLowerCase();
                    const matchSearch = !searchQuery || c.title?.toLowerCase().includes(q) || c.studentName?.toLowerCase().includes(q) || c.courseTitle?.toLowerCase().includes(q);
                    const matchStatus = filterStatus === 'ALL' || c.status === filterStatus;
                    return matchSearch && matchStatus;
                  }).map((c, idx) => {
                    const statusMap = {
                      PENDING: { bg: '#FEF3C7', color: '#92400E', label: '⏳ Chờ xử lý' },
                      REVIEWING: { bg: '#DBEAFE', color: '#1E40AF', label: '🔍 Đang xem xét' },
                      RESOLVED: { bg: '#D1FAE5', color: '#065F46', label: '✅ Đã giải quyết' },
                      REJECTED: { bg: '#FEE2E2', color: '#991B1B', label: '❌ Không chấp nhận' },
                    };
                    const st = statusMap[c.status] || { bg: '#F3F4F6', color: '#374151', label: c.status };
                    return (
                      <div key={c.id} style={{ borderBottom: idx < complaints.length - 1 ? '1px solid #F3F4F6' : 'none', padding: '16px 24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 700, fontSize: '14px', color: '#111827' }}>#{c.id} — {c.title}</span>
                              <span style={{ background: st.bg, color: st.color, padding: '2px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 600 }}>{st.label}</span>
                            </div>
                            <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 4px' }}>
                              👤 {c.studentName} &nbsp;·&nbsp; 📚 {c.courseTitle} &nbsp;·&nbsp; {c.typeName}
                            </p>
                            <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
                              {new Date(c.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {c.adminResponse && (
                              <p style={{ fontSize: '13px', color: '#1D4ED8', marginTop: '6px', background: '#EFF6FF', padding: '6px 10px', borderRadius: '6px', display: 'inline-block' }}>
                                💬 {c.adminResponse.length > 80 ? c.adminResponse.slice(0, 80) + '...' : c.adminResponse}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => { setSelectedComplaint(c); setComplaintHandleForm({ status: c.status === 'PENDING' ? 'REVIEWING' : c.status, adminResponse: c.adminResponse || '' }); }}
                            style={{ padding: '8px 16px', background: c.status === 'PENDING' ? '#DC2626' : '#6B7280', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
                            {c.status === 'PENDING' ? '🚨 Xử lý' : '✏️ Sửa'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div style={{ padding: '12px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#9CA3AF', fontSize: '13px' }}>Tổng {complaints.length} khiếu nại</span>
                {complaintStats.pending > 0 && <span style={{ color: '#DC2626', fontSize: '13px', fontWeight: 600 }}>🚨 {complaintStats.pending} chờ xử lý</span>}
              </div>
            </>
          )}

          {/* ── USERS PANEL ── */}
          {activeTab === 'USERS' && (
            <>
              {users.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>👥</div>
                  <p style={{ fontSize: '15px' }}>Chưa có tài khoản nào trong hệ thống</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                    <thead>
                      <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                        <th style={{ padding: '14px 16px', fontWeight: 600, color: '#374151' }}>ID</th>
                        <th style={{ padding: '14px 16px', fontWeight: 600, color: '#374151' }}>Tài khoản</th>
                        <th style={{ padding: '14px 16px', fontWeight: 600, color: '#374151' }}>Email</th>
                        <th style={{ padding: '14px 16px', fontWeight: 600, color: '#374151' }}>Vai trò</th>
                        <th style={{ padding: '14px 16px', fontWeight: 600, color: '#374151' }}>Trạng thái</th>
                        <th style={{ padding: '14px 16px', fontWeight: 600, color: '#374151' }}>Ngày đăng ký</th>
                        <th style={{ padding: '14px 16px', fontWeight: 600, color: '#374151' }}>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.filter(u => {
                        const q = searchQuery.toLowerCase();
                        const matchSearch = !searchQuery || u.username?.toLowerCase().includes(q) || u.displayName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
                        const matchStatus = filterStatus === 'ALL' || (filterStatus === 'ACTIVE' ? u.enabled : !u.enabled);
                        return matchSearch && matchStatus;
                      }).map((u) => (
                        <tr key={u.id} style={{ borderBottom: '1px solid #F3F4F6', transition: 'background 0.15s' }}>
                          <td style={{ padding: '14px 16px', fontWeight: 500 }}>#{u.id}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <div><strong>{u.displayName}</strong></div>
                            <div style={{ color: '#6B7280', fontSize: '12px' }}>@{u.username}</div>
                          </td>
                          <td style={{ padding: '14px 16px', color: '#4B5563' }}>{u.email}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <select
                              value={u.roles[0] || 'ROLE_STUDENT'}
                              disabled={processingUser}
                              onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                              style={{
                                background: '#FFF', border: '1px solid #D1D5DB', borderRadius: '6px',
                                padding: '4px 8px', fontSize: '12.5px', outline: 'none', cursor: 'pointer',
                              }}
                            >
                              <option value="ROLE_STUDENT">Học viên (Student)</option>
                              <option value="ROLE_TEACHER">Giảng viên (Teacher)</option>
                              <option value="ROLE_ADMIN">Quản trị viên (Admin)</option>
                            </select>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{
                              background: u.enabled ? '#D1FAE5' : '#FEE2E2',
                              color: u.enabled ? '#065F46' : '#991B1B',
                              padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 600,
                            }}>
                              {u.enabled ? '✓ Hoạt động' : '🚫 Đã khóa'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', color: '#6B7280' }}>
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '—'}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <button
                              disabled={processingUser}
                              onClick={() => handleToggleUserStatus(u.id)}
                              style={{
                                background: u.enabled ? '#FEF2F2' : '#EFF6FF',
                                border: '1.5px solid',
                                borderColor: u.enabled ? '#FECACA' : '#BFDBFE',
                                color: u.enabled ? '#DC2626' : '#2563EB',
                                padding: '6px 12px', borderRadius: '6px', cursor: 'pointer',
                                fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap',
                              }}
                            >
                              {u.enabled ? '🔒 Khóa' : '🔓 Mở khóa'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div style={{ padding: '12px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#9CA3AF', fontSize: '13px' }}>Tổng cộng {users.length} tài khoản</span>
                <span style={{ color: '#059669', fontSize: '13px', fontWeight: 600 }}>✓ {userStats.active} hoạt động / 🚫 {userStats.blocked} khóa</span>
              </div>
            </>
          )}
        </div>
      </div>



      {/* Course Detail Modal */}
      {selectedCourse && (
        <CourseDetailModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {/* Withdrawal Process Modal */}
      {selectedWithdrawal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px', backdropFilter: 'blur(4px)',
        }}
          onClick={(e) => e.target === e.currentTarget && setSelectedWithdrawal(null)}
        >
          <div style={{
            background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '500px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.15)', border: '1px solid #E5E7EB',
            overflow: 'hidden', animation: 'fadeIn 0.2s ease',
          }}>
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid #E5E7EB',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: '#F9FAFB'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>
                {withdrawalAction === 'APPROVE' ? '✅ Duyệt yêu cầu rút tiền' : '❌ Từ chối yêu cầu rút tiền'}
              </h3>
              <button onClick={() => setSelectedWithdrawal(null)} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#9CA3AF', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleProcessWithdrawal} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#F3F4F6', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6B7280' }}>Giảng viên:</span>
                  <strong style={{ color: '#111827' }}>{selectedWithdrawal.teacherName} (ID: {selectedWithdrawal.teacherId})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6B7280' }}>Số tiền rút:</span>
                  <strong style={{ color: '#4F46E5', fontSize: '15px' }}>{formatCurrency(selectedWithdrawal.amount)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ color: '#6B7280' }}>Tài khoản nhận:</span>
                  <div style={{ textAlign: 'right' }}>
                    <strong>{selectedWithdrawal.bankName}</strong>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>STK: {selectedWithdrawal.bankAccountNumber}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>Chủ TK: {selectedWithdrawal.bankAccountName}</div>
                  </div>
                </div>
                {selectedWithdrawal.note && (
                  <div style={{ borderTop: '1px dashed #D1D5DB', paddingTop: '8px', marginTop: '4px' }}>
                    <span style={{ color: '#6B7280', display: 'block', marginBottom: '2px' }}>Lời nhắn giảng viên:</span>
                    <em style={{ color: '#374151' }}>"{selectedWithdrawal.note}"</em>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                  Ghi chú xử lý {withdrawalAction === 'REJECT' && <span style={{ color: '#EF4444' }}>*</span>}
                </label>
                <textarea
                  required={withdrawalAction === 'REJECT'}
                  placeholder={withdrawalAction === 'APPROVE' ? "Nhập ghi chú giao dịch, mã tham chiếu chuyển khoản (không bắt buộc)..." : "Vui lòng nhập lý do từ chối yêu cầu rút tiền..."}
                  value={withdrawalNote}
                  onChange={(e) => setWithdrawalNote(e.target.value)}
                  rows={3}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'none',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedWithdrawal(null)}
                  style={{ flex: 1, padding: '12px', border: '1px solid #D1D5DB', color: '#6B7280', background: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={processingWithdrawal || (withdrawalAction === 'REJECT' && !withdrawalNote.trim())}
                  style={{
                    flex: 2,
                    padding: '12px',
                    background: withdrawalAction === 'APPROVE' ? '#059669' : '#DC2626',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: processingWithdrawal ? 'wait' : 'pointer',
                    fontWeight: 600,
                    opacity: (processingWithdrawal || (withdrawalAction === 'REJECT' && !withdrawalNote.trim())) ? 0.7 : 1,
                  }}
                >
                  {processingWithdrawal ? 'Đang xử lý...' : withdrawalAction === 'APPROVE' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* ── COMPLAINT HANDLE MODAL ── */}
      {selectedComplaint && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backdropFilter: 'blur(4px)' }}
          onClick={e => e.target === e.currentTarget && setSelectedComplaint(null)}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '620px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', background: '#FEF2F2', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#DC2626' }}>🚨 Xử lý khiếu nại #{selectedComplaint.id}</h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6B7280' }}>{selectedComplaint.courseTitle} — {selectedComplaint.studentName}</p>
              </div>
              <button onClick={() => setSelectedComplaint(null)} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#9CA3AF', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '14px 16px', marginBottom: '16px' }}>
                <p style={{ fontWeight: 700, fontSize: '14px', margin: '0 0 6px', color: '#111827' }}>{selectedComplaint.title}</p>
                <p style={{ fontSize: '13px', color: '#4B5563', margin: '0 0 8px', lineHeight: 1.6 }}>{selectedComplaint.content}</p>
                <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>Loại: {selectedComplaint.typeName}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>Cập nhật trạng thái</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[
                      { val: 'REVIEWING', label: '🔍 Đang xem xét', color: '#1E40AF', bg: '#DBEAFE' },
                      { val: 'RESOLVED', label: '✅ Đã giải quyết', color: '#065F46', bg: '#D1FAE5' },
                      { val: 'REJECTED', label: '❌ Không chấp nhận', color: '#991B1B', bg: '#FEE2E2' },
                    ].map(opt => (
                      <button key={opt.val} type="button" onClick={() => setComplaintHandleForm(f => ({ ...f, status: opt.val }))}
                        style={{ padding: '8px 14px', borderRadius: '6px', border: '2px solid', borderColor: complaintHandleForm.status === opt.val ? opt.color : '#E5E7EB', background: complaintHandleForm.status === opt.val ? opt.bg : '#fff', color: opt.color, fontWeight: 600, fontSize: '13px', cursor: 'pointer', transition: 'all 0.15s' }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>Phản hồi cho học viên <span style={{ color: '#DC2626' }}>*</span></label>
                  <textarea value={complaintHandleForm.adminResponse}
                    onChange={e => setComplaintHandleForm(f => ({ ...f, adminResponse: e.target.value }))}
                    placeholder="Nhập phản hồi chi tiết cho học viên..." rows={4}
                    style={{ width: '100%', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setSelectedComplaint(null)} style={{ flex: 1, padding: '12px', border: '1px solid #D1D5DB', color: '#6B7280', background: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Hủy</button>
                  <button
                    disabled={processingComplaint || !complaintHandleForm.adminResponse.trim()}
                    onClick={async () => {
                      if (!complaintHandleForm.adminResponse.trim()) return;
                      setProcessingComplaint(true);
                      try {
                        const res = await apiFetch(`/api/complaints/${selectedComplaint.id}/handle`, { method: 'PUT', body: JSON.stringify(complaintHandleForm) });
                        if (!res.ok) throw new Error('Xử lý thất bại');
                        setSelectedComplaint(null);
                        setComplaintHandleForm({ status: 'REVIEWING', adminResponse: '' });
                        showSuccess('✅ Đã xử lý khiếu nại thành công, đã gửi email cho học viên');
                        fetchComplaints();
                      } catch (e) { setError(e.message); }
                      finally { setProcessingComplaint(false); }
                    }}
                    style={{ flex: 2, padding: '12px', background: '#DC2626', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '14px', opacity: processingComplaint || !complaintHandleForm.adminResponse.trim() ? 0.6 : 1 }}>
                    {processingComplaint ? 'Đang xử lý...' : '🚨 Lưu phản hồi & gửi email'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

    </div>
  );
};

export default AdminDashboard;
