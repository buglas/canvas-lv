<script setup lang="ts">
import { ref, onMounted, onUpdated, onUnmounted } from 'vue'
import { Panel, PanelController, PanelDomCreator, PanelWrapper } from './jsm/PanelController'
import PanelTree from './components/PanelTree.vue'

// 获取父级属性
defineProps({
	size: { type: Object, default: { width: 0, height: 0 } },
})
const panelsRef=ref<HTMLDivElement>()
const panelsContRef=ref<HTMLDivElement>()

const panelController=new PanelController()
const {panelDomCreator,panelTreeRef,dragStartPos,dragEndPos,panelTreeMask}=panelController

panelController.setPanelTreeOption({
  direction:'row',
  children:[
    {size:40,type:'3D'},
    {
      direction:'column',
      children:[
        {size:40},
        { children:[{type:'3D'},{}]}
      ]
    }
  ]
})


// function pushPanel(){
//   console.log('pushPanel');
//   panelController.pushPanel()
// }

// onUpdated(()=>{
//   console.log('onUpdated');
// })


const totalMousedown = (event:MouseEvent) => {
  // console.log('totalMousedown')
  panelController.totalMousedown(event)
}
const totalMousemove = (event:MouseEvent) => {
  // console.log('totalMousemove')
  panelController.totalMousemove(event)
}
const titleMousedown = (event:MouseEvent) => {
  // console.log('titleMousedown')
  panelController.titleMouseDown(event)
}
const titleMousemove = (event:MouseEvent) => {
  // console.log('titleMousemove')
  panelController.titleMousemove(event)
}
const titleMouseleave = (event:MouseEvent) => {
  // console.log('titleMouseleave')
  panelController.titleMouseleave(event)
}
const panelUpdated=()=>{
  panelController.updateHotZone()
}

onUpdated(()=>{
  panelUpdated()
})
onMounted(() => {
  console.log('onMounted');
	const {value:panels}=panelsRef
  if(!panels){return}
  panelController.setDomElement(panels)
})
onUnmounted(()=>{
  panelController.destroy()
})
</script>

<template>
  <div id="cont">
    <div id="btns">
      <button @click="">pushPanel</button>
    </div>
	  <!-- <div id="panelsCont" ref="panelsContRef"></div> -->
    <div 
      id="panelsCont" 
      ref="panelsRef"
      @mousedown="totalMousedown"
      @mousemove="totalMousemove"
    >
      <PanelTree 
        :node="panelTreeRef"
        @titleMousedown="titleMousedown"
        @titleMousemove="titleMousemove"
        @titleMouseleave="titleMouseleave"
        @panelUpdated="panelUpdated"
      ></PanelTree>
    </div>
    
  </div>
</template>

<style scoped>
#cont{
margin:32px auto;
width: 600px;
overflow: hidden;
}
#btns{
  padding-bottom: 2px;
}
#panelsCont{
  position: relative;
  width: 100%;
  height: 400px;
}
</style>
<style>
.lv-robot-panel-wrapper{
  box-sizing: border-box;
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
  font-size: 14px;
  color: #313131;
  background-color: #efeff0;
  line-height: 30px;
  vertical-align: middle;
  padding:0 9px;
}
.lv-robot-panel-content{
  flex:1;
  background-color: #f4f4f5;
}
</style>