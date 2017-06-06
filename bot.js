console.log('Movie Release Bot is Starting!');

var Twit = require('twit');
var config = require('./config');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var moment = require('moment');

var T = new Twit(config);

var stream = T.stream('user');

stream.on('tweet', movieRequest);

//main function for requesting a movie and tweeting its release date
//format is @moviereleasebot !title for general,
//and @moviereleasebot ?title/year for films with same name
function movieRequest(eventMsg){
	// var fs = require('fs');
	// var json = JSON.stringify(eventMsg, null, 2);
	// fs.writeFile("tweet.json", json);

	var replyto = eventMsg.in_reply_to_screen_name;
	var tweetText = eventMsg.text;
	var from = eventMsg.user.screen_name;
	var movieTitle = tweetText.substring(17, tweetText.length);

	if(replyto === 'moviereleasebot'){
		var releaseInfo;
		if(!movieTitle.includes("/")){
			releaseInfo = getReleaseDate(movieTitle);
		}
		else {
			var array = movieTitle.split("/");
			releaseInfo = getReleaseDateWithYear(array[0], array[1]);
		}
		console.log(releaseInfo);

		var releaseFormat = moment(releaseInfo.release).format("MMMM Do, YYYY");

		if(releaseInfo != "Nothing"){
			if(!moment(releaseInfo.release).isAfter(moment())){
				var replyTweet = '.@' + from + ' ' + releaseInfo.title + ' was released ' + releaseFormat + '. *beep* *boop*';
				tweet(replyTweet);
			}
			else{
				var replyTweet = '.@' + from + ' ' + releaseInfo.title + ' will be released ' + releaseFormat + '. *beep* *boop*';
				tweet(replyTweet);
			}
		}
		else{
			tweet('.@' + from + ' I am sorry, it seems here are no films by that name.');
		}
	}
}

//tweet function to send a tweet
function tweet(text){
	var tweet = {
		status: text
	}

	T.post('statuses/update', tweet, tweeted);

	function tweeted(err, data, response){
		if(err){
			console.log(err);
		} 
		else {
			console.log("It worked!");
		}
	}
}

//used for API calls
function Get(yourUrl){
    var Httpreq = new XMLHttpRequest();
    Httpreq.open("GET",yourUrl,false);
    Httpreq.send(null);
    return Httpreq.responseText;          
}

//general release date function
function getReleaseDate(movieTitle){
	var movieUrl = 'https://api.themoviedb.org/3/search/movie?api_key=feae45a67d6335347f12949a4fe25c77&language=en-US&query='+ movieTitle+ '&page=1&include_adult=false&region=US';

	var json = JSON.parse(Get(movieUrl));

	console.log(json);
	console.log(json.total_results);

	if(json.total_results !== 0){
		for(var i = 0; i < json.results.length; i++){
			if(json.results[i].title.toUpperCase() === movieTitle.toUpperCase()){
				var movieInfo = makeMovie(json.results[i].title, json.results[i].release_date);
				return movieInfo;
			}
		}
		return "Nothing";
	}
	else{
		return "Nothing";
	}

}

//function for when two films have the exact same name
function getReleaseDateWithYear(movieTitle, year){
	var movieUrl = 'https://api.themoviedb.org/3/search/movie?api_key=feae45a67d6335347f12949a4fe25c77&language=en-US&query='+ movieTitle+ '&page=1&include_adult=false&region=US&year='+year;

	var json = JSON.parse(Get(movieUrl));

	console.log(json);
	console.log(json.total_results);

	if(json.total_results !== 0){
		for(var i = 0; i < json.results.length; i++){
			if(json.results[i].title.toUpperCase() === movieTitle.toUpperCase()){
				var movieInfo = makeMovie(json.results[i].title, json.results[i].release_date);
				return movieInfo;
			}
		}
		return "Nothing";
	}
	else{
		return "Nothing";
	}
}

//function to return a movie object
function makeMovie(title, release){
	var obj = {
		title: title,
		release: release
	};

	return obj;
}

