var url=require('url');

var config=require('./config.js');
var redis = require("redis"),
	client = redis.createClient(config.redis.port,config.redis.host),
    publisher = redis.createClient(config.redis.port,config.redis.host);

var clients={};	

function broadcast_change(code,current_user_id,message){
	client.smembers("code_users:"+code,function(err,users){
		if(err)
			console.log("Error in broadcast: "+err);
		else{
			users.forEach(function(user){
				user=JSON.parse(user);
				if(user.connectionid!=current_user_id){
					if(clients[user.connectionid]!==null&&clients[user.connectionid]!==undefined)
						clients[user.connectionid].write(JSON.stringify(message));	
				}
			});
		}
	});
}


module.exports=function(server) {
	var sockjs=require('sockjs');
	var connector = sockjs.createServer({ sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js' });


	connector.on('connection',function(conn){

		var code=url.parse(conn.url,true).query.code;
		clients[conn.id]=conn;
		var user;
		console.log('Socket chala iss code pe!: '+code);
		
		var browser=redis.createClient(config.redis.port,config.redis.host);

		browser.subscribe("subscribers:"+code);

		browser.on("message",function(channel,message){
			client.sadd("code_users:"+code,message);
		});
		
		conn.on('close',function(){
			if(user!==null){
				client.srem("code_users:"+code,user);
				// console.log(user);
				console.log('Gaya connection!: '+code);
			}
			delete clients[conn.id];
		});

		conn.on('data',function(msg){
			msg=JSON.parse(msg);
			if(msg.type==="connection"){
				var _user={
					username:msg.username,
					userid:msg.userid,
					connectionid:conn.id
				};
				user=JSON.stringify(_user);
				publisher.publish('subscribers:'+code,user);
			}
			else if(msg.type==="codeChange"){
				broadcast_change(code,conn.id,msg.change);
				console.log(msg);
			}
			// io.emit('chat message',msg);
		});

		// conn.on('live feed',function(msg){
		// 	console.log('Live feed: '+msg);
		// 	socket.broadcast.emit('live feed',msg);
		// });
	});

	connector.installHandlers(server,{prefix:'/socket_swag'});
};



// http://jinzhangg.github.io/posts/2013/sockjs-redis-nodejs-tutorial/