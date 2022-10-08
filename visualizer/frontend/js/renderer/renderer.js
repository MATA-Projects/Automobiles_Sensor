
import * as THREE from "three";



/**
 * Encapsulates a renderer functionality for intializing and handling m_objects and entities in three.js
 */
export class Renderer{
    renderer = {};              // ThreeJS Renderer 
    m_cameras = {"_counter":0}; 
    m_scenes = {"_counter":0};   
    m_objects = {"_counter":0};
    m_lights = {"_counter":0};

/// PUBLIC:
    constructor(canvas = null){
        if(canvas)
            this.renderer = new THREE.WebGLRenderer({ canvas:canvas });
        else
            this.renderer = new THREE.WebGLRenderer();    
    }

    // ========================= Camera Methods =========================
    addCamera(fov, ar, near, far){
        const id = (this.m_cameras["_counter"]++).toString();
        this.m_cameras[id] = new THREE.PerspectiveCamera(fov, ar, near, far);
        return (id, this.m_cameras[id]);
    }

    // ========================= Scene Methods =========================
    addScene(){
        const id = (this.m_scenes["_counter"]++).toString();
        this.m_scenes[id] =  new THREE.Scene();
        return (id, this.m_scenes[id]);
    }


    // ========================= Lights Methods =========================
    addDirLight(color, intensity, direction, position){
        const id = (this.m_lights["_counter"]++).toString();
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(position[0], position[1], position[2]);
        this.m_lights[id] = light;
        return (id, this.m_lights[id]);
    }

    attachLight(sceneid, lightid){
        this.m_scenes[sceneid].add(this.m_lights[lightid]);
    }

    unattachLight(sceneid, lightid){
        this.m_scenes[sceneid].remove(this.m_lights[lightid]);
    }


    // ========================= 3D Objects Methods =========================
    attachObject(sceneid, object3D){
        this.m_scenes[sceneid].add(object3D);
    }

    // ========================= Renderer Methods =========================
    render(sceneid, cameraid){
        this.renderer.render(this.m_scenes[sceneid], this.m_cameras[cameraid]);
    }
}