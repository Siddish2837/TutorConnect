import { useRef, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

export default function Whiteboard({ bookingId, token }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [tool, setTool] = useState('pencil');
  const [color, setColor] = useState('#6366f1');
  const [lineWidth, setLineWidth] = useState(3);
  const [drawing, setDrawing] = useState(false);
  const [socket, setSocket] = useState(null);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : '';
    const s = io(`${apiUrl}/whiteboard`, { auth: { token } });
    setSocket(s);
    s.emit('join_session', { bookingId });
    s.on('draw', (data) => remoteDraw(data));
    s.on('clear_canvas', () => clearLocal());
    return () => s.disconnect();
  }, [bookingId, token]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = 440;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctxRef.current = ctx;
  }, []);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    if (e.touches) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e) => {
    setDrawing(true);
    const pos = getPos(e);
    lastPos.current = pos;
  };

  const draw = useCallback((e) => {
    if (!drawing || !ctxRef.current) return;
    const pos = getPos(e);
    const ctx = ctxRef.current;
    const drawColor = tool === 'eraser' ? '#0f0f1a' : color;
    const width = tool === 'eraser' ? lineWidth * 4 : lineWidth;

    ctx.beginPath();
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.strokeStyle = drawColor;
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    const drawData = { x: pos.x, y: pos.y, lx: lastPos.current.x, ly: lastPos.current.y, color: drawColor, width };
    socket?.emit('draw', { bookingId, drawData });
    lastPos.current = pos;
  }, [drawing, tool, color, lineWidth, socket, bookingId]);

  const remoteDraw = ({ x, y, lx, ly, color: c, width: w }) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.beginPath();
    ctx.lineWidth = w;
    ctx.lineCap = 'round';
    ctx.strokeStyle = c;
    ctx.moveTo(lx, ly);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const clearLocal = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!ctx || !canvas) return;
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const clearCanvas = () => {
    clearLocal();
    socket?.emit('clear_canvas', { bookingId });
  };

  const saveCanvas = () => {
    const link = document.createElement('a');
    link.download = `session-${bookingId}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const tools = [
    { id: 'pencil', label: '✏️ Pencil' },
    { id: 'eraser', label: '⬜ Eraser' },
  ];

  return (
    <div style={{ background: '#0f0f1a', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
      {/* Toolbar */}
      <div style={{ background: '#16213e', padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {tools.map(t => (
          <button key={t.id} onClick={() => setTool(t.id)} style={{
            padding: '0.4rem 0.85rem', borderRadius: 'var(--radius)', border: 'none', cursor: 'pointer',
            fontSize: '0.8rem', fontWeight: 500,
            background: tool === t.id ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
            color: '#e0e0e0', transition: 'var(--transition)',
          }}>{t.label}</button>
        ))}
        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
          style={{ width: 32, height: 28, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 4 }} />
        <input type="range" min={1} max={20} value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value))}
          style={{ width: 80 }} />
        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{lineWidth}px</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <button onClick={clearCanvas} style={{ padding: '0.4rem 0.75rem', borderRadius: 'var(--radius)', border: 'none', cursor: 'pointer', fontSize: '0.8rem', background: 'rgba(239,68,68,0.2)', color: '#fca5a5' }}>🗑️ Clear</button>
          <button onClick={saveCanvas} style={{ padding: '0.4rem 0.75rem', borderRadius: 'var(--radius)', border: 'none', cursor: 'pointer', fontSize: '0.8rem', background: 'rgba(16,185,129,0.2)', color: '#6ee7b7' }}>💾 Save</button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: 440, display: 'block', cursor: tool === 'eraser' ? 'cell' : 'crosshair', touchAction: 'none' }}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={() => setDrawing(false)}
        onMouseLeave={() => setDrawing(false)}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={() => setDrawing(false)}
      />
    </div>
  );
}
