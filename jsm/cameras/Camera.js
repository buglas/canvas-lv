import {Object3D} from "../core/Object3D.js";
import {Matrix4} from "../math/Matrix4.js";

class Camera extends Object3D{
  constructor(){
    super()
    this.isCamera = true;
		this.type = 'Camera';
    this.projectionMatrix = new Matrix4();
    this.pvMatrix=new Matrix4();
  }
  computePVMatrix(){
    this.updateWorldMatrix()
    this.pvMatrix.multiplyMatrices(
      this.projectionMatrix,
      this.matrixWorld.clone().invert()
    )
  }
}
export {Camera} 