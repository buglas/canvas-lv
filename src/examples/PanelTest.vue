<script setup lang="ts">
import { ref, onMounted, onUpdated } from 'vue'
import { Panel, PanelController, PanelDomCreator, PanelWrapper } from './jsm/PanelController'

// 获取父级属性
defineProps({
	size: { type: Object, default: { width: 0, height: 0 } },
})
const panelsContRef=ref<HTMLDivElement>()

const panelController=new PanelController()
const {panelDomCreator,panelTree}=panelController

// const panelDomCreator=new PanelDomCreator()

// const panelsRootWrapper=new PanelWrapper()
/* const panel1=new Panel()
panelsRootWrapper.addPanel(panel1)
const panel2=new Panel()
panelsRootWrapper.addPanel(panel2)
const panel3=new Panel()
panel2.addPanel(panel3,'column') */

panelController.setPanelTreeOption({
  direction:'row',
  children:[
    {
      size:40,
      domElement:panelDomCreator.create('3D'),
    },
    {
      direction:'column',
      children:[
        {
          domElement:panelDomCreator.create(),
          size:40
        },
        {
          children:[
            {
              domElement:panelDomCreator.create('3D'),
            },
            {
              domElement:panelDomCreator.create(),
            }
          ]
        }
      ]
    }
  ]
})

function pushPanel(){
  console.log('pushPanel');
  panelController.pushPanel()
}

onUpdated(()=>{
  console.log('onUpdated');
})

onMounted(() => {
  console.log('onMounted');
	const {value:panelsCont}=panelsContRef
  if(!panelsCont){return}
  panelController.appendDomElementTo(panelsCont)
})

</script>

<template>
  <div id="cont">
    <div id="btns">
      <button @click="pushPanel">pushPanel</button>
    </div>
	  <div id="panelsCont" ref="panelsContRef"></div>
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