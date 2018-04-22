function nameOfCandidate(){
    var inps = document.getElementsByName('mytext[]');
    for (var i = 0; i <inps.length; i++) {
        var nameCandidate=inps[i];
            alert("pname["+i+"].value="+nameCandidate.value);}
}

function getName(){
    var inputName = document.getElementsByName('inps[]');
    for(var i = 0; i< inputName.length; i++){
        var nameNo=inputName[i];
        
    }
}

