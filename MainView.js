var Observable = require("FuseJS/Observable");
var fchat = require('main.js');

if (typeof firebase === "undefined") {
  firebase = require('fuse-firebase');
  // Initialize Firebase
  var config = require('firebase-config');
  console.log("Enabled logging");
  firebase.database.enableLogging(true);
  firebase.initializeApp(config);
}

var defaultStatusMessage = "Status OK";
var signedInStatusText = Observable(defaultStatusMessage);
var lobbyStatusText = Observable(defaultStatusMessage);

var userName = Observable("-");
var userEmail = Observable("-");
var userPhotoUrl = Observable("-");

//---

var mainPage = {title: "Lobby", handle: "lobbyPage"};

var currentPage = Observable(mainPage);

var currentPageHandle = currentPage.map(function(x) {
	return x.handle;
});

var currentPageTitle = currentPage.map(function(x) {
	return x.title;
});

function signedIn() {
    signedInStatusText.value = defaultStatusMessage;
	currentPage.value = {title: "Logged In Page", handle: "loggedInPage"};
    updateUserDetailsUI();
}

function signedOut() {
	currentPage.value = mainPage;
    updateUserDetailsUI();
}

//---

var updateUserDetailsUI = function() {
    console.log('updateUserDetailsUI');
    console.log(firebase.auth().currentUser);
    console.log(JSON.stringify(firebase.auth().currentUser));
    if (FirebaseUser.isSignedIn) {
        console.log(firebase.auth.currentUser);
        userName.value = firebase.auth.currentUser.name;
        userEmail.value = firebase.auth.currentUser.email;
        userPhotoUrl.value = firebase.auth.currentUser.photoUrl;
    } else {
        userName.value = "-";
        userEmail.value = "-";
        userPhotoUrl.value = "-";
    }
};

var onError = function(errorMsg, errorCode) {
    console.log("ERROR(" + errorCode + "): " + errorMsg);
    lobbyStatusText.value = "Error: " + errorMsg;
};

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    signedIn();
  } else {
    // No user is signed in.
    signedOut();
  }
});

//---

var userEmailInput = Observable("");
var userPasswordInput = Observable("");

var createUser = function() {
 	var email = userEmailInput.value;
 	var password = userPasswordInput.value;
    firebase.auth().createWithEmailAndPassword(email, password).then(function(user) {
        signedIn();
    }).catch(function(e) {
        console.log("Signup failed: " + e);
        onError(e, -1);
    });
};

var signInWithEmail = function() {
 	var email = userEmailInput.value;
 	var password = userPasswordInput.value;
    firebase.auth().signInWithEmailAndPassword(email, password).then(function(user) {
        signedIn();
    }).catch(function(e) {
        console.log("SignIn failed: " + e);
        onError(e, -1);
    });
};

//---

var reauthenticate = function() {
    console.log("Not implemeneted");
};

var signOutNow = function() {
    firebase.auth().signOut().then(function() {
      console.log('Signed Out');
    }, function(error) {
      console.log('Sign Out Error' +  error);
      onError(error, -1);
    });
};


module.exports = {
	currentPage: currentPage,
	currentPageHandle: currentPageHandle,
	currentPageTitle: currentPageTitle,
    lobbyStatusText: lobbyStatusText,

	userEmailInput: userEmailInput,
	userPasswordInput: userPasswordInput,
	createUser: createUser,
	signInWithEmail: signInWithEmail,

    signedInStatusText: signedInStatusText,
    userName: userName,
    userEmail: userEmail,
    userPhotoUrl: userPhotoUrl,
    reauthenticate: reauthenticate,
    signOutNow: signOutNow
};
