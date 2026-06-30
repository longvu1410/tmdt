import React, { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../services/apiService';

const TeacherComments = () => {
  const [comments, setComments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filters
  const [selectedCourseId, setSelectedCourseId] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'REPORTED' | 'HIDDEN'
  const [searchQuery, setSearchQuery] = useState('');

  // Modal actions
  const [replyTarget, setReplyTarget] = useState(null); // comment object
  const [replyContent, setReplyContent] = useState('');
  const [reportTarget, setReportTarget] = useState(null); // comment object
  const [reportReason, setReportReason] = useState('');
  const [actionProcessing, setActionProcessing] = useState(false);

  const fetchCommentsAndCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      // Fetch teacher's comments
      const commentsRes = await apiFetch('/api/teacher/comments');
      if (!commentsRes.ok) throw new Error('Không thể tải bình luận');
      const commentsData = await commentsRes.json();
      setComments(Array.isArray(commentsData) ? commentsData : []);

      // Fetch teacher's courses to build filter list
      const coursesRes = await apiFetch('/api/courses/my-courses');
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setCourses(Array.isArray(coursesData) ? coursesData : []);
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommentsAndCourses();
  }, [fetchCommentsAndCourses]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleToggleHide = async (commentId) => {
    try {
      const res = await apiFetch(`/api/teacher/comments/${commentId}/hide`, { method: 'PUT' });
      if (!res.ok) throw new Error('Thao tác thất bại');
      const updated = await res.json();
      
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, isHidden: updated.isHidden } : c));
      showSuccess(updated.isHidden ? '🔒 Đã ẩn bình luận thành công' : '🔓 Đã hiện lại bình luận');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTogglePin = async (commentId) => {
    try {
      const res = await apiFetch(`/api/teacher/comments/${commentId}/pin`, { method: 'PUT' });
      if (!res.ok) throw new Error('Thao tác thất bại');
      const updated = await res.json();

      setComments(prev => prev.map(c => c.id === commentId ? { ...c, isPinned: updated.isPinned } : c));
      showSuccess(updated.isPinned ? '📌 Đã ghim bình luận lên đầu khóa học' : '📍 Đã bỏ ghim bình luận');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !replyTarget) return;
    setActionProcessing(true);
    try {
      const res = await apiFetch(`/api/teacher/comments/${replyTarget.id}/reply`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyContent.trim()
        })
      });
      if (!res.ok) throw new Error('Không thể gửi câu trả lời');
      
      showSuccess('💬 Đã gửi câu trả lời thành công');
      setReplyTarget(null);
      setReplyContent('');
      fetchCommentsAndCourses();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionProcessing(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportReason.trim() || !reportTarget) return;
    setActionProcessing(true);
    try {
      const res = await apiFetch(`/api/teacher/comments/${reportTarget.id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reportReason.trim() })
      });
      if (!res.ok) throw new Error('Không thể gửi báo cáo vi phạm');

      showSuccess('🚨 Đã gửi báo cáo vi phạm lên Admin');
      setReportTarget(null);
      setReportReason('');
      fetchCommentsAndCourses();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionProcessing(false);
    }
  };

  // Filter logic
  const filteredComments = comments.filter(c => {
    const matchCourse = selectedCourseId === 'ALL' || c.courseId === Number(selectedCourseId);
    
    let matchStatus = true;
    if (statusFilter === 'REPORTED') matchStatus = c.isReported === true;
    else if (statusFilter === 'HIDDEN') matchStatus = c.isHidden === true;

    const query = searchQuery.toLowerCase();
    const matchSearch = !searchQuery || 
      c.content.toLowerCase().includes(query) ||
      c.userDisplayName.toLowerCase().includes(query) ||
      c.courseTitle.toLowerCase().includes(query);

    return matchCourse && matchStatus && matchSearch;
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px', fontFamily: "'Inter', sans-serif", color: '#374151' }}>
      {/* Toast Alert Success */}
      {successMsg && (
        <div style={{
          position: 'fixed', top: '80px', right: '24px', zIndex: 9998,
          background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '10px',
          padding: '14px 20px', color: '#065F46', fontSize: '14px', fontWeight: 600,
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)', animation: 'slideIn 0.3s ease',
        }}>
          {successMsg}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>💬 Quản lý bình luận & Hỏi đáp</h1>
        <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>Quản lý thảo luận, trả lời câu hỏi và điều phối nội dung trong khóa học của bạn</p>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '14px 16px', borderRadius: '10px', color: '#DC2626', marginBottom: '24px', fontSize: '14px' }} onClick={() => setError('')}>
          ⚠️ {error}
        </div>
      )}

      {/* Filters Box */}
      <div style={{
        background: '#fff', border: '1px solid #E5E7EB', borderRadius: '16px',
        padding: '20px', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)', alignItems: 'center'
      }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <input
            type="text"
            placeholder="Tìm theo nội dung, học viên, khóa học..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%', background: '#F9FAFB', border: '1px solid #D1D5DB', borderRadius: '8px',
              color: '#374151', padding: '8px 12px 8px 36px', fontSize: '13.5px', outline: 'none'
            }}
          />
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>🔍</span>
        </div>

        {/* Course Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '13.5px', fontWeight: 600, color: '#4B5563' }}>Khóa học:</label>
          <select
            value={selectedCourseId}
            onChange={e => setSelectedCourseId(e.target.value)}
            style={{ background: '#F9FAFB', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '8px 12px', fontSize: '13.5px', outline: 'none', cursor: 'pointer' }}
          >
            <option value="ALL">Tất cả khóa học</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '13.5px', fontWeight: 600, color: '#4B5563' }}>Trạng thái:</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ background: '#F9FAFB', border: '1px solid #D1D5DB', borderRadius: '8px', padding: '8px 12px', fontSize: '13.5px', outline: 'none', cursor: 'pointer' }}
          >
            <option value="ALL">Tất cả bình luận</option>
            <option value="REPORTED">Bị báo cáo vi phạm</option>
            <option value="HIDDEN">Đang bị ẩn</option>
          </select>
        </div>
      </div>

      {/* Main Comments List / Table */}
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#9CA3AF' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid #E5E7EB', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            Đang tải dữ liệu bình luận...
          </div>
        ) : filteredComments.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#9CA3AF' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
            <h3 style={{ margin: '0 0 8px', color: '#4B5563', fontWeight: 700 }}>Không tìm thấy bình luận nào</h3>
            <p style={{ fontSize: '13.5px', margin: 0 }}>Thử thay đổi từ khóa hoặc bộ lọc điều kiện</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', textAlign: 'left' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 600, color: '#374151' }}>Khóa học & Học viên</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600, color: '#374151', width: '45%' }}>Nội dung bình luận</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600, color: '#374151' }}>Trạng thái</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600, color: '#374151', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredComments.map((c) => {
                  const hasParent = c.parentId != null;
                  return (
                    <tr key={c.id} style={{ borderBottom: '1px solid #F3F4F6', background: c.isReported ? '#FFFDF5' : 'transparent', transition: 'background 0.15s' }}>
                      {/* Course & Author */}
                      <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                        <div style={{ fontWeight: 700, color: '#111827', marginBottom: '4px', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.courseTitle}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#6B7280' }}>
                          <span>👤 {c.userDisplayName}</span>
                          <span style={{ fontSize: '11px', color: '#9CA3AF' }}>({c.userRole === 'STUDENT' ? 'Học viên' : 'Giảng viên'})</span>
                        </div>
                      </td>

                      {/* Content */}
                      <td style={{ padding: '16px 20px', verticalAlign: 'top', lineHeight: 1.5 }}>
                        {hasParent && (
                          <div style={{ color: '#9CA3AF', fontSize: '11.5px', background: '#F3F4F6', padding: '4px 10px', borderRadius: '6px', display: 'inline-block', marginBottom: '6px' }}>
                            ↩️ Phản hồi bình luận #{c.parentId}
                          </div>
                        )}
                        <p style={{ margin: 0, wordBreak: 'break-word', color: '#374151' }}>{c.content}</p>
                        <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '6px' }}>
                          🕒 Đăng lúc: {new Date(c.createdAt).toLocaleString('vi-VN')}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                          {c.isPinned && (
                            <span style={{ background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>📌 Đã ghim</span>
                          )}
                          {c.isHidden && (
                            <span style={{ background: '#F3F4F6', color: '#4B5563', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>🔒 Đang ẩn</span>
                          )}
                          {c.isReported && (
                            <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '6px', padding: '6px 10px', maxWidth: '200px' }}>
                              <span style={{ color: '#DC2626', fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '2px' }}>🚨 Bị báo cáo:</span>
                              <span style={{ color: '#991B1B', fontSize: '11px', wordBreak: 'break-word' }}>{c.reportReason}</span>
                            </div>
                          )}
                          {!c.isPinned && !c.isHidden && !c.isReported && (
                            <span style={{ background: '#E0F2FE', color: '#0369A1', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>🌐 Hoạt động</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 20px', verticalAlign: 'top', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          {/* Reply Button */}
                          <button
                            onClick={() => { setReplyTarget(c); setReplyContent(''); }}
                            style={{
                              background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#2563EB',
                              padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600
                            }}
                          >💬 Trả lời</button>

                          {/* Pin Button */}
                          <button
                            onClick={() => handleTogglePin(c.id)}
                            style={{
                              background: c.isPinned ? '#FFFBEB' : '#fff',
                              border: c.isPinned ? '1px solid #FDE68A' : '1px solid #D1D5DB',
                              color: c.isPinned ? '#D97706' : '#4B5563',
                              padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600
                            }}
                          >{c.isPinned ? '📍 Bỏ ghim' : '📌 Ghim'}</button>

                          {/* Hide/Unhide Button */}
                          <button
                            onClick={() => handleToggleHide(c.id)}
                            style={{
                              background: c.isHidden ? '#F0FDF4' : '#FFF5F5',
                              border: c.isHidden ? '1px solid #A7F3D0' : '1px solid #FECACA',
                              color: c.isHidden ? '#059669' : '#DC2626',
                              padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600
                            }}
                          >{c.isHidden ? '🔓 Hiện' : '🔒 Ẩn'}</button>

                          {/* Report Admin Button */}
                          <button
                            onClick={() => { setReportTarget(c); setReportReason(''); }}
                            style={{
                              background: '#FFF5F5', border: '1px solid #FECACA', color: '#DC2626',
                              padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600
                            }}
                          >🚨 Báo cáo Admin</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {replyTarget && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px', backdropFilter: 'blur(3px)',
        }}
          onClick={(e) => e.target === e.currentTarget && setReplyTarget(null)}
        >
          <div style={{
            background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '500px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E5E7EB',
            overflow: 'hidden', padding: '24px'
          }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: '#111827' }}>💬 Trả lời câu hỏi / bình luận</h3>
            
            <div style={{ background: '#F3F4F6', padding: '12px 16px', borderRadius: '10px', marginBottom: '16px' }}>
              <div style={{ fontSize: '12.5px', color: '#6B7280', marginBottom: '4px' }}>Bình luận của <strong>{replyTarget.userDisplayName}</strong>:</div>
              <p style={{ margin: 0, fontSize: '13.5px', color: '#374151', fontStyle: 'italic' }}>"{replyTarget.content}"</p>
            </div>

            <form onSubmit={handleReplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Nội dung câu trả lời:</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Nhập câu trả lời của bạn..."
                  value={replyContent}
                  onChange={e => setReplyContent(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '8px',
                    border: '1.5px solid #D1D5DB', fontSize: '13.5px', outline: 'none',
                    fontFamily: 'inherit', resize: 'vertical',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setReplyTarget(null)}
                  disabled={actionProcessing}
                  style={{
                    background: '#F3F4F6', color: '#374151', border: 'none',
                    padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >Đóng</button>
                <button
                  type="submit"
                  disabled={actionProcessing || !replyContent.trim()}
                  style={{
                    background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', color: '#fff', border: 'none',
                    padding: '8px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                    cursor: 'pointer', opacity: (actionProcessing || !replyContent.trim()) ? 0.6 : 1
                  }}
                >
                  {actionProcessing ? 'Đang gửi...' : 'Gửi trả lời'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportTarget && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '24px', backdropFilter: 'blur(3px)',
        }}
          onClick={(e) => e.target === e.currentTarget && setReportTarget(null)}
        >
          <div style={{
            background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '460px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid #E5E7EB',
            overflow: 'hidden', padding: '24px'
          }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: 700, color: '#111827' }}>🚨 Báo cáo vi phạm lên Admin</h3>
            <p style={{ color: '#6B7280', fontSize: '13px', margin: '0 0 16px', lineHeight: 1.5 }}>
              Bạn đang thực hiện báo cáo bình luận của <strong>{reportTarget.userDisplayName}</strong> lên ban quản trị hệ thống. Vui lòng ghi chi tiết lý do vi phạm:
            </p>
            <form onSubmit={handleReportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <textarea
                required
                rows={3}
                placeholder="Nhập lý do báo cáo (ví dụ: ngôn từ kích động, thông tin sai lệch, spam quảng cáo...)"
                value={reportReason}
                onChange={e => setReportReason(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '8px',
                  border: '1.5px solid #D1D5DB', fontSize: '13.5px', outline: 'none',
                  fontFamily: 'inherit', resize: 'none',
                }}
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setReportTarget(null)}
                  disabled={actionProcessing}
                  style={{
                    background: '#F3F4F6', color: '#374151', border: 'none',
                    padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >Đóng</button>
                <button
                  type="submit"
                  disabled={actionProcessing || !reportReason.trim()}
                  style={{
                    background: '#DC2626', color: '#fff', border: 'none',
                    padding: '8px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                    cursor: 'pointer', opacity: (actionProcessing || !reportReason.trim()) ? 0.6 : 1
                  }}
                >
                  {actionProcessing ? 'Đang gửi...' : 'Gửi báo cáo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherComments;
