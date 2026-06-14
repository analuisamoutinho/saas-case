'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

type StatusData = {
  id: string
  nome: string
  status: string
  progresso: string | null
}

const stepLabels = [
  'Iniciando Agente DNA...',
  'Agente DNA concluído. Iniciando Score de Maturidade...',
  'Score de Maturidade concluído. Identificando gargalo principal...',
  'Radar de Gargalos concluído. Gerando Playbook de 90 dias...',
  'Diagnóstico 360° concluído!',
]

function getProgressPercent(progresso: string | null): number {
  if (!progresso) return 0
  const idx = stepLabels.findIndex((s) => progresso.includes(s.split('.')[0]))
  if (idx === -1) return 10
  return Math.round(((idx + 1) / stepLabels.length) * 100)
}

export default function ClientePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [data, setData] = useState<StatusData | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const fetchStatus = useCallback(async () => {
    const res = await fetch(`/api/clientes/${id}/status`)
    if (!res.ok) return
    const json = await res.json()
    setData(json)
    if (json.status === 'concluido') {
      router.push(`/clientes/${id}/diagnostico`)
    }
  }, [id, router])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  useEffect(() => {
    if (!data) return
    if (data.status !== 'processando') return
    const interval = setInterval(fetchStatus, 3000)
    return () => clearInterval(interval)
  }, [data, fetchStatus])

  async function handleGerar() {
    setGenerating(true)
    setError('')
    try {
      await fetch(`/api/clientes/${id}/gerar`, { method: 'POST' })
      // Start polling
      setData((prev) => prev ? { ...prev, status: 'processando', progresso: 'Iniciando Agente DNA...' } : prev)
    } catch {
      setError('Erro ao iniciar diagnóstico. Tente novamente.')
      setGenerating(false)
    }
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Carregando...</div>
      </div>
    )
  }

  const progress = getProgressPercent(data.progresso)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">
            ← Clientes
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-medium text-gray-700">{data.nome}</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-2xl mx-auto mb-4">
            {data.nome.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{data.nome}</h1>

          {data.status === 'novo' && (
            <div className="mt-8">
              <p className="text-gray-500 mb-6">
                Transcrição salva. Clique abaixo para iniciar o Diagnóstico 360° com os 4 agentes de IA.
              </p>
              <div className="bg-white border border-gray-200 rounded-xl p-6 text-left mb-6 max-w-md mx-auto">
                <p className="text-sm font-medium text-gray-700 mb-3">O sistema vai executar:</p>
                <div className="space-y-2">
                  {['🧬 Agente DNA — perfil + voz do cliente', '📊 Agente Score — maturidade em 6 áreas', '🎯 Agente Radar — gargalo principal', '📋 Agente Playbook — plano de 90 dias'].map((step) => (
                    <div key={step} className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 mb-4 max-w-md mx-auto">
                  {error}
                </div>
              )}
              <button
                onClick={handleGerar}
                disabled={generating}
                className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {generating ? 'Iniciando...' : 'Gerar Diagnóstico 360° →'}
              </button>
            </div>
          )}

          {data.status === 'processando' && (
            <div className="mt-8 max-w-md mx-auto">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-sm font-medium text-blue-700">Processando diagnóstico...</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                  <div
                    className="bg-black h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">{data.progresso || 'Iniciando...'}</p>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Esta etapa pode levar 1-2 minutos. A página atualiza automaticamente.
              </p>
            </div>
          )}

          {data.status === 'erro' && (
            <div className="mt-8 max-w-md mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <p className="text-sm font-medium text-red-700 mb-2">Erro no processamento</p>
                <p className="text-xs text-red-600">{data.progresso}</p>
              </div>
              <button
                onClick={handleGerar}
                disabled={generating}
                className="mt-4 bg-black text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
