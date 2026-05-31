import React from 'react'
import { vi } from 'vitest'

vi.mock('mantine-datatable', () => ({
  DataTable: ({
    records = [],
    columns = [],
    page = 1,
    onPageChange,
    totalRecords = 0,
    recordsPerPage = 20,
  }: {
    records?: Record<string, unknown>[]
    columns?: { accessor: string; render?: (r: Record<string, unknown>, i: number) => unknown }[]
    page?: number
    onPageChange?: (p: number) => void
    totalRecords?: number
    recordsPerPage?: number
    [key: string]: unknown
  }) => {
    const totalPages = Math.ceil(totalRecords / recordsPerPage)
    return (
      <div>
        <table>
          <tbody>
            {records.map((record, i) => (
              <tr key={(record.id as string) ?? i}>
                {columns.map((col) => (
                  <td key={col.accessor}>
                    {col.render ? col.render(record, i) as React.ReactNode : (record[col.accessor] as string)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {page < totalPages && (
          <button onClick={() => onPageChange?.(page + 1)}>Next</button>
        )}
      </div>
    )
  },
}))
