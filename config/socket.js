module.exports=function(server) {
	var sockjs=require('sockjs');
	var connector = sockjs.createServer({ sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js' });

	connector.on('connection',function(conn){
		console.log('Socket chal gaya!');
		
		conn.on('close',function(){
			console.log('Gaya connection!');
		});

		conn.on('chat message',function(msg){
			console.log('Gopu bolta hai: '+msg);
			io.emit('chat message',msg);
		});

		conn.on('live feed',function(msg){
			console.log('Live feed: '+msg);
			socket.broadcast.emit('live feed',msg);
		});
	});

	connector.installHandlers(server,{prefix:'/socket_swag'});
};