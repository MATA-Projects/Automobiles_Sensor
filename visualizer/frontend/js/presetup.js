
if (!(HTMLScriptElement.supports && HTMLScriptElement.supports('importmap'))) {
    console.log("Your browser does not support importmaps, please try another browser");
    throw new Error("Please run the application on a different browser");
}else{
    console.log("Your browser supports importmaps");
}

const im = document.createElement('script');
im.type = 'importmap';
im.textContent = JSON.stringify(importMap);
document.currentScript.after(im);