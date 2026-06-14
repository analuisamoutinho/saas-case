import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('criado_em', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = createAdminClient()
  const body = await req.json()

  const { data: cliente, error } = await supabase
    .from('clientes')
    .insert({ nome: body.nome, meta: body.meta || null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (body.transcricao) {
    await supabase.from('fontes').insert({
      cliente_id: cliente.id,
      tipo: 'transcricao',
      conteudo: body.transcricao,
    })
  }

  if (body.materiais && Array.isArray(body.materiais)) {
    for (const material of body.materiais) {
      await supabase.from('fontes').insert({
        cliente_id: cliente.id,
        tipo: material.tipo,
        conteudo: material.conteudo,
      })
    }
  }

  return NextResponse.json(cliente)
}
