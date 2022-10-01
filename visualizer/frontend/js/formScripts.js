const ObjectsCount = document.getElementById("objects_count"); 
const ObjectDataPanel = document.getElementById("object_rows"); 


// ObjectsCount.addEventListener("change",(ev) => {renderObjectDataPanel();} );    

// renderObjectDataPanel();  

function renderObjectDataPanel(){
    ObjectDataPanel.innerHTML = "";
    for(let i = 1 ; i <= ObjectsCount.value ; i++){
        ObjectDataPanel.innerHTML += "<label for=\"object" + i + "\"> Object "+ i + ": </label>" + 
        "<input type='text' class='object_input' id=\"object" + i + "\" placeholder=\"Enter data based on the input order you specified above...\" />"+
        "<br>";
        if(i != ObjectsCount.value ) 
        ObjectDataPanel.innerHTML += "<br>";
    }
}