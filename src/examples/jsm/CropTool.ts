import { ref } from "vue"
import { Scene } from "../../lmm/core/Scene"
import { CropFrame } from "./CropFrame"
import { Graph2D } from "../../lmm/objects/Graph2D"
import { RectGeometry } from "../../lmm/geometry/RectGeometry"
import { StandStyle } from "../../lmm/style/StandStyle"
import { BasicScene } from "../../lmm/core/BasicScene"

class CropTool{
  // canvas 容器
  container:HTMLDivElement|undefined
  // 监听容器尺寸变化
  resizeObserver:ResizeObserver|undefined
  // scene 场景对象
  scene=new BasicScene()
  // 裁剪框
  cropFrame=new CropFrame()
  oldFrame:Graph2D<RectGeometry,StandStyle>=new Graph2D(
    new RectGeometry(10,10,100,100),
    new StandStyle({
      strokeStyle:'#00ff00',
      lineWidth:4,
      fillStyle:'rgba(0,0,0,1)',
    })
  )
  // 鼠标状态
  cursor=ref('default')
  // 为了移除事件
  pointerdownThis=this.pointerdown.bind(this)
  pointermoveThis=this.pointermove.bind(this)
  pointerupThis=this.pointerup.bind(this)

  constructor(container?:HTMLDivElement){
    const {scene:{canvas:{style}}}=this
    // canvas绝对定位
    style.position='absolute'
    style.left='0'
    style.top='0'
    style.zIndex='100'
    
    // 设置canvas容器
    container&&this.setContainer(container)
  } 
  
  /* 设置容器 */
  setContainer(container:HTMLDivElement){
    this.container=container
    const {scene,cropFrame}=this
    const {style}=container
    style.position='relative'
    
    //销毁数据
    this.dispose()

    this.oldFrame.visible=false
    this.scene.add(this.oldFrame)

    //添加裁剪工具
    scene.add(cropFrame)
    container.append(scene.canvas)
    
    // 在canvas容器上监听鼠标事件
    container.addEventListener('pointerdown',this.pointerdownThis)
    container.addEventListener('pointermove',this.pointermoveThis)
    window.addEventListener('pointerup',this.pointerupThis)
    
    cropFrame.addEventListener('hoverStateChange',({state})=>{
      style.cursor=state
    })

    // 自适应容器尺寸
    this.resizeObserver=new ResizeObserver(entries => {
      const {contentRect:{width,height}}=entries[0]
      this.setSize(width, height)
    }); 
    this.resizeObserver.observe(container);
  }

  // 画一个框
  showOldFrame(min:any,max:any){
    const {oldFrame,oldFrame:{geometry}, scene}=this
    geometry.offset.set(min.x,min.y)
    geometry.size.set(max.x-min.x,max.y-min.y)
    geometry.updatePosition()
    oldFrame.visible=true
    console.log('oldFrame',oldFrame);
    scene.render()
  }

  // 重置裁剪状态、图形位置和尺寸，更新裁剪图像前调用
  reset(){
    const {cropFrame,cursor,scene}=this
    cropFrame.init()
    cursor.value='default'
    scene.render()
  }

  // 获取位置，若没有截图，返回null
  getCropPoints(){
    const {cropFrame}=this
    if(cropFrame.state=='initial'){return null}
    return cropFrame.getLimit()
  }

  // 设置裁剪空间的尺寸
  setSize(w:number,h:number){
    this.scene.setSize(w,h)
    this.cropFrame.setMaskBackSize(w,h)
    this.scene.render()
  }
  
  // 鼠标左键按下
  pointerdown(event:PointerEvent){
    const {pageX,pageY,button}=event
    if(button){return}
    event.preventDefault()
    const {cropFrame,scene}=this
    const pagePos=scene.pageToCanvas(pageX,pageY)
    cropFrame.pointerdown(pagePos)
    scene.render()
  }

  // 鼠标移动
  pointermove({pageX,pageY}:PointerEvent){
    const {cropFrame,scene}=this
    const pagePos=scene.pageToCanvas(pageX,pageY)
    cropFrame.pointermove(pagePos)
    scene.render()
  }

  // 鼠标左键抬起
  pointerup({button}:PointerEvent){
    console.log('pointerup');
    if(button){return}
    this.cropFrame.pointerup()
    this.scene.render()
  }

  /* 设置样式 
    strokeStyle 描边颜色
    maskFillStyle 遮罩颜色
    pointFillStyle 控制点的填充颜色
  */
  setStyle({basicColor,maskColor,pointColor}:{
    basicColor?:string
    maskColor?:string
    pointColor?:string
  }){
    const {cropFrame:{fontStyle,cropAreaStyle,pointStyle,maskBackStyle},scene}=this
    if(basicColor){
      pointStyle.strokeStyle=basicColor
      cropAreaStyle.strokeStyle=basicColor
      fontStyle.fillStyle=basicColor
    }
    maskColor&&(maskBackStyle.fillStyle=maskColor)
    pointColor&&(pointStyle.fillStyle=pointColor)
    scene.render()
  }

  // 销毁容器中的canvas和内存，不销毁容器，适用于onUnmounted 事件
  dispose(){
    const {scene,container,resizeObserver,cursor}=this
    // 重置状态
    this.reset()
    // 清空children
    scene.clear()
    // 从容器中删除canvas
    scene.canvas.remove()
    // 解除监听关系
    if(container){
      console.log('dispose');
      container.removeEventListener('pointerdown',this.pointerdownThis)
      container.removeEventListener('pointermove',this.pointermoveThis)
      window.removeEventListener('pointerup',this.pointerupThis)
      resizeObserver?.unobserve(container)
      resizeObserver?.disconnect()
    }
  }
}

export {CropTool}