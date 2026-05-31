import { Container, Title } from '@mantine/core'
import EmployeesPage from './pages/EmployeesPage'

export default function App() {
  return (
    <Container size="xl" py="md">
      <Title mb="md">Salary Management</Title>
      <EmployeesPage />
    </Container>
  )
}
