<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { CropTool } from '../utils/CropTool'

// canvas 容器
const canvasWrapperRef = ref<HTMLDivElement>()
// 实例化截图工具
const cropTool=new CropTool()

function getCropPoints(){
  console.log(cropTool.getCropPoints())
}
function setStyle(){
  cropTool.setStyle({
    basicColor:'red',
    maskColor:'yellow',
    pointColor:'green'
  })
}
function setContainer(){
  const canvasWrapper = canvasWrapperRef.value
  if(canvasWrapper){
    // 把canvas容器传给截图工具
    cropTool.setContainer(canvasWrapper)
  }
}

function showOldFrame(){
  const {min,max}=cropTool.cropFrame.getLimit()
  console.log('min,max',min,max);
  cropTool.showOldFrame(min,max)
}

function test(){
  console.log('test');
  window.removeEventListener('click',test)
}
window.addEventListener('click',test)



onMounted(() => {
	const canvasWrapper = canvasWrapperRef.value
  if(canvasWrapper){
    // 把canvas容器传给截图工具
    cropTool.setContainer(canvasWrapper)
  }
})
onUnmounted(()=>{
  cropTool.dispose()
})
</script>
<template>
  <!-- canvas 容器 -->
  <div id="cont">
    <button @click="cropTool.reset()">重置</button>
    <button @click="getCropPoints">获取裁剪点位</button>
    <button @click="setStyle">设置样式</button>
    <button @click="cropTool.dispose()">销毁数据</button>
    <button @click="setContainer">重新设置容器</button>
    <button @click="showOldFrame">复现裁剪框</button>
    <div
      id="canvasWrapper"
      ref="canvasWrapperRef"
    >
      <!-- canvas 容器中的图片 -->
      <img /> 
    </div>
  </div>
</template>

<style scoped>
  #cont{
    box-sizing: border-box;
    padding: 90px;
    height: 100%;
  }
  #canvasWrapper{
    width: 100%;
    height: 100%;
    background-color: antiquewhite;
    overflow: hidden;
  }
  
</style>