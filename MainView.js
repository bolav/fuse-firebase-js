var Observable = require("FuseJS/Observable");

if (typeof firebase === "undefined") {
  firebase = require('fuse-firebase');
  // Initialize Firebase
  var config = require('firebase-config');
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

var messages = Observable();

function saveMessage(data) {
  var val = data.val();
  messages.add(val);
  // this.displayMessage(data.key, val.name, val.text, val.photoUrl, val.imageUrl);
}

function getMessages() {
    console.log("getMessages")
    var messagesRef = firebase.database().ref('messages');
    console.log("messagesRef: " + messagesRef);
    messagesRef.off();
    console.log("Adding subscribers");
    messagesRef.limitToLast(12).on('child_added', saveMessage);
    messagesRef.limitToLast(12).on('child_changed', saveMessage);
    console.log("getMessages done");
}

function signedIn() {
    signedInStatusText.value = defaultStatusMessage;
	currentPage.value = {title: "Logged In Page", handle: "loggedInPage"};
    updateUserDetailsUI();
    getMessages();
    var storage = firebase.storage();
    var storageRef = storage.ref();
    var imageRef = storageRef.child('cabins/my_image.txt');
    imageRef.putString("Yeah yeah were the monkeys", 'raw').then(function (snapshot) {
        console.log("Uploaded raw fuse string!");
    }).catch( function (err) {
      console.log("Error " + err);
      console.log(JSON.stringify(err));
    });
}

function signedOut() {
	currentPage.value = mainPage;
    updateUserDetailsUI();
    messages.clear();
}

//---

var updateUserDetailsUI = function() {
    if (firebase.auth().currentUser) {
        userName.value = firebase.auth().currentUser.name;
        userEmail.value = firebase.auth().currentUser.email;
        userPhotoUrl.value = firebase.auth().currentUser.photoUrl;
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
    firebase.auth().createUserWithEmailAndPassword(email, password).then(function(user) {
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
    signOutNow: signOutNow,
    messages: messages
};
