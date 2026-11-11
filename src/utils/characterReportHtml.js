const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const fmt = (d) => (d ? new Date(d).toLocaleDateString('id-ID') : '-')

const section = (title, head, rows, empty) => `
  <h3>${title}</h3>
  <table>
    <thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${rows.length ? rows.join('') : `<tr><td colspan="${head.length}" class="empty">${empty}</td></tr>`}</tbody>
  </table>`

const renderOne = ({ reportData: d, notes }) => {
  const s = d.summary
  const pos = d.positiveNotes.map(p => `<tr><td>${fmt(p.date)}</td><td>${esc(p.type)}</td><td>${esc([p.category, p.description].filter(Boolean).join(' / ') || '-')}</td><td class="r">+${p.points}</td></tr>`)
  const ach = d.achievements.map(a => `<tr><td>${fmt(a.date)}</td><td>${esc(a.title)}</td><td>${esc(a.level)}</td><td>${esc(a.rank)}</td><td class="r">+${a.points}</td></tr>`)
  const vio = d.violations.map(v => `<tr><td>${fmt(v.date)}</td><td>${esc(v.description ? `${v.type} / ${v.description}` : v.type)}</td><td>${esc(v.level)}</td><td class="r">-${v.points}</td></tr>`)
  const noteHtml = notes && notes.trim()
    ? `<p class="note">${esc(notes).replace(/\n/g, '<br>')}</p>`
    : '<div class="lines"><div></div><div></div><div></div><div></div></div>'
  return `
  <section class="page">
    <h2>RAPOR KARAKTER SISWA</h2>
    <div class="grid">
      <div>
        <h3>IDENTITAS SISWA</h3>
        <p><b>Nama Lengkap</b>: ${esc(d.student.name)}</p>
        <p><b>NIS</b>: ${esc(d.student.nis || '-')}</p>
        <p><b>Kelas</b>: ${esc(d.student.class_name || '-')}</p>
        <p><b>Tahun Ajaran</b>: ${esc(d.student.active_academic_year)}</p>
      </div>
      <div>
        <h3>RINGKASAN NILAI KARAKTER</h3>
        <p><b>Poin Prestasi</b>: +${s.total_achievement_points}</p>
        <p><b>Poin Catatan Positif</b>: +${s.total_positive_points}</p>
        <p><b>Poin Pelanggaran</b>: -${s.total_violation_points}</p>
        <p><b>Nilai Karakter Akhir</b>: ${s.final_score}</p>
      </div>
    </div>
    ${section('CATATAN POSITIF', ['Tanggal', 'Nama Catatan', 'Kategori / Keterangan', 'Poin'], pos, 'Belum ada catatan positif tercatat.')}
    ${section('RIWAYAT PRESTASI', ['Tanggal', 'Nama / Judul', 'Tingkat', 'Juara', 'Poin'], ach, 'Belum ada data prestasi tercatat.')}
    ${section('RIWAYAT PELANGGARAN', ['Tanggal', 'Jenis / Kronologi', 'Level', 'Poin'], vio, 'Tidak ada catatan pelanggaran.')}
    <h3>CATATAN PEMBINAAN</h3>
    ${noteHtml}
    <div class="sign">
      <p>Dicetak pada tanggal: ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      <p>Mengetahui,<br>Wakil Kepala Bid. Kesiswaan</p>
      <p class="name"><b>Rendy Yani Susanto, S.Pd</b></p>
    </div>
  </section>`
}

export const buildCharacterReportsHtml = (entries) => `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Rapor Karakter</title>
<style>
  @page { size: A4; margin: 15mm; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #1f2937; margin: 0; }
  .page { page-break-after: always; }
  .page:last-child { page-break-after: auto; }
  h2 { text-align: center; font-size: 14px; margin: 0 0 14px; }
  h3 { font-size: 11px; margin: 14px 0 6px; padding: 3px 0; border-top: 1px dashed #000; border-bottom: 1px dashed #000; }
  p { margin: 2px 0; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #f3f4f6; text-align: left; }
  th, td { padding: 4px 6px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
  .r { text-align: right; white-space: nowrap; }
  .empty { font-style: italic; }
  .note { text-align: justify; line-height: 1.6; }
  .lines div { height: 22px; border-bottom: 1px dotted #6b7280; }
  .sign { margin-top: 24px; margin-left: 60%; }
  .sign .name { margin-top: 50px; }
</style></head><body>${entries.map(renderOne).join('')}</body></html>`

export const printHtml = (html) => {
  const w = window.open('', '_blank')
  if (!w) return false
  w.document.open()
  w.document.write(html)
  w.document.close()
  w.focus()
  setTimeout(() => w.print(), 400)
  return true
}
