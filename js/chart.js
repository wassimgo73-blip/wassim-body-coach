// Tiny dependency-free SVG charts (single series): line and bar, with hover/tap tooltip.
// Colors come from CSS custom properties so light/dark themes both work.

const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs = {}) => {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
  return n;
};

function niceRange(min, max, ticks = 4) {
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const span = max - min;
  const raw = span / ticks;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((s) => s * mag).find((s) => s >= raw) || raw;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const out = [];
  for (let v = lo; v <= hi + step / 2; v += step) out.push(Math.round(v * 100) / 100);
  return { lo, hi, ticks: out };
}

/**
 * @param {HTMLElement} container
 * @param {{label:string, value:number}[]} data
 * @param {{type:'line'|'bar', unit:string, fmt:(n)=>string, ariaLabel:string}} opts
 */
export function renderChart(container, data, opts) {
  container.innerHTML = '';
  container.setAttribute('dir', 'ltr'); // time flows left→right in both languages
  const W = 340;
  const H = 180;
  const pad = { t: 14, r: 12, b: 26, l: 38 };
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const fmt = opts.fmt || ((n) => String(n));

  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': opts.ariaLabel, class: 'chart-svg' });
  const values = data.map((d) => d.value);
  let lo;
  let hi;
  let ticks;
  if (opts.type === 'bar') {
    ({ lo, hi, ticks } = niceRange(0, Math.max(3, ...values), 3));
  } else {
    const mn = Math.min(...values);
    const mx = Math.max(...values);
    const padV = Math.max(0.5, (mx - mn) * 0.15);
    ({ lo, hi, ticks } = niceRange(mn - padV, mx + padV, 4));
  }
  const y = (v) => pad.t + ih - ((v - lo) / (hi - lo)) * ih;
  const n = data.length;
  const band = iw / Math.max(1, n);
  const x = (i) => (opts.type === 'bar' ? pad.l + band * i + band / 2 : pad.l + (n === 1 ? iw / 2 : (iw * i) / (n - 1)));

  // grid + y labels
  for (const tv of ticks) {
    const yy = y(tv);
    svg.append(el('line', { x1: pad.l, x2: W - pad.r, y1: yy, y2: yy, class: 'chart-grid' }));
    const tx = el('text', { x: pad.l - 6, y: yy + 3.5, 'text-anchor': 'end', class: 'chart-axis' });
    tx.textContent = fmt(tv);
    svg.append(tx);
  }

  // x labels — show at most ~5 to avoid collisions
  const every = Math.max(1, Math.ceil(n / 5));
  data.forEach((d, i) => {
    if (i % every !== 0 && i !== n - 1) return;
    if (i !== n - 1 && n - 1 - i < every) return;
    const tx = el('text', { x: x(i), y: H - 8, 'text-anchor': 'middle', class: 'chart-axis' });
    tx.textContent = d.label;
    svg.append(tx);
  });

  if (opts.type === 'bar') {
    const bw = Math.min(26, band - 6);
    data.forEach((d, i) => {
      if (d.value <= 0) return;
      const top = y(d.value);
      const h = y(lo) - top;
      const r = Math.min(4, bw / 2, h);
      const x0 = x(i) - bw / 2;
      const base = y(lo);
      // rounded top, square baseline
      const path = `M${x0},${base} V${top + r} Q${x0},${top} ${x0 + r},${top} H${x0 + bw - r} Q${x0 + bw},${top} ${x0 + bw},${top + r} V${base} Z`;
      svg.append(el('path', { d: path, class: 'chart-bar' }));
    });
    svg.append(el('line', { x1: pad.l, x2: W - pad.r, y1: y(lo), y2: y(lo), class: 'chart-baseline' }));
  } else {
    const pts = data.map((d, i) => `${x(i)},${y(d.value)}`).join(' ');
    svg.append(el('polyline', { points: pts, class: 'chart-line' }));
    data.forEach((d, i) => svg.append(el('circle', { cx: x(i), cy: y(d.value), r: 4, class: 'chart-dot' })));
    // direct label on the latest point only
    const last = data[n - 1];
    const lt = el('text', { x: x(n - 1), y: y(last.value) - 9, 'text-anchor': n > 1 ? 'end' : 'middle', class: 'chart-label' });
    lt.textContent = `${fmt(last.value)} ${opts.unit}`;
    svg.append(lt);
  }

  // hover layer
  const cross = el('line', { y1: pad.t, y2: pad.t + ih, class: 'chart-cross', visibility: 'hidden' });
  svg.append(cross);
  const hit = el('rect', { x: pad.l, y: pad.t, width: iw, height: ih, fill: 'transparent' });
  svg.append(hit);
  const tip = document.createElement('div');
  tip.className = 'chart-tip';
  tip.hidden = true;

  const show = (evt) => {
    const rect = svg.getBoundingClientRect();
    const px = ((evt.clientX - rect.left) / rect.width) * W;
    let best = 0;
    let bd = Infinity;
    data.forEach((_, i) => {
      const dd = Math.abs(x(i) - px);
      if (dd < bd) {
        bd = dd;
        best = i;
      }
    });
    const d = data[best];
    cross.setAttribute('x1', x(best));
    cross.setAttribute('x2', x(best));
    cross.setAttribute('visibility', 'visible');
    tip.hidden = false;
    tip.innerHTML = `<span>${d.label}</span><b>${fmt(d.value)} ${opts.unit}</b>`;
    const left = (x(best) / W) * 100;
    tip.style.left = `${Math.min(80, Math.max(20, left))}%`;
    tip.style.top = `${(y(d.value) / H) * 100}%`;
  };
  const hide = () => {
    tip.hidden = true;
    cross.setAttribute('visibility', 'hidden');
  };
  hit.addEventListener('pointermove', show);
  hit.addEventListener('pointerdown', show);
  hit.addEventListener('pointerleave', hide);

  const wrap = document.createElement('div');
  wrap.className = 'chart-wrap';
  wrap.append(svg, tip);
  container.append(wrap);
}
