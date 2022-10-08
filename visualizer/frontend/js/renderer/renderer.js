
import * as THREE from "three";



/**
 * Encapsulates a renderer functionality for intializing and handling m_objects 
 *  and entities in three.js. 
 */
export class Renderer{
/// PRIVATE:
    m_renderer = {};              // ThreeJS Renderer 
    m_cameras = {"_counter":0}; 
    m_scenes = {"_counter":0};   
    m_objects = {"_counter":0};
    m_lights = {"_counter":0};

/// PUBLIC:
    constructor(canvas = null, background){
        if(canvas)
            this.m_renderer = new THREE.WebGLRenderer({ canvas:canvas });
        else
            this.m_renderer = new THREE.WebGLRenderer();

        this.m_renderer.setClearColor(background);
    }

    // ========================= Camera Methods =========================
    addCamera(fov, ar, near, far, position, target){
        const id = (this.m_cameras["_counter"]++).toString();
        this.m_cameras[id] = new THREE.PerspectiveCamera(fov, ar, near, far);
        this.m_cameras[id].position.x = position[0];
        this.m_cameras[id].position.y = position[1];
        this.m_cameras[id].position.z = position[2];
        this.m_cameras[id].lookAt(target[0], target[1], target[2]);
        return id;
    }

    getCamera(cameraid){return this.m_cameras[cameraid];}

    setCameraAspectRatio(cameraid, aspectRatio){
        this.m_cameras[cameraid].aspect = aspectRatio;
        this.m_cameras[cameraid].updateProjectionMatrix();
    }

    updateAspectRatio(cameraid){

        const canvas = this.m_renderer.domElement;
        const aspect = canvas.clientWidth / canvas.clientHeight;
        this.setCameraAspectRatio(cameraid, aspect);
    }

    // ========================= Scene Methods =========================
    addScene(){
        const id = (this.m_scenes["_counter"]++).toString();
        this.m_scenes[id] =  new THREE.Scene();
        return id;
    }

    clearScene(sceneid){
        console.log(sceneid);
        this.m_scenes[sceneid].clear();
    }

    // ========================= Lights Methods =========================
    addDirLight(color, intensity, direction, position){
        const id = (this.m_lights["_counter"]++).toString();
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(position[0], position[1], position[2]);
        this.m_lights[id] = light;
        return id;
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
        this.m_renderer.render(this.m_scenes[sceneid], this.m_cameras[cameraid]);
    }

    getRenderer(){return this.m_renderer;}
}