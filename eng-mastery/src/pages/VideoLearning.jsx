import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/apiService';

/* ─── Helpers ─────────────────────────────────────────────────────── */
const STORAGE_KEY = (courseId) => `eng_mastery_progress_${courseId}`;

const loadProgress = (courseId) => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY(courseId))) || {};
  } catch {
    return {};
  }
};

const saveProgress = (courseId, progress) => {
  try {
    localStorage.setItem(STORAGE_KEY(courseId), JSON.stringify(progress));
  } catch { /* silent */ }
};

const loadNote = (courseId, idx) => {
  try {
    return localStorage.getItem(`eng_mastery_note_${courseId}_${idx}`) || '';
  } catch { return ''; }
};

const saveNote = (courseId, idx, text) => {
  try {
    localStorage.setItem(`eng_mastery_note_${courseId}_${idx}`, text);
  } catch { /* silent */ }
};

/* ─── Styles ──────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  .vl-root * { box-sizing: border-box; }
  .vl-root { font-family: 'Inter', sans-serif; }

  .vl-sidebar-item {
    padding: 14px 20px;
    cursor: pointer;
    border-left: 3px solid transparent;
    border-bottom: 1px solid #F3F4F6;
    transition: background 0.15s, border-color 0.15s;
  }
  .vl-sidebar-item:hover { background: #F9FAFB; }
  .vl-sidebar-item.active {
    background: #EFF6FF;
    border-left-color: #2563EB;
  }

  .vl-tab-btn {
    padding: 12px 0;
    font-weight: 600;
    font-size: 14px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: #6B7280;
    cursor: pointer;
    margin-right: 28px;
    transition: color 0.15s, border-color 0.15s;
    font-family: inherit;
  }
  .vl-tab-btn.active {
    border-bottom-color: #2563EB;
    color: #2563EB;
  }
  .vl-tab-btn:hover:not(.active) { color: #374151; }

  .vl-btn-primary {
    background: linear-gradient(135deg, #2563EB, #1D4ED8);
    color: #fff;
    border: none;
    padding: 10px 22px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    font-family: inherit;
    transition: opacity 0.15s, transform 0.1s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .vl-btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }

  .vl-btn-secondary {
    background: #F3F4F6;
    color: #374151;
    border: none;
    padding: 10px 18px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.15s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .vl-btn-secondary:hover { background: #E5E7EB; }

  .vl-mark-btn {
    background: none;
    border: 1.5px solid #D1D5DB;
    padding: 7px 14px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    color: #6B7280;
    font-family: inherit;
    transition: all 0.15s;
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  .vl-mark-btn.done {
    background: #DCFCE7;
    border-color: #16A34A;
    color: #16A34A;
  }
  .vl-mark-btn:hover { border-color: #2563EB; color: #2563EB; }
  .vl-mark-btn.done:hover { border-color: #15803D; color: #15803D; background: #DCFCE7; }

  .vl-note-area {
    width: 100%;
    padding: 14px 16px;
    border: 1.5px solid #E5E7EB;
    border-radius: 10px;
    font-size: 14px;
    font-family: inherit;
    resize: vertical;
    outline: none;
    line-height: 1.6;
    color: #374151;
    transition: border-color 0.2s;
  }
  .vl-note-area:focus { border-color: #2563EB; }

  .vl-qa-input {
    width: 100%;
    padding: 12px 16px;
    border: 1.5px solid #E5E7EB;
    border-radius: 10px;
    font-size: 14px;
    font-family: inherit;
    outline: none;
    color: #374151;
    transition: border-color 0.2s;
    margin-bottom: 10px;
  }
  .vl-qa-input:focus { border-color: #2563EB; }

  .vl-progress-bar {
    height: 4px;
    background: #E5E7EB;
    border-radius: 2px;
    overflow: hidden;
    margin-top: 6px;
  }
  .vl-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #2563EB, #7C3AED);
    border-radius: 2px;
    transition: width 0.4s ease;
  }

  .vl-skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: vl-shimmer 1.5s infinite;
    border-radius: 6px;
  }
  @keyframes vl-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .vl-video-placeholder {
    width: 100%;
    aspect-ratio: 16/9;
    background: linear-gradient(135deg, #1e3a5f 0%, #0f1f36 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    color: #9CA3AF;
    position: relative;
    overflow: hidden;
  }
  .vl-video-placeholder::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 50%, rgba(37,99,235,0.08) 0%, transparent 70%);
  }
  .vl-play-icon {
    width: 72px;
    height: 72px;
    background: rgba(37,99,235,0.9);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
    box-shadow: 0 8px 32px rgba(37,99,235,0.4);
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: default;
  }
  .vl-play-icon svg { margin-left: 4px; }

  video::-webkit-media-controls { background: rgba(0,0,0,0.5); }
`;

/* ─── Component ───────────────────────────────────────────────────── */
const VideoLearning = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notEnrolled, setNotEnrolled] = useState(false);

  const [activeIdx, setActiveIdx] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [progress, setProgress] = useState({});
  const [note, setNote] = useState('');
  const [qaQuestion, setQaQuestion] = useState('');
  const [qaSubmitted, setQaSubmitted] = useState(false);

  // Comments state
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null); // { id, displayName }
  const [reportCommentId, setReportCommentId] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [commentError, setCommentError] = useState('');

  const fetchComments = useCallback(async () => {
    try {
      setLoadingComments(true);
      setCommentError('');
      const res = await apiFetch(`/api/courses/${courseId}/comments`);
      if (!res.ok) throw new Error('Không thể tải danh sách bình luận');
      const data = await res.json();
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      setCommentError(err.message || 'Lỗi tải bình luận');
    } finally {
      setLoadingComments(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (activeTab === 'qa') {
      fetchComments();
    }
  }, [activeTab, fetchComments]);

  const videoRef = useRef(null);

  /* fetch course learning content */
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        setError(null);

        const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();
        if (!user) {
          navigate('/');
          return;
        }

        const res = await apiFetch(`/api/courses/${courseId}/learn`);
        if (res.status === 400 || res.status === 403) {
          setNotEnrolled(true);
          setLoading(false);
          return;
        }
        if (!res.ok) throw new Error(`Lỗi ${res.status}`);

        const data = await res.json();
        setCourse(data);
        setProgress(loadProgress(courseId));
        setActiveIdx(0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  /* load note when chapter changes */
  useEffect(() => {
    if (course) setNote(loadNote(courseId, activeIdx));
  }, [activeIdx, course, courseId]);

  /* reset video when chapter changes */
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [activeIdx]);

  const toggleDone = useCallback(() => {
    const updated = { ...progress, [activeIdx]: !progress[activeIdx] };
    setProgress(updated);
    saveProgress(courseId, updated);
  }, [progress, activeIdx, courseId]);

  const handleNoteChange = (e) => {
    setNote(e.target.value);
    saveNote(courseId, activeIdx, e.target.value);
  };

  const handleQaSubmit = async () => {
    if (!qaQuestion.trim()) return;
    setCommentError('');
    try {
      const body = {
        content: qaQuestion.trim(),
        parentId: replyingTo ? replyingTo.id : null
      };
      const res = await apiFetch(`/api/courses/${courseId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Không thể đăng bình luận');
      }

      setQaQuestion('');
      setReplyingTo(null);
      setQaSubmitted(true);
      setTimeout(() => setQaSubmitted(false), 3000);
      fetchComments();
    } catch (err) {
      setCommentError(err.message);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportReason.trim() || !reportCommentId) return;
    setCommentError('');
    try {
      const res = await apiFetch(`/api/comments/${reportCommentId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reportReason.trim() }),
      });
      if (!res.ok) throw new Error('Không thể gửi báo cáo vi phạm');
      setReportCommentId(null);
      setReportReason('');
      alert('Đã gửi báo cáo vi phạm bình luận thành công!');
      fetchComments();
    } catch (err) {
      setCommentError(err.message);
    }
  };

  if (loading) return <LoadingScreen />;
  if (notEnrolled) return <NotEnrolledScreen courseId={courseId} />;
  if (error) return <ErrorScreen error={error} />;
  if (!course) return null;

  const sections = course.sections || [];
  const currentSection = sections[activeIdx] || {};
  const completedCount = Object.values(progress).filter(Boolean).length;
  const progressPct = sections.length > 0 ? Math.round((completedCount / sections.length) * 100) : 0;

  return (
    <>
      <style>{css}</style>
      <div
        className="vl-root"
        style={{ display: 'flex', gap: 0, margin: '-32px -16px', minHeight: 'calc(100vh - 64px)' }}
      >
        {/* ── Video + Info Area ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: '#fff' }}>

          {/* Video Player */}
          <div style={{ width: '100%', background: '#000', position: 'relative' }}>
            {currentSection.videoUrl ? (
              <video
                ref={videoRef}
                controls
                style={{ width: '100%', aspectRatio: '16/9', display: 'block', maxHeight: '70vh', objectFit: 'contain' }}
                onEnded={toggleDone}
              >
                <source src={currentSection.videoUrl} />
                Trình duyệt của bạn không hỗ trợ video HTML5.
              </video>
            ) : (
              <div className="vl-video-placeholder">
                <div className="vl-play-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#9CA3AF', position: 'relative', zIndex: 1 }}>
                  Chương này chưa có video
                </p>
              </div>
            )}

            {/* progress bar overlay */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: '#1f2937' }}>
              <div style={{
                height: '100%',
                width: `${progress[activeIdx] ? 100 : 0}%`,
                background: '#2563EB',
                transition: 'width 0.5s ease',
              }} />
            </div>
          </div>

          {/* Info below video */}
          <div style={{ padding: '24px 32px', flex: 1 }}>
            {/* Title row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '8px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Chương {activeIdx + 1} / {sections.length}
                </div>
                <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.3 }}>
                  {currentSection.title || course.title}
                </h1>
                <p style={{ color: '#6B7280', fontSize: '13px', marginTop: '4px' }}>
                  👨‍🏫 {course.instructorName || course.teacherName} &nbsp;·&nbsp; 🎬 {currentSection.duration}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexShrink: 0, alignItems: 'center' }}>
                <button
                  className={`vl-mark-btn${progress[activeIdx] ? ' done' : ''}`}
                  onClick={toggleDone}
                >
                  {progress[activeIdx] ? (
                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> Đã hoàn thành</>
                  ) : (
                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg> Đánh dấu hoàn thành</>
                  )}
                </button>

                {/* Prev / Next */}
                {activeIdx > 0 && (
                  <button className="vl-btn-secondary" onClick={() => setActiveIdx(i => i - 1)}>
                    ← Trước
                  </button>
                )}
                {activeIdx < sections.length - 1 && (
                  <button className="vl-btn-primary" onClick={() => setActiveIdx(i => i + 1)}>
                    Tiếp theo →
                  </button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div style={{ borderBottom: '1px solid #E5E7EB', marginBottom: '20px', marginTop: '16px' }}>
              {['overview', 'notes', 'qa'].map(tab => (
                <button
                  key={tab}
                  className={`vl-tab-btn${activeTab === tab ? ' active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'overview' ? '📄 Tổng quan' : tab === 'notes' ? '📝 Ghi chú' : '💬 Hỏi đáp'}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'overview' && (
              <div style={{ color: '#374151', fontSize: '15px', lineHeight: 1.8 }}>
                {currentSection.description ? (
                  <p>{currentSection.description}</p>
                ) : (
                  <p style={{ color: '#9CA3AF' }}>Không có mô tả cho chương này.</p>
                )}
                {currentSection.skills && currentSection.skills.length > 0 && (
                  <div style={{ marginTop: '20px' }}>
                    <p style={{ fontWeight: 600, marginBottom: '10px', color: '#111827' }}>🎯 Kỹ năng đạt được:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {currentSection.skills.map((skill, i) => (
                        <span key={i} style={{
                          background: '#EFF6FF', color: '#2563EB',
                          padding: '4px 12px', borderRadius: '20px',
                          fontSize: '13px', fontWeight: 500,
                        }}>✓ {skill}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notes' && (
              <div>
                <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '10px' }}>
                  Ghi chú được lưu tự động theo từng chương.
                </p>
                <textarea
                  className="vl-note-area"
                  rows={8}
                  placeholder="Nhập ghi chú của bạn cho chương này..."
                  value={note}
                  onChange={handleNoteChange}
                />
              </div>
            )}

            {activeTab === 'qa' && (
              <div>
                {qaSubmitted && (
                  <div style={{
                    background: '#DCFCE7', border: '1px solid #BBF7D0', borderRadius: '10px',
                    padding: '12px 16px', marginBottom: '16px', color: '#15803D', fontSize: '14px',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}>
                    ✅ Bình luận của bạn đã được đăng thành công!
                  </div>
                )}

                {commentError && (
                  <div style={{
                    background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px',
                    padding: '12px 16px', marginBottom: '16px', color: '#DC2626', fontSize: '14px',
                  }}>
                    ⚠️ {commentError}
                  </div>
                )}

                {/* Reply Indicator */}
                {replyingTo && (
                  <div style={{
                    background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px',
                    padding: '10px 14px', marginBottom: '12px', fontSize: '13.5px', color: '#1E40AF',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span>Đang phản hồi bình luận của <strong>{replyingTo.displayName}</strong></span>
                    <button
                      onClick={() => setReplyingTo(null)}
                      style={{ background: 'none', border: 'none', color: '#EF4444', fontWeight: 600, cursor: 'pointer', fontSize: '12px' }}
                    >Hủy bỏ</button>
                  </div>
                )}

                {/* Comment Input Form */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%', background: '#3B82F6',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContext: 'center',
                    fontWeight: 700, fontSize: '14px', flexShrink: 0, justifyContent: 'center',
                  }}>
                    {(() => {
                      try {
                        const user = JSON.parse(localStorage.getItem('user'));
                        return (user?.displayName || user?.username || 'U')[0].toUpperCase();
                      } catch { return 'U'; }
                    })()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <input
                      className="vl-qa-input"
                      type="text"
                      placeholder={replyingTo ? `Viết câu trả lời...` : "Đặt câu hỏi hoặc chia sẻ ý kiến của bạn về bài học này..."}
                      value={qaQuestion}
                      onChange={e => setQaQuestion(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleQaSubmit()}
                      style={{ marginBottom: '8px' }}
                    />
                    <button className="vl-btn-primary" onClick={handleQaSubmit} style={{ padding: '8px 18px', fontSize: '13px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '4px' }}><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                      {replyingTo ? 'Trả lời' : 'Đăng bình luận'}
                    </button>
                  </div>
                </div>

                {/* Comments List */}
                {loadingComments && comments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: '#9CA3AF' }}>
                    <div style={{ width: '24px', height: '24px', border: '2.5px solid #E5E7EB', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 8px' }} />
                    Đang tải thảo luận...
                  </div>
                ) : comments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9CA3AF', border: '1px dashed #E5E7EB', borderRadius: '12px' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
                    <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#4B5563' }}>Chưa có thảo luận nào</p>
                    <p style={{ fontSize: '12.5px', margin: 0 }}>Hãy là người đầu tiên đặt câu hỏi cho chương này!</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {comments.map((comment) => {
                      const renderCommentNode = (c, isReply = false) => {
                        const avatarLetter = (c.userDisplayName || c.username || 'U')[0].toUpperCase();
                        const isTeacher = c.userRole === 'TEACHER';
                        const isAdmin = c.userRole === 'ADMIN';

                        return (
                          <div key={c.id} style={{ display: 'flex', gap: '12px', marginTop: isReply ? '14px' : 0 }}>
                            {/* Avatar */}
                            <div style={{
                              width: isReply ? '30px' : '38px',
                              height: isReply ? '30px' : '38px',
                              borderRadius: '50%',
                              background: isTeacher ? 'linear-gradient(135deg, #10B981, #059669)' : isAdmin ? 'linear-gradient(135deg, #EF4444, #DC2626)' : '#6B7280',
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: isReply ? '12px' : '14px',
                              flexShrink: 0,
                            }}>{avatarLetter}</div>

                            {/* Comment Body */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '12px 16px' }}>
                                {/* Header */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', flexWrap: 'wrap', gap: '6px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <strong style={{ color: '#111827', fontSize: '13.5px' }}>{c.userDisplayName}</strong>
                                    {isTeacher && (
                                      <span style={{ background: '#D1FAE5', color: '#065F46', padding: '1px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>Giảng viên</span>
                                    )}
                                    {isAdmin && (
                                      <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '1px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>Quản trị viên</span>
                                    )}
                                    {c.isPinned && (
                                      <span style={{ background: '#FEF3C7', color: '#92400E', padding: '1px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>📌 Đã ghim</span>
                                    )}
                                  </div>
                                  <span style={{ color: '#9CA3AF', fontSize: '11px' }}>
                                    {new Date(c.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                                  </span>
                                </div>
                                {/* Content */}
                                <p style={{ color: '#374151', fontSize: '13.5px', margin: 0, lineHeight: 1.6, wordBreak: 'break-word' }}>{c.content}</p>
                              </div>

                              {/* Footer Actions */}
                              <div style={{ display: 'flex', gap: '16px', marginTop: '6px', paddingLeft: '8px' }}>
                                <button
                                  onClick={() => setReplyingTo({ id: c.id, displayName: c.userDisplayName })}
                                  style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                                >💬 Trả lời</button>
                                <button
                                  onClick={() => setReportCommentId(c.id)}
                                  style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '12px', cursor: 'pointer', padding: 0 }}
                                  onMouseEnter={e => e.currentTarget.style.color = '#DC2626'}
                                  onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}
                                >⚠️ Báo cáo vi phạm</button>
                              </div>

                              {/* Nested replies */}
                              {c.replies && c.replies.length > 0 && (
                                <div style={{ borderLeft: '2px solid #E5E7EB', paddingLeft: '14px', marginTop: '10px' }}>
                                  {c.replies.map(reply => renderCommentNode(reply, true))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      };

                      return renderCommentNode(comment);
                    })}
                  </div>
                )}

                {/* Report Reason Modal */}
                {reportCommentId && (
                  <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
                    zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '24px', backdropFilter: 'blur(3px)',
                  }}>
                    <div style={{
                      background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '440px',
                      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #E5E7EB',
                      overflow: 'hidden', padding: '24px'
                    }}>
                      <h3 style={{ margin: '0 0 12px', fontSize: '17px', fontWeight: 700, color: '#111827' }}>⚠️ Báo cáo bình luận vi phạm</h3>
                      <p style={{ color: '#6B7280', fontSize: '13px', margin: '0 0 16px', lineHeight: 1.5 }}>
                        Báo cáo này sẽ được gửi trực tiếp đến hệ thống quản trị viên và giảng viên để xử lý. Vui lòng cho biết lý do vi phạm:
                      </p>
                      <form onSubmit={handleReportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <textarea
                          required
                          rows={3}
                          placeholder="Lý do (ví dụ: ngôn từ xúc phạm, nội dung rác, thông tin sai lệch...)"
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
                            onClick={() => { setReportCommentId(null); setReportReason(''); }}
                            style={{
                              background: '#F3F4F6', color: '#374151', border: 'none',
                              padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >Đóng</button>
                          <button
                            type="submit"
                            style={{
                              background: '#DC2626', color: '#fff', border: 'none',
                              padding: '8px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >Gửi báo cáo</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div style={{
          width: '340px',
          flexShrink: 0,
          borderLeft: '1px solid #E5E7EB',
          background: '#FAFAFA',
          overflowY: 'auto',
          height: 'calc(100vh - 64px)',
          position: 'sticky',
          top: '64px',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Sidebar header */}
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #E5E7EB', background: '#fff' }}>
            <h3 style={{ fontWeight: 700, fontSize: '15px', margin: '0 0 8px' }}>📚 Nội dung khóa học</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ color: '#6B7280', fontSize: '12px' }}>
                {completedCount}/{sections.length} chương hoàn thành
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563EB' }}>{progressPct}%</span>
            </div>
            <div className="vl-progress-bar">
              <div className="vl-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          {/* Chapter list */}
          <div style={{ flex: 1 }}>
            {sections.map((section, idx) => (
              <div
                key={idx}
                className={`vl-sidebar-item${activeIdx === idx ? ' active' : ''}`}
                onClick={() => { setActiveIdx(idx); setActiveTab('overview'); }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  {/* Status icon */}
                  <div style={{ marginTop: '2px', flexShrink: 0 }}>
                    {progress[idx] ? (
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '50%',
                        background: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      </div>
                    ) : activeIdx === idx ? (
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '50%',
                        background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    ) : (
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '50%',
                        border: '2px solid #D1D5DB',
                      }} />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '13px',
                      fontWeight: activeIdx === idx ? 600 : 400,
                      color: activeIdx === idx ? '#1D4ED8' : '#374151',
                      lineHeight: 1.4,
                      wordBreak: 'break-word',
                    }}>
                      {section.title}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#9CA3AF' }}>🎬 {section.duration}</span>
                      {!section.videoUrl && (
                        <span style={{
                          fontSize: '10px', color: '#F59E0B', fontWeight: 600,
                          background: '#FFFBEB', padding: '1px 6px', borderRadius: '4px',
                          border: '1px solid #FDE68A',
                        }}>Chưa có video</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Back to dashboard */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid #E5E7EB', background: '#fff' }}>
            <Link to="/dashboard" style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              color: '#6B7280', fontSize: '13px', fontWeight: 500, textDecoration: 'none',
              transition: 'color 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = '#2563EB'}
              onMouseLeave={e => e.currentTarget.style.color = '#6B7280'}
            >
              ← Về danh sách khóa học
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

/* ─── Sub-screens ─────────────────────────────────────────────────── */
const LoadingScreen = () => (
  <>
    <style>{css}</style>
    <div className="vl-root" style={{ display: 'flex', gap: 0, margin: '-32px -16px', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ flex: 1 }}>
        <div className="vl-skeleton" style={{ width: '100%', aspectRatio: '16/9' }} />
        <div style={{ padding: '24px 32px' }}>
          <div className="vl-skeleton" style={{ height: '28px', width: '60%', marginBottom: '12px' }} />
          <div className="vl-skeleton" style={{ height: '16px', width: '30%', marginBottom: '32px' }} />
          <div className="vl-skeleton" style={{ height: '16px', width: '100%', marginBottom: '8px' }} />
          <div className="vl-skeleton" style={{ height: '16px', width: '85%' }} />
        </div>
      </div>
      <div style={{ width: '340px', borderLeft: '1px solid #E5E7EB', padding: '20px' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ marginBottom: '16px' }}>
            <div className="vl-skeleton" style={{ height: '14px', width: '80%', marginBottom: '6px' }} />
            <div className="vl-skeleton" style={{ height: '11px', width: '40%' }} />
          </div>
        ))}
      </div>
    </div>
  </>
);

const NotEnrolledScreen = ({ courseId }) => (
  <>
    <style>{css}</style>
    <div className="vl-root" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', textAlign: 'center', padding: '40px 16px',
    }}>
      <div style={{ fontSize: '72px', marginBottom: '20px' }}>🔒</div>
      <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '10px' }}>
        Bạn chưa mua khóa học này
      </h2>
      <p style={{ color: '#6B7280', fontSize: '15px', marginBottom: '32px', maxWidth: '400px', lineHeight: 1.6 }}>
        Vui lòng mua khóa học để xem toàn bộ nội dung video học tập.
      </p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <Link to={`/course/${courseId}`} style={{
          background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
          color: '#fff', padding: '12px 28px', borderRadius: '10px',
          fontWeight: 700, fontSize: '15px', textDecoration: 'none',
        }}>
          Xem chi tiết khóa học →
        </Link>
        <Link to="/dashboard" style={{
          background: '#F3F4F6', color: '#374151', padding: '12px 24px',
          borderRadius: '10px', fontWeight: 600, fontSize: '15px', textDecoration: 'none',
        }}>
          Về trang của tôi
        </Link>
      </div>
    </div>
  </>
);

const ErrorScreen = ({ error }) => (
  <>
    <style>{css}</style>
    <div className="vl-root" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '60vh', textAlign: 'center', padding: '40px',
    }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚠️</div>
      <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Có lỗi xảy ra</h2>
      <p style={{ color: '#6B7280', fontSize: '14px' }}>{error}</p>
    </div>
  </>
);

export default VideoLearning;