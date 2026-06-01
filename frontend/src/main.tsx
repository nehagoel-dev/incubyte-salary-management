import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MantineProvider, createTheme } from '@mantine/core'

const theme = createTheme({ primaryColor: 'teal' })
import '@mantine/core/styles.css'
import '@mantine/charts/styles.css'
import '@mantine/notifications/styles.css'
import 'mantine-datatable/styles.css'
import { Notifications } from '@mantine/notifications'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <Notifications />
      <App />
    </MantineProvider>
  </StrictMode>,
)
