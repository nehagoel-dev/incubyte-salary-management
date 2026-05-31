export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT'

export interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  department: string
  jobTitle: string
  country: string
  currency: string
  baseSalaryCents: number
  employmentType: EmploymentType
  hireDate: string
  createdAt: string
  updatedAt: string
}

export interface Paginated<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export interface ListEmployeesParams {
  page?: number
  pageSize?: number
  search?: string
  department?: string
  country?: string
  sort?: string
}

export type CreateEmployeeInput = Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateEmployeeInput = Partial<CreateEmployeeInput>

export interface SummaryResult {
  headcount: number
  totalPayrollUsdCents: number
  averageSalaryUsdCents: number
  medianSalaryUsdCents: number
}

export interface DepartmentStat extends SummaryResult {
  department: string
}

export interface CountryStat extends SummaryResult {
  country: string
}
