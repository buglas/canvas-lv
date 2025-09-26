import { RectGeometry } from "../../lmm/geometry/RectGeometry";
import { Vector2 } from "../../lmm/math/Vector2";
import { Graph2D } from "../../lmm/objects/Graph2D";
import { Group } from "../../lmm/objects/Group";
import { TextGraph2D } from "../../lmm/objects/TextGraph2D";
import { StandStyle } from "../../lmm/style/StandStyle";
import { TextStyle } from "../../lmm/style/TextStyle";

/* 
操作状态
- initial 初始状态
- cropping 裁剪中
- cropAreaDragging 裁剪区域拖拽中
- controlPointDragging 控制点拖拽中
- default 无状态 
*/
type CropStateType='initial'|'cropping'|'cropAreaDragging'|'controlPointDragging'|'default'

/* 鼠标划上状态，与鼠标的cursor 样式同步
- default 无状态
- move 鼠标划上裁剪区域
- pointer 鼠标划上控制点
*/
type CropHoverState='default'|'move'|'pointer'

class CropFrame extends Group{
  // 操作状态
  state:CropStateType='initial'
  // 鼠标划上状态
  hoverState:CropHoverState='default'
  // 裁剪起点
  start=new Vector2()
  // 裁剪结束点
  end=new Vector2()
  // 文本样式
  fontStyle=new TextStyle({
    fontSize:14,
    textAlign:'center',
    textBaseline:'middle',
    lineWidth:4,
    fillStyle:'#00ff00',
  })
  // 裁剪区域样式
  cropAreaStyle=new StandStyle({strokeStyle:'#00ff00'})
  // 控制点样式
  pointStyle=new StandStyle({strokeStyle:'#00ff00',fillStyle:'#fff'})
  // 遮罩底色样式
  maskBackStyle= new StandStyle({fillStyle:'rgba(0,0,0,0.2)'})
  // 起点文字图形
  startText=new TextGraph2D('',this.fontStyle)
  // 结束点文字图形
  endText=new TextGraph2D('',this.fontStyle)
  // 裁剪区域Geometry
  cropAreaGeometry=new RectGeometry()
  //裁剪区域图形，rect图形，固定基点为零点
  cropAreaShape:Graph2D<RectGeometry,StandStyle>=new Graph2D(
    this.cropAreaGeometry,
    this.cropAreaStyle
  )
  // 遮罩底色图形
  maskBackShape:Graph2D<RectGeometry,StandStyle>=new Graph2D(
    new RectGeometry(),
    this.maskBackStyle
  )
  // 遮罩图形=遮罩底色→合成→裁剪区域 
  maskShape=new Group()
  
  //当前拖拽的控制点
  currentDragPoint:Vector2|undefined
  //拖拽起始位置
  dragStart=new Vector2()
  // 鼠标划上的控制点
  hoverPoint:Vector2|undefined
  // 裁剪图形的可见性，初始不可见
  visible: boolean=false

  constructor(){
    super()
    const {maskBackShape,maskShape,cropAreaShape,cropAreaGeometry,start,end,startText,endText,pointStyle}=this
    // 用于遮罩镂空的矩形
    const hollowShape=new Graph2D(
      cropAreaGeometry,
      new StandStyle({
        fillStyle:'#000',
        globalCompositeOperation:'destination-out'
      })
    )
    // 将底色和镂空图形合成遮罩
    maskShape.add(
      maskBackShape,
      hollowShape
    )
    this.add(maskShape,cropAreaShape)
    // 裁剪框上有2个控制点和标注，其位置分别与start、end 联动
    const pointGeo=new RectGeometry(-5,-5,10,10)
    for(let i=0;i<2;i++){
      const point=new Graph2D(
        pointGeo,
        pointStyle
      )
      const pos=[start,end][i]
      const text=[startText,endText][i]
      point.position=pos
      text.position=pos
      this.add(point,text)
    }

    this.init()
  }

  // 初始化裁剪状态、图形位置和尺寸
  init(){
    const {maskBackShape,maskShape,cropAreaShape,cropAreaGeometry,start,end}=this
    // 重置操作状态
    this.state='initial'
    // 鼠标划入状态
    this.hoverState='default'
    this.hoverPoint=undefined
    // 隐藏所有图形
    this.visible=false
    //隐藏遮罩图形
    maskShape.visible=false
    // 拖拽起始位置和结束位置归零
    start.set(0)
    end.set(0)
    this.updateCrop()
    
  }

  /* 更新裁剪区域和标注 */
  updateCrop(){
    /* 更新裁剪区域的位置和尺寸 */
    const {cropAreaShape:{geometry},start,end,startText,endText}=this
    const {min,max}=this.getLimit()
    geometry.offset.set(min.x,min.y)
    geometry.size.set(max.x-min.x,max.y-min.y)
    geometry.updatePosition()

    /* 更新标注 */
    // 裁剪区域的中心点，相对位置
    const center=end.clone().sub(start).multiplyScalar(0.5)
    // 方向
    const dir=new Vector2(Math.sign(center.x),Math.sign(center.y))
    // 标注位置
    for(let i=0;i<2;i++){
      const text=[startText,endText][i]
      const offset=new Vector2(text.width/2+9,text.style.fontSize/2+9)
      const diagonalDir=[1,-1][i]
      text.offset.copy(offset).multiply(dir).multiplyScalar(diagonalDir)
    }
    // 标注内容
    startText.text=`( ${start.x}, ${start.y} )`
    endText.text=`( ${end.x}, ${end.y} )`
  }

  // 获取左上点和右下点
  getLimit(){
    const {start,end}=this
    const xl=[start.x,end.x].sort((a,b)=>a-b)
    const yl=[start.y,end.y].sort((a,b)=>a-b)
    return {
      min:{x:xl[0],y:yl[0]},
      max:{x:xl[1],y:yl[1]}
    }
  }

  // 设置遮罩底色的尺寸
  setMaskBackSize(w:number,h:number){
    const {maskBackShape:{geometry}}=this
    geometry.size.set(w,h)
    geometry.updatePosition()
  }

  // 鼠标按下
  pointerdown(mp:Vector2) {
    const {start,end,dragStart,hoverState,hoverPoint,maskShape}=this
    // 初始化
    if(this.state=='initial'){
      this.visible=true
      this.state='default'
    }
    // 隐藏遮罩
    maskShape.visible=false
    // 拖拽起点
    dragStart.copy(mp)
    // 根据鼠标在图形上的状态，更新操作状态
    if(hoverState=='move'){
      this.state='cropAreaDragging'
    }else if(hoverState=='pointer'){
      this.state='controlPointDragging'
      this.currentDragPoint=hoverPoint
    }else if(this.state=='default'){
      start.copy(mp)
      end.copy(mp)
      this.updateCrop()
      this.state='cropping'
    }
  }
  // 鼠标移动
  pointermove(mp:Vector2) {
    const {state,start,end,dragStart,hoverState,cropAreaShape,currentDragPoint}=this
    if(state=='initial'){return}
    if(state=='default'){
      // 当操作状态为'default'时，根据鼠标与图形的关系，更新鼠标划上状态
      const hoverPoint=this.getHoverPoint(mp)
      if(hoverPoint){
        this.hoverPoint=hoverPoint
        this.hoverState='pointer'
      }else if(cropAreaShape.isPointIn(mp)){
        this.hoverState='move'
      }else{
        this.hoverState='default'
        this.hoverPoint=undefined
      }
      if(hoverState!=this.hoverState){
        this.dispatchEvent({type:'hoverStateChange',state:this.hoverState})
      }
    }else{
      // 根据操作状态操作图形
      if(state=='cropping'){
        // 绘制裁剪框
        end.copy(mp)
      }else {
        // 鼠标瞬时位移的有向距离
        const distance=mp.clone().sub(dragStart)
        // 更新拖拽起点
        dragStart.copy(mp)
        if(state=='controlPointDragging'){
          // 移动控制点
          currentDragPoint?.add(distance)
        }else if(state=='cropAreaDragging'){
          // 移动裁剪框
          end.add(distance)
          start.add(distance)
        }
      }
      // 更新裁剪框图形
      this.updateCrop()
    }
  }

  // 鼠标抬起
  pointerup() {
    if(this.state=='initial'){return}
    // 显示遮罩
    this.maskShape.visible=true
    this.currentDragPoint=undefined
    this.state='default'
  }

  // 通过距离判断鼠标是否在控制点上
  getHoverPoint(mp:Vector2){
    const cropPoints=[this.start,this.end]
    for(let i=0;i<2;i++){
      const distance=mp.clone().sub(cropPoints[i]).length()
      if(distance<20){
        return cropPoints[i]
      }
    }
    return undefined
  }
}

export {CropFrame}