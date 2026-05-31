import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { listEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee } from './employees'
import type { Employee, Paginated } from './types'

const mockEmployee: Employee = {
  id: 'clx1',
  firstName: 'Alice',
  lastName: 'Smith',
  email: 'alice@example.com',
  department: 'Engineering',
  jobTitle: 'Engineer',
  country: 'US',
  currency: 'USD',
  baseSalaryCents: 10000000,
  employmentType: 'FULL_TIME',
  hireDate: '2022-01-01T00:00:00.000Z',
  createdAt: '2022-01-01T00:00:00.000Z',
  updatedAt: '2022-01-01T00:00:00.000Z',
}

const mockPage: Paginated<Employee> = { data: [mockEmployee], total: 1, page: 1, pageSize: 20 }

function mockFetch(body: unknown, status = 200) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
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

describe('listEmployees', () => {
  it('calls /api/employees with query params and returns parsed JSON', async () => {
    mockFetch(mockPage)
    const result = await listEmployees({ page: 1, pageSize: 20, department: 'Engineering' })
    expect(fetch).toHaveBeenCalledOnce()
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/employees?page=1&pageSize=20&department=Engineering',
      expect.objectContaining({ headers: expect.any(Object) }),
    )
    expect(result).toEqual(mockPage)
  })

  it('omits undefined params from query string', async () => {
    mockFetch(mockPage)
    await listEmployees({ page: 1 })
    const [url] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe('http://localhost:3000/api/employees?page=1')
  })

  it('calls /api/employees with no query string when no params given', async () => {
    mockFetch(mockPage)
    await listEmployees()
    const [url] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe('http://localhost:3000/api/employees')
  })
})

describe('getEmployee', () => {
  it('calls /api/employees/:id and returns the employee', async () => {
    mockFetch(mockEmployee)
    const result = await getEmployee('clx1')
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/employees/clx1',
      expect.objectContaining({ headers: expect.any(Object) }),
    )
    expect(result).toEqual(mockEmployee)
  })
})

describe('createEmployee', () => {
  it('POSTs to /api/employees with JSON body and returns new employee', async () => {
    mockFetch(mockEmployee, 201)
    const { id, createdAt, updatedAt, ...input } = mockEmployee
    const result = await createEmployee(input)
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/employees',
      expect.objectContaining({ method: 'POST', body: JSON.stringify(input) }),
    )
    expect(result).toEqual(mockEmployee)
  })
})

describe('updateEmployee', () => {
  it('PATCHes /api/employees/:id with partial body and returns updated employee', async () => {
    const updated = { ...mockEmployee, jobTitle: 'Senior Engineer' }
    mockFetch(updated)
    const result = await updateEmployee('clx1', { jobTitle: 'Senior Engineer' })
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/employees/clx1',
      expect.objectContaining({ method: 'PATCH', body: JSON.stringify({ jobTitle: 'Senior Engineer' }) }),
    )
    expect(result).toEqual(updated)
  })
})

describe('deleteEmployee', () => {
  it('DELETEs /api/employees/:id and resolves', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, status: 204, json: () => Promise.resolve(undefined), text: () => Promise.resolve('') }),
    )
    await expect(deleteEmployee('clx1')).resolves.toBeUndefined()
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/employees/clx1',
      expect.objectContaining({ method: 'DELETE' }),
    )
  })
})

describe('ApiError', () => {
  it('throws ApiError with status when response is not ok', async () => {
    mockFetch({ message: 'Not Found' }, 404)
    await expect(getEmployee('bad-id')).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
    })
  })
})
