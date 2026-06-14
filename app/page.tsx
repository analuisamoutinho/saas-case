import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface Cliente {
  id: string
  nome: string
  status: string
  criado_em: string
}

async function getClientes(): Promise<Cliente[]> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return []
    }
    const { createAdminClient } = await import('@/lib/supabase/admin')
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('clientes')
      .select('id, nome, status, criado_em')
      .order('criado_em', { ascending: false })
    return data || []
  } catch {
    return []
  }
}

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  novo: 'secondary',
  processando: 'default',
  concluido: 'default',
  erro: 'destructive'
}

const statusLabel: Record<string, string> = {
  novo: 'Novo',
  processando: 'Processando',
  concluido: 'Concluído',
  erro: 'Erro'
}

export default async function Home() {
  const clientes = await getClientes()

  return (
    <main className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <Link href="/clientes/novo">
          <Button>+ Novo Cliente</Button>
        </Link>
      </div>

      {clientes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <p className="text-lg">Nenhum cliente cadastrado ainda.</p>
            <p className="mt-2">Clique em &quot;Novo Cliente&quot; para começar.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {clientes.map((cliente) => (
            <Card key={cliente.id}>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">{cliente.nome}</h2>
                    <p className="text-sm text-muted-foreground">
                      {new Date(cliente.criado_em).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Badge variant={statusVariant[cliente.status] || 'secondary'}>
                    {statusLabel[cliente.status] || cliente.status}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Link href={`/clientes/${cliente.id}`}>
                    <Button variant="outline" size="sm">Ver</Button>
                  </Link>
                  {cliente.status === 'concluido' && (
                    <Link href={`/clientes/${cliente.id}/diagnostico`}>
                      <Button size="sm">Ver Diagnóstico</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
