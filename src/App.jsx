import { useState, useEffect, useCallback, useRef } from 'react';
import { useData } from './hooks/useData.js';

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const CAT_LABELS = {
  new_town: 'New Town', estate_regen: 'Estate Regen', city_centre: 'City Centre',
  waterfront: 'Waterfront', innovation: 'Innovation', heritage: 'Heritage',
};
const STATUS_LABELS = {
  planning: 'Planning', approved: 'Approved',
  under_construction: 'Under Construction', complete: 'Complete',
};
const CAT_COLORS = {
  new_town:     ['#dbeafe','#1e40af'], estate_regen: ['#fce7f3','#9d174d'],
  city_centre:  ['#fef3c7','#92400e'], waterfront:   ['#d1fae5','#065f46'],
  innovation:   ['#ede9fe','#5b21b6'], heritage:     ['#ffedd5','#9a3412'],
};
const STATUS_COLORS = {
  planning:         ['#e0f2fe','#075985'], approved:  ['#e8d5f3','#4a235a'],
  under_construction: ['#fef9c3','#713f12'], complete: ['#dcfce7','#14532d'],
};
const TYPE_COLORS = {
  'Developer':             ['#fef3c7','#92400e'],
  'Housing Association':   ['#fce7f3','#9d174d'],
  'Development Corporation': ['#dbeafe','#1e40af'],
  'Great Estate':          ['#d1fae5','#065f46'],
};
const MAP_CAT_COLORS = {
  new_town:'#3b82f6', estate_regen:'#ec4899', city_centre:'#e8b84b',
  waterfront:'#10b981', innovation:'#8b5cf6', heritage:'#d97706',
};
const FOCUS_TAGS = [
  'Affordable housing','Build-to-rent','Estate regeneration','Heritage retrofit',
  'Industrial & logistics','Mixed-use','Student accommodation','Waterfront',
];

function pill(bg, color, text, small) {
  return (
    <span style={{
      background: bg, color, fontSize: small ? '0.58rem' : '0.63rem',
      fontWeight: 700, padding: small ? '0.08rem 0.35rem' : '0.12rem 0.45rem',
      borderRadius: 99, letterSpacing: '0.04em', textTransform: 'uppercase',
      whiteSpace: 'nowrap', flexShrink: 0,
    }}>{text}</span>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const { developers, projects, loading, error } = useData();
  const [tab, setTab] = useState('developers');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState(new Set());
  const [catFilter, setCatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDev, setSelectedDev] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [news, setNews] = useState({});
  const [newsLoading, setNewsLoading] = useState(false);

  const fetchNews = useCallback(async (name) => {
    if (news[name] !== undefined) return;
    setNewsLoading(true);
    try {
      const r = await fetch(`/api/news?q=${encodeURIComponent(name)}`);
      const data = r.ok ? await r.json() : { items: [] };
      setNews(prev => ({ ...prev, [name]: data.items || [] }));
    } catch { setNews(prev => ({ ...prev, [name]: [] })); }
    setNewsLoading(false);
  }, [news]);

  const openDev = (dev) => { setSelectedDev(dev); fetchNews(dev.name); };

  const filteredDevs = developers.filter(d => {
    if (typeFilter !== 'all' && d.type !== typeFilter) return false;
    if (tagFilter.size > 0 && !Array.from(tagFilter).some(t => d.tags.includes(t))) return false;
    if (search) return [d.name, d.region, d.description, ...d.tags].join(' ').toLowerCase().includes(search.toLowerCase());
    return true;
  }).sort((a, b) => a.name.localeCompare(b.name));

  const filteredProjects = projects.filter(p => {
    if (catFilter !== 'all' && p.category !== catFilter) return false;
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (search) return [p.name, p.location, p.developer, p.description].join(' ').toLowerCase().includes(search.toLowerCase());
    return true;
  });

  const toggleTag = (t) => setTagFilter(prev => {
    const s = new Set(prev); s.has(t) ? s.delete(t) : s.add(t); return s;
  });

  return (
    <div style={{ fontFamily: "'Spectral', Georgia, serif", background: '#f4f0e8', minHeight: '100vh', color: '#1a1814' }}>
      <style>{globalStyles}</style>

      {/* HEADER */}
      <header className="header">
        <div className="logo">
          The Developer Index
          <span style={{ opacity: 0.3, fontWeight: 300, margin: '0 0.5rem' }}>|</span>
          <span className="logo-sub">UK Regeneration Intelligence</span>
        </div>
        <div className="sans" style={{ fontSize: '0.68rem', color: '#3a3530' }}>
          {new Date().toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short', year:'numeric' }).toUpperCase()}
        </div>
      </header>

      {/* INTRO */}
      <div style={{ background: '#1a1814', color: 'rgba(255,255,255,0.65)', padding: '0.55rem 2rem', fontFamily: 'var(--sans)', fontSize: '0.78rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <span><strong style={{ color: '#fff' }}>The Developer Index</strong> — a directory of leading developers working in urban property, regeneration and placemaking across the UK.</span>
        <span style={{ marginLeft: 'auto', whiteSpace: 'nowrap', color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>
          {loading ? 'Loading…' : `${developers.length} developers · ${projects.length} projects`}
        </span>
      </div>

      {/* TABS */}
      <nav style={{ background: '#1a1814', display: 'flex', position: 'sticky', top: 0, zIndex: 99, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {[['developers','Developers',developers.length],['projects','Live Projects',projects.length]].map(([key,label,count]) => (
          <button key={key} onClick={() => setTab(key)} className={`tab-btn ${tab===key?'tab-active':''}`}>
            {label}
            <span className="tab-count">{loading ? '—' : count}</span>
          </button>
        ))}
      </nav>

      {/* FILTER BAR */}
      <div className="filter-bar">
        <div style={{ flex: 1, minWidth: 240, position: 'relative', display: 'flex', alignItems: 'center' }}>
          <span style={{ position: 'absolute', left: '0.7rem', fontSize: '0.9rem', color: '#9a948e', pointerEvents: 'none' }}>🔍</span>
          <input
            className="search-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={tab === 'developers' ? 'Search developers, regions, specialisms…' : 'Search projects, locations, developers…'}
          />
          {search && <button onClick={() => setSearch('')} className="search-clear">✕</button>}
        </div>

        {tab === 'developers' && (
          <div className="filter-group">
            <span className="filter-label">Type</span>
            {['all','Developer','Housing Association','Development Corporation','Great Estate'].map(t => (
              <button key={t} onClick={() => setTypeFilter(t)} className={`chip ${typeFilter===t?'active':''}`}>
                {t === 'all' ? 'All' : t === 'Housing Association' ? 'Housing Assoc' : t === 'Development Corporation' ? 'Dev Corp' : t === 'Great Estate' ? 'Estate' : t}
              </button>
            ))}
          </div>
        )}
        {tab === 'projects' && (
          <>
            <div className="filter-group">
              <span className="filter-label">Category</span>
              {['all',...Object.keys(CAT_LABELS)].map(c => (
                <button key={c} onClick={() => setCatFilter(c)} className={`chip ${catFilter===c?'active':''}`}>
                  {c === 'all' ? 'All' : CAT_LABELS[c]}
                </button>
              ))}
            </div>
            <div className="filter-group">
              <span className="filter-label">Status</span>
              {['all',...Object.keys(STATUS_LABELS)].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)} className={`chip ${statusFilter===s?'active':''}`}>
                  {s === 'all' ? 'All' : STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </>
        )}
        <div className="results-meta">
          {tab === 'developers' ? `${filteredDevs.length} organisations` : `${filteredProjects.length} projects`}
        </div>
      </div>

      {/* MAIN */}
      <main style={{ padding: '1.5rem 2rem 5rem' }}>
        {loading && <LoadingState />}
        {error && <ErrorState message={error} />}

        {!loading && !error && tab === 'developers' && (
          <>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              {FOCUS_TAGS.map(tag => (
                <button key={tag} onClick={() => toggleTag(tag)} className={`chip sm ${tagFilter.has(tag)?'active':''}`}>{tag}</button>
              ))}
            </div>
            {filteredDevs.length === 0
              ? <EmptyState text="No organisations match your filters." />
              : <div className="card-grid">
                  {filteredDevs.map(dev => <DevCard key={dev.id} dev={dev} onClick={() => openDev(dev)} />)}
                </div>
            }
          </>
        )}

        {!loading && !error && tab === 'projects' && (
          <ProjectsTab
            projects={filteredProjects}
            onSelect={setSelectedProject}
          />
        )}
      </main>

      {/* PANELS */}
      {selectedDev && (
        <>
          <div className="overlay" onClick={() => setSelectedDev(null)} />
          <DevPanel dev={selectedDev} news={news[selectedDev.name]} newsLoading={newsLoading}
            projects={projects} onClose={() => setSelectedDev(null)}
            onSelectProject={p => { setSelectedProject(p); setSelectedDev(null); }} />
        </>
      )}
      {selectedProject && (
        <>
          <div className="overlay" onClick={() => setSelectedProject(null)} />
          <ProjectPanel project={selectedProject} developers={developers}
            onClose={() => setSelectedProject(null)}
            onOpenDev={name => { const d = developers.find(x=>x.name===name); if(d){ setSelectedProject(null); openDev(d); }}} />
        </>
      )}
    </div>
  );
}

// ─── DEVELOPER CARD ───────────────────────────────────────────────────────────
function DevCard({ dev, onClick }) {
  const [typeBg, typeColor] = TYPE_COLORS[dev.type] || ['#f3f4f6','#374151'];
  return (
    <div className="dev-card" onClick={onClick}>
      {dev.image && <img src={dev.image} alt={dev.name} className="card-img" onError={e => e.target.style.display='none'} />}
      <div style={{ padding: '0.9rem 1rem 0.85rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <span className="dev-name">{dev.name}</span>
          {pill(typeBg, typeColor, dev.type === 'Housing Association' ? 'Housing Assoc' : dev.type === 'Development Corporation' ? 'Dev Corp' : dev.type === 'Great Estate' ? 'Estate' : 'Developer')}
        </div>
        <div className="sans" style={{ fontSize: '0.67rem', color: '#9a948e' }}>{dev.region}</div>
        <p className="sans" style={{ fontSize: '0.77rem', color: '#3a3530', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{dev.description}</p>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: '0.1rem' }}>
          {dev.tags.slice(0, 3).map(t => <span key={t} className="tag">{t}</span>)}
          {dev.tags.length > 3 && <span style={{ fontFamily: 'var(--sans)', fontSize: '0.59rem', color: '#9a948e' }}>+{dev.tags.length-3} more</span>}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: '0.2rem' }}>
          {dev.website && <a href={dev.website} target="_blank" rel="noopener" onClick={e=>e.stopPropagation()} className="card-link">Website ↗</a>}
          {dev.linkedin && <a href={dev.linkedin} target="_blank" rel="noopener" onClick={e=>e.stopPropagation()} className="card-link li">in LinkedIn ↗</a>}
        </div>
      </div>
    </div>
  );
}

// ─── DEVELOPER PANEL ──────────────────────────────────────────────────────────
function DevPanel({ dev, news, newsLoading, projects, onClose, onSelectProject }) {
  const devProjects = projects.filter(p =>
    (p.developer_ids && p.developer_ids.includes(dev.name)) ||
    p.developer === dev.name
  );
  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">{dev.name}</h2>
          <div className="sans" style={{ fontSize: '0.72rem', color: '#9a948e' }}>{dev.region}</div>
        </div>
        <button onClick={onClose} className="close-btn">✕</button>
      </div>
      <div style={{ padding: '1.25rem 1.5rem 3rem' }}>
        {dev.image && <img src={dev.image} alt={dev.name} style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 6, marginBottom: '1rem' }} onError={e=>e.target.style.display='none'} />}
        <p className="sans" style={{ fontSize: '0.84rem', color: '#3a3530', lineHeight: 1.7, marginBottom: '1rem' }}>{dev.description}</p>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: '1rem' }}>
          {dev.tags.map(t => <span key={t} className="tag">{t}</span>)}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          {dev.website && <a href={dev.website} target="_blank" rel="noopener" className="panel-btn">Website ↗</a>}
          {dev.linkedin && <a href={dev.linkedin} target="_blank" rel="noopener" className="panel-btn li">in LinkedIn ↗</a>}
        </div>

        {dev.focus.length > 0 && (
          <Section label="Focus Areas">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {dev.focus.map(f => <span key={f} style={{ fontFamily: 'var(--sans)', fontSize: '0.71rem', background: 'rgba(232,184,75,0.12)', border: '1px solid rgba(232,184,75,0.4)', color: '#3a3530', padding: '0.1rem 0.45rem', borderRadius: 9 }}>{f}</span>)}
            </div>
          </Section>
        )}

        {dev.key_people.length > 0 && (
          <Section label="Key People">
            {dev.key_people.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.45rem 0', borderTop: i > 0 ? '1px solid #ebe6da' : 'none' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(232,184,75,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--sans)', fontSize: '0.65rem', fontWeight: 600, color: '#c9952a', flexShrink: 0 }}>
                  {p.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="sans" style={{ fontSize: '0.8rem', fontWeight: 500, color: '#1a1814' }}>{p.name}</div>
                  <div className="sans" style={{ fontSize: '0.7rem', color: '#6a6560' }}>{p.role}</div>
                </div>
                {p.linkedin && <a href={p.linkedin} target="_blank" rel="noopener" className="card-link li">in ↗</a>}
              </div>
            ))}
          </Section>
        )}

        {devProjects.length > 0 && (
          <Section label={`Projects (${devProjects.length})`}>
            {devProjects.map((p, i) => {
              const [catBg, catColor] = CAT_COLORS[p.category] || ['#f3f4f6','#374151'];
              const [stBg, stColor] = STATUS_COLORS[p.status] || ['#f3f4f6','#374151'];
              return (
                <div key={i} onClick={() => onSelectProject(p)} style={{ padding: '0.7rem 0.75rem', borderRadius: 6, border: '1.5px solid #ddd8cf', background: '#fff', cursor: 'pointer', marginBottom: 6, transition: 'border-color 0.12s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor='#c9952a'}
                  onMouseLeave={e => e.currentTarget.style.borderColor='#ddd8cf'}>
                  {p.image && <img src={p.image} alt={p.name} style={{ width:'100%', height:80, objectFit:'cover', borderRadius:4, marginBottom:6 }} onError={e=>e.target.style.display='none'} />}
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:6, marginBottom:4 }}>
                    <span className="sans" style={{ fontSize:'0.83rem', fontWeight:500, color:'#1a1814', lineHeight:1.3 }}>{p.name}</span>
                    <div style={{ display:'flex', gap:3, flexShrink:0 }}>
                      {pill(catBg, catColor, CAT_LABELS[p.category] || p.category, true)}
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:3 }}>
                    {pill(stBg, stColor, STATUS_LABELS[p.status] || p.status, true)}
                  </div>
                  <div className="sans" style={{ fontSize:'0.71rem', color:'#9a948e' }}>📍 {p.location}</div>
                  {(p.homes > 0 || p.hectares > 0 || p.year_complete) && (
                    <div className="sans" style={{ fontSize:'0.69rem', color:'#6a6560', marginTop:3, display:'flex', gap:8 }}>
                      {p.homes > 0 && <span>{p.homes.toLocaleString()} homes</span>}
                      {p.hectares > 0 && <span>{p.hectares} ha</span>}
                      {p.year_complete && <span>Est. {p.year_complete}</span>}
                    </div>
                  )}
                  <span className="sans" style={{ fontSize:'0.65rem', color:'#c9952a', marginTop:4, display:'block' }}>View project details →</span>
                </div>
              );
            })}
          </Section>
        )}

        <Section label="Latest News">
          {newsLoading && <div className="sans" style={{ fontSize: '0.78rem', color: '#9a948e' }}>Loading news…</div>}
          {!newsLoading && !news && <div className="sans" style={{ fontSize: '0.78rem', color: '#9a948e' }}>News unavailable.</div>}
          {!newsLoading && news?.length === 0 && <div className="sans" style={{ fontSize: '0.78rem', color: '#9a948e' }}>No recent news found.</div>}
          {!newsLoading && news?.map((item, i) => (
            <div key={i} style={{ padding: '0.35rem 0', borderTop: i > 0 ? '1px solid #ebe6da' : 'none' }}>
              <a href={item.link} target="_blank" rel="noopener" className="sans" style={{ fontSize: '0.77rem', color: '#1a1814', textDecoration: 'none', lineHeight: 1.45, display: 'block' }}>{item.title}</a>
              <div className="sans" style={{ fontSize: '0.66rem', color: '#9a948e', marginTop: 2 }}>
                {item.source && <span>{item.source} · </span>}
                {item.pubDate && new Date(item.pubDate).toLocaleDateString('en-GB', { day:'numeric', month:'short' })}
              </div>
            </div>
          ))}
        </Section>
      </div>
    </div>
  );
}

// ─── PROJECTS TAB ─────────────────────────────────────────────────────────────
function ProjectsTab({ projects, onSelect }) {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markers = useRef([]);

  // Single effect: load Leaflet script if needed, then init map once BOTH
  // the script is loaded AND the DOM ref is attached (poll until both ready).
  useEffect(() => {
    let pollTimer = null;

    const initMap = () => {
      if (leafletMap.current) return; // already initialised
      if (!mapRef.current || !window.L) return; // not ready yet
      const L = window.L;
      leafletMap.current = L.map(mapRef.current, { scrollWheelZoom: false }).setView([52.5, -1.5], 6);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO', maxZoom: 19,
      }).addTo(leafletMap.current);
    };

    const startPolling = () => {
      pollTimer = setInterval(() => {
        if (mapRef.current && window.L) {
          clearInterval(pollTimer);
          initMap();
        }
      }, 100);
    };

    if (window.L) {
      // Script already loaded — still poll for ref to be attached
      startPolling();
    } else {
      // Load Leaflet, then start polling for ref
      if (!document.querySelector('script[src*="leaflet"]')) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.min.js';
        script.onload = startPolling;
        document.head.appendChild(script);
      } else {
        // Script tag exists but not loaded yet
        startPolling();
      }
    }

    return () => {
      clearInterval(pollTimer);
    };
  }, []); // runs once on mount

  useEffect(() => {
    if (!leafletMap.current || !window.L) return;
    const L = window.L;
    markers.current.forEach(m => m.remove());
    markers.current = [];
    projects.forEach(p => {
      if (!p.lat || !p.lng || isNaN(p.lat)) return;
      const col = MAP_CAT_COLORS[p.category] || '#e8b84b';
      const m = L.circleMarker([p.lat, p.lng], { radius: 7, color: col, fillColor: col, fillOpacity: 0.8, weight: 2 }).addTo(leafletMap.current);
      m.bindPopup(`<div style="min-width:180px;font-family:sans-serif"><strong style="font-size:.85rem">${p.name}</strong><br><span style="font-size:.75rem;color:#666">${p.developer}</span><br><span style="font-size:.73rem">${p.location}</span></div>`, { maxWidth: 240 });
      m.on('click', () => onSelect(p));
      markers.current.push(m);
    });
  }, [projects, onSelect]);

  return (
    <div>
      <div style={{ border: '1px solid #d8d2c5', borderRadius: 6, overflow: 'hidden', marginBottom: '1.25rem' }}>
        <div ref={mapRef} style={{ height: 320, width: '100%', background: '#e8e4de' }} />
      </div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {Object.entries(MAP_CAT_COLORS).map(([cat, col]) => (
          <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--sans)', fontSize: '0.7rem', color: '#3a3530' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: col, display: 'inline-block' }} />
            {CAT_LABELS[cat]}
          </div>
        ))}
      </div>
      <div className="card-grid">
        {projects.map(p => <ProjectCard key={p.id || p.name} project={p} onClick={() => onSelect(p)} />)}
      </div>
      {projects.length === 0 && <EmptyState text="No projects match your filters." />}
    </div>
  );
}

// ─── PROJECT CARD ─────────────────────────────────────────────────────────────
function ProjectCard({ project: p, onClick }) {
  const [catBg, catColor] = CAT_COLORS[p.category] || ['#f3f4f6','#374151'];
  const [stBg, stColor] = STATUS_COLORS[p.status] || ['#f3f4f6','#374151'];
  // Show up to 2 linked developer names, falling back to the raw developer field
  const devDisplay = (p.developer_ids && p.developer_ids.length > 0)
    ? p.developer_ids.slice(0, 2).join(', ') + (p.developer_ids.length > 2 ? ` +${p.developer_ids.length - 2}` : '')
    : p.developer;
  return (
    <div className="proj-card" onClick={onClick}>
      {p.image && <img src={p.image} alt={p.name} className="card-img" onError={e=>e.target.style.display='none'} />}
      <div style={{ padding: '0.9rem 1rem 0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: '0.35rem' }}>
          <span className="dev-name">{p.name}</span>
          {pill(catBg, catColor, CAT_LABELS[p.category] || p.category)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.3rem' }}>
          {pill(stBg, stColor, STATUS_LABELS[p.status] || p.status, true)}
          <span className="sans" style={{ fontSize: '0.71rem', color: '#9a948e' }}>{devDisplay}</span>
        </div>
        <div className="sans" style={{ fontSize: '0.71rem', color: '#9a948e', marginBottom: '0.35rem' }}>📍 {p.location}</div>
        <p className="sans" style={{ fontSize: '0.77rem', color: '#3a3530', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '0.4rem' }}>{p.description}</p>
        <div style={{ display: 'flex', gap: 8, fontFamily: 'var(--sans)', fontSize: '0.69rem', color: '#6a6560' }}>
          {p.homes > 0 && <span>{p.homes.toLocaleString()} homes</span>}
          {p.hectares > 0 && <span>{p.hectares} ha</span>}
          {p.year_start && p.year_complete && <span>{p.year_start}–{p.year_complete}</span>}
        </div>
      </div>
    </div>
  );
}

// ─── PROJECT PANEL ────────────────────────────────────────────────────────────
function ProjectPanel({ project: p, developers, onClose, onOpenDev }) {
  const mapRef = useRef(null);
  const [catBg, catColor] = CAT_COLORS[p.category] || ['#f3f4f6','#374151'];
  const [stBg, stColor] = STATUS_COLORS[p.status] || ['#f3f4f6','#374151'];
  const linkedDevs = (p.developer_ids && p.developer_ids.length > 0)
    ? p.developer_ids.map(id => developers.find(d => d.name === id)).filter(Boolean)
    : developers.filter(d => d.name === p.developer || p.developer === d.name).slice(0, 1);

  useEffect(() => {
    const init = () => {
      if (!mapRef.current || !window.L || !p.lat || !p.lng) return;
      const L = window.L;
      const map = L.map(mapRef.current, { scrollWheelZoom: false }).setView([p.lat, p.lng], 14);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '© OpenStreetMap © CARTO', maxZoom: 19 }).addTo(map);
      L.circleMarker([p.lat, p.lng], { radius: 10, color: '#e8b84b', fillColor: '#e8b84b', fillOpacity: 0.9, weight: 3 }).addTo(map);
      return () => map.remove();
    };
    const cleanup = init();
    return cleanup;
  }, [p.lat, p.lng]);

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <div style={{ display: 'flex', gap: 6, marginBottom: '0.3rem' }}>
            {pill(catBg, catColor, CAT_LABELS[p.category])}
            {pill(stBg, stColor, STATUS_LABELS[p.status])}
          </div>
          <h2 className="panel-title">{p.name}</h2>
        </div>
        <button onClick={onClose} className="close-btn">✕</button>
      </div>
      <div style={{ padding: '1.25rem 1.5rem 3rem' }}>
        {p.image && <img src={p.image} alt={p.name} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 6, marginBottom: '1rem' }} onError={e=>e.target.style.display='none'} />}
        <p className="sans" style={{ fontSize: '0.84rem', color: '#3a3530', lineHeight: 1.7, marginBottom: '1rem' }}>{p.description}</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: '1.25rem' }}>
          {[
            ['Homes', p.homes > 0 ? p.homes.toLocaleString() : '—'],
            ['Hectares', p.hectares > 0 ? `${p.hectares} ha` : '—'],
            ['Timeline', p.year_start && p.year_complete ? `${p.year_start}–${p.year_complete}` : '—'],
          ].map(([label, val]) => (
            <div key={label} style={{ background: '#ebe6da', padding: '0.65rem 0.75rem', borderRadius: 6 }}>
              <div className="sans" style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9a948e', marginBottom: 2 }}>{label}</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', fontWeight: 400, color: '#1a1814' }}>{val}</div>
            </div>
          ))}
        </div>

        <div className="sans" style={{ fontSize: '0.8rem', color: '#3a3530', marginBottom: '1rem' }}>📍 {p.location}</div>

        {p.lat && p.lng && (
          <div ref={mapRef} style={{ height: 220, borderRadius: 6, overflow: 'hidden', marginBottom: '1.25rem', background: '#e8e4de' }} />
        )}

        {linkedDevs.length > 0 && (
          <div style={{ borderTop: '2px solid #ebe6da', paddingTop: '1rem', marginBottom: '1rem' }}>
            <div className="sans" style={{ fontSize: '0.67rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9a948e', marginBottom: '0.55rem' }}>
              {linkedDevs.length === 1 ? 'Developer' : 'Developers'}
            </div>
            {linkedDevs.map((dev, i) => (
              <button key={i} onClick={() => onOpenDev(dev.name)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', background: '#fff', border: '1.5px solid #d8d2c5', borderRadius: 6, padding: '0.65rem 0.85rem', cursor: 'pointer', textAlign: 'left', marginBottom: 6 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: '0.9rem', color: '#1a1814', marginBottom: 2 }}>{dev.name}</div>
                  <div className="sans" style={{ fontSize: '0.7rem', color: '#9a948e' }}>{dev.region}</div>
                </div>
                <span className="sans" style={{ fontSize: '0.7rem', color: '#c9952a', whiteSpace: 'nowrap' }}>View profile →</span>
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {p.website && <a href={p.website} target="_blank" rel="noopener" className="panel-btn">Project Website ↗</a>}
        </div>

        {p.notes && (
          <div className="sans" style={{ fontSize: '0.75rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 5, padding: '0.4rem 0.6rem', color: '#856404', marginTop: '1rem', lineHeight: 1.55 }}>
            ⚠️ {p.notes}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function Section({ label, children }) {
  return (
    <div style={{ marginBottom: '1.25rem', borderTop: '2px solid #ebe6da', paddingTop: '1rem' }}>
      <div className="sans" style={{ fontSize: '0.67rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9a948e', marginBottom: '0.55rem' }}>{label}</div>
      {children}
    </div>
  );
}
function LoadingState() {
  return (
    <div style={{ padding: '5rem 2rem', textAlign: 'center' }}>
      <div className="sans" style={{ fontSize: '0.88rem', color: '#9a948e', marginBottom: '1.5rem' }}>Loading data…</div>
      <div style={{ width: 200, height: 2, background: '#d8d2c5', margin: '0 auto', overflow: 'hidden' }}>
        <div style={{ height: '100%', background: '#e8b84b', animation: 'loadSlide 1.6s ease-in-out infinite', width: '40%' }} />
      </div>
    </div>
  );
}
function ErrorState({ message }) {
  return (
    <div style={{ padding: '4rem 2rem', textAlign: 'center', fontFamily: 'var(--sans)', fontSize: '0.9rem', color: '#c8301c' }}>
      ⚠️ Could not load data: {message}
    </div>
  );
}
function EmptyState({ text }) {
  return <div style={{ padding: '4rem 2rem', textAlign: 'center', fontFamily: 'var(--sans)', fontSize: '0.9rem', color: '#9a948e' }}>{text}</div>;
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const globalStyles = `
  :root { --serif: 'Spectral', Georgia, serif; --sans: 'Inter', system-ui, sans-serif; --amber: #e8b84b; --amber-dark: #c9952a; }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { -webkit-font-smoothing: antialiased; }
  a { color: inherit; }
  button { cursor: pointer; font-family: inherit; }
  .sans { font-family: var(--sans); }

  .header { background: var(--amber); padding: 0 2rem; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; height: 56px; border-bottom: 2px solid var(--amber-dark); }
  .logo { font-family: var(--serif); font-size: 1.15rem; font-weight: 300; display: flex; align-items: center; gap: 0; }
  .logo-sub { font-family: var(--sans); font-size: 0.65rem; font-weight: 600; color: #3a3530; letter-spacing: 0.1em; text-transform: uppercase; }

  .tab-btn { padding: 0 1.75rem; height: 46px; display: flex; align-items: center; gap: 8px; font-family: var(--sans); font-size: 0.83rem; font-weight: 500; background: none; border: none; border-bottom: 3px solid transparent; color: rgba(255,255,255,0.45); transition: color 0.15s, border-color 0.15s; white-space: nowrap; letter-spacing: 0.01em; }
  .tab-btn:hover { color: rgba(255,255,255,0.8); }
  .tab-active { color: #fff !important; border-bottom-color: var(--amber) !important; }
  .tab-count { font-size: 0.62rem; padding: 0.1rem 0.45rem; border-radius: 10px; background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.35); min-width: 1.6rem; text-align: center; }
  .tab-active .tab-count { background: rgba(255,255,255,0.18); color: #fff; }

  .filter-bar { background: #ebe6da; border-bottom: 2px solid #d8d2c5; padding: 0.75rem 2rem; display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
  .search-input { width: 100%; padding: 0.55rem 2rem 0.55rem 2.3rem; background: #fff; border: 1.5px solid #d8d2c5; border-radius: 0; font-family: var(--sans); font-size: 0.88rem; color: #1a1814; outline: none; transition: border-color 0.15s; }
  .search-input:focus { border-color: #1a1814; }
  .search-input::placeholder { color: #9a948e; }
  .search-clear { position: absolute; right: 0.6rem; background: none; border: none; color: #9a948e; font-size: 0.8rem; padding: 0.2rem; }
  .filter-group { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
  .filter-label { font-family: var(--sans); font-size: 0.73rem; font-weight: 500; color: #3a3530; white-space: nowrap; }
  .results-meta { margin-left: auto; font-family: var(--sans); font-size: 0.78rem; color: #9a948e; white-space: nowrap; }

  .chip { font-family: var(--sans); font-size: 0.73rem; padding: 0.22rem 0.7rem; border: 1.5px solid #d8d2c5; background: #fff; color: #3a3530; border-radius: 0; transition: all 0.1s; white-space: nowrap; }
  .chip:hover { border-color: #3a3530; color: #1a1814; }
  .chip.active { background: #1a1814; color: #fff; border-color: #1a1814; }
  .chip.sm { font-size: 0.69rem; padding: 0.18rem 0.6rem; }

  .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 0.75rem; }
  .dev-card { background: #fff; border: 1.5px solid #ddd8cf; border-radius: 8px; cursor: pointer; overflow: hidden; display: flex; flex-direction: column; transition: all 0.15s; }
  .dev-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.1); transform: translateY(-1px); }
  .proj-card { background: #fff; border: 1.5px solid #ddd8cf; border-radius: 8px; cursor: pointer; overflow: hidden; transition: all 0.15s; }
  .proj-card:hover { border-color: var(--amber-dark); }
  .card-img { width: 100%; height: 110px; object-fit: cover; }
  .dev-name { font-family: var(--serif); font-size: 0.92rem; font-weight: 400; line-height: 1.3; color: #1a1814; }
  .tag { font-family: var(--sans); font-size: 0.59rem; background: #ebe6da; border: 1px solid #d8d2c5; color: #3a3530; padding: 0.07rem 0.32rem; border-radius: 8px; }
  .card-link { font-family: var(--sans); font-size: 0.68rem; color: var(--amber-dark); text-decoration: none; }
  .card-link.li { color: #0077b5; }

  .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.25); z-index: 200; }
  .panel { position: fixed; top: 0; right: 0; width: 520px; max-width: 96vw; height: 100vh; background: #fff; z-index: 300; overflow-y: auto; box-shadow: -4px 0 32px rgba(0,0,0,0.12); }
  .panel-header { padding: 1.25rem 1.5rem 1rem; border-bottom: 2px solid #ebe6da; background: #ebe6da; position: sticky; top: 0; display: flex; justify-content: space-between; align-items: flex-start; }
  .panel-title { font-family: var(--serif); font-size: 1.25rem; font-weight: 400; line-height: 1.25; color: #1a1814; }
  .close-btn { background: #fff; border: 1px solid #d8d2c5; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; color: #3a3530; flex-shrink: 0; margin-left: 12px; }
  .panel-btn { font-family: var(--sans); font-size: 0.73rem; font-weight: 500; padding: 0.3rem 0.75rem; border-radius: 5px; text-decoration: none; border: 1.5px solid #d8d2c5; color: #3a3530; background: #fff; cursor: pointer; display: inline-flex; align-items: center; transition: all 0.12s; }
  .panel-btn:hover { background: #ebe6da; }
  .panel-btn.li { color: #0077b5; }

  @keyframes loadSlide { 0% { transform: translateX(-300%) } 100% { transform: translateX(500%) } }
  @media (max-width: 768px) { .card-grid { grid-template-columns: 1fr; } .panel { width: 100%; } }
`;
