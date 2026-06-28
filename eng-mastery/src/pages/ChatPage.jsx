import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../services/apiService';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const ChatPage = () => {
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [activeContact, setActiveContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Fetch contacts list
  const fetchContacts = async () => {
    try {
      const res = await apiFetch('/api/chat/contacts');
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
        // If there's an active contact, update its unread count locally
        if (activeContact) {
          const updated = data.find(c => c.id === activeContact.id && c.courseId === activeContact.courseId);
          if (updated && updated.unreadCount > 0) {
            // Mark as read in backend
            await apiFetch(`/api/chat/history?contactId=${activeContact.id}&courseId=${activeContact.courseId}`);
            window.dispatchEvent(new Event('chat-unread-reset'));
          }
        }
      }
    } catch (e) {
      console.error('Failed to fetch contacts:', e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  // Fetch chat history when active contact changes
  useEffect(() => {
    if (!user || !activeContact) return;

    const fetchHistory = async () => {
      try {
        const res = await apiFetch(`/api/chat/history?contactId=${activeContact.id}&courseId=${activeContact.courseId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
          // Refresh contacts to clear unread badge
          fetchContacts();
          // Reset Navbar unread badge
          window.dispatchEvent(new Event('chat-unread-reset'));
        }
      } catch (e) {
        console.error('Failed to fetch history:', e);
      }
    };

    fetchHistory();
  }, [activeContact, user]);

  // Connect to WebSocket
  useEffect(() => {
    if (!user) return;

    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        // Subscribe to personal queue
        client.subscribe(`/topic/chat/${user.id}`, (message) => {
          const msg = JSON.parse(message.body);
          
          // Check if this message belongs to the current active chat session
          if (activeContact && 
              ((msg.senderId === activeContact.id && msg.receiverId === user.id) || 
               (msg.senderId === user.id && msg.receiverId === activeContact.id)) &&
              msg.courseId === activeContact.courseId) {
            
            setMessages(prev => [...prev, msg]);
            
            // If we are receiving a message from the active contact, mark it as read immediately
            if (msg.senderId === activeContact.id) {
              apiFetch(`/api/chat/history?contactId=${activeContact.id}&courseId=${activeContact.courseId}`)
                .then(() => {
                  window.dispatchEvent(new Event('chat-unread-reset'));
                });
            }
          } else {
            // Refresh contacts to update unread badges
            fetchContacts();
          }
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
      }
    });

    client.activate();
    stompClientRef.current = client;

    // Listen to global new message event from Navbar in case they are sent when ChatPage is active
    const handleNewMessageGlobal = (e) => {
      const msg = e.detail;
      if (activeContact && 
          msg.senderId === activeContact.id && 
          msg.courseId === activeContact.courseId) {
        // Already handled by local subscription, but if not, this acts as a backup.
      } else {
        fetchContacts();
      }
    };
    window.addEventListener('new-message-received', handleNewMessageGlobal);

    return () => {
      client.deactivate();
      window.removeEventListener('new-message-received', handleNewMessageGlobal);
    };
  }, [user, activeContact]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send text message
  const handleSend = () => {
    if (!text.trim() || !activeContact || !stompClientRef.current) return;

    const chatMsg = {
      senderId: user.id,
      receiverId: activeContact.id,
      courseId: activeContact.courseId,
      content: text,
      imageUrl: null
    };

    stompClientRef.current.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(chatMsg)
    });

    setText('');
  };

  // Upload image and send
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeContact || !stompClientRef.current) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await fetch('http://localhost:8080/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        
        const chatMsg = {
          senderId: user.id,
          receiverId: activeContact.id,
          courseId: activeContact.courseId,
          content: null,
          imageUrl: data.url
        };

        stompClientRef.current.publish({
          destination: '/app/chat.send',
          body: JSON.stringify(chatMsg)
        });
      } else {
        alert('Tải ảnh lên thất bại!');
      }
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi khi tải ảnh!');
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - 160px)',
      border: '1px solid var(--gray-200)',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: 'var(--shadow)',
      background: '#fff'
    }}>
      {/* Left panel: Contacts */}
      <div style={{
        width: '320px',
        borderRight: '1px solid var(--gray-200)',
        display: 'flex',
        flexDirection: 'column',
        background: '#fff'
      }}>
        <div style={{
          padding: '16px',
          borderBottom: '1px solid var(--gray-200)',
          fontWeight: 700,
          fontSize: '18px'
        }}>
          Tin nhắn của tôi
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {contacts.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--gray-400)', fontSize: '14px' }}>
              Chưa có liên hệ nào. Hãy đăng ký khóa học để trò chuyện!
            </div>
          ) : (
            contacts.map(c => {
              const isActive = activeContact && activeContact.id === c.id && activeContact.courseId === c.courseId;
              const letter = (c.displayName || 'U')[0].toUpperCase();
              return (
                <div
                  key={`${c.id}-${c.courseId}`}
                  onClick={() => setActiveContact(c)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    cursor: 'pointer',
                    background: isActive ? 'var(--blue-light)' : 'transparent',
                    borderBottom: '1px solid var(--gray-100)',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--gray-50)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--blue)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    flexShrink: 0
                  }}>
                    {letter}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.displayName}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--gray-600)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                      [{c.courseTitle}]
                    </div>
                  </div>
                  {/* Unread badge */}
                  {c.unreadCount > 0 && (
                    <div style={{
                      background: '#EF4444',
                      color: '#fff',
                      borderRadius: '50%',
                      minWidth: '20px',
                      height: '20px',
                      padding: '0 6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {c.unreadCount}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right panel: Chat area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--gray-50)'
      }}>
        {activeContact ? (
          <>
            {/* Active Contact Header */}
            <div style={{
              padding: '12px 24px',
              background: '#fff',
              borderBottom: '1px solid var(--gray-200)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--blue)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700
              }}>
                {(activeContact.displayName || 'U')[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px' }}>{activeContact.displayName}</div>
                <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>Khóa học: {activeContact.courseTitle}</div>
              </div>
            </div>

            {/* Message List */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {messages.map(msg => {
                const isMyMessage = msg.senderId === user.id;
                const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      justifyContent: isMyMessage ? 'flex-end' : 'flex-start',
                      alignItems: 'flex-end',
                      gap: '8px'
                    }}
                  >
                    {!isMyMessage && (
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'var(--blue)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '11px',
                        flexShrink: 0
                      }}>
                        {(activeContact.displayName || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMyMessage ? 'flex-end' : 'flex-start', maxWidth: '60%' }}>
                      <div style={{
                        padding: msg.imageUrl ? '8px' : '10px 16px',
                        borderRadius: '12px',
                        background: isMyMessage ? 'var(--blue)' : '#fff',
                        color: isMyMessage ? '#fff' : 'var(--gray-800)',
                        border: isMyMessage ? 'none' : '1px solid var(--gray-200)',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        fontSize: '14px',
                        lineHeight: 1.5,
                        borderTopRightRadius: isMyMessage ? '2px' : '12px',
                        borderTopLeftRadius: !isMyMessage ? '2px' : '12px',
                        overflow: 'hidden'
                      }}>
                        {msg.imageUrl ? (
                          <img
                            src={msg.imageUrl}
                            alt="Chat attachment"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '260px',
                              borderRadius: '8px',
                              display: 'block',
                              objectFit: 'contain'
                            }}
                          />
                        ) : (
                          msg.content
                        )}
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--gray-400)', marginTop: '4px', padding: '0 4px' }}>
                        {timeStr}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div style={{
              padding: '16px 24px',
              background: '#fff',
              borderTop: '1px solid var(--gray-200)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {/* Attach Image Button */}
              <button
                onClick={triggerFileInput}
                disabled={uploading}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'var(--gray-100)',
                  border: 'none',
                  color: 'var(--gray-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-200)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--gray-100)'}
              >
                {uploading ? (
                  <div style={{ width: '16px', height: '16px', border: '2px solid var(--gray-400)', borderTopColor: 'var(--blue)', borderRadius: '50%', animation: 'shimmer 1s infinite linear' }} />
                ) : (
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />

              {/* Text Input */}
              <input
                type="text"
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
                placeholder="Nhập tin nhắn..."
                style={{
                  flex: 1,
                  height: '40px',
                  border: '1px solid var(--gray-200)',
                  borderRadius: '20px',
                  padding: '0 20px',
                  fontSize: '14px',
                  outline: 'none',
                  background: 'var(--gray-50)'
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--blue)'; e.target.style.background = '#fff'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--gray-200)'; e.target.style.background = 'var(--gray-50)'; }}
              />

              {/* Send Button */}
              <button
                onClick={handleSend}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'var(--blue)',
                  border: 'none',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--blue-dark)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--blue)'}
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="m22 2-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 2 11 13" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--gray-400)',
            gap: '12px'
          }}>
            <svg width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div style={{ fontSize: '15px', fontWeight: 500 }}>Chọn một liên hệ từ danh sách để bắt đầu cuộc trò chuyện.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
