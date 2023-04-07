# 一、前言
![9.png](https://cdn.nlark.com/yuque/0/2023/png/27367619/1680859147023-dbc23156-b670-4272-b20c-5c8e51277d66.png#averageHue=%23211e31&clientId=u079d5df4-97aa-4&from=ui&id=uc1689cea&name=9.png&originHeight=839&originWidth=1716&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=86339&status=done&style=none&taskId=ua106b1e9-5a10-4954-9e86-2bcff06196c&title=)

最近，在github上面找到了一个不错的技术介绍网站，主要使用**html+css+js**原生三件套写的。我在此基础之上利用three.js加了一点3D元素在里面，让这个网站看起来更炫酷。

改的时候，感觉原生还是比不上框架来的方便，后续有时间我会抽离一个**vue组件**的版本。

**开源地址**：[个人简历](https://github.com/bosombaby/base-resume)
**在线访问**：[个人简历](https://resume.vrteam.top/)
**参考资源**：[responsive-portfolio-website](https://github.com/ASouthernCat/responsive-portfolio-website)
# 二、模型准备
## 2.1 资源寻找
![1.png](https://cdn.nlark.com/yuque/0/2023/png/27367619/1680777624170-efa66316-4e0b-47c7-af25-6168c9f2f595.png#averageHue=%233a3a3a&clientId=ud14e0ab2-0b1f-4&from=ui&id=u76916cb1&name=1.png&originHeight=737&originWidth=1611&originalType=binary&ratio=1.125&rotation=0&showTitle=false&size=440017&status=done&style=none&taskId=u1c8406cb-4648-40ac-9e66-93e87b33bcd&title=)

对于模型来说，我们可以自己慢慢的建一个模型，但是很费时间。不想自己建模的话，自己可以直接在网上找到一些资源，导入到blender进行相关修改。
以下是一些好用的3D资源网站：

1. TurboSquid - [https://www.turbosquid.com/](https://www.turbosquid.com/)
2. CGTrader - [https://www.cgtrader.com/](https://www.cgtrader.com/)
3. Sketchfab - [https://sketchfab.com/](https://sketchfab.com/)
4. 3DExport - [https://3dexport.com/](https://3dexport.com/)
5. Free3D - [https://free3d.com/](https://free3d.com/)
6. Unity Asset Store - [https://assetstore.unity.com/](https://assetstore.unity.com/)
7. Poly by Google - [https://poly.google.com/](https://poly.google.com/)
8. Clara.io - [https://clara.io/](https://clara.io/)
9. Blend Swap - [https://www.blendswap.com/](https://www.blendswap.com/)
10. 3D Warehouse by SketchUp - [https://3dwarehouse.sketchup.com/](https://3dwarehouse.sketchup.com/)

这些网站提供了各种类型的3D模型和纹理，包括游戏资源、建筑物、人物、动物、车辆等。有些网站提供免费的资源，而有些网站则需要付费才能下载高质量的资源。希望这些网站可以帮助您找到所需的3D资源。
## 2.2 资源处理

![2.png](https://cdn.nlark.com/yuque/0/2023/png/27367619/1680777842567-9166c52b-6a84-4720-ba29-bc476fb5a420.png#averageHue=%23313030&clientId=ud14e0ab2-0b1f-4&from=ui&id=uc7895ab4&name=2.png&originHeight=747&originWidth=1034&originalType=binary&ratio=1.125&rotation=0&showTitle=false&size=66400&status=done&style=none&taskId=u5e9a3372-4444-4d6b-bbc5-d09e036823d&title=)

修改好想要的模型之后，由于网页端要追求性能，所以我们要对模型进行压缩（一般可以压缩到原来的1/10）。压缩后使用three.js特定的**DRACOLoader**解压文件。
## 2.3 Draco压缩
虽然我们可能会觉得使用Draco压缩是个双赢局面，但实际上并非如此。
确实它会让几何体更轻量，但首先要使用的时候必须加载DracoLoader类和解码器。其次，我们计算机解码一个压缩文件需要时间和资源，这可能会导致页面打开时有短暂冻结，即便我们使用了worker和WebAssembly。
因此我们必须根据实际来决定使用什么解决方案。如果一个模型具有100kb的几何体，那么则不需要Draco压缩，但是如果我们有MB大小的模型要加载，并且不关心在开始运行时有些许页面冻结，那么便可能需要用到Draco压缩。
# 三、基础场景
```javascript
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'

const canvas = document.querySelector('.webgl')
const rect = canvas.getBoundingClientRect();
const sizes = {
    width: rect.width,
    height: rect.height
}

let scene, camera, renderer
let controls, gui
let init = () => {
    //场景
    scene = new THREE.Scene()

    // 相机
    camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
    camera.position.set(-2.85, 4.37, 2.49)
    camera.lookAt(scene.position)


    // 渲染器
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true })
    renderer.setSize(sizes.width, sizes.height)
    // renderer.setClearColor('lightsalmon', 0.5)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.useLegacyLights = true
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    // 真实性物理渲染
    renderer.physicallyCorrectLights = true
    renderer.outputEncoding = THREE.sRGBEncoding
    renderer.toneMapping = THREE.ACESFilmicToneMapping



    //控制器
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = false
    controls.enableZoom = false
    controls.enablePan = false

    controls.minPolarAngle = Math.PI / 6
    controls.maxPolarAngle = Math.PI / 3

    controls.minAzimuthAngle = -Math.PI / 6
    controls.maxAzimuthAngle = Math.PI / 2
}

//加载模型
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('./assets/js/three/draco/')
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

let loadModel = () => {
    gltfLoader.load('./assets/model/office.glb', (gltf) => {

        const office = gltf.scene
        office.rotation.y = Math.PI / 2
        office.traverse((child) => {
            if (child instanceof THREE.Mesh) {

                child.castShadow = true
                child.receiveShadow = true

                if (child.name === 'mac-screen') {
                    screen = child
                } else if (child.name === 'Chair') {
                    chair = child
                } else if (child.name === 'lamp-top') {
                    // console.log(child.position);

                }
            }
        })
        setScreenVideo()
        setChairRotate()
        scene.add(office)
    })
}
//渲染
let animate = () => {

    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(animate)
}

init()
loadModel()
animate()
```
three.js的场景基础包括：

1. Scene（场景）：包含所有的3D对象、光源和摄像机。
2. Camera（相机）：定义了视角和投影方式，控制着我们从场景中看到的内容。
3. Renderer（渲染器）：将场景和相机中的对象渲染到屏幕上。
4. Mesh（网格）：3D对象的基本组成部分，由三角形构成。可以使用不同的材质和纹理来给网格添加颜色和纹理。
5. Material（材质）：定义了网格的颜色、纹理、光照等属性。
6. Light（光源）：在场景中添加光源可以让物体更加真实地呈现。
7. Texture（纹理）：可以给网格添加图片或者其他图案。
8. Geometry（几何体）：描述了网格的形状和大小。
# 四、灯光
## 4.1 介绍
在 three.js 中，灯光用来模拟现实中的光照条件，可以让场景中的物体更加真实地呈现。灯光可以为物体提供不同的光照效果，如明亮的阳光、柔和的夜灯、闪烁的蜡烛等。
three.js 中的灯光有以下几种类型：

1. AmbientLight（环境光）：在整个场景中均匀地分布着光源，使得整个场景看起来更加明亮。
2. DirectionalLight（平行光）：模拟来自于一个方向的太阳光线，具有方向性，可以产生明暗的效果。
3. PointLight（点光源）：模拟来自于一个点的光源，可以产生明暗的效果，也可以产生阴影。
4. SpotLight（聚光灯）：模拟来自于一个点的光源，具有方向性，可以产生明暗的效果，也可以产生锥形的阴影。

通过设置不同的灯光类型、颜色、强度、位置等属性，可以在 three.js 中模拟出各种不同的光照效果，使得场景中的物体看起来更加真实。
## 4.2 阴影相机

![3.png](https://cdn.nlark.com/yuque/0/2023/png/27367619/1680778873556-ceee61fa-1e6b-4fc2-abfd-d7a3a7fc2ee7.png#averageHue=%23fafafd&clientId=ud14e0ab2-0b1f-4&from=ui&id=u25710ab2&name=3.png&originHeight=366&originWidth=844&originalType=binary&ratio=1.125&rotation=0&showTitle=false&size=22785&status=done&style=none&taskId=u2d386d9b-8219-462c-8f1b-3d7b55ac1c8&title=)
本例，我们要尽可能的模拟灯光效果，所以对于阴影也要考虑在内。对于阴影来说，会先用一个特殊的相机（称为阴影相机）从光源的位置来渲染场景，并将渲染结果保存到一个深度纹理中。这个深度纹理记录了场景中每个像素距离光源的距离，也即是场景中哪些物体遮挡了该像素。
当渲染场景时，系统会根据阴影相机生成的深度纹理来计算每个像素是否在阴影中。具体来说，对于每个像素，系统会根据它在阴影相机中的位置、深度信息和光源的位置和方向来计算它是否被遮挡。如果该像素被遮挡，则它的颜色值将被调整以模拟出阴影效果，否则它的颜色值不变。

## 4.3 灯光渲染
在 three.js 中，有三种灯光类型可以被渲染，分别是平行光（DirectionalLight）、点光源（PointLight）和聚光灯（SpotLight）。
这些灯光可以被添加到场景中，并通过设置它们的属性来控制它们的位置、颜色、强度、范围等参数，从而实现不同的光照效果。
这些灯光可以被渲染到不同类型的相机中，具体如下：

1. 平行光（DirectionalLight）：平行光模拟的是来自于一个方向的光线，具有方向性，可以产生明暗的效果。平行光只能被渲染到正交相机（OrthographicCamera）中
2. 点光源（PointLight）：点光源模拟的是来自于一个点的光线，可以产生明暗的效果，也可以产生阴影。点光源只能被渲染到透视相机（PerspectiveCamera）中
3. 聚光灯（SpotLight）：聚光灯模拟的是来自于一个点的光线，具有方向性，可以产生明暗的效果，也可以产生锥形的阴影。聚光灯只能被渲染到透视相机（PerspectiveCamera）中

![4.png](https://cdn.nlark.com/yuque/0/2023/png/27367619/1680779808730-43ef0d87-41de-48a2-87d8-b6af4f9ababc.png#averageHue=%23a98031&clientId=ud14e0ab2-0b1f-4&from=ui&id=u733db993&name=4.png&originHeight=719&originWidth=1263&originalType=binary&ratio=1.125&rotation=0&showTitle=false&size=123871&status=done&style=none&taskId=u091abf92-acd8-454a-9350-9e6e0ad6b9d&title=)
# 五、动画
# 5.1 多媒体
使用 Three.js 的 VideoTexture 可以将视频作为纹理应用到 3D 对象上，实现很酷的效果。首先，在一开始加载模型的时候要把需要贴图的对象找到传入函数，第二步添加视频纹理。
```javascript
// 屏幕播放音频
let screen = null
let setScreenVideo = () => {

    const video = document.createElement('video')
    video.src = './assets/video/kda.mp4'
    video.muted = true
    video.playsInline = true
    video.autoplay = true
    video.loop = true
    video.play()
    const videoTexture = new THREE.VideoTexture(video)

    // 添加真实性渲染，后面改
    screen.material = new THREE.MeshBasicMaterial({
        map: videoTexture,
    })
}
```
# 5.2 椅子旋转
这里对于过渡的效果统一使用gsap完成，GSAP是一个JavaScript动画库，用于创建高性能、流畅的动画效果。
文章参考：[GSAP的香，我来带你get~时入1k算少的！！](https://juejin.cn/post/7148216859442528293)
```javascript
// 添加椅子旋转
let chair = null
let setChairRotate = () => {
    gsap.to(chair.rotation, {
        y: Math.PI / 4,
        duration: 10,
        ease: 'power1.inOut',
        repeat: -1,
        yoyo: true,
    })
}
```
# 5.3 明暗变换
当我们切换界面的明暗时，模型理应跟着变换。所以模型要响应变化，一开始我们为灯光添加**debug-gui，**可以时刻调试灯光。

![5.png](https://cdn.nlark.com/yuque/0/2023/png/27367619/1680780709682-87809514-1ffe-47c5-8d5a-41aaef757eac.png#averageHue=%23f6f7fb&clientId=ud14e0ab2-0b1f-4&from=ui&id=u393e5835&name=5.png&originHeight=776&originWidth=1816&originalType=binary&ratio=1.125&rotation=0&showTitle=false&size=102701&status=done&style=none&taskId=u6a271028-d04d-4b64-a3e7-799b9e7fdb7&title=)
![6.png](https://cdn.nlark.com/yuque/0/2023/png/27367619/1680780758790-1ec60457-edf1-4e44-b81f-ac643e15d116.png#averageHue=%23211e32&clientId=u3fdacc5e-87da-4&from=ui&id=u5414a25b&name=6.png&originHeight=729&originWidth=1721&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=79758&status=done&style=none&taskId=u1e45bfb4-40d0-48f5-8b54-45e7216513c&title=)

```javascript
let debugUI = () => {
    //gui控制器
    gui = new GUI()
    let folder1 = gui.addFolder('环境光')
    folder1.addColor(ambientLight, 'color')
    folder1.add(ambientLight, 'intensity', 0, 10, 0.01)
    folder1.close()

    let folder2 = gui.addFolder('太阳光')
    folder2.add(sunLight.position, 'x', -5, 5, 0.01)
    folder2.add(sunLight.position, 'y', -5, 5, 0.01)
    folder2.add(sunLight.position, 'z', -5, 5, 0.01)
    folder2.addColor(sunLight, 'color')
    folder2.add(sunLight, 'intensity', 0, 10, 0.01)
    folder2.close()


    let folder3 = gui.addFolder('台灯')
    folder3.add(spotLight.position, 'x', -5, 5, 0.01)
    folder3.add(spotLight.position, 'y', -5, 5, 0.01)
    folder3.add(spotLight.position, 'z', -5, 5, 0.01)
    folder3.addColor(spotLight, 'color')
    folder3.add(spotLight, 'intensity', 0, 10, 0.01)
    folder3.close()

    let folder4 = gui.addFolder('相机')
    folder4.add(camera.position, 'x', -10, 10, 0.01)
    folder4.add(camera.position, 'y', -10, 10, 0.01)
    folder4.add(camera.position, 'z', -10, 10, 0.01)
    // folder4
    folder4.add(params, 'showCmeraInfo')

    // gui.close()


}
```
```javascript
let gsapTheme = () => {
    if (getCurrentTheme() === 'light') {
        gsap.to(ambientLight, { intensity: 2.5 })
        gsap.to(ambientLight.color, {
            ...ambientLightColor,
            duration: durationTime
        })
        gsap.to(sunLight, { intensity: 2.5, duration: durationTime })
        gsap.to(spotLight, { intensity: 0, duration: durationTime })
    } else {
        gsap.to(ambientLight, { intensity: 3.8, duration: durationTime })
        gsap.to(ambientLight.color, {
            ...ambientDarkColor,
            duration: durationTime
        })
        gsap.to(sunLight, { intensity: 0, duration: durationTime })
        gsap.to(spotLight, { intensity: 3.5, duration: durationTime })

    }
}
```
# 六、真实性渲染
## 6.1 uv贴图
这里的技术并没有手动贴上uv贴图，但是作为一项基本的理论，还是要掌握一下。
UV贴图是将纹理图像映射到三维物体表面上的一种技术，它依赖于UV坐标系来确定纹理图像在物体表面上的位置。其中，U和V分别表示纹理图像在水平和垂直方向上的坐标，取值通常是0到1之间（水平方向的第U个像素/图片宽度，垂直方向的第V个像素/图片高度）。
对于某些特殊的3D贴图技术，可能会使用到W坐标，但在一般情况下，UV坐标系就足够描述纹理映射了。展UV是将物体表面展开成二维平面，以便进行纹理贴图，这一过程也需要使用到UV坐标系来确定各个点在展开平面上的位置。
## 6.2 光照
在three.js中，physicallyCorrectLights是一个属性，用于指定渲染器是否使用物理正确的光照模型。当该属性设置为true时，渲染器会使用基于物理的光照模型，以便更准确地模拟真实世界中的光照效果。
```javascript
renderer.physicallyCorrectLights = true
```
## 6.3 渲染器
尽管目前看起来效果还行，但在颜色方面还是有点欠缺需要下点工夫。这是因为WebGLRenderer 属性的问题。
### 6.3.1 utputEncoding


![7.png](https://cdn.nlark.com/yuque/0/2023/png/27367619/1680857850010-88aa3cc7-33ab-4c21-931d-2ea4e2361e56.png#clientId=u079d5df4-97aa-4&from=ui&height=264&id=u5340cd21&name=7.png&originHeight=351&originWidth=509&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=68989&status=done&style=none&taskId=u271b7b8d-df48-4992-ae55-14ccfd44604&title=&width=383)![8.png](https://cdn.nlark.com/yuque/0/2023/png/27367619/1680857865606-fa502ce4-97b9-4820-9958-cb3f44d3c5f0.png#averageHue=%23f3f4f9&clientId=u079d5df4-97aa-4&from=ui&height=274&id=u7b303778&name=8.png&originHeight=433&originWidth=557&originalType=binary&ratio=1.25&rotation=0&showTitle=false&size=63948&status=done&style=none&taskId=u4f5cfa3c-7b56-4da7-a1a9-6bfcde20295&title=&width=352)



outputEncoding属性控制输出渲染编码。默认情况下，[outputEncoding](https://threejs.org/docs/index.html?q=ren#api/zh/renderers/WebGLRenderer.outputEncoding)的值为THREE.LinearEncoding，看起来还行但是不真实，建议将值改为THREE.sRGBEncoding

### 6.3.2 Tone mapping
色调映射Tone mapping旨在将超高的动态范围HDR转换到我们日常显示的屏幕上的低动态范围LDR的过程。
说明一下HDR和LDR（摘自知乎LDR和HDR）：

- 因为不同的厂家生产的屏幕亮度（物理）实际上是不统一的，那么我们在说LDR时，它是一个0到1范围的值，对应到不同的屏幕上就是匹配当前屏幕的最低亮度（0）和最高亮度（1）
- 自然界中的亮度差异是非常大的。例如，蜡烛的光强度大约为15，而太阳光的强度大约为10w。这中间的差异是非常大的，有着超级高的动态范围。
- 我们日常使用的屏幕，其最高亮度是经过一系列经验积累的，所以使用、用起来不会对眼睛有伤害；但自然界中的，比如我们直视太阳时，实际上是会对眼睛产生伤害的。

那为了改变色调映射tone mapping，则要更新WebGLRenderer上的toneMapping属性，有以下这些值
```javascript
THREE.NoToneMapping (默认)
THREE.LinearToneMapping
THREE.ReinhardToneMapping
THREE.CineonToneMapping
THREE.ACESFilmicToneMapping
```
尽管我们的贴图不是HDR，但使用tone mapping可以塑造更真实的效果。
## 6.4 阴影失真
在计算曲面是否处于阴影中时，由于精度原因，阴影失真可能会发生在平滑和平坦表面上。
而现在在汉堡包上发生的是汉堡包在它自己的表面上投射了阴影。因此我们必须调整灯光阴影shadow的“偏移bias”和“法线偏移normalBias”属性来修复此阴影失真。

- bias通常用于平面，因此不适用于我们的汉堡包。但如果你有在一块平坦的表面上出现阴影失真，可以试着增加偏差直到失真消失。
- normalBias通常用于圆形表面，因此我们增加法向偏差直到阴影失真消失。

