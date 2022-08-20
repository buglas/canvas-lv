import { Vector3 } from "../math/Vector3.js"
import { Vector2 } from "../math/Vector2.js"
import { Sprite } from "../core/Sprite.js"


/*默认属性*/
const defAttr = () => ({
  origin:new Vector2(),
  canvasOrigin:new Vector2(),
	textBaseline:'alphabetic',
  textAlign:'start',
  text:'',
  maxWidth:undefined,
  fontStyle:'',
  fontVariant:'',
  fontWeight:'',
  fontSize:14,
  lineHeight:'',
  fontFamily:'arial'
})

/*文字-暂不可选*/
class Text2D extends Sprite {
	constructor(attr = {}) {
    super()
		Object.assign(this, defAttr(), attr)
	}

	/*塑形
	 *   ctx 上下文对象
	 *   cpvm 矩阵变换(视口矩阵*投影矩阵*视图矩阵*模型矩阵)
	 * */
	crtShape(ctx,cpvm) {
		const { textBaseline,textAlign,origin } = this
    this.setFont(ctx)
    ctx.textBaseline=textBaseline;
    ctx.textAlign=textAlign;
    let p=origin.isVector2?new Vector3(origin.x,origin.y,0):origin.clone();
    this.canvasOrigin=p.applyMatrix4(cpvm)
	}

  /* 描边方法*/
  stroke(ctx){
    const {text,canvasOrigin:{x,y},maxWidth}=this
    ctx.strokeText(text,x,y,maxWidth)
  }

  /* 填充方法 */
  fill(ctx){
    const {text,canvasOrigin:{x,y},maxWidth}=this
    ctx.fillText(text,x,y,maxWidth)
  }

	/* 设置font */
  setFont(ctx){
    const {
      fontStyle,fontVariant,fontWeight,fontSize,lineHeight,fontFamily,
    }=this;
    ctx.font=`${fontStyle} ${fontVariant} ${fontWeight} ${fontSize}px ${lineHeight} ${fontFamily}`;
  }

  /*获取文本宽度*/
  getWidth(){
    const {text}=this;
    const {ctx}=this.getScene()
    this.setFont(ctx)
    return ctx.measureText(text).width;
  }
}

export {Text2D}