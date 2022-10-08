
if (!(HTMLScriptElement.supports && HTMLScriptElement.supports('importmap'))) {
    console.log("Your browser does not support importmaps, please try another browser");
    throw new Error("Please run the application on a different browser");
}else{
    console.log("Your browser supports importmaps");
}


		
const importMap = {
    imports: {
        three: './modules/three/build/three.module.js',
        OrbitControls: './modules/three/examples/jsm/controls/OrbitControls.js',
        OBJLoader: "./modules/three/examples/jsm/loaders/OBJLoader.js"
    }
};

const im = document.createElement('script');
im.type = 'importmap';
im.textContent = JSON.stringify(importMap);
document.currentScript.after(im);