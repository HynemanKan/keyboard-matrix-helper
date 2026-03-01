<script setup lang="ts">
import {NButton,NFlex,NEllipsis} from "naive-ui";
import type {KeyItem, KeyLine} from "@/type/keyboard.ts";

const props = defineProps<{
  keys:KeyLine[]
  resize:number
  maxWidth:number
}>()

const keyActive = defineModel("keyActive")

const getKeyLineStyle = (keyLine:KeyLine) => {
  return {
    height: keyLine.height*props.resize+"px",
    width: props.resize*props.maxWidth+"px"
  }
}
const getKeyStyle = (keyLine:KeyItem) => {
  return {
    height: keyLine.height*props.resize+"px",
    width: keyLine.width*props.resize+"px",
  }
}
</script>

<template>
  <n-flex v-for="keyLine in keys" :style="getKeyLineStyle(keyLine)" style="gap: 0">
    <div v-for="key in keyLine.items" :style="getKeyStyle(key)">
      <n-button v-if="key.itemType=='key'" style="width: 100%;height: 100%" @click="keyActive=key.label" :type="keyActive===key.label?'success':'default'">
        <n-ellipsis :style="{'max-width': resize*0.9+'px'}">
          {{key.label}}
        </n-ellipsis>
      </n-button>
      <span v-else>
        &nbsp;
      </span>
    </div>
  </n-flex>
</template>

<style scoped>

</style>
