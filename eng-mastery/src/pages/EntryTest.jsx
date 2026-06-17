import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EntryTest = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState({});

  const questions = [
    { q: 'Choose the correct form: She ___ to school every day.', options: ['go', 'goes', 'going', 'gone'], answer: 1 },
    { q: 'What is the meaning of "diligent"?', options: ['Lazy', 'Hardworking', 'Clever', 'Honest'], answer: 1 },
    { q: 'Fill in: The students ___ their homework now.', options: ['do', 'did', 'are doing', 'have done'], answer: 2 },
  ];

  const handleSelect = (qi, oi) => setSelected(prev => ({ ...prev, [qi]: oi }));
  const handleSubmit = () => {
    const score = questions.filter((q, i) => selected[i] === q.answer).length;
    alert(`Bạn đạt ${score}/${questions.length} câu đúng!\nChuyển đến khóa học...`);
    navigate(`/course/${courseId}`);
  };

  const q = questions[current];

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ background: '#0056D2', borderRadius: '8px', padding: '32px', marginBottom: '24px', color: '#fff' }}>
        <p style={{ fontSize: '13px', color: '#A7C7FF', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Bài kiểm tra đầu vào</p>
        <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Đánh giá trình độ tiếng Anh</h1>
        <p style={{ color: '#C5D9F7', marginTop: '8px', fontSize: '14px' }}>Hoàn thành {questions.length} câu hỏi để chúng tôi xác định lộ trình phù hợp nhất cho bạn.</p>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '14px', color: '#6B7280' }}>Câu {current + 1} / {questions.length}</span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#0056D2' }}>{Math.round(((current + 1) / questions.length) * 100)}%</span>
        </div>
        <div style={{ height: '6px', background: '#E5E7EB', borderRadius: '3px' }}>
          <div style={{ height: '100%', width: `${((current + 1) / questions.length) * 100}%`, background: '#0056D2', borderRadius: '3px', transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Question Card */}
      <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '32px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px', lineHeight: 1.5 }}>{q.q}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {q.options.map((opt, oi) => (
            <button key={oi} onClick={() => handleSelect(current, oi)} style={{
              padding: '14px 20px', textAlign: 'left', border: `2px solid ${selected[current] === oi ? '#0056D2' : '#E5E7EB'}`,
              borderRadius: '6px', background: selected[current] === oi ? '#E8F1FF' : '#fff',
              color: selected[current] === oi ? '#0056D2' : '#374151',
              fontWeight: selected[current] === oi ? 600 : 400, fontSize: '15px',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
              <span style={{ fontWeight: 700, marginRight: '10px' }}>{String.fromCharCode(65 + oi)}.</span>{opt}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={() => setCurrent(c => c - 1)} disabled={current === 0} style={{
          padding: '12px 24px', border: '1px solid #E5E7EB', borderRadius: '4px',
          background: '#fff', color: '#374151', fontWeight: 600, fontSize: '14px',
          opacity: current === 0 ? 0.4 : 1, cursor: current === 0 ? 'not-allowed' : 'pointer',
        }}>← Câu trước</button>

        {current < questions.length - 1 ? (
          <button onClick={() => setCurrent(c => c + 1)} style={{
            padding: '12px 24px', background: '#0056D2', color: '#fff',
            border: 'none', borderRadius: '4px', fontWeight: 600, fontSize: '14px',
          }}>Câu tiếp theo →</button>
        ) : (
          <button onClick={handleSubmit} style={{
            padding: '12px 32px', background: '#00785A', color: '#fff',
            border: 'none', borderRadius: '4px', fontWeight: 700, fontSize: '15px',
          }}>Nộp bài ✓</button>
        )}
      </div>
    </div>
  );
};

export default EntryTest;