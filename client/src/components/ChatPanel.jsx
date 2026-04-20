import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { getConversations, getConversation } from '../services/chatService';

export default function ChatPanel({ initialUserId = null }) {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : '';
    const s = io(`${apiUrl}/chat`, { auth: { token } });
    setSocket(s);
    s.on('new_message', (msg) => setMessages(prev => [...prev, msg]));
    s.on('typing', ({ userId, isTyping }) => { if (userId !== user?.id) setTyping(isTyping); });
    return () => s.disconnect();
  }, [token]);

  useEffect(() => {
    getConversations().then(r => setConversations(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openConversation = async (convUser) => {
    setActiveUser(convUser);
    socket?.emit('join_conversation', { otherId: convUser.id });
    const { data } = await getConversation(convUser.id);
    setMessages(data);
  };

  const sendMessage = () => {
    if (!input.trim() || !activeUser || !socket) return;
    socket.emit('send_message', { receiverId: activeUser.id, content: input });
    setInput('');
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    socket?.emit('typing', { receiverId: activeUser?.id, isTyping: true });
    setTimeout(() => socket?.emit('typing', { receiverId: activeUser?.id, isTyping: false }), 1000);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 0, height: 520, border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      {/* Conversations list */}
      <div style={{ borderRight: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>
          Conversations
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {conversations.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.875rem' }}>
              No conversations yet
            </div>
          ) : conversations.map(({ user: u, lastMessage, unread }) => (
            <div
              key={u.id}
              onClick={() => openConversation(u)}
              style={{
                padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: 10,
                cursor: 'pointer', borderBottom: '1px solid var(--border)',
                background: activeUser?.id === u.id ? 'var(--primary-light)' : 'transparent',
                transition: 'var(--transition)',
              }}
            >
              <div className="avatar" style={{ width: 40, height: 40, fontSize: '0.8rem', background: u.avatar_color || 'var(--primary)', flexShrink: 0 }}>
                {u.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)' }}>{u.name}</div>
                <div className="truncate" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {lastMessage?.content || 'Start a conversation'}
                </div>
              </div>
              {unread > 0 && <span style={{ background: 'var(--primary)', color: '#fff', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px' }}>{unread}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg-3)' }}>
        {activeUser ? (
          <>
            <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)' }}>
              <div style={{ width: 10, height: 10, background: 'var(--success)', borderRadius: '50%' }} />
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>{activeUser.name}</span>
              {typing && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>typing...</span>}
            </div>

            <div className="chat-container flex-1">
              {messages.map((m, i) => {
                const mine = m.sender_id === user?.id;
                return (
                  <div key={i} className={`chat-row ${mine ? 'mine' : 'theirs'}`}>
                    <div className="chat-bubble" style={{ boxShadow: '0 2px 5px rgba(0,0,0,0.2), 0 0 1px rgba(255,255,255,0.05)' }}>
                      <div className="chat-text" style={{ fontSize: '0.925rem', fontWeight: 400 }}>{m.content}</div>
                      <div className="chat-meta">
                        <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {mine && <span style={{ color: 'var(--accent)', marginLeft: 4, fontSize: '0.7rem' }}>✓✓</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: '0.85rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem' }}>
              <input
                value={input}
                onChange={handleTyping}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                style={{ flex: 1, padding: '0.55rem 1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '9999px', color: 'var(--text)', fontSize: '0.875rem', outline: 'none' }}
              />
              <button className="btn btn-primary btn-sm" onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <div className="empty-state flex-center" style={{ flex: 1, flexDirection: 'column' }}>
            <div className="empty-icon">💬</div>
            <h3>Select a conversation</h3>
            <p>Choose from the left to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
