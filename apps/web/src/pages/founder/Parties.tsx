import CrudPage, { CrudField } from '../../components/crud/CrudPage'

const fields: CrudField[] = [
  { key: 'name', label: 'Party Name', required: true },
  { key: 'code', label: 'Short Code', required: true, placeholder: 'TDP' },
  { key: 'color_primary', label: 'Primary Color', type: 'color' },
  { key: 'color_secondary', label: 'Secondary Color', type: 'color' },
  {
    key: 'subscription_plan',
    label: 'Plan',
    type: 'select',
    required: true,
    options: [
      { label: 'Trial', value: 'trial' },
      { label: 'Standard', value: 'standard' },
      { label: 'Premium', value: 'premium' },
      { label: 'Enterprise', value: 'enterprise' },
    ],
  },
  {
    key: 'subscription_status',
    label: 'Subscription Status',
    type: 'select',
    required: true,
    options: [
      { label: 'Active', value: 'active' },
      { label: 'Paused', value: 'paused' },
      { label: 'Expired', value: 'expired' },
      { label: 'Cancelled', value: 'cancelled' },
    ],
  },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'is_active', label: 'Active', type: 'checkbox' },
]

export default function Parties() {
  return (
    <CrudPage
      title="Parties"
      subtitle="Deploy political parties, set plans, and control tenant status."
      endpoint="/api/parties"
      fields={fields}
      badge="Tenants"
    />
  )
}
