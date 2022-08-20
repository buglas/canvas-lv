import {Matrix4} from "../math/Matrix4.js"
import { Vector3 } from "../math/Vector3.js"
import { Vector2 } from "../math/Vector2.js"
import { Object3D } from "../core/Object3D.js"
import { Sprite } from "../core/Sprite.js"

const pi2=Math.PI*2

/* 节点图形 */
const nodes={
  circle:(ctx,{x,y},s)=>{
    ctx.moveTo(x+s,y)
    ctx.arc(x,y,s,0,pi2)
  },
  rect:(ctx,{x,y},s)=>{
    // ctx.moveTo(x-s,y+s)
    // ctx.lineTo(x-s,y-s)
    // ctx.lineTo(x+s,y-s)
    // ctx.lineTo(x-s,y-s)
    const s2=s*2
    ctx.rect(x-s,y-s,s2,s2)
  },
}

/*默认属性*/
const defAttr = () => ({
  // 基点，Vector3|Vector2|Vector3[]|Vector2[]
  origin:new Vector2(),
  // canvas坐标系里的基点,不可写,Vector2|Vector2[]
  canvasOrigin:new Vector2(),
  // 基点元素矢量长度
  itemSize:2,
  // 半径,number|number[]
  r:6,
  // 节点类型
  nodeType:'circle'

})

/*文字*/
class Point extends Sprite {
	constructor(attr = {}) {
    super()
		Object.assign(this, defAttr(), attr)
	}

	/*塑形
	 *   ctx 上下文对象
	 *   cpvm 矩阵变换(视口矩阵*投影矩阵*视图矩阵*模型矩阵)
	 * */
	crtShape(ctx,cpvm) {
		const {origin,r,itemSize} = this
    const rb=typeof r==='number'
    const getPointByInd=`getPointByInd${itemSize}`
    ctx.beginPath()
    if(typeof origin.x=='number'){
      this.canvasOrigin=this.crtChild(ctx,cpvm,origin,rb?r:r[0])
    }else{
      const originlen=origin.length
      const canvasOrigin=[];
      if(rb){
        for(let i=0;i<originlen;i+=itemSize){
          canvasOrigin.push(
            ...this.crtChild(
              ctx,
              cpvm,
              this[getPointByInd](i),
              r
            )
          )
        }
      }else{
        const len=r.length
        for(let i=0;i<originlen;i+=itemSize){
          canvasOrigin.push(
            ...this.crtChild(
              ctx,
              cpvm,
              this[getPointByInd](i),
              r[(i/itemSize)%len])
          )
        }
      }
      this.canvasOrigin=new Float32Array(canvasOrigin)
    }
	}

  

  // 根据索引获取点位
  getPointByInd2(i){
    const {origin}=this
    return new Vector3(origin[i],origin[i+1],0)
  }
  getPointByInd3(i){
    return new Vector3(origin[i],origin[i+1],origin[i+2])
  }

  // 根据初始顶点和矩阵创建子路径
  crtChild(ctx,cpvm,v,r){
    let p=v.isVector2?new Vector3(v.x,v.y,0):new Vector3(v.x,v.y,v.z);
    this.canvasOrigin=p.applyMatrix4(cpvm)
    nodes[this.nodeType](ctx,p,r)
    return [p.x,p.y]
  }


  // 根据二维或三维的顶点数组设置origin
  setFromPoints(points){
    const vertices=[]
    for(let p of points){
      vertices.push(...p)
    }
    this.origin= new Float32Array(vertices)
  }
  
}

export {Point}


















