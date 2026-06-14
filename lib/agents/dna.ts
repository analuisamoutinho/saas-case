import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase/admin'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function runDNAAgent(clienteId: string) {
  const supabase = createAdminClient()

  const { data: fontes } = await supabase
    .from('fontes')
    .select('*')
    .eq('cliente_id', clienteId)

  const transcricao = fontes?.find((f) => f.tipo === 'transcricao')?.conteudo || ''
  const outrosMateriais =
    fontes
      ?.filter((f) => f.tipo !== 'transcricao')
      .map((f) => f.conteudo)
      .join('\n\n') || ''

  const prompt = `Você é um estrategista especializado em análise de negócios digitais. Analise a transcrição abaixo de uma reunião de onboarding com um cliente e extraia informações estruturadas.

TRANSCRIÇÃO:
${transcricao}

MATERIAIS ADICIONAIS:
${outrosMateriais}

Extraia e retorne um JSON com EXATAMENTE esta estrutura:
{
  "perfil_negocio": {
    "modelo": "descrição do modelo de negócio",
    "ticket_medio": "valor ou faixa estimada",
    "produtos": ["produto1", "produto2"],
    "servicos": ["servico1"],
    "margem_estimada": "porcentagem ou faixa",
    "estrutura_comercial": "descrição da equipe/processo de vendas",
    "segmento": "B2B/B2C/etc",
    "tempo_mercado": "quanto tempo no mercado",
    "tamanho_equipe": "número aproximado"
  },
  "dna": {
    "dores": ["dor1 nas próprias palavras do cliente", "dor2"],
    "desejos": ["desejo1 nas próprias palavras", "desejo2"],
    "objecoes": ["objecao1", "objecao2"],
    "linguagem": ["expressão1 usada pelo cliente", "expressão2", "expressão3"],
    "diferenciais": ["diferencial1 percebido pelo cliente", "diferencial2"]
  }
}

REGRA CRÍTICA: Use LITERALMENTE as palavras que o cliente usou na transcrição para dores, desejos, objeções e linguagem. Não parafraseie. Essa é a "voz do cliente" e vira matéria-prima de criativo.

Retorne APENAS o JSON válido, sem texto adicional.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content)

  await supabase
    .from('clientes')
    .update({
      perfil_negocio: parsed.perfil_negocio,
      dna: parsed.dna,
      progresso: 'Agente DNA concluído. Iniciando Score de Maturidade...',
    })
    .eq('id', clienteId)

  return parsed
}
