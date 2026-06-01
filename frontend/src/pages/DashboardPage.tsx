import React, { useEffect, useState } from 'react'
import { Loader, Alert, Paper, Stack, SimpleGrid, Text } from '@mantine/core'
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
        <Loader />
      </div>
    )
  }

  if (error) {
    return <Alert>Failed to load analytics data. Please try again.</Alert>
  }

  return (
    <Stack gap="xl">
      <SimpleGrid cols={4}>
        <Paper p="lg" withBorder shadow="sm" radius="md" bg="white">
          <Text size="sm" c="dimmed" mb={4}>Headcount</Text>
          <Text size="xl" fw={700}>{summary!.headcount}</Text>
        </Paper>
        <Paper p="lg" withBorder shadow="sm" radius="md" bg="white">
          <Text size="sm" c="dimmed" mb={4}>Total Payroll</Text>
          <Text size="xl" fw={700}>{fmt(summary!.totalPayrollUsdCents)}</Text>
        </Paper>
        <Paper p="lg" withBorder shadow="sm" radius="md" bg="white">
          <Text size="sm" c="dimmed" mb={4}>Average Salary</Text>
          <Text size="xl" fw={700}>{fmt(summary!.averageSalaryUsdCents)}</Text>
        </Paper>
        <Paper p="lg" withBorder shadow="sm" radius="md" bg="white">
          <Text size="sm" c="dimmed" mb={4}>Median Salary</Text>
          <Text size="xl" fw={700}>{fmt(summary!.medianSalaryUsdCents)}</Text>
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
        <Text size="md" fw={700} mb="md">Average Salary by Department</Text>
        <BarChart
          data={deptData}
          dataKey="department"
          series={[{ name: 'averageSalaryUsdCents', label: 'Avg Salary', color: 'blue' }]}
          h={300}
          valueFormatter={fmtAxis}
          yAxisProps={{ width: 80 }}
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
        <Text size="md" fw={700} mb="md">Average Salary by Country</Text>
        <BarChart
          data={countryData}
          dataKey="country"
          series={[{ name: 'averageSalaryUsdCents', label: 'Avg Salary', color: 'green' }]}
          h={300}
          valueFormatter={fmtAxis}
          yAxisProps={{ width: 80 }}
          tickLine="y"
        />
      </Paper>
    </Stack>
  )
}
