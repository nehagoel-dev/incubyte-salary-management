import { apiFetch, toQueryString } from './client'
import type { Employee, Paginated, ListEmployeesParams, CreateEmployeeInput, UpdateEmployeeInput } from './types'

const BASE = '/api/employees'

export const listEmployees = (params: ListEmployeesParams = {}): Promise<Paginated<Employee>> =>
  apiFetch(`${BASE}${toQueryString(params as Record<string, unknown>)}`)

export const getEmployee = (id: string): Promise<Employee> =>
  apiFetch(`${BASE}/${id}`)

export const createEmployee = (data: CreateEmployeeInput): Promise<Employee> =>
  apiFetch(BASE, { method: 'POST', body: JSON.stringify(data) })

export const updateEmployee = (id: string, data: UpdateEmployeeInput): Promise<Employee> =>
  apiFetch(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(data) })

export const deleteEmployee = (id: string): Promise<void> =>
  apiFetch(`${BASE}/${id}`, { method: 'DELETE' })
