import { useEffect, useMemo, useState } from 'react'
import { Plug } from 'lucide-react'
import CrudPage, { CrudField } from '../../components/crud/CrudPage'
import { Button } from '../../components/primitives/Button'
import { apiGet, apiPost } from '../../lib/api'

export default function Integrations() {
  const [integrationTypes, setIntegrationTypes] = useState<any[]>([])
  const [parties, setParties] = useState<any[]>([])

  useEffect(() => {
    apiGet('/api/integration-types')
      .then((r) => r.json())
      .then((d) => setIntegrationTypes(d.data || d || []))
      .catch(() => setIntegrationTypes([]))

    apiGet('/api/parties')
      .then((r) => r.json())
      .then((d) => setParties(d.data || d || []))
      .catch(() => setParties([]))
  }, [])

  const fields = useMemo((): CrudField[] => {
    return [
      {
        key: 'party_id',
        label: 'Party',
        type: 'select',
        required: true,
        numeric: true,
        options: parties.map((p) => ({ label: p.name, value: p.id })),
      },
      {
        key: 'integration_type',
        label: 'Integration Type',
        type: 'select',
        required: true,
        options: integrationTypes.map((t) => ({ label: `${t.label} (${t.category})`, value: t.key_name })),
      },
      { key: 'provider_name', label: 'Provider Name', required: true },
      { key: 'api_key_reference', label: 'API Key / Reference', type: 'password' },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        required: true,
        options: [
          { label: 'Connected', value: 'connected' },
          { label: 'Pending', value: 'pending' },
          { label: 'Failed', value: 'failed' },
          { label: 'Disabled', value: 'disabled' },
        ],
      },
      { key: 'is_active', label: 'Active', type: 'checkbox' },
    ]
  }, [integrationTypes, parties])

  return (
    <CrudPage
      title="Integrations"
      subtitle="Connect AI, SMS, payments, WhatsApp, and other services per party."
      endpoint="/api/integrations"
      fields={fields}
      badge="Platform"
      extraRowActions={(item, refresh) => (
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            try {
              await apiPost(`/api/integrations/${item.id}/test`)
              await refresh()
            } catch (e) {
              console.error(e)
            }
          }}
        >
          <Plug className="mr-2 h-4 w-4" /> Test
        </Button>
      )}
    />
  )
}
