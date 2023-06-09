<script setup lang="ts">
import { toRefs } from 'vue'
import { useNotification } from 'naive-ui'
import { worker } from '../workerAPI'
import {
  changeIME,
  deployed,
  selectOptions
} from '../control'
import type MyMenu from './MyMenu.vue'

const props = defineProps<{
  menu: InstanceType<typeof MyMenu> | undefined
}>()

const { menu } = toRefs(props)

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
      menu.value?.setLoading(true)
      break
    case 'failure':
      notification.error({
        content: 'Deployment failed',
        ...options
      })
      menu.value?.setLoading(false)
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
        menu.value?.displayIME(currentSchema)
      }
      menu.value?.setLoading(false)
      break
  }
})
</script>
