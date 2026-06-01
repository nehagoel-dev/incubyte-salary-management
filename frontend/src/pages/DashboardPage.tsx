import React, { useEffect, useState } from 'react'
import { Alert, Paper, Stack, SimpleGrid, Text, Skeleton, Title } from '@mantine/core'
import { BarChart } from '@mantine/charts'
import { getAnalyticsSummary, getAnalyticsByDepartment, getAnalyticsByCountry } from '../lib/api'
import type { SummaryResult, DepartmentStat, CountryStat } from '../lib/api'

const fmt = (cents: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)

const fmtAxis = (cents: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(cents / 100)

export default function DashboardPage() {
  const [summary, setSummary] = useState<SummaryResult | null>(null)
  const [deptData, setDeptData] = useState<DepartmentStat[]>([])
  const [countryData, setCountryData] = useState<CountryStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    Promise.all([
      getAnalyticsSummary(),
      getAnalyticsByDepartment(),
      getAnalyticsByCountry(),
    ])
      .then(([s, d, c]) => {
        if (cancelled) return
        setSummary(s)
        setDeptData(d)
        setCountryData(c)
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setError(true)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div data-testid="dashboard-loading">
        <Stack gap="xl">
          <SimpleGrid cols={4}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={80} radius="md" />
            ))}
          </SimpleGrid>
          <Skeleton height={360} radius="md" />
          <Skeleton height={360} radius="md" />
        </Stack>
      </div>
    )
  }

  if (error) {
    return <Alert>Failed to load analytics data. Please try again.</Alert>
  }

  return (
    <Stack gap="xl">
      <SimpleGrid cols={4}>
        <Paper p="md" withBorder shadow="sm" radius="md" bg="white">
          <Text size="sm" c="dimmed" fw={500} mb={4}>Headcount</Text>
          <Title order={3}>{summary!.headcount}</Title>
        </Paper>
        <Paper p="md" withBorder shadow="sm" radius="md" bg="white">
          <Text size="sm" c="dimmed" fw={500} mb={4}>Total Payroll</Text>
          <Title order={3}>{fmt(summary!.totalPayrollUsdCents)}</Title>
        </Paper>
        <Paper p="md" withBorder shadow="sm" radius="md" bg="white">
          <Text size="sm" c="dimmed" fw={500} mb={4}>Average Salary</Text>
          <Title order={3}>{fmt(summary!.averageSalaryUsdCents)}</Title>
        </Paper>
        <Paper p="md" withBorder shadow="sm" radius="md" bg="white">
          <Text size="sm" c="dimmed" fw={500} mb={4}>Median Salary</Text>
          <Title order={3}>{fmt(summary!.medianSalaryUsdCents)}</Title>
        </Paper>
      </SimpleGrid>

      <Paper
        p="lg"
        withBorder
        shadow="sm"
        radius="md"
        bg="white"
        style={{ overflow: 'visible', '--chart-cursor-fill': 'rgba(0,0,0,0.04)' } as React.CSSProperties}
      >
        <Text size="lg" fw={700} mb="md">Average Salary by Department</Text>
        <BarChart
          data={deptData}
          dataKey="department"
          series={[{ name: 'averageSalaryUsdCents', label: 'Avg Salary', color: 'teal' }]}
          h={300}
          valueFormatter={fmtAxis}
          yAxisProps={{ width: 90, tick: { fontSize: 13 } }}
          xAxisProps={{ tick: { fontSize: 13 } }}
          tickLine="y"
        />
      </Paper>

      <Paper
        p="lg"
        withBorder
        shadow="sm"
        radius="md"
        bg="white"
        style={{ overflow: 'visible', '--chart-cursor-fill': 'rgba(0,0,0,0.04)' } as React.CSSProperties}
      >
        <Text size="lg" fw={700} mb="md">Average Salary by Country</Text>
        <BarChart
          data={countryData}
          dataKey="country"
          series={[{ name: 'averageSalaryUsdCents', label: 'Avg Salary', color: 'cyan' }]}
          h={300}
          valueFormatter={fmtAxis}
          yAxisProps={{ width: 90, tick: { fontSize: 13 } }}
          xAxisProps={{ tick: { fontSize: 13 } }}
          tickLine="y"
        />
      </Paper>
    </Stack>
  )
}
