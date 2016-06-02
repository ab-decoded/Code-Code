module.exports=function(server) {
	var io = require('socket.io')(server);
	io.on('connection',function(socket){
		console.log('Socket chal gaya!');
		
		socket.on('disconnect',function(){
			console.log('Gaya connection!');
		});

		socket.on('chat message',function(msg){
			console.log('Gopu bolta hai: '+msg);
			io.emit('chat message',msg);
		});

		socket.on('live feed',function(msg){
			console.log('Live feed: '+msg);
			socket.broadcast.emit('live feed',msg);
		});
	});
};