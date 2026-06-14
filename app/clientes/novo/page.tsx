'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function NovoClientePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [nome, setNome] = useState('')
  const [transcricao, setTranscricao] = useState('')
  const [faturamentoAlvo, setFaturamentoAlvo] = useState('')
  const [prazo, setPrazo] = useState('')
  const [materiaisTexto, setMateriaisTexto] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const body: Record<string, unknown> = { nome, transcricao }

      if (faturamentoAlvo || prazo) {
        body.meta = { faturamento_alvo: faturamentoAlvo, prazo }
      }

      if (materiaisTexto) {
        body.materiais = [{ tipo: 'material', conteudo: materiaisTexto }]
      }

      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()
      if (data.id) {
        router.push(`/clientes/${data.id}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Novo Cliente</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Informações Básicas</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome do Cliente *</Label>
              <Input id="nome" value={nome} onChange={e => setNome(e.target.value)} required placeholder="Ex: Empresa XYZ" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Transcrição do Onboarding</CardTitle></CardHeader>
          <CardContent>
            <Textarea
              value={transcricao}
              onChange={e => setTranscricao(e.target.value)}
              placeholder="Cole aqui a transcrição completa da reunião de onboarding..."
              className="min-h-[300px]"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Materiais Adicionais (opcional)</CardTitle></CardHeader>
          <CardContent>
            <Textarea
              value={materiaisTexto}
              onChange={e => setMateriaisTexto(e.target.value)}
              placeholder="Cole aqui textos do site, descrições de produtos, dados de vendas, etc."
              className="min-h-[150px]"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Metas (opcional)</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="faturamento">Faturamento Alvo</Label>
              <Input id="faturamento" value={faturamentoAlvo} onChange={e => setFaturamentoAlvo(e.target.value)} placeholder="Ex: R$ 100.000/mês" />
            </div>
            <div>
              <Label htmlFor="prazo">Prazo</Label>
              <Input id="prazo" value={prazo} onChange={e => setPrazo(e.target.value)} placeholder="Ex: 6 meses" />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={loading} className="w-full" size="lg">
          {loading ? 'Salvando...' : 'Salvar Cliente'}
        </Button>
      </form>
    </main>
  )
}
