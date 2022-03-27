import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import Stats from 'three/examples/jsm/libs/stats.module'
import { GUI } from 'dat.gui'
import { TGALoader } from 'three/examples/jsm/loaders/TGALoader'

function getObjectsKeys( obj: any ) {
    const keys = [];
    for ( const key in obj ) {
        if ( obj.hasOwnProperty( key ) ) {
            keys.push( key );
        }
    }
    return keys;
}

const textureLoader = new THREE.TextureLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();

// Textures
const envMaps = ( function () {

    const path = 'textures/cube/';
    const format = '.jpg';
    const urls = [
        path + 'px' + format, path + 'nx' + format,
        path + 'py' + format, path + 'ny' + format,
        path + 'pz' + format, path + 'nz' + format
    ];

    const reflectionCube = cubeTextureLoader.load( urls );

    const refractionCube = cubeTextureLoader.load( urls );
    refractionCube.mapping = THREE.CubeRefractionMapping;

    return {
        none: null,
        reflection: reflectionCube,
        refraction: refractionCube
    }
})();

const TextureMaps = ( function () {

    const modelTex = textureLoader.load( 'models/rev/rev_BC.png' );

    return {
        none: null,
        modelTexture: modelTex
    };
})();

const normalMaps = ( function () {

    const modelNormal = textureLoader.load( 'models/rev/rev_N.png' );

    return {
        none: null,
        modelNormal: modelNormal
    };
})();

const roughnessMaps = ( function () {

    const modelRoug = textureLoader.load( 'models/rev/rev_S.png' );

    return {
        none: null,
        modelRoughness: modelRoug
    };
} )();

const metalMaps = ( function () {

    const modelMetal = textureLoader.load( 'models/rev/rev_M.png' );

    return {
        none: null,
        modelMetalness: modelMetal
    };
})();

const occlusionMaps = ( function () {

    const modelOcclusion = textureLoader.load( 'models/rev/rev_AO.png' );

    return {
        none: null,
        modelOcclusion: modelOcclusion
    };
})();

const envMapKeys = getObjectsKeys( envMaps )
const TextureMapKeys = getObjectsKeys( TextureMaps )
const normalMapKeys = getObjectsKeys( normalMaps )
const roughnessMapKeys = getObjectsKeys( roughnessMaps )
const metalMapKeys = getObjectsKeys( metalMaps )
const occlusionMapKeys = getObjectsKeys( occlusionMaps )

function updateTexture( material: any, materialKey: any, textures: any ) {

    return function ( key: any ) {
        material[ materialKey ] = textures[ key ];
        material.needsUpdate = true;
    };
}

function guiMeshStandardMaterial( gui: any, mesh: any, material: any ) {

    const data = {
        color: material.color.getHex(),
        emissive: material.emissive.getHex(),
        envMaps: envMapKeys[ 1 ],
        map: TextureMapKeys[ 1 ],
        normalMap: normalMapKeys [ 1 ],
        roughnessMap: roughnessMapKeys[ 1 ],
        metalnessMap: metalMapKeys[ 1 ],
        aoMap: occlusionMapKeys[ 1 ]
    };

    const folder = gui.addFolder( 'Material' )

    folder.add( data, 'envMaps', envMapKeys ).onChange( updateTexture( material, 'envMap', envMaps ) )
    folder.add( data, 'map', TextureMapKeys ).onChange( updateTexture( material, 'map', TextureMaps ) )
    folder.add( data, 'normalMap', normalMapKeys ).onChange( updateTexture( material, 'normalMap', normalMaps ) )
    folder.add( data, 'roughnessMap', roughnessMapKeys ).onChange( updateTexture( material, 'roughnessMap', roughnessMaps ) )
    folder.add(material, 'roughness', 0, 1)
    folder.add( data, 'metalnessMap', metalMapKeys ).onChange( updateTexture( material, 'metalnessMap', metalMaps ) )
    folder.add(material, 'metalness', 0, 1)
    folder.add( data, 'aoMap', occlusionMapKeys).onChange( updateTexture( material, 'aoMap', occlusionMaps ) )
}

// RENDER
const renderer = new THREE.WebGLRenderer( { antialias: true } )
renderer.setPixelRatio( window.devicePixelRatio )
renderer.physicallyCorrectLights = true
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
camera.position.set(50, 50, 0)
camera. rotation.set(39, -75, 0)

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.target.set(0, 0.7, 0)

//Ambient Light
const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5)
scene.add(ambientLight)

//Directional Light
const dirLight = new THREE.DirectionalLight( 0xffffff );
dirLight.position.set( 1796, 37, 971 );
dirLight.rotation.set(53, 62, -12)
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 512; // default
dirLight.shadow.mapSize.height = 512; // default
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 40;
scene.add( dirLight );

//Point Light
const pointLight = new THREE.PointLight( 0xffffff, 1, 0 );
pointLight.position.set( 0, 5, 0 );
scene.add( pointLight );

//Hemisphere Light
const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
hemiLight.position.set( 0, 20, 0 );
scene.add( hemiLight );

const gui = new GUI();

//Ambient Light GUI params
const ambientFolder = gui.addFolder('Ambient Light')
ambientFolder.add(ambientLight, "visible")
ambientFolder.add(ambientLight, "intensity", 0.0, 1.0)

//Directional Light GUI params
const dirFolder = gui.addFolder('Directional Light')
dirFolder.add(dirLight, "visible")
dirFolder.add(dirLight, "intensity", 0.0, 1.0)

//Point Light GUI params
const pointlightFolder = gui.addFolder('Point Light')
pointlightFolder.add(pointLight, "visible")
pointlightFolder.add(pointLight, "intensity", 0.0, 1.0)

//Hemisphere Light GUI params
const hemiFolder = gui.addFolder('Hemisphere Light')
hemiFolder.add(hemiLight, "visible")
hemiFolder.add(hemiLight, "intensity", 0.0, 1.0)


// GROUND
const ground = new THREE.Mesh( new THREE.PlaneGeometry( 10, 10 ), new THREE.MeshPhongMaterial( { color: 0xffffff, depthWrite: false } ) );
ground.rotation.x = - Math.PI / 2;
ground.receiveShadow = true;
scene.add( ground );

const loadingManager = new THREE.LoadingManager( () => {
    const loadingScreen = document.getElementById( 'loading-screen' );
    loadingScreen!.classList.add( 'fade-out' );
    // optional: remove loader from DOM via event listener
    loadingScreen!.addEventListener( 'transitionend', onTransitionEnd );
 } );

 function onTransitionEnd( event: any ) {
    const element = event.target;
    element.remove();
 }

// LOADER
const fbxLoader = new FBXLoader( loadingManager )
fbxLoader.load(
    'Meshes/Landscape_N_Buildings.fbx',
    (object) => {
         object.traverse(function (child) {
             if ((child as THREE.Mesh).isMesh) {
                (child as THREE.Mesh).material = material;
                (child as THREE.Mesh).castShadow = true;
             }
         })
        object.position.set(0, 0, 0)
        object.scale.set(0.001, 0.001, 0.001)
        object.castShadow = true //default is false
        object.receiveShadow = false //default
        object.add(cubeCamera)
        scene.add(object)
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    (error) => {
        console.log(error)
    }
)



// instantiate a loader
const loader = new TGALoader()

// load a resource
const texture = loader.load(
	// resource URL
	'Textures/Compact_tex_1024.tga',
)

const material = new THREE.MeshPhongMaterial( {
	color: 0xffffff,
	map: texture
} )


//const material = chooseMaterial(gui, fbxLoader)

const cubeRenderTarget = new THREE.WebGLCubeRenderTarget( 128, {
    format: THREE.RGBAFormat,
    generateMipmaps: true,
    minFilter: THREE.LinearMipmapLinearFilter,
    encoding: THREE.sRGBEncoding
} );

const cubeCamera = new THREE.CubeCamera( 1, 10000, cubeRenderTarget );

function render() {
    renderer.render(scene, camera)
}

function animate() {
    requestAnimationFrame(animate)

    controls.update()

    cubeCamera.update( renderer, scene );

    render()

}

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

animate()