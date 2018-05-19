window.onload = function () {

  // Listening for auth state changes.
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      // User is signed in.
      var phoneNumber = user.phoneNumber;
    }
    updateSignInButtonUI();
    updateSignInFormUI();
    updateSignOutButtonUI();
    updateSignedInUserStatusUI();
    updateVerificationCodeFormUI();
  });
  // Event bindings.
  document.getElementById('sign-out-button').addEventListener('click', onSignOutClick);
  document.getElementById('phoneNumber').addEventListener('keyup', updateSignInButtonUI);
  document.getElementById('phoneNumber').addEventListener('change', updateSignInButtonUI);
  document.getElementById('verification-code').addEventListener('keyup', updateVerifyCodeButtonUI);
  document.getElementById('verification-code').addEventListener('change', updateVerifyCodeButtonUI);
  document.getElementById('verification-code-form').addEventListener('submit', onVerifyCodeSubmit);
  document.getElementById('cancel-verify-code-button').addEventListener('click', cancelVerification);
  // [START appVerifier]
  window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('sign-in-button', {
    'size': 'invisible',
    'callback': function (response) {
      // reCAPTCHA solved, allow signInWithPhoneNumber.
      onSignInSubmit();
    }
  });
  // [END appVerifier]
  recaptchaVerifier.render().then(function (widgetId) {
    window.recaptchaWidgetId = widgetId;
    updateSignInButtonUI();
  });
};
/**
* Function called when clicking the Login/Logout button.
*/
function onSignInSubmit() {
  if (isPhoneNumberValid()) {
    window.signingIn = true;
    updateSignInButtonUI();
    var phoneNumber = getPhoneNumberFromUserInput();
    var appVerifier = window.recaptchaVerifier;

    var db = firebase.firestore();
    const settings = {/* your settings... */ timestampsInSnapshots: true };
    db.settings(settings);

    var already = false;

    db.collection("voters").get().then(function (querySnapshot) {

      querySnapshot.forEach(function (doc) {
        if (doc.data().phoneNumber == phoneNumber) {
          alert("Success");
          already = true;
        }
      });
    })
      .then(function () {
        if (already) {
          firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
          firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
            .then(function (confirmationResult) {
              // SMS sent. Prompt user to type the code from the message, then sign the
              // user in with confirmationResult.confirm(code).
              window.confirmationResult = confirmationResult;
              window.signingIn = false;
              updateSignInButtonUI();
              updateVerificationCodeFormUI();
              updateVerifyCodeButtonUI();
              updateSignInFormUI();
            })
            .catch(function (error) {
              // Error; SMS not sent
              console.error('Error during signInWithPhoneNumber', error);
              window.alert('Error during signInWithPhoneNumber:\n\n'
                + error.code + '\n\n' + error.message);
              window.signingIn = false;
              updateSignInFormUI();
              updateSignInButtonUI();
            });
        }
        else {
          window.alert("Failed")
          window.location.reload();
        }
      });
  }
}


/**
* Function called when clicking the "Verify Code" button.
*/
function onVerifyCodeSubmit(e) {
  e.preventDefault();
  if (!!getCodeFromUserInput()) {
    window.verifyingCode = true;
    updateVerifyCodeButtonUI();
    var code = getCodeFromUserInput();

    confirmationResult.confirm(code).then(function (result) {
      // User signed in successfully.
      var user = result.user;
      window.verifyingCode = false;
      window.confirmationResult = null;
      console.log("1", phoneNumber);
      return user.getIdToken().then(idToken => {
        localStorage.setItem('token', idToken);
        // Session login endpoint is queried and the session cookie is set.
        // CSRF protection should be taken into account.
        // ...
        console.log("2.", idToken);

        // return ('/sessionLogin', idToken);
        return $.ajax({
          type: 'POST',
          url: '/sessionLogin',
          data: {
            idToken: idToken
          }
        })
          // .then(() => { location.href = "/auth" })
      });
      updateVerificationCodeFormUI();
    })
      // .then(user => {
      //   console.log("2", user)
      //   localStorage.setItem('user', JSON.stringify(user));
      //   console.log("3", user)
      //   // Get the user's ID token as it is needed to exchange for a session cookie.
      //   return user.getIdToken().then(idToken => {
      //     localStorage.setItem('token', idToken);
      //     // Session login endpoint is queried and the session cookie is set.
      //     // CSRF protection should be taken into account.
      //     // ...
      //     console.log("2.", idToken);

      //     // return ('/sessionLogin', idToken);
      //     return $.ajax({
      //       type: 'POST',
      //       url: '/sessionLogin',
      //       data: {
      //         idToken: idToken
      //       }
      //     })
      //       .then(() => { location.href = "/auth" })
      //   });
      // })
      .catch(function (error) {
        // User couldn't sign in (bad verification code?)
        console.error('Error while checking the verification code', error);
        window.alert('Error while checking the verification code:\n\n'
          + error.code + '\n\n' + error.message);
        window.verifyingCode = false;
        updateSignInButtonUI();
        updateVerifyCodeButtonUI();
      });
  }
}
/**
* Cancels the verification code input.
*/
function cancelVerification(e) {
  e.preventDefault();
  window.confirmationResult = null;
  updateVerificationCodeFormUI();
  updateSignInFormUI();
}
/**
* Signs out the user when the sign-out button is clicked.
*/
function onSignOutClick() {
  firebase.auth().signOut();
}
/**
* Reads the verification code from the user input.
*/
function getCodeFromUserInput() {
  return document.getElementById('verification-code').value;
}
/**
* Reads the phone number from the user input.
*/
function getPhoneNumberFromUserInput() {
  return document.getElementById('phoneNumber').value;
}
/**
* Returns true if the phone number is valid.
*/
function isPhoneNumberValid() {
  var pattern = /^\+[0-9\s\-\(\)]+$/;
  var phoneNumber = getPhoneNumberFromUserInput();
  return phoneNumber.search(pattern) !== -1;
}
/**
* Re-initializes the ReCaptacha widget.
*/
function resetReCaptcha() {
  if (typeof grecaptcha !== 'undefined'
    && typeof window.recaptchaWidgetId !== 'undefined') {
    grecaptcha.reset(window.recaptchaWidgetId);
  }
}
/**
* Updates the Sign-in button state depending on ReCAptcha and form values state.
*/
function updateSignInButtonUI() {
  document.getElementById('sign-in-button').disabled =
    !isPhoneNumberValid()
    || !!window.signingIn;
}
/**
* Updates the Verify-code button state depending on form values state.
*/
function updateVerifyCodeButtonUI() {
  document.getElementById('verify-code-button').disabled =
    !!window.verifyingCode
    || !getCodeFromUserInput();
}
/**
* Updates the state of the Sign-in form.
*/
function updateSignInFormUI() {
  if (firebase.auth().currentUser || window.confirmationResult) {
    document.getElementById('sign-in-form').style.display = 'none';
  } else {
    resetReCaptcha();
    document.getElementById('sign-in-form').style.display = 'block';
  }
}
/**
* Updates the state of the Verify code form.
*/
function updateVerificationCodeFormUI() {
  if (!firebase.auth().currentUser && window.confirmationResult) {
    document.getElementById('verification-code-form').style.display = 'block';
  } else {
    document.getElementById('verification-code-form').style.display = 'none';
  }
}
/**
* Updates the state of the Sign out button.
*/
function updateSignOutButtonUI() {
  if (firebase.auth().currentUser) {
    document.getElementById('sign-out-button').style.display = 'block';
  } else {
    document.getElementById('sign-out-button').style.display = 'none';
  }
}
/**
* Updates the Signed in user status panel.
*/
function updateSignedInUserStatusUI() {
  var user = firebase.auth().currentUser;
  if (user) {
    document.getElementById('sign-in-status').textContent = 'Signed in';
    // document.getElementById('account-details').textContent = JSON.stringify(user, null, '  ');
  } else {
    document.getElementById('sign-in-status').textContent = 'Done';
    // document.getElementById('account-details').textContent = 'null';
  }
}

function removeHidden() {
  document.getElementById("verification-code-form").removeAttribute("hidden");
}