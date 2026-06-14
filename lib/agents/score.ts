import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase/admin'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function runScoreAgent(clienteId: string) {
  const supabase = createAdminClient()

  const { data: cliente } = await supabase
    .from('clientes')
    .select('perfil_negocio, dna')
    .eq('id', clienteId)
    .single()

  const { data: fontes } = await supabase
    .from('fontes')
    .select('conteudo, tipo')
    .eq('cliente_id', clienteId)

  const prompt = `Você é um analista especialista em maturidade de negócios digitais. Avalie a maturidade do cliente abaixo em 6 áreas.

PERFIL DO NEGÓCIO:
${JSON.stringify(cliente?.perfil_negocio, null, 2)}

DNA DO CLIENTE:
${JSON.stringify(cliente?.dna, null, 2)}

FONTES ADICIONAIS:
${fontes?.map((f) => `[${f.tipo}]: ${f.conteudo?.substring(0, 500)}`).join('\n')}

Retorne um JSON com EXATAMENTE esta estrutura:
{
  "marca": { "nota": 7, "justificativa": "frase curta de justificativa" },
  "marketing": { "nota": 4, "justificativa": "frase curta" },
  "comercial": { "nota": 6, "justificativa": "frase curta" },
  "dados": { "nota": 3, "justificativa": "frase curta" },
  "operacao": { "nota": 5, "justificativa": "frase curta" },
  "gestao": { "nota": 6, "justificativa": "frase curta" }
}

Critérios por área:
- marca: identidade visual, posicionamento, reconhecimento de mercado
- marketing: estratégia de conteúdo, presença digital, geração de demanda
- comercial: processo de vendas, conversão, CRM, equipe comercial
- dados: métricas acompanhadas, ferramentas de analytics, decisões baseadas em dados
- operacao: processos internos, entrega, qualidade, escalabilidade
- gestao: liderança, planejamento estratégico, finanças, cultura

Notas: 0-3 (inicial), 4-6 (em desenvolvimento), 7-8 (maduro), 9-10 (referência).

Retorne APENAS o JSON válido.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  const scores = JSON.parse(jsonMatch ? jsonMatch[0] : content)

  await supabase
    .from('clientes')
    .update({
      scores,
      progresso: 'Score de Maturidade concluído. Identificando gargalo principal...',
    })
    .eq('id', clienteId)

  return scores
}
