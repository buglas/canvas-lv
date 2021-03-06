# canvas-lv
canvas渲染引擎

## canvas原生架构的意义：

1.可视化需求千变万化，现有的图形框架不一定能满足你的需求。

2.有些以可视化为主导的项目，比如线上服装图案的设计、物流公司的仓储可视化，它们的项目复杂度高、灵活度都挺高，现有的图形框架即使能暂时满足你的基本需求，也很难满足你的后期维护和功能拓展需求。

3.canvas 适合非三维、图形数量不是太多的项目，因为它相较于WebGL更易上手，架构周期也短。

## canvas 架构目的的定位：

1.首先不要奢望架构100%完美的canvas框架，比如用它来架构一个光栅引擎出来，可以深度测试，可以写shader，可以实现一个非常逼真的三维场景。这种架构玩玩还可以，但是其底层的GPU 渲染规则决定了canvas 不能做基于片元的并行渲染。canvas只能做基于片元的同步渲染，那会很慢的。

2.基于项目需求，有目的的架构canvas。比如有的项目只需要有二维拼图功能就可以了，那就做好图形的模块化；有的项目会有点线做一些炫酷的三维效果，那就需要架构好变换矩阵。


## 我当前的canvas 框架所针对的项目需求：

1.点、线的三维变换。

2.圆形、矩形、弧线、曲线等基本图形的绘制。

3.文字的绘制。

4.图像的绘制。

5.图形的选择。

6.图形绘制顺序的设置。


## 架构思路：

1.使用三维顶点绘图，引入模型矩阵、视图矩阵、投影矩阵和视口矩阵。

2.路径使用lineTo()绘制路径，摒弃其它绘图方式，比如arc、rect等，这样可以便于对顶点进行精确控制。

3.文字使用canvas 内置的绘制方法，用矩形包围，以便选择。

4.图片用drawImage() 绘制，用矩形包围，以便选择。

