<template>
    <div :class="className">
        <component :is="ICON_MAP[type]" :state="state"></component>
    </div>
</template>

<script lang="ts" setup>
import { toRefs } from 'vue';

import IconSetting from './icon/setting.vue';
import IconReset from './icon/reset.vue';
import IconMore from './icon/more.vue';
import IconSplitVertical from './icon/split-vertical.vue';
import IconSplitHorizontal from './icon/split-horizontal.vue';
import IconDelete from './icon/delete.vue';
import FullScreen from './icon/full-screen.vue';
import ShrinkScreen from './icon/shrink-screen.vue';

const ICON_MAP:{[k:string]:object} = {
  more: IconMore,
  'split-horizontal': IconSplitHorizontal,
  'split-vertical': IconSplitVertical,
  setting: IconSetting,
  delete: IconDelete,
  reset: IconReset,
  'global-setting': IconSetting,
  'full-screen': FullScreen,
  'shrink-screen': ShrinkScreen,
};

interface ISysIcon {
    type: string
    class?: string
    state?: string
}

const props = withDefaults(defineProps<ISysIcon>(), {
    type: '',
    class: '',
    state: '',
});
const { type, class: className, state } = toRefs(props);
</script>

<style scoped>
  svg{
    width: 100%;
    height: 100%;
  }
</style>
