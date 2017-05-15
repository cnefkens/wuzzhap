/// Initialize Firebase
var config = {
  apiKey: "AIzaSyChrgyWuMe56taDdK1C0XE_bwwbVMbYJaw",
  authDomain: "wuzzhap-52639.firebaseapp.com",
  databaseURL: "https://wuzzhap-52639.firebaseio.com",
  projectId: "wuzzhap-52639",
  storageBucket: "wuzzhap-52639.appspot.com",
  messagingSenderId: "771715545257"
};

firebase.initializeApp(config);

//Store Firebase Data in Global Variables 
var database = firebase.database();
var uid;
var displayName;
var email; 
var emailVerified; 
var photoURL; 
var isAnonymous;
var providerData;
var userCats = [];

function animations(){
  $('#mainSlider').hide();
  $("#mainSlider").show('fade',2500);
};
//function to initiate all important listeners
function initListeners(){
  animations();
  firebase.auth().onAuthStateChanged(function(user) {
   // If User is signed in.
    if (user) {
      //Update Global Vars
      displayName = user.displayName;
      email = user.email;
      emailVerified = user.emailVerified;
      photoURL = user.photoURL;
      isAnonymous = user.isAnonymous;
      uid = user.uid;
      providerData = user.providerData;
      
      if(window.location.pathname == '/wazzapp/' && displayName != null) {
        window.location.pathname = "/wazzapp/dashboard.html";
      };
      //Load user event data
      loadUserEvents();
      //Change Menu Bar to show welcome user and add signout option
      $('#mainMenu').html('<li> <a class="page-scroll normalText" id="welcomeName"> Welcome, ' + displayName + '</a></li><li> <a class="page-scroll normalText" href="dashboard.html">Dashboard</a></li><li> <a class="page-scroll normalText" href="myevents.html">Saved Events</a></li><li> <a class="page-scroll normalText" href="search.html">Search Events</a></li><li> <a class="page-scroll normalText" id="authStatus">Sign Out</a></li>');
      //Closes sign in modol
      $('.close').click();
      //If authStatus has an on click function turn it off first
      $('#authStatus').off('click');
      //Then.. turn on authStatus so only one instance is running
      $('#authStatus').on("click", function(event) {
        //prevent submit defaults
        event.preventDefault();
        //run user logout function
        userLogout();
      });
      //check if user has submitted profile information 
      database.ref('/users/' + uid + '/profile').once('value',function(snap){
        //if user profile information total children less than 7...
        if(snap.numChildren() < 7) {
          //change model attributes to prevent user bypass
          $('#profileSetup').attr({
            'data-keyboard' : 'false',
            'data-backdrop' : 'static',
            'tabindex' : '-1'
          });

          //run profile update function to load update profile modol
          updateProfile();
        } else {
          $('#userStateDash').val(snap.val().state);
          $('#userCityDash').val(snap.val().city);
          $('#userZipDash').val(snap.val().zipcode);
          $('#userSexDash').val(snap.val().sex);
          $('#userAgeDash').val(snap.val().age);
          for(var i = 0; i < snap.val().categories.length; i++){
            $('input[value="' + snap.val().categories[i] + '"]').prop('checked', true);
            userCats.push(snap.val().categories[i]);
          }
          getRecommended(snap.val().state,"","",userCats[pickRandomCategory()]);
        };
      });

    //if user not logged in...
    } else {
      //turn off sign-out listener
      $('#authStatus').off('click');  
      //remove welcome user from menu
      $('#welcomeName').remove();
      //revert sign up menu tab back to normal
      $('#authStatus').html('<li><a class="page-scroll" href="#signup" id="authStatus">Sign Up</a></li>');
      //if not logged in kick out to home page
      if(window.location.pathname != '/wazzapp/') {
        window.location.pathname = "/wazzapp/";
      };
    };
  });
  //listen for click on user login model to submit
  $('#submitLogin').on("click", function(event) {
    //prevent default event on log in from submit 
    event.preventDefault();
    //store temp email and password vars and trim the values of blank spaces
    var email = $('#email').val().trim();
    var password = ($('#password').val().trim());
    //call userlogin function with email and password var parameters as strings
    userlogin(String(email),String(password));
    //clear the login fields
    $('#email').val('');
    $('#password').val('');
  });
  //listen for click on sign up model to submit
  $('#createNewUser').on("click", function(event) {
    //prevent default events on submit
    event.preventDefault();
    //store temp vars for email password and username and trim the values of blank spaces
      var email = $('#newEmail').val().trim();
      var password = $('#newPassword').val().trim();
      var username = $('#newUserName').val().trim();
      //call createNewAccount function and pass the vars as parameters converted to strings
      createNewAccount(String(email),String(password),String(username));
  });
};

//Function to create a new user account that takes 3 parameters
function createNewAccount(email, password , username) {
  //run firebase auth and create account using email and password parameter..
  firebase.auth().createUserWithEmailAndPassword(email, password).then(function(user) {
    //once account created obtain then pass on the username parameter into the display name..
    return user.updateProfile({
        displayName : username
    })
  }).then(function(){
    // then Refresh page to update displayed name if displayName is showing null...
    if(displayName == null) {
      //run refreshPage function
      refreshPage();
    };
  }).catch(function(error) {
    //If any errors are pushed back store them in temp vars
    var errorCode = error.code;
    var errorMessage = error.message;
    // then push the error message onto the bottom of create account modol
    $('#createUserErrors').css('display','block');
    $('#createUserErrors').text(errorMessage);
    //show message for 2 seconds and then remove it
    setTimeout(function(){
      $('#createUserErrors').css('display','none');
      $('#createUserErrors').text('');
    }, 3000);
  });
};

//Function to update user profile information
function updateProfile() {
  //load update profile model by clicking the invisible button
  $('#profileSetup').click();
  //auto fill email field
  $('#userEmail').attr('value', email);
  //auto fill username field
  $('#username').attr('value', displayName);
  //turn off saveProfile click listener incase it is already running
  $('#saveProfile').off('click');
  //turn on listener to ensure only one instance is running
  $('#saveProfile').on('click', function(){
    //run a loop function using map to look for input with class checkbox and that are checked
    
    var checkedCategories = $('input:checkbox:checked').map(function() {
      //then return the value of each checkbox to the checked categories array
      return this.value;
    }).get(); 
    //filter to prevent data from passing to DB as null by checking if the value of each field has content
    if( $('#userCity').val().length == 0 || $('#userState').val().length == 0 || $('#userZip').val().length == 0 || $('#userAge').val().length == 0 || $('#userSex').val().length == 0) {
      //if not do not pass data to db simply return
      return;
    //if data is found in all fields push to DB in user profile 
    } else {
      resetUserCats();
      //user profile database location to set data to by grabbing all values of each field
      database.ref('/users/' + uid + '/profile').set({
          username: displayName,
          email: email,
          city: $('#userCity').val().trim(),
          state: $('#userState').val().trim(),
          zipcode: $('#userZip').val().trim(),
          categories: checkedCategories,
          age: $('#userAge').val().trim(),
          sex: $('#userSex').val().trim()
      });
    };
  });
};

function pushUpdates() {
  
  var checkedCategories = $('input[name="dash"]:checkbox:checked').map(function() {
      //then return the value of each checkbox to the checked categories array
      return this.value;
    }).get(); 
  if( $('#userCityDash').val().length == 0 || $('#userStateDash').val().length == 0 || $('#userZipDash').val().length == 0 || $('#userAgeDash').val().length == 0 || $('#userSexDash').val().length == 0) {
      //if not do not pass data to db simply return
      return;
    //if data is found in all fields push to DB in user profile 
    } else {
      resetUserCats();
      //user profile database location to set data to by grabbing all values of each field
      database.ref('/users/' + uid + '/profile').set({
          username: displayName,
          email: email,
          city: $('#userCityDash').val().trim(),
          state: $('#userStateDash').val().trim(),
          zipcode: $('#userZipDash').val().trim(),
          categories: checkedCategories,
          age: $('#userAgeDash').val().trim(),
          sex: $('#userSexDash').val().trim()
      });
      refreshPage();
    };
}

function resetUserCats(){
  database.ref('/users/' + uid + '/profile').update({
          categories: ''
      });
};
//function to allow users to login that takes 2 parameters email and password
function userlogin(email, password) {
  //use google auth to verify that the parameters are correct and if so store a cookie to keep them logged in
  firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
    // if any errors store them as temp vars
    var errorCode = error.code;
    var errorMessage = error.message;
    // display the errors at the bottom of the user login model.
    $('#authErrors').css('display','block');
    $('#authErrors').text(errorMessage);
    //remove the error message after 2 seconds
    setTimeout(function(){
      $('#authErrors').css('display','none');
      $('#authErrors').text('');
    }, 3000);
  });
};

//function to log the user out
function userLogout() {
  //connect to google auth and request the cookie be removed...
  firebase.auth().signOut().then(function() {
      //after successful signout refresh the page
      refreshPage();
  }, function(error) {
    //temp store the error information in vars
    var errorCode = error.code;
    var errorMessage = error.message;
    // if any errors console log the error message if signout fails
  });
};

//function to refresh the page
function refreshPage() {
  //refresh the current page
  location.reload();
};

//function to make API request to ticket master
function getRecommended(state,city,zip,category) {
  //Creates the cutom URL to make the API Call to ticketmaster
  customURL = 'https://app.ticketmaster.com/discovery/v2/events.json' + '?' + $.param({
        'stateCode' : state,
        'city' : city,
        'postalCode' : zip,
        'classificationName' : category,
        'size' : 12,
        'apikey': "3k1w9taAfz9gWkcTaaWHhNxvB2mroydh"
      }).trim();
//Makes the API call to ticketmaster
  $.ajax({
    url: customURL,
    method: 'GET'
  }).done(function(response){
    //When done add attributes and append the html to the slider images.
    totalResults = response._embedded.events.length;
    for(var i = 0; i < totalResults; i++ ){
      $('#'+ (i+1)).attr('src',response._embedded.events[i].images[0].url);
      $('#link'+ (i+1)).attr('href',response._embedded.events[i].url);
      $('#title'+ (i+1)).text(response._embedded.events[i].name);
      $('#info'+ (i+1)).append('<p class="infotext"> Date: '+ response._embedded.events[i].dates.start.localDate + '</p>');
      $('#info'+ (i+1)).append('<p class="infotext"> Prices: $'+ response._embedded.events[i].priceRanges[0].min + ' - $' + response._embedded.events[i].priceRanges[0].max + '</p>');
    };
    setInterval(function(){
      $('#nextSlide').click()
    }, 5000);
  });
};

function pickRandomCategory() {
  var checked
  var checkedCategories = $('input[name="dash"]:checkbox:checked').map(function() {
      //then return the value of each checkbox to the checked categories array
      return this.value;
    }).get();  
  var catlength = checkedCategories.length;
  randomNum = Math.ceil(Math.random() * catlength);
  return randomNum;
};
//launch initListeners function on load
initListeners();



/*Chuck's javascript start==================================================================================*/

var button="";

//Function to save new event. 
var saveNewEvent =function () { 
  //Clear event modal input error message 
    $("#modalInputErrors").text("");
  //Set validator variables that validate all date and time fields
    if (moment($("#modalStartDt").val().trim()).isValid()) {
      var validStartDt=true;
      }
    else {
    var validStartDt=false;
      }
  
    if ($("#modalEndDt").val().trim() =='' || moment($("#modalEndDt").val().trim()).isValid()) {
          var validEndDt=true;
      }
    else 
        {
           var validEndDt=false;
        };

    if (validateTime($("#modalStartTime").val().trim()) == true) {
        var validStartTime=true;
      }
    else {
        var validStartTime=false;
      }

    if ($("#modalEndTime").val().trim() == '' || validateTime($("#modalEndTime").val().trim()) == true) {
          var validEndTime=true;
      }
    else {
          var validEndTime=false;
      }
  
     if ($("#modalTktSaleStartDt").val().trim() =='' || moment($("#modalTktSaleStartDt").val().trim()).isValid()) {
          var validTktSaleStartDt=true;
        }
      else 
        {
           var validTktSaleStartDt=false;
        };

      if ($("#modalTktSaleEndDt").val().trim() =='' || moment($("#modalTktSaleEndDt").val().trim()).isValid()) {
          var validTktSaleEndDt=true;
        }
      else 
        {
           var validTktSaleEndDt=false;
        };

      //Check to see if all required fields are populated and date and time fields are valid
      if ($("#modalEventName").val().trim()!=='' && validStartDt==true && validEndDt == true 
        && validStartTime == true && validEndTime == true && validTktSaleStartDt == true && validTktSaleEndDt == true  ) {
   
          //Set variables based on modal form to create new user event
          var eventName=$("#modalEventName").val().trim();
          var category=$("#modalCategory").val().trim();
          var genre=$("#modalGenre").val().trim();
          var venue=$("#modalVenue").val().trim();
          var venueAddress=$("#modalVenueAddress").val().trim();
          var venueCity=$("#modalVenueCity").val().trim();
          var venueState=$("#modalVenueState").val().trim();
          var venueZip=$("#modalVenueZip").val().trim();
          var attraction=$("#modalAttraction").val().trim();
          var startDt=moment($("#modalStartDt").val().trim()).format("YYYY-MM-DD");
    
          if($("#modalEndDt").val().trim()!=='') {
              var endDt=moment($("#modalEndDt").val().trim()).format("YYYY-MM-DD");
            }
          else 
            {
            var endDt='';
            }

          var startTime=$("#modalStartTime").val().trim();
   
          var endTime=$("#modalEndTime").val().trim();  

          if ($("#modalTktSaleStartDt").val().trim()!=='') {
            var tktSaleStartDt=moment($("#modalTktSaleStartDt").val().trim()).format("YYYY-MM-DD");
            }
          else
            {
          var tktSaleStartDt='';
            }
    
          if($("#modalTktSaleEndDt").val().trim()!=='') {
            var tktSaleEndDt=moment($("#modalTktSaleEndDt").val().trim()).format("YYYY-MM-DD");
            }
          else {
            var tktSaleEndDt="";
            }

          var tktPriceMin=$("#modalTktPriceMin").val().trim();
          var tktPriceMax=$("#modalTktPriceMax").val().trim();
          var eventUrl=$("#modalEventUrl").val().trim();
          var imageUrl=$("#modalImageUrl").val().trim();
          var startDtm=moment($("#modalStartDt").val().trim() + ' ' + $("#modalStartTime").val().trim()).unix();
          var customInd=1
          var privateInd=$("#modalPrivateInd").val().trim();
          //Firebase push to create new user event
          database.ref('/users/' + uid + '/events').push({
     
            event_name:  eventName, 
            category:  category,
            genre:  genre,
            venue:  venue,
            venue_address: venueAddress, 
            venue_city:  venueCity,
            venue_state: venueState,
            venue_zip: venueZip,
            attraction: attraction,
            start_dt:  startDt,
            end_dt: endDt,
            start_time:  startTime,
            end_time: endTime,
            tkt_sale_start_dt: tktSaleStartDt,
            tkt_sale_end_dt: tktSaleEndDt,
            tkt_price_min: tktPriceMin,
            tkt_price_max: tktPriceMax,
            event_url: eventUrl,
            image_url: imageUrl,
            start_dtm: startDtm,
            custom_ind: customInd,
            private_ind: privateInd
          })
        //Reload page after event is created
        refreshPage();
      } 
    else
      {
        $("#modalInputErrors").text("Required fields are blank and/or date/time values are invalid");
        $("#modalInputErrors").css('display','block');
      }
   };

  //Function to save edits to Event from event detail modal form. Not used yet on events page
  var saveEventEdit =function () { 
     //Clear Input Error message
     $("#modalInputErrors").text("");

    //set validator variables on all date & time fields
    if (moment($("#modalStartDt").val().trim()).isValid()) {
      var validStartDt=true;
      }
    else {
    var validStartDt=false;
      }
  
      if ($("#modalEndDt").val().trim() =='' || moment($("#modalEndDt").val().trim()).isValid()) {
          var validEndDt=true;
        }
      else 
        {
           var validEndDt=false;
        };

      if (validateTime($("#modalStartTime").val().trim()) == true) {
        var validStartTime=true;
        }
      else {
        var validStartTime=false;
        }

      if ($("#modalEndTime").val().trim() == '' || validateTime($("#modalEndTime").val().trim()) == true) {
          var validEndTime=true;
        }
      else {
          var validEndTime=false;
        }
  
      if ($("#modalTktSaleStartDt").val().trim() =='' || moment($("#modalTktSaleStartDt").val().trim()).isValid()) {
          var validTktSaleStartDt=true;
        }
      else 
        {
           var validTktSaleStartDt=false;
        };

      if ($("#modalTktSaleEndDt").val().trim() =='' || moment($("#modalTktSaleEndDt").val().trim()).isValid()) {
          var validTktSaleEndDt=true;
        }
      else 
        {
           var validTktSaleEndDt=false;
        };

    //Check if required fields are populated and all date & time fields are valid
      if ($("#modalEventName").val().trim()!=='' && validStartDt==true && validEndDt == true 
          && validStartTime == true && validEndTime == true && validTktSaleStartDt == true && validTktSaleEndDt == true  ) {     
    //set variables to update user event based on modal event form
        var eventKey=$("#modalEventKey").val().trim();
        var eventName=$("#modalEventName").val().trim();
        var category=$("#modalCategory").val().trim();
        var genre=$("#modalGenre").val().trim();
        var venue=$("#modalVenue").val().trim();
        var venueAddress=$("#modalVenueAddress").val().trim();
        var venueCity=$("#modalVenueCity").val().trim();
        var venueState=$("#modalVenueState").val().trim();
        var venueZip=$("#modalVenueZip").val().trim();
        var attraction=$("#modalAttraction").val().trim();
        var startDt=moment($("#modalStartDt").val().trim()).format("YYYY-MM-DD");
    
        if($("#modalEndDt").val().trim()!=='') {
            var endDt=moment($("#modalEndDt").val().trim()).format("YYYY-MM-DD");
          }
        else 
          {
            var endDt='';
          }

        var startTime=$("#modalStartTime").val().trim();
   
        var endTime=$("#modalEndTime").val().trim();  

        if ($("#modalTktSaleStartDt").val().trim()!=='') {
          var tktSaleStartDt=moment($("#modalTktSaleStartDt").val().trim()).format("YYYY-MM-DD");
          }
        else
          {
          var tktSaleStartDt='';
          }
    
        if($("#modalTktSaleEndDt").val().trim()!=='') {
        var tktSaleEndDt=moment($("#modalTktSaleEndDt").val().trim()).format("YYYY-MM-DD");
          }
        else {
        
        var tktSaleEndDt="";
        }

        var tktPriceMin=$("#modalTktPriceMin").val().trim();
        var tktPriceMax=$("#modalTktPriceMax").val().trim();
        var eventUrl=$("#modalEventUrl").val().trim();
        var imageUrl=$("#modalImageUrl").val().trim();
        var startDtm=moment($("#modalStartDt").val().trim() + ' ' + $("#modalStartTime").val().trim()).unix();
        var customInd=$("#modalCustomInd").val().trim();
        var privateInd=$("#modalPrivateInd").val().trim();

        database.ref('/users/' + uid + '/events/'+eventKey).set({
          event_name:  eventName, 
          category:  category,
          genre:  genre,
          venue:  venue, 
          venue_address: venueAddress,
          venue_city:  venueCity,
          venue_state: venueState,
          venue_zip: venueZip,
          attraction: attraction,
          start_dt:  startDt,
          end_dt: endDt,
          start_time:  startTime,
          end_time:  endTime,
          tkt_sale_start_dt: tktSaleStartDt,
          tkt_sale_end_dt: tktSaleEndDt,
          tkt_price_min: tktPriceMin,
          tkt_price_max: tktPriceMax,
          event_url: eventUrl,
          image_url: imageUrl,
          start_dtm: startDtm,
          custom_ind: customInd,
          private_ind: privateInd
        })
        //Refresh page after set is complete
        refreshPage();
          }
      else
        {
          $("#modalInputErrors").text("Required fields are blank and/or date/time values are invalid");
          $("#modalInputErrors").css('display','block');
        }
   };
   
        
//Listener that will iterate through user/events child on load and build My Events table.

 function loadUserEvents() {
 database.ref("/users/" + uid + "/events").orderByChild("start_dtm").on("child_added", function(childSnapshot) {

  button="";

  //Build events table body based on user's events user/uid/events
      $("#eventTable").append("<tr><td class='col-event-name'>"+ childSnapshot.val().event_name +"</td>"
        + "<td class='col-category'>" + childSnapshot.val().category + "</td>"
        +"<td class='col-genre'>" + childSnapshot.val().genre + "</td>"
        + "<td class='col-venue'>" + childSnapshot.val().venue + "</td>"
        + "<td class='col-venue-address'>" + childSnapshot.val().venue_address + "</td>"
        + "<td class='col-venue-city'>" + childSnapshot.val().venue_city + "</td>"
        + "<td class='col-venue-state'>" + childSnapshot.val().venue_state + "</td>"
        + "<td class='col-venue-zip'>" + childSnapshot.val().venue_zip + "</td>"
        + "<td class='col-attraction'>" + childSnapshot.val().attraction + "</td>"
        + "<td class='col-start-dt'>" + childSnapshot.val().start_dt + "</td>"
        + "<td class='col-end-dt'>" + childSnapshot.val().end_dt + "</td>"
        + "<td class='col-start-time'>" + childSnapshot.val().start_time + "</td>"
        + "<td class='col-end-time'>" + childSnapshot.val().end_time + "</td>"
        + "<td class='col-tkt-sale-start-dt'>" + childSnapshot.val().tkt_sale_start_dt + "</td>"
        + "<td class='col-tkt-sale-end-dt'>" + childSnapshot.val().tkt_sale_end_dt + "</td>"
        + "<td class='col-tkt-price-min'>" + childSnapshot.val().tkt_price_min + "</td>"
        + "<td class='col-tkt-price-max'>" + childSnapshot.val().tkt_price_max + "</td>"
        + "<td class='col-event-url'><a href='" + childSnapshot.val().event_url + "' target='_blank' style='color:blue'>" + childSnapshot.val().event_url + "</a></td>"
        + "<td class='col-image-url'><a href='" + childSnapshot.val().image_url + "' target='_blank' style='color:blue'>" + childSnapshot.val().image_url + "</a></td>"
        + "<td class='col-start-dtm'>" + childSnapshot.val().start_dtm + "</td>"
        + "<td class=col-custom-ind'>" + childSnapshot.val().custom_ind + "</td>"
        + "<td class=col-private-ind'>" + childSnapshot.val().private_ind + "</td>"
        +"<td class='td-event-key'>" +  childSnapshot.key + "</td>"
        +"<td class='td-user-key'>" +  uid + "</td>"
        +"<td class='col-remove-button'><span><button class='btn btn-default btn-xs remove-button' type='button' aria-label='Delete Row'><span class='glyphicon glyphicon-remove'></span></span></button></td>"
         +"<td class='col-detail-button'><span><button class='btn btn-default btn-xs detail-button' type='button' data-toggle='modal' data-target='#modalDetailForm' aria-label='View Detail'><span class='glyphicon glyphicon-modal-window'></span></span></button></td>" 
        +"<td class='col-edit-button'><span><button class='btn btn-default btn-xs edit-button' type='button' data-toggle='modal' data-target='#modalDetailForm' aria-label='Edit Row'><span class='glyphicon glyphicon-pencil'></span></span></button></td>"
        + " </tr>");
        
      //Add remove button event on creation of table body.
      $(".remove-button").click(deleteEvent);

      
      //When event detail modal form appears, call function to populate modal event detail form
      $("#modalDetailForm").on("show.bs.modal",populateDetailForm);


    // Handle the errors
    }, function(errorObject) {
    });
};

//Function to delete Event from user/uid/events
var deleteEvent=function(event) {
   event.stopPropagation();
  var eventId=$(this).closest('tr').children('td.td-event-key').text();

  database.ref("/users/" + uid + '/events/' + eventId).remove();
  refreshPage();
};

//Populate modal detail form with data from My Events table row.
var populateDetailForm=function(event) {
   // event.preventDefault();
   $(this).hide().show();
  button=$(event.relatedTarget);

  var currEventKey=$(event.relatedTarget).closest('tr').children('td.td-event-key').text();
  var userId=$(event.relatedTarget).closest('tr').children('td.td-user-key').text();
  var eventName=$(event.relatedTarget).closest('tr').children('td.col-event-name').text();
  var category=$(event.relatedTarget).closest('tr').children('td.col-category').text();
  var genre=$(event.relatedTarget).closest('tr').children('td.col-genre').text();
  var venue=$(event.relatedTarget).closest('tr').children('td.col-venue').text();
  var venueAddress=$(event.relatedTarget).closest('tr').children('td.col-venue-address').text();
  var venueCity=$(event.relatedTarget).closest('tr').children('td.col-venue-city').text();
  var venueState=$(event.relatedTarget).closest('tr').children('td.col-venue-state').text();
  var venueZip=$(event.relatedTarget).closest('tr').children('td.col-venue-zip').text();
  var attraction=$(event.relatedTarget).closest('tr').children('td.col-attraction').text();
  var startDt=$(event.relatedTarget).closest('tr').children('td.col-start-dt').text();
  var endDt=$(event.relatedTarget).closest('tr').children('td.col-end-dt').text();
  var startTime=$(event.relatedTarget).closest('tr').children('td.col-start-time').text();
  var endTime=$(event.relatedTarget).closest('tr').children('td.col-end-time').text();
  var tktSaleStartDt=$(event.relatedTarget).closest('tr').children('td.col-tkt-sale-start-dt').text();
  var tktSaleEndDt=$(event.relatedTarget).closest('tr').children('td.col-tkt-sale-end-dt').text();
  var tktPriceMin=$(event.relatedTarget).closest('tr').children('td.col-tkt-price-min').text();
  var tktPriceMax=$(event.relatedTarget).closest('tr').children('td.col-tkt-price-max').text();
  var eventUrl=$(event.relatedTarget).closest('tr').children('td.col-event-url').text();
  var imageUrl=$(event.relatedTarget).closest('tr').children('td.col-image-url').text();
  var customInd=$(event.relatedTarget).closest('tr').children('td.col-custom-ind').text();
  var privateInd=$(event.relatedTarget).closest('tr').children('td.col-private-ind').text();
  var startDtm=$(event.relatedTarget).closest('tr').children('td.col-start-dtm').text();


    $("#modalEventKey").val(currEventKey);
    $("#modalUserKey").val(userId);
    $("#modalEventName").val(eventName);
    $("#modalCategory").val(category);
    $("#modalGenre").val(genre);
    $("#modalVenue").val(venue);
    $("#modalVenueAddress").val(venueAddress);
    $("#modalVenueCity").val(venueCity);
    $("#modalVenueState").val(venueState);
    $("#modalVenueZip").val(venueZip);
    $("#modalAttraction").val(attraction);
    $("#modalStartDt").val(startDt);
    $("#modalEndDt").val(endDt);
    $("#modalStartTime").val(startTime);
    $("#modalEndTime").val(endTime);
    $("#modalTktSaleStartDt").val(tktSaleStartDt);
    $("#modalTktSaleEndDt").val(tktSaleEndDt);
    $("#modalTktPriceMin").val(tktPriceMin);
    $("#modalTktPriceMax").val(tktPriceMax);
    $("#modalEventUrl").val(eventUrl);
    $("#modalImageUrl").val(imageUrl);
    $("#modalStartDtm").val(startDtm);
    $("#modalCustomInd").val(customInd);
    $("#modalPrivateInd").val(privateInd);

    $("#modalEventKey").attr('data-original',currEventKey);
    $("#modalUserKey").attr('data-original',userId);
    $("#modalEventName").attr('data-original',eventName);
    $("#modalCategory").attr('data-original',category);
    $("#modalGenre").attr('data-original',genre);
    $("#modalVenue").attr('data-original',venue);
    $("#modalVenueAddress").attr('data-original',venueAddress);
    $("#modalVenueCity").attr('data-original',venueCity);
    $("#modalVenueState").attr('data-original',venueState);
    $("#modalVenueZip").attr('data-original',venueZip);
    $("#modalAttraction").attr('data-original',attraction);
    $("#modalStartDt").attr('data-original',startDt);
    $("#modalEndDt").attr('data-original',endDt);
    $("#modalStartTime").attr('data-original',startTime);
    $("#modalEndTime").attr('data-original',endTime);
    $("#modalTktSaleStartDt").attr('data-original',tktSaleStartDt);
    $("#modalTktSaleEndDt").attr('data-original',tktSaleEndDt);
    $("#modalTktPriceMin").attr('data-original',tktPriceMin);
    $("#modalTktPriceMax").attr('data-original',tktPriceMax);
    $("#modalEventUrl").attr('data-original',eventUrl);
    $("#modalImageUrl").attr('data-original',imageUrl);
    $("#modalStartDtm").attr('data-original',startDtm);
    $("#modalCustomInd").attr('data-original',customInd);
    $("#modalPrivateInd").attr('data-original',privateInd);
    
    if (customInd=1) {
      $("#modalCustomInd").attr('checked',true);
    }
      else {
        $("#modalCustomInd").removeAttr('checked');
      };

      if (privateInd=1) {
      $("#modalPrivateInd").attr('checked',true);
    }
      else {
        $("#modalPrivateInd").removeAttr('checked');
      };
    
    if (button.hasClass("edit-button")) {
        toggleReadOnly();
    }
     else {
   $("#edit-modal-button").click(toggleReadOnly);
   $('#edit-modal-button').css('display','inline');
   $('#close-modal-button').css('display','inline');
   $('#save-new-modal-button').css('display','none');
   $('#save-modal-button').css('display','none');
   $('#cancel-modal-button').css('display','none');
   }
};

$('#create-event-button').on("click",function() {openBlankModal()});
$('#save-new-modal-button').click(saveNewEvent);
$('#save-modal-button').click(saveEventEdit);

function openBlankModal() {
   
     $('#modalDetailForm').modal('toggle');
      $('#save-new-modal-button').css('display','inline');
      $('#close-modal-button').css('display','inline');
      $('#edit-modal-button').hide();
       $('#cancel-modal-button').hide();
       $('#save-modal-button').hide();
        $('#modalEventForm').find(':input').attr('readonly',false);
      $('#modalEventForm').find(':checkbox').attr('disabled',false);
};


var toggleReadOnly=function() {
      $('#modalEventForm').find(':input').attr('readonly',false);
      $('#modalEventForm').find(':checkbox').attr('disabled',false);
      $('#edit-modal-button').hide();
       $('#close-modal-button').hide();
       $('#save-modal-button').hide();
      $('#save-modal-button').css('display','inline');
      $('#cancel-modal-button').css('display','inline');
      $("#cancel-modal-button").click(refreshModal);
      $('#save-new-modal-button').hide();
};



var refreshModal = function() {
    $("#modalInputErrors").text("");
    $("#modalEventKey").val($("#modalEventKey").attr('data-original'));
    $("#modalUserKey").val($("#modalUserKey").attr('data-original'));
    $("#modalEventName").val($("#modalEventName").attr('data-original'));
    $("#modalCategory").val($("#modalCategory").attr('data-original'));
    $("#modalGenre").val($("#modalGenre").attr('data-original'));
    $("#modalVenue").val($("#modalVenue").attr('data-original'));
    $("#modalVenueAddress").val($("#modalVenueAddress").attr('data-original'));
    $("#modalVenueCity").val($("#modalVenueCity").attr('data-original'));
    $("#modalVenueState").val($("#modalVenueState").attr('data-original'));
    $("#modalVenueZip").val($("#modalVenueZip").attr('data-original'));
    $("#modalAttraction").val($("#modalAttraction").attr('data-original'));
    $("#modalStartDt").val($("#modalStartDt").attr('data-original'));
    $("#modalEndDt").val($("#modalEndDt").attr('data-original'));
    $("#modalStartTime").val($("#modalStartTime").attr('data-original'));
    $("#modalEndTime").val($("#modalEndTime").attr('data-original'));
    $("#modalTktSaleStartDt").val($("#modalTktSaleStartDt").attr('data-original'));
    $("#modalTktSaleEndDt").val($("#modalTktSaleEndDt").attr('data-original'));
    $("#modalTktPriceMin").val($("#modalTktPriceMin").attr('data-original'));
    $("#modalTktPriceMax").val($("#modalTktPriceMax").attr('data-original'));
    $("#modalEventUrl").val($("#modalEventUrl").attr('data-original'));
    $("#modalImageUrl").val($("#modalImageUrl").attr('data-original'));
    $("#modalStartDtm").val($("#modalStartDtm").attr('data-original'));
    $("#modalCustomInd").val($("#modalCustomInd").attr('data-original'));
    $("#modalPrivateInd").val($("#modalPrivateInd").attr('data-original'));
    
    $("#edit-modal-button").click(toggleReadOnly);
   
   $('#edit-modal-button').css('display','inline');
   
   $('#close-modal-button').css('display','inline');
   // $("#cancel-modal-button").click(refreshModal);
   $('#save-modal-button').css('display','none');
   
   $('#cancel-modal-button').css('display','none');
  
    $('#modalEventForm').find(':input').attr('readonly',true);
    
    if (customInd=1) {

      $("#modalCustomInd").attr('checked');

    }
      else {
        
        $("#modalCustomInd").removeAttr('checked');

      };

      if (privateInd=1) {
      
         $("#modalPrivateInd").attr('checked');
    }
      else {
        
        $("#modalPrivateInd").removeAttr('checked');
          
      };


$('#modalEventForm').find(':checkbox').attr('disabled',true);
};

 function validateTime(value) { 
    if (!/^\d{2}:\d{2}:\d{2}$/.test(value)) {
      return false
    }
    else {
      var parts = value.split(':');
       if (parts[0] > 23 || parts[1] > 59 || parts[2] > 59) {
        return false;
        }
        else {
          return true;
        }
      }
    };


function getCustomEvents() {
  database.ref('/users').orderByChild("/events").on('value', function(DataSnapshot){
  });
};


// Chuck's javascript end=======================================================================================