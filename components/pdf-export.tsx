'use client'

import { Button } from '@/components/ui/button'

export function PDFExportButton() {
  async function handleExport() {
    const { default: jsPDF } = await import('jspdf')
    const { default: html2canvas } = await import('html2canvas')

    const element = document.getElementById('diagnostico-content')
    if (!element) return

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
    const imgX = (pdfWidth - imgWidth * ratio) / 2
    const imgY = 0

    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
    pdf.save('diagnostico-360.pdf')
  }

  return (
    <Button onClick={handleExport} variant="outline">
      Exportar PDF
    </Button>
  )
}
