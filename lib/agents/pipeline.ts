import { createAdminClient } from '@/lib/supabase/admin'
import { runDNAAgent } from './dna'
import { runScoreAgent } from './score'
import { runRadarAgent } from './radar'
import { runPlaybookAgent } from './playbook'

export async function runDiagnosisPipeline(clienteId: string) {
  const supabase = createAdminClient()

  try {
    await supabase
      .from('clientes')
      .update({ status: 'processando', progresso: 'Iniciando Agente DNA...' })
      .eq('id', clienteId)

    await runDNAAgent(clienteId)
    await runScoreAgent(clienteId)
    await runRadarAgent(clienteId)
    await runPlaybookAgent(clienteId)
  } catch (error) {
    await supabase
      .from('clientes')
      .update({
        status: 'erro',
        progresso: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      })
      .eq('id', clienteId)
    throw error
  }
}
