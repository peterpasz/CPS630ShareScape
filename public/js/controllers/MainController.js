var myApp = angular.module('myApp', ['ngStorage']);

myApp.run(['$localStorage', function($localStorage) {
		//Sets up local storage on user's first visit
		if($localStorage.votedQuestions != null){
         	
 		}else{
 			$localStorage.votedQuestions = [];
 		}
		$localStorage.distances = [];
		if($localStorage.distances != null){
         	
 		}else{
 			$localStorage.distances = [];
 		}
	}])

myApp.controller("MainController", ["$scope", "$http", "$localStorage", function($scope, $http, $localStorage) {
		
		$http.get('/api/posts')
			.success(function (posts) {
				//Goes through all the posts in the database
				for(var i=0; i<posts.length; i++){
					var distance = parseFloat($scope.haversineDistance(posts[i].pos.lat, posts[i].pos.lon, parseFloat(userLat), parseFloat(userLon)));
					
					if (($localStorage.distances.indexOf(posts[i].title) === -1) && !(isNaN(distance))) {
						$localStorage.distances.push(posts[i].title, distance)}
					if(distance != 0) {						
						$scope.posts.unshift(posts[i]);
						//Adds marker for that post
						$scope.makeMarker(posts[i].pos.lat, posts[i].pos.lon, posts[i].title, i, posts[i].imglink);
					}
				}
			});

		//Creates a post
		$scope.createPost = function() {
			//console.log(userPos);
			if ($scope.title && $scope.linkIsImage($scope.imglink)) {
				$http.post('/api/posts', {
					title: $scope.title,
					pos: {
						lat: $scope.userPos.lat,
						lon: $scope.userPos.lon
					},
					rating: 0,
					imglink: $scope.imglink,
				})
				.success(function (post) {
					$scope.posts.unshift(post)
					$scope.makeMarker(
						$scope.userPos.lat, 
						$scope.userPos.lon, 
						$scope.title, 
						0, 
						$scope.imglink);
					$scope.title = null
					//Clears title and imglink fields
					$scope.title = "";
					$scope.imglink = "";
				})	
			}
		};

		$scope.updateRating = function(postid, postrating, value){	
			console.log($localStorage.votedQuestions.indexOf(postid))
			document.getElementById(postid).style.color = "orange";
			if ($localStorage.votedQuestions.indexOf(postid) === -1) {
				$localStorage.votedQuestions.push(postid)
				document.getElementById(postid).innerHTML = postrating + value;
				console.log("Thanks for Voting");

				$http.put('/api/posts/' + postid, {
					rating: postrating + value
				})
				.success(function(post) {

				})
				$http.get('/api/posts')
					.success(function (posts) {
						$scope.posts = posts
					})
			} 
			else{
       			console.log("You already voted to this question");
				document.getElementById(postid+"vote").style.height = "25px";
    		}
		}
		
		$scope.dismissPrompt = function (postid) {
			dismissPrompt(postid)
		}

		//hashmap to associate marker with img links
		$scope.markerHashMap = new Map();
		
		
		//Places a marker at the specified lat and lon
		$scope.makeMarker = function(x, y, markerTitle, count, imglink) {
			var infowindow = new google.maps.InfoWindow({
    			content: markerTitle
  			})
			var marker = new google.maps.Marker({
				position: {lat: x, lng: y},
				map: $scope.map,
				title: markerTitle,
				icon: '../../images/ShareScapeMapIcon3.png'
   			});
			
			$scope.markerHashMap.set(marker, imglink);

			marker.addListener('click', function() {
   				infowindow.open(map, marker);
				
				link = $scope.markerHashMap.get(marker);
				console.log(link);
				$scope.openView(link);
  			})
		}
		
		//Places markers for all posts in $scope.posts
		$scope.makeMarkers = function() {
			for(var i = 0; i < $scope.posts.length; i++){
				$scope.makeMarker($scope.posts[i].pos.lat, $scope.posts[i].pos.lon, $scope.posts[i].title, i, $scope.posts[i].imglink);
			}
			console.log("Markers loaded");
		}

		//Creates info window and centers map on clicked post
		$scope.openInfo = function(x, y, title) {
			infowindow = new google.maps.InfoWindow({
				content: title,
				position: {lat:x, lng:y},
				pixelOffset: new google.maps.Size(0, -35)
			})
   			infowindow.open(map);
			//console.log(google.maps.InfoWindow);
			map.panTo({lat:x, lng:y});
		}

		//Centers map on user location
		$scope.centerOnUser = function() {
			if($scope.userPos) {
				map.panTo({lat: $scope.userPos.lat, lng: $scope.userPos.lon});
				//map.setCenter({lat: $scope.userPos.lat, lng: $scope.userPos.lon});
			}
		}

		//Opens the image view overlay
		$scope.openView = function(link) {
			openView(link);
		}

		//Checks if link ends with an image file extension
		$scope.linkIsImage = function(link) {
			var str = link.substring(link.length - 4);
			if(str == ".jpg" || str == ".png" || str == ".gif")
				return true;
			console.log("Invalid file type");
			return false;
		}
		
		//Verifies if a post is close enough to the user to display
		$scope.haversine = function(lat, lon) {
			return true;
		}

		$scope.haversineDistance = function(lat1, lng1, lat2, lng2) {
			Number.prototype.toRad = function() {
				return this * Math.PI / 180;
			}
			
			var R = 6371e3; // metres
			//console.log("R: " + R);
			var φ1 = lat1.toRad();
			//console.log("φ1: " + φ1);
			var φ2 = lat2.toRad();
			//console.log("φ2: " + φ2);
			var Δφ = (lat2-lat1).toRad();
			//console.log("Δφ: " + Δφ);
			var Δλ = (lng2-lng1).toRad();
			
			var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
					Math.cos(φ1) * Math.cos(φ2) *
					Math.sin(Δλ/2) * Math.sin(Δλ/2);
			//console.log("a: " + a);
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
			//console.log("c: " + c);
			
			var d = R * c;
			d = parseFloat((d/1000).toFixed(2));
			//console.log("d: " + d);
			return d;
		}

		$scope.distancesReturn = function(title){
			var index = $scope.distances.indexOf(title)
			var distance = $scope.distances[index+1]
			return distance + "km"
		}
		
		//Position of the user, set by "js/scripts/script.js" when the user shares position
		$scope.userPos;
		$scope.userLat;
		$scope.userLon;
		
		//Map, set by "js/scripts/script.js" when the user shares position
		$scope.map;

		$scope.markers = [];
		
		$scope.posts = [];

		$scope.distances = $localStorage.distances;
	}])
	
	//Post template
	.directive("postInfo", function() {
		return {
			restrict: "E",
			controller: "MainController",
			scope: {
				info: "="
			},
			templateUrl: "js/directives/postInfo.html"
		};
	})