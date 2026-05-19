import api from '../api'

class StudentItemReceiptService {
  async openPreview(path) {
    const data = await api.get(path, { responseType: 'blob' })
    const blob = new Blob([data], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 60000)
  }

  async downloadPdf(path, filename = 'nota.pdf') {
    const data = await api.get(path, { responseType: 'blob' })
    const blob = new Blob([data], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }
}

export default new StudentItemReceiptService()
