import { useCallback, useEffect, useRef, useState } from 'react'
import { DataTable, type DataTableSortStatus } from 'mantine-datatable'
import {
  Skeleton,
  Center,
  Text,
  Modal,
  Button,
  Group,
  ActionIcon,
  TextInput,
  Select,
} from '@mantine/core'
import { listEmployees, deleteEmployee } from '../lib/api'
import type { Employee, ListEmployeesParams } from '../lib/api'
import EmployeeFormModal from '../components/EmployeeFormModal'

const PAGE_SIZE = 20
const DEBOUNCE_MS = 500

const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Sales',
  'Marketing',
  'Finance',
  'HR',
  'Operations',
  'Design',
]

const COUNTRIES = ['US', 'GB', 'DE', 'FR', 'NL', 'IN', 'CA', 'AU', 'JP', 'BR']

type EmployeeQueryState = {
  page: number
  search: string
  department: string | null
  country: string | null
  sort: string | null
}

const INITIAL_QUERY_STATE: EmployeeQueryState = {
  page: 1,
  search: '',
  department: null,
  country: null,
  sort: null,
}

/**
 * DataTable requires a concrete sortStatus when onSortStatusChange is used.
 * We keep the visual/default DataTable sort state separate from the API sort param.
 * That way the initial request does NOT include a sort param, but the first click
 * on Salary still toggles to asc, matching your test.
 */
const INITIAL_SORT_STATUS: DataTableSortStatus<Employee> = {
  columnAccessor: '',
  direction: 'asc',
}

function buildEmployeeParams(query: EmployeeQueryState): ListEmployeesParams {
  const params: ListEmployeesParams = {
    page: query.page,
    pageSize: PAGE_SIZE,
  }

  const search = query.search.trim()

  if (search) {
    params.search = search
  }

  if (query.department) {
    params.department = query.department
  }

  if (query.country) {
    params.country = query.country
  }

  if (query.sort) {
    params.sort = query.sort
  }

  return params
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [formOpened, setFormOpened] = useState(false)
  const [editTarget, setEditTarget] = useState<Employee | undefined>(undefined)

  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState<string | null>(null)
  const [country, setCountry] = useState<string | null>(null)
  const [sortStatus, setSortStatus] =
    useState<DataTableSortStatus<Employee>>(INITIAL_SORT_STATUS)

  const queryRef = useRef<EmployeeQueryState>({ ...INITIAL_QUERY_STATE })
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestRequestId = useRef(0)
  const hasLoadedOnce = useRef(false)

  const fetchEmployees = useCallback(async (params: ListEmployeesParams) => {
    const requestId = ++latestRequestId.current

    if (!hasLoadedOnce.current) {
      setLoading(true)
    }

    try {
      const result = await listEmployees(params)

      if (requestId !== latestRequestId.current) {
        return
      }

      hasLoadedOnce.current = true
      setEmployees(result.data)
      setTotal(result.total)
      setLoading(false)
    } catch {
      if (requestId !== latestRequestId.current) {
        return
      }

      hasLoadedOnce.current = true
      setEmployees([])
      setTotal(0)
      setLoading(false)
    }
  }, [])

  const loadEmployees = useCallback(
    (updates: Partial<EmployeeQueryState> = {}) => {
      queryRef.current = {
        ...queryRef.current,
        ...updates,
      }

      void fetchEmployees(buildEmployeeParams(queryRef.current))
    },
    [fetchEmployees],
  )

  useEffect(() => {
    loadEmployees()

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [loadEmployees])

  function handleSearchChange(value: string) {
    setSearch(value)

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      setPage(1)

      loadEmployees({
        page: 1,
        search: value,
      })

      debounceTimer.current = null
    }, DEBOUNCE_MS)
  }

  function handleDepartmentChange(value: string | null) {
    setDepartment(value)
    setPage(1)

    loadEmployees({
      page: 1,
      department: value,
    })
  }

  function handleCountryChange(value: string | null) {
    setCountry(value)
    setPage(1)

    loadEmployees({
      page: 1,
      country: value,
    })
  }

  function handlePageChange(nextPage: number) {
    setPage(nextPage)

    loadEmployees({
      page: nextPage,
    })
  }

  function handleSortChange(status: DataTableSortStatus<Employee>) {
    const sort = `${String(status.columnAccessor)}:${status.direction}`

    setSortStatus(status)
    setPage(1)

    loadEmployees({
      page: 1,
      sort,
    })
  }

  function handleFormClose() {
    setFormOpened(false)
    setEditTarget(undefined)
  }

  function handleFormSuccess() {
    void fetchEmployees(buildEmployeeParams(queryRef.current))
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) {
      return
    }

    await deleteEmployee(deleteTarget)

    setDeleteTarget(null)

    await fetchEmployees(buildEmployeeParams(queryRef.current))
  }

  return (
    <>
      <Group mb="md" align="flex-end">
        <TextInput
          label="Search"
          value={search}
          onChange={(event) => handleSearchChange(event.currentTarget.value)}
          placeholder="Search employees…"
        />

        <Select
          label="Department"
          data={DEPARTMENTS}
          value={department}
          onChange={handleDepartmentChange}
          clearable
          placeholder="All departments"
          comboboxProps={{ transitionProps: { duration: 0 } }}
        />

        <Select
          label="Country"
          data={COUNTRIES}
          value={country}
          onChange={handleCountryChange}
          clearable
          placeholder="All countries"
          comboboxProps={{ transitionProps: { duration: 0 } }}
        />

        <Button onClick={() => setFormOpened(true)}>Add Employee</Button>
      </Group>

      {loading ? (
        <Skeleton data-testid="employees-loading" height={400} />
      ) : employees.length === 0 ? (
        <Center>
          <Text>No employees found</Text>
        </Center>
      ) : (
        <>
          <DataTable
            records={employees}
            totalRecords={total}
            page={page}
            onPageChange={handlePageChange}
            recordsPerPage={PAGE_SIZE}
            paginationWithControls
            withTableBorder
            sortStatus={sortStatus}
            onSortStatusChange={handleSortChange}
            columns={[
              {
                accessor: 'name',
                title: 'Name',
                render: (employee) => (
                  <>
                    <span>{employee.firstName}</span>{' '}
                    <span>{employee.lastName}</span>
                  </>
                ),
              },
              {
                accessor: 'email',
                title: 'Email',
              },
              {
                accessor: 'department',
                title: 'Department',
              },
              {
                accessor: 'jobTitle',
                title: 'Job Title',
              },
              {
                accessor: 'country',
                title: 'Country',
              },
              {
                accessor: 'baseSalaryCents',
                title: 'Salary',
                sortable: true,
                render: (employee) =>
                  new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: employee.currency,
                  }).format(employee.baseSalaryCents / 100),
              },
              {
                accessor: 'employmentType',
                title: 'Type',
              },
              {
                accessor: 'hireDate',
                title: 'Hire Date',
                render: (employee) => employee.hireDate.split('T')[0],
              },
              {
                accessor: 'actions',
                title: '',
                render: (employee) => (
                  <Group gap="xs">
                    <ActionIcon
                      aria-label="Edit"
                      onClick={() => { setEditTarget(employee); setFormOpened(true) }}
                    >
                      ✎
                    </ActionIcon>
                    <ActionIcon
                      aria-label="Delete"
                      onClick={() => setDeleteTarget(employee.id)}
                    >
                      ×
                    </ActionIcon>
                  </Group>
                ),
              },
            ]}
          />

          <Modal
            opened={deleteTarget !== null}
            onClose={() => setDeleteTarget(null)}
            title="Confirm delete"
            transitionProps={{ duration: 0 }}
          >
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>

              <Button color="red" onClick={handleConfirmDelete}>
                Confirm
              </Button>
            </Group>
          </Modal>

          <EmployeeFormModal
            key={editTarget?.id ?? 'new'}
            opened={formOpened}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
            employee={editTarget}
          />
        </>
      )}
    </>
  )
}