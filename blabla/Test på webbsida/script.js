const MATERIAL_META = {
  'W1501':   { label: 'Total',     color: '#4ade80' },
  'W1502':   { label: 'Glass',     color: '#60a5fa' },
  'W1503':   { label: 'Paper',     color: '#818cf8' },
  'W1504':   { label: 'Metal',     color: '#fb923c' },
  'W1505':   { label: 'Plastic',   color: '#f472b6' },
  'W1506':   { label: 'Wood',      color: '#a78bfa' },
  'W150401': { label: 'Aluminium', color: '#94a3b8' },
  'W150402': { label: 'Steel',     color: '#64748b' },
};

let rawData = null;

async function fetchData() {
  const url = 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/env_waspacr?format=JSON&lang=en&freq=A&wst_oper=REC';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function parseData(json) {
  const dims    = json.dimension;
  const vals    = json.value;
  const size    = json.size;
  const dimKeys = json.id;

  const indices = {};
  dimKeys.forEach((k, i) => {
    const cats = dims[k].category;
    indices[k] = { index: cats.index, label: cats.label, size: size[i] };
  });

  const strides = [];
  let stride = 1;
  for (let i = dimKeys.length - 1; i >= 0; i--) {
    strides.unshift(stride);
    stride *= size[i];
  }

  const lookup = {};

  for (const [flatIdx, value] of Object.entries(vals)) {
    const fi = parseInt(flatIdx);
    const coords = {};
    let rem = fi;
    dimKeys.forEach((k, i) => {
      coords[k] = Math.floor(rem / strides[i]);
      rem = rem % strides[i];
    });

    const geoCode  = Object.keys(indices['geo'].index).find(k => indices['geo'].index[k] === coords['geo']);
    const timeCode = Object.keys(indices['TIME_PERIOD'].index).find(k => indices['TIME_PERIOD'].index[k] === coords['TIME_PERIOD']);
    const wastCode = Object.keys(indices['waste'].index).find(k => indices['waste'].index[k] === coords['waste']);

    if (!geoCode || !timeCode || !wastCode) continue;
    if (!lookup[geoCode]) lookup[geoCode] = {};
    if (!lookup[geoCode][timeCode]) lookup[geoCode][timeCode] = {};
    lookup[geoCode][timeCode][wastCode] = value;
  }

  const years     = Object.keys(indices['TIME_PERIOD'].index).sort().reverse();
  const countries = Object.keys(indices['geo'].index).filter(g => lookup[g]);
  const materials = Object.keys(indices['waste'].index);

  return { lookup, geoLabels: indices['geo'].label, years, countries, materials };
}

function getColor(wasteCode) { return MATERIAL_META[wasteCode]?.color || '#6b7280'; }
function getMaterialLabel(wasteCode) { return MATERIAL_META[wasteCode]?.label || wasteCode; }
function getTarget(wasteCode) {
  return { 'W1501': 70, 'W1502': 75, 'W1503': 75, 'W1504': 70, 'W1505': 50, 'W1506': 25 }[wasteCode] ?? null;
}

function buildControls(parsed) {
  const { years, materials } = parsed;

  const yearSel = document.getElementById('yearSelect');
  years.forEach(y => {
    const opt = document.createElement('option');
    opt.value = y; opt.textContent = y;
    yearSel.appendChild(opt);
  });

  const matSel = document.getElementById('materialSelect');
  Object.keys(MATERIAL_META).filter(m => materials.includes(m)).forEach(m => {
    const opt = document.createElement('option');
    opt.value = m; opt.textContent = getMaterialLabel(m);
    matSel.appendChild(opt);
  });

  const legend = document.getElementById('materialLegend');
  ['W1501','W1502','W1503','W1504','W1505','W1506'].filter(m => materials.includes(m)).forEach(m => {
    const chip = document.createElement('div');
    chip.className = 'mat-chip active';
    chip.style.setProperty('--chip-color', getColor(m));
    chip.dataset.material = m;
    chip.innerHTML = `<div class="mat-dot"></div>${getMaterialLabel(m)}`;
    chip.addEventListener('click', () => { matSel.value = m; renderAll(); });
    legend.appendChild(chip);
  });
}

function renderKPIs(parsed, year, wasteCode) {
  const { lookup, countries, geoLabels } = parsed;
  const vals = countries.map(c => lookup[c]?.[year]?.[wasteCode]).filter(v => v != null);
  if (!vals.length) return;

  const avg    = vals.reduce((a, b) => a + b, 0) / vals.length;
  const max    = Math.max(...vals);
  const min    = Math.min(...vals);
  const target = getTarget(wasteCode);
  const aboveTarget = target ? vals.filter(v => v >= target).length : null;

  const maxCountry = geoLabels[countries.find(c => lookup[c]?.[year]?.[wasteCode] === max)] || '';
  const minCountry = geoLabels[countries.find(c => lookup[c]?.[year]?.[wasteCode] === min)] || '';

  const kpis = [
    { label: 'EU Average',          value: avg.toFixed(1) + '%', sub: `${year} · ${getMaterialLabel(wasteCode)}` },
    { label: 'Highest',             value: max.toFixed(1) + '%', sub: maxCountry },
    { label: 'Lowest',              value: min.toFixed(1) + '%', sub: minCountry },
    { label: 'Countries reporting', value: vals.length,          sub: `of ${countries.length} total` },
  ];
  if (target && aboveTarget !== null)
    kpis.push({ label: `≥ ${target}% target`, value: aboveTarget, sub: 'countries meeting target' });

  document.getElementById('kpiRow').innerHTML = kpis.map(k => `
    <div class="kpi-card">
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-value">${k.value}</div>
      <div class="kpi-sub">${k.sub}</div>
    </div>`).join('');
}

function renderBarChart(parsed, year, wasteCode) {
  const { lookup, countries, geoLabels } = parsed;
  const sort   = document.getElementById('sortSelect').value;
  const color  = getColor(wasteCode);
  const target = getTarget(wasteCode);

  let data = countries
    .map(c => ({ code: c, label: geoLabels[c] || c, val: lookup[c]?.[year]?.[wasteCode] }))
    .filter(d => d.val != null);

  if (sort === 'desc')     data.sort((a, b) => b.val - a.val);
  else if (sort === 'asc') data.sort((a, b) => a.val - b.val);
  else                     data.sort((a, b) => a.label.localeCompare(b.label));

  const maxVal = Math.max(...data.map(d => d.val), 100);
  document.getElementById('chartSubtitle').textContent = `${getMaterialLabel(wasteCode)} · ${year}`;

  document.getElementById('barChart').innerHTML = data.map(d => {
    const pct = (d.val / maxVal * 100).toFixed(2);
    const cls = d.val >= 80 ? 'high' : d.val < 50 ? 'low' : '';
    const targetLine = target
      ? `<div style="position:absolute;top:0;bottom:0;left:${(target/maxVal*100).toFixed(1)}%;width:1px;background:${color};opacity:0.4;"></div>`
      : '';
    return `
      <div class="bar-row" title="${d.label}: ${d.val.toFixed(1)}%">
        <div class="bar-country">${d.code.substring(0, 2)}</div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${pct}%;background:${color}22;border-right:2px solid ${color}"></div>
          ${targetLine}
        </div>
        <div class="bar-pct ${cls}">${d.val.toFixed(1)}%</div>
      </div>`;
  }).join('');

  const tn = document.getElementById('targetNote');
  if (target) {
    tn.style.display = 'flex';
    tn.textContent = `Policy target: ${target}% recycling rate (Directive 94/62/EC)`;
  } else {
    tn.style.display = 'none';
  }
}

function renderSparklines(parsed) {
  const { lookup, countries, geoLabels, years } = parsed;
  const wasteCode   = 'W1501';
  const color       = getColor(wasteCode);
  const sortedYears = [...years].sort();
  const grid        = document.getElementById('sparklineGrid');
  grid.innerHTML    = '';

  const countryData = countries
    .map(c => {
      const pts = sortedYears.map(y => lookup[c]?.[y]?.[wasteCode]).filter(v => v != null);
      if (pts.length < 2) return null;
      return { label: geoLabels[c] || c, pts, latest: pts[pts.length-1], prev: pts[pts.length-2] };
    })
    .filter(Boolean)
    .sort((a, b) => b.latest - a.latest);

  countryData.forEach(({ label, pts, latest, prev }) => {
    const change = latest - prev;
    const changeStr   = (change >= 0 ? '+' : '') + change.toFixed(1) + '%';
    const changeClass = change >= 0 ? 'up' : 'down';
    const W = 180, H = 40;
    const minV = Math.min(...pts), maxV = Math.max(...pts), range = maxV - minV || 1;

    const points = pts.map((v, i) => {
      const x = (i / (pts.length - 1)) * W;
      const y = H - ((v - minV) / range) * (H - 4) - 2;
      return `${x},${y}`;
    }).join(' ');

    const lastY = H - ((latest - minV) / range * (H - 4)) - 2;

    const card = document.createElement('div');
    card.className = 'spark-card';
    card.innerHTML = `
      <div class="spark-country">${label}</div>
      <div class="spark-latest" style="color:${color}">${latest.toFixed(1)}%</div>
      <div class="spark-change ${changeClass}">${changeStr} vs prev year</div>
      <svg class="sparkline" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
        <polyline points="${points}" fill="none" stroke="${color}" stroke-width="1.5"
          stroke-linejoin="round" stroke-linecap="round"/>
        <circle cx="${W}" cy="${lastY}" r="2.5" fill="${color}"/>
      </svg>`;
    grid.appendChild(card);
  });
}

function renderMaterials(parsed, year) {
  const { lookup, countries, geoLabels } = parsed;
  const grid = document.getElementById('materialsGrid');
  grid.innerHTML = '';
  document.getElementById('matSubtitle').textContent = year;

  ['W1502','W1503','W1504','W1505','W1506']
    .filter(m => countries.some(c => lookup[c]?.[year]?.[m] != null))
    .forEach(mat => {
      const vals = countries
        .map(c => ({ code: c, label: geoLabels[c] || c, val: lookup[c]?.[year]?.[mat] }))
        .filter(d => d.val != null)
        .sort((a, b) => b.val - a.val);

      if (!vals.length) return;

      const avg    = vals.reduce((a, d) => a + d.val, 0) / vals.length;
      const color  = getColor(mat);
      const target = getTarget(mat);

      const card = document.createElement('div');
      card.className = 'mat-card';
      card.innerHTML = `
        <div class="mat-card-header">
          <div class="mat-icon" style="background:${color}"></div>
          <div class="mat-card-title">${getMaterialLabel(mat)}</div>
          <div class="mat-avg" style="color:${color}">${avg.toFixed(0)}%</div>
        </div>
        ${vals.map(d => {
          const cls = target && d.val >= target ? 'high' : d.val < 40 ? 'low' : '';
          return `
            <div class="bar-row" style="margin-bottom:3px">
              <div class="bar-country" style="font-size:0.62rem">${d.code.substring(0,2)}</div>
              <div class="bar-track" style="height:12px">
                <div class="bar-fill" style="width:${Math.min(d.val,100)}%;background:${color}33;border-right:2px solid ${color}"></div>
              </div>
              <div class="bar-pct ${cls}" style="font-size:0.62rem">${d.val.toFixed(0)}%</div>
            </div>`;
        }).join('')}
        ${target ? `<div class="target-note" style="margin-top:0.5rem">Policy target: ${target}%</div>` : ''}`;
      grid.appendChild(card);
    });
}

function renderAll() {
  if (!rawData) return;
  const year      = document.getElementById('yearSelect').value;
  const wasteCode = document.getElementById('materialSelect').value;

  document.querySelectorAll('.mat-chip').forEach(chip => {
    chip.classList.toggle('active', chip.dataset.material === wasteCode);
  });

  renderKPIs(rawData, year, wasteCode);
  renderBarChart(rawData, year, wasteCode);
  renderMaterials(rawData, year);
}

async function init() {
  try {
    const json = await fetchData();
    rawData = parseData(json);

    document.getElementById('loading').style.display  = 'none';
    document.getElementById('dashboard').style.display = 'block';

    buildControls(rawData);
    renderSparklines(rawData);
    renderAll();

    document.getElementById('lastUpdated').textContent =
      `Loaded ${new Date().toLocaleDateString('en-SE')}`;

    document.getElementById('yearSelect').addEventListener('change', renderAll);
    document.getElementById('materialSelect').addEventListener('change', renderAll);
    document.getElementById('sortSelect').addEventListener('change', renderAll);

  } catch (err) {
    document.getElementById('loading').style.display = 'none';
    const errEl = document.getElementById('error-msg');
    errEl.style.display = 'block';
    errEl.innerHTML = `
      <strong>Could not load Eurostat data</strong><br><br>
      ${err.message}<br><br>
      <small>Open via a local server (e.g. VS Code Live Server extension) to avoid CORS issues.</small>`;
  }
}

init();