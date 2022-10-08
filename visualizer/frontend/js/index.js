import { OrbitControls } from 'OrbitControls';
import {OBJLoader} from 'OBJLoader';
import {Renderer} from './renderer/renderer.js';


function main(){
    const canvas_dom_obj = document.getElementById("3DWindow");
    const temporary = new Renderer(canvas_dom_obj);
}



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


function renderToCanvas(canvasid){

    //RENDERER
    const canvas_dom_obj = document.getElementById(canvasid);
    const renderer = new THREE.WebGLRenderer({ canvas:canvas_dom_obj });
    renderer.setScissorTest(true);
    renderer.setClearColor( "#696969");
    //CAMERA

    //VIEW CAMERA
    const fov = 75;
    const aspect = 2;  // the canvas default
    const near = 1;
    const far = 50;
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 100);
    camera.position.x = -6;
    camera.position.y = 3;
    camera.lookAt(0,0,0);
    const cameraHelper = new THREE.CameraHelper(camera);
    
    //------------------------------------------------------------------
    //1st camera
    

      //controls2.update();
    //CONTROLERS

    
//     //CAMERA
//     const fov = 75;
//     const aspect = 2;  // the canvas default
//     const near = 0.1;
//     const far = 5;
//     const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
//     camera.position.z = 70;

//     //CONTROLERS

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 1;
    controls.target.set(0,0,0);
    controls.maxDistance = 1000;

    //SCENE
    var scene = new THREE.Scene();
    let meshes = [];

    localStorage.removeItem("models_data");
    localStorage.removeItem("needs_update");

    const loadScene = () => {
        scene = new THREE.Scene();

        const corners = [
            renderCorner(3473.8 / 1000, 0.5, 628.6/1000, 42, 0, renderer.domElement),
            renderCorner(-766.4 / 1000, 0.5, 738/1000, 135, 0, renderer.domElement),
            renderCorner(3473.8 / 1000, 0.5, -628.6/1000, -42, 0, renderer.domElement),
            renderCorner(-766.4 / 1000, 0.5, -738/1000, -135, 0, renderer.domElement),
        ];
        
        for (const corner of corners){
            scene.add(corner.cameraHelper);
        }
    
        const size = 20;
        const divisions = 10;
    
        const gridHelper = new THREE.GridHelper( size, divisions );
        scene.add( gridHelper );
        // OBJECTS
        
        const objLoader = new OBJLoader();
    
    
        objLoader.setPath('./models/');
        objLoader.load(`car/car.obj`, function(object) {
            object.position.y += 0.5;
            object.scale.set(0.75,0.75,0.75);
            object.position.x = 1.4;
            object.rotation.y = 90/180*Math.PI;
            
            scene.add(object);
        });
    
        
        {
            const color = 0xFFFFFF;
            const intensity = 1;
            const light = new THREE.DirectionalLight(color, intensity);
            light.position.set(-10, 20, 40);
            scene.add(light);
        }

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
                scene.add(mesh);
            }
        }
        console.log(meshes);

    }

    const animate = (time) =>{
        if(localStorage.getItem("needs_update") !== null){
            meshes = [];
            loadScene();
            localStorage.removeItem("models_data");
            localStorage.removeItem("needs_update");
        }

        time *= 0.001;  // convert time to seconds
        requestAnimationFrame(animate);
        controls.update()
        renderer.render(scene, camera);
    }
    loadScene();
    animate()
}

main();
