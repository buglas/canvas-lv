import { Camera } from './Camera'
import { Group } from '../objects/Group'
import { Vector2 } from '../math/Vector2'
import { BasicScene, BasicSceneType } from './BasicScene'

type SceneType = BasicSceneType&{
	camera?: Camera
	enableCamera?: boolean
	enableClip?: boolean
}

class Scene extends BasicScene {
	// 相机
	camera = new Camera()
	// 是否应该裁剪坐标系
	enableClip=true
	// 类型
	readonly isScene = true

	constructor(attr: SceneType = {}) {
		super(attr)
	}

	/*  渲染 */
	render() {
		const {
			ctx,
			camera,
			children,
			autoClear,
			enableClip,
			enableCamera,
			enableDevicePixel,
			size:{width,height}
		} = this
		ctx.save()
		// 自适应分辨率
		const {devicePixelRatio:s}=window
		enableDevicePixel&&ctx.scale(s,s)
		// 清理画布
		autoClear && ctx.clearRect(0, 0, width, height)
		// 裁剪坐标系：将canvas坐标系的原点移动到canvas画布中心
		enableClip&& ctx.translate(width / 2, height / 2)
		// 渲染子对象
		for (let obj of children) {
			ctx.save()
			// 视图投影矩阵
			enableCamera&&obj.enableCamera && camera.transformInvert(ctx)
			// 绘图
			obj.draw(ctx)
			ctx.restore()
		}
		ctx.restore()
	}

	/* canvas坐标转裁剪坐标 */
	canvasToClip({ x, y }: Vector2) {
		const {
			canvas: { width, height },
		} = this
		return new Vector2(x - width / 2, y - height / 2)
	}

	/* page坐标转裁剪坐标 */
	pageToClip(pageX: number, pageY: number) {
		return this.canvasToClip(this.pageToCanvas(pageX, pageY))
	}

  /* clip坐标转世界坐标 */
  clipToWorld(clip: Vector2){
    const {camera:{position,zoom}}=this
    return new Vector2().addVectors(clip,position).multiplyScalar(zoom)
  }

  /* page坐标转世界坐标 */
  pageToWorld(pageX: number, pageY: number) {
		return this.clipToWorld(this.pageToClip(pageX,pageY))
	}
}
export { Scene }
