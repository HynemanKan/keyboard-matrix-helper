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
  NInputNumber,
  NInputGroupLabel,
  NDynamicTags,
  NModal,
  NScrollbar,
  NTable,
  NText,NAlert,
  useNotification,useDialog
} from "naive-ui";
import {
  ArchitectureFilled, CableFilled, UploadFilled, BorderClearFilled, BorderAllFilled, Brightness1Filled,
  DownloadFilled, AppRegistrationOutlined, ContentCopyFilled, ApiFilled
} from "@vicons/material"
import {nextTick, onBeforeUpdate, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import type {KeyLine} from "@/type/keyboard.ts";
import Keyboard from "@/components/Keyboad.vue";
import {readFromFile, saveToClipboard, saveToDownloadFile} from "@/utils/txtUtils.ts";
import {GLOBAL_COLOR_SET} from "@/utils/colorGroups.ts";
import {getDelOne} from "@/utils/arrayUtils.ts";
import {calculateScanMatrix} from "@/utils/pinKeyToMatrix.ts";

const jsonLoaded = ref<boolean>(false);
const jsonData = ref<string>("");
const {t} = useI18n()
const notify = useNotification();
const dialog = useDialog();

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


const nowKeySelect = ref<string>("noKeySelect");
const nowPinSelect = ref<number>(-1);

const keyPinBinds = ref<{[key:string]:number[]}>({});

const done = ref<string[]>([]);
const isError = ref<string[]>([]);

const pinNum = ref<number>(20)
const pinNames = ref<string[]>([]);
const pinKeyBinds = ref<string[][]>([]);
const pinInMatrix = ref<boolean[]>([])
const pinColors = ref<string[]>([]);
const togglePinInMatrix = (index:number) =>{
  if(!pinInMatrix.value[index]){
    pinInMatrix.value[index]=true;
    return;
  }
  //@ts-ignore
  if(pinKeyBinds.value[index].length===0){
    pinInMatrix.value[index]=false
    pinKeyBinds.value[index]=[]
    if(nowPinSelect.value==index){
      nowPinSelect.value=-1;
    }
  }else {
    dialog.warning({
      title:t("l_warning"),
      content: t('matrixRE.l_pinKeyBindNotEmpty'),
      positiveText: t('b_confirm'),
      negativeText: t("b_cancel"),
      onPositiveClick: () => {
        pinInMatrix.value[index]=false
        pinKeyBinds.value[index]=[]
        if(nowPinSelect.value==index){
          nowPinSelect.value=-1;
        }
      }
    })
  }
}

const toggleSelected = (index:number) => {
  if(nowPinSelect.value==index){
    nowPinSelect.value=-1
  }else{
    nowPinSelect.value=index;
  }
}

const setPins = ()=>{
  const newPinNames:string[] =  [];
  const newPinKeyBinds:string[][] =[];
  const newPinInMatrix:boolean[] =[];
  const newPinColors:string[] =[];
  for(let i=0; i<pinNum.value; i++){
    newPinNames.push(`pin_${i+1}`);
    newPinKeyBinds.push([]);
    newPinInMatrix.push(true);
    //@ts-ignore
    newPinColors.push(GLOBAL_COLOR_SET[i])
  }
  pinNames.value = newPinNames;
  pinKeyBinds.value=newPinKeyBinds;
  pinInMatrix.value=newPinInMatrix;
  pinColors.value=newPinColors;
}

let oldPinKeyBinds: string[][] = JSON.parse(JSON.stringify(pinKeyBinds.value));

// do deep copy


watch(pinKeyBinds,(newVal)=>{
    const oldVal = oldPinKeyBinds;
    // vue watch oldVal don't do deep copy, save oldVal for next time
    oldPinKeyBinds = JSON.parse(JSON.stringify(newVal));
    if(newVal.length !== oldVal.length)return;
    for(let i=0; i<newVal.length;i++){
      //@ts-ignore
      if(newVal[i].length>=oldVal[i].length)continue;
      //@ts-ignore
      const delItem:string = getDelOne<string>(oldVal[i],newVal[i]);
      console.log("keybindDel",delItem,i);
      //@ts-ignore
      keyPinBinds.value[delItem] = keyPinBinds.value[delItem].filter(item => item !== i)
    }
    ruleCheck();
},{
  deep: true,
})

const reversed = ref<boolean>(false);

watch(nowKeySelect,(newVal)=>{
  if(newVal=='noKeySelect'){
    return;
  }
  if(nowPinSelect.value!==-1){
    keyBind(newVal,nowPinSelect.value);
  }
  nextTick(()=>{
    nowKeySelect.value="noKeySelect";
  })
})

const ruleCheck=()=>{
  const nowUsed:string[] = [];
  const nowError:string[] = [];
  Object.keys(keyPinBinds.value).forEach(key=>{
    //@ts-ignore
    if(keyPinBinds.value[key].length==2) nowUsed.push(key);
    //@ts-ignore
    if(keyPinBinds.value[key].length>2) nowError.push(key);
  })
  done.value = nowUsed
  isError.value = nowError;
  if(nowError.length==0){
    try{
      const matrixRes = calculateScanMatrix(keyPinBinds.value,reversed.value)
      console.log("matrix res",matrixRes);
    }catch(e){
      console.error(e);
      notify.error({
        title:t("l_error"),
        description:t("matrixRE.l_genMatrixFail"),
        duration:3000,
      })
    }
  }else{
    notify.error({
      title:t("l_error"),
      description:t("matrixRE.l_keyBindTooManyPin"),
      duration:3000,
    })
  }
}

const keyBind = (keyName:string,pinId:number)=>{
  //@ts-ignore
  pinKeyBinds.value[pinId].push(keyName);
  if(!keyPinBinds.value[keyName]){
    keyPinBinds.value[keyName]=[]
  }
  keyPinBinds.value[keyName].push(pinId);
  ruleCheck();
}

interface ProjectJson{
  name:string
  keyBinds:string[]
  isMatrixPin:boolean
}

const rawData = ref<string>("");
const exportModalShow = ref<boolean>(false);
const importModalShow = ref<boolean>(false);
const genMatrixModalShow = ref<boolean>(false);


function exportToJson():ProjectJson[]{
  return pinNames.value.map((name,i)=>({
    name,
    keyBinds: pinKeyBinds.value[i]||[],
    isMatrixPin: !!pinInMatrix.value[i],
  }))
}

const toClipboard= async ()=>{
  await saveToClipboard(rawData.value)
  notify.success({
    "title":t("l_success"),
    "description":t("matrixLayout.l_savedToClipboard"),
    "duration":3000,
  })
}

const toDownload= (fileName:string)=>{
  console.log(fileName);
  saveToDownloadFile(rawData.value,`${fileName}.json`)
}

function loadFromJson(data:ProjectJson[]):void{
  if(data.length>100){
    throw Error("pin to much")
  }
  pinNames.value = data.map(p=>p.name)
  pinKeyBinds.value = data.map(p=>[...p.keyBinds])
  pinInMatrix.value = data.map(p=>p.isMatrixPin)
  //@ts-ignore
  pinColors.value = data.map((_,i)=>GLOBAL_COLOR_SET[i])
  pinNum.value = data.length
  // rebuild keyPinBinds from pin data
  const newKeyPinBinds:{[key:string]:number[]} = {}
  data.forEach((p,i)=>{
    for(const key of p.keyBinds){
      if(!newKeyPinBinds[key]) newKeyPinBinds[key]=[]
      newKeyPinBinds[key].push(i)
    }
  })
  keyPinBinds.value = newKeyPinBinds
  oldPinKeyBinds = JSON.parse(JSON.stringify(pinKeyBinds.value))
  ruleCheck()
}
const loadFromFile= async ()=>{
  rawData.value = await readFromFile(".json")
}

const readData=()=>{
  try{
    const data: ProjectJson[]= JSON.parse(rawData.value);
    loadFromJson(data);
    importModalShow.value=false;
  }catch(err){
    notify.error({
      title:t("l_error"),
      description:t("matrixRE.l_inputFail"),
      duration:3000,
    })
  }
}

const callImport = ()=>{
  rawData.value=JSON.stringify(exportToJson())
  importModalShow.value=true;
}

const callExport = ()=>{
  rawData.value=JSON.stringify(exportToJson())
  exportModalShow.value=true;
}

const genSuccess = ref<boolean>(false);
const genMessage = ref<string>("");

const callGenMatrix=()=>{
  try{
    const matrixRes = calculateScanMatrix(keyPinBinds.value,reversed.value)
    if(matrixRes.missingKey.length>0){
      genSuccess.value=false;
      genMessage.value=t("matrixRE.l_genFailKeyHaveOnePinOnly",{
        keys:matrixRes.missingKey.map(x=>`"${x}"`).join(", "),
      })
      genMatrixModalShow.value=true;
      return;
    }
    const exportData ={
      "matrix":matrixRes.matrix,
      "xNet": matrixRes.x.map(index=>pinNames.value[index]),
      "yNet": matrixRes.y.map(index=>pinNames.value[index]),
    }
    genSuccess.value=true;
    rawData.value=JSON.stringify(exportData)
    genMatrixModalShow.value=true;
  }catch(err){
    genSuccess.value=false;
    genMessage.value=t("matrixRE.l_genMatrixFail")
    genMatrixModalShow.value=true;
    return;
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
      <keyboard
          :keys="keyboardLayoutData"
          :resize="55"
          :max-width="lineMaxWidth"
          v-model:key-active="nowKeySelect"
          :done="done"
          :error="isError"
      ></keyboard>
    </n-scrollbar>
    <n-flex style="height: 50%;gap: 0;padding: 10px;box-sizing: border-box" justify="space-between">
      <div style="width: 400px">
        <n-form-item :label="$t('matrixRE.l_pinNum')">
          <n-input-number :min="0" :max="100" v-model:value="pinNum"></n-input-number>
          <n-button @click="setPins">
            {{$t("b_apply")}}
          </n-button>
        </n-form-item>
        <n-form-item :label="$t('l_option')">
          <n-flex vertical>
            <n-button type="primary" @click="callImport">
              <template #icon>
                <n-icon>
                  <DownloadFilled/>
                </n-icon>
              </template>
              {{$t("matrixRE.b_projectImport")}}
            </n-button>
            <n-button type="info" @click="callExport">
              <template #icon>
                <n-icon>
                  <upload-filled/>
                </n-icon>
              </template>
              {{$t("matrixRE.b_projectExport")}}
            </n-button>
            <n-button type="info" @click="callGenMatrix">
              <template #icon>
                <n-icon>
                  <app-registration-outlined/>
                </n-icon>
              </template>
              {{$t("matrixRE.b_exportMatrixData")}}
            </n-button>
          </n-flex>
        </n-form-item>
      </div>
      <n-divider style="height: 100%;margin: 0" vertical/>
      <div style="width: calc(100vw - 450px)">
        <n-scrollbar style="height: calc(50vh - 75px)">
          <n-table>
            <thead>
            <tr>
              <th style="width: 200px;">{{$t("matrixRE.l_pinName")}}</th>
              <th style="width: calc(100vw - 650px);">{{$t("matrixRE.l_keys")}}</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(item,index) in pinNames">
              <td style="width: 200px;">
                <n-input-group>
                  <n-input-group-label>
                    <n-icon :color="pinInMatrix[index]?pinColors[index]:'#a6a6a6'">
                      <Brightness1Filled/>
                    </n-icon>
                  </n-input-group-label>
                  <n-input v-model:value="pinNames[index]"></n-input>
                  <n-button :type="pinInMatrix[index]?'success':'error'" @click="togglePinInMatrix(index)">
                    <n-icon>
                        <border-all-filled v-if="pinInMatrix[index]"/>
                        <border-clear-filled v-else/>
                    </n-icon>
                  </n-button>
                  <n-button :type="nowPinSelect==index?'primary':'default'" @click="toggleSelected(index)" :disabled="!pinInMatrix[index]">
                    <n-icon>
                      <cable-filled/>
                    </n-icon>
                  </n-button>
                </n-input-group>
              </td>
              <td style="width: calc(100vw - 650px);">
                <n-dynamic-tags v-model:value="pinKeyBinds[index]" v-if="pinInMatrix[index]">
                  <template #input>
                    &nbsp;
                  </template>
                  <template #trigger>
                    &nbsp;
                  </template>
                </n-dynamic-tags>
                <n-text v-else depth="3">
                  {{$t("matrixRE.l_pinNotInMatrix")}}
                </n-text>
              </td>
            </tr>
            </tbody>
          </n-table>
        </n-scrollbar>
      </div>
    </n-flex>
  </n-flex>
  <n-modal v-model:show="exportModalShow" preset="card" :title="$t('matrixLayout.b_matrixImport')">
    <n-input disabled type="textarea" v-model:value="rawData"/>
    <n-flex justify="right">
      <n-button type="primary" @click="toDownload('matrixRE')">
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
  <n-modal v-model:show="genMatrixModalShow" preset="card" :title="$t('matrixLayout.b_matrixImport')">
    <div v-if="genSuccess">
      <n-input disabled type="textarea" v-model:value="rawData"></n-input>
      <n-flex justify="right">
        <n-button type="primary" @click="toDownload('matrixData')">
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
    </div>
    <div v-else>
      <n-alert :title="$t('l_error')" type="error">
        {{genMessage}}
      </n-alert>
    </div>
  </n-modal>
</template>

<style>

</style>
