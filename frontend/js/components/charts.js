// Small, dependency-free SVG chart helpers. Framework-agnostic strings so
// they drop straight into the innerHTML-based components.

const COLOR_CYCLE = ['var(--marker-yellow)', 'var(--marker-mint)', 'var(--marker-coral)', 'var(--marker-blue)']

/**
 * Donut chart. segments: [{ label, value, color? }]
 * Renders an SVG ring plus a small legend underneath.
 */
export function renderDonutChart(segments, { size = 180, thickness = 22, centerLabel = '', centerSub = '' } = {}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  const r = (size - thickness) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r

  let offset = 0
  const arcs = segments.map((seg, i) => {
    const color = seg.color || COLOR_CYCLE[i % COLOR_CYCLE.length]
    const fraction = total > 0 ? seg.value / total : 0
    const dash = fraction * circumference
    const gap = circumference - dash
    const rotation = (offset / total) * 360 - 90
    offset += seg.value
    return `<circle
      cx="${cx}" cy="${cy}" r="${r}"
      fill="none"
      stroke="${color}"
      stroke-width="${thickness}"
      stroke-dasharray="${dash} ${gap}"
      stroke-linecap="butt"
      transform="rotate(${rotation} ${cx} ${cy})"
    />`
  }).join('')

  const emptyRing = total === 0
    ? `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--ink-600)" stroke-width="${thickness}" />`
    : ''

  return `
    <div style="display:flex; align-items:center; gap:20px; flex-wrap:wrap;">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="Task status breakdown">
        ${emptyRing}
        ${arcs}
        <text x="${cx}" y="${cy - 4}" text-anchor="middle" font-family="var(--font-display)" font-size="22" font-weight="700" fill="var(--paper)">${centerLabel}</text>
        <text x="${cx}" y="${cy + 16}" text-anchor="middle" font-family="var(--font-body)" font-size="11" fill="var(--paper-dim)">${centerSub}</text>
      </svg>
      <div style="display:flex; flex-direction:column; gap:8px;">
        ${segments.map((seg, i) => `
          <div style="display:flex; align-items:center; gap:8px; font-size:var(--text-sm);">
            <span style="width:10px; height:10px; border-radius:3px; background:${seg.color || COLOR_CYCLE[i % COLOR_CYCLE.length]}; display:inline-block;"></span>
            <span style="color:var(--paper-dim);">${seg.label}</span>
            <span style="font-weight:600;">${seg.value}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `
}

/**
 * Vertical bar chart. bars: [{ label, value, max?, color? }]
 * Values are rendered as percentage-height bars against a shared max.
 */
export function renderBarChart(bars, { height = 160, barWidth = 44 } = {}) {
  const maxValue = Math.max(1, ...bars.map(b => b.max ?? 100))
  const width = bars.length * (barWidth + 24) + 24

  const columns = bars.map((b, i) => {
    const color = b.color || COLOR_CYCLE[i % COLOR_CYCLE.length]
    const barHeight = Math.max(2, (b.value / maxValue) * (height - 30))
    const x = 24 + i * (barWidth + 24)
    const y = height - barHeight - 22
    return `
      <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="6" fill="${color}" opacity="0.9" />
      <text x="${x + barWidth / 2}" y="${height - 22 - barHeight - 8}" text-anchor="middle" font-family="var(--font-display)" font-size="13" font-weight="700" fill="var(--paper)">${b.value}%</text>
      <text x="${x + barWidth / 2}" y="${height - 4}" text-anchor="middle" font-family="var(--font-body)" font-size="11" fill="var(--paper-dim)">${b.label}</text>
    `
  }).join('')

  const baseline = `<line x1="0" y1="${height - 22}" x2="${width}" y2="${height - 22}" stroke="var(--ink-600)" stroke-width="1" />`

  return `
    <svg width="100%" viewBox="0 0 ${width} ${height}" role="img" aria-label="Completion by subject" style="max-width:${width}px;">
      ${baseline}
      ${columns}
    </svg>
  `
}
