import { apiFetch } from './client'
import type { SummaryResult, DepartmentStat, CountryStat } from './types'

const BASE = '/api/analytics'

export const getAnalyticsSummary = (): Promise<SummaryResult> =>
  apiFetch(`${BASE}/summary`)

export const getAnalyticsByDepartment = (): Promise<DepartmentStat[]> =>
  apiFetch(`${BASE}/by-department`)

export const getAnalyticsByCountry = (): Promise<CountryStat[]> =>
  apiFetch(`${BASE}/by-country`)
