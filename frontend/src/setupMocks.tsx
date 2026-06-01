import React, { useState } from 'react'
import { vi } from 'vitest'

// Full synchronous mock of @mantine/core — plain HTML stubs, zero internal timers.
// This is necessary because MantineProvider + Combobox/Popover use requestAnimationFrame
// and other timer APIs that create infinite loops with vi.runAllTimersAsync().
vi.mock('@mantine/core', () => {
  function MantineProvider({ children }: { children?: React.ReactNode }) {
    return <>{children}</>
  }

  function Group({ children, ...props }: { children?: React.ReactNode; [k: string]: unknown }) {
    return <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>
  }

  function TextInput({
    label,
    value,
    onChange,
    placeholder,
    error,
  }: {
    label?: string
    value?: string
    onChange?: React.ChangeEventHandler<HTMLInputElement>
    placeholder?: string
    error?: React.ReactNode
    [k: string]: unknown
  }) {
    return (
      <div>
        {label && <label>{label}</label>}
        <input
          type="text"
          aria-label={label}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
        />
        {error && <span>{error}</span>}
      </div>
    )
  }

  type SelectOption = string | { value: string; label: string }
  const optVal = (o: SelectOption) => (typeof o === 'string' ? o : o.value)
  const optLabel = (o: SelectOption) => (typeof o === 'string' ? o : o.label)

  function Select({
    label,
    data = [],
    value,
    onChange,
    placeholder,
    error,
  }: {
    label?: string
    data?: SelectOption[]
    value?: string | null
    onChange?: (v: string | null) => void
    placeholder?: string
    error?: React.ReactNode
    [k: string]: unknown
  }) {
    const [open, setOpen] = useState(false)
    return (
      <div>
        {label && <label>{label}</label>}
        <input
          role="combobox"
          aria-label={label}
          readOnly
          value={value ?? ''}
          placeholder={placeholder}
          onClick={() => setOpen((o) => !o)}
        />
        {open && (
          <ul role="listbox">
            {data.map((opt) => (
              <li key={optVal(opt)} role="option" onClick={() => { onChange?.(optVal(opt)); setOpen(false) }}>
                {optLabel(opt)}
              </li>
            ))}
          </ul>
        )}
        {error && <span>{error}</span>}
      </div>
    )
  }

  function Skeleton({ children, height, ...props }: { children?: React.ReactNode; height?: number; [k: string]: unknown }) {
    return <div style={{ height }} {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>
  }

  function Center({ children }: { children?: React.ReactNode }) {
    return <div>{children}</div>
  }

  function Text({ children }: { children?: React.ReactNode }) {
    return <span>{children}</span>
  }

  function Modal({ opened, children, onClose, title }: { opened?: boolean; children?: React.ReactNode; onClose?: () => void; title?: React.ReactNode; [k: string]: unknown }) {
    if (!opened) return null
    return (
      <div role="dialog" aria-label={typeof title === 'string' ? title : undefined}>
        {children}
      </div>
    )
  }

  function Button({ children, onClick, variant, color, ...props }: { children?: React.ReactNode; onClick?: () => void; variant?: string; color?: string; [k: string]: unknown }) {
    return <button onClick={onClick} {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>{children}</button>
  }

  function ActionIcon({ children, onClick, ...props }: { children?: React.ReactNode; onClick?: () => void; [k: string]: unknown }) {
    return <button onClick={onClick} {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>{children}</button>
  }

  function Container({ children }: { children?: React.ReactNode }) {
    return <div>{children}</div>
  }

  function Title({ children }: { children?: React.ReactNode }) {
    return <h1>{children}</h1>
  }

  function Loader(_props: { [k: string]: unknown }) {
    return <div data-testid="mantine-loader" />
  }

  function Alert({ children }: { children?: React.ReactNode; [k: string]: unknown }) {
    return <div role="alert">{children}</div>
  }

  function Paper({ children }: { children?: React.ReactNode; [k: string]: unknown }) {
    return <div>{children}</div>
  }

  function Stack({ children }: { children?: React.ReactNode; [k: string]: unknown }) {
    return <div>{children}</div>
  }

  function SimpleGrid({ children }: { children?: React.ReactNode; [k: string]: unknown }) {
    return <div>{children}</div>
  }

  function NavLink({ label, onClick }: { label?: string; onClick?: () => void; [k: string]: unknown }) {
    return <a role="link" style={{ cursor: 'pointer' }} onClick={onClick}>{label}</a>
  }

  const AppShell = Object.assign(
    function AppShell({ children }: { children?: React.ReactNode; [k: string]: unknown }) {
      return <div>{children}</div>
    },
    {
      Header: function Header({ children }: { children?: React.ReactNode; [k: string]: unknown }) {
        return <header>{children}</header>
      },
      Navbar: function Navbar({ children }: { children?: React.ReactNode; [k: string]: unknown }) {
        return <nav>{children}</nav>
      },
      Main: function Main({ children }: { children?: React.ReactNode; [k: string]: unknown }) {
        return <main>{children}</main>
      },
    }
  )

  return { MantineProvider, Group, TextInput, Select, Skeleton, Center, Text, Modal, Button, ActionIcon, Container, Title, Loader, Alert, Paper, Stack, SimpleGrid, NavLink, AppShell }
})

// Stub @mantine/charts — render dataKey labels as text spans so tests can assert on them.
vi.mock('@mantine/charts', () => ({
  BarChart: ({
    data = [],
    dataKey,
  }: {
    data?: Record<string, unknown>[]
    dataKey?: string
    [k: string]: unknown
  }) => (
    <div>
      {data.map((item, i) => (
        <span key={i}>{dataKey ? String(item[dataKey]) : ''}</span>
      ))}
    </div>
  ),
}))

// Replace mantine-datatable DataTable with a simple table that renders column headers
// (for sort tests) and rows, plus a Next button for pagination tests.
vi.mock('mantine-datatable', () => ({
  DataTable: ({
    records = [],
    columns = [],
    page = 1,
    onPageChange,
    totalRecords = 0,
    recordsPerPage = 20,
    sortStatus,
    onSortStatusChange,
  }: {
    records?: Record<string, unknown>[]
    columns?: {
      accessor: string
      title?: string
      sortable?: boolean
      render?: (r: Record<string, unknown>, i: number) => unknown
    }[]
    page?: number
    onPageChange?: (p: number) => void
    totalRecords?: number
    recordsPerPage?: number
    sortStatus?: { columnAccessor: string; direction: 'asc' | 'desc' } | null
    onSortStatusChange?: (s: { columnAccessor: string; direction: 'asc' | 'desc' }) => void
    [key: string]: unknown
  }) => {
    const totalPages = Math.ceil(totalRecords / recordsPerPage)

    function handleHeaderClick(col: { accessor: string; sortable?: boolean }) {
      if (!col.sortable || !onSortStatusChange) return
      const dir =
        sortStatus?.columnAccessor === col.accessor && sortStatus.direction === 'asc'
          ? 'desc'
          : 'asc'
      onSortStatusChange({ columnAccessor: col.accessor, direction: dir })
    }

    return (
      <div>
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.accessor} onClick={() => handleHeaderClick(col)}>
                  {col.title ?? col.accessor}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((record, i) => (
              <tr key={(record.id as string) ?? i}>
                {columns.map((col) => (
                  <td key={col.accessor}>
                    {col.render
                      ? (col.render(record, i) as React.ReactNode)
                      : (record[col.accessor] as string)}
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
