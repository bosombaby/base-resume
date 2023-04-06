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

let ambientLight, sunLight, spotLight
const ambientLightColor = new THREE.Color(0xffffff)
const ambientDarkColor = new THREE.Color(0x6E57E0)
let params = {
    showCmeraInfo: () => {

        const x = parseFloat(camera.position.x.toFixed(2))
        const y = parseFloat(camera.position.y.toFixed(2))
        const z = parseFloat(camera.position.z.toFixed(2))

        // console.log(x, y, z);
    }
}
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

let init = () => {
    //场景
    scene = new THREE.Scene()

    //坐标轴
    // const axesHelper = new THREE.AxesHelper(10)
    // scene.add(axesHelper)
    //灯光
    // 环境光
    ambientLight = new THREE.AmbientLight(0xffffff, 1.8)
    scene.add(ambientLight)

    //太阳光
    sunLight = new THREE.DirectionalLight(0xffffff, 2.5)
    scene.add(sunLight)
    sunLight.position.set(2, 5, 3)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.set(2048, 2048)
    // sunLight.shadow.camera.left = -3
    // sunLight.shadow.camera.right = 2
    // sunLight.shadow.camera.top = 5
    // sunLight.shadow.camera.bottom = -1
    sunLight.shadow.camera.near = 2
    sunLight.shadow.camera.far = 8
    sunLight.shadow.normalBias = 0.05
    sunLight.shadow.radius = 5

    //台灯
    spotLight = new THREE.SpotLight(0xf0e919, 0, 5, 0.5, 0.2, 2)
    scene.add(spotLight)
    spotLight.position.set(-1.56, 3.6, -0.46)

    const targetObject = new THREE.Object3D()
    targetObject.position.set(-1.56, 0, 0.46)
    scene.add(targetObject)
    spotLight.target = targetObject

    spotLight.castShadow = true
    spotLight.shadow.normalBias = 0.05
    spotLight.shadow.mapSize.set(2048, 2048)
    spotLight.shadow.camera.near = 2
    spotLight.shadow.camera.far = 5

    // const helper = new THREE.CameraHelper(spotLight.shadow.camera)
    // scene.add(helper)

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

let durationTime = 2
/*==================== DARK LIGHT THEME & LANGUAGE====================*/
const themeButton = document.getElementById('theme-button')
const darkTheme = 'dark-theme'
const iconTheme = 'uil-moon'

const getCurrentTheme = () => document.body.classList.contains(darkTheme) ? 'dark' : 'light'
const getCurrentIcon = () => themeButton.classList.contains(iconTheme) ? 'uil-moon' : 'uil-sun'
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

let changeTheme = () => {

    // Previously selected topic (if user selected)
    const selectedTheme = localStorage.getItem('selected-theme')
    const selectedIcon = localStorage.getItem('selected-icon')


    // // We validate if the user previously chose a topic
    // if (selectedTheme) {
    //     // If the validation is fulfilled, we ask what the issue was to know if we activated or deactivated the dark
    //     document.body.classList[selectedTheme === 'dark' ? 'add' : 'remove'](darkTheme)
    //     themeButton.classList[selectedIcon === 'uil-moon' ? 'add' : 'remove'](iconTheme)

    //     gsapTheme()
    // }


    // Activate / deactivate the theme manually with the button
    themeButton.addEventListener('click', () => {
        // Add or remove the dark / icon theme
        document.body.classList.toggle(darkTheme)
        if (getCurrentIcon() === 'uil-sun') {
            themeButton.classList.remove('uil-sun')
            themeButton.classList.add('uil-moon')
        } else {
            themeButton.classList.remove('uil-moon')
            themeButton.classList.add('uil-sun')

        }
        // localStorage.setItem('selected-theme', getCurrentTheme())
        // localStorage.setItem('selected-icon', getCurrentIcon())

        gsapTheme()

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
changeTheme()
// debugUI()
animate()