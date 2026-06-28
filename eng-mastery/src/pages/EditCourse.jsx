import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API_BASE, { apiFetch } from '../services/apiService';

// ── Helpers ──────────────────────────────────────────────────────
const getUser = () => {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
};

// ── Sub-components (same style as CreateCourse) ───────────────────
const SectionHeader = ({ children }) => (
  <h2 style={{ fontSize: '17px', fontWeight: 700, color: '#111827', marginBottom: '16px', paddingBottom: '10px', borderBottom: '2px solid #E5E7EB' }}>
    {children}
  </h2>
);

const Field = ({ label, required, children, hint }) => (
  <div style={{ marginBottom: '18px' }}>
    <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', color: '#374151', marginBottom: '6px' }}>
      {label} {required && <span style={{ color: '#DC2626' }}>*</span>}
    </label>
    {children}
    {hint && <p style={{ color: '#9CA3AF', fontSize: '12px', marginTop: '4px' }}>{hint}</p>}
  </div>
);

const inputStyle = {
  width: '100%', height: '42px', border: '1px solid #D1D5DB', borderRadius: '4px',
  padding: '0 12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
};

const textareaStyle = {
  width: '100%', border: '1px solid #D1D5DB', borderRadius: '4px',
  padding: '10px 12px', fontSize: '14px', outline: 'none',
  boxSizing: 'border-box', resize: 'vertical', minHeight: '80px',
};

const TagListInput = ({ items, onChange, placeholder }) => {
  const [draft, setDraft] = useState('');
  const add = () => {
    const v = draft.trim();
    if (v && !items.includes(v)) { onChange([...items, v]); setDraft(''); }
  };
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <input value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder} style={{ ...inputStyle, flex: 1 }} />
        <button type="button" onClick={add} style={{
          padding: '0 16px', background: '#0056D2', color: '#fff',
          border: 'none', borderRadius: '4px', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
        }}>+ Thêm</button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {items.map((item, i) => (
          <span key={i} style={{
            background: '#E8F1FF', color: '#0056D2', padding: '4px 10px',
            borderRadius: '4px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            {item}
            <button type="button" onClick={() => remove(i)} style={{ background: 'none', border: 'none', color: '#0056D2', cursor: 'pointer', fontSize: '14px', lineHeight: 1 }}>×</button>
          </span>
        ))}
      </div>
    </div>
  );
};

const SkillInput = ({ onAdd }) => {
  const [draft, setDraft] = useState('');
  const add = () => { const v = draft.trim(); if (v) { onAdd(v); setDraft(''); } };
  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <input value={draft} onChange={e => setDraft(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        placeholder="VD: Listening, Reading, Grammar..."
        style={{ ...inputStyle, flex: 1 }} />
      <button type="button" onClick={add} style={{
        padding: '0 14px', background: '#EFF6FF', color: '#1D4ED8',
        border: '1px solid #BFDBFE', borderRadius: '4px', fontWeight: 600, fontSize: '13px', cursor: 'pointer',
      }}>+ Thêm</button>
    </div>
  );
};

// ── Video Upload Input ──────────────────────────────────────────
const VideoUploadInput = ({ value, onChange }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = React.useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('Vui lòng chọn tệp video hợp lệ.');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/api/upload/video`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formData
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Tải video lên thất bại.');
      }

      onChange(data.url);
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tải video.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="text"
          style={{ ...inputStyle, flex: 1 }}
          placeholder="Tải tệp video lên hoặc dán URL..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleUpload}
          accept="video/*"
          style={{ display: 'none' }}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          style={{
            height: '42px',
            padding: '0 16px',
            background: uploading ? '#93C5FD' : '#0056D2',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 600,
            fontSize: '13px',
            cursor: uploading ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
          }}
        >
          {uploading ? '⏳ Đang tải...' : '📤 Tải tệp lên'}
        </button>
      </div>
      {error && <p style={{ color: '#DC2626', fontSize: '12px', marginTop: '4px' }}>⚠️ {error}</p>}
      {value && !uploading && (
        <p style={{ color: '#059669', fontSize: '12px', marginTop: '4px' }}>
          ✅ Đã chọn video. <a href={value} target="_blank" rel="noopener noreferrer" style={{ color: '#0056D2', textDecoration: 'underline' }}>Xem thử</a>
        </p>
      )}
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────────
const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = getUser();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState(null);
  const [sections, setSections] = useState([]);
  const [expandedSection, setExpandedSection] = useState(0);

  // Load existing course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await apiFetch(`/api/courses/${id}`);
        if (!res.ok) throw new Error('Không tìm thấy khóa học');
        const data = await res.json();
        setForm({
          slug: data.slug || '',
          title: data.title || '',
          description: data.description || '',
          price: data.price?.toString() || '',
          discountPrice: data.discountPrice?.toString() || '',
          thumbnailUrl: data.thumbnailUrl || '',
          instructorName: data.instructorName || '',
          language: data.language || 'Vietnamese',
          level: data.level || 'BEGINNER',
          topic: data.topic || '',
          studentCount: data.studentCount || 0,
          lessonCount: data.lessonCount || 1,
          totalDuration: data.totalDuration || '',
          rating: data.rating || 5,
          ratingCount: data.ratingCount || 0,
          outcomes: data.outcomes || [],
          benefits: data.benefits || [],
          active: data.active !== false,
        });

        setSections((data.sections || []).map(s => ({
          title: s.title || '',
          lessonCount: s.lessonCount || 1,
          duration: s.duration || '',
          description: s.description || '',
          skills: s.skills || [],
          videoUrl: s.videoUrl || '',
        })));
      } catch (err) {
        setError(err.message || 'Có lỗi khi tải dữ liệu khóa học');
      } finally {
        setFetching(false);
      }
    };
    fetchCourse();
  }, [id]);

  const setField = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const addSection = () => {
    const newIdx = sections.length;
    setSections(s => [...s, { title: '', lessonCount: 1, duration: '', description: '', skills: [], videoUrl: '' }]);
    setExpandedSection(newIdx);
  };
  const removeSection = (i) => {
    setSections(s => s.filter((_, idx) => idx !== i));
    if (expandedSection === i) setExpandedSection(Math.max(0, i - 1));
    else if (expandedSection > i) setExpandedSection(expandedSection - 1);
  };
  const updateSection = (i, key, value) => setSections(s => s.map((sec, idx) => idx === i ? { ...sec, [key]: value } : sec));
  const addSkillToSection = (i, skill) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    setSections(s => s.map((sec, idx) => idx === i && !sec.skills.includes(trimmed) ? { ...sec, skills: [...sec.skills, trimmed] } : sec));
  };
  const removeSkillFromSection = (i, si) => {
    setSections(s => s.map((sec, idx) => idx === i ? { ...sec, skills: sec.skills.filter((_, j) => j !== si) } : sec));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.slug || !form.description || !form.price) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc (*).');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Validation for discount price
      const originalPrice = parseFloat(form.price) || 0;
      const promoPrice = form.discountPrice ? parseFloat(form.discountPrice) : null;
      if (promoPrice !== null) {
        if (promoPrice < 0) {
          setError('Giá khuyến mãi không thể âm.');
          setLoading(false);
          return;
        }
        if (promoPrice >= originalPrice) {
          setError('Giá khuyến mãi phải nhỏ hơn giá gốc.');
          setLoading(false);
          return;
        }
      }

      const body = {
        ...form,
        price: originalPrice,
        discountPrice: promoPrice,
        lessonCount: parseInt(form.lessonCount) || 1,
        studentCount: parseInt(form.studentCount) || 0,
        ratingCount: parseInt(form.ratingCount) || 0,
        rating: parseFloat(form.rating) || 5,
        sections: sections.filter(s => s.title),
      };

      const res = await apiFetch(`/api/courses/${id}/teacher-update`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Cập nhật thất bại. Vui lòng thử lại.');
        return;
      }
      setSuccess(true);
      setTimeout(() => navigate('/teacher/courses'), 2000);
    } catch {
      setError('Không thể kết nối đến server.');
    } finally {
      setLoading(false);
    }
  };

  // Guards
  if (!currentUser || !currentUser.roles?.includes('ROLE_TEACHER')) {
    return (
      <div style={{ maxWidth: '500px', margin: '80px auto', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚫</div>
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Không có quyền truy cập</h1>
        <p style={{ color: '#6B7280' }}>Tính năng này chỉ dành cho Giảng viên.</p>
      </div>
    );
  }

  if (fetching) {
    return <div style={{ textAlign: 'center', padding: '80px', color: '#6B7280' }}>⏳ Đang tải dữ liệu...</div>;
  }

  if (!form) {
    return (
      <div style={{ maxWidth: '500px', margin: '80px auto', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
        <h1 style={{ fontSize: '22px', fontWeight: 700 }}>Không tìm thấy khóa học</h1>
        <p style={{ color: '#6B7280' }}>{error}</p>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ maxWidth: '500px', margin: '80px auto', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '28px' }}>🔄</div>
        <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px', color: '#92400E' }}>Đã gửi lại để kiểm duyệt!</h1>
        <p style={{ color: '#6B7280' }}>Khóa học đang chờ Admin phê duyệt. Đang chuyển hướng...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '4px' }}>Giảng viên</p>
          <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0 }}>✏️ Chỉnh sửa khóa học</h1>
        </div>
        <button onClick={() => navigate('/teacher/courses')} style={{
          background: 'none', border: '1px solid #D1D5DB', color: '#374151',
          padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, fontSize: '14px',
        }}>← Quay lại</button>
      </div>

      {/* Notice */}
      <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '12px 16px', marginBottom: '24px', fontSize: '14px', color: '#92400E' }}>
        ⚠️ Sau khi lưu chỉnh sửa, khóa học sẽ chuyển về trạng thái <strong>Chờ duyệt</strong> và cần Admin phê duyệt lại.
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', padding: '14px 16px', marginBottom: '24px', color: '#DC2626', fontSize: '14px' }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>

          {/* ── LEFT COLUMN ── */}
          <div>
            {/* Thông tin cơ bản */}
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '24px', marginBottom: '20px' }}>
              <SectionHeader>📋 Thông tin cơ bản</SectionHeader>
              <Field label="Tiêu đề khóa học" required>
                <input style={inputStyle} placeholder="VD: IELTS 7.0 Cấp Tốc" value={form.title}
                  onChange={e => setField('title', e.target.value)} />
              </Field>
              <Field label="Slug (URL)" required hint="Chỉ dùng chữ thường, số và dấu gạch ngang.">
                <input style={inputStyle} placeholder="ielts-7-0-cap-toc" value={form.slug}
                  onChange={e => setField('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))} />
              </Field>
              <Field label="Mô tả" required>
                <textarea style={textareaStyle} rows={4} placeholder="Mô tả chi tiết về khóa học..."
                  value={form.description} onChange={e => setField('description', e.target.value)} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Field label="Tên giảng viên" required>
                  <input style={inputStyle} value={form.instructorName}
                    onChange={e => setField('instructorName', e.target.value)} />
                </Field>
                <Field label="Ngôn ngữ">
                  <select style={{ ...inputStyle }} value={form.language}
                    onChange={e => setField('language', e.target.value)}>
                    <option>Vietnamese</option>
                    <option>English</option>
                    <option>Bilingual</option>
                  </select>
                </Field>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Field label="Cấp độ">
                  <select style={{ ...inputStyle }} value={form.level}
                    onChange={e => setField('level', e.target.value)}>
                    <option value="BEGINNER">Sơ cấp</option>
                    <option value="INTERMEDIATE">Trung cấp</option>
                    <option value="ADVANCED">Nâng cao</option>
                  </select>
                </Field>
                <Field label="Tổng thời lượng" hint="VD: 40 giờ, 10h30m">
                  <input style={inputStyle} placeholder="40 giờ" value={form.totalDuration}
                    onChange={e => setField('totalDuration', e.target.value)} />
                </Field>
              </div>
              <Field label="URL Thumbnail" hint="Dán link ảnh bìa khóa học">
                <input style={inputStyle} placeholder="https://..." value={form.thumbnailUrl}
                  onChange={e => setField('thumbnailUrl', e.target.value)} />
              </Field>
            </div>

            {/* Outcomes */}
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '24px', marginBottom: '20px' }}>
              <SectionHeader>🎯 Học viên sẽ học được gì (Outcomes)</SectionHeader>
              <TagListInput items={form.outcomes} onChange={v => setField('outcomes', v)} placeholder="VD: Nắm vững cấu trúc đề IELTS" />
            </div>

            {/* Benefits */}
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '24px', marginBottom: '20px' }}>
              <SectionHeader>✨ Lợi ích khóa học (Benefits)</SectionHeader>
              <TagListInput items={form.benefits} onChange={v => setField('benefits', v)} placeholder="VD: Truy cập trọn đời" />
            </div>

            {/* Sections */}
            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '24px', marginBottom: '20px' }}>
              <SectionHeader>📚 Chương học (Sections)</SectionHeader>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {sections.map((sec, i) => {
                  const isOpen = expandedSection === i;
                  return (
                    <div key={i} style={{
                      border: '1px solid ' + (isOpen ? '#BFDBFE' : '#E5E7EB'),
                      borderRadius: '8px', overflow: 'hidden',
                      boxShadow: isOpen ? '0 2px 8px rgba(0,86,210,0.08)' : 'none',
                    }}>
                      <div onClick={() => setExpandedSection(isOpen ? -1 : i)}
                        style={{
                          padding: '12px 16px', background: isOpen ? '#EFF6FF' : '#F9FAFB',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
                        }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{
                            background: isOpen ? '#0056D2' : '#9CA3AF', color: '#fff',
                            width: '24px', height: '24px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '11px', fontWeight: 700,
                          }}>{i + 1}</span>
                          <span style={{ fontWeight: 600, fontSize: '14px', color: isOpen ? '#0056D2' : '#374151' }}>
                            {sec.title || `Chương ${i + 1} (chưa đặt tên)`}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ color: '#6B7280', fontSize: '12px' }}>
                            {sec.lessonCount} bài{sec.duration ? ` • ${sec.duration}` : ''}
                          </span>
                          {sections.length > 1 && (
                            <button type="button" onClick={(e) => { e.stopPropagation(); removeSection(i); }}
                              style={{ width: '28px', height: '28px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '4px', color: '#DC2626', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >×</button>
                          )}
                          <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', color: '#9CA3AF', fontSize: '12px', transition: 'transform 0.2s' }}>▼</span>
                        </div>
                      </div>

                      {isOpen && (
                        <div style={{ padding: '16px', borderTop: '1px solid #E5E7EB', background: '#fff' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 130px', gap: '12px', marginBottom: '14px' }}>
                            <Field label="Tên chương" required>
                              <input style={inputStyle} placeholder={`Chương ${i + 1}: ...`} value={sec.title}
                                onChange={e => updateSection(i, 'title', e.target.value)} />
                            </Field>
                            <Field label="Số bài">
                              <input style={inputStyle} type="number" min={1} value={sec.lessonCount}
                                onChange={e => updateSection(i, 'lessonCount', parseInt(e.target.value) || 1)} />
                            </Field>
                            <Field label="Thời lượng">
                              <input style={inputStyle} placeholder="3h 20m" value={sec.duration}
                                onChange={e => updateSection(i, 'duration', e.target.value)} />
                            </Field>
                          </div>
                          <Field label="Mô tả chương">
                            <textarea style={textareaStyle} rows={2} value={sec.description}
                              onChange={e => updateSection(i, 'description', e.target.value)} />
                          </Field>
                          <Field label="Kỹ năng (Skills)" hint="Nhấn Enter hoặc nút Thêm để thêm kỹ năng">
                            <SkillInput onAdd={(skill) => addSkillToSection(i, skill)} />
                            {sec.skills.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                                {sec.skills.map((skill, si) => (
                                  <span key={si} style={{
                                    background: '#EFF6FF', color: '#1D4ED8', padding: '4px 10px',
                                    borderRadius: '99px', fontSize: '12px', fontWeight: 500,
                                    border: '1px solid #BFDBFE', display: 'flex', alignItems: 'center', gap: '6px',
                                  }}>
                                    {skill}
                                    <button type="button" onClick={() => removeSkillFromSection(i, si)}
                                      style={{ background: 'none', border: 'none', color: '#1D4ED8', cursor: 'pointer', fontSize: '13px', lineHeight: 1, padding: 0 }}
                                    >×</button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </Field>
                          <Field label="🎬 Video bài giảng" hint="Tải lên tệp video hoặc dán link video (MP4, YouTube embed, v.v.)">
                            <VideoUploadInput value={sec.videoUrl || ''}
                              onChange={val => updateSection(i, 'videoUrl', val)} />
                          </Field>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <button type="button" onClick={addSection} style={{
                padding: '10px 18px', border: '1px dashed #93C5FD', borderRadius: '8px',
                background: '#EFF6FF', color: '#0056D2', fontSize: '13px', cursor: 'pointer',
                fontWeight: 600, marginTop: '12px', width: '100%',
              }}>+ Thêm chương mới</button>
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div style={{ position: 'sticky', top: '80px' }}>
            {/* Preview thumbnail */}
            <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{
                height: '160px', background: form.thumbnailUrl ? `url(${form.thumbnailUrl}) center/cover` : 'linear-gradient(135deg,#E8F1FF,#D1E3FF)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px',
              }}>
                {!form.thumbnailUrl && '🖼️'}
              </div>
              <div style={{ padding: '12px 14px', background: '#fff' }}>
                <p style={{ fontWeight: 600, fontSize: '13px', color: '#374151' }}>Xem trước thumbnail</p>
              </div>
            </div>

            <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '20px', marginBottom: '16px' }}>
              <SectionHeader>💰 Giá & Thống kê</SectionHeader>
              <Field label="Giá gốc (VNĐ)" required>
                <input style={inputStyle} type="number" min={0} placeholder="1500000" value={form.price}
                  onChange={e => setField('price', e.target.value)} />
              </Field>
              <Field label="Giá khuyến mãi (VNĐ)" hint="Để trống nếu không có giảm giá">
                <input style={inputStyle} type="number" min={0} placeholder="Gợi ý: 990000" value={form.discountPrice}
                  onChange={e => setField('discountPrice', e.target.value)} />
                {form.price && form.discountPrice && parseFloat(form.price) > 0 && parseFloat(form.discountPrice) > 0 && (
                  <div style={{ fontSize: '13px', color: '#059669', fontWeight: 600, marginTop: '6px' }}>
                    🏷️ Tiết kiệm: {Math.round((1 - parseFloat(form.discountPrice) / parseFloat(form.price)) * 100)}%
                  </div>
                )}
              </Field>
              <Field label="Số bài học">
                <input style={inputStyle} type="number" min={1} value={form.lessonCount}
                  onChange={e => setField('lessonCount', e.target.value)} />
              </Field>
            </div>


            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '14px', background: loading ? '#93C5FD' : '#0056D2',
              color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 700,
              fontSize: '16px', cursor: loading ? 'wait' : 'pointer',
            }}>
              {loading ? 'Đang lưu...' : '💾 Lưu và gửi duyệt lại'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditCourse;
