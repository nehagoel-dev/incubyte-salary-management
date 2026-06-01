import React, { useEffect, useState } from 'react'
import { Alert, Paper, Stack, SimpleGrid, Text, Skeleton, Title } from '@mantine/core'
import { BarChart } from '@mantine/charts'
import { fetchSummary, fetchDeptData, fetchCountryData } from '../lib/analyticsCache'
import type { SummaryResult, DepartmentStat, CountryStat } from '../lib/api'

const fmt = (cents: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)

const fmtAxis = (cents: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(cents / 100)

const chartStyle = {
  overflow: 'visible',
  '--chart-cursor-fill': 'rgba(0,0,0,0.04)',
  width: '50%',
} as React.CSSProperties

export default function DashboardPage() {
  const [summary, setSummary] = useState<SummaryResult | null>(null)
  const [deptData, setDeptData] = useState<DepartmentStat[]>([])
  const [countryData, setCountryData] = useState<CountryStat[]>([])
  const [summaryLoading, setSummaryLoading] = useState(true)
  const [chartsLoading, setChartsLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    // Summary (fast query) — resolves first; shows stat cards immediately
    fetchSummary()
      .then(s => { if (!cancelled) { setSummary(s); setSummaryLoading(false) } })
      .catch(() => { if (!cancelled) { setError(true); setSummaryLoading(false) } })

    // Charts (heavier aggregation) — resolve independently
    Promise.all([fetchDeptData(), fetchCountryData()])
      .then(([d, c]) => { if (!cancelled) { setDeptData(d); setCountryData(c); setChartsLoading(false) } })
      .catch(() => { if (!cancelled) setChartsLoading(false) })

    return () => { cancelled = true }
  }, [])

  if (summaryLoading) {
    return (
      <div data-testid="dashboard-loading">
        <Stack gap="md">
          <SimpleGrid cols={4}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={64} radius="md" />
            ))}
          </SimpleGrid>
          <div style={{ display: 'flex', gap: 16 }}>
            <Skeleton height={500} radius="md" style={{ width: '50%' }} />
            <Skeleton height={500} radius="md" style={{ width: '50%' }} />
          </div>
        </Stack>
      </div>
    )
  }

  if (error) {
    return <Alert>Failed to load analytics data. Please try again.</Alert>
  }

  return (
    <Stack gap="md">
      <SimpleGrid cols={4}>
        <Paper p="sm" withBorder shadow="sm" radius="md" bg="white">
          <Text size="xs" c="dimmed" fw={500} mb={6}>Headcount</Text>
          <Title order={4}>{summary!.headcount}</Title>
        </Paper>
        <Paper p="sm" withBorder shadow="sm" radius="md" bg="white">
          <Text size="xs" c="dimmed" fw={500} mb={6}>Total Payroll</Text>
          <Title order={4}>{fmt(summary!.totalPayrollUsdCents)}</Title>
        </Paper>
        <Paper p="sm" withBorder shadow="sm" radius="md" bg="white">
          <Text size="xs" c="dimmed" fw={500} mb={6}>Average Salary</Text>
          <Title order={4}>{fmt(summary!.averageSalaryUsdCents)}</Title>
        </Paper>
        <Paper p="sm" withBorder shadow="sm" radius="md" bg="white">
          <Text size="xs" c="dimmed" fw={500} mb={6}>Median Salary</Text>
          <Title order={4}>{fmt(summary!.medianSalaryUsdCents)}</Title>
        </Paper>
      </SimpleGrid>

      <div style={{ display: 'flex', gap: 16 }}>
        {chartsLoading ? (
          <>
            <Skeleton height={500} radius="md" style={{ width: '50%' }} />
            <Skeleton height={500} radius="md" style={{ width: '50%' }} />
          </>
        ) : (
          <>
            <Paper p="sm" withBorder shadow="sm" radius="md" bg="white" style={chartStyle}>
              <Text size="sm" fw={600} mb="lg">Average Salary by Department</Text>
              <BarChart
                data={deptData}
                dataKey="department"
                series={[{ name: 'averageSalaryUsdCents', label: 'Avg Salary', color: 'teal' }]}
                h={460}
                valueFormatter={fmtAxis}
                yAxisProps={{ width: 70, tick: { fontSize: 11 } }}
                xAxisProps={{ tick: { fontSize: 11 } }}
                barChartProps={{ barCategoryGap: '25%' }}
                tickLine="y"
              />
            </Paper>

            <Paper p="sm" withBorder shadow="sm" radius="md" bg="white" style={chartStyle}>
              <Text size="sm" fw={600} mb="lg">Average Salary by Country</Text>
              <BarChart
                data={countryData}
                dataKey="country"
                series={[{ name: 'averageSalaryUsdCents', label: 'Avg Salary', color: 'cyan' }]}
                h={460}
                valueFormatter={fmtAxis}
                yAxisProps={{ width: 70, tick: { fontSize: 11 } }}
                xAxisProps={{ tick: { fontSize: 11 } }}
                barChartProps={{ barCategoryGap: '25%' }}
                tickLine="y"
              />
            </Paper>
          </>
        )}
      </div>
    </Stack>
  )
}
