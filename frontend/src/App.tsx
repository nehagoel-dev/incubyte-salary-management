import { useEffect, useState } from 'react'
import { AppShell, NavLink, Group, Title, Text } from '@mantine/core'
import { IconLayoutDashboard, IconUsers } from '@tabler/icons-react'
import EmployeesPage from './pages/EmployeesPage'
import DashboardPage from './pages/DashboardPage'

type Page = 'employees' | 'dashboard'

export default function App() {
  const [page, setPage] = useState<Page>('employees')

  useEffect(() => {
    // Pre-warm the serverless function to reduce cold-start latency on first data request
    fetch(`${import.meta.env.VITE_API_URL ?? ''}/health`).catch(() => {})
  }, [])

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{ width: 240, breakpoint: 'sm' }}
      padding="md"
    >
      <AppShell.Header px="md">
        <Group h="100%" gap="sm">
          <Title order={2} c="teal">ACME</Title>
          <Text c="dimmed" size="md" fw={500}>Salary Management</Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <NavLink
          label="Dashboard"
          leftSection={<IconLayoutDashboard size={20} />}
          active={page === 'dashboard'}
          onClick={() => setPage('dashboard')}
          styles={{ label: { fontSize: '1rem', fontWeight: 500 } }}
        />
        <NavLink
          label="Employees"
          leftSection={<IconUsers size={20} />}
          active={page === 'employees'}
          onClick={() => setPage('employees')}
          styles={{ label: { fontSize: '1rem', fontWeight: 500 } }}
        />
      </AppShell.Navbar>

      <AppShell.Main>
        {page === 'employees' ? <EmployeesPage /> : <DashboardPage />}
      </AppShell.Main>
    </AppShell>
  )
}
