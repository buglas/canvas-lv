import { Vector3 } from "../math/Vector3.js"
import { Sprite } from "../core/Sprite.js"

/*默认属性*/
const defAttr = () => ({
	//顶点集合，vec3|vec2集合
	vertices: new Float32Array(),
  // 顶点的canvas坐标位，不可写
  canvasVertices:new Float32Array(),

  // 矢量长度
  itemSize:2,

	//绘图方式相关
	close: false,
})

/*Poly 多边形*/
class Poly extends Sprite {
	constructor(attr = {}) {
    super()
		Object.assign(this, defAttr(), attr)
	}

	/*塑形
	 *   ctx 上下文对象
	 *   cpvm 矩阵变换(视口矩阵*投影矩阵*视图矩阵*模型矩阵)
	 * */
	crtShape(ctx,cpvm) {
		const { vertices } = this
		ctx.beginPath()
    let canvasVertices=[]
    if(typeof vertices[0]==='number'){
      canvasVertices=this.crtChild(ctx,cpvm,vertices)
    }else{
      vertices.forEach(arr=>{
        canvasVertices.push(this.crtChild(ctx,cpvm,arr))
      })
    }
    this.canvasVertices=canvasVertices
	}
  
  // 根据初始顶点和矩阵创建子路径
  crtChild(ctx,cpvm,vertices){
    const { itemSize } = this
    const getPointByInd=`getPointByInd${itemSize}`
    const p0=this[getPointByInd](0,vertices)
    p0.applyMatrix4(cpvm)
    ctx.moveTo(p0.x,p0.y)
    const arr=[p0.x,p0.y]
		for (let i = itemSize,len = vertices.length; i < len; i+=itemSize) {
      const pi=this[getPointByInd](i,vertices)
      pi.applyMatrix4(cpvm)
      ctx.lineTo(pi.x,pi.y)
      arr.push(pi.x,pi.y)
		}
    return new Float32Array(arr)
  }

  // 根据索引获取点位
  getPointByInd2(i,vertices){
    return new Vector3(vertices[i],vertices[i+1],0)
  }
  getPointByInd3(i,vertices){
    return new Vector3(vertices[i],vertices[i+1],vertices[i+2])
  }

	/*检测顶点是否在路径中，参数为canvas坐标位*/
	isPointInPath(x,y) {
    const {canvasVertices}=this
    const {ctx}=this.getScene()
    ctx.save()
    ctx.beginPath()
    if(typeof canvasVertices[0] ==='number'){
      this.drawChild(ctx,canvasVertices)
    }else{
      canvasVertices.forEach(vertices=>{
        this.drawChild(ctx,vertices)
      })
    }
		const bool = ctx.isPointInPath(x, y)
		ctx.restore()
		return bool
	}

  // 根据canvasVertices绘制子路径
  drawChild(ctx,vertices){
    ctx.moveTo(vertices[0],vertices[1])
    for (let i = 2,len = vertices.length; i < len; i+=2) {
      ctx.lineTo(vertices[i],vertices[i+1])
    }
  }

  // 根据二维或三维的顶点数组设置vertices
  setFromPoints(points){
    let vertices=[]
    if(points[0] instanceof Array){
      points.forEach(arr=>{
        vertices.push(this.flatPoints(arr))
      })
    }else{
      vertices=this.flatPoints(points)
    }
    this.vertices=vertices
  }
  // 将points平展开
  flatPoints(points){
    const vertices=[]
    for(let p of points){
      vertices.push(...p)
    }
    return new Float32Array(vertices)
  }

	/*拷贝顶点集合*/
	copyVertices(vs) {
		const { vertices } = this
		vs.forEach((v, i) => {
			const curV = vertices[i]
			if (curV) {
				curV.copy(v)
			} else {
				vertices[i] = v
			}
		})
	}
}

export {Poly}