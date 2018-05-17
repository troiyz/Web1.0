const list_div = document.querySelector("#list_div");
var db = firebase.firestore();
db.collection("voters").get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
        list_div.innerHTML += "<div class='list-item'><h3>" + doc.data().phoneNumber +"</h3>";
    })
})
