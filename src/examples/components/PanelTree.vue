<!-- TreeItem.vue -->
<template>
  <div 
    :id="node.uuid" 
    :class="node.class" 
    :style="node.getStyle()"
  >
    <PanelTree 
      v-if="node.children"
      v-for="child in node.children" 
      :key="child.uuid" 
      :node="child"
      @titleMousedown="titleMousedown"
      @titleMousemove="titleMousemove"
      @titleMouseleave="titleMouseleave"
      @panelUpdated="panelUpdated"
      @splitRight="splitRight"
      @splitDown="splitDown"
      @fullToggle="fullToggle"
      @deletePanel="deletePanel"
    />
    <template v-else>
      <div 
        class="lv-robot-panel-title"
        @mousedown="titleMousedown"
        @mousemove="titleMousemove"
        @mouseleave="titleMouseleave"
      >
        <div>{{ node.type }} </div>
        <div class="lv-robot-panel-title-right">
          <sys-icon 
            v-if="isFull" 
            type="shrink-screen" 
            class="lv-robot-icon"
            title="缩小"
            @click="fullToggle(node.uuid)"
          />
          <sys-icon 
            v-else 
            type="full-screen" 
            class="lv-robot-icon"
            title="全屏"
            @click="fullToggle(node.uuid)"
          />
          <sys-icon type="setting" class="lv-robot-icon" title="设置"/>
          
          <div class="lv-robot-panel-content">
            <el-popover
              class="box-item"
              title="Title"
              content="Bottom Left prompts info"
              placement="bottom-start"
            >
              <template #reference> 
                <sys-icon type="more" class="lv-robot-icon" title="更多"/> 
              </template>
            </el-popover>
          </div>
          <!-- <span @click="splitRight(node.uuid)" style="cursor: pointer;"> R </span>
          <span @click="splitDown(node.uuid)" style="cursor: pointer;"> D </span>
          <span @click="fullToggle(node.uuid)" style="cursor: pointer;"> F </span>
          <span @click="deletePanel(node.uuid)" style="cursor: pointer;"> Del </span> -->
        </div>
        
      </div>
      
    </template>
  </div>
</template>

<script setup>
import { onUpdated,ref } from 'vue'
import SysIcon from '@/components/sys-icon/index.vue'
import {ZoomIn} from "@element-plus/icons-vue";

defineProps({
  node: {
    type: Object,
    required: true
  }
});

const isFull=ref(false)

// 定义可以触发的事件
const emits = defineEmits(['titleMousedown','titleMousemove','titleMouseleave','panelUpdated','splitRight','splitDown','fullToggle','deletePanel'])

const titleMousedown = (event) => {
  emits('titleMousedown',event)
}
const titleMousemove = (event) => {
  emits('titleMousemove',event)
}
const titleMouseleave = (event) => {
  emits('titleMouseleave',event)
}
const panelUpdated=()=>{
  emits('panelUpdated')
}
const splitRight = (uuid) => {
  emits('splitRight',uuid,'Image')
}
const splitDown = (uuid) => {
  emits('splitDown',uuid,'3D')
}
const fullToggle = (uuid) => {
  isFull.value!=isFull.value;
  if(isFull.value){
    isFull.value=false
  }else{
    isFull.value=true
  }
  console.log('isFull.value',isFull.value);
  emits('fullToggle',uuid)
}
const deletePanel = (uuid) => {
  emits('deletePanel',uuid)
}

onUpdated(()=>{
  console.log('panelUpdated');
  panelUpdated()
})
</script>

<style scoped>
.lv-robot-panel-wrapper{
  box-sizing: border-box;
  display: flex;
}
.lv-robot-panel{
  box-sizing: border-box;
  border: 1px solid #d6d6d6;
  /* 禁止元素被拖拽 */
  /* user-drag: none; */
  -webkit-user-drag: none; /* Safari 等 WebKit 内核浏览器 */
  /* 可选：禁止文本被选中（防止拖拽文本） */
  user-select: none;
  -webkit-user-select: none;
  display: flex;
  flex-direction: column;
}

.lv-robot-panel-title{
  box-sizing: border-box;
  width: 100%;
  overflow: hidden;
  font-size: 14px;
  color: #313131;
  background-color: #efeff0;
  line-height: 30px;
  vertical-align: middle;
  padding:0 9px;
  display:flex;
  justify-content: space-between;
}
.lv-robot-panel-title-left{

}
.lv-robot-panel-title-right{
  display: flex;
  flex-direction: row;
  align-items: center;
}
.lv-robot-icon{
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-sizing: border-box;
  width: 23px;
  height: 23px;
  padding: 4px;
  border-radius: 2px;
}
.lv-robot-panel-content{
  flex:1;
  background-color: #f4f4f5;
}
.lv-robot-icon:hover{
  background-color:rgba(0,0,0,0.05);
} 
</style>