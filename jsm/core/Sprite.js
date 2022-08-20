import {Matrix4} from "../math/Matrix4.js"
import { Vector3 } from "../math/Vector3.js"
import { Object3D } from "./Object3D.js"

/*默认属性*/
const defAttr = () => ({
	//样式相关
	fillStyle: null,
	strokeStyle: null,
	lineWidth: 1,
	lineDash: null,
	lineDashOffset: 0,
	lineCap: 'butt',
	lineJoin: 'miter',
	miterLimit: 10,

  // 投影相关
	shadowColor: null,
	shadowBlur: 0,
	shadowOffsetX: 0,
	shadowOffsetY: 0,

	//合成相关
	composite: 'source-over',
})

/*Poly 多边形*/
class Sprite extends Object3D {
	constructor(attr = {}) {
    super()
		Object.assign(this, defAttr(), attr)
	}
	draw(ctx,cpvm) {
		if (!this.visible) {
			return
		}
		ctx.save()
    // 裁剪
    this.clip&&ctx.clip()
    // 绘图
		this.drawShape(ctx,cpvm)
		ctx.restore()
	}

	drawShape(ctx,cpvm) {

		/*透明度合成*/
		this.alphaComposite(ctx)

		/*全局合成*/
		this.globalComposite(ctx)

		/*建立图形*/
		this.crtShape(ctx,cpvm)

		/* 投影 */
		this.setShadow(ctx)

		/*描边*/
		this.drawStroke(ctx)

		/*填充*/
		this.drawFill(ctx)

	}


	/*透明的合成*/
	alphaComposite(ctx) {
		this.updateGlobalAlpha()
    ctx.globalAlpha=this.globalAlpha
	}

	/*全局合成*/
	globalComposite(ctx) {
		ctx.globalCompositeOperation = this.composite
	}

	/*绘制投影*/
	setShadow(ctx) {
		const { shadowColor, shadowBlur, shadowOffsetX, shadowOffsetY } =
			this
		if (shadowColor) {
			ctx.shadowColor = shadowColor
			ctx.shadowBlur = shadowBlur
			ctx.shadowOffsetX = shadowOffsetX
			ctx.shadowOffsetY = shadowOffsetY
		}
	}

	/*绘制描边*/
	drawStroke(ctx) {
		const {
			close,
			strokeStyle,
			lineWidth,
			lineCap,
			lineJoin,
			miterLimit,
			lineDash,
			lineDashOffset,
		} = this
		if (strokeStyle) {
			ctx.strokeStyle = strokeStyle
			ctx.lineWidth = lineWidth
			ctx.lineCap = lineCap
			ctx.lineJoin = lineJoin
			ctx.miterLimit = miterLimit
      if(lineDash){
        ctx.setLineDash(lineDash)
			  ctx.lineDashOffset = lineDashOffset
      }
			close && ctx.closePath()
			this.stroke(ctx)
		}
	}
  /* 描边方法-接口 */
  stroke(ctx){ctx.stroke()}

	/*绘制填充*/
	drawFill(ctx) {
		const { fillStyle } = this
		if (fillStyle) {
			ctx.fillStyle = fillStyle
			this.fill(ctx)
		}
	}
  /* 填充方法-接口 */
  fill(ctx){ctx.fill()}
	

	/*塑形-接口
	 *   ctx 上下文对象
	 *   cpvm 矩阵变换(视口矩阵*投影矩阵*视图矩阵*模型矩阵)
	 * */
	crtShape(ctx,cpvm) {}

  

}

export {Sprite}