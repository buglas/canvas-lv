<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import map from '/src/assets/map.jpg'
import { RobotMap } from '../component/RobotMap'
import { cvsData } from './dataLib/MapData'
import {Euler, Quaternion} from 'three'
const odomData=cvsData['odom_slam.csv'] as any

const maxCount=odomData.x.length-1
let animationTime=0


const mapScale=0.3
const mapWidth=286 
const mapHeight=1011  
const originX=-5.00504, originY=-43.6736
const resolution=0.05000000074505806

// 地图
const mapWrapperRef = ref<HTMLDivElement>()
const robotMap=new RobotMap(originX,originY,resolution,mapWidth,mapHeight,mapScale)
robotMap.setRobotPath(odomData.x,odomData.y)
robotMap.showRobot()

const _quaternion=new Quaternion()
const _euler=new Euler()

function ani(){
  const [x, y,qx, qy, qz, qw] = ['x', 'y','qx', 'qy', 'qz', 'qw'].map(k=>{
      return Number(odomData[k][animationTime]||0);
  });
  _quaternion.set(qx, qy, qz, qw)
  _euler.setFromQuaternion(_quaternion)
  robotMap.setRobotRotate(_euler.z)
  robotMap.setRobotPosition(x,y)
  robotMap.render()
  animationTime+=8
  if(animationTime>=maxCount){
    animationTime=0
  }
  requestAnimationFrame(ani)
}

onMounted(() => {
	const mapWrapper = mapWrapperRef.value
  if(mapWrapper){
    const {canvas} = robotMap.scene
    mapWrapper.style.width=canvas.style.width
    mapWrapper.style.height=canvas.style.height
    mapWrapper.append(canvas)
    robotMap.render()
    console.log(robotMap);
    /* setTimeout(() => {
      robotMap.setRobotPosition(5,5)
      robotMap.render()
    }, 1000) */
    ani()
  }
})
onUnmounted(()=>{
  robotMap.dispose()
})
</script>
<template>
  <!-- canvas 容器 -->
  <div id="cont">
    <div
      id="mapWrapper"
      ref="mapWrapperRef"
    >
      <img :src="map" style="width: 100%;height:100%"/> 
    </div>
  </div>
</template>

<style scoped>
  #cont{
    position: relative;
    box-sizing: border-box;
    height: 100%;
  }
  #mapWrapper{
    position: absolute;
    top:30px;
    right: 50%;
  }
  
</style>