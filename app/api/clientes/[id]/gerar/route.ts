import { NextRequest, NextResponse } from 'next/server'
import { runDiagnosisPipeline } from '@/lib/agents/pipeline'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Fire and forget — pipeline runs in background
  runDiagnosisPipeline(id).catch(console.error)

  return NextResponse.json({ message: 'Diagnóstico iniciado', id })
}
