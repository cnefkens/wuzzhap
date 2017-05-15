


//Ticketmaster API Variables.
//--------------------------------------------------------------------------------------
var ticketmaster_rootURL = "https://app.ticketmaster.com/discovery/v2/events.json?";
var ticketmaster_api_key = "3k1w9taAfz9gWkcTaaWHhNxvB2mroydh";
//api_secret, not necessary yet, but just in case.
var ticketmaster_api_secret = "v4EJ7ZeuSiAx4ULA";
var ticketmaster_api_key_seg = "apikey=" + ticketmaster_api_key;
var ticketmaster_queryURL = "";

var ticketmaster_pageSize = 20;
var ticketmaster_pageSize_seg = "&size=" + ticketmaster_pageSize + "&";

var ticketmaster_page = 0;
var ticketmaster_page_seg = "&page=" + ticketmaster_page;



//----------------------------------------------------------------------------------------
//Seatgeek API Variables
//-------------------------------------------------------------------------------------
var seatgeek_rootURL = "https://api.seatgeek.com/2/events?";
var seatgeek_api_key = "NzUwNTg3NXwxNDkzOTU2NDE1LjU4";

var seatgeek_api_key_seg = "client_id=" + seatgeek_api_key;

var seatgeek_queryURL = "";

var seatgeek_pageSize = 20;
var seatgeek_pageSize_seg = "&per_page=" + seatgeek_pageSize + "&";

var seatgeek_page = 1;
var seatgeek_page_seg = "&page=" + seatgeek_page;

//---------------------------------------------------------------------------------



var keyword = "";
var state = "";
var city = "";
var postal = "";
var classification = "";

var keyword_seg = "";
var state_seg = "";
var city_seg = "";
var postal_seg = "";
var classification_seg = "";


var searchMeta;
var currentPage;





//Search Button
$("#searchTicketmaster").on("click", function (event) {
	event.preventDefault();
	ticketmasterSearch(event);
});
$("#searchSeatgeek").on("click", function (event) {
	event.preventDefault();
	seatgeekSearch(event);
});


$("#searchClear").on("click", function (event) {
	event.preventDefault();

	$("#searchKeyword").val("");
	//below. #searchCategory reset: the code order matters.
	$("#searchCategoryDefault").prop("disabled", false);
	$("#searchCategory option:selected").prop("selected", false);
	$("#searchCategoryDefault").attr("selected", "selected");
	$("#searchCategoryDefault").prop("disabled", true);

	$("#searchCity").val("");
	//below. #searchState reset: the code order matters.
	$("#searchCategoryDefault").prop("disabled", false);
	$("#searchState option:selected").prop("selcted", false);
	$("#searchStateDefault").attr("selected", "selected");
	$("#searchStateDefault").prop("disabled", true);

	$("#searchPostal").val('');
});

//Save Event button
$(document.body).on("click", ".addButton", saveNewSearchEvent);

//Show Detail button ---> opening modal
$("#modalSearchDetailForm").on("show.bs.modal",populateSearchDetailForm);

//Inside Modal - Save Event button
//clicking this button clicks .addButton associated with this event.
$("#modalSaveEventButton").on("click", function(){
	var key = $(this).attr('name');
	$('#' + key).trigger('click');
	$('modalCloseButton').trigger('click');
});

//Pagination Button
$(document.body).on("click", ".ticketmasterPageButton", function(event) {
	event.preventDefault();
	ticketmaster_page = parseInt($(this).text() - 1);
	ticketmasterSearch(event);
});

$(document.body).on("click", ".seatgeekPageButton", function(event) {
	event.preventDefault();
	seatgeek_page = parseInt($(this).text());
	seatgeekSearch(event);
});

//Ticketmaster Search Function
function ticketmasterSearch(event) {

	event.preventDefault();

	$("#searchResultTableBody").html("");
	$("#paginationBox").html('');

	if ( null === $("#searchKeyword").val() ) {
		keyword ="&"
	} else {
		keyword = $("#searchKeyword").val().trim() + "&";
	};
	if ( null === $("#searchState").val() ) {
		state ="&"
	} else {
		state = $("#searchState").val().trim() + "&";
	};
	if ( null === $("#searchCity").val() ) {
		city ="&"
	} else {
		city = $("#searchCity").val().trim() + "&";
	};
	if ( null === $("#searchPostal").val() ) {
		postal ="&"
	} else {
		postal = $("#searchPostal").val().trim() + "&";
	};
	if ( null === $('select[id=searchCategory]').val() ) {
		classification ="&"
	} else {
		classification = $('select[id=searchCategory]').val().trim() + "&";
	};

	keyword_seg = "";
	state_seg = "";
	city_seg = "";
	postal_seg = "";
	classification_seg = "";

	ticketmaster_page_seg = "&page=" + ticketmaster_page;

//checking to see if there is user input or not, for each field.
//if there's no user input, it will just be an ampersand '&', which will be ignored during
//API calls.
	if ( keyword != '&' ) {
		keyword_seg = "keyword=" + keyword;		
	};
	if ( state != '&' ) {
		state_seg = "stateCode=" + state;
	};
	if ( city != '&' ) {
		city_seg = "city=" + city;
	};
	if ( postal != '&' ) {
		postal_seg = "postalCode=" + postal;
	};
	if ( classification != '&' ) {
		classification_seg = "classificationName=" + classification;
	};


	ticketmaster_queryURL = ticketmaster_rootURL + keyword_seg + state_seg + city_seg + postal_seg + classification_seg + ticketmaster_api_key_seg + ticketmaster_pageSize_seg + ticketmaster_page_seg;

	$.ajax({
		url: ticketmaster_queryURL,
		method: 'GET'
	}).done(function(response) {

		if ( response._embedded === undefined ) {
			var eventsOnPage = [];
		}	else {
			var eventsOnPage = response._embedded.events;
		};


		
		searchMeta = response.page;
		currentPage = searchMeta.number + 1;

		
		for ( i = 1; i <= searchMeta.totalPages; i++ ) {
			var pageButton = $('<button>').html(i);
			pageButton.addClass("btn btn-default ticketmasterPageButton");
			pageButton.attr("type", "button");
			if ( i === currentPage ) {
				pageButton.css("background-color", "#d9d9d9")
			};

			$("#paginationBox").append(pageButton);
		};

		
    	
		for ( i = 0; i < eventsOnPage.length; i++ ) {

			var eImage;
			var eName;
			var eAttraction;
			var eVenueName;
			var eVenuePostal;
			var eVenueCity;
			var eVenueState;
			var eVenueStreetAddress;
			var eSalesStartDate;
			var eSalesEndDate;
			var eStartLocalDate;
			var eStartLocalTime;
			var eStartDateTime;
			var eClassification;
			var eGenre;
			var ePriceMin;
			var ePriceMax;
			var eLink;

			// first letter 'e' is short for 'event' here.
			//checking for non-existent properties inside returned object.
			if ( eventsOnPage[i].images === undefined ) {
				var eImage = "https://placeholdit.imgix.net/~text?txtsize=23&txt=250%C3%97250&w=250&h=250";
			} else {
				var eImage = eventsOnPage[i].images[0].url;
			}
			if ( eventsOnPage[i].name === undefined ) {
				var eName = "N/A";
			} else {
				var eName = eventsOnPage[i].name;
			};
			if ( eventsOnPage[i]._embedded === undefined || eventsOnPage[i]._embedded.attractions === undefined ) {
				var eAttraction = "N/A";
			} else {
				var eAttraction = eventsOnPage[i]._embedded.attractions[0].name;
			};
			if ( eventsOnPage[i]._embedded === undefined ||  eventsOnPage[i]._embedded.venues[0].name === undefined ) {
				var eVenueName = "N/A";
			} else {
				var eVenueName = eventsOnPage[i]._embedded.venues[0].name;
			};
			if ( eventsOnPage[i]._embedded === undefined ||  eventsOnPage[i]._embedded.venues[0].postalCode === undefined ) {
				var eVenuePostal = "N/A";
			} else {
				var eVenuePostal = eventsOnPage[i]._embedded.venues[0].postalCode;
			};
			if ( eventsOnPage[i]._embedded === undefined ||  eventsOnPage[i]._embedded.venues[0].city === undefined ) {
				var eVenueCity = "N/A";
			} else {
				var eVenueCity = eventsOnPage[i]._embedded.venues[0].city.name;
			};
			if ( eventsOnPage[i]._embedded === undefined ||  eventsOnPage[i]._embedded.venues[0].state === undefined ) {
				var eVenueState = "N/A";
			} else {
				var eVenueState = eventsOnPage[i]._embedded.venues[0].state.stateCode;
			};
			if ( eventsOnPage[i]._embedded === undefined ||  eventsOnPage[i]._embedded.venues[0].address === undefined ) {
				var eVenueStreetAddress = "N/A";
			} else {
				var eVenueStreetAddress = eventsOnPage[i]._embedded.venues[0].address;
			};
			if ( eventsOnPage[i].sales.public.startDateTime === undefined ) {
				var eSalesStartDate = "N/A";
			} else {
				var eSalesStartDate = moment(eventsOnPage[i].sales.public.startDateTime).format("YYYY-MM-DD");
			};
			if ( eventsOnPage[i].sales.public.endDateTime === undefined ) {
				var eSalesEndDate = "N/A";
			} else {
				var eSalesEndDate = moment(eventsOnPage[i].sales.public.endDateTime).format("YYYY-MM-DD");
			};
			if ( eventsOnPage[i].dates.start.localDate === undefined ) {
				var eStartLocalDate = "N/A";
			} else {
				var eStartLocalDate = eventsOnPage[i].dates.start.localDate;
			};
			if ( eventsOnPage[i].dates.start.localTime === undefined ) {
				var eStartLocalTime = "N/A";
			} else {
				var eStartLocalTime = eventsOnPage[i].dates.start.localTime;
			};
			if ( eventsOnPage[i].dates.start.dateTime === undefined ) {
				var eStartDateTime = "N/A";
			} else {
				var eStartDateTime = parseInt(moment(eventsOnPage[i].dates.start.dateTime).format('X'));
			};
			if ( eventsOnPage[i].classifications === undefined ) {
				var eClassification = "N/A";
			} else {
				var eClassification = eventsOnPage[i].classifications[0].segment.name;
			};
			if ( eventsOnPage[i].classifications === undefined || eventsOnPage[i].classifications[0].genre === undefined ) {
				var eGenre = "N/A";
			} else {
				var eGenre = eventsOnPage[i].classifications[0].genre.name;
			};
			if ( eventsOnPage[i].priceRanges === undefined ) {
				var ePriceMin = "N/A";
			} else {
				var ePriceMin = eventsOnPage[i].priceRanges[0].min;
			};
			if ( eventsOnPage[i].priceRanges === undefined ) {
				var ePriceMax = "N/A";
			} else {
				var ePriceMax = eventsOnPage[i].priceRanges[0].max;
			};
			if ( eventsOnPage[i].url === undefined ) {
				var eLink = "N/A";
			} else {
				var eLink = eventsOnPage[i].url;
			};


			//individual output row
			var outputRow = $('<tr id=' + i + '></tr>');
			//individual output cell
			var eImageCell = $('<td>');
			var eNameCell = $('<td>');
			var eAttractionCell = $('<td>');
			var eVenueNameCell = $('<td>');
			var eVenuePostalCell = $('<td>');
			var eVenueCityCell = $('<td>');
			var eVenueStateCell = $('<td>');
			var eVenueStreetAddressCell = $('<td>');
			var eSalesStartDateCell = $('<td>');
			var eSalesEndDateCell = $('<td>');
			var eStartLocalDateCell = $('<td>');
			var eStartLocalTimeCell = $('<td>');
			var eStartDateTimeCell = $('<td>');
			var eClassificationCell = $('<td>');
			var eGenreCell = $('<td>');
			var ePriceMinCell = $('<td>');
			var ePriceMaxCell = $('<td>');
			var eLinkCell = $('<td>');

			eImageCell.addClass('searchResultImage');
			eNameCell.addClass('searchResultName');
			eAttractionCell.addClass('searchResultAttraction');
			eVenueNameCell.addClass('searchResultVenueName');
			eVenuePostalCell.addClass('searchResultVenuePostal');
			eVenueCityCell.addClass('searchResultVenueCity');
			eVenueStateCell.addClass('searchResultVenueState');
			eVenueStreetAddressCell.addClass('searchResultVenueStreetAddress');
			eSalesStartDateCell.addClass('searchResultVenueSalesStartDate');
			eSalesEndDateCell.addClass('searchResultSalesEndDate');
			eStartLocalDateCell.addClass('searchResultStartLocalDate');
			eStartLocalTimeCell.addClass('searchResultStartLocalTime');
			eStartDateTimeCell.addClass('searchResultStartDateTime');
			eClassificationCell.addClass('searchResultClassification');
			eGenreCell.addClass('searchResultGenre');
			ePriceMinCell.addClass('searchResultPriceMin');
			ePriceMaxCell.addClass('searchResultPriceMax');
			eLinkCell.addClass('searchResultLink');


			//individual output content (to be put into individual cells)
			var eImageP = $('<img>').attr("src", eImage).css("width", "120px").css("height", "80px");
			var eNameP = $('<p>').html(eName);
			var eAttractionP = $('<p>').html(eAttraction);
			var eVenueNameP = $('<p>').html(eVenueName);
			var eVenuePostalP = $('<p>').html(eVenuePostal);
			var eVenueCityP = $('<p>').html(eVenueCity);
			var eVenueStateP = $('<p>').html(eVenueState);
			var eVenueStreetAddressP = $('<p>').html(eVenueStreetAddress);
			var eSalesStartDateP = $('<p>').html(eSalesStartDate);
			var eSalesEndDateP = $('<p>').html(eSalesEndDate);
			var eStartLocalDateP = $('<p>').html(eStartLocalDate);
			var eStartLocalTimeP = $('<p>').html(eStartLocalTime);
			var eStartDateTimeP = $('<p>').html(eStartDateTime);
			var eClassificationP = $('<p>').html(eClassification);
			var eGenreP = $('<p>').html(eGenre);
			var ePriceMinP = $('<p>').html(ePriceMin);
			var ePriceMaxP = $('<p>').html(ePriceMax);
			var eLinkP = $('<p>').html('<a href="' + eLink + '">Purchase Tickets!</a>');


			//Add button, detail button
			var eDetailButtonCell = $("<td>");
			var eAddButtonCell = $("<td>");

			eDetailButtonCell.addClass("detailButtonCell");
			eAddButtonCell.addClass("addButtonCell");

			var eDetailButtonButton = $("<button>");
			var eAddButtonButton = $("<button>");

			eDetailButtonButton.addClass("btn btn-default btn-xs detailButton")
			eAddButtonButton.addClass("btn btn-default btn-xs addButton")
			//below two lines are to reference from Modal Save button.
			eDetailButtonButton.attr("name", "key" + i);
			eAddButtonButton.attr("id", "key" + i);

			eDetailButtonButton.attr("type", "button");
			eAddButtonButton.attr("type", "button");
			eDetailButtonButton.attr("aria-label", "View Detail");
			eAddButtonButton.attr("aria-label", "Add Row");

			eDetailButtonButton.attr("data-toggle", "modal");
			eDetailButtonButton.attr("data-target", "#modalSearchDetailForm");

			var detailButtonGlyph = $("<span>");
			var addButtonGlyph = $("<span>");
			detailButtonGlyph.addClass("glyphicon glyphicon-modal-window")
			addButtonGlyph.addClass("glyphicon glyphicon-plus");

			//assemble!!
			eDetailButtonButton.append(detailButtonGlyph);
			eAddButtonButton.append(addButtonGlyph);

			eDetailButtonCell.append(eDetailButtonButton);
			eAddButtonCell.append(eAddButtonButton);


			eImageCell.append(eImageP);
			eNameCell.append(eNameP);
			eAttractionCell.append(eAttractionP);
			eVenueNameCell.append(eVenueNameP);
			eVenuePostalCell.append(eVenuePostalP);
			eVenueCityCell.append(eVenueCityP);
			eVenueStateCell.append(eVenueStateP);
			eVenueStreetAddressCell.append(eVenueStreetAddressP);
			eSalesStartDateCell.append(eSalesStartDateP);
			eSalesEndDateCell.append(eSalesEndDateP);
			eStartLocalDateCell.append(eStartLocalDateP);
			eStartLocalTimeCell.append(eStartLocalTimeP);
			eStartDateTimeCell.append(eStartDateTimeP);
			eClassificationCell.append(eClassificationP);
			eGenreCell.append(eGenreP);
			ePriceMinCell.append(ePriceMinP);
			ePriceMaxCell.append(ePriceMaxP);
			eLinkCell.append(eLinkP);

			outputRow.append(eImageCell);
			outputRow.append(eNameCell);
			outputRow.append(eAttractionCell);
			outputRow.append(eVenueNameCell);
			outputRow.append(eVenuePostalCell);
			outputRow.append(eVenueCityCell);
			outputRow.append(eVenueStateCell);
			outputRow.append(eVenueStreetAddressCell);
			outputRow.append(eSalesStartDateCell);
			outputRow.append(eSalesEndDateCell);
			outputRow.append(eStartLocalDateCell);
			outputRow.append(eStartLocalTimeCell);
			outputRow.append(eStartDateTimeCell);
			outputRow.append(eClassificationCell);
			outputRow.append(eGenreCell);
			outputRow.append(ePriceMinCell);
			outputRow.append(ePriceMaxCell);
			outputRow.append(eLinkCell);

			outputRow.append(eDetailButtonCell);
			outputRow.append(eAddButtonCell);

			$('#searchResultTableBody').append(outputRow);
		};
	});
};

//Seatgeek
//Client ID = NzUwNTg3NXwxNDkzOTU2NDE1LjU4


//https://api.seatgeek.com/2/events?q=boston+celtics&client_id=NzUwNTg3NXwxNDkzOTU2NDE1LjU4
//https://api.seatgeek.com/2/events?client_id=NzUwNTg3NXwxNDkzOTU2NDE1LjU4


//Seatgeek Search Function
function seatgeekSearch(event) {

	event.preventDefault();

	$("#searchResultTableBody").html("");
	$("#paginationBox").html('');

	if ( null === $("#searchKeyword").val() ) {
		keyword = "&"
	} else {
		keyword = $("#searchKeyword").val().trim() + "&";
	};
	if ( null === $("#searchState").val() ) {
		state = "&"
	} else {
		state = $("#searchState").val().trim() + "&";
	};
	if ( null === $("#searchCity").val() ) {
		city = "&"
	} else {
		city = $("#searchCity").val().trim() + "&";
	};
	if ( null === $("#searchPostal").val() ) {
		postal = "&"
	} else {
		postal = $("#searchPostal").val().trim() + "&";
	};
	if ( null === $('select[id=searchCategory]').val() ) {
		classification = "&"
	} else {
		classification = $('select[id=searchCategory]').val().trim() + "&";
	};

	// --for Seatgeek only--
	if ( "Art&Theater" === $("#searchCategory").val() ) {
		classification = "art&taxonomies.name=theater&";
	};
	if ( "Hobby/Special Interest Expos" === $("#searchCategory").val() ) {
		classification = "Hobby&=Expos&q=Convention&";
	};
	if ( "Music" === $("#searchCategory").val() ) {
		classification = "&taxonomies.name=concert&";
	};
	if ( "Sports" === $("#searchCategory").val() ) {
		classification = "&taxonomies.name=sports&";
	};


	keyword_seg = "";
	state_seg = "";
	city_seg = "";
	postal_seg = "";
	classification_seg = "";

	seatgeek_page_seg = "&page=" + seatgeek_page;

//checking to see if there is user input or not, for each field.
//if there's no user input, it will just be an ampersand '&', which will be ignored during
//API calls.
	if ( keyword != '&' ) {
		keyword_seg = "q=" + keyword;		
	};
	if ( state != '&' ) {
		state_seg = "venue.state=" + state;
	};
	if ( city != '&' ) {
		city_seg = "venue.city=" + city;
	};
	if ( postal != '&' ) {
		postal_seg = "q=" + postal;
	};
	if ( classification != '&' ) {
		classification_seg = "q=" + classification;
	};

	seatgeek_queryURL = seatgeek_rootURL + keyword_seg + state_seg + city_seg + postal_seg + classification_seg + seatgeek_api_key_seg + seatgeek_pageSize_seg + seatgeek_page_seg;


	$.ajax({
		url: seatgeek_queryURL,
		method: 'GET'
	}).done(function(response) {

		if ( response === undefined ) {
			var eventsOnPage = [];
		}	else {
			var eventsOnPage = response.events;
		};
		
		searchMeta = response.meta;
		currentPage = searchMeta.page;


		if ( searchMeta.total === 0 ) {
			seatgeek_pageTotal = 0;
		} else {
			seatgeek_pageTotal = Math.floor(searchMeta.total / seatgeek_pageSize) + 1;
		};

		for ( i = 1; i <= seatgeek_pageTotal; i++ ) {
			var pageButton = $('<button>').html(i);
			pageButton.addClass("btn btn-default seatgeekPageButton");
			pageButton.attr("type", "button");
			if ( i === currentPage ) {
				pageButton.css("background-color", "#d9d9d9")
			};

			$("#paginationBox").append(pageButton);
		};

		for ( i = 0; i < eventsOnPage.length; i++ ) {

			var eImage;
			var eName;
			var eAttraction;
			var eVenueName;
			var eVenuePostal;
			var eVenueCity;
			var eVenueState;
			var eVenueStreetAddress;
			var eSalesStartDate;
			var eSalesEndDate;
			var eStartLocalDate;
			var eStartLocalTime;
			var eStartDateTime;
			var eClassification;
			var eGenre;
			var ePriceMin;
			var ePriceMax;
			var eLink;

			// first letter 'e' is short for 'event' here.
			//checking for non-existent properties inside returned object.
			if ( eventsOnPage[i].performers === undefined || eventsOnPage[i].performers[0].image === null ) {
				var eImage = "https://placeholdit.imgix.net/~text?txtsize=23&txt=250%C3%97250&w=250&h=250";
			} else {
				var eImage = eventsOnPage[i].performers[0].image;
			};
			// -------------
			if ( eventsOnPage[i].title === undefined ) {
				var eName = "N/A";
			} else {
				var eName = eventsOnPage[i].title;
			};
			// -------------
			if ( eventsOnPage[i].performers === undefined ) {
				var eAttraction = "N/A";
			} else {
				var eAttraction = eventsOnPage[i].performers[0].name;
			};
			// -------------
			if ( eventsOnPage[i].venue === undefined ||  eventsOnPage[i].venue.name_v2 === undefined ) {
				var eVenueName = "N/A";
			} else {
				var eVenueName = eventsOnPage[i].venue.name_v2;
			};
			// -------------			
			if ( eventsOnPage[i].venue === undefined ||  eventsOnPage[i].venue.postal_code === undefined ) {
				var eVenuePostal = "N/A";
			} else {
				var eVenuePostal = eventsOnPage[i].venue.postal_code;
			};
			// -------------
			if ( eventsOnPage[i].venue === undefined ||  eventsOnPage[i].venue.city === undefined ) {
				var eVenueCity = "N/A";
			} else {
				var eVenueCity = eventsOnPage[i].venue.city;
			};
			// -------------
			if ( eventsOnPage[i].venue === undefined ||  eventsOnPage[i].venue.state === undefined ) {
				var eVenueState = "N/A";
			} else {
				var eVenueState = eventsOnPage[i].venue.state;
			};
			// -------------			
			if ( eventsOnPage[i].venue === undefined ||  eventsOnPage[i].venue.address === undefined ) {
				var eVenueStreetAddress = "N/A";
			} else {
				var eVenueStreetAddress = eventsOnPage[i].venue.address;
			};
			// -------------			
			// if ( eventsOnPage[i].sales.public.startDateTime === undefined ) {
				var eSalesStartDate = "N/A";
			// } else {
			// 	var eSalesStartDate = eventsOnPage[i].sales.public.startDateTime;
			// };
			// -------------			
			// if ( eventsOnPage[i].sales.public.endDateTime === undefined ) {
				var eSalesEndDate = "N/A";
			// } else {
			// 	var eSalesEndDate = eventsOnPage[i].sales.public.endDateTime;
			// };
			// -------------			
			if ( eventsOnPage[i].datetime_local === undefined ) {
				var eStartLocalDate = "N/A";
			} else {
				var eStartLocalDate = moment(eventsOnPage[i].datetime_local).format("YYYY-MM-DD");
			};
			// -------------			
			if ( eventsOnPage[i].datetime_local === undefined ) {
				var eStartLocalTime = "N/A";
			} else {
				var eStartLocalTime = moment(eventsOnPage[i].datetime_local).format("HH:mm:ss");
			};
			// -------------			
			if ( eventsOnPage[i].datetime_utc === undefined ) {
				var eStartDateTime = "N/A";
			} else {
				var eStartDateTime = parseInt(moment.utc(eventsOnPage[i].datetime_utc).format('X'));
			};
			// -------------			
			if ( eventsOnPage[i].type === undefined ) {
				var eClassification = "N/A";
			} else {
				var eClassification = eventsOnPage[i].type;
			};
			// -------------			
			if ( eventsOnPage[i].performers === undefined || eventsOnPage[i].performers[0].genres === undefined ) {
				var eGenre = "N/A";
			} else {
				var eGenre = eventsOnPage[i].performers[0].genres.name;
			};
			// -------------			
			if ( eventsOnPage[i].stats === undefined || eventsOnPage[i].stats.lowest_price === null ) {
				var ePriceMin = "N/A";
			} else {
				var ePriceMin = eventsOnPage[i].stats.lowest_price;
			};
			// -------------			
			if ( eventsOnPage[i].stats === undefined || eventsOnPage[i].stats.highest_price === null ) {
				var ePriceMax = "N/A";
			} else {
				var ePriceMax = eventsOnPage[i].stats.highest_price;
			};
			// -------------			
			if ( eventsOnPage[i].url === undefined ) {
				var eLink = "N/A";
			} else {
				var eLink = eventsOnPage[i].url;
			};
			// -------------			


			//individual output row
			var outputRow = $('<tr id=' + i + '></tr>');
			//individual output cell

			var eImageCell = $('<td>');
			var eNameCell = $('<td>');
			var eAttractionCell = $('<td>');
			var eVenueNameCell = $('<td>');
			var eVenuePostalCell = $('<td>');
			var eVenueCityCell = $('<td>');
			var eVenueStateCell = $('<td>');
			var eVenueStreetAddressCell = $('<td>');
			var eSalesStartDateCell = $('<td>');
			var eSalesEndDateCell = $('<td>');
			var eStartLocalDateCell = $('<td>');
			var eStartLocalTimeCell = $('<td>');
			var eStartDateTimeCell = $('<td>');
			var eClassificationCell = $('<td>');
			var eGenreCell = $('<td>');
			var ePriceMinCell = $('<td>');
			var ePriceMaxCell = $('<td>');
			var eLinkCell = $('<td>');

			eImageCell.addClass('searchResultImage');
			eNameCell.addClass('searchResultName');
			eAttractionCell.addClass('searchResultAttraction');
			eVenueNameCell.addClass('searchResultVenueName');
			eVenuePostalCell.addClass('searchResultVenuePostal');
			eVenueCityCell.addClass('searchResultVenueCity');
			eVenueStateCell.addClass('searchResultVenueState');
			eVenueStreetAddressCell.addClass('searchResultVenueStreetAddress');
			eSalesStartDateCell.addClass('searchResultVenueSalesStartDate');
			eSalesEndDateCell.addClass('searchResultSalesEndDate');
			eStartLocalDateCell.addClass('searchResultStartLocalDate');
			eStartLocalTimeCell.addClass('searchResultStartLocalTime');
			eStartDateTimeCell.addClass('searchResultStartDateTime');
			eClassificationCell.addClass('searchResultClassification');
			eGenreCell.addClass('searchResultGenre');
			ePriceMinCell.addClass('searchResultPriceMin');
			ePriceMaxCell.addClass('searchResultPriceMax');
			eLinkCell.addClass('searchResultLink');


			//individual output content (to be put into individual cells)
			var eImageP = $('<img>').attr("src", eImage).css("width", "120px").css("height", "80px");
			var eNameP = $('<p>').html(eName);
			var eAttractionP = $('<p>').html(eAttraction);
			var eVenueNameP = $('<p>').html(eVenueName);
			var eVenuePostalP = $('<p>').html(eVenuePostal);
			var eVenueCityP = $('<p>').html(eVenueCity);
			var eVenueStateP = $('<p>').html(eVenueState);
			var eVenueStreetAddressP = $('<p>').html(eVenueStreetAddress);
			var eSalesStartDateP = $('<p>').html(eSalesStartDate);
			var eSalesEndDateP = $('<p>').html(eSalesEndDate);
			var eStartLocalDateP = $('<p>').html(eStartLocalDate);
			var eStartLocalTimeP = $('<p>').html(eStartLocalTime);
			var eStartDateTimeP = $('<p>').html(eStartDateTime);
			var eClassificationP = $('<p>').html(eClassification);
			var eGenreP = $('<p>').html(eGenre);
			var ePriceMinP = $('<p>').html(ePriceMin);
			var ePriceMaxP = $('<p>').html(ePriceMax);
			var eLinkP = $('<p>').html('<a href="' + eLink + '">Purchase Tickets!</a>');

			//Add button, detail button
			var eDetailButtonCell = $("<td>");
			var eAddButtonCell = $("<td>");

			eDetailButtonCell.addClass("detailButtonCell");
			eAddButtonCell.addClass("addButtonCell");

			var eDetailButtonButton = $("<button>");
			var eAddButtonButton = $("<button>");

			eDetailButtonButton.addClass("btn btn-default btn-xs detailButton")

			eAddButtonButton.addClass("btn btn-default btn-xs addButton")
			//below two steps are done to reference Add button by clicking Save in Modal.
			eDetailButtonButton.attr("name", "key" + i);
			eAddButtonButton.attr("id", "key" + i);

			eDetailButtonButton.attr("type", "button");
			eAddButtonButton.attr("type", "button");
			eDetailButtonButton.attr("aria-label", "View Detail");
			eAddButtonButton.attr("aria-label", "Add Row");

			eDetailButtonButton.attr("data-toggle", "modal");
			eDetailButtonButton.attr("data-target", "#modalSearchDetailForm");

			var detailButtonGlyph = $("<span>");
			var addButtonGlyph = $("<span>");
			detailButtonGlyph.addClass("glyphicon glyphicon-modal-window")
			addButtonGlyph.addClass("glyphicon glyphicon-plus");

			//assemble!!
			eDetailButtonButton.append(detailButtonGlyph);
			eAddButtonButton.append(addButtonGlyph);

			eDetailButtonCell.append(eDetailButtonButton);
			eAddButtonCell.append(eAddButtonButton);


			eImageCell.append(eImageP);
			eNameCell.append(eNameP);
			eAttractionCell.append(eAttractionP);
			eVenueNameCell.append(eVenueNameP);
			eVenuePostalCell.append(eVenuePostalP);
			eVenueCityCell.append(eVenueCityP);
			eVenueStateCell.append(eVenueStateP);
			eVenueStreetAddressCell.append(eVenueStreetAddressP);
			eSalesStartDateCell.append(eSalesStartDateP);
			eSalesEndDateCell.append(eSalesEndDateP);
			eStartLocalDateCell.append(eStartLocalDateP);
			eStartLocalTimeCell.append(eStartLocalTimeP);
			eStartDateTimeCell.append(eStartDateTimeP);
			eClassificationCell.append(eClassificationP);
			eGenreCell.append(eGenreP);
			ePriceMinCell.append(ePriceMinP);
			ePriceMaxCell.append(ePriceMaxP);
			eLinkCell.append(eLinkP);

			outputRow.append(eImageCell);
			outputRow.append(eNameCell);
			outputRow.append(eAttractionCell);
			outputRow.append(eVenueNameCell);
			outputRow.append(eVenuePostalCell);
			outputRow.append(eVenueCityCell);
			outputRow.append(eVenueStateCell);
			outputRow.append(eVenueStreetAddressCell);
			outputRow.append(eSalesStartDateCell);
			outputRow.append(eSalesEndDateCell);
			outputRow.append(eStartLocalDateCell);
			outputRow.append(eStartLocalTimeCell);
			outputRow.append(eStartDateTimeCell);
			outputRow.append(eClassificationCell);
			outputRow.append(eGenreCell);
			outputRow.append(ePriceMinCell);
			outputRow.append(ePriceMaxCell);
			outputRow.append(eLinkCell);

			outputRow.append(eDetailButtonCell);
			outputRow.append(eAddButtonCell);

			$('#searchResultTableBody').append(outputRow);
		};
	});
};

//Populate modal detail form with data from My Events table row.
function populateSearchDetailForm(event) {

	var eventState = $(event.relatedTarget).closest('tr').find('.detailButton').attr('value');
	var keyForAddButton = $(event.relatedTarget).closest('tr').find('.detailButton').attr('name');

	$("#modalSaveEventButton").attr("name", keyForAddButton);

	if ( eventState === "saved" ) {
		$("#modalSaveEventButton").html("Saved!");
		$("#modalSaveEventButton").prop("disabled", true );
	} else {
		$("#modalSaveEventButton").html("Save Event");
		$("#modalSaveEventButton").prop("disabled", false );
	};


	// var eImage = $(event.relatedTarget).closest('tr').find('.searchResultImage img');
	var eName = $(event.relatedTarget).closest('tr').find('.searchResultName p').text();
	var eAttraction = $(event.relatedTarget).closest('tr').find('.searchResultAttraction p').text();
	var eVenueName = $(event.relatedTarget).closest('tr').find('.searchResultVenueName p').text();
	var eVenuePostal = $(event.relatedTarget).closest('tr').find('.searchResultVenuePostal p').text();
	var eVenueCity = $(event.relatedTarget).closest('tr').find('.searchResultVenueCity p').text();
	var eVenueState = $(event.relatedTarget).closest('tr').find('.searchResultVenueState p').text();
	var eVenueStreetAddress = $(event.relatedTarget).closest('tr').find('.searchResultVenueStreetAddress p').text();
	var eSalesStartDate = $(event.relatedTarget).closest('tr').find('.searchResultVenueSalesStartDate p').text();
	var eSalesEndDate = $(event.relatedTarget).closest('tr').find('.searchResultSalesEndDate p').text();
	var eStartLocalDate = $(event.relatedTarget).closest('tr').find('.searchResultStartLocalDate p').text();
	var eStartLocalTime = $(event.relatedTarget).closest('tr').find('.searchResultStartLocalTime p').text();
	var eStartDateTime = $(event.relatedTarget).closest('tr').find('.searchResultStartDateTime p').text();
	var eClassification = $(event.relatedTarget).closest('tr').find('.searchResultClassification p').text();
	var eGenre = $(event.relatedTarget).closest('tr').find('.searchResultGenre p').text();
	var ePriceMin = $(event.relatedTarget).closest('tr').find('.searchResultPriceMin p').text();
	var ePriceMax = $(event.relatedTarget).closest('tr').find('.searchResultPriceMax p').text();
	var eLink = $(event.relatedTarget).closest('tr').find('.searchResultLink p a').attr('href');


	// $(this).find("#modalSearchEventImage").append(eImage);
	$(this).find("#modalSearchEventName").val(eName);
	$(this).find("#modalSearchEventAttraction").val(eAttraction);
	$(this).find("#modalSearchEventVenueName").val(eVenueName);
	$(this).find("#modalSearchEventVenuePostal").val(eVenuePostal);
	$(this).find("#modalSearchEventVenueCity").val(eVenueCity);
	$(this).find("#modalSearchEventVenueState").val(eVenueState);
	$(this).find("#modalSearchEventVenueStreetAddress").val(eVenueStreetAddress);
	$(this).find("#modalSearchEventSalesStartDate").val(eSalesStartDate);
	$(this).find("#modalSearchEventSalesEndDate").val(eSalesEndDate);
	$(this).find("#modalSearchEventStartLocalDate").val(eStartLocalDate);
	$(this).find("#modalSearchEventStartLocalTime").val(eStartLocalTime);
	$(this).find("#modalSearchEventStartDateTime").val(eStartDateTime);
	$(this).find("#modalSearchEventClassification").val(eClassification);
	$(this).find("#modalSearchEventGenre").val(eGenre);
	$(this).find("#modalSearchEventPriceMin").val(ePriceMin);
	$(this).find("#modalSearchEventPriceMax").val(ePriceMax);
	$(this).find("#modalSearchEventLink").attr('href', eLink);
	$(this).find("#modalSearchEventLink").attr('target', "_blank");
	$(this).find("#modalSearchEventLink").text("Purchase Tickets!");

};


function saveNewSearchEvent(event) {

	event.preventDefault();

	var eImage = $(this).closest('tr').find('.searchResultImage img').attr('src');
	var eName = $(this).closest('tr').find('.searchResultName p').html();
	var eAttraction = $(this).closest('tr').find('.searchResultAttraction p').html();
	var eVenueName = $(this).closest('tr').find('.searchResultVenueName p').html();
	var eVenuePostal = $(this).closest('tr').find('.searchResultVenuePostal p').html();
	var eVenueCity = $(this).closest('tr').find('.searchResultVenueCity p').html();
	var eVenueState = $(this).closest('tr').find('.searchResultVenueState p').html();
	var eVenueStreetAddress = $(this).closest('tr').find('.searchResultVenueStreetAddress p').html();
	var eSalesStartDate = $(this).closest('tr').find('.searchResultVenueSalesStartDate p').html();
	var eSalesEndDate = $(this).closest('tr').find('.searchResultSalesEndDate p').html();
	var eStartLocalDate = $(this).closest('tr').find('.searchResultStartLocalDate p').html();
	var eStartLocalTime = $(this).closest('tr').find('.searchResultStartLocalTime p').html();
	var eStartDateTime = $(this).closest('tr').find('.searchResultStartDateTime p').html();
	var eClassification = $(this).closest('tr').find('.searchResultClassification p').html();
	var eGenre = $(this).closest('tr').find('.searchResultGenre p').html();
	var ePriceMin = $(this).closest('tr').find('.searchResultPriceMin p').html();
	var ePriceMax = $(this).closest('tr').find('.searchResultPriceMax p').html();
	var eLink = $(this).closest('tr').find('.searchResultLink p a').attr('href');


    database.ref('/users/' + uid + '/events').push({

    	image_url: eImage,
		event_name: eName,
		attraction: eAttraction,
		venue: eVenueName,
		venue_zip: eVenuePostal,
		venue_city: eVenueCity,
		venue_state: eVenueState,
		venue_address: eVenueStreetAddress,
		tkt_sale_start_dt: eSalesStartDate,
		tkt_sale_end_dt: eSalesEndDate,
		start_dt: eStartLocalDate,
		start_time: eStartLocalTime,
		start_dtm: eStartDateTime,
		category: eClassification,
		genre: eGenre,
		tkt_price_min: ePriceMin,
		tkt_price_max: ePriceMax,
		event_url: eLink,
		custom_ind: 0,
		private_ind: 0


	});
		//end_time not pulled from API
		// end_time endTime,
		//end_dt is not pulled from API
		// end_dt: endDt,

    //After event is added, glyphicon changes. AND button becomes unclickable.
    $(this).children().removeClass('glyphicon-plus');
    $(this).children().addClass('glyphicon-ok');
    $(this).attr('disabled', true);
    $(this).closest('tr').find('.detailButton').attr('value', 'saved');

	$("#modalSaveEventButton").html("Saved!");
	$("#modalSaveEventButton").prop("disabled", true );

};

