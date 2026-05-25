import { useState, useEffect } from 'react';
import { parseCSV, parseDeveloper, parseProject } from '../utils/csv.js';

// In-memory cache so navigating between tabs doesn't re-fetch
let _cache = null;

export function useData() {
  const [developers, setDevelopers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (_cache) {
      setDevelopers(_cache.developers);
      setProjects(_cache.projects);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch('/api/data')
      .then(r => {
        if (!r.ok) throw new Error(`API returned ${r.status}`);
        return r.json();
      })
      .then(({ developers: devCsv, projects: projCsv }) => {
        if (cancelled) return;
        const devs  = parseCSV(devCsv).map(parseDeveloper);
        const projs = parseCSV(projCsv).map(parseProject);
        _cache = { developers: devs, projects: projs };
        setDevelopers(devs);
        setProjects(projs);
        setLoading(false);
      })
      .catch(err => {
        if (cancelled) return;
        console.error('Data load failed:', err);
        setError(err.message);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return { developers, projects, loading, error };
}
