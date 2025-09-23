type EventType={
  type: keyof HTMLElementEventMap
  listener:(event:Event)=>void
}

type DomOptionType={
  tagName?:string
  id?:string
  className?:string
  innerText?:string
  style?:Partial<CSSStyleDeclaration>,
  events?:EventType[],
  children?:DomOptionType[]
}

class DomCreator{
  option:DomOptionType
  classPrefix:string
  constructor(option:DomOptionType={},classPrefix:string=''){
    this.option=option
    this.classPrefix=classPrefix
  }
  create(){
    const {option,classPrefix}=this
    return traverse(option)
    function traverse(option:DomOptionType){
      const {
        tagName='div',
        innerText='',
        style={},
        events=[],
        children=[],
        id,
        className=''
      }=option
      const htmlElement=document.createElement(tagName) as HTMLElement
      id&&(htmlElement.id=id)
      htmlElement.classList.add(classPrefix+className)
      htmlElement.innerText=innerText
      for(let [k,v] of Object.entries(style)){
        (htmlElement.style as any)[k]=v
      }
      events.forEach(ele=>{
        htmlElement.addEventListener(ele.type,(e)=>{
          ele.listener(e)
        })
      })
      children.forEach(ele=>{
        const htmlChild=traverse(ele)
        htmlElement.appendChild(htmlChild)
      })
      return htmlElement
    }
  }
  
}
export {DomCreator}