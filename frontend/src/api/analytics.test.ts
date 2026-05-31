import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getAnalyticsSummary, getAnalyticsByDepartment, getAnalyticsByCountry } from './analytics'
import type { SummaryResult, DepartmentStat, CountryStat } from './types'

const mockSummary: SummaryResult = {
  headcount: 100,
  totalPayrollUsdCents: 500000000,
  averageSalaryUsdCents: 5000000,
  medianSalaryUsdCents: 4800000,
}

const mockDeptStats: DepartmentStat[] = [
  { department: 'Engineering', headcount: 60, totalPayrollUsdCents: 300000000, averageSalaryUsdCents: 5000000, medianSalaryUsdCents: 4900000 },
]

const mockCountryStats: CountryStat[] = [
  { country: 'US', headcount: 80, totalPayrollUsdCents: 400000000, averageSalaryUsdCents: 5000000, medianSalaryUsdCents: 4800000 },
]

function mockFetch(body: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(body),
      text: () => Promise.resolve(JSON.stringify(body)),
    }),
  )
}

beforeEach(() => {
  vi.stubEnv('VITE_API_URL', 'http://localhost:3000')
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('getAnalyticsSummary', () => {
  it('calls /api/analytics/summary and returns SummaryResult', async () => {
    mockFetch(mockSummary)
    const result = await getAnalyticsSummary()
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/analytics/summary',
      expect.objectContaining({ headers: expect.any(Object) }),
    )
    expect(result).toEqual(mockSummary)
  })
})

describe('getAnalyticsByDepartment', () => {
  it('calls /api/analytics/by-department and returns DepartmentStat[]', async () => {
    mockFetch(mockDeptStats)
    const result = await getAnalyticsByDepartment()
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/analytics/by-department',
      expect.objectContaining({ headers: expect.any(Object) }),
    )
    expect(result).toEqual(mockDeptStats)
  })
})

describe('getAnalyticsByCountry', () => {
  it('calls /api/analytics/by-country and returns CountryStat[]', async () => {
    mockFetch(mockCountryStats)
    const result = await getAnalyticsByCountry()
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/analytics/by-country',
      expect.objectContaining({ headers: expect.any(Object) }),
    )
    expect(result).toEqual(mockCountryStats)
  })
})
