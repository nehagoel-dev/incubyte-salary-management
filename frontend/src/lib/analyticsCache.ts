import { getAnalyticsSummary, getAnalyticsByDepartment, getAnalyticsByCountry } from '../lib/api'
import type { SummaryResult, DepartmentStat, CountryStat } from '../lib/api'

let summaryP: Promise<SummaryResult> | null = null
let deptP: Promise<DepartmentStat[]> | null = null
let countryP: Promise<CountryStat[]> | null = null

/** Called from App on mount — starts all three fetches immediately. */
export function prefetchAnalytics() {
  summaryP = summaryP ?? getAnalyticsSummary()
  deptP = deptP ?? getAnalyticsByDepartment()
  countryP = countryP ?? getAnalyticsByCountry()
}

/** Returns the in-flight / already-resolved Promise (or starts a new one). */
export function fetchSummary(): Promise<SummaryResult> {
  return summaryP ?? getAnalyticsSummary()
}
export function fetchDeptData(): Promise<DepartmentStat[]> {
  return deptP ?? getAnalyticsByDepartment()
}
export function fetchCountryData(): Promise<CountryStat[]> {
  return countryP ?? getAnalyticsByCountry()
}

/** Reset for tests — call in beforeEach to prevent cross-test pollution. */
export function resetAnalyticsCache() {
  summaryP = null
  deptP = null
  countryP = null
}
