import { useState, useEffect } from 'react'
import { DataTable } from 'mantine-datatable'
import { Skeleton, Center, Text, Modal, Button, Group, ActionIcon } from '@mantine/core'
import { listEmployees, deleteEmployee } from '../lib/api'
import type { Employee } from '../lib/api'

const PAGE_SIZE = 20

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  async function fetchEmployees(p: number) {
    setLoading(true)
    const result = await listEmployees({ page: p, pageSize: PAGE_SIZE })
    setEmployees(result.data)
    setTotal(result.total)
    setLoading(false)
  }

  useEffect(() => {
    fetchEmployees(page)
  }, [page])

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    await deleteEmployee(deleteTarget)
    setDeleteTarget(null)
    await fetchEmployees(page)
  }

  if (loading) {
    return <Skeleton data-testid="employees-loading" height={400} />
  }

  if (employees.length === 0) {
    return (
      <Center>
        <Text>No employees found</Text>
      </Center>
    )
  }

  return (
    <>
      <DataTable
        records={employees}
        totalRecords={total}
        page={page}
        onPageChange={setPage}
        recordsPerPage={PAGE_SIZE}
        paginationWithControls
        columns={[
          {
            accessor: 'name',
            title: 'Name',
            render: (e) => (
              <>
                <span>{e.firstName}</span> <span>{e.lastName}</span>
              </>
            ),
          },
          { accessor: 'email', title: 'Email' },
          { accessor: 'department', title: 'Department' },
          { accessor: 'jobTitle', title: 'Job Title' },
          { accessor: 'country', title: 'Country' },
          {
            accessor: 'baseSalaryCents',
            title: 'Salary',
            render: (e) =>
              new Intl.NumberFormat('en-US', { style: 'currency', currency: e.currency }).format(
                e.baseSalaryCents / 100,
              ),
          },
          { accessor: 'employmentType', title: 'Type' },
          {
            accessor: 'hireDate',
            title: 'Hire Date',
            render: (e) => e.hireDate.split('T')[0],
          },
          {
            accessor: 'actions',
            title: '',
            render: (e) => (
              <ActionIcon aria-label="Delete" onClick={() => setDeleteTarget(e.id)}>
                ×
              </ActionIcon>
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
    </>
  )
}
