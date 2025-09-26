<!-- TreeItem.vue -->
<template>
  <div class="wrapper">
    <PanelWrapper 
      v-if="node.children"
      v-for="child in node.children" 
      :key="child.id" 
      :node="child"
    />
    <div class="panel" v-else>
      {{ node.name }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  node: {
    type: Object,
    required: true
  }
});
</script>

<style>
  .wrapper{
    padding: 12px;
    border: 1px solid #333;
  }
</style>