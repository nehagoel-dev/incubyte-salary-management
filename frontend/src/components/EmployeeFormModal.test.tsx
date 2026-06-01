import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MantineProvider } from '@mantine/core'
import EmployeeFormModal from './EmployeeFormModal'
import * as api from '../lib/api'
import type { Employee } from '../lib/api'

vi.mock('../lib/api')

const mockEmployee: Employee = {
  id: '1',
  firstName: 'Alice',
  lastName: 'Smith',
  email: 'alice@example.com',
  department: 'Engineering',
  jobTitle: 'Engineer',
  country: 'US',
  currency: 'USD',
  baseSalaryCents: 8000000,
  employmentType: 'FULL_TIME',
  hireDate: '2022-01-01',
  createdAt: '2022-01-01T00:00:00.000Z',
  updatedAt: '2022-01-01T00:00:00.000Z',
}

function renderModal(props?: { employee?: Employee; onClose?: () => void }) {
  const onClose = props?.onClose ?? vi.fn()
  render(
    <MantineProvider>
      <EmployeeFormModal opened onClose={onClose} employee={props?.employee} />
    </MantineProvider>,
  )
  return { onClose }
}

const SELECT_FIELDS = new Set(['department', 'country', 'employmentType'])

async function fillAllFields(user: ReturnType<typeof userEvent.setup>, overrides: Partial<Record<string, string>> = {}) {
  const fields: Record<string, string> = {
    firstName: 'Bob',
    lastName: 'Jones',
    email: 'bob@example.com',
    department: 'Engineering',
    jobTitle: 'Engineer',
    country: 'US',
    currency: 'USD',
    baseSalaryCents: '9000000',
    hireDate: '2022-06-01',
    ...overrides,
  }

  for (const [label, value] of Object.entries(fields)) {
    if (value === '' || SELECT_FIELDS.has(label)) continue
    const input = screen.getByRole('textbox', { name: new RegExp(label.replace(/([A-Z])/g, '.?$1'), 'i') })
    await user.clear(input)
    await user.type(input, value)
  }

  // department Select
  const dept = overrides.department ?? 'Engineering'
  if (dept !== '') {
    await user.click(screen.getByRole('combobox', { name: /^department$/i }))
    await user.click(screen.getByRole('option', { name: dept }))
  }

  // country Select
  const cntry = overrides.country ?? 'US'
  if (cntry !== '') {
    await user.click(screen.getByRole('combobox', { name: /^country$/i }))
    await user.click(screen.getByRole('option', { name: cntry }))
  }

  // employmentType Select
  const empType = overrides.employmentType ?? 'FULL_TIME'
  await user.click(screen.getByRole('combobox', { name: /employment.?type/i }))
  await user.click(screen.getByRole('option', { name: empType }))
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('EmployeeFormModal', () => {
  it('1. required firstName: shows error and does not call createEmployee when firstName is empty', async () => {
    vi.mocked(api.createEmployee).mockResolvedValue(mockEmployee)
    const user = userEvent.setup()
    renderModal()

    await fillAllFields(user, { firstName: '' })
    await user.click(screen.getByRole('button', { name: /save|submit/i }))

    expect(screen.getByText(/first.?name.*required|required.*first.?name/i)).toBeInTheDocument()
    expect(api.createEmployee).not.toHaveBeenCalled()
  })

  it('2. invalid email: shows error and does not call createEmployee', async () => {
    vi.mocked(api.createEmployee).mockResolvedValue(mockEmployee)
    const user = userEvent.setup()
    renderModal()

    await fillAllFields(user, { email: 'notanemail' })
    await user.click(screen.getByRole('button', { name: /save|submit/i }))

    expect(screen.getByText(/invalid.?email|email.*invalid/i)).toBeInTheDocument()
    expect(api.createEmployee).not.toHaveBeenCalled()
  })

  it('3. negative salary: shows error and does not call createEmployee', async () => {
    vi.mocked(api.createEmployee).mockResolvedValue(mockEmployee)
    const user = userEvent.setup()
    renderModal()

    await fillAllFields(user, { baseSalaryCents: '-1' })
    await user.click(screen.getByRole('button', { name: /save|submit/i }))

    expect(screen.getByText(/salary.*positive|salary.*negative|must be.*positive/i)).toBeInTheDocument()
    expect(api.createEmployee).not.toHaveBeenCalled()
  })

  it('4. valid create: calls createEmployee with correct values and closes modal on success', async () => {
    vi.mocked(api.createEmployee).mockResolvedValue(mockEmployee)
    const user = userEvent.setup()
    const { onClose } = renderModal()

    await fillAllFields(user)
    await user.click(screen.getByRole('button', { name: /save|submit/i }))

    await waitFor(() => {
      expect(api.createEmployee).toHaveBeenCalledWith({
        firstName: 'Bob',
        lastName: 'Jones',
        email: 'bob@example.com',
        department: 'Engineering',
        jobTitle: 'Engineer',
        country: 'US',
        currency: 'USD',
        baseSalaryCents: 9000000,
        employmentType: 'FULL_TIME',
        hireDate: '2022-06-01',
      })
    })
    expect(typeof (api.createEmployee as ReturnType<typeof vi.fn>).mock.calls[0][0].baseSalaryCents).toBe('number')
    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })

  it('5. edit pre-population: form fields are pre-filled with the employee\'s current values', () => {
    renderModal({ employee: mockEmployee })

    expect(screen.getByRole('textbox', { name: /first.?name/i })).toHaveValue('Alice')
    expect(screen.getByRole('textbox', { name: /last.?name/i })).toHaveValue('Smith')
    expect(screen.getByRole('textbox', { name: /email/i })).toHaveValue('alice@example.com')
    expect(screen.getByRole('combobox', { name: /^department$/i })).toHaveValue('Engineering')
    expect(screen.getByRole('textbox', { name: /job.?title/i })).toHaveValue('Engineer')
    expect(screen.getByRole('combobox', { name: /^country$/i })).toHaveValue('US')
    expect(screen.getByRole('textbox', { name: /currency/i })).toHaveValue('USD')
    expect(screen.getByRole('textbox', { name: /salary/i })).toHaveValue('8000000')
    expect(screen.getByRole('textbox', { name: /hire.?date/i })).toHaveValue('2022-01-01')
    expect(screen.getByRole('combobox', { name: /employment.?type/i })).toHaveValue('FULL_TIME')
  })

  it('6. valid edit submit: calls updateEmployee with id and changed fields', async () => {
    vi.mocked(api.updateEmployee).mockResolvedValue({ ...mockEmployee, firstName: 'Robert' })
    const user = userEvent.setup()
    renderModal({ employee: mockEmployee })

    const firstNameInput = screen.getByRole('textbox', { name: /first.?name/i })
    await user.clear(firstNameInput)
    await user.type(firstNameInput, 'Robert')
    await user.click(screen.getByRole('button', { name: /save|submit/i }))

    await waitFor(() => {
      expect(api.updateEmployee).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({ firstName: 'Robert' }),
      )
    })
  })

  it('7. cancel: clicking cancel calls neither createEmployee nor updateEmployee', async () => {
    const user = userEvent.setup()
    renderModal()

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(api.createEmployee).not.toHaveBeenCalled()
    expect(api.updateEmployee).not.toHaveBeenCalled()
  })

  it('8. createEmployee rejection: shows error alert and does not close modal', async () => {
    vi.mocked(api.createEmployee).mockRejectedValue(new Error('Server error'))
    const user = userEvent.setup()
    const { onClose } = renderModal()

    await fillAllFields(user)
    await user.click(screen.getByRole('button', { name: /save|submit/i }))

    await screen.findByRole('alert')
    expect(onClose).not.toHaveBeenCalled()
  })

  it('9. updateEmployee rejection: shows error alert and does not close modal', async () => {
    vi.mocked(api.updateEmployee).mockRejectedValue(new Error('Server error'))
    const user = userEvent.setup()
    const { onClose } = renderModal({ employee: mockEmployee })

    const firstNameInput = screen.getByRole('textbox', { name: /first.?name/i })
    await user.clear(firstNameInput)
    await user.type(firstNameInput, 'Robert')
    await user.click(screen.getByRole('button', { name: /save|submit/i }))

    await screen.findByRole('alert')
    expect(onClose).not.toHaveBeenCalled()
  })
})
