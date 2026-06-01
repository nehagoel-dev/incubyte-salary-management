import { useState } from 'react'
import { Modal, TextInput, Select, Button, Group, Alert, Stack } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { createEmployee, updateEmployee } from '../lib/api'
import type { Employee } from '../lib/api'
import { DEPARTMENTS, COUNTRIES, CURRENCIES, COUNTRY_CURRENCY_MAP, EMPLOYMENT_TYPE_OPTIONS } from '../lib/constants'

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
    validateInputOnChange: true,
    validate: {
      firstName: (v) => (v.trim() ? null : 'First name is required'),
      lastName: (v) => (v.trim() ? null : 'Last name is required'),
      email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Invalid email address'),
      department: (v) => (v.trim() ? null : 'Department is required'),
      jobTitle: (v) => (v.trim() ? null : 'Job title is required'),
      country: (v) => (v.trim() ? null : 'Country is required'),
      currency: (v) => (v.trim() ? null : 'Currency is required'),
      baseSalaryCents: (v) => {
        const n = parseInt(v, 10)
        return isNaN(n) || n < 0 ? 'Salary must be positive' : null
      },
      hireDate: (v) => (v.trim() ? null : 'Hire date is required'),
      employmentType: (v) => (v.trim() ? null : 'Employment type is required'),
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
        notifications.show({
          title: 'Employee updated',
          message: 'Employee details have been saved successfully.',
          color: 'teal',
        })
      } else {
        await createEmployee(payload)
        notifications.show({
          title: 'Employee added',
          message: 'New employee has been created successfully.',
          color: 'teal',
        })
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
        <Stack gap="sm">
          <TextInput label="First Name" {...form.getInputProps('firstName')} />
          <TextInput label="Last Name" {...form.getInputProps('lastName')} />
          <TextInput label="Email" {...form.getInputProps('email')} />
          <Select
            label="Department"
            data={DEPARTMENTS}
            value={form.values.department}
            onChange={(val) => {
              form.setFieldValue('department', val ?? '')
              form.clearFieldError('department')
            }}
            error={form.errors.department}
          />
          <TextInput label="Job Title" {...form.getInputProps('jobTitle')} />
          <Select
            label="Country"
            data={COUNTRIES}
            value={form.values.country}
            onChange={(val) => {
              form.setFieldValue('country', val ?? '')
              form.clearFieldError('country')
              const mapped = val ? COUNTRY_CURRENCY_MAP[val] : undefined
              if (mapped) {
                form.setFieldValue('currency', mapped)
                form.clearFieldError('currency')
              }
            }}
            error={form.errors.country}
          />
          <Select
            label="Currency"
            data={CURRENCIES}
            value={form.values.currency}
            onChange={(val) => {
              form.setFieldValue('currency', val ?? '')
              form.clearFieldError('currency')
            }}
            error={form.errors.currency}
          />
          <TextInput label="Base Salary Cents" {...form.getInputProps('baseSalaryCents')} />
          <TextInput label="Hire Date" {...form.getInputProps('hireDate')} />
          <Select
            label="Employment Type"
            data={EMPLOYMENT_TYPE_OPTIONS}
            value={form.values.employmentType}
            onChange={(val) => {
              form.setFieldValue('employmentType', val ?? '')
              form.clearFieldError('employmentType')
            }}
            error={form.errors.employmentType}
          />
        </Stack>
        {submitError && <Alert mt="sm" color="red">{submitError}</Alert>}
        <Group mt="md">
          <Button type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save</Button>
        </Group>
      </form>
    </Modal>
  )
}
