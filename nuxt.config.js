import extendNuxtConfig from '@shopware-pwa/nuxt-module/config'

export default extendNuxtConfig({
  head: {
    title: 'Shopware PWA',
    meta: [{ hid: 'description', name: 'description', content: '' }],
  },
  publicRuntimeConfig: {
    adyen: {
      environment: "test",
      clientKey: "", // PASTE IN HERE YOUR CLIENT KEY FROM ADYEN
      adyenOrigin: "http://localhost:8000",
    }
  }
})
