// Parses a CSV string into an array of objects keyed by the header row.
// Handles quoted fields containing commas and newlines.
export function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = splitCSVLine(lines[0]);
  return lines.slice(1).map(line => {
    const vals = splitCSVLine(line);
    const obj = {};
    headers.forEach((h, i) => { obj[h.trim()] = (vals[i] || '').trim(); });
    return obj;
  });
}

function splitCSVLine(line) {
  const vals = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (ch === ',' && !inQ) {
      vals.push(cur); cur = '';
    } else {
      cur += ch;
    }
  }
  vals.push(cur);
  return vals;
}

// Parses a developer row from the sheet into the shape the UI expects.
export function parseDeveloper(row, i) {
  return {
    id: i + 1,
    name: row.name || '',
    type: row.type || '',
    region: row.region || '',
    website: row.website || '',
    linkedin: row.linkedin || '',
    description: row.description || '',
    focus: row.focus ? row.focus.split(';').map(s => s.trim()).filter(Boolean) : [],
    tags: row.tags ? row.tags.split(';').map(s => s.trim()).filter(Boolean) : [],
    collaborators: row.collaborators ? row.collaborators.split(';').map(s => s.trim()).filter(Boolean) : [],
    image: row.image_url || '',
    key_people: row.key_people
      ? row.key_people.split(';').map(s => {
          const [name, role, linkedin] = s.split('|');
          return { name: name?.trim() || '', role: role?.trim() || '', linkedin: linkedin?.trim() || '' };
        }).filter(p => p.name)
      : [],
  };
}

// Parses a project row from the sheet into the shape the UI expects.
export function parseProject(row, i) {
  return {
    id: i + 1,
    name: row.name || '',
    developer: row.developer || '',
    category: row.category || '',
    status: row.status || '',
    location: row.location || '',
    lat: parseFloat(row.lat) || null,
    lng: parseFloat(row.lng) || null,
    homes: parseInt(row.homes) || 0,
    hectares: parseFloat(row.hectares) || 0,
    description: row.description || '',
    notes: row.notes || '',
    year_start: row.year_start || '',
    year_complete: row.year_complete || '',
    website: row.website || '',
    image: row.image_url || '',
  };
}
// Updated parsers — add developer_ids and projects fields

export function parseDeveloperV2(row, i) {
  const base = parseDeveloper(row, i);
  return {
    ...base,
    projects: row.projects ? row.projects.split(';').map(s => s.trim()).filter(Boolean) : [],
  };
}

export function parseProjectV2(row, i) {
  const base = parseProject(row, i);
  return {
    ...base,
    developer_ids: row.developer_ids ? row.developer_ids.split(';').map(s => s.trim()).filter(Boolean) : [],
  };
}
