import { StandStyle } from "../lmm/style/StandStyle"
import { Graph2D } from "../lmm/objects/Graph2D"
import { Group } from "../lmm/objects/Group"
import { PolyGeometry } from "../lmm/geometry/PolyGeometry"
import { BasicScene } from "../lmm/core/BasicScene"
const n=6
class RobotMap{
  // scene 场景对象
  scene=new BasicScene()
  // 基点
  originX:number
  originY:number
  // 地图尺寸的缩放
  mapScale:number
  // 分辨率
  resolution:number
  // 地图尺寸
  mapWidth:number
  mapHeight:number
  // 机器人,几何图形的单位是像素
  robot=new Graph2D(
    new PolyGeometry(
      [
        -n/3, 0,
        -n,n,
        n,0,
        -n,-n
      ],
      true
    ),
    new StandStyle({
      fillStyle:'#ff0000',
      strokeStyle:'#fff',
      lineWidth:2,
    })
  )
  // 机器人路径，路径的宽度是像素
  robotPath=new Graph2D(
    new PolyGeometry([]),
    new StandStyle({
      strokeStyle:'#00acec',
      lineWidth:1,
    })
  )

  constructor(
    originX=0,
    originY=0, 
    resolution=0.5,
    mapWidth=100,
    mapHeight=100,
    mapScale=1,
  ){
    this.originX=originX
    this.originY=originY
    this.mapScale=mapScale
    this.mapScale=mapScale
    this.resolution=resolution
    this.mapWidth=mapWidth
    this.mapHeight=mapHeight
    const {scene:{canvas:{style}}}=this
    // canvas绝对定位
    style.position='absolute'
    style.right='0'
    style.top='0'
    style.zIndex='50'
    this.init()
  } 

  // 初始化
  init(){
    const {scene,robot,mapScale,resolution,originX,originY,mapWidth,mapHeight,robotPath}=this
    const canvasWidth=mapWidth*mapScale
    const canvasHeight=mapHeight*mapScale
    scene.clear()
    scene.setSize(canvasWidth,canvasHeight)
    const group1=new Group()
    group1.scale.set(mapScale,-mapScale)
    group1.position.y=canvasHeight
    const group2=new Group()
    group2.scale.set(1/resolution)
    const group3=new Group()
    group3.position.set(-originX,-originY)
    const localScale=resolution/mapScale
    robot.visible=false
    robot.scale.set(localScale)
    robotPath.style.lineWidth*=localScale
    group3.add(robotPath)
    group3.add(robot)
    group2.add(group3)
    group1.add(group2)
    scene.add(group1)
  }

  setRobotPosition(x:number,y:number){
    this.robot.position.set(x,y)
  }
  setRobotRotate(rad:number){
    this.robot.rotate=rad
  }  

  setRobotPath(xArray:number[],yArray:number[]){
    const {resolution,mapScale,robotPath}=this
    const len=xArray.length
    if(!len){return}
    let x1=xArray[0]
    let y1=yArray[0]
    const path=[x1,y1]
    const min=4*(resolution/mapScale)
    for(let i=1;i<len;i++){
      const x2=xArray[i]
      const y2=yArray[i]
      const distance=Math.abs(x2-x1)+Math.abs(y2-y1)
      if(distance<min){ continue}
      path.push(x2,y2)
        x1=x2
        y1=y2
    }
    robotPath.geometry.position=path
  }

  hideRobot(){
    const {robot}=this
    robot.visible=false
    this.render()
  }
  showRobot(){
    const {robot}=this
    robot.visible=true
    this.render()
  } 

  // 渲染
  render() {
    this.scene.render()
  }

  // 销毁容器中的canvas和内存，不销毁容器，适用于onUnmounted 事件
  dispose(){
    const {scene}=this
    // 清空children
    scene.clear()
    // 从容器中删除canvas
    scene.canvas.remove()
  }
}

export {RobotMap}