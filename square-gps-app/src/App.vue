<template>
  <v-app>
    <v-app-bar color="primary" prominent>
      <v-app-bar-title>SquareGPS</v-app-bar-title>

      <v-spacer></v-spacer>

      <v-btn-toggle v-model="currentRoute" mandatory color="white">
        <v-btn :value="0" @click="$router.push('/about')">
          {{ $t('nav.about') }}
        </v-btn>
        <v-btn :value="1" @click="$router.push('/map')">
          {{ $t('nav.map') }}
        </v-btn>
      </v-btn-toggle>

      <v-spacer></v-spacer>

      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-icon>mdi-translate</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="changeLocale('ru')">
            <v-list-item-title>Русский</v-list-item-title>
          </v-list-item>
          <v-list-item @click="changeLocale('en')">
            <v-list-item-title>English</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const { locale } = useI18n()

const currentRoute = ref(0)

watch(
  () => route.path,
  (newPath) => {
    if (newPath.startsWith('/about')) {
      currentRoute.value = 0
    } else if (newPath.startsWith('/map')) {
      currentRoute.value = 1
    }
  },
  { immediate: true }
)

const changeLocale = (newLocale) => {
  locale.value = newLocale
}
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

#app {
  height: 100%;
}
</style>
