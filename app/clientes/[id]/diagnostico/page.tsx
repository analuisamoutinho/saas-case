import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ScoreRadar } from '@/components/score-radar'
import { PdfExportButton } from '@/components/pdf-export'

const gargaloColors: Record<string, { bg: string; text: string; border: string; label: string }> = {
  trafego: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', label: 'Tráfego' },
  conversao: { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200', label: 'Conversão' },
  oferta: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200', label: 'Oferta' },
  comercial: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200', label: 'Comercial' },
  posicionamento: { bg: 'bg-pink-50', text: 'text-pink-800', border: 'border-pink-200', label: 'Posicionamento' },
  retencao: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200', label: 'Retenção' },
}

const impactoColors: Record<string, string> = {
  alto: 'bg-red-100 text-red-700',
  medio: 'bg-yellow-100 text-yellow-700',
  baixo: 'bg-gray-100 text-gray-600',
}

export const dynamic = 'force-dynamic'

export default async function DiagnosticoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: cliente } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', id)
    .single()

  if (!cliente) notFound()

  const { data: playbook } = await supabase
    .from('playbooks')
    .select('*')
    .eq('cliente_id', id)
    .order('criado_em', { ascending: false })
    .limit(1)
    .single()

  const gargalo = cliente.gargalo
  const gargaloConfig = gargalo?.principal ? (gargaloColors[gargalo.principal] || gargaloColors.trafego) : null
  const scores = cliente.scores
  const dna = cliente.dna
  const perfil = cliente.perfil_negocio

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 print:hidden">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-gray-600 text-sm">
              ← Clientes
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-medium text-gray-700">{cliente.nome}</span>
            <span className="text-gray-300">/</span>
            <span className="text-sm text-gray-500">Diagnóstico 360°</span>
          </div>
          <PdfExportButton targetId="diagnostico-content" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div id="diagnostico-content" className="space-y-6">
          {/* Header */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{cliente.nome}</h1>
                <p className="text-sm text-gray-400 mt-1">
                  Diagnóstico 360° ·{' '}
                  {new Date(cliente.criado_em).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
              {gargaloConfig && gargalo && (
                <div className={`${gargaloConfig.bg} ${gargaloConfig.border} border rounded-xl p-4 text-right`}>
                  <p className={`text-xs font-medium ${gargaloConfig.text} uppercase tracking-wide mb-1`}>
                    Gargalo Principal
                  </p>
                  <p className={`text-2xl font-bold ${gargaloConfig.text}`}>{gargaloConfig.label}</p>
                </div>
              )}
            </div>

            {gargalo?.justificativa && (
              <div className={`mt-4 ${gargaloConfig?.bg} ${gargaloConfig?.border} border rounded-lg p-4`}>
                <p className={`text-sm ${gargaloConfig?.text}`}>
                  <strong>Por que este é o gargalo:</strong> {gargalo.justificativa}
                </p>
                {gargalo.sinais_identificados?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {gargalo.sinais_identificados.map((sinal: string, i: number) => (
                      <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${gargaloConfig?.bg} ${gargaloConfig?.text} border ${gargaloConfig?.border}`}>
                        {sinal}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Executive summary */}
          {playbook?.diagnostico_executivo && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="font-semibold text-gray-900 mb-3">Diagnóstico Executivo</h2>
              <p className="text-gray-700 leading-relaxed">{playbook.diagnostico_executivo}</p>
            </div>
          )}

          {/* DNA + Scores */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* DNA */}
            {dna && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="font-semibold text-gray-900 mb-4">DNA do Cliente</h2>
                <div className="space-y-4">
                  {[
                    { key: 'dores', label: 'Dores', color: 'bg-red-100 text-red-700' },
                    { key: 'desejos', label: 'Desejos', color: 'bg-green-100 text-green-700' },
                    { key: 'objecoes', label: 'Objeções', color: 'bg-yellow-100 text-yellow-700' },
                  ].map(({ key, label, color }) => (
                    <div key={key}>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        {label}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {(dna[key] as string[] || []).map((item: string, i: number) => (
                          <span key={i} className={`text-xs px-2.5 py-1 rounded-full ${color}`}>
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}

                  {dna.linguagem?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        Linguagem (voz do cliente)
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {(dna.linguagem as string[]).map((item: string, i: number) => (
                          <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 italic">
                            &ldquo;{item}&rdquo;
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {dna.diferenciais?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                        Diferenciais
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {(dna.diferenciais as string[]).map((item: string, i: number) => (
                          <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Scores */}
            {scores && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="font-semibold text-gray-900 mb-2">Score de Maturidade</h2>
                <ScoreRadar scores={scores} />
                <div className="space-y-2 mt-2">
                  {Object.entries(scores).map(([area, data]) => {
                    const s = data as { nota: number; justificativa: string }
                    return (
                      <div key={area} className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-20 capitalize">{area}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                          <div
                            className="bg-gray-900 h-1.5 rounded-full"
                            style={{ width: `${s.nota * 10}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-700 w-6 text-right">{s.nota}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Business profile */}
          {perfil && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Perfil do Negócio</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Modelo', value: perfil.modelo },
                  { label: 'Ticket Médio', value: perfil.ticket_medio },
                  { label: 'Segmento', value: perfil.segmento },
                  { label: 'Tempo no Mercado', value: perfil.tempo_mercado },
                  { label: 'Tamanho da Equipe', value: perfil.tamanho_equipe },
                  { label: 'Margem Estimada', value: perfil.margem_estimada },
                  { label: 'Estrutura Comercial', value: perfil.estrutura_comercial },
                ].filter(({ value }) => value).map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                    <p className="text-sm font-medium text-gray-800">{value}</p>
                  </div>
                ))}
              </div>
              {(perfil.produtos?.length > 0 || perfil.servicos?.length > 0) && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {perfil.produtos?.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-400 mb-1">Produtos</p>
                      <div className="flex flex-wrap gap-1">
                        {(perfil.produtos as string[]).map((p: string, i: number) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{p}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {perfil.servicos?.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Serviços</p>
                      <div className="flex flex-wrap gap-1">
                        {(perfil.servicos as string[]).map((s: string, i: number) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Priorities */}
          {playbook?.prioridades?.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Prioridades</h2>
              <div className="space-y-3">
                {(playbook.prioridades as Array<{ ordem: number; acao: string; impacto: string; prazo: string; responsavel: string }>).map((p) => (
                  <div key={p.ordem} className="flex items-start gap-4">
                    <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {p.ordem}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">{p.acao}</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {p.impacto && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${impactoColors[p.impacto] || impactoColors.baixo}`}>
                            {p.impacto}
                          </span>
                        )}
                        {p.prazo && <span className="text-xs text-gray-400">{p.prazo}</span>}
                        {p.responsavel && <span className="text-xs text-gray-400">· {p.responsavel}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 90-day roadmap */}
          {playbook?.roadmap_90d && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Roadmap 90 Dias</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { key: 'dias_1_30', label: 'Dias 1–30', accent: 'border-black bg-gray-900 text-white' },
                  { key: 'dias_31_60', label: 'Dias 31–60', accent: 'border-gray-300 bg-white text-gray-900' },
                  { key: 'dias_61_90', label: 'Dias 61–90', accent: 'border-gray-300 bg-white text-gray-900' },
                ].map(({ key, label, accent }) => {
                  const block = (playbook.roadmap_90d as Record<string, { tema: string; acoes: string[] }>)[key]
                  if (!block) return null
                  const isFirst = key === 'dias_1_30'
                  return (
                    <div key={key} className={`border rounded-xl p-4 ${isFirst ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200'}`}>
                      <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${isFirst ? 'text-gray-300' : 'text-gray-400'}`}>
                        {label}
                      </p>
                      <p className={`text-sm font-semibold mb-3 ${isFirst ? 'text-white' : 'text-gray-900'}`}>
                        {block.tema}
                      </p>
                      <ul className="space-y-1.5">
                        {block.acoes.map((acao: string, i: number) => (
                          <li key={i} className={`text-xs flex items-start gap-1.5 ${isFirst ? 'text-gray-300' : 'text-gray-600'}`}>
                            <span className="mt-0.5 flex-shrink-0">{isFirst ? '→' : '·'}</span>
                            {acao}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Hypotheses */}
          {playbook?.hipoteses?.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Hipóteses a Testar</h2>
              <div className="space-y-4">
                {(playbook.hipoteses as Array<{ hipotese: string; como_testar: string; metrica_sucesso: string; prazo_teste: string }>).map((h, i) => (
                  <div key={i} className="border border-gray-100 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-900 mb-2">💡 {h.hipotese}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-gray-400 mb-0.5">Como testar</p>
                        <p className="text-gray-700">{h.como_testar}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-0.5">Métrica de sucesso</p>
                        <p className="text-gray-700">{h.metrica_sucesso}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-0.5">Prazo</p>
                        <p className="text-gray-700">{h.prazo_teste}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center py-4 text-xs text-gray-300">
            Diagnóstico gerado pela Case · {new Date().toLocaleDateString('pt-BR')}
          </div>
        </div>
      </main>
    </div>
  )
}
