'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NovoClientePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    nome: '',
    transcricao: '',
    materialAdicional: '',
    faturamentoAlvo: '',
    prazo: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome.trim() || !form.transcricao.trim()) {
      setError('Nome e transcrição são obrigatórios.')
      return
    }
    setLoading(true)
    setError('')

    const body: Record<string, unknown> = {
      nome: form.nome.trim(),
      transcricao: form.transcricao.trim(),
    }

    if (form.materialAdicional.trim()) {
      body.materiais = [{ tipo: 'material_adicional', conteudo: form.materialAdicional.trim() }]
    }

    if (form.faturamentoAlvo || form.prazo) {
      body.meta = {
        faturamento_alvo: form.faturamentoAlvo || null,
        prazo: form.prazo || null,
      }
    }

    try {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao criar cliente')
      router.push(`/clientes/${data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">
            ← Clientes
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-medium text-gray-700">Novo Cliente</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Novo Cliente</h1>
          <p className="text-gray-500 mt-1">
            Cole a transcrição da reunião de onboarding para gerar o Diagnóstico 360°
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
            <h2 className="font-semibold text-gray-900">Dados do Cliente</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do cliente / empresa <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Ex: Loja da Maria, Clínica Saúde Total..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta de faturamento
                </label>
                <input
                  type="text"
                  value={form.faturamentoAlvo}
                  onChange={(e) => setForm({ ...form, faturamentoAlvo: e.target.value })}
                  placeholder="Ex: R$ 100.000/mês"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prazo para a meta
                </label>
                <input
                  type="text"
                  value={form.prazo}
                  onChange={(e) => setForm({ ...form, prazo: e.target.value })}
                  placeholder="Ex: 6 meses, dezembro/2025"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
            <h2 className="font-semibold text-gray-900">Transcrição da Call</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transcrição completa <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.transcricao}
                onChange={(e) => setForm({ ...form, transcricao: e.target.value })}
                placeholder="Cole aqui a transcrição completa da reunião de onboarding. Quanto mais detalhada, melhor o diagnóstico. Inclua as falas do cliente com as próprias palavras que ele usou para descrever seus problemas, desejos e objetivos."
                rows={12}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-y font-mono"
              />
              <p className="text-xs text-gray-400 mt-1">
                {form.transcricao.length > 0
                  ? `${form.transcricao.length.toLocaleString()} caracteres`
                  : 'Mínimo recomendado: 1.000 caracteres'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Material adicional
                <span className="text-gray-400 font-normal ml-1">(opcional)</span>
              </label>
              <textarea
                value={form.materialAdicional}
                onChange={(e) => setForm({ ...form, materialAdicional: e.target.value })}
                placeholder="Cole aqui textos do site, descrição de produtos/serviços, dados de vendas, resultados de campanhas anteriores ou qualquer outro material relevante."
                rows={6}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-y"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-black text-white py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : 'Salvar e preparar diagnóstico →'}
            </button>
            <Link
              href="/"
              className="px-6 py-3 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-gray-400 transition-colors"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
