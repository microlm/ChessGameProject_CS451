
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , bodyParser = require('body-parser');

var app = express();

var queueName = [];
var queueCheck = [];
var opponents = {};
var checkInTimes = {};
var games = {};
var gamesMessages = {};

var callTimesTillCheck = 10;
var currentCallTimes = 0;
var timeLimit = 10;

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));

// allow JSON requests
app.use(express.bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded ({extended: true}));
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

function sendMessageToUser(res, status, message)
{
	res.status(status);
	res.send(message);
}

app.post('/submitMove', function saveMove(req, res){
	console.log("submitted a move");
	games[req.body.user][0] = 0; 
	games[req.body.user][1] = req.body.update;
	res.send("Move saved");
});

app.post('/postMessage', function message(req, res){
	gamesMessages[req.body.user][0] = 0;
	gamesMessages[req.body.user][1] = req.body.update;
	res.send("Waiting for response...");
});


app.post('/getState', function getState(req, res){
	
	if(req.body.user in games)
	{
		var numViewed = parseInt(games[req.body.user][0]);
		if(numViewed < 2)
		{
			res.send(games[req.body.user][1]);
			console.log("got state " + games[req.body.user][1]);
			numViewed = numViewed + 1;
			games[req.body.user][0] = numViewed.toString();
		}
		else
		{
			res.send("");
		}
	}

});

app.post('/getGameMessage', function(req, res){
	checkInTimes[req.body.userName] = new Date().getTime()/1000;
	currentCallTimes = currentCallTimes + 1;
	
	if(currentCallTimes >= callTimesTillCheck)
	{
		currentCallTimes = 0;
		console.log("I'm checking....");
		var currentTime = new Date().getTime() / 1000;
		for (var player in checkInTimes)
		{
			if(currentTime - checkInTimes[player] > timeLimit)
			{
				console.log("oh shit it's been awhile");
				var opponent = opponents[player];
				
				if(currentTime - checkInTimes[opponent] > timeLimit)
				{
					console.log("The opponent is gone too!");
					if(req.body.gameName in games)
					{
						delete games[req.body.gameName];
						delete gamesMessages[req.body.gameName];
					}
				}
				else
				{
					console.log("But the opponent is still here");
					if(req.body.gameName in gamesMessages)
					{
						gamesMessages[req.body.gameName][0] = 0;
						gamesMessages[req.body.gameName][1] = "Player has forfeit";
					}
				}
			}
		}
	}
	
	var numViewed = parseInt(gamesMessages[req.body.gameName][0]);
	if(numViewed < 2)
	{
		res.send(gamesMessages[req.body.gameName][1]);
		console.log("got game message " + gamesMessages[req.body.gameName][1]);
		numViewed = numViewed + 1;
		gamesMessages[req.body.gameName][0] = numViewed.toString();
	}
	else
	{
		res.send("");
	}
	
});

app.post('/join', function(req, res){
	console.log(queueName.indexOf(req.body.user));
	
	var opponent = null;
	var valid = true;
	var currentTime = new Date().getTime() / 1000;
	
	if(queueName.indexOf(req.body.user) >= 0)
	{
		valid = false;
		res.send('Name is already in use!');
	}
	else if(req.body.user in opponents)
	{
		if(currentTime - checkInTimes[req.body.user] > 1.5)
		{
			delete checkInTimes[req.body.user];
			delete opponents[req.body.user];
		}
		else
		{
			res.send('Name is already in use!');
			valid = false;
		}
		
	}
	
	if(valid)
	{
		queueName.push(req.body.user);
		queueCheck.push(currentTime);
		res.send('Waiting for opponent');
		
		var player1Name = "";
		var player2Name = "";
		console.log(queueName.length);
		while(queueName.length > 0)
		{
			var candidate = queueName.shift();
			var candidateTime = queueCheck.shift();
	
			if(player1Name == "")
			{
				if(currentTime - candidateTime < 1.5)
				{
					player1Name = candidate;
				}
				
			}
			else if(player2Name == "")
			{
				console.log('Here we gooooo');
				if(currentTime - candidateTime < 1.5)
				{
					player2Name = candidate;
					var name = player1Name + " vs " + player2Name;
					games[name] = ['0', ''];
					gamesMessages[name] = ['0', ''];
					opponents[player1Name] = name;
					opponents[player2Name] = name;
					
					var time = new Date().getTime() / 1000;
					checkInTimes[player1Name] = time;
					checkInTimes[player2Name] = time;
					
					player1Name = "";
					player2Name = "";
				}
			}
		}
	}
	
	if(player1Name != "")
	{
		queueName.push(player1Name);
		queueCheck.push(new Date().getTime() / 1000);
	}
});

app.post('/getOpponent', function(req, res){
	if(req.body.user in opponents)
	{
		var name = opponents[req.body.user];
		res.send(name);
	}
	else
	{
		queueCheck[queueName.indexOf(req.body.user)] = new Date().getTime() / 1000;
		res.send("Waiting...");
	}
});

app.post('/removeGame', function(req, res){
	if(req.body.game in games)
	{
		delete games[req.body.game];
		delete gamesMessages[req.body.game];
		
		res.send("Finished!");
	}
});

app.post('/leaveGame', function(req, res){
	if(req.body.userName in opponents)
	{
		delete opponents[req.body.userName];
		delete checkInTimes[req.body.userName];
	}
	
	res.send("Removed");
});

app.listen(app.get('port'), function serverListen(){
	console.log('listening on port ', app.get('port'));
});
