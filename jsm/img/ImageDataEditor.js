class ImageDataEditor{
  constructor(imageData,dx,dy=dx){
    this.imageData=imageData
    this.dx=dx
    this.dy=dy
  }
  traverseYX(fn=(x,y,color,i)=>{}){
    const {imageData:{width,height,data},dx,dy}=this
    for(let y=0;y<height;y+=dy){
      for(let x=0;x<width;x+=dx){
        const i=(y*width+x)*4
        fn(x,y,[data[i],data[i+1],data[i+2],data[i+3]],i)
      }
    }
  }
  
}

export {ImageDataEditor} 