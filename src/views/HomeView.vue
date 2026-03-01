<script setup lang="ts">
import {NFlex,NCard} from "naive-ui";
import {useRouter} from "vue-router";

const router = useRouter();

const toMatrixLayout = ()=>{
  router.push("/matrixLayout");
}

const toKeyboardLayout = ()=>{
  window.open('https://www.keyboard-layout-editor.com/#/', '_blank');
}

</script>

<template>
  <n-flex justify="center" style="gap: 25px">
    <n-card :title="$t('home.l_layoutKeyboard')" class="button-like" @click="toKeyboardLayout">
      <template #cover >
        <img src="/img/keyboardLayout.png" alt="keyboard layout">
      </template>
    </n-card>
    <n-card :title="$t('home.l_layoutMatrix')" class="button-like" @click="toMatrixLayout">
      <template #cover>
        <img src="/img/matrixLayout.png" alt="matrix layout">
      </template>
    </n-card>
  </n-flex>
</template>

<style scoped>
.button-like{
  width: 200px;
}
</style>
