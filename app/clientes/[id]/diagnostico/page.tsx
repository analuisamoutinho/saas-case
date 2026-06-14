import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { RadarChartComponent } from '@/components/radar-chart'
import { PDFExportButton } from '@/components/pdf-export'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface PageProps {
  params: Promise<{ id: string }>
}

interface ScoreArea {
  nota: number
  justificativa: string
}

interface Scores {
  marca?: ScoreArea
  marketing?: ScoreArea
  comercial?: ScoreArea
  dados?: ScoreArea
  operacao?: ScoreArea
  gestao?: ScoreArea
}

interface Gargalo {
  principal: string
  justificativa: string
  secundario: string
  sinais_identificados: string[]
}

interface PerfilNegocio {
  modelo?: string
  ticket_medio?: string
  produtos?: string[]
  servicos?: string[]
  margem_estimada?: string
  estrutura_comercial?: string
  segmento?: string
  tempo_mercado?: string
  tamanho_equipe?: string
}

interface DNA {
  dores?: string[]
  desejos?: string[]
  objecoes?: string[]
  linguagem?: string[]
  diferenciais?: string[]
}

interface Playbook {
  diagnostico_executivo: string
  prioridades: Array<{
    ordem: number
    acao: string
    impacto: string
    prazo: string
    responsavel: string
  }>
  hipoteses: Array<{
    hipotese: string
    como_testar: string
    metrica_sucesso: string
    prazo_teste: string
  }>
  roadmap_90d: {
    dias_1_30: { tema: string; acoes: string[] }
    dias_31_60: { tema: string; acoes: string[] }
    dias_61_90: { tema: string; acoes: string[] }
  }
}

interface Cliente {
  id: string
  nome: string
  status: string
  perfil_negocio: PerfilNegocio | null
  dna: DNA | null
  scores: Scores | null
  gargalo: Gargalo | null
}

const gargaloColors: Record<string, string> = {
  trafego: 'bg-blue-100 text-blue-800 border-blue-300',
  conversao: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  oferta: 'bg-purple-100 text-purple-800 border-purple-300',
  comercial: 'bg-orange-100 text-orange-800 border-orange-300',
  posicionamento: 'bg-pink-100 text-pink-800 border-pink-300',
  retencao: 'bg-red-100 text-red-800 border-red-300'
}

const gargaloLabels: Record<string, string> = {
  trafego: 'Tráfego',
  conversao: 'Conversão',
  oferta: 'Oferta',
  comercial: 'Comercial',
  posicionamento: 'Posicionamento',
  retencao: 'Retenção'
}

const impactoColors: Record<string, string> = {
  alto: 'bg-red-100 text-red-800',
  medio: 'bg-yellow-100 text-yellow-800',
  baixo: 'bg-green-100 text-green-800'
}

async function getData(id: string): Promise<{ cliente: Cliente; playbook: Playbook | null }> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      notFound()
    }
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()

    const { data: cliente, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !cliente) notFound()

    const { data: playbooks } = await supabase
      .from('playbooks')
      .select('*')
      .eq('cliente_id', id)
      .order('criado_em', { ascending: false })
      .limit(1)

    return { cliente, playbook: playbooks?.[0] || null }
  } catch {
    notFound()
  }
}

export default async function DiagnosticoPage({ params }: PageProps) {
  const { id } = await params
  const { cliente, playbook } = await getData(id)

  const gargalo = cliente.gargalo
  const gargaloColor = gargalo?.principal ? (gargaloColors[gargalo.principal] || 'bg-gray-100 text-gray-800 border-gray-300') : ''
  const gargaloLabel = gargalo?.principal ? (gargaloLabels[gargalo.principal] || gargalo.principal) : ''

  return (
    <main className="container mx-auto p-8">
      <div id="diagnostico-content">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/">
                <Button variant="outline" size="sm">&#8592; Voltar</Button>
              </Link>
              <h1 className="text-3xl font-bold">{cliente.nome}</h1>
              <Badge variant="default">Diagnóstico 360°</Badge>
            </div>
          </div>
          <PDFExportButton />
        </div>

        {/* Gargalo Principal */}
        {gargalo && (
          <Card className={`mb-6 border-2 ${gargaloColor}`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-semibold uppercase tracking-wide">Gargalo Principal</span>
                <span className={`px-3 py-1 rounded-full text-sm font-bold border ${gargaloColor}`}>
                  {gargaloLabel}
                </span>
              </div>
              <p className="text-base mt-2">{gargalo.justificativa}</p>
              {gargalo.sinais_identificados && (
                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase mb-1">Sinais identificados:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    {gargalo.sinais_identificados.map((sinal: string, i: number) => (
                      <li key={i} className="text-sm">{sinal}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Diagnóstico Executivo */}
        {playbook?.diagnostico_executivo && (
          <Card className="mb-6">
            <CardHeader><CardTitle>Diagnóstico Executivo</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{playbook.diagnostico_executivo}</p>
            </CardContent>
          </Card>
        )}

        {/* DNA */}
        {cliente.dna && (
          <Card className="mb-6">
            <CardHeader><CardTitle>DNA do Cliente</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold text-red-700 mb-3">Dores</h3>
                  <div className="flex flex-wrap gap-2">
                    {cliente.dna.dores?.map((dor: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-red-50 text-red-700 rounded-md text-xs border border-red-200">{dor}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-green-700 mb-3">Desejos</h3>
                  <div className="flex flex-wrap gap-2">
                    {cliente.dna.desejos?.map((desejo: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs border border-green-200">{desejo}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-orange-700 mb-3">Objeções</h3>
                  <div className="flex flex-wrap gap-2">
                    {cliente.dna.objecoes?.map((obj: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-orange-50 text-orange-700 rounded-md text-xs border border-orange-200">{obj}</span>
                    ))}
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-blue-700 mb-3">Linguagem do Cliente</h3>
                  <div className="flex flex-wrap gap-2">
                    {cliente.dna.linguagem?.map((expr: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs border border-blue-200">&quot;{expr}&quot;</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-purple-700 mb-3">Diferenciais</h3>
                  <div className="flex flex-wrap gap-2">
                    {cliente.dna.diferenciais?.map((dif: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-xs border border-purple-200">{dif}</span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Score Radar Chart */}
        {cliente.scores && (
          <Card className="mb-6">
            <CardHeader><CardTitle>Score de Maturidade</CardTitle></CardHeader>
            <CardContent>
              <RadarChartComponent scores={cliente.scores} />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                {Object.entries(cliente.scores).map(([key, value]) => {
                  const area = value as ScoreArea
                  return (
                    <div key={key} className="p-3 bg-muted rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium capitalize">{key}</span>
                        <span className="text-lg font-bold">{area.nota}/10</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{area.justificativa}</p>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Perfil do Negócio */}
        {cliente.perfil_negocio && (
          <Card className="mb-6">
            <CardHeader><CardTitle>Perfil do Negócio</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(cliente.perfil_negocio).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                      {key.replace(/_/g, ' ')}
                    </p>
                    <p className="text-sm font-medium">
                      {Array.isArray(value) ? value.join(', ') : String(value || '-')}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Roadmap 90 dias */}
        {playbook?.roadmap_90d && (
          <Card className="mb-6">
            <CardHeader><CardTitle>Roadmap 90 Dias</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { key: 'dias_1_30', label: 'Dias 1-30' },
                  { key: 'dias_31_60', label: 'Dias 31-60' },
                  { key: 'dias_61_90', label: 'Dias 61-90' }
                ].map(({ key, label }) => {
                  const period = playbook.roadmap_90d[key as keyof typeof playbook.roadmap_90d]
                  return (
                    <Card key={key} className="bg-muted/50">
                      <CardHeader className="pb-2">
                        <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
                        <CardTitle className="text-sm">{period.tema}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {period.acoes.map((acao: string, i: number) => (
                            <li key={i} className="text-sm flex gap-2">
                              <span className="text-muted-foreground shrink-0">{i + 1}.</span>
                              <span>{acao}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Prioridades */}
        {playbook?.prioridades && (
          <Card className="mb-6">
            <CardHeader><CardTitle>Prioridades</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {playbook.prioridades.map((p) => (
                  <div key={p.ordem} className="flex items-start gap-3 p-3 border rounded-lg">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {p.ordem}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{p.acao}</p>
                      <div className="flex gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${impactoColors[p.impacto] || 'bg-gray-100'}`}>
                          {p.impacto}
                        </span>
                        <span className="text-xs text-muted-foreground">{p.prazo}</span>
                        <span className="text-xs text-muted-foreground">• {p.responsavel}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hipóteses */}
        {playbook?.hipoteses && (
          <Card className="mb-6">
            <CardHeader><CardTitle>Hipóteses para Testar</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {playbook.hipoteses.map((h, i: number) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <p className="font-medium text-sm mb-2">{h.hipotese}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
                      <div><span className="font-semibold">Como testar:</span> {h.como_testar}</div>
                      <div><span className="font-semibold">Métrica:</span> {h.metrica_sucesso}</div>
                      <div><span className="font-semibold">Prazo:</span> {h.prazo_teste}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
