/* Importar librerias */
var express  = require('express'),
	app      = express(),
	server   = require('http').createServer(app),
	io       = require('socket.io').listen(server),
	swig     = require('swig'),
	cons     = require('consolidate'),
	uuid     = require('node-uuid'),
	ToDoTask = [],
	ToDoComment = [],
	ToDoNotification = [];

swig.init({
	cache : false
});

app.engine('.html', cons.swig);
app.set('view engine', 'html');

app.use(express.static('./static'));

app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.methodOverride());


/* GET a / */
app.get('/', function (req, res) {
	res.render('index');
});


/* ####  Task  #### */
app.get('/ToDoTask', function (req, res) {
	res.send(ToDoTask);
});

app.post('/ToDoTask', function (req, res){
	req.body.id = uuid.v1();

	ToDoTask.push(req.body);

	io.sockets.emit('ToDoList::create', req.body);

	res.send(200, {status:"Ok"});
});

app.delete('/ToDoTask/:id', function (req, res){
	var ToDoList;

	for (var i = ToDoTask.length - 1; i >= 0; i--) {
		ToDoList = ToDoTask[i];

		if(ToDoList.id === req.params.id){
			ToDoTask.splice(i,1);
		}
	}

	io.sockets.emit('ToDoList::delete', {id:req.params.id});

	res.send(200, {status:"Ok"});
});

app.put('/ToDoTask/:id', function (req, res){
	var ToDoList;

	for (var i = ToDoTask.length - 1; i >= 0; i--) {
		ToDoList = ToDoTask[i];

		if(ToDoList.id === req.params.id){
			ToDoTask[i] = req.body;
		}
	};

	io.sockets.emit('ToDoList::update', req.body);

	res.send(200, {status:"Ok"});
});
/* ####  Task  #### */



/* ####  Comment  #### */
app.get('/ToDoComment', function (req, res) {
	res.send(ToDoComment);
});

app.post('/ToDoComment', function (req, res){
	req.body.id = uuid.v1();


	ToDoComment.push(req.body);

	io.sockets.emit('ToDoComment::create', req.body);

	res.send(200, {status:"Ok"});
});
/* ####  Comment  #### */



/* ####  Notification  #### */
app.get('/ToDoNotification', function (req, res) {
	res.send(ToDoNotification);
});

app.post('/ToDoNotification', function (req, res){
	req.body.id = uuid.v1();

	ToDoNotification.push(req.body);

	io.sockets.emit('ToDoNotification::create', req.body);

	res.send(200, {status:"Ok"});
});
/* ####  Notification  #### */

channel = "notification";
var connection = function(socket){
	/* #### Join to channel #### */
	socket.on('channel', function(channel) {
        socket.join(channel);
    });

	/* Events Sockets for Tasks */
	socket.on('ToDoList::create', function(data){
		ToDoTask.push(data);
		socket.broadcast.emit('ToDoList::create', data);
		io.sockets.in(channel).emit('message',data);
	});
	socket.on('ToDoList::delete', function(data){
		socket.broadcast.emit('ToDoList::delete', data);
	});
	socket.on('ToDoList::update', function(data){
		socket.broadcast.emit('ToDoList::update', data);
		io.sockets.in(channel).emit('message',data);
	});


	/* Events Sockets for comments */
	socket.on('ToDoComment::create', function(data){
		ToDoComment.push(data);
		socket.broadcast.emit('ToDoComment::create', data);
		io.sockets.in(channel).emit('message',data);
	});


	/* Events Sockets for notification */
	socket.on('ToDoComment::create', function(data){
		ToDoNotification.push(data);
		socket.broadcast.emit('ToDoComment::create', data);
	});
};

io.sockets.on('connection', connection);

server.listen(3000);
console.log('Go to http://localhost:3000 for the ToDo');
