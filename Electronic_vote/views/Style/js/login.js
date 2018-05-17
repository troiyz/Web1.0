

firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    // User is signed in.

    document.getElementById("user_div").style.display = "block";
    document.getElementById("login_div").style.display = "none";

    var user = firebase.auth().currentUser;

    if (user != null) {

      var email_id = user.email;
      document.getElementById("user_para").innerHTML = "Welcome Admin : " + email_id;

    }

  } else {
    // No user is signed in.

    document.getElementById("user_div").style.display = "none";
    document.getElementById("login_div").style.display = "block";

  }
});

function login() {

  var userEmail = document.getElementById("email_field").value;
  var userPass = document.getElementById("password_field").value;

  // As httpOnly cookies are to be used, do not persist any state client side.
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
  firebase.auth().signInWithEmailAndPassword(userEmail, userPass)
    .then(user => {
      localStorage.setItem('user', JSON.stringify(user));
      // Get the user's ID token as it is needed to exchange for a session cookie.
      return user.getIdToken().then(idToken => {
        localStorage.setItem('token', idToken);
        // Session login endpoint is queried and the session cookie is set.
        // CSRF protection should be taken into account.
        // ...
        console.log(idToken);

        // return ('/sessionLogin', idToken);
        return $.ajax({
          type: 'POST',
          url: '/sessionLogin',
          data: {
            idToken: idToken
          }
        })
          .then(() => { location.href = "/auth" })
      });
    })
    .catch(function (error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;

      window.alert("Error : " + errorMessage);

      // ...
    });

}

function logout() {
  firebase.auth().signOut();
}
