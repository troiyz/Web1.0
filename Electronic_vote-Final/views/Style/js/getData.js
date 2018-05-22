const list_div = document.querySelector("#list_div");
var db = firebase.firestore();
var settings = {/* your settings... */ timestampsInSnapshots: true };
db.settings(settings);
db.collection("voters").get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
        list_div.innerHTML += `<li class="list-group-item"> PHONE NUMBER :  `+ doc.data().phoneNumber +`</li>`;
    })
})
