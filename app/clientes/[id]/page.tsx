'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface ClienteStatus {
  id: string
  status: string
  progresso: string | null
  perfil_negocio: Record<string, unknown> | null
  dna: Record<string, unknown> | null
  scores: Record<string, unknown> | null
  gargalo: Record<string, unknown> | null
}

export default function ClientePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [cliente, setCliente] = useState<ClienteStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isPolling, setIsPolling] = useState(false)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/clientes/${id}/status`)
        if (res.ok) {
          const data = await res.json()
          setCliente(data)

          if (data.status === 'concluido') {
            router.push(`/clientes/${id}/diagnostico`)
          }

          return data.status
        }
      } catch {
        return null
      }
    }

    fetchStatus()
  }, [id, router])

  useEffect(() => {
    if (!cliente) return
    if (cliente.status !== 'processando') {
      setIsPolling(false)
      return
    }

    setIsPolling(true)
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/clientes/${id}/status`)
        if (res.ok) {
          const data = await res.json()
          setCliente(data)
          setProgress(p => Math.min(p + 5, 90))

          if (data.status === 'concluido') {
            clearInterval(interval)
            router.push(`/clientes/${id}/diagnostico`)
          } else if (data.status === 'erro') {
            clearInterval(interval)
          }
        }
      } catch {}
    }, 2000)

    return () => clearInterval(interval)
  }, [id, cliente?.status, router, isPolling])

  async function handleGenerate() {
    setLoading(true)
    try {
      await fetch(`/api/clientes/${id}/gerar`, { method: 'POST' })
      setCliente(prev => prev ? { ...prev, status: 'processando', progresso: 'Iniciando...' } : null)
      setProgress(10)
    } finally {
      setLoading(false)
    }
  }

  if (!cliente) {
    return (
      <main className="container mx-auto p-8">
        <Card><CardContent className="p-12 text-center">Carregando...</CardContent></Card>
      </main>
    )
  }

  return (
    <main className="container mx-auto p-8 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => router.push('/')}>&#8592; Voltar</Button>
        <h1 className="text-3xl font-bold">Diagnóstico</h1>
        <Badge>{cliente.status}</Badge>
      </div>

      {cliente.status === 'novo' && (
        <Card>
          <CardHeader><CardTitle>Gerar Diagnóstico 360°</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Os 4 agentes de IA irão analisar as informações do cliente e gerar um diagnóstico completo com DNA, scores de maturidade, gargalo principal e playbook de 90 dias.
            </p>
            <Button onClick={handleGenerate} disabled={loading} size="lg" className="w-full">
              {loading ? 'Iniciando...' : 'Gerar Diagnóstico 360°'}
            </Button>
          </CardContent>
        </Card>
      )}

      {cliente.status === 'processando' && (
        <Card>
          <CardHeader><CardTitle>Gerando Diagnóstico...</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Progress value={progress} className="h-3" />
              <p className="text-sm text-muted-foreground text-center animate-pulse">
                {cliente.progresso || 'Processando...'}
              </p>
            </div>
            <div className="grid grid-cols-4 gap-2 mt-4">
              {['Agente DNA', 'Score', 'Radar', 'Playbook'].map((agent, i) => (
                <div key={agent} className={`text-center p-3 rounded-lg text-xs font-medium ${progress > i * 25 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {agent}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {cliente.status === 'erro' && (
        <Card className="border-destructive">
          <CardHeader><CardTitle className="text-destructive">Erro no Diagnóstico</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{cliente.progresso}</p>
            <Button onClick={handleGenerate} variant="outline">Tentar Novamente</Button>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
