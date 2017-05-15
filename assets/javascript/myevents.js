// Initialize Firebase
  var config = {
    apiKey: "AIzaSyChrgyWuMe56taDdK1C0XE_bwwbVMbYJaw",
    authDomain: "wuzzhap-52639.firebaseapp.com",
    databaseURL: "https://wuzzhap-52639.firebaseio.com",
    projectId: "wuzzhap-52639",
    storageBucket: "wuzzhap-52639.appspot.com",
    messagingSenderId: "771715545257"
  };
  firebase.initializeApp(config);

  firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
    var displayName = user.displayName;
    var email = user.email;
    var emailVerified = user.emailVerified;
    var photoURL = user.photoURL;
    var isAnonymous = user.isAnonymous;
    var uid = user.uid;
    var providerData = user.providerData;
    console.log('Login successful');
    // ...
  } else {
    // User is signed out.
    // ...
    console.log('user not logged in');
  }
});

  var database = firebase.database();

function createNewAccount(email, password) {
	firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
	  // Handle Errors here.
	  var errorCode = error.code;
	  var errorMessage = error.message;
	  // ...
	  console.log('account created');
	});
};

function userlogin(email, password) {
	firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
	  // Handle Errors here.
	  var errorCode = error.code;
	  var errorMessage = error.message;
	  // ...
	});
};

function userLogout() {
	firebase.auth().signOut().then(function() {
  // Sign-out successful.
  		console.log("signed out successful");
	}, function(error) {
	  // An error happened.
	  console.log("something went wrong with signout");
	});
};

//When Login Submitted Do...
$('#submitLogin').on("click", function() {
	event.preventDefault();
    var email = $('#username').val().trim();
    var password = ($('#password').val().trim());
    userlogin(String(email),String(password));
});

