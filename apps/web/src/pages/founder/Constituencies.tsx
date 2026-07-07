import CrudPage, { CrudField } from '../../components/crud/CrudPage'

const fields: CrudField[] = [
  { key: 'name', label: 'Constituency Name', required: true },
  { key: 'state', label: 'State', required: true },
  { key: 'district', label: 'District' },
  { key: 'mandal_count', label: 'Mandals', type: 'number' },
  { key: 'booth_count', label: 'Booths', type: 'number' },
  { key: 'population', label: 'Population', type: 'number' },
  { key: 'is_active', label: 'Active', type: 'checkbox' },
]

export default function Constituencies() {
  return (
    <CrudPage
      title="Constituencies"
      subtitle="Manage assembly and parliamentary constituencies."
      endpoint="constituencies"
      fields={fields}
      badge="Tenants"
    />
  )
}
