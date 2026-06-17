import React, { useState } from 'react';

const PrivateMessage = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, from: 'student', text: 'Thầy ơi cho em hỏi phần ngữ pháp bài 3 ạ.' },
    { id: 2, from: 'teacher', text: 'Chào em, em đang vướng mắc ở điểm nào nhỉ?' },
    { id: 3, from: 'student', text: 'Em không hiểu cách dùng Past Perfect ạ.' },
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages(prev => [...prev, { id: Date.now(), from: 'student', text: message }]);
    setMessage('');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          background: '#0056D2', color: '#fff', display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '18px',
        }}>J</div>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700 }}>Thầy John Doe</h1>
          <span style={{ fontSize: '13px', color: '#00785A', fontWeight: 500 }}>● Đang hoạt động</span>
        </div>
      </div>

      {/* Chat Box */}
      <div style={{
        border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden',
        background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        {/* Messages */}
        <div style={{
          height: '420px', overflowY: 'auto', padding: '24px',
          background: '#F9FAFB', display: 'flex', flexDirection: 'column', gap: '16px',
        }}>
          {messages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', justifyContent: msg.from === 'student' ? 'flex-end' : 'flex-start' }}>
              {msg.from === 'teacher' && (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0056D2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px', marginRight: '8px', flexShrink: 0 }}>J</div>
              )}
              <div style={{
                maxWidth: '60%', padding: '12px 16px', borderRadius: '12px',
                background: msg.from === 'student' ? '#0056D2' : '#fff',
                color: msg.from === 'student' ? '#fff' : '#1F2937',
                border: msg.from === 'teacher' ? '1px solid #E5E7EB' : 'none',
                fontSize: '14px', lineHeight: 1.6,
                borderTopRightRadius: msg.from === 'student' ? '2px' : '12px',
                borderTopLeftRadius: msg.from === 'teacher' ? '2px' : '12px',
              }}>{msg.text}</div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Nhập tin nhắn..."
            style={{
              flex: 1, height: '44px', border: '1px solid #D1D5DB', borderRadius: '22px',
              padding: '0 20px', fontSize: '14px', outline: 'none',
            }}
          />
          <button onClick={handleSend} style={{
            width: '44px', height: '44px', borderRadius: '50%', background: '#0056D2',
            border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M22 2 11 13" strokeLinecap="round"/><path d="M22 2 15 22 11 13 2 9l20-7z" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivateMessage;