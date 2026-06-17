import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const VideoLearning = () => {
  const { courseId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [activeLesson, setActiveLesson] = useState(1);

  const syllabus = [
    { id: 0, title: 'Chương 1: Giới thiệu & Cấu trúc đề thi', duration: '45:00', completed: true },
    { id: 1, title: 'Chương 2: Grammar nền tảng', duration: '55:20', completed: false },
    { id: 2, title: 'Chương 3: Từ vựng chủ đề Environment', duration: '30:15', completed: false },
    { id: 3, title: 'Chương 4: Listening Practice', duration: '40:10', completed: false },
    { id: 4, title: 'Chương 5: Reading Strategies', duration: '35:00', completed: false },
  ];

  const tabStyle = (isActive) => ({
    padding: '12px 0', fontWeight: 600, fontSize: '15px', background: 'none', border: 'none',
    borderBottom: isActive ? '2px solid #0056D2' : '2px solid transparent',
    color: isActive ? '#0056D2' : '#6B7280', cursor: 'pointer', marginRight: '32px',
  });

  return (
    <div style={{ display: 'flex', gap: '0', margin: '-32px -16px', minHeight: 'calc(100vh - 64px)' }}>
      {/* Video Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Video Player */}
        <div style={{
          width: '100%', aspectRatio: '16/9', background: '#000',
          display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
        }}>
          <div style={{ fontSize: '64px', opacity: 0.7, cursor: 'pointer' }}>▶️</div>
          <p style={{ position: 'absolute', bottom: '16px', left: '20px', color: '#fff', fontSize: '14px', fontWeight: 500 }}>
            {syllabus[activeLesson].title}
          </p>
          <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '4px', background: '#374151' }}>
            <div style={{ height: '100%', width: '33%', background: '#0056D2' }}></div>
          </div>
        </div>

        {/* Below Video */}
        <div style={{ padding: '24px 32px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>
            IELTS 7.0 Cấp Tốc - {syllabus[activeLesson].title}
          </h1>
          <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>Thầy John Doe</p>

          {/* Tabs */}
          <div style={{ borderBottom: '1px solid #E5E7EB', marginBottom: '20px' }}>
            <button style={tabStyle(activeTab === 'overview')} onClick={() => setActiveTab('overview')}>Tổng quan</button>
            <button style={tabStyle(activeTab === 'qa')} onClick={() => setActiveTab('qa')}>Hỏi đáp</button>
            <button style={tabStyle(activeTab === 'notes')} onClick={() => setActiveTab('notes')}>Ghi chú</button>
          </div>

          {activeTab === 'overview' && (
            <div style={{ color: '#374151', fontSize: '15px', lineHeight: 1.7 }}>
              <p>Trong bài học này, thầy John Doe sẽ hướng dẫn những cấu trúc ngữ pháp trọng tâm thường xuất hiện trong phần thi Writing Task 2.</p>
              <p style={{ marginTop: '12px' }}>
                <a href="#" style={{ color: '#0056D2', fontWeight: 500 }}>📎 Tải tài liệu Grammar.pdf</a>
              </p>
            </div>
          )}
          {activeTab === 'qa' && (
            <div>
              <input type="text" placeholder="Đặt câu hỏi cho giảng viên..."
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '14px', outline: 'none', marginBottom: '12px' }}
              />
              <button style={{ background: '#0056D2', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '4px', fontWeight: 600, fontSize: '14px' }}>
                Gửi câu hỏi
              </button>
            </div>
          )}
          {activeTab === 'notes' && (
            <textarea placeholder="Ghi chú của bạn..." rows={6}
              style={{ width: '100%', padding: '12px 16px', border: '1px solid #D1D5DB', borderRadius: '4px', fontSize: '14px', outline: 'none', resize: 'vertical' }}
            />
          )}
        </div>
      </div>

      {/* Sidebar - Course Content */}
      <div style={{
        width: '360px', flexShrink: 0, borderLeft: '1px solid #E5E7EB',
        background: '#fff', overflowY: 'auto', height: 'calc(100vh - 64px)',
        position: 'sticky', top: '64px',
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB' }}>
          <h3 style={{ fontWeight: 700, fontSize: '16px' }}>Nội dung khóa học</h3>
          <p style={{ color: '#6B7280', fontSize: '13px', marginTop: '2px' }}>1/{syllabus.length} bài đã hoàn thành</p>
        </div>
        {syllabus.map((lesson) => (
          <div key={lesson.id}
            onClick={() => setActiveLesson(lesson.id)}
            style={{
              padding: '14px 20px', cursor: 'pointer',
              background: activeLesson === lesson.id ? '#E8F1FF' : '#fff',
              borderLeft: activeLesson === lesson.id ? '3px solid #0056D2' : '3px solid transparent',
              borderBottom: '1px solid #F3F4F6',
              transition: 'background 0.15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ marginTop: '2px' }}>
                {lesson.completed ? (
                  <span style={{ color: '#0056D2', fontSize: '14px' }}>✓</span>
                ) : activeLesson === lesson.id ? (
                  <span style={{ color: '#0056D2', fontSize: '12px' }}>▶</span>
                ) : (
                  <span style={{ color: '#D1D5DB', fontSize: '14px' }}>○</span>
                )}
              </div>
              <div>
                <p style={{
                  fontSize: '14px', fontWeight: activeLesson === lesson.id ? 600 : 400,
                  color: activeLesson === lesson.id ? '#0056D2' : '#374151',
                }}>{lesson.title}</p>
                <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>🎬 {lesson.duration}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoLearning;