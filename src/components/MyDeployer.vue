<script setup lang="ts">
import { useNotification } from 'naive-ui'
import { worker } from '../workerAPI'
import {
  changeIME,
  deployed,
  selectOptions,
  setLoading
} from '../control'

const notification = useNotification()

worker.control('deployStatus', async (status: 'start' | 'failure' | 'success', schemas: string) => {
  const options = {
    duration: 5000,
    keepAliveOnHover: true
  }
  switch (status) {
    case 'start':
      notification.info({
        content: 'Deployment started',
        ...options
      })
      setLoading(true)
      break
    case 'failure':
      notification.error({
        content: 'Deployment failed',
        ...options
      })
      setLoading(false)
      break
    case 'success':
      notification.success({
        content: 'Deployment succeeded',
        ...options
      })
      deployed.value = true
      selectOptions.value = []
      {
        const schemasJson = JSON.parse(schemas) as {
          id: string,
          name: string
        }[]
        for (const schema of schemasJson) {
          selectOptions.value.push({
            label: schema.name,
            value: schema.id
          })
        }
        const currentSchema = schemasJson[0].id
        await changeIME(currentSchema)
      }
      setLoading(false)
      break
  }
})
</script>
