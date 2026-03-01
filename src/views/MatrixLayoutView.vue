<script setup lang="ts">

import {
  NButton,
  NCard,
  NDivider,
  NFlex,
  NFormItem,
  NIcon,
  NInput,
  NInputGroup,
  NInputGroupLabel,
  NInputNumber,
  NModal,
  NPopover,
  NScrollbar,
  NTable,
  NText,NAlert,
  useNotification
} from "naive-ui";
import {ArchitectureFilled, CableFilled, ContentCopyFilled, DownloadFilled, UploadFilled,ApiFilled} from "@vicons/material"
import {nextTick, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import type {KeyLine} from "@/type/keyboard.ts";
import Keyboard from "@/components/Keyboad.vue";
import {readFromFile, saveToClipboard, saveToDownloadFile} from "@/utils/txtUtils.ts";

const jsonLoaded = ref<boolean>(false);
const jsonData = ref<string>("");
const {t} = useI18n()
const notify = useNotification();

type LayoutOverwrite = {
  x?:number,
  y?:number,
  w?:number,
  h?:number,
}
type LayoutItem = LayoutOverwrite |string;


const keyboardLayoutData = ref<KeyLine[]>([])
const keyCount = ref<number>(0);
const lineMaxWidth = ref<number>(0);

const readLayoutFromFile = async () => {
  jsonData.value = await readFromFile(".json")
}

const loadJson = () => {
  try {
    keyCount.value = 0;
    const data = jsonData.value;
    let loadedData: LayoutItem[][] = JSON.parse(data);
    const nowKeyboardData:KeyLine[] = []
    for (let i = 0; i < loadedData.length; i++) {
      let lineWidth = 0;
      //@ts-ignore
      const nowLine:LayoutItem[]  = loadedData[i];
      if(nowLine.length ===0)continue;
      //@ts-ignore
      if(typeof nowLine[0] !== "string" && typeof nowLine[0].y === 'number'){
        nowKeyboardData.push({
          items:[{
            label:"",
            //@ts-ignore
            height:nowLine[0].y,
            width:1,
            itemType:"space"
          }],
          //@ts-ignore
          height:nowLine[0].y,
        })
      }
      const keyPrefix = {
        height:1,
        width:1,
      }
      const nowKeyLine:KeyLine = {
        height:1,
        items:[]
      }
      for (let j = 0; j < nowLine.length; j++) {
        if(typeof nowLine[j] === "string"){
          keyCount.value++;
          nowKeyLine.items.push({
            //@ts-ignore
            label:nowLine[j],
            itemType:"key",
            ...keyPrefix
          })
          lineWidth+=keyPrefix.width
          keyPrefix.height=1
          keyPrefix.width=1
        }else{
          //@ts-ignore
          const nowItem:LayoutOverwrite = nowLine[j];
          if(j!==0 && typeof nowItem.y === "number"){
            notify.error({
              title: t("l_error"),
              description:t("matrixLayout.l_layoutYNotLineHeadError"),
              duration:3000
            })
            return;
          }
          if(typeof nowItem.x === "number"){
            lineWidth+=nowItem.x
            nowKeyLine.items.push({
              label:"",
              itemType:"space",
              width:nowItem.x,
              height:1
            })
          }
          if(typeof nowItem.h === "number"){
            keyPrefix.height = nowItem.h
          }
          if(typeof nowItem.w === "number"){
            keyPrefix.width = nowItem.w
          }
        }
      }
      lineMaxWidth.value = Math.max(lineWidth, lineMaxWidth.value);
      nowKeyboardData.push(nowKeyLine)
    }
    keyboardLayoutData.value=nowKeyboardData
    notify.success({
      title:t("l_success"),
      description:t("matrixLayout.l_importSuccess"),
      duration:3000,
    })
    jsonLoaded.value = true;
  }catch(err){
    notify.error({
      title: t("l_error"),
      description:t("matrixLayout.l_layoutJsonError"),
      duration:3000
    })
  }

}

const matrixXCount = ref<number>(0)
const matrixYCount = ref<number>(0)

const xNetNames = ref<string[]>([])
const yNetNames = ref<string[]>([])
const matrix = ref<string[][]>([])
let keyMatrixLocation:{ [key: string]: [number,number] } = {}
const matrixReady = ref<boolean>(false)
const nowKeySelect = ref<string>("noKeySelect");
const nowXNetSelect = ref<number>(-1);
const nowYNetSelect = ref<number>(-1);
const genMatrix=()=>{
  const nowXNetNames:string[] = [];
  const nowYNetNames:string[] = [];
  for (let i = 0; i < matrixXCount.value; i++) {
    nowXNetNames.push(`x_net_${i+1}`)
  }
  xNetNames.value=nowXNetNames;
  for (let i = 0; i < matrixYCount.value; i++) {
    nowYNetNames.push(`y_net_${i+1}`)
  }
  yNetNames.value=nowYNetNames;
  const nowMatrix:string[][] = []
  for (let i = 0; i < matrixXCount.value; i++) {
    nowMatrix[i]=[];
    for (let j = 0; j < matrixYCount.value; j++) {
      //@ts-ignore
      nowMatrix[i][j]="";
    }
  }
  matrix.value=nowMatrix;
  keyMatrixLocation={}
  matrixReady.value = true;
}

const trySetToMatrix=()=>{
  if(nowXNetSelect.value>=0&&nowYNetSelect.value>=0&&nowKeySelect.value!=='noKeySelect'){
      if(keyMatrixLocation[nowKeySelect.value]){
        //@ts-ignore
        matrix.value[keyMatrixLocation[nowKeySelect.value][0]][keyMatrixLocation[nowKeySelect.value][1]]=""
      }
      //@ts-ignore
      const oldVal:string =matrix.value[nowXNetSelect.value][nowYNetSelect.value]
      if(oldVal!==""){
        delete keyMatrixLocation[oldVal]
      }
      //@ts-ignore
      matrix.value[nowXNetSelect.value][nowYNetSelect.value] = nowKeySelect.value
      keyMatrixLocation[nowKeySelect.value]=[nowXNetSelect.value,nowYNetSelect.value]
      nowKeySelect.value="noKeySelect"
      nowYNetSelect.value=-1
      nowXNetSelect.value=-1
  }
}

const selectY = (index:number) =>{
  nowYNetSelect.value= index;
  trySetToMatrix()
}

const selectX= (index:number)=>{
  nowXNetSelect.value=index;
  trySetToMatrix()
}
watch(nowKeySelect,(newVal)=>{
  nextTick(()=>{
    trySetToMatrix()
  })
})

const rawData = ref<string>("");
const exportModalShow = ref<boolean>(false);
const importModalShow = ref<boolean>(false);

const importData = ()=>{
  const exportData ={
    "matrix":matrix.value,
    "xNet": xNetNames.value,
    "yNet": yNetNames.value
  }
  rawData.value=JSON.stringify(exportData);
  importModalShow.value=true;
}

const exportData = ()=>{
  const exportData ={
    "matrix":matrix.value,
    "xNet": xNetNames.value,
    "yNet": yNetNames.value
  }
  rawData.value=JSON.stringify(exportData);
  exportModalShow.value=true
}

const toClipboard= async ()=>{
  await saveToClipboard(rawData.value)
  notify.success({
    "title":t("l_success"),
    "description":t("matrixLayout.l_savedToClipboard"),
    "duration":3000,
  })
}

const toDownload= ()=>{
  saveToDownloadFile(rawData.value,'matrixLayout.json')
}

const loadFromFile= async ()=>{
  rawData.value = await readFromFile(".json")
}
const readData=()=>{
  try{
    const data:{
      matrix:string[][],
      xNet:string[],
      yNet:string[]
    } = JSON.parse(rawData.value);
    let newMatrix:string[][]=[]
    let netNameX:string[]=[]
    let netNameY:string[]=[]
    let nowKeyMatrixLocation:{ [key: string]: [number,number] } = {}
    const matrixData = data["matrix"]
    let matrixHeight = matrixData.length
    //@ts-ignore
    let matrixWidth=matrixData[0].length
    if(data["xNet"].length !== matrixHeight){

      throw t("matrixLayout.l_sizeNotMatch",{name:"X"})
    }
    netNameX = data["xNet"]
    if(data["yNet"].length !== matrixWidth){
      throw t("matrixLayout.l_sizeNotMatch",{name:"Y"})
    }
    netNameY = data["yNet"]
    for (let i = 0; i < matrixData.length; i++) {
      //@ts-ignore
      const line:string[] = matrixData[i]
      const now = []
      if(line.length !== matrixWidth){
        throw t('matrixLayout.l_matrixLineSizeNotEqual')
      }
      for (let j = 0; j < line.length; j++) {
        //@ts-ignore
        const el:string = line[j]
        now.push(el)
        if(el!==""){
          nowKeyMatrixLocation[el]=[i,j]
        }
      }
      newMatrix.push(now)
    }
    matrixXCount.value=matrixHeight
    matrixYCount.value=matrixWidth
    matrix.value=newMatrix
    xNetNames.value=netNameX
    yNetNames.value=netNameY
    keyMatrixLocation=nowKeyMatrixLocation
    matrixReady.value=true
    notify.success({
      "title":t("l_success"),
      "description":t("l_success"),
      duration:3000,
    })
    importModalShow.value=false;
  }catch(e){
    notify.error({
      "title":t("l_error"),
      "description":""+e,
      duration:3000,
    })
  }
}
</script>
<template>
  <n-flex justify="center" v-if="!jsonLoaded">
    <n-card :title="$t('matrixLayout.l_importLayout')" style="width: 500px">
        <n-input type="textarea" :placeholder="$t('matrixLayout.l_importPlaceholder')" v-model:value="jsonData"></n-input>
      <template #footer>
        <n-flex justify="right">
          <n-button type="primary" @click="readLayoutFromFile">
            <template #icon>
              <n-icon>
                <UploadFilled/>
              </n-icon>
            </template>
            {{$t("matrixLayout.b_uploadFile")}}
          </n-button>
          <n-button type="primary" @click="loadJson" style="word-break: break-all;">
            <template #icon>
              <n-icon>
                <architecture-filled/>
              </n-icon>
            </template>
            {{$t('matrixLayout.b_import')}}
          </n-button>
        </n-flex>
      </template>
    </n-card>
  </n-flex>
  <n-flex style="height: 100%;width: 100%;gap: 0" vertical v-else>
    <n-scrollbar style="height: 50%;" x-scrollable>
      <keyboard :keys="keyboardLayoutData" :resize="55" :max-width="lineMaxWidth" v-model:key-active="nowKeySelect"></keyboard>
    </n-scrollbar>
    <n-flex style="height: 50%;gap: 0;padding: 10px;box-sizing: border-box" justify="space-between">
      <div style="width: 400px">
        <n-form-item :label="$t('matrixLayout.l_matrixSize')">
          <n-input-group>
            <n-input-number :min="0" button-placement="both" :style="{ width: '40%' }" placeholder="x" v-model:value="matrixXCount"/>
            <n-input-group-label>*</n-input-group-label>
            <n-input-number :min="0" button-placement="both" :style="{ width: '40%' }" placeholder="y" v-model:value="matrixYCount"/>
          </n-input-group>
          <n-text>
            <n-popover trigger="hover">
              <template #trigger>
                <n-text :type="matrixYCount*matrixXCount>=keyCount?'success':'error'">
                  {{matrixYCount*matrixXCount}}
                </n-text>
              </template>
              {{ matrixYCount*matrixXCount>=keyCount?$t("l_onProblem"):$t("matrixLayout.l_matrixSizeTooSmall")}}
            </n-popover>
            <n-text>({{keyCount}})</n-text>
          </n-text>
          <n-button @click="genMatrix">{{$t("b_apply")}}</n-button>
        </n-form-item>
        <n-form-item :label="$t('l_option')">
            <n-flex vertical>
              <n-button type="primary" @click="importData">
                <template #icon>
                  <n-icon>
                    <DownloadFilled/>
                  </n-icon>
                </template>
                {{$t("matrixLayout.b_matrixExport")}}
              </n-button>
              <n-button type="info" @click="exportData">
                <template #icon>
                  <n-icon>
                    <upload-filled/>
                  </n-icon>
                </template>
                {{$t("matrixLayout.b_matrixImport")}}
              </n-button>
            </n-flex>
        </n-form-item>
        <n-alert :title="$t('matrixLayout.l_guide')" type="info">
          {{$t("matrixLayout.l_guide_1")}}
          <n-icon>
            <cable-filled/>
          </n-icon>
          {{$t("matrixLayout.l_guide_2")}}
        </n-alert>
      </div>
      <n-divider style="height: 100%;margin: 0" vertical/>
      <n-scrollbar style="width: calc(100vw - 450px);height: calc( 50vh - 38px );" x-scrollable>
        <n-table :bordered="false" :single-line="false" v-if="matrixReady" :style="{'width':130*(1+yNetNames.length)+'px'}">
          <thead>
          <tr>
            <th style="width: 130px;">{{$t("matrixLayout.l_netName")}}</th>
            <th v-for="(name,index) in yNetNames">
              <n-input v-model:value="yNetNames[index]" size="tiny" style="width: 100px;"/>
              <n-button
                  :type="yNetNames[index]===yNetNames[nowYNetSelect]?'success':'default'"
                  text
                  @click="selectY(index)"
              >
                <n-icon>
                  <CableFilled/>
                </n-icon>
              </n-button>
            </th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(name,xIndex) in xNetNames">
            <td style="width: 130px;">
              <n-input v-model:value="xNetNames[xIndex]" size="tiny" style="width: 90px;"/>
              <n-button
                  :type="xNetNames[xIndex]===xNetNames[nowXNetSelect]?'success':'default'"
                  text
                  @click="selectX(xIndex)"
              >
                <n-icon>
                  <CableFilled/>
                </n-icon>
              </n-button>
            </td>
            <td v-for="(_,yIndex) in yNetNames">
              <n-text>{{
                  //@ts-ignore
                  matrix[xIndex][yIndex]
                }}</n-text>
            </td>
          </tr>
          </tbody>
        </n-table>
      </n-scrollbar>
    </n-flex>
  </n-flex>
  <n-modal v-model:show="exportModalShow" preset="card" :title="$t('matrixLayout.b_matrixImport')">
    <n-input disabled type="textarea" v-model:value="rawData"/>
    <n-flex justify="right">
      <n-button type="primary" @click="toDownload">
        <template #icon>
          <n-icon>
            <downloadFilled/>
          </n-icon>
        </template>
        {{$t("matrixLayout.b_download")}}
      </n-button>
      <n-button type="primary" @click="toClipboard">
        <template #icon>
          <n-icon>
            <content-copy-filled/>
          </n-icon>
        </template>
        {{$t("matrixLayout.b_saveToClipboard")}}
      </n-button>
    </n-flex>
  </n-modal>
  <n-modal v-model:show="importModalShow" preset="card" :title="$t('matrixLayout.b_matrixImport')">
    <n-input type="textarea" v-model:value="rawData"/>
    <n-flex justify="right">
      <n-button type="primary" @click="loadFromFile">
        <template #icon>
          <n-icon>
            <UploadFilled/>
          </n-icon>
        </template>
        {{$t("matrixLayout.b_uploadFile")}}
      </n-button>
      <n-button type="primary" @click="readData">
        <template #icon>
          <n-icon>
            <ApiFilled/>
          </n-icon>
        </template>
        {{$t("matrixLayout.b_import")}}
      </n-button>
    </n-flex>
  </n-modal>
</template>

<style>

</style>
