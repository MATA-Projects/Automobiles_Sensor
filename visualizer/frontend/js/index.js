import * as THREE from "three";

import { OrbitControls } from './lib/three/examples/jsm/controls/OrbitControls.js';
import {OBJLoader} from './lib/three/examples/jsm/loaders/OBJLoader.js';








function setScissorForElement(elem) {
    const canvasRect = canvas.getBoundingClientRect();
    const elemRect = elem.getBoundingClientRect();
   
    // compute a canvas relative rectangle
    const right = Math.min(elemRect.right, canvasRect.right) - canvasRect.left;
    const left = Math.max(0, elemRect.left - canvasRect.left);
    const bottom = Math.min(elemRect.bottom, canvasRect.bottom) - canvasRect.top;
    const top = Math.max(0, elemRect.top - canvasRect.top);
   
    const width = Math.min(canvasRect.width, right - left);
    const height = Math.min(canvasRect.height, bottom - top);
   
    // setup the scissor to only render to that part of the canvas
    const positiveYUpBottom = canvasRect.height - bottom;
    renderer.setScissor(left, positiveYUpBottom, width, height);
    renderer.setViewport(left, positiveYUpBottom, width, height);
   
    // return the aspect
    return width / height;
  }








function renderToCanvas(canvasid) {
    // DOM OBJECTS

    //RENDERER
    const canvas_dom_obj = document.getElementById(canvasid);
    const renderer = new THREE.WebGLRenderer({ canvas:canvas_dom_obj });
    renderer.setScissorTest(true);
    
    //CAMERA

    //VIEW CAMERA
    const fov = 75;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 5;
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.z = 70;
    const cameraHelper = new THREE.CameraHelper(camera);
    
    //------------------------------------------------------------------
    //1st camera
    // const view2Elem = document.querySelector('#view2');
    const camera2 = new THREE.PerspectiveCamera(
        30,  // fov
        window.innerWidth/window.innerHeight,   // aspect
        5, // near
        10, // far
      );
      camera2.position.set(10, 5, -30);
      camera2.lookAt (0,0,0);
      camera2.rotation.y = (Math.PI);
      const cameraHelper2 = new THREE.CameraHelper(camera2);
      cameraHelper2.visible = true;

      //controls2.update();
    //CONTROLERS


    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 1;
    controls.maxDistance = 1000;

    //SCENE
    const scene = new THREE.Scene();
    scene.add(cameraHelper2);


    const size = 20;
    const divisions = 10;

    const gridHelper = new THREE.GridHelper( size, divisions );
    scene.add( gridHelper );
    // OBJECTS
    
    const objLoader = new OBJLoader();


    objLoader.setPath('./models/');
    objLoader.load(`car/car.obj`, function(object) {
        object.position.y += 0.5;
        // object.scale.set(10,10,10);
        scene.add(object);
    });


    {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-10, 20, 40);
        scene.add(light);
    }
    
    const animate = (time) =>{
        time *= 0.001;  // convert time to seconds
        requestAnimationFrame(animate);
        controls.update()
        renderer.render(scene, camera);
    }

    animate()
}

renderToCanvas("3DWindow");
