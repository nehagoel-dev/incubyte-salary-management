import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MantineProvider } from '@mantine/core'
import EmployeesPage from './EmployeesPage'
import * as api from '../lib/api'
import type { Employee, Paginated } from '../lib/api'

vi.mock('../lib/api')

const mockEmployee: Employee = {
  id: '1',
  firstName: 'Alice',
  lastName: 'Smith',
  email: 'alice@example.com',
  department: 'Engineering',
  jobTitle: 'Engineer',
  country: 'US',
  currency: 'USD',
  baseSalaryCents: 8000000,
  employmentType: 'FULL_TIME',
  hireDate: '2022-01-01',
  createdAt: '2022-01-01T00:00:00.000Z',
  updatedAt: '2022-01-01T00:00:00.000Z',
}

function makePage(overrides?: Partial<Paginated<Employee>>): Paginated<Employee> {
  return { data: [mockEmployee], total: 1, page: 1, pageSize: 20, ...overrides }
}

function renderPage() {
  return render(
    <MantineProvider>
      <EmployeesPage />
    </MantineProvider>,
  )
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('EmployeesPage', () => {
  it('1. shows a loading indicator while data is pending', () => {
    vi.mocked(api.listEmployees).mockReturnValue(new Promise(() => {}))
    renderPage()
    expect(screen.getByTestId('employees-loading')).toBeInTheDocument()
    expect(screen.queryAllByRole('row')).toHaveLength(0)
  })

  it('2. renders employee rows when data resolves', async () => {
    vi.mocked(api.listEmployees).mockResolvedValue(makePage())
    renderPage()
    await screen.findByText('Alice')
    expect(screen.getByText('Smith')).toBeInTheDocument()
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
    expect(screen.getByText('Engineering')).toBeInTheDocument()
  })

  it('3. shows empty state when no employees are returned', async () => {
    vi.mocked(api.listEmployees).mockResolvedValue({ data: [], total: 0, page: 1, pageSize: 20 })
    renderPage()
    await screen.findByText(/no employees/i)
    expect(screen.queryAllByRole('row')).toHaveLength(0)
  })

  it('4. clicking next page calls listEmployees with page 2', async () => {
    vi.mocked(api.listEmployees).mockResolvedValue(makePage({ total: 100 }))
    renderPage()
    await screen.findByText('Alice')
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(api.listEmployees).toHaveBeenCalledWith({ page: 2, pageSize: 20 })
  })

  it('5. delete button shows confirmation, then deletes and refreshes', async () => {
    vi.mocked(api.listEmployees).mockResolvedValue(makePage())
    vi.mocked(api.deleteEmployee).mockResolvedValue(undefined)
    renderPage()
    await screen.findByText('Alice')

    await userEvent.click(screen.getByRole('button', { name: /delete/i }))
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /confirm/i }))
    await waitFor(() => {
      expect(api.deleteEmployee).toHaveBeenCalledWith('1')
      expect(api.listEmployees).toHaveBeenCalledTimes(2)
    })
  })
})
