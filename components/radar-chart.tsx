'use client'

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts'

interface ScoreArea {
  nota: number
  justificativa: string
}

interface Scores {
  marca?: ScoreArea
  marketing?: ScoreArea
  comercial?: ScoreArea
  dados?: ScoreArea
  operacao?: ScoreArea
  gestao?: ScoreArea
}

interface RadarChartComponentProps {
  scores: Scores
}

const areaLabels: Record<string, string> = {
  marca: 'Marca',
  marketing: 'Marketing',
  comercial: 'Comercial',
  dados: 'Dados',
  operacao: 'Operação',
  gestao: 'Gestão'
}

export function RadarChartComponent({ scores }: RadarChartComponentProps) {
  const data = Object.entries(scores).map(([key, value]) => ({
    area: areaLabels[key] || key,
    nota: value?.nota || 0,
    fullMark: 10
  }))

  return (
    <ResponsiveContainer width="100%" height={350}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="area" />
        <PolarRadiusAxis angle={30} domain={[0, 10]} />
        <Radar
          name="Score"
          dataKey="nota"
          stroke="#8884d8"
          fill="#8884d8"
          fillOpacity={0.6}
        />
        <Tooltip />
      </RadarChart>
    </ResponsiveContainer>
  )
}
