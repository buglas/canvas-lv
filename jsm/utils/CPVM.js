function getCPVM(obj,camera){
  const {canvasMatrix}=obj.getScene()
  camera.computePVMatrix()
  obj.updateWorldMatrix()
  return canvasMatrix.clone()
    .multiply(camera.pvMatrix)
    .multiply(obj.matrixWorld)
}
function getCPV(scene,camera){
  const {canvasMatrix}=scene
  camera.computePVMatrix()
  return canvasMatrix.clone()
    .multiply(camera.pvMatrix)
}

function getCPVMI(obj,camera){
  return getCPVM(obj,camera).invert()
}
function getCPVI(scene,camera){
  return getCPV(scene,camera).invert()
}
export {
  getCPVM,
  getCPVMI,
  getCPV,
  getCPVI
}