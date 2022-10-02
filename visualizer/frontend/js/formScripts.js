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


$(document).ready(function() {

    $('form').on('submit', function(event) {
        event.preventDefault(); 
    $.ajax({
        data: JSON.stringify({
            data_order: $('#iorder').val(),
            data_input: $('#sensors_content').val()
        }),
        headers:{
            "Content-Type" : "application/json",
        },
        type: 'POST',
        url: '../api/predict'
    })
    .done(function(data){
        console.log('Recevied Data: ', data);
        localStorage.setItem('needs_update', true);
        localStorage.setItem('models_data', JSON.stringify(data));
        if(data.error){
            $('#errorAlert').text(data.error).show();
            $('#successAlert').hide();
        }else{
            $('#successAlert').text(data.input_order).show();
            $('#errorAlert').hide();
        }
    });
    console.log("Function was called")
    
});
});