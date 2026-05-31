export * from './types'
export { ApiError } from './client'
export * from './employees'
export * from './analytics'

import * as _employees from './employees'
import * as _analytics from './analytics'

export const api = { ..._employees, ..._analytics }
