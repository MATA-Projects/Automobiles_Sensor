import * as THREE from 'three';

import { OrbitControls } from './lib/three/examples/jsm/controls/OrbitControls.js';
import {OBJLoader} from './lib/three/examples/jsm/loaders/OBJLoader.js';
// import * as THREEx from './lib/three/threex.domevents.js';
// const three = THREE;
// const {OrbitControls = require('express');

function renderToCanvas(canvasid) {
    // DOM OBJECTS

    //RENDERER
    const canvas_dom_obj = document.getElementById(canvasid);
    const renderer = new THREE.WebGLRenderer({ canvas:canvas_dom_obj });

    
    //CAMERA
    const fov = 75;
    const aspect = 2;  // the canvas default
    const near = 0.1;
    const far = 5;
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.z = 70;

    //CONTROLERS


    const controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 1;
    controls.maxDistance = 1000;

    //SCENE
    const scene = new THREE.Scene();

    // OBJECTS
    
    const objLoader = new OBJLoader();
    // objLoader.setPath('/models/');
    objLoader.load('/car.obj', function(object) {
        object.position.y -= 60;
        scene.add(object);
    });
    {
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-10, 20, 40);
        scene.add(light);
    }
    
    const geometry = new THREE.SphereGeometry(10,10,10);

    function makeInstance(geometry, color, x) {
        const material = new THREE.MeshPhongMaterial({ color });
        const shape = new THREE.Mesh(geometry, material);
        scene.add(shape);
        shape.position.x = x;
        return shape;
    }

    const spheres = [
        makeInstance(geometry, 0x44aa88, 0),
        makeInstance(geometry, 0x8844aa, -30),
        makeInstance(geometry, 0xaa8844, 30),
    ];

    // var domEvents = new THREEx.domEvents(camera, renderer.domElement);
    // domEvents.addEventListener(spheres[0], 'click', event => {
    //     material.wireframe = true;
    // })

    const animate = (time) =>{
        time *= 0.001;  // convert time to seconds

        spheres.forEach((sphere, ndx) => {
            const speed = 1 + ndx * .1;
            const rot = time * speed;
            sphere.rotation.x = rot;
            sphere.rotation.y = rot;
        });  

        requestAnimationFrame(animate);
        controls.update()
        renderer.render(scene, camera);
    }


   

    

    
    animate()
}

renderToCanvas("3DWindow");
