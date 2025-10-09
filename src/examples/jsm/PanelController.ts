import { ref } from 'vue'
import { BasicScene } from '../../lmm/core/BasicScene'
import { Object2D } from '../../lmm/core/Object2D'
import { Geometry } from '../../lmm/geometry/Geometry'
import { PolyGeometry } from '../../lmm/geometry/PolyGeometry'
import { RectGeometry } from '../../lmm/geometry/RectGeometry'
import { generateUUID } from '../../lmm/math/MathUtils'
import { Vector2 } from '../../lmm/math/Vector2'
import { Graph2D } from '../../lmm/objects/Graph2D'
import { Group } from '../../lmm/objects/Group'
import { StandStyle } from '../../lmm/style/StandStyle'
import { DomCreator } from './DomCreator'

type DirectionType = 'row' | 'column'
type OrderType = 'unshift' | 'push'
type PanelOptionType = {
	type?: PanelType
	domElement?: HTMLElement
	// 百分比
	size?: number
	parentDirection?: DirectionType
}
export type PanelType = 'Image' | '3D'
class Panel {
	uuid: string = generateUUID()
	type: PanelType = 'Image'
	class = 'lv-robot-panel'
	size: number = 100
	parent?: PanelWrapper
  userData:{[k:string]:any}={}
	constructor(option: PanelOptionType = {}) {
		this.init(option)
	}
	get width() {
		const { parent, size } = this
		if (parent) {
			return parent.direction == 'column' ? '100%' : `${size}%`
		} else {
			return '100%'
		}
	}
	get height() {
		const { parent, size } = this
		if (parent) {
			return parent.direction == 'column' ? `${size}%` : '100%'
		} else {
			return '100%'
		}
	}
  get domElement(){
    const domEle=document.getElementById(this.uuid)
    if(!domEle){
      console.warn('panel:无法根据uuid 获取dom')
      return document.createElement('div')
    }
    return domEle
  }
	getStyle() {
		const { width, height } = this
		return { width, height }
	}
	init(option: PanelOptionType = {}) {
		const {size=100,type} = option
		this.size = size
		type && (this.type = type)
	}
	addPanel(
		panel: Panel,
		direction: DirectionType = 'row',
		order: OrderType = 'push'
	) {
		const { parent, size } = this
		if (!parent) {
			console.warn('没有父级的Panel不可添加Panel。')
			return
		}
		if (parent.isFull()) {
			// 若父级已满，在当前panel 外包裹panelWrapper
			// 根据当前panel 在父级children中的位置，替换成panelWrapper
			const ind = this.getIndexOfParent()
			if (ind == undefined) {
				return
			}
			const panelWrapper = new PanelWrapper({
				size,
				parentDirection: this.parent?.direction,
			})
			// parent.domElement.replaceChild(panelWrapper.domElement, this.domElement)
			parent.children[ind] = panelWrapper
			panelWrapper.parent = parent
			panelWrapper.addPanel(this)
			panelWrapper.addPanel(panel, direction, order)
		} else {
			// 若父级未满，父级添加
			parent.addPanel(panel, direction, order)
		}
	}
	getIndexOfParent() {
		const { parent } = this
		if (!parent) {
			console.warn('this', this)
			console.warn('getIndexOfParent(): 父级不存在')
			return undefined
		}
		const ind = parent.children.indexOf(this)
		if (ind != 0 && ind != 1) {
			console.warn('Panel 在父级children中的索引位置非0非1:', this)
			return undefined
		}
		return ind
	}
	setSize(size: number = 100) {
		this.size = size
    const brother = this.getBrother()
    if (brother) {
      brother.size = 100 - size
    }
	}
	getParentWH(parentDirection?: DirectionType) {
		const { parent } = this
		let wh: 'width' | 'height' = 'width'
		if (parent) {
			wh = parent.getWH()
		} else if (parentDirection) {
			wh = parentDirection == 'row' ? 'width' : 'height'
		}
		return wh
	}

	getBrother(): Panel | undefined {
		const { parent } = this
		if (!parent || !parent.isFull()) {
			return undefined
		}
		for (let child of parent.children) {
			if (child != this) {
				return child
			}
		}
		return undefined
	}
	traverse(fn: (panel: Panel) => void | boolean) {
		if (fn(this)) {
			return
		}
		if (this instanceof PanelWrapper) {
			for (let child of this.children) {
				child.traverse(fn)
			}
		}
	}
  traverseParent(fn: (panel: Panel) => void){
    const {parent}=this
    fn(this)
    parent&&parent.traverseParent(fn)
  }
	remove() {
		const {parent } = this
		const ind = this.getIndexOfParent()
		if (!parent || ind == undefined) {
			return
		}
		const { children } = parent
		children.splice(ind, 1)
		if (children.length) {
			children[0].setSize(100)
		} else {
			parent.remove()
		}
	}
}

type PanelWrapperOptionType = PanelOptionType & {
	children: (PanelOptionType | PanelWrapperOptionType)[]
	direction?: DirectionType
}

class PanelWrapper extends Panel {
	direction: DirectionType = 'row'
	children: (PanelWrapper | Panel)[] = []
	class = 'lv-robot-panel-wrapper'
	constructor(option: any = {}) {
		super()
		this.init(option)
	}
	getStyle() {
		const { width, height, direction: flexDirection } = this
		return { width, height, flexDirection }
	}
	init(option: any = {}) {
		const { direction = 'row' } = option
		super.init(option)
		// this.domElement.style.display = 'flex'
		this.setDirection(direction)
	}
	setOption(option: PanelWrapperOptionType | PanelOptionType) {
		this.clear()
		this.init(option)
		traverse1(option)
		traverse2(option, this)
		function traverse1(opt: PanelWrapperOptionType | PanelOptionType) {
			if ('children' in opt) {
				const { children: optChildren } = opt
				const len = optChildren.length
				if (len == 2) {
					const b0 = optChildren[0].size == undefined
					const b1 = optChildren[1].size == undefined
					if (b0 && b1) {
						optChildren[0].size = 50
						optChildren[1].size = 50
					} else if (!b0) {
						optChildren[1].size = 100 - (optChildren[0].size || 50)
					} else if (!b1) {
						optChildren[0].size = 100 - (optChildren[1].size || 50)
					}
				}
				for (let i = 0; i < len; i++) {
					const { direction = 'row' } = opt
					optChildren[i].parentDirection = direction
					traverse1(optChildren[i])
				}
			}
		}
		function traverse2(
			opt: PanelWrapperOptionType | PanelOptionType,
			obj: PanelWrapper | Panel
		) {
			let obj2
			if ('children' in opt) {
				const { children: optChildren } = opt
				const len = optChildren.length
				for (let i = 0; i < len; i++) {
					if ('children' in optChildren[i]) {
						obj2 = new PanelWrapper(optChildren[i])
					} else {
						obj2 = new Panel(optChildren[i])
					}
					;(obj as PanelWrapper).appendChild(obj2)
					traverse2(optChildren[i], obj2)
				}
			}
		}
	}
	getChildByUUID(uuid: string) {
		let child: Panel | undefined
		this.traverse((ele) => {
			if (ele.uuid == uuid) {
				child = ele
				return true
			}
		})
		return child
	}

	isFull() {
		return this.children.length >= 2
	}
	isEmpty() {
		return this.children.length == 0
	}
	setDirection(dir: DirectionType = 'row') {
		this.direction = dir
	}
	addPanel(
		panel: Panel,
		dir: DirectionType = 'row',
		order: OrderType = 'push'
	) {
		const { children} = this
		if (this.isFull()) {
			return
		}
		this.setDirection(dir)
		if (this.isEmpty() || order == 'push') {
			children.push(panel)
			// wrapperDom.appendChild(panelDom)
		} else if (children.length == 1 && order == 'unshift') {
			children.unshift(panel)
			// wrapperDom.insertBefore(panelDom,wrapperDom.firstChild);
		}
		panel.parent = this
		this.updateSize()
	}
	appendChild(...objs: (PanelWrapper | Panel)[]) {
		const { children } = this
		objs.forEach((obj) => {
			children.push(obj)
			obj.parent = this
		})
	}
	// firstPanelSize 百分比*100
	updateSize(firstPanelSize?: number) {
		const { children } = this
		if (firstPanelSize == undefined) {
			if (children.length == 1) {
				children[0].setSize(100)
			} else if (children.length == 2) {
				children[0].setSize(50)
				children[1].setSize(50)
			}
		} else {
			if (children.length == 1) {
				children[0].setSize(100)
			} else if (children.length == 2) {
				children[0].setSize(firstPanelSize)
				children[1].setSize(100 - firstPanelSize)
			}
		}
	}
	// size 像素单位,转百分比
	getPercentage(size: number) {
		return (size / this.getClientSize()) * 100
	}
	getWH() {
		return this.direction == 'row' ? 'width' : 'height'
	}
	getClientSize() {
		const { direction, domElement } = this
		return direction == 'row' ? domElement.clientWidth : domElement.clientHeight
	}
	clear() {
		this.children = []
		// this.domElement.innerHTML = ''
	}
	getLast() {
		return getLastEle(this)
		function getLastEle(obj: Panel) {
			if (obj instanceof PanelWrapper) {
				const {
					children,
					children: { length },
				} = obj
				if (length) {
					return getLastEle(children[length - 1])
				}
			}
			return obj
		}
	}
	traversePanel(fn: (panel: Panel) => void) {
		for (let child of this.children) {
			if (child instanceof PanelWrapper) {
				child.traversePanel(fn)
			} else {
				fn(child)
			}
		}
	}
  getPanelByUUID(uuid:string){
    let panel:Panel|undefined
    this.traversePanel((ele)=>{
      if(uuid==ele.uuid){
        panel=ele
      }
    })
    return panel
  }
}

class PanelDomCreator extends DomCreator {
	classPrefix = 'lv-robot-'
	create(type: PanelType = 'Image'): HTMLElement {
		this.option = {
			children: [
				{
					className: 'panel-title',
					innerText: type,
					events: [
						{
							type: 'mousedown',
							listener: (event: any) => {
								const { button, currentTarget } = event
								if (button == 0) {
									const parentNode = currentTarget.parentNode as HTMLElement
									if (!parentNode) {
										console.warn('title 的父级不存在')
										return
									}
									const uuid = parentNode.getAttribute('data-uuid')
									if (!uuid) {
										console.warn('title 的父级的uuid不存在')
										return
									}
									this.onTitleMouseDown(event, uuid)
								}
							},
						},
						{
							type: 'mousemove',
							listener: (event: any) => {
								this.onTitleMouseMove(event)
							},
						},
						{
							type: 'mouseleave',
							listener: (event: any) => {
								this.onTitleMouseLeave(event)
							},
						},
					],
				},
				{
					className: 'panel-content',
				},
			],
		}
		return super.create()
	}

	onTitleMouseDown(event: MouseEvent, uuid: string) {}
	onTitleMouseMove(event: MouseEvent) {}
	onTitleMouseLeave(event: MouseEvent) {}
}

type HoverStateType = 'readyDrag' | 'readyStretch' | undefined
type PanelControlStateType =
	| 'startDrag'
	| 'dragging'
	| 'startStretch'
	| 'stretching'
	| undefined
const hotZoneTypes: {
	direction: DirectionType
	order: OrderType
}[] = [
	{
		direction: 'column',
		order: 'unshift',
	},
	{
		direction: 'row',
		order: 'push',
	},
	{
		direction: 'column',
		order: 'push',
	},
	{
		direction: 'row',
		order: 'unshift',
	},
]
const splitLineHoverColor=''
const splitLineDefaultColor=''
class PanelController {
	domElement = document.createElement('div')
	panelDomCreator = new PanelDomCreator()
	panelTreeRef = ref(new PanelWrapper())
	panelTreeMask = new BasicScene()
	hotZones = new Group()
	hotLines = new Group()
	currentMousedownUUID: string | undefined
	currentHotZone: Object2D | undefined
	panelControlState: PanelControlStateType
	currentHoverLine: Graph2D<PolyGeometry, StandStyle> | undefined
	currentDragPanel: Panel | undefined
	splitArea: Graph2D<PolyGeometry, StandStyle> = new Graph2D(
		new PolyGeometry().close(),
		new StandStyle({
			fillStyle: 'rgba(0,0,0,0.1)',
			strokeStyle: 'rgba(0,0,0,0.8)',
			lineWidth: 1,
			lineDash: [5, 3],
		})
	)
	floatShape: Graph2D<RectGeometry, StandStyle> = new Graph2D(
		new RectGeometry(),
		new StandStyle({
			fillStyle: 'rgba(255,255,255,0.7)',
			shadowColor: 'rgba(0,0,0,0.3)',
			shadowBlur: 12,
			shadowOffsetY: 2,
		})
	)
	splitLine: Graph2D<PolyGeometry, StandStyle> = new Graph2D(
		new PolyGeometry(),
		new StandStyle({
			strokeStyle: 'rgba(4, 0, 255, 0.8)',
			lineWidth: 2,
			lineDash: [],
		})
	)
	dragStartPos = new Vector2()
	dragEndPos = new Vector2()
	panelContResizeObserver: ResizeObserver
	hoverState: HoverStateType
  fullPanel:Panel|undefined
	constructor() {
		const {
			panelTreeMask,
			panelTreeMask: { canvas },
			hotZones,
			floatShape,
			splitArea,
			hotLines,
			splitLine,
			dragStartPos,
		} = this
		canvas.style.position = 'absolute'
		canvas.style.top = '0'
		canvas.style.left = '0'
		canvas.style.pointerEvents = 'none'
		// canvas.style.backgroundColor='rgba(0,0,255,0.1)'

		hotZones.name = 'hotZones'
		panelTreeMask.add(hotZones)

		hotZones.name = 'hotLines'
		panelTreeMask.add(hotLines)

		splitArea.name = 'splitArea'
		splitArea.visible = false
		panelTreeMask.add(splitArea)

		floatShape.name = 'floatShape'
		floatShape.visible = false
		panelTreeMask.add(floatShape)

		splitLine.name = 'splitLine'
		splitLine.visible = false
		panelTreeMask.add(splitLine)

		this.panelContResizeObserver = new ResizeObserver((entries) => {
			entries.forEach((entry) => {
				// console.log(`元素: `,entry.target);
				// console.log(`尺寸变化: `, entry.contentRect);
			})
		})
		window.addEventListener('mouseup', () => {
			if (this.currentHotZone) {
				const {
					userData: { panel, direction, order },
				} = this.currentHotZone as any
				panel.addPanel(this.currentDragPanel, direction, order)
			}
			this.panelControlState = undefined
			this.currentMousedownUUID = undefined
			this.currentDragPanel = undefined
			this.currentHotZone = undefined
			splitArea.visible = false
			floatShape.visible = false
			splitLine.style.lineDash = []
			panelTreeMask.render()
			splitLine.position = new Vector2()
			floatShape.position = new Vector2()
			dragStartPos.set(0)
		})
	}
  setDomElement(domElement:HTMLDivElement){
    this.domElement=domElement
    domElement.addEventListener('mousedown',(event: MouseEvent)=>{
      this.totalMousedown(event)
    })
    domElement.addEventListener('mousemove',(event: MouseEvent)=>{
      this.totalMousemove(event)
    })
    this.appendMask()
    this.updateHotZone()
  }
	titleMouseDown(event: MouseEvent) {
		const {
			panelTreeRef:{value:panelTree},
			panelTreeMask,
			dragStartPos,
		} = this
		const { button, currentTarget, pageX, pageY } = event
		if (!currentTarget || !('parentNode' in currentTarget) || button != 0) {
			return
		}
		const parentNode = currentTarget.parentNode as HTMLElement
		if (!parentNode) {
			console.warn('title 的父级不存在')
			return
		}
		const uuid = parentNode.getAttribute('id')
		if (!uuid) {
			console.warn('title 的父级的uuid不存在')
			return
		}
		dragStartPos.copy(panelTreeMask.pageToCanvas(pageX, pageY))
		this.currentMousedownUUID = uuid
		this.panelControlState = 'startDrag'
		const panel = panelTree.getChildByUUID(uuid)
		panel && this.updateFloatPanelGeometry(panel)
	}
	titleMousemove(event: MouseEvent) {
    if(!this.hoverState){
      this.hoverState='readyDrag'
    }
	}
	titleMouseleave(event: MouseEvent) {
		if (this.hoverState == 'readyDrag') {
			this.hoverState = undefined
		}
	}

	totalMousedown(event: MouseEvent) {
		const {
			panelTreeMask,
			splitLine,
			dragStartPos,
		} = this
		const { button, pageX, pageY } = event
		if (button == 0) {
			dragStartPos.copy(panelTreeMask.pageToCanvas(pageX, pageY))
			if (this.currentHoverLine) {
				this.panelControlState = 'startStretch'
        splitLine.style.strokeStyle='#000'
				splitLine.style.lineDash = [5, 3]
			}
		}
		panelTreeMask.render()
	}
	totalMousemove(event: MouseEvent) {
		const {
			panelTreeRef:{value:panelTree},
			panelTreeMask,
			hotZones,
			floatShape,
			splitArea,
			hotLines,
			splitLine,
			dragEndPos,
		} = this
		const { buttons, currentTarget, pageX, pageY } = event
		const worldPosition = panelTreeMask.pageToCanvas(pageX, pageY)
		if (buttons == 1) {
			dragEndPos.copy(worldPosition)
			if (this.panelControlState == 'startDrag') {
				this.panelControlState = 'dragging'
				if (this.currentMousedownUUID == undefined) {
					console.warn('currentMousedownUUID 丢失')
				} else {
          // console.log('this.currentMousedownUUID',this.currentMousedownUUID);
					const target = panelTree.getChildByUUID(this.currentMousedownUUID)
          // console.log('target',target);
					if (target) {
						this.currentDragPanel = target
						splitArea.visible = true
						floatShape.visible = true
						target.remove()
						// this.updateHotZone()
					} else {
						console.warn('没有找到拖拽目标')
					}
				}
			} else if (this.panelControlState == 'startStretch') {
				this.updateHotZone()
				this.panelControlState = 'stretching'
			}
			if (this.panelControlState == 'dragging') {
				let isPointInHotZone = false
				for (let hotZone of hotZones.children) {
					if (!(hotZone instanceof Graph2D)) {
						continue
					}
					if (hotZone.isPointIn(worldPosition)) {
						if (this.currentHotZone != hotZone) {
							this.currentHotZone = hotZone
							const {
								userData: { splitRectPoints },
							} = hotZone
							if (splitRectPoints && splitRectPoints instanceof Array) {
								splitArea.geometry.position = splitRectPoints
							}
						}
						isPointInHotZone = true
						break
					}
				}
				!isPointInHotZone && (this.currentHotZone = undefined)
			} else if (this.panelControlState == 'stretching') {
				// 拉伸panel，位移splitLine
				const { currentHoverLine } = this
				if (!currentHoverLine) {
					console.warn('currentHoverLine 丢失')
				} else {
					const {
						userData: { panel, parentSize, childSize },
					} = currentHoverLine
					this.stretchPanel(panel, parentSize, childSize)
				}
			}
			this.moveFloatPanel()
		} else {
			let isHover = false
			for (let hotLine of hotLines.children) {
				if (!(hotLine instanceof Graph2D)) {
					continue
				}
				if (hotLine.isPointInStroke(worldPosition)) {
					if (this.currentHoverLine != hotLine) {
						this.currentHoverLine = hotLine as Graph2D<PolyGeometry, StandStyle>
						splitLine.visible = true
            splitLine.style.strokeStyle='rgba(4, 0, 255, 0.8)'
						splitLine.geometry = hotLine.geometry
					}
					isHover = true
					this.hoverState = 'readyStretch'
					break
				}
			}
			if (!isHover) {
				this.currentHoverLine = undefined
				splitLine.visible = false
				if (this.hoverState == 'readyStretch') {
					this.hoverState = undefined
				}
			}
		}
		this.updateCursor(currentTarget as HTMLElement)
		panelTreeMask.render()
	}

	updateCursor(domElement: HTMLElement) {
		if (!domElement) {
			return
		}
		const { hoverState, currentHoverLine } = this
    // console.log('hoverState',hoverState);
		if (hoverState == 'readyStretch') {
			if (currentHoverLine) {
				const {
					userData: { panel },
				} = currentHoverLine
				if (panel) {
					const { parent } = panel as Panel
					if (parent) {
						domElement.style.cursor =
							parent.direction == 'column' ? 'ns-resize' : 'ew-resize'
					}
				} else {
					console.warn('panel 丢失')
				}
			}
		} else if (hoverState == 'readyDrag') {
			domElement.style.cursor = 'move'
		} else {
			domElement.style.cursor = 'default'
		}

		// domElement.style.cursor='default'
	}
	updateHotZone() {
		const { domElement, panelTreeRef:{value:panelTree}, hotZones, panelTreeMask, hotLines } = this
		const treeBound = domElement.getBoundingClientRect()
		hotLines.clear()
		hotZones.clear()
		panelTree.traverse((panel) => {
			if (panel instanceof PanelWrapper) {
				const { children, direction } = panel
				if (children.length != 2) {
					return
				}
				const { minX, minY, maxX, maxY } = getPanelBoundingBox(children[0])
				const linePoints =
					direction == 'column'
						? [minX, maxY, maxX, maxY]
						: [maxX, minY, maxX, maxY]
				const lineObj = new Graph2D(
					new PolyGeometry(linePoints),
					new StandStyle({ strokeStyle: 'rgba(255,0,0,0)', lineWidth: 12 })
				)
				const childPanel = children[0]
				const {
					domElement: { clientWidth: pw, clientHeight: ph },
				} = panel
				const {
					domElement: { offsetWidth: cw, offsetHeight: ch },
				} = childPanel
				let parentSize, childSize
				if (direction == 'column') {
					parentSize = ph
					childSize = ch
				} else {
					parentSize = pw
					childSize = cw
				}
				const userData: {
					panel: Panel
					parentSize: number
					childSize: number
				} = {
					parentSize,
					childSize,
					panel: childPanel,
				}
				lineObj.userData = userData
				hotLines.add(lineObj)
			} else {
				const { minX, minY, maxX, maxY, width, height } =
					getPanelBoundingBox(panel)
				const centerX = minX + width / 2
				const centerY = minY + height / 2
				const panelContPoints: [number, number][] = [
					[minX, minY],
					[maxX, minY],
					[maxX, maxY],
					[minX, maxY],
				]
				hotZoneTypes.forEach((type, ind1) => {
					const ind2 = (ind1 + 1) % 4
					const p1 = panelContPoints[ind1]
					const p2 = panelContPoints[ind2]
					const rectObj = new Graph2D(
						new PolyGeometry([...p1, ...p2, centerX, centerY]),
            // new StandStyle({strokeStyle:'#000'})
					)
					let p3p4 =
						type.direction == 'column'
							? [p2[0], centerY, p1[0], centerY]
							: [centerX, p2[1], centerX, p1[1]]
					const userData: {
						panel: Panel
						splitRectPoints: number[]
						direction: DirectionType
						order: OrderType
					} = {
						panel,
						splitRectPoints: [...p1, ...p2, ...p3p4],
						...type,
					}
					rectObj.userData = userData
					hotZones.add(rectObj)
				})
			}
		})
		// panelTreeMask.render()
		function getPanelBoundingBox(panel: Panel) {
			const panelBound = panel.domElement.getBoundingClientRect()
			const { width, height } = panelBound
			const minX = panelBound.x - treeBound.x
			const minY = panelBound.y - treeBound.y
			const maxX = minX + width
			const maxY = minY + height
			return { minX, minY, maxX, maxY, width, height }
		}
	}
	/* pushPanel(type: PanelType = '3D', direction: DirectionType = 'row') {
		const { panelDomCreator, panelTreeRef:{value:panelTree}, } = this
		const panel = new Panel({
			domElement: panelDomCreator.create(type),
		})
		const lastPanel = panelTree.getLast()
		lastPanel.addPanel(panel, direction)
		this.updateHotZone()
	} */
  split(uuid:string,type:PanelType,direction:DirectionType){
    const { panelTreeRef:{value:panelTree}} = this
    const panel=panelTree.getPanelByUUID(uuid)
    if(!panel){
      console.warn('split: 没有找到panel ')
      return
    }
    const newPanel=new Panel({type})
    panel.addPanel(newPanel,direction,'push')
  }
  fullToggle(uuid:string){
    const {panelTreeRef:{value:panelTree}}=this
    let {fullPanel}=this
    let isFull=false
    if(fullPanel){
      fullPanel.traverseParent((panel)=>{
        if(!panel.parent){return}
        const {userData:{oldSize}}=panel
        if(oldSize==undefined){
          console.warn('fullToggle: oldSize 未定义')
        }else{
          panel.setSize(oldSize)
        }
        panel.userData.oldSize=undefined
      })
      this.fullPanel=undefined
      if(fullPanel.uuid!=uuid){
        this.fullToggle(uuid)
      }
    }else{
      fullPanel=panelTree.getPanelByUUID(uuid)
      if(!fullPanel){
        console.warn('fullToggle: 无法根据uuid 找到Panel')
        return
      }
      this.fullPanel=fullPanel
      fullPanel.traverseParent((panel)=>{
        if(!panel.parent){return}
        console.log('panel.parent',panel.parent);
        panel.userData.oldSize=panel.size
        panel.setSize(100)
      })
      isFull=true
    }
    return isFull
  }
  deletePanel(uuid:string){
    const {panelTreeRef:{value:panelTree}}=this
    const panel=panelTree.getPanelByUUID(uuid)
    if(!panel){
      console.warn('deletePanel: 无法根据uuid 找到Panel')
      return
    }
    panel.remove()
  }
	setPanelTreeOption(option: PanelWrapperOptionType | PanelOptionType) {
		const {
			panelTreeRef:{value:panelTree},
		} = this
		panelTree.setOption(option)
		// const {panelTree:{domElement:newPanelTreeDomElement}}=this
		// if(newPanelTreeDomElement!=oldPanelTreeDomElement){
		//   domElement.replaceChild(panelTree.domElement,oldPanelTreeDomElement)
		// }
		// this.updateHotZone()
		// this.observerPanelContResize()
	}
	appendMask() {
		const {domElement, panelTreeMask } = this
		domElement.appendChild(panelTreeMask.canvas)
		panelTreeMask.setSize(domElement.clientWidth, domElement.clientHeight)
		// this.updateHotZone()
		// panelTreeMask.render()
	}
	updateFloatPanelGeometry(
		panel: Panel,
		mousePos: Vector2 = this.dragStartPos,
		scale = 0.5
	) {
		const { domElement, floatShape } = this
		const treeBound = domElement.getBoundingClientRect()
		const panelBound = panel.domElement.getBoundingClientRect()
		const offset = new Vector2(
			panelBound.x - treeBound.x,
			panelBound.y - treeBound.y
		).lerp(mousePos, scale)
		floatShape.geometry = new RectGeometry(
			offset.x,
			offset.y,
			panelBound.width * scale,
			panelBound.height * scale
		)
	}
	getDragDist() {
		const { dragStartPos, dragEndPos } = this
		return dragEndPos.clone().sub(dragStartPos)
	}
	moveFloatPanel() {
		const { floatShape } = this
		floatShape.position.copy(this.getDragDist())
	}
	observerPanelContResize() {
		const { domElement, panelContResizeObserver } = this
		const panelContents = domElement.getElementsByClassName(
			'lv-robot-panel-content'
		)
		Array.from(panelContents).forEach((ele) => {
			panelContResizeObserver.observe(ele)
		})
	}
	stretchPanel(panel: Panel, parentSize: number, childSize: number) {
		const { parent } = panel
		if (!parent) {
			console.warn('根元素不可拉伸！')
			return
		}
		const { splitLine } = this
		const dragDist = this.getDragDist()
		let xy: 'x' | 'y', wh: 'width' | 'height'
		const {
			domElement: { clientWidth: pw, clientHeight: ph },
		} = parent
		const {
			domElement: { offsetWidth: cw, offsetHeight: ch },
		} = panel

		if (parent.direction == 'row') {
			// childSize=cw
			// parentSize=pw
			wh = 'width'
			xy = 'x'
		} else {
			// childSize=ch
			// parentSize=ph
			wh = 'height'
			xy = 'y'
		}
		const minSize = 30
		const maxSize = parentSize - minSize
		const size = childSize + dragDist[xy]
		if (size > minSize && size < maxSize) {
			const percentSize = (100 * size) / parentSize
			panel.setSize(percentSize)
			splitLine.position[xy] = dragDist[xy]
		}
	}
	destroy() {
    const {domElement, panelTreeMask } = this
		panelTreeMask.canvas.remove()
	}
}

export { PanelWrapper, Panel, PanelDomCreator, PanelController }
