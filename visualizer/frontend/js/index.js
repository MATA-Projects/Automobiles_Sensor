import { OrbitControls } from 'OrbitControls';
import {OBJLoader} from 'OBJLoader';
import * as THREE from 'three';
import {Renderer} from './renderer/renderer.js';


function renderCorner(dx, dy, dz, azimoth, elavation, canvas){

    let dir = new THREE.Vector3(5, 0, 0);
    dir = dir.applyAxisAngle(new THREE.Vector3(0,1,0), (azimoth/180)*Math.PI);

    const camera = new THREE.PerspectiveCamera(
        75,  // fov
        1,   // aspect
        0.1, // near
        10, // far
    );

    let v = new THREE.Vector3(0,0,0);


    camera.lookAt(dir);
    camera.updateProjectionMatrix();
    camera.position.set(dx, dy , -dz );
    camera.updateProjectionMatrix();

    camera.getWorldDirection(v);    // Must be called for somereason to update the rotation

    const cameraHelper = new THREE.CameraHelper(camera);
    cameraHelper.update();
    cameraHelper.visible = true;

    return {camera: camera, cameraHelper: cameraHelper};
}


function createBox(dx, dy, dz, w, h, l, rx, ry, rz){
    const geometry = new THREE.BoxGeometry(w, h, l);
    geometry.rotateX(rx/180 * Math.PI);
    geometry.rotateY(ry/180 * Math.PI);
    geometry.rotateZ(rz/180 * Math.PI);
    
    geometry.translate(dx,dy,dz)

    const material = new THREE.MeshBasicMaterial({color:"#ffffff"});

    const mesh = new THREE.Mesh(geometry, material);
    return {
        mesh : mesh,
        geometry: geometry,
        material: material
    }
}


function loadScene(rendererObj, sceneid, meshes){
    rendererObj.clearScene(sceneid);

    const corners = [
        renderCorner(3473.8 / 1000, 0.5, 628.6/1000, 42, 0, rendererObj.getRenderer().domElement),
        renderCorner(-766.4 / 1000, 0.5, 738/1000, 135, 0, rendererObj.getRenderer().domElement),
        renderCorner(3473.8 / 1000, 0.5, -628.6/1000, -42, 0, rendererObj.getRenderer().domElement),
        renderCorner(-766.4 / 1000, 0.5, -738/1000, -135, 0, rendererObj.getRenderer().domElement),
    ];
    
    for (const corner of corners){
        rendererObj.attachObject(sceneid, corner.cameraHelper);
    }

    const gridHelper = new THREE.GridHelper( 20, 10 );
    rendererObj.attachObject(sceneid, gridHelper);
    
    // OBJECTS
    const objLoader = new OBJLoader();
    objLoader.setPath('./models/');
    objLoader.load(`car/car.obj`, function(object) {
        object.position.y += 0.5;
        object.scale.set(0.75,0.75,0.75);
        object.position.x = 1.4;
        object.rotation.y = 90/180*Math.PI;
        rendererObj.attachObject(sceneid, object);
    });

    const dligthid = rendererObj.addDirLight(0xFFFFFF,1, [0,0,0], [-10, 20, 40]);
    rendererObj.attachLight(sceneid, dligthid);

    let models_data = localStorage.getItem("models_data");
    if(!(models_data === null)){
        models_data = JSON.parse(models_data );
        console.log("loaded models data: ", models_data)
        for(var model of models_data){
            const {mesh,geometry,material} = createBox(model["dx"], model["dy"], model["dz"], model["width"], model["height"], model["length"], 0,0,0);
            let r = 0;
            let g = 0;
            let b = 0;
            for ( let sens of model["found_in"]){
                console.log("sens" , sens)
                if(sens[0] === "LEFT_FRONT"){
                    g += 200;
                }
                if(sens[0] === "RIGHT_FRONT"){
                    b += 200;
                }
                if(sens[0] === "LEFT_BOTTOM"){
                    r += 100;
                    g += 100;
                    b += 100;
                }
                if(sens[0] === "RIGHT_BOTTOM"){
                    r += 200;
                }
            }

            material.color.set(r,g,b);
            meshes.push({mesh,geometry,material});
            rendererObj.attachObject(sceneid, mesh);
        }
    }
    console.log(meshes);
}



function main(){
    const canvas_dom_obj = document.getElementById("3DWindow");
    const rendererObj = new Renderer(canvas_dom_obj,  "#696969");


    // Setup the camera
    const cameraid = rendererObj.addCamera(75, window.innerWidth/window.innerHeight, 0.1, 100, [-6, 3, 0],  [0,0,0]);

    // Setup Camera Controls
    const controls = new OrbitControls(rendererObj.getCamera(cameraid), rendererObj.getRenderer().domElement);
    controls.minDistance = 1;
    controls.target.set(0,0,0);
    controls.maxDistance = 1000;

    // Fill the Scene
    const sceneid = rendererObj.addScene();
    
    localStorage.removeItem("models_data");
    localStorage.removeItem("needs_update");

    let meshes = [];
    function animate(time){
        if(localStorage.getItem("needs_update") !== null){
            meshes = [];
            loadScene(rendererObj, sceneid, meshes);
            localStorage.removeItem("models_data");
            localStorage.removeItem("needs_update");
        }
    
        time *= 0.001;  // convert time to seconds
        requestAnimationFrame(animate);
        controls.update();
        rendererObj.render(sceneid, cameraid);
    }

    loadScene(rendererObj, sceneid, meshes);
    animate()
}




main();
