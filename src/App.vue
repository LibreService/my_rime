<script setup lang="ts">
import { NConfigProvider, NH1, darkTheme, useOsTheme } from 'naive-ui'
import { MyLayout, MyHeader, MyFooter } from '@libreservice/my-widget'
import MainView from './views/MainView.vue'
import MyPwa from './components/MyPwa.vue'
import { homepage } from '../package.json'

const osThemeRef = useOsTheme()
</script>

<template>
  <my-pwa />
  <n-config-provider :theme="osThemeRef === 'dark' ? darkTheme : null">
    <my-layout>
      <template #header>
        <my-header
          icon="/LibreService.svg"
          :homepage="homepage"
        />
      </template>
      <template #content>
        <div style="cursor: pointer; text-align: center; margin-top: 16px">
          <n-h1>My RIME</n-h1>
        </div>
        <main-view />
      </template>
      <template #footer>
        <my-footer
          class="my-footer"
          :homepage="homepage"
          commit="__COMMIT__"
          build-date="__BUILD_DATE__"
          copyright="2022-2023 Qijia Liu"
        />
      </template>
    </my-layout>
  </n-config-provider>
</template>
