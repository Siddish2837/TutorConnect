import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getTutors } from '../services/tutorService';
import TutorCard from '../components/TutorCard';
import LoadingSpinner from '../components/LoadingSpinner';

const STATS = [
  { num: '1,240+', label: 'Expert Tutors', icon: '👩‍🏫', color: 'var(--primary)' },
  { num: '18,500+', label: 'Sessions Booked', icon: '📅', color: 'var(--success)' },
  { num: '95%', label: 'Satisfaction Rate', icon: '⭐', color: 'var(--warning)' },
  { num: '42+', label: 'Subjects', icon: '📚', color: 'var(--secondary)' },
];

const SUBJECTS = [
  { icon: '📐', name: 'Mathematics' }, { icon: '⚛️', name: 'Physics' },
  { icon: '🧬', name: 'Biology' }, { icon: '💻', name: 'Programming' },
  { icon: '📝', name: 'English' }, { icon: '🧪', name: 'Chemistry' },
  { icon: '📊', name: 'Data Science' }, { icon: '🌐', name: 'Web Dev' },
];

export default function Home() {
  const [featuredTutors, setFeaturedTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getTutors({ limit: 3 })
      .then(r => setFeaturedTutors(r.data.tutors || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* ── Hero ── */}
      <div style={heroStyle}>
        <div style={heroInner}>
          <div style={heroBadge}>🚀 Trusted by 18,500+ students</div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.25rem', color: '#fff' }}>
            Learn from the{' '}
            <span style={{ background: 'linear-gradient(135deg, #a5b4fc, #67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Best Tutors
            </span>{' '}
            Online
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.75)', maxWidth: 520, margin: '0 auto 2rem', lineHeight: 1.7 }}>
            Connect with expert tutors for personalized 1-on-1 sessions. Book, learn, and grow at your own pace.
          </p>
          <div className="flex gap-3 justify-center" style={{ flexWrap: 'wrap' }}>
            <Link to="/register">
              <button style={heroPrimaryBtn}>Get Started Free →</button>
            </Link>
            <Link to="/search">
              <button style={heroOutlineBtn}>Browse Tutors</button>
            </Link>
          </div>
        </div>
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: '20%', left: '10%', width: 300, height: 300, background: 'rgba(99,102,241,0.15)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 250, height: 250, background: 'rgba(139,92,246,0.12)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
      </div>

      <div className="page-container">
        {/* ── Stats ── */}
        <div className="grid-4 mb-8">
          {STATS.map((s) => (
            <div key={s.label} className="stat-card glass">
              <div className="stat-icon" style={{ background: `${s.color}20` }}>
                <span style={{ fontSize: '1.5rem' }}>{s.icon}</span>
              </div>
              <div>
                <div className="stat-num">{s.num}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Subject Browse ── */}
        <section className="section">
          <div className="section-title">Browse by Subject</div>
          <div className="grid-4">
            {SUBJECTS.map((s) => (
              <button key={s.name} onClick={() => navigate(`/search?subject=${encodeURIComponent(s.name)}`)}
                className="glass" style={{ padding: '1.25rem', cursor: 'pointer', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: 12, transition: 'var(--transition)', background: 'var(--surface)' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <span style={{ fontSize: '1.6rem' }}>{s.icon}</span>
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>{s.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ── Featured Tutors ── */}
        <section className="section">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="section-title">Featured Tutors</div>
              <p className="text-sm text-muted">Top-rated tutors this week</p>
            </div>
            <Link to="/search"><button className="btn btn-ghost btn-sm">View All →</button></Link>
          </div>
          {loading ? <LoadingSpinner /> : (
            <div className="grid-3">
              {featuredTutors.length ? featuredTutors.map(t => <TutorCard key={t.id} tutor={t} />)
                : [1,2,3].map(i => <DemoTutorCard key={i} />)}
            </div>
          )}
        </section>

        {/* ── CTA Banner ── */}
        <div style={ctaBannerStyle} className="glass">
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)' }}>Are you a Tutor?</div>
            <div className="text-sm text-muted mt-1">Join 1,200+ tutors earning from their expertise</div>
          </div>
          <Link to="/register">
            <button className="btn btn-primary">Register as Tutor →</button>
          </Link>
        </div>

        {/* ── How It Works ── */}
        <section className="section mt-8">
          <div className="section-title text-center" style={{ textAlign: 'center' }}>How TutorConnect Works</div>
          <div className="grid-3 mt-4">
            {[
              { step: '01', icon: '🔍', title: 'Find Your Tutor', desc: 'Browse verified tutors by subject, rating, and price. Read reviews from real students.' },
              { step: '02', icon: '📅', title: 'Book a Session', desc: 'Select a date, time slot, and duration. Pay securely via Razorpay.' },
              { step: '03', icon: '🎓', title: 'Start Learning', desc: 'Join your session via Google Meet. Use the live whiteboard and chat for an immersive experience.' },
            ].map((item) => (
              <div key={item.step} className="glass" style={{ padding: '2rem 1.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', fontWeight: 900, fontSize: '2.5rem', color: 'var(--border)', lineHeight: 1 }}>{item.step}</div>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{item.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)', marginBottom: '0.5rem' }}>{item.title}</div>
                <p className="text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// Placeholder card for when no tutors in DB yet
function DemoTutorCard() {
  const demos = [
    { name: 'Dr. Priya Sharma', subject: 'Mathematics', exp: 8, price: 500, rating: 4.9, reviews: 124, color: '#6366f1', tags: ['Calculus','JEE Prep','Algebra'] },
    { name: 'Rahul Verma', subject: 'Programming', exp: 5, price: 600, rating: 4.8, reviews: 89, color: '#8b5cf6', tags: ['Python','DSA','React'] },
    { name: 'Anitha Reddy', subject: 'Physics', exp: 6, price: 450, rating: 4.7, reviews: 67, color: '#10b981', tags: ['Mechanics','Optics','NEET'] },
  ];
  const t = demos[Math.floor(Math.random() * demos.length)];
  return <TutorCard tutor={{ ...t, id: 0, user: { name: t.name, avatar_color: t.color }, review_count: t.reviews }} />;
}

const heroStyle = {
  position: 'relative', overflow: 'hidden', textAlign: 'center',
  padding: '7rem 2rem 6rem',
  background: 'linear-gradient(160deg, #0f0f1f 0%, #1a1a3a 50%, #0f0f1f 100%)',
  borderBottom: '1px solid var(--border)',
};
const heroInner = { position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto' };
const heroBadge = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '6px 16px', borderRadius: '9999px',
  background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
  color: '#a5b4fc', fontSize: '0.82rem', fontWeight: 600, marginBottom: '1.5rem',
};
const heroPrimaryBtn = {
  padding: '0.85rem 2.25rem', background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
  color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontSize: '1rem', fontWeight: 700,
  cursor: 'pointer', boxShadow: '0 4px 24px rgba(99,102,241,0.4)', transition: 'var(--transition)',
};
const heroOutlineBtn = {
  padding: '0.85rem 2.25rem', background: 'rgba(255,255,255,0.05)',
  color: '#fff', border: '2px solid rgba(255,255,255,0.2)', borderRadius: 'var(--radius)', fontSize: '1rem',
  fontWeight: 600, cursor: 'pointer', transition: 'var(--transition)',
};
const ctaBannerStyle = {
  padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  flexWrap: 'wrap', gap: '1rem', borderRadius: 'var(--radius-xl)', marginBottom: '3rem',
  background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))',
  border: '1px solid var(--border-accent)',
};
