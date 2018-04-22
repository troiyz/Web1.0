var app = angular.module('angular-poll', [
	'firebase',
	'ui.router',
	'ngSanitize'
]);

app.config(['$stateProvider', '$urlRouterProvider', Config]);

function Config($stateProvider, $urlRouterProvider){
	$stateProvider
		.state('home', {
			url: '/',
			templateUrl: "templates/home.html",
			controller: "HomeCtrl"
		})
		.state('voting', {
			url: '/poll/:pollid',
			templateUrl: "templates/voting.html",
			controller: "VotingCtrl"
		})
		.state('results', {
			url: '/poll/:pollid/results',
			templateUrl: "templates/results.html",
			controller: "ResultsCtrl"
		})
	;
	
	$urlRouterProvider.otherwise("/");
}

app.controller('AppCtrl', ['$scope', AppCtrl]);

function AppCtrl($scope){
	$scope.AppTitle = "Rollie Pollie";
}

app.controller('HomeCtrl', ['$scope', '$state', 'Poll', HomeCtrl]);

function HomeCtrl($scope, $state, Poll){
	// init a new poll which essentially clears the form
	function InitNewPoll(){
		$scope.Poll = {
			Question: "",
			Answers: [{},{},{},{}]		// creates 4 blank options
		};
	}
	
	// Add an available answer to the list
	$scope.AddAnswer = function(){
		$scope.Poll.Answers.push({});
	};
	
	// Clears the input box
	$scope.ClearAnswer = function(Answer) {
		delete Answer.label;
	};
	
	// Submits the poll to Firebase then sends the user to the voting section for this poll
	$scope.CreatePoll = function(){
		Poll.create($scope.Poll).then(function(ref){
			var PollID = ref.key();
            $state.go('voting', {"pollid": PollID});
		});
        // init a new poll
        alert("Done");
		InitNewPoll();
	};
	
	// Removes an available answer from the list
	$scope.RemoveAnswer = function(key){
		if ($scope.Poll.Answers.length > 2) {
			$scope.Poll.Answers.splice(key,1);
		} else {
			alert('At least 2 answers are needed for a poll.');
		}
	};
	
    InitNewPoll();
}

app.controller('VotingCtrl', ['$location','$scope', '$state', '$stateParams', 'Poll', VotingCtrl]);

function VotingCtrl($location, $scope, $state, $stateParams, Poll){
	// Get the poll from Firebase
	$scope.Poll = Poll.get($stateParams.pollid);
	
	$scope.MyVote = {};
	
	// Provide the URL to share
	$scope.PollUrl = $location.absUrl();
	
	// Submit the vote
	$scope.Vote = function(){
		var Answer = $scope.MyVote.Answer;
		// Add a value/vote to the user's vote
		if (Answer.value) {
			Answer.value++;
		} else {
			Answer.value = 1;
		}
		// Sync the changes to firebase then transition to results page for this poll
		$scope.Poll.$save().then(function(ref){
			var PollID = ref.key();
			$state.go('results', {"pollid": PollID});
		});
	};
}

app.controller('ResultsCtrl', ['$location', '$scope', '$stateParams', 'Poll', ResultsCtrl]);

function ResultsCtrl($location, $scope, $stateParams, Poll){
	// Get the poll from firebase
	$scope.Poll = Poll.get($stateParams.pollid);
	
	// Provide the URL to share
	$scope.PollUrl = $location.absUrl();
	
	ChartColours = [
		'AliceBlue',
		'AntiqueWhite',
		'Aqua',
		'AquaMarine',
		'Azure',
		'Beige',
		'Bisque',
		'BlanchedAlmond',
		'Blue',
		'BlueViolet',
		'Brown',
		'BurlyWood',
		'CadetBlue',
		'Chartreuse',
		'Chocolate',
		'Coral',
		'CornflowerBlue',
		'Cornsilk',
		'Crimson',
		'Cyan',
		'DarkBlue',
		'DarkCyan',
		'DarkGoldenRod',
		'DarkSlateBlue',
		'DeepPink',
		'Gold',
		'LightSalmon',
		'LightSkyBlue',
		'Tomato',
		'YellowGreen'
	];
	
	// Get the canvas from the DOM
	var canvas = document.getElementById("ResultsChart").getContext("2d");
	// Make the canvas a doughnut chart
	var ResultsChart = new Chart(canvas);
	
	// Calculates the number of votes for usage with percentages
	function CalcVotes(){
		$scope.TotalVotes = 0;
		angular.forEach($scope.Poll.Answers, function(data){
			$scope.TotalVotes += data.value || 0;
		});
	}
	
	// Formats and renders the chart data
	function RenderChart(){
		var PickedColours = [];
		angular.forEach($scope.Poll.Answers, function(data){
			// add a random colour to each answer
			var RandVal = Math.floor((Math.random()) * (ChartColours.length - 1));
			var colour = ChartColours[RandVal];
			if (PickedColours.length > 0) {
				for (var i = 0; i < PickedColours.length; i++) {
					// Check if this colour has been picked alread
					if (colour === PickedColours[i]) {
						// Colour has already been picked so get a new one
						RandVal = Math.floor((Math.random()) * (ChartColours.length - 1));
						colour = ChartColours[RandVal];
						//reset the counter
						i = 0;
					} 
				}
			}
			// Set the colour
			data.color = colour;
			// Add this colour to the picked colours so it's not used again
			PickedColours.push(colour);
			
			// set a value of 0 if none available yet since !value = broken chartjs
			if (!data.value) {
				data.value = 0;
			}
		})
		// Make the canvas a doughnut chart
		ResultsChart = ResultsChart.Doughnut($scope.Poll.Answers);
		CalcVotes();
	}
	
	// Updates the charts values and number of votes
	function UpdateChart(){
		if (ResultsChart.update) {
			// update the chart segments
			angular.forEach(ResultsChart.segments, function(segment, i){
				ResultsChart.segments[i].value = $scope.Poll.Answers[i].value || 0;
			});
			// update/rerender the chart
			ResultsChart.update();
		}
		CalcVotes();
	}
	
	// Render the chart once the poll data has been loaded from firebase
	$scope.Poll.$loaded().then(function(){
		RenderChart();
	});
	
	// Watch for any changes made to the Poll on firebase and (re)render the chart
	$scope.Poll.$watch(function(){
		UpdateChart();
	});
	
}

app.service('Poll', ['$firebaseArray', '$firebaseObject', Poll]);

function Poll($firebaseArray, $firebaseObject){
	var ref = new Firebase('https://angular-poll.firebaseio.com/');
	var Polls = $firebaseArray(ref);
	
	return {
		"Polls": Polls,
		"create": function(PollData) {
			return this.Polls.$add(PollData);
		},
		"get": function(PollID) {
			return $firebaseObject(ref.child(PollID));
		}
	}
}