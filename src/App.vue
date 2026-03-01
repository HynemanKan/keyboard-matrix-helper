<script setup lang="ts">
import {RouterView, useRouter} from 'vue-router'
import {nextTick, onMounted, ref, watch} from 'vue'
import {darkTheme,NConfigProvider,NNotificationProvider,NFlex,NButton,NGlobalStyle,NSelect} from "naive-ui";
import {useI18n} from "vue-i18n";
const {locale,t} = useI18n();
const isDark = ref<boolean>(false);
const lang = ref<string>('zh');
const i18nOption = [
  {
    label: '简体中文',
    value: 'zh',
  },
  {
    label: "English",
    value: 'en',
  }
]

watch(lang, (newVal) => {
  locale.value = newVal;
  nextTick(()=>{
    document.title = t('global.l_title')
  })
})

const router = useRouter();

onMounted(()=>{
  document.title = t('global.l_title')
})

</script>

<template>
  <n-config-provider :theme="isDark?darkTheme:null">
    <n-global-style/>
    <n-notification-provider>
      <n-flex style="height: 100vh;gap: 0" vertical justify="space-between">
        <n-flex justify="space-between" style="width: 100vw;padding: 10px;box-sizing: border-box" >
          <n-button text @click="router.push('/')">
            {{$t('global.l_title')}}
          </n-button>
          <n-flex>
            <n-select v-model:value="lang" :options="i18nOption" style="width: 100px"></n-select>
            <n-button @click="isDark=!isDark" ghost type="default">
              {{isDark?$t("global.l_light"):$t("global.l_dark")}}
            </n-button>
          </n-flex>
        </n-flex>
        <RouterView />
        <n-flex justify="center" style="margin: 3px 0">
          <n-text depth="3">
            keyboard matrix helper 0.2&nbsp;&nbsp;·&nbsp;&nbsp;Made by HynemanKan
          </n-text>
        </n-flex>
      </n-flex>
    </n-notification-provider>
  </n-config-provider>
</template>

<style scoped>
</style>
