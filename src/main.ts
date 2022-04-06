import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'dat.gui'
import { TGALoader } from 'three/examples/jsm/loaders/TGALoader'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';

function getObjectsKeys(obj: any) {
    const keys = [];
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            keys.push(key);
        }
    }
    return keys;
}

const stats = Stats()
document.body.appendChild(stats.dom)

const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

// Textures
const envMaps = (function () {

    const path = 'textures/cube/';
    const format = '.jpg';
    const urls = [
        path + 'px' + format, path + 'nx' + format,
        path + 'py' + format, path + 'ny' + format,
        path + 'pz' + format, path + 'nz' + format
    ];

    const reflectionCube = cubeTextureLoader.load(urls);

    const refractionCube = cubeTextureLoader.load(urls);
    refractionCube.mapping = THREE.CubeRefractionMapping;

    return {
        none: null,
        reflection: reflectionCube,
        refraction: refractionCube
    }
})();

const TextureMaps = (function () {

    const modelTex = textureLoader.load('models/rev/rev_BC.png');

    return {
        none: null,
        modelTexture: modelTex
    };
})();

const normalMaps = (function () {

    const modelNormal = textureLoader.load('models/rev/rev_N.png');

    return {
        none: null,
        modelNormal: modelNormal
    };
})();

const roughnessMaps = (function () {

    const modelRoug = textureLoader.load('models/rev/rev_S.png');

    return {
        none: null,
        modelRoughness: modelRoug
    };
})();

const metalMaps = (function () {

    const modelMetal = textureLoader.load('models/rev/rev_M.png');

    return {
        none: null,
        modelMetalness: modelMetal
    };
})();

const occlusionMaps = (function () {

    const modelOcclusion = textureLoader.load('models/rev/rev_AO.png');

    return {
        none: null,
        modelOcclusion: modelOcclusion
    };
})();

const envMapKeys = getObjectsKeys(envMaps)
const TextureMapKeys = getObjectsKeys(TextureMaps)
const normalMapKeys = getObjectsKeys(normalMaps)
const roughnessMapKeys = getObjectsKeys(roughnessMaps)
const metalMapKeys = getObjectsKeys(metalMaps)
const occlusionMapKeys = getObjectsKeys(occlusionMaps)

function updateTexture(material: any, materialKey: any, textures: any) {

    return function (key: any) {
        material[materialKey] = textures[key];
        material.needsUpdate = true;
    };
}

function guiMeshStandardMaterial(gui: any, mesh: any, material: any) {

    const data = {
        color: material.color.getHex(),
        emissive: material.emissive.getHex(),
        envMaps: envMapKeys[1],
        map: TextureMapKeys[1],
        normalMap: normalMapKeys[1],
        roughnessMap: roughnessMapKeys[1],
        metalnessMap: metalMapKeys[1],
        aoMap: occlusionMapKeys[1]
    };

    const folder = gui.addFolder('Material')

    folder.add(data, 'envMaps', envMapKeys).onChange(updateTexture(material, 'envMap', envMaps))
    folder.add(data, 'map', TextureMapKeys).onChange(updateTexture(material, 'map', TextureMaps))
    folder.add(data, 'normalMap', normalMapKeys).onChange(updateTexture(material, 'normalMap', normalMaps))
    folder.add(data, 'roughnessMap', roughnessMapKeys).onChange(updateTexture(material, 'roughnessMap', roughnessMaps))
    folder.add(material, 'roughness', 0, 1)
    folder.add(data, 'metalnessMap', metalMapKeys).onChange(updateTexture(material, 'metalnessMap', metalMaps))
    folder.add(material, 'metalness', 0, 1)
    folder.add(data, 'aoMap', occlusionMapKeys).onChange(updateTexture(material, 'aoMap', occlusionMaps))
}

// RENDER
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(window.devicePixelRatio)
renderer.physicallyCorrectLights = true
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
//renderer.shadowMap.type = THREE.BasicShadowMap
//renderer.shadowMap.type = THREE.PCFShadowMap
//renderer.shadowMap.type = THREE.VSMShadowMap
renderer.outputEncoding = THREE.sRGBEncoding
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// SCENE
const scene = new THREE.Scene()
scene.background = new THREE.Color(0xEEE5E9)

// CAMERA
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)
camera.position.set(21, 3, 8)
camera.rotation.set(39, -75, 0)

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.target.set(0, 0.7, 0)

//Ambient Light
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.2)
scene.add(ambientLight)

//Directional Light
const dirLight = new THREE.DirectionalLight(0xffffff);
dirLight.position.set(60, 40, 32);
dirLight.rotation.set(53, 62, -12)
dirLight.castShadow = true;
dirLight.shadow.camera.left = -100;
dirLight.shadow.camera.right = 100;
dirLight.shadow.camera.top = 100;
dirLight.shadow.camera.bottom = -100;
dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 500;
scene.add(dirLight);

const helper = new THREE.CameraHelper(dirLight.shadow.camera);
scene.add(helper);

//Hemisphere Light
const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff);
hemiLight.position.set(0, 5, 0);
scene.add(hemiLight);

const gui = new GUI();

//Ambient Light GUI params
const ambientFolder = gui.addFolder('Ambient Light')
ambientFolder.add(ambientLight, "visible")
ambientFolder.add(ambientLight, "intensity", 0.0, 2.0)

//Directional Light GUI params
const dirFolder = gui.addFolder('Directional Light')
dirFolder.add(dirLight, "visible")
dirFolder.add(dirLight, "intensity", 0.0, 5.0)

//Hemisphere Light GUI params
const hemiFolder = gui.addFolder('Hemisphere Light')
hemiFolder.add(hemiLight, "visible")
hemiFolder.add(hemiLight, "intensity", 0.0, 2.0)

const loadingManager = new THREE.LoadingManager(() => {
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen!.classList.add('fade-out');
    // optional: remove loader from DOM via event listener
    loadingScreen!.addEventListener('transitionend', onTransitionEnd);
});

function onTransitionEnd(event: any) {
    const element = event.target;
    element.remove();
}

// LOADER
const gltfLoader = new GLTFLoader(loadingManager)
const fbxLoader = new FBXLoader(loadingManager)

fbxLoader.load(
    'Meshes/Kampus.fbx',
    (fbx) => {
        fbx.traverse(function (child) {
            if ((child as THREE.Mesh).isMesh) {
                (child as THREE.Mesh).material = material;
                (child as THREE.Mesh).castShadow = true;
                (child as THREE.Mesh).receiveShadow = true;
            }
        })
        fbx.position.set(0, 2.5, 0)
        fbx.scale.set(0.001, 0.001, 0.001)
        fbx.castShadow = true //default is false
        fbx.receiveShadow = true //default
        scene.add(fbx)
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    }
)

fbxLoader.load(
    'Meshes/Trees_1.fbx',
    (object) => {
        object.traverse(function (child) {
            if ((child as THREE.Mesh).isMesh) {
                (child as THREE.Mesh).material = materialTree;
                (child as THREE.Mesh).castShadow = true;
                (child as THREE.Mesh).receiveShadow = true;
            }
        })
        object.position.set(8, 0.6, -3)
        object.scale.set(0.00075, 0.00075, 0.00075)
        object.castShadow = true //default is false
        object.receiveShadow = true //default
        scene.add(object)

    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    }
)

fbxLoader.load(
    'Meshes/Trees.fbx',
    (object) => {
        object.traverse(function (child) {
            if ((child as THREE.Mesh).isMesh) {
                (child as THREE.Mesh).material = materialTree;
                (child as THREE.Mesh).castShadow = true;
                (child as THREE.Mesh).receiveShadow = true;
            }
        })
        object.position.set(-6.5, -0.5, 13.95)
        object.scale.set(0.001, 0.001, 0.001)
        object.castShadow = true //default is false
        object.receiveShadow = true //default
        scene.add(object)

    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    }
)

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper)

const tgaLoader = new TGALoader();

const texture = tgaLoader.load(
    'Textures/Compact_tex_1024.tga'
)

const textureTree = new THREE.TextureLoader().load(
    'Textures/Trees_BC.png',
);

const material = new THREE.MeshStandardMaterial({
    map: texture,
    color: 0xffffff
})

const materialTree = new THREE.MeshStandardMaterial({
    map: textureTree
})


//const material = chooseMaterial(gui, fbxLoader)

function render() {
    renderer.render(scene, camera)
}

const composer = new EffectComposer(renderer);

function animate() {
    requestAnimationFrame(animate)

    controls.update()

    composer.render()

    stats.update()

}

const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const smaaPass = new SMAAPass(1, 1);
composer.addPass(smaaPass);

const fxaaPass = new ShaderPass(FXAAShader);
const pixelRatio = renderer.getPixelRatio();
fxaaPass.material.uniforms['resolution'].value.x = 1 / (window.innerWidth * pixelRatio);
fxaaPass.material.uniforms['resolution'].value.y = 1 / (window.innerHeight * pixelRatio);
composer.addPass(fxaaPass);


window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)

    render()
}

animate()