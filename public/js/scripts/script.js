//Global variables
var userPos;
var map;

//On page load
document.addEventListener("DOMContentLoaded", function() {
	
	//Checks if geolocation is available for browser
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationFailure);
	} else {
		console.log("This browser doesn't support geolocation.");
	}
	
	document.getElementById("post_image_select").addEventListener("click", imageUpload);
	
});

//Geolocation success callback
function geolocationSuccess(position) {
	userPos = {lat: position.coords.latitude, lon: position.coords.longitude};
	angular.element(document.querySelector("body")).scope().userPos = userPos;
	
	mapInit(userPos.lat, userPos.lon);
	angular.element(document.querySelector("body")).scope().makeMarkers();
}

//Geolocation failure callback
function geolocationFailure(error) {
	console.log ("Geolocation failed: " + error.message); 
}

//Initializes without placing a marker
function mapInit(x, y) {
    var pos = {lat: x, lng: y};
	console.log("Your postition: " + pos.lat + ", " + pos.lng);
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: pos
    });
	angular.element(document.querySelector("body")).scope().map = map;
	console.log("Map loaded")
	//console.log(map);
	var marker = new google.maps.Marker({
        position: {lat: x, lng: y},
        map: map
    });
}

//Uploads an image on imgur and pastes the link to into post_entry_imglink
function imageUpload(file) {
	if (!file || !file.type.match(/image.*/)) return;
	var link;
    var fd = new FormData();
    fd.append("image", file);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.imgur.com/3/image.json");
	angular.element(document.querySelector("body")).scope().imglink = "Generating image link...";
    xhr.onload = function() {
		link = JSON.parse(xhr.responseText).data.link;
		angular.element(document.querySelector("body")).scope().imglink = link;
		document.getElementById("post_entry_imglink").value = link;
    }
        
    xhr.setRequestHeader('Authorization', 'Client-ID 37aa31c2a25b049');
    xhr.send(fd);
}