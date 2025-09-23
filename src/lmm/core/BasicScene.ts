import { Group } from '../objects/Group'
import { Vector2 } from '../math/Vector2'

export type BasicSceneType = {
	canvas?: HTMLCanvasElement
	autoClear?: boolean
	enableDevicePixel?: boolean
}

class BasicScene extends Group {
	// canvas画布
	_canvas = document.createElement('canvas')
	// canvas 上下文对象
	ctx: CanvasRenderingContext2D = this._canvas.getContext(
		'2d'
	) as CanvasRenderingContext2D
	// 是否自动清理画布
	autoClear = true
	// 尺寸
	size=new Vector2()
	// 是否自适应设备分辨率
	enableDevicePixel=true
	// 类型
	readonly isBasicScene = true

	constructor(attr: BasicSceneType = {}) {
		super()
		this.setOption(attr)
	}
	get canvas() {
		return this._canvas
	}
	set canvas(value) {
		this._canvas = value
		this.ctx = value.getContext('2d') as CanvasRenderingContext2D
		this.setSize(value.width,value.height)
	}

	/* 设置属性 */
	setOption(attr: BasicSceneType) {
		for (let [key, val] of Object.entries(attr)) {
			(this as any)[key] = val
		}
	}

	/*  渲染 */
	render() {
		const {
			ctx,
			children,
			autoClear,
			enableDevicePixel,
			size:{width,height}
		} = this
		ctx.save()
		// 自适应分辨率
		const {devicePixelRatio:s}=window
		enableDevicePixel&&ctx.scale(s,s)
		// 清理画布
		autoClear && ctx.clearRect(0, 0, width, height)
		// 渲染子对象
		for (let obj of children) {
			ctx.save()
			// 绘图
			obj.draw(ctx)
			ctx.restore()
		}
		ctx.restore()
	}

	setSize(w:number,h:number){
		const {enableDevicePixel,size}=this
		size.set(w,h)
		enableDevicePixel&&this.applyDevicePixel()
	}

	// 设置尺寸
	applyDevicePixel(){
		const {canvas,ctx,size:{x:w,y:h}}=this
		const {devicePixelRatio:s}=window
		const ws=w*s
		const hs=h*s
		canvas.width=ws
		canvas.height=hs
		canvas.style.width=w+'px'
		canvas.style.height=h+'px'
	}

	/* page坐标转canvas坐标 */
	pageToCanvas(pageX: number, pageY: number) {
		const { canvas } = this
		const { left, top } = canvas.getBoundingClientRect()
		return new Vector2(pageX - left, pageY - top)
	}
  /* page坐标转世界坐标 */
  pageToWorld(pageX: number, pageY: number) {
		return this.pageToCanvas(pageX,pageY)
	}
}
export { BasicScene }
