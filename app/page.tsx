import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'

const statusConfig: Record<string, { label: string; className: string }> = {
  novo: { label: 'Novo', className: 'bg-gray-100 text-gray-700' },
  processando: { label: 'Processando...', className: 'bg-blue-100 text-blue-700' },
  concluido: { label: 'Concluído', className: 'bg-green-100 text-green-700' },
  erro: { label: 'Erro', className: 'bg-red-100 text-red-700' },
}

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = createAdminClient()
  const { data: clientes } = await supabase
    .from('clientes')
    .select('id, nome, status, criado_em, gargalo')
    .order('criado_em', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Case</h1>
            <p className="text-sm text-gray-500">Sistema de Onboarding</p>
          </div>
          <Link
            href="/clientes/novo"
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            + Novo Cliente
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {!clientes || clientes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🎯</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Nenhum cliente ainda</h2>
            <p className="text-gray-500 mb-6">Comece criando o primeiro diagnóstico 360°</p>
            <Link
              href="/clientes/novo"
              className="bg-black text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Criar primeiro cliente
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-4">{clientes.length} cliente(s)</p>
            {clientes.map((cliente) => {
              const status = statusConfig[cliente.status] || statusConfig.novo
              return (
                <div
                  key={cliente.id}
                  className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm">
                      {cliente.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{cliente.nome}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(cliente.criado_em).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                        {cliente.gargalo?.principal && (
                          <>
                            {' · Gargalo: '}
                            <span className="font-medium text-gray-600 capitalize">
                              {cliente.gargalo.principal}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.className}`}
                    >
                      {status.label}
                    </span>
                    <Link
                      href={`/clientes/${cliente.id}`}
                      className="text-sm text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg hover:border-gray-400 transition-colors"
                    >
                      {cliente.status === 'concluido' ? 'Ver diagnóstico' : 'Abrir'}
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
