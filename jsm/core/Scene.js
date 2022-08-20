import {Matrix4} from "../math/Matrix4.js";
import { Group } from "../objects/Group.js";
import { Object3D } from "./Object3D.js";

/*默认属性*/
const defAttr = () => ({
	isScene:true,
  autoClear:true,
  canvas:document.createElement('canvas'),
  canvasMatrix:new Matrix4(),
  ctx:null,
})

class Scene extends Group{
  constructor(attr={}){
    super()
    Object.assign(this, defAttr(), attr)
    this.ctx=this.canvas.getContext('2d')
    // 根据画布更新画布矩阵
    this.updateCanvasMatrix()
  }
  // 克隆(子对象暂不拷贝，因为子对象具备唯一性)
  clone(){
    const {isScene,autoClear,canvasMatrix,canvas:{width,height}}=this
    const canvas=document.createElement('canvas')
    canvas.width=width
    canvas.height=height
    return new Scene({
      isScene,
      autoClear,
      canvasMatrix:canvasMatrix.clone(),
      canvas
    })
  }
  // 根据画布更新画布矩阵
  updateCanvasMatrix(){
    const {width,height}=canvas
    const [halfW,halfH]=[width/2,height/2]
    const scaleMatrix=new Matrix4().set(
      halfW,0,0,0,
      0,-halfH,0,0,
      0,0,1,0,
      0,0,0,1,
    )
    const moveMatrix=new Matrix4().set(
      1,0,0,halfW,
      0,1,0,halfH,
      0,0,1,0,
      0,0,0,1,
    )
    this.canvasMatrix.copy(
      moveMatrix.multiply(scaleMatrix)
    )
  }

  // 获取ImageData
  getImageData(x=0,y=0,w=this.canvas.width,h=this.canvas.height){
    return this.ctx.getImageData(x,y,w,h)
  }

  // 清理画布
  clear(){
    const {ctx,canvas:{width,height}}=this
    ctx.clearRect(0,0,width,height)
  }

  // 渲染
  render(camera) {
    const {ctx,children,canvasMatrix,autoClear}=this
    autoClear&&this.clear()
		for ( let i = 0, l = children.length; i < l; i ++ ) {
      traverse( children[i],this.matrix )
		}
    function traverse( obj,parentMatrix ) {
      const {children}=obj
      // 更新模型的本地矩阵
      obj.matrixAutoUpdate&&obj.updateMatrix()
      // 模型的世界矩阵
      obj.matrixWorld.multiplyMatrices(parentMatrix,obj.matrix)
      // 渲染子级
      if(children){
        for ( let i = 0, l = children.length; i < l; i ++ ) {
          const child=children[ i ]
          traverse(child,obj.matrixWorld)
        }
      }else{
        const cpvm=canvasMatrix.clone()
            .multiply(camera.projectionMatrix)
            .multiply(camera.matrixWorld.clone().invert())
            .multiply(obj.matrixWorld)
        obj.draw(ctx,cpvm)
      }
    }
	}
}

export {Scene} 