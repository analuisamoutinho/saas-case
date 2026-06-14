'use client'

import { useState } from 'react'

export function PdfExportButton({ targetId }: { targetId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const jsPDF = (await import('jspdf')).default

      const element = document.getElementById(targetId)
      if (!element) return

      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        logging: false,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      })

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
      pdf.save('diagnostico-360.pdf')
    } catch (err) {
      console.error('Erro ao gerar PDF:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:border-gray-500 hover:text-gray-900 transition-colors disabled:opacity-50"
    >
      {loading ? 'Gerando PDF...' : '↓ Exportar PDF'}
    </button>
  )
}
