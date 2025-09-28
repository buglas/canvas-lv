import { BasicScene } from "../../lmm/core/BasicScene"
import { Object2D } from "../../lmm/core/Object2D"
import { Geometry } from "../../lmm/geometry/Geometry"
import { PolyGeometry } from "../../lmm/geometry/PolyGeometry"
import { RectGeometry } from "../../lmm/geometry/RectGeometry"
import {generateUUID} from "../../lmm/math/MathUtils"
import { Vector2 } from "../../lmm/math/Vector2"
import { Graph2D } from "../../lmm/objects/Graph2D"
import { Group } from "../../lmm/objects/Group"
import { StandStyle } from "../../lmm/style/StandStyle"
import { DomCreator } from "./DomCreator"

type DirectionType='row'|'column'
type OrderType='unshift'|'push'
type PanelOptionType={
  domElement?:HTMLElement
  // 百分比
  size?:number
  parentDirection?:DirectionType
}

class Panel{
  uuid:string=generateUUID()
  domElement:HTMLElement=document.createElement('div')
  classPrefix='lv-robot-'
  class='panel'
  size:number=100
  parent?:PanelWrapper
  constructor(option:PanelOptionType={}){
    this.init(option)
  }
  init(option:PanelOptionType={}){
    const {
      domElement=document.createElement('div'),
      parentDirection='row',
      size
    }=option
    const {style}=domElement
    domElement.setAttribute('data-uuid',this.uuid)
    this.class&&domElement.classList.add(this.classPrefix+this.class)
    style.width='100%'
    style.height='100%'
    this.domElement=domElement
    this.setSize(size,parentDirection)
  }
  addPanel(panel:Panel,direction:DirectionType='row',order:OrderType='push'){
    const {parent,size}=this
    if(!parent){
      console.warn('没有父级的Panel不可添加Panel。')
      return;
    }
    if(parent.isFull()){
      // 若父级已满，在当前panel 外包裹panelWrapper
      // 根据当前panel 在父级children中的位置，替换成panelWrapper
      const ind=this.getIndexOfParent()
      if(ind==undefined){
        return
      }
      const panelWrapper=new PanelWrapper({
        size,
        parentDirection:this.parent?.direction
      })
      parent.domElement.replaceChild(panelWrapper.domElement,this.domElement)
      parent.children[ind]=panelWrapper
      panelWrapper.parent=parent
      panelWrapper.addPanel(this)
      panelWrapper.addPanel(panel,direction,order)
    }else{
      // 若父级未满，父级添加
      parent.addPanel(panel,direction,order)
    }
  }
  getIndexOfParent(){
    const {parent}=this
    if(!parent){
      console.warn('this',this)
      console.warn('getIndexOfParent(): 父级不存在')
      return undefined
    }
    const ind=parent.children.indexOf(this)
    if(ind!=0&&ind!=1){
      console.warn('Panel 在父级children中的索引位置非0非1:',this)
      return undefined
    }
    return ind
  }
  setSize(size:number=100,parentDirection?:DirectionType){
    this.size=size
    let wh=this.getParentWH(parentDirection)
    this.domElement.style[wh]=size+'%'
  }
  getParentWH(parentDirection?:DirectionType){
    const {parent}=this
    let wh:'width'|'height'='width'
    if(parent){
      wh=parent.getWH()
    }else if(parentDirection){
      wh=parentDirection=='row'?'width':'height'
    }
    return wh
  }
  
  getBrother():Panel|undefined{
    const {parent}=this
    if(!parent||!parent.isFull()){
      return undefined
    }
    for(let child of parent.children){
      if(child!=this){
        return child
      }
    }
    return undefined
  }
  traverse(fn:(panel:Panel)=>void|boolean){
    if(fn(this)){
      return
    }
    if(this instanceof PanelWrapper){
      for(let child of this.children){
        child.traverse(fn)
      }
    }
  }
  remove(){
    const {domElement,parent}=this
    domElement.remove()
    const ind=this.getIndexOfParent()
    if(!parent||ind==undefined){return}
    const {children}=parent
    children.splice(ind,1)
    if(children.length){
      children[0].setSize(100,parent.direction)
    }else{
      parent.remove()
    }
  }
}


type PanelWrapperOptionType=PanelOptionType&{
  children:(PanelOptionType|PanelWrapperOptionType)[]
  direction?:DirectionType
}


class PanelWrapper extends Panel{
  direction:DirectionType='row'
  children:(PanelWrapper|Panel)[]=[]
  class='panel-wrapper'
  constructor(option:any={}){
    super()
    this.init(option)
  }
  init(option:any={}){
    const {
      direction='row',
    }=option
    super.init(option)
    this.domElement.style.display='flex'
    this.setDirection(direction)
  }
  setOption(option:PanelWrapperOptionType|PanelOptionType){
    this.clear()
    this.init(option)
    traverse1(option)
    traverse2(option,this)
    function traverse1(opt:PanelWrapperOptionType|PanelOptionType){
      if('children' in opt){
        const {children:optChildren}=opt
        const len=optChildren.length
        if(len==2){
          const b0=optChildren[0].size==undefined
          const b1=optChildren[1].size==undefined
          if(b0&&b1){
            optChildren[0].size=50
            optChildren[1].size=50
          }else if(!b0){
            optChildren[1].size=100-(optChildren[0].size||50)
          }else if(!b1){
            optChildren[0].size=100-(optChildren[1].size||50)
          }
        }
        for(let i=0;i<len;i++){ 
          const {direction='row'}=opt
          optChildren[i].parentDirection=direction
          traverse1(optChildren[i])
        }
      }
    }
    function traverse2(opt:PanelWrapperOptionType|PanelOptionType,obj:PanelWrapper|Panel){
      let obj2;
      if('children' in opt){
        const {children:optChildren}=opt
        const len=optChildren.length
        for(let i=0;i<len;i++){ 
          if('children' in optChildren[i]){
            obj2=new PanelWrapper(optChildren[i]);
          }else{
            obj2=new Panel(optChildren[i]);
          }
          (obj as PanelWrapper).appendChild(obj2) 
          traverse2(optChildren[i],obj2);
        }
      }
    }
  }
  getChildByUUID(uuid:string){
    let child:Panel|undefined;
    this.traverse((ele)=>{
      if(ele.uuid==uuid){
        child=ele;
        return true;
      }
    }) 
    return child
  }
  
  isFull(){
    return this.children.length>=2
  }
  isEmpty(){
    return this.children.length==0
  }
  setDirection(dir:DirectionType='row'){
    this.direction=dir
    this.domElement.style.flexDirection=dir
  }
  addPanel(panel:Panel,dir:DirectionType='row',order:OrderType='push'){
    const {children,domElement:wrapperDom}=this
    const {domElement:panelDom}=panel
    if(this.isFull()){return}
    this.setDirection(dir)
    if(this.isEmpty()||order=='push'){
      children.push(panel)
      wrapperDom.appendChild(panelDom)
    }else if(children.length==1&&order=='unshift'){
      children.unshift(panel)
      wrapperDom.insertBefore(panelDom,wrapperDom.firstChild);
    }
    panel.parent=this
    this.updateSize()
  }
  appendChild(...objs:(PanelWrapper|Panel)[]){
    const {children,domElement}=this
    objs.forEach(obj=>{
      children.push(obj)
      obj.parent=this
      domElement.appendChild(obj.domElement)
    })
  }
  // firstPanelSize 百分比*100
  updateSize(firstPanelSize?:number){
    const {children}=this
    children.forEach(({domElement:{style}})=>{
      style.width='100%'
      style.height='100%'
    })
    if(firstPanelSize==undefined){
      if(children.length==1){
        children[0].setSize(100)
      }else if(children.length==2){
        children[0].setSize(50)
        children[1].setSize(50)
      }
    }else{
      if(children.length==1){
        children[0].setSize(100)
      }else if(children.length==2){
        children[0].setSize(firstPanelSize)
        children[1].setSize(100-firstPanelSize)
      }
    }
  }
  formatSize(){
    const {children}=this
    children.forEach(({domElement:{style}})=>{
      style.width='100%'
      style.height='100%'
    })
    if(children.length==1){
      children[0].setSize(100)
      if(children[0] instanceof PanelWrapper){
        children[0].formatSize()
      }
    }else if(children.length==2){
      children[0].setSize(children[0].size)
      children[1].setSize(100-children[0].size)
      if(children[0] instanceof PanelWrapper){
        children[0].formatSize()
      }
      if(children[1] instanceof PanelWrapper){
        children[1].formatSize()
      }
    }
  }
  // size 像素单位,转百分比
  getPercentage(size:number){
    return (size/this.getClientSize())*100
  }
  getWH(){
    return this.direction=='row'?'width':'height'
  }
  getClientSize(){
    const {direction,domElement}=this
    return direction=='row'?domElement.clientWidth:domElement.clientHeight
  }
  clear(){
    this.children=[]
    this.domElement.innerHTML=''
  }
  getLast(){
    return getLastEle(this)
    function getLastEle(obj:Panel){
      if(obj instanceof PanelWrapper){
        const {children,children:{length}}=obj
        if(length){
          return getLastEle(children[length-1])
        }
      }
      return obj
    }
  }
  traversePanel(fn:(panel:Panel)=>void){
    for(let child of this.children){
      if(child instanceof PanelWrapper){
        child.traversePanel(fn)
      }else{
        fn(child)
      }
    }
  }
}

type PanelType='Image'|'3D'
class PanelDomCreator extends DomCreator{
  classPrefix='lv-robot-'
  create(type:PanelType='Image'): HTMLElement {
    this.option={
      children:[
        {
          className:'panel-title',
          innerText:type,
          events:[
            {
              type:'mousedown',
              listener:(event:any)=>{
                const {button,currentTarget}=event
                if(button==0 ){
                  const parentNode=currentTarget.parentNode as HTMLElement
                  if(!parentNode){
                    console.warn('title 的父级不存在')
                    return
                  }
                  const uuid=parentNode.getAttribute('data-uuid')
                  if(!uuid){
                    console.warn('title 的父级的uuid不存在')
                    return
                  }
                  this.onTitleMouseDown(event,uuid)
                }
              }
            },
            {
              type:'mousemove',
              listener:(event:any)=>{
                this.onTitleMouseMove(event)
              }
            },
            {
              type:'mouseleave',
              listener:(event:any)=>{
                this.onTitleMouseLeave(event)
              }
            },
          ]
        },
        {
          className:'panel-content',
          
        },
      ]
    }
    return super.create()
  } 
  
  onTitleMouseDown(event:MouseEvent,uuid:string){}
  onTitleMouseMove(event:MouseEvent){}
  onTitleMouseLeave(event:MouseEvent){}
}

type HoverStateType='readyDrag'|'readyStretch'|undefined
type PanelControlStateType='startDrag'|'dragging'|'startStretch'|'stretching'|undefined
const hotZoneTypes:{
  direction:DirectionType
  order:OrderType
}[]=[
  {
    direction:'column',
    order:'unshift'
  },
  {
    direction:'row',
    order:'push'
  },
  {
    direction:'column',
    order:'push'
  },
  {
    direction:'row',
    order:'unshift'
  }
]
// PanelController 再开一个rootDom，position: relative;包含panel和canvas
class PanelController{
  domElement=document.createElement('div')
  panelDomCreator=new PanelDomCreator()
  panelTree=new PanelWrapper()
  panelTreeMask=new BasicScene()
  hotZones=new Group()
  hotLines=new Group()
  currentMousedownUUID:string|undefined
  currentHotZone:Object2D|undefined
  panelControlState:PanelControlStateType
  currentHoverLine:Graph2D<PolyGeometry,StandStyle>|undefined
  currentDragPanel:Panel|undefined
  splitArea:Graph2D<PolyGeometry,StandStyle>=new Graph2D(
    new PolyGeometry().close(),
    new StandStyle({
      fillStyle:'rgba(0,0,0,0.1)',
      strokeStyle:'rgba(0,0,0,0.8)',
      lineWidth:1,
      lineDash:[5,3]
    })
  )
  floatShape:Graph2D<RectGeometry,StandStyle>=new Graph2D(
    new RectGeometry(),
    new StandStyle({
      fillStyle:'rgba(255,255,255,0.7)',
      shadowColor:'rgba(0,0,0,0.3)',
      shadowBlur:12,
      shadowOffsetY:2
    })
  )
  splitLine:Graph2D<PolyGeometry,StandStyle>=new Graph2D(
    new PolyGeometry(),
    new StandStyle({
      strokeStyle:'rgba(0,0,0,0.8)',
      lineWidth:1,
      lineDash:[]
    })
  )
  dragStart=new Vector2()
  dragDist=new Vector2()
  dragStartPos=new Vector2()
  dragEndPos=new Vector2()
  panelContResizeObserver:ResizeObserver
  hoverState:HoverStateType
  constructor(){
    const {domElement,panelDomCreator,panelTree,panelTreeMask,panelTreeMask:{canvas},hotZones,floatShape,dragStart,dragDist,splitArea,hotLines,splitLine,dragStartPos,dragEndPos}=this
    domElement.style.position='relative'
    domElement.style.width='100%'
    domElement.style.height='100%'
    domElement.appendChild(panelTree.domElement)
    
    canvas.style.position='absolute'
    canvas.style.top='0'
    canvas.style.left='0'
    canvas.style.pointerEvents='none'
    // canvas.style.backgroundColor='rgba(0,0,255,0.01)'
    domElement.appendChild(canvas)

    hotZones.name='hotZones'
    panelTreeMask.add(hotZones)

    hotZones.name='hotLines'
    panelTreeMask.add(hotLines)

    splitArea.name='splitArea'
    splitArea.visible=false
    panelTreeMask.add(splitArea)

    floatShape.name='floatShape'
    floatShape.visible=false
    panelTreeMask.add(floatShape)

    splitLine.name='splitLine'
    splitLine.visible=false
    panelTreeMask.add(splitLine)

    this.panelContResizeObserver=new ResizeObserver(entries => {
      entries.forEach(entry => {
        // console.log(`元素: `,entry.target);
        // console.log(`尺寸变化: `, entry.contentRect);
      });
    });

    panelDomCreator.onTitleMouseDown=({pageX,pageY },uuid)=>{
      if(this.panelControlState){return}
      dragStart.copy(panelTreeMask.pageToCanvas(pageX,pageY))
      dragStartPos.copy(panelTreeMask.pageToCanvas(pageX,pageY))
      this.currentMousedownUUID=uuid
      this.panelControlState='startDrag'
      const panel=panelTree.getChildByUUID(uuid)
      panel&&this.updateFloatPanelGeometry(panel)
    }
    panelDomCreator.onTitleMouseMove=()=>{
      // console.log('onTitleMouseMove');
      // console.log('this.hoverState',this.hoverState);
      if(!this.hoverState){
        this.hoverState='readyDrag'
      }
    }
    panelDomCreator.onTitleMouseLeave=()=>{
      // console.log('onTitleMouseLeave');
      if(this.hoverState=='readyDrag'){
        this.hoverState=undefined
      }
    }
    domElement.addEventListener('mousedown',({button,pageX,pageY })=>{
      if(button==0 ){
        dragStart.copy(panelTreeMask.pageToCanvas(pageX,pageY))
        dragStartPos.copy(panelTreeMask.pageToCanvas(pageX,pageY))
        if(this.currentHoverLine){
          this.panelControlState='startStretch'
          splitLine.style.lineDash=[5,3]
        }
      }
      panelTreeMask.render()
    })
    domElement.addEventListener('mousemove',({buttons,pageX,pageY })=>{
      const worldPosition=panelTreeMask.pageToCanvas(pageX,pageY);
      if(buttons==1){
        const dragEnd=worldPosition.clone()
        dragEndPos.copy(worldPosition)
        dragDist.copy(dragEnd.clone().sub(dragStart))
        if(this.panelControlState=='startDrag'){
          this.panelControlState='dragging'
          if(this.currentMousedownUUID==undefined){
            console.warn('currentMousedownUUID 丢失')
          }else{
            const target=panelTree.getChildByUUID(this.currentMousedownUUID)
            if(target){
              this.currentDragPanel=target
              splitArea.visible=true
              floatShape.visible=true
              target.remove()
              this.updateHotZone()
            }else{
              console.warn('没有找到拖拽目标')
            }
          }
        }else if(this.panelControlState=='startStretch'){
          this.updateHotZone()
          this.panelControlState='stretching'
        }
        if(this.panelControlState=='dragging'){
          let isPointInHotZone=false
          for(let hotZone of hotZones.children){
            if(!(hotZone instanceof Graph2D)){continue}
            if(hotZone.isPointIn(worldPosition)){
              if(this.currentHotZone!=hotZone){
                this.currentHotZone=hotZone
                const {userData:{splitRectPoints}}=hotZone
                if(splitRectPoints&&splitRectPoints instanceof Array){
                  splitArea.geometry.position=splitRectPoints
                }
              }
              isPointInHotZone=true
              break
            }
          }
          !isPointInHotZone&&(this.currentHotZone=undefined)
        }else if(this.panelControlState=='stretching'){
          // 拉伸panel，位移splitLine
          const {currentHoverLine}=this
          if(!currentHoverLine){
            console.warn('currentHoverLine 丢失')
          }else{
            const {userData:{panel,parentSize,childSize}}=currentHoverLine;
            this.stretchPanel(panel,parentSize,childSize)
          }
        }
        this.moveFloatPanel()
        dragStart.copy(dragEnd)
      }else{
        let isHover=false
        for(let hotLine of hotLines.children){
          if(!(hotLine instanceof Graph2D)){continue}
          if(hotLine.isPointInStroke(worldPosition)){
            if(this.currentHoverLine!=hotLine){
              this.currentHoverLine=hotLine as Graph2D<PolyGeometry,StandStyle>
              splitLine.visible=true
              splitLine.geometry=hotLine.geometry
            }
            isHover=true
            this.hoverState='readyStretch'
            break
          }
        }
        if(!isHover){
          this.currentHoverLine=undefined
          splitLine.visible=false
          if(this.hoverState=='readyStretch'){
            this.hoverState=undefined
          }
        }
      }
      this.updateCursor()
      panelTreeMask.render()
    })
    window.addEventListener('mouseup',()=>{
      if(this.currentHotZone){
        const {userData:{panel,direction,order}}=this.currentHotZone as any
        panel.addPanel(this.currentDragPanel,direction,order)
      }
      if(this.panelControlState){
        this.updateHotZone()
      }
      this.panelControlState=undefined
      this.currentMousedownUUID=undefined
      this.currentDragPanel=undefined
      this.currentHotZone=undefined
      // this.currentHoverLine=undefined
      splitArea.visible=false
      floatShape.visible=false
      // splitLine.visible=false
      splitLine.style.lineDash=[]
      panelTreeMask.render()
      splitLine.position=new Vector2()
      floatShape.position=new Vector2()
      dragStartPos.set(0)
    })
  }
  updateCursor(){
    const {hoverState,domElement,currentHoverLine,}=this
    if(hoverState=='readyStretch'){
      if(currentHoverLine){
        const {userData:{panel}}=currentHoverLine
        if(panel){
          const {parent}=panel as Panel
          if(parent){
            domElement.style.cursor=parent.direction=='column'?'ns-resize':'ew-resize'
          }
        }else{
          console.warn('panel 丢失')
        }
      }
    }else if(hoverState=='readyDrag'){
      domElement.style.cursor='move'
    }else{
      domElement.style.cursor='default'
    }
    
    // domElement.style.cursor='default'
  }
  updateHotZone(){
    const {domElement,panelTree,hotZones,panelTreeMask,hotLines}=this
    const treeBound=domElement.getBoundingClientRect();
    hotLines.clear()
    hotZones.clear()
    panelTree.traverse(panel=>{
      if(panel instanceof PanelWrapper){
        const {children,direction}=panel
        if(children.length!=2){return}
        const {minX,minY,maxX,maxY}=getPanelBoundingBox(children[0])
        const linePoints=direction=='column'?[minX,maxY,maxX,maxY]:[maxX,minY,maxX,maxY]
        const lineObj=new Graph2D(
          new PolyGeometry(linePoints),
          new StandStyle({strokeStyle:'rgba(255,0,0,0)',lineWidth:12})
        )
        const childPanel=children[0];
        const {domElement:{clientWidth:pw,clientHeight:ph}}=panel
        const {domElement:{offsetWidth:cw,offsetHeight:ch}}=childPanel
        let parentSize,childSize;
        if(direction=='column'){
          parentSize=ph
          childSize=ch
        }else{
          parentSize=pw
          childSize=cw
        }
        const userData:{
          panel:Panel,
          parentSize:number
          childSize:number
        }={
          parentSize,
          childSize,
          panel:childPanel
        }
        lineObj.userData=userData
        hotLines.add(lineObj)
      }else{
        const {minX,minY,maxX,maxY,width,height}=getPanelBoundingBox(panel)
        const centerX=minX+width/2
        const centerY=minY+height/2
        const panelContPoints:[number,number][]=[
          [minX,minY],
          [maxX,minY],
          [maxX,maxY],
          [minX,maxY],
        ]
        hotZoneTypes.forEach((type,ind1)=>{
          const ind2=(ind1+1)%4
          const p1=panelContPoints[ind1]
          const p2=panelContPoints[ind2]
          const rectObj=new Graph2D(
            new PolyGeometry([...p1,...p2,centerX,centerY])
          )
          let p3p4=type.direction=='column'?[p2[0],centerY,p1[0],centerY]:[centerX,p2[1],centerX,p1[1]]
          const userData:{
            panel:Panel
            splitRectPoints:number[]
            direction: DirectionType
            order: OrderType
          }={
            panel,
            splitRectPoints:[...p1,...p2,...p3p4],
            ...type,
          }
          rectObj.userData=userData
          hotZones.add(rectObj)
        })
      }
    })
    // panelTreeMask.render()
    function getPanelBoundingBox(panel:Panel){
      const panelBound=panel.domElement.getBoundingClientRect()
      const {width,height}=panelBound
      const minX=panelBound.x-treeBound.x
      const minY=panelBound.y-treeBound.y
      const maxX=minX+width
      const maxY=minY+height
      return {minX,minY,maxX,maxY,width,height}
    }
  }
  pushPanel(type:PanelType='3D',direction:DirectionType='row'){
    const {panelDomCreator,panelTree}=this
    const panel=new Panel({
      domElement:panelDomCreator.create(type)
    })
    const lastPanel=panelTree.getLast()
    lastPanel.addPanel(panel,direction)
    this.updateHotZone()
  }
  setPanelTreeOption(option:PanelWrapperOptionType|PanelOptionType){
    const {domElement,panelTree,panelTree:{domElement:oldPanelTreeDomElement}}=this
    panelTree.setOption(option)
    const {panelTree:{domElement:newPanelTreeDomElement}}=this
    if(newPanelTreeDomElement!=oldPanelTreeDomElement){
      domElement.replaceChild(panelTree.domElement,oldPanelTreeDomElement)
    }
    this.updateHotZone()
    this.observerPanelContResize()
  }
  appendDomElementTo(cont:HTMLElement){
    const {domElement,panelTreeMask}=this
    cont.appendChild(domElement)
    panelTreeMask.setSize(cont.clientWidth,cont.clientHeight)
    this.updateHotZone()
    panelTreeMask.render()
  }
  updateFloatPanelGeometry(panel:Panel,mousePos:Vector2=this.dragStart,scale=0.5){
    const {domElement,floatShape}=this
    const treeBound=domElement.getBoundingClientRect();
    const panelBound=panel.domElement.getBoundingClientRect()
    const offset=new Vector2(
      panelBound.x-treeBound.x,
      panelBound.y-treeBound.y
    ).lerp(mousePos,scale)
    floatShape.geometry=new RectGeometry(
      offset.x,
      offset.y,
      panelBound.width*scale,
      panelBound.height*scale
    )
  }
  getDragDist(){
    const {dragStartPos,dragEndPos}=this
    return dragEndPos.clone().sub(dragStartPos)
  }
  moveFloatPanel(){
    const {floatShape}=this
    floatShape.position.copy(this.getDragDist())
  }
  observerPanelContResize(){
    const {domElement,panelContResizeObserver}=this
    const panelContents=domElement.getElementsByClassName('lv-robot-panel-content')
    Array.from(panelContents).forEach(ele=>{
      panelContResizeObserver.observe(ele);
    })
  }
  stretchPanel(panel:Panel,parentSize:number,childSize:number){
    const {parent}=panel
    if(!parent){
      console.warn('根元素不可拉伸！')
      return
    }
    const {splitLine}=this
    const dragDist=this.getDragDist()
    let xy:'x'|'y',wh:'width'|'height';
    const {domElement:{clientWidth:pw,clientHeight:ph}}=parent
    const {domElement:{offsetWidth:cw,offsetHeight:ch}}=panel
    
    if(parent.direction=='row'){
      // childSize=cw
      // parentSize=pw
      wh='width'
      xy='x'
    }else{
      // childSize=ch
      // parentSize=ph
      wh='height'
      xy='y'
    }
    const minSize=30
    const maxSize=parentSize-minSize
    const size=childSize+dragDist[xy]
    if(size>minSize&&size<maxSize){
      const percentSize=100*size/parentSize;
      panel.size=percentSize
      panel.domElement.style[wh]=percentSize+'%'
      splitLine.position[xy]=dragDist[xy]
      const brother=panel.getBrother()
      if(brother){
        brother.size=100-percentSize
        brother.domElement.style[wh]=brother.size+'%'
      }
    }else{
      // this.panelControlState=undefined
      // this.splitLine.visible=false
      // splitLine.style.lineDash=[]
      // splitLine.position=new Vector2()
      // this.currentHoverLine=undefined
      // this.hoverState=undefined
      // this.updateHotZone()
    }
  }
}


export {PanelWrapper,Panel,PanelDomCreator,PanelController}