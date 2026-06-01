import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { vi, beforeEach } from 'vitest'
import App from './App'
import { resetAnalyticsCache } from './lib/analyticsCache'

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) }),
  )
  resetAnalyticsCache()
})

it('renders app heading', () => {
  render(
    <MantineProvider>
      <App />
    </MantineProvider>,
  )
  expect(screen.getByRole('heading')).toBeInTheDocument()
})
