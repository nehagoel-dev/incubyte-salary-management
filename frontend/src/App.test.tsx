import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import App from './App'

it('renders app heading', () => {
  render(
    <MantineProvider>
      <App />
    </MantineProvider>,
  )
  expect(screen.getByRole('heading')).toBeInTheDocument()
})
