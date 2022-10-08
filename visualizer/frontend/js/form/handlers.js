const ObjectsCount = document.getElementById("objects_count"); 
const ObjectDataPanel = document.getElementById("object_rows"); 


function formSubmit(){

}


// Refactor to AJAX and Vanilla JS
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