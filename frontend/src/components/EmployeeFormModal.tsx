import { useState } from 'react'
import { Modal, TextInput, Select, Button, Group, Alert } from '@mantine/core'
import { useForm } from '@mantine/form'
import { createEmployee, updateEmployee } from '../lib/api'
import type { Employee } from '../lib/api'

interface Props {
  opened: boolean
  onClose: () => void
  onSuccess?: () => void
  employee?: Employee
}

export default function EmployeeFormModal({ opened, onClose, onSuccess, employee }: Props) {
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm({
    initialValues: {
      firstName: employee?.firstName ?? '',
      lastName: employee?.lastName ?? '',
      email: employee?.email ?? '',
      department: employee?.department ?? '',
      jobTitle: employee?.jobTitle ?? '',
      country: employee?.country ?? '',
      currency: employee?.currency ?? '',
      baseSalaryCents: employee ? String(employee.baseSalaryCents) : '',
      hireDate: employee?.hireDate ?? '',
      employmentType: employee?.employmentType ?? '',
    },
    validate: {
      firstName: (v) => (v.trim() ? null : 'First name is required'),
      email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Invalid email address'),
      baseSalaryCents: (v) => {
        const n = parseInt(v, 10)
        return isNaN(n) || n < 0 ? 'Salary must be positive' : null
      },
    },
  })

  async function handleSubmit(values: typeof form.values) {
    setSubmitError(null)
    try {
      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        department: values.department,
        jobTitle: values.jobTitle,
        country: values.country,
        currency: values.currency,
        baseSalaryCents: parseInt(values.baseSalaryCents, 10),
        hireDate: values.hireDate,
        employmentType: values.employmentType as Employee['employmentType'],
      }

      if (employee) {
        await updateEmployee(employee.id, payload)
      } else {
        await createEmployee(payload)
      }

      onSuccess?.()
      onClose()
    } catch {
      setSubmitError('Failed to save employee. Please try again.')
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title={employee ? 'Edit Employee' : 'Add Employee'}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput label="First Name" {...form.getInputProps('firstName')} />
        <TextInput label="Last Name" {...form.getInputProps('lastName')} />
        <TextInput label="Email" {...form.getInputProps('email')} />
        <TextInput label="Department" {...form.getInputProps('department')} />
        <TextInput label="Job Title" {...form.getInputProps('jobTitle')} />
        <TextInput label="Country" {...form.getInputProps('country')} />
        <TextInput label="Currency" {...form.getInputProps('currency')} />
        <TextInput label="Base Salary Cents" {...form.getInputProps('baseSalaryCents')} />
        <TextInput label="Hire Date" {...form.getInputProps('hireDate')} />
        <Select
          label="Employment Type"
          data={['FULL_TIME', 'PART_TIME', 'CONTRACT']}
          value={form.values.employmentType}
          onChange={(val) => form.setFieldValue('employmentType', val ?? '')}
        />
        {submitError && <Alert color="red">{submitError}</Alert>}
        <Group>
          <Button type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save</Button>
        </Group>
      </form>
    </Modal>
  )
}
