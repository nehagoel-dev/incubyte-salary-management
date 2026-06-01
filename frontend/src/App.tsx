import { useEffect, useState } from 'react'
import { AppShell, NavLink, Group, Title, Text } from '@mantine/core'
import { IconLayoutDashboard, IconUsers } from '@tabler/icons-react'
import EmployeesPage from './pages/EmployeesPage'
import DashboardPage from './pages/DashboardPage'

type Page = 'employees' | 'dashboard'

function getPageFromPath(): Page {
  return window.location.pathname === '/dashboard' ? 'dashboard' : 'employees'
}

export default function App() {
  const [page, setPage] = useState<Page>(getPageFromPath)

  function navigateTo(p: Page) {
    window.history.pushState({}, '', `/${p}`)
    setPage(p)
  }

  useEffect(() => {
    const onPopState = () => setPage(getPageFromPath())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    const base = import.meta.env.VITE_API_URL ?? ''
    fetch(`${base}/health`).catch(() => {})
    fetch(`${base}/api/analytics/summary`).catch(() => {})
    fetch(`${base}/api/analytics/by-department`).catch(() => {})
    fetch(`${base}/api/analytics/by-country`).catch(() => {})
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
          onClick={() => navigateTo('dashboard')}
          styles={{ label: { fontSize: '1rem', fontWeight: 500 } }}
        />
        <NavLink
          label="Employees"
          leftSection={<IconUsers size={20} />}
          active={page === 'employees'}
          onClick={() => navigateTo('employees')}
          styles={{ label: { fontSize: '1rem', fontWeight: 500 } }}
        />
      </AppShell.Navbar>

      <AppShell.Main>
        {page === 'employees' ? <EmployeesPage /> : <DashboardPage />}
      </AppShell.Main>
    </AppShell>
  )
}
