import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase/admin'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function runPlaybookAgent(clienteId: string) {
  const supabase = createAdminClient()

  const { data: cliente } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', clienteId)
    .single()

  const { data: fontes } = await supabase
    .from('fontes')
    .select('conteudo, tipo')
    .eq('cliente_id', clienteId)

  const ticketMedio = cliente?.perfil_negocio?.ticket_medio || 'desconhecido'
  const metaFaturamento = cliente?.meta?.faturamento_alvo || null
  const gargaloPrincipal = cliente?.gargalo?.principal || 'indefinido'

  const engenhReversaPrompt =
    metaFaturamento && ticketMedio !== 'desconhecido'
      ? `\nENGENHARIA REVERSA DA META: Meta de faturamento ${metaFaturamento}. Ticket médio ${ticketMedio}. Calcule: vendas necessárias, taxa de conversão necessária, volume de leads necessário, investimento estimado em mídia.`
      : ''

  const prompt = `Você é o estrategista-chefe de uma agência de crescimento. Crie um Playbook de 90 dias ULTRA-ESPECÍFICO e ACIONÁVEL para este cliente.

CONTEXTO COMPLETO:
Perfil: ${JSON.stringify(cliente?.perfil_negocio, null, 2)}
DNA: ${JSON.stringify(cliente?.dna, null, 2)}
Scores: ${JSON.stringify(cliente?.scores, null, 2)}
GARGALO PRINCIPAL: ${JSON.stringify(cliente?.gargalo, null, 2)}
Fontes: ${fontes?.map((f) => `[${f.tipo}]: ${f.conteudo?.substring(0, 300)}`).join('\n')}
${engenhReversaPrompt}

REGRA FUNDAMENTAL: O plano DEVE atacar o gargalo "${gargaloPrincipal}" antes de qualquer outra coisa. Toda a priorização parte deste gargalo.

Retorne APENAS este JSON:
{
  "diagnostico_executivo": "Parágrafo de 3-4 frases resumindo a situação atual do cliente, seus principais pontos fortes, o gargalo identificado e o potencial de crescimento.",
  "prioridades": [
    { "ordem": 1, "acao": "ação específica", "impacto": "alto", "prazo": "semana 1-2", "responsavel": "agência" },
    { "ordem": 2, "acao": "...", "impacto": "alto", "prazo": "semana 2-3", "responsavel": "cliente" }
  ],
  "hipoteses": [
    { "hipotese": "Se fizermos X, então Y acontecerá", "como_testar": "descrição do teste", "metrica_sucesso": "métrica específica", "prazo_teste": "30 dias" }
  ],
  "roadmap_90d": {
    "dias_1_30": {
      "tema": "Atacar o gargalo: ${gargaloPrincipal}",
      "acoes": ["ação 1 específica", "ação 2", "ação 3", "ação 4", "ação 5"]
    },
    "dias_31_60": {
      "tema": "Consolidar e escalar",
      "acoes": ["ação 1", "ação 2", "ação 3", "ação 4"]
    },
    "dias_61_90": {
      "tema": "Otimizar e expandir",
      "acoes": ["ação 1", "ação 2", "ação 3", "ação 4"]
    }
  }
}

Retorne APENAS o JSON válido.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 3000,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  const playbook = JSON.parse(jsonMatch ? jsonMatch[0] : content)

  await supabase.from('playbooks').insert({
    cliente_id: clienteId,
    diagnostico_executivo: playbook.diagnostico_executivo,
    prioridades: playbook.prioridades,
    hipoteses: playbook.hipoteses,
    roadmap_90d: playbook.roadmap_90d,
  })

  await supabase
    .from('clientes')
    .update({
      status: 'concluido',
      progresso: 'Diagnóstico 360° concluído!',
    })
    .eq('id', clienteId)

  return playbook
}
