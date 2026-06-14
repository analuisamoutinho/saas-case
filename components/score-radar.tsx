'use client'

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts'

type Scores = {
  marca: { nota: number; justificativa: string }
  marketing: { nota: number; justificativa: string }
  comercial: { nota: number; justificativa: string }
  dados: { nota: number; justificativa: string }
  operacao: { nota: number; justificativa: string }
  gestao: { nota: number; justificativa: string }
}

export function ScoreRadar({ scores }: { scores: Scores }) {
  const data = [
    { area: 'Marca', value: scores.marca?.nota ?? 0 },
    { area: 'Marketing', value: scores.marketing?.nota ?? 0 },
    { area: 'Comercial', value: scores.comercial?.nota ?? 0 },
    { area: 'Dados', value: scores.dados?.nota ?? 0 },
    { area: 'Operação', value: scores.operacao?.nota ?? 0 },
    { area: 'Gestão', value: scores.gestao?.nota ?? 0 },
  ]

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data}>
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis
          dataKey="area"
          tick={{ fontSize: 12, fill: '#6b7280' }}
        />
        <Radar
          name="Score"
          dataKey="value"
          stroke="#111827"
          fill="#111827"
          fillOpacity={0.15}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
