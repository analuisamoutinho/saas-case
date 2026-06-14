import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase/admin'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function runRadarAgent(clienteId: string) {
  const supabase = createAdminClient()

  const { data: cliente } = await supabase
    .from('clientes')
    .select('perfil_negocio, dna, scores')
    .eq('id', clienteId)
    .single()

  const { data: fontes } = await supabase
    .from('fontes')
    .select('conteudo, tipo')
    .eq('cliente_id', clienteId)

  const prompt = `Você é o estrategista-chefe de uma agência de crescimento digital. Sua função mais importante é identificar O PRINCIPAL GARGALO que está impedindo o crescimento do cliente.

PERFIL:
${JSON.stringify(cliente?.perfil_negocio, null, 2)}

DNA (voz do cliente):
${JSON.stringify(cliente?.dna, null, 2)}

SCORES DE MATURIDADE:
${JSON.stringify(cliente?.scores, null, 2)}

FONTES:
${fontes?.map((f) => `[${f.tipo}]: ${f.conteudo?.substring(0, 300)}`).join('\n')}

Definições dos gargalos:
- trafego: não tem volume suficiente de visitantes/leads chegando. O funil começa vazio.
- conversao: tem tráfego mas não converte. Página, oferta, processo de vendas ou follow-up ruins.
- oferta: o produto/serviço em si não está adequado ao mercado. Precificação, posicionamento ou entrega inadequados.
- comercial: tem leads mas a equipe/processo comercial perde vendas. Falta treinamento, CRM, script, gestão.
- posicionamento: não se diferencia da concorrência. Mensagem genérica, sem autoridade, sem nicho claro.
- retencao: vende mas perde clientes rápido. Churn alto, LTV baixo, falta de recorrência.

REGRA: Você DEVE escolher exatamente UM gargalo principal. Nunca retorne vazio. Escolha o que, se resolvido, desbloquearia o maior crescimento.

Retorne APENAS este JSON:
{
  "principal": "trafego",
  "justificativa": "Explicação objetiva em 2-3 frases de por que este é o gargalo principal, baseada nos dados apresentados.",
  "secundario": "conversao",
  "sinais_identificados": ["sinal1 dos dados", "sinal2", "sinal3"]
}

Retorne APENAS o JSON válido, sem texto adicional.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  const gargalo = JSON.parse(jsonMatch ? jsonMatch[0] : content)

  await supabase
    .from('clientes')
    .update({
      gargalo,
      progresso: 'Radar de Gargalos concluído. Gerando Playbook de 90 dias...',
    })
    .eq('id', clienteId)

  return gargalo
}
