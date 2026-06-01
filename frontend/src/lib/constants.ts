export const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Sales',
  'Marketing',
  'Finance',
  'HR',
  'Operations',
  'Design',
]

export const COUNTRIES = ['US', 'GB', 'DE', 'FR', 'NL', 'IN', 'CA', 'AU', 'JP', 'BR']

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY', 'BRL']

export const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'FULL_TIME', label: 'Full Time' },
  { value: 'PART_TIME', label: 'Part Time' },
  { value: 'CONTRACT', label: 'Contract' },
]

export const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  CONTRACT: 'Contract',
}

export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  US: 'USD',
  GB: 'GBP',
  DE: 'EUR',
  FR: 'EUR',
  NL: 'EUR',
  IN: 'INR',
  CA: 'CAD',
  AU: 'AUD',
  JP: 'JPY',
  BR: 'BRL',
}
