import { useState } from 'react'
import { Container, Title, Group, Button } from '@mantine/core'
import EmployeesPage from './pages/EmployeesPage'
import DashboardPage from './pages/DashboardPage'

type Page = 'employees' | 'dashboard'

export default function App() {
  const [page, setPage] = useState<Page>('employees')

  return (
    <Container size="xl" py="md">
      <Title mb="md">Salary Management</Title>
      <Group mb="md">
        <Button onClick={() => setPage('employees')}>Employees</Button>
        <Button onClick={() => setPage('dashboard')}>Dashboard</Button>
      </Group>
      {page === 'employees' ? <EmployeesPage /> : <DashboardPage />}
    </Container>
  )
}
