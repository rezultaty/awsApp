window.onload = function(){
    updateTextInput('scaleHInput',document.getElementById("scaleHRange").value);
    updateTextInput('scaleWInput',document.getElementById("scaleWRange").value)
    updateTextInput('rotateInput',document.getElementById("rotateRange").value)
}

function updateTextInput(input,val) {
  document.getElementById(input).innerHTML=val; 
}

$('#applyFiltersBtn').click(function(evt){
    var images = $('#filtersForm').find(".image");
    var json={};
    
    for (var i=0;i<images.length;i++){
        if (images[i].checked){
            console.log(images[i].value);
            json.key=images[i].parentNode.parentNode.getAttribute("value");
            json.filters={};
            if (document.getElementById('scale').checked){
                json.filters.scale={
                    scaleH: document.getElementById('scaleHRange').value,
                    scaleW: document.getElementById('scaleWRange').value
                }
            }
            if (document.getElementById('rotate').checked){
                json.filters.rotate={
                    angle: document.getElementById('rotateRange').value
                }
            }
            if (document.getElementById('blur').checked){
                json.filters.blur={
                    amount: document.getElementById('blurInput').value
                }
            }
            if (document.getElementById('mirror').checked){
                var x= document.getElementById('mirrorX').checked;
                var y= document.getElementById('mirrorY').checked;
                var axesString="";
                if (x){
                    axesString="x";
                }
                if (y){
                    axesString+="y";
                }
                json.filters.mirror={
                    axes: axesString
                }
            }
            var data = JSON.stringify(json);
            if (Object.keys(json.filters).length){
                $.post("http://localhost:3000/applyFilters",json);
            } else {
                console.log("No filters applied");
            }
        }
    }
});

$('.deleteBtn').click(function(evt, sender, c){
    var data = {};
        data.key=evt.target.parentNode.parentNode.getAttribute("value");
    
    $.post("http://localhost:3000/delete",data).done(function (res){
        console.log(res);
        location.reload(HTMLOptGroupElement);
    });  
});

$('.previewBtn').click(function(evt, sender, c){
    var data = {};
        data.key=evt.target.parentNode.parentNode.getAttribute("value");
    
    $.post("http://localhost:3000/preview",data).done(function (res){
//        var imageString = res.toString('base64');
        
        console.log(res);
        window.location.replace("data("+res+")");
        // TODO: odpal okno z podgladem
    });  
});