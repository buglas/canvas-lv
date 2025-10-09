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
    />
    <template v-else>
      <div 
        class="lv-robot-panel-title"
        @mousedown="titleMousedown"
        @mousemove="titleMousemove"
        @mouseleave="titleMouseleave"
      >
        {{ node.type }}
      </div>
      <div class="lv-robot-panel-content"></div>
    </template>
  </div>
</template>

<script setup>
import { onUpdated } from 'vue'
import { PanelController } from '../jsm/PanelController';

defineProps({
  node: {
    type: Object,
    required: true
  }
});

// 定义可以触发的事件
const emits = defineEmits(['titleMousedown','titleMousemove','titleMouseleave','panelUpdated'])

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