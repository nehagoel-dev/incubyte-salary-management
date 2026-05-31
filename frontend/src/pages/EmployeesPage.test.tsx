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
  describe('search, filter, and sort', () => {
    beforeEach(() => {
      vi.mocked(api.listEmployees).mockResolvedValue(makePage())
    })

    it('6. search input debounces and calls listEmployees with search param', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) })
      vi.useFakeTimers()
      try {
        renderPage()
        await vi.runAllTimersAsync()
        await user.type(screen.getByRole('textbox', { name: /search/i }), 'alice')
        vi.advanceTimersByTime(500)
        await vi.runAllTimersAsync()
        expect(api.listEmployees).toHaveBeenLastCalledWith({ search: 'alice', page: 1, pageSize: 20 })
      } finally {
        vi.useRealTimers()
      }
    })

    it('7. selecting a department calls listEmployees with department param', async () => {
      renderPage()
      await screen.findByText('Alice')
      await userEvent.click(screen.getByRole('combobox', { name: /department/i }))
      await userEvent.click(screen.getByRole('option', { name: 'Engineering' }))
      expect(api.listEmployees).toHaveBeenLastCalledWith({ department: 'Engineering', page: 1, pageSize: 20 })
    })

    it('8. selecting a country calls listEmployees with country param', async () => {
      renderPage()
      await screen.findByText('Alice')
      await userEvent.click(screen.getByRole('combobox', { name: /country/i }))
      await userEvent.click(screen.getByRole('option', { name: 'US' }))
      expect(api.listEmployees).toHaveBeenLastCalledWith({ country: 'US', page: 1, pageSize: 20 })
    })

    it('9. combined: search + department filter sends both params', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) })
      vi.useFakeTimers()
      try {
        renderPage()
        await vi.runAllTimersAsync()
        await user.type(screen.getByRole('textbox', { name: /search/i }), 'alice')
        vi.advanceTimersByTime(500)
        await vi.runAllTimersAsync()
        await user.click(screen.getByRole('combobox', { name: /department/i }))
        await user.click(screen.getByRole('option', { name: 'Engineering' }))
        await vi.runAllTimersAsync()
        expect(api.listEmployees).toHaveBeenLastCalledWith({
          search: 'alice',
          department: 'Engineering',
          page: 1,
          pageSize: 20,
        })
      } finally {
        vi.useRealTimers()
      }
    })

    it('10. changing a filter resets page to 1', async () => {
      vi.mocked(api.listEmployees).mockResolvedValue(makePage({ total: 100 }))
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) })
      vi.useFakeTimers()
      try {
        renderPage()
        await vi.runAllTimersAsync()
        await user.click(screen.getByRole('button', { name: /next/i }))
        await vi.runAllTimersAsync()
        await user.type(screen.getByRole('textbox', { name: /search/i }), 'alice')
        vi.advanceTimersByTime(500)
        await vi.runAllTimersAsync()
        expect(api.listEmployees).toHaveBeenLastCalledWith({ search: 'alice', page: 1, pageSize: 20 })
      } finally {
        vi.useRealTimers()
      }
    })

    it('11. clicking a sort header toggles asc then desc', async () => {
      renderPage()
      await screen.findByText('Alice')
      await userEvent.click(screen.getByRole('columnheader', { name: /salary/i }))
      expect(api.listEmployees).toHaveBeenLastCalledWith({ sort: 'baseSalaryCents:asc', page: 1, pageSize: 20 })
      await userEvent.click(screen.getByRole('columnheader', { name: /salary/i }))
      expect(api.listEmployees).toHaveBeenLastCalledWith({ sort: 'baseSalaryCents:desc', page: 1, pageSize: 20 })
    })
  })

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
