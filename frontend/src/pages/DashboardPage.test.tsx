import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import DashboardPage from './DashboardPage'
import * as api from '../lib/api'
import type { SummaryResult, DepartmentStat, CountryStat } from '../lib/api'

vi.mock('../lib/api')

const mockSummary: SummaryResult = {
  headcount: 4,
  totalPayrollUsdCents: 228600,
  averageSalaryUsdCents: 57150,
  medianSalaryUsdCents: 55000,
}

const mockDeptData: DepartmentStat[] = [
  {
    department: 'Engineering',
    headcount: 2,
    totalPayrollUsdCents: 159000,
    averageSalaryUsdCents: 79500,
    medianSalaryUsdCents: 79500,
  },
  {
    department: 'Sales',
    headcount: 2,
    totalPayrollUsdCents: 69600,
    averageSalaryUsdCents: 34800,
    medianSalaryUsdCents: 34800,
  },
]

const mockCountryData: CountryStat[] = [
  {
    country: 'US',
    headcount: 2,
    totalPayrollUsdCents: 159000,
    averageSalaryUsdCents: 79500,
    medianSalaryUsdCents: 79500,
  },
  {
    country: 'DE',
    headcount: 1,
    totalPayrollUsdCents: 34800,
    averageSalaryUsdCents: 34800,
    medianSalaryUsdCents: 34800,
  },
  {
    country: 'IN',
    headcount: 1,
    totalPayrollUsdCents: 34800,
    averageSalaryUsdCents: 34800,
    medianSalaryUsdCents: 34800,
  },
]

function renderPage() {
  render(
    <MantineProvider>
      <DashboardPage />
    </MantineProvider>,
  )
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('DashboardPage', () => {
  it('1. shows a loading indicator while all API calls are pending', () => {
    vi.mocked(api.getAnalyticsSummary).mockReturnValue(new Promise(() => {}))
    vi.mocked(api.getAnalyticsByDepartment).mockReturnValue(new Promise(() => {}))
    vi.mocked(api.getAnalyticsByCountry).mockReturnValue(new Promise(() => {}))

    renderPage()

    expect(screen.getByTestId('dashboard-loading')).toBeInTheDocument()
    expect(screen.queryByText('4')).not.toBeInTheDocument()
  })

  it('2. renders summary cards with correct cent-to-dollar formatted values', async () => {
    vi.mocked(api.getAnalyticsSummary).mockResolvedValue(mockSummary)
    vi.mocked(api.getAnalyticsByDepartment).mockResolvedValue([])
    vi.mocked(api.getAnalyticsByCountry).mockResolvedValue([])

    renderPage()

    await screen.findByText('4')
    expect(screen.getByText('$2,286.00')).toBeInTheDocument()
    expect(screen.getByText('$571.50')).toBeInTheDocument()
    expect(screen.getByText('$550.00')).toBeInTheDocument()
  })

  it('3. shows an error message and no stat cards when getSummary rejects', async () => {
    vi.mocked(api.getAnalyticsSummary).mockRejectedValue(new Error('Network error'))
    vi.mocked(api.getAnalyticsByDepartment).mockResolvedValue([])
    vi.mocked(api.getAnalyticsByCountry).mockResolvedValue([])

    renderPage()

    await screen.findByText(/error|failed/i)
    expect(screen.queryByText('4')).not.toBeInTheDocument()
  })

  it('4. renders department labels when getByDepartment resolves', async () => {
    vi.mocked(api.getAnalyticsSummary).mockResolvedValue(mockSummary)
    vi.mocked(api.getAnalyticsByDepartment).mockResolvedValue(mockDeptData)
    vi.mocked(api.getAnalyticsByCountry).mockResolvedValue([])

    renderPage()

    await screen.findByText('Engineering')
    expect(screen.getByText('Sales')).toBeInTheDocument()
  })

  it('5. renders country labels when getByCountry resolves', async () => {
    vi.mocked(api.getAnalyticsSummary).mockResolvedValue(mockSummary)
    vi.mocked(api.getAnalyticsByDepartment).mockResolvedValue([])
    vi.mocked(api.getAnalyticsByCountry).mockResolvedValue(mockCountryData)

    renderPage()

    await screen.findByText('US')
    expect(screen.getByText('DE')).toBeInTheDocument()
    expect(screen.getByText('IN')).toBeInTheDocument()
  })
})
