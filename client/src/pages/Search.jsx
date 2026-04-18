import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getTutors, getSubjects } from '../services/tutorService';
import TutorCard from '../components/TutorCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tutors, setTutors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const [filters, setFilters] = useState({
    subject: searchParams.get('subject') || '',
    minRating: '', maxPrice: '', name: '',
  });

  const fetchTutors = async (f = filters, p = page) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 12 };
      if (f.subject) params.subject = f.subject;
      if (f.minRating) params.minRating = f.minRating;
      if (f.maxPrice) params.maxPrice = f.maxPrice;
      if (f.name) params.name = f.name;
      const { data } = await getTutors(params);
      setTutors(data.tutors || []);
      setTotal(data.total || 0);
    } catch { setTutors([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTutors(); }, [page, filters]);
  useEffect(() => { getSubjects().then(r => setSubjects(r.data)).catch(() => {}); }, []);

  const update = (key, val) => {
    const newF = { ...filters, [key]: val };
    setFilters(newF);
    setPage(1);
    fetchTutors(newF, 1);
  };

  const reset = () => {
    const newF = { subject: '', minRating: '', maxPrice: '', name: '' };
    setFilters(newF);
    setPage(1);
    fetchTutors(newF, 1);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Find Your Perfect Tutor</h1>
        <p className="page-sub">Browse {total} verified expert tutors</p>
      </div>

      {/* Search Bar */}
      <div className="glass" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', border: '1px solid var(--border-accent)' }}>
        <div className="form-group" style={{ flex: '1 1 160px' }}>
          <label className="form-label">Subject</label>
          <select className="form-select" value={filters.subject} onChange={(e) => update('subject', e.target.value)}>
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            {['Mathematics','Physics','Chemistry','Biology','English','Programming','Data Science','Web Development','Hindi','Telugu'].map(s => (
              subjects.includes(s) ? null : <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="form-group" style={{ flex: '1 1 140px' }}>
          <label className="form-label">Min Rating</label>
          <select className="form-select" value={filters.minRating} onChange={(e) => update('minRating', e.target.value)}>
            <option value="">Any Rating</option>
            <option value="4.5">4.5+</option>
            <option value="4">4.0+</option>
            <option value="3.5">3.5+</option>
          </select>
        </div>
        <div className="form-group" style={{ flex: '1 1 140px' }}>
          <label className="form-label">Max Price (₹/hr)</label>
          <select className="form-select" value={filters.maxPrice} onChange={(e) => update('maxPrice', e.target.value)}>
            <option value="">Any Price</option>
            <option value="300">Up to ₹300</option>
            <option value="500">Up to ₹500</option>
            <option value="800">Up to ₹800</option>
          </select>
        </div>
        <div className="form-group" style={{ flex: '1 1 180px' }}>
          <label className="form-label">Search Name</label>
          <input className="form-input" placeholder="Search tutor name..." value={filters.name}
            onChange={(e) => update('name', e.target.value)} />
        </div>
        <button className="btn btn-ghost btn-sm" onClick={reset}>Reset</button>
      </div>

      {/* Results */}
      {loading ? <LoadingSpinner /> : tutors.length ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {tutors.map(t => <TutorCard key={t.id} tutor={t} />)}
          </div>
          {/* Pagination */}
          {total > 12 && (
            <div className="flex-center mt-6 gap-2">
              <button className="btn btn-ghost btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <span className="text-sm text-muted">Page {page} of {Math.ceil(total / 12)}</span>
              <button className="btn btn-ghost btn-sm" disabled={page >= Math.ceil(total / 12)} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No tutors found</h3>
          <p>Try adjusting your filters or search term</p>
          <button className="btn btn-primary mt-4" onClick={reset}>Clear Filters</button>
        </div>
      )}
    </div>
  );
}
