const list_div = document.querySelector("#list_div");
var db = firebase.firestore();
var settings = {/* your settings... */ timestampsInSnapshots: true };
db.settings(settings);
db.collection("voters").get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
        list_div.innerHTML += "<div class='list-item'><h5>" + doc.data().phoneNumber +"</h5>";
    })
})
