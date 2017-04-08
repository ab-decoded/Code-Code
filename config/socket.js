const _ = require("underscore");
const async = require("async");

const url = require('url');
const mongoose = require('mongoose');
const Url = mongoose.model('Url');

const config = require('./config.js');
const redis = require("redis"),
	sub = redis.createClient(config.redis.port,config.redis.host),
    publisher = redis.createClient(config.redis.port,config.redis.host),
    writer = redis.createClient(config.redis.port,config.redis.host);

const REDIS_BUCKET = "code-code.";
const REDIS_SUBSCRIBERS_STRING = "subscribers";
const REDIS_CODE_STRING = "code";

const clients={};

var redis_db_map={
	"code":"data",
	"mode":"language"
};

function broadcast_change(code,current_user_id,message,message_type){
	console.log("Message");
	console.log(message);
	writer.smembers("code_users:"+code,function(err,users){
		if(err)
			console.log("Error in broadcast: "+err);
		else{
			users.forEach(function(user){
				user=JSON.parse(user);
				if(user.connectionid!=current_user_id){
					if(clients[user.connectionid]!==null&&clients[user.connectionid]!==undefined){
						message.type=message_type;
						clients[user.connectionid].write(JSON.stringify(message));	
					}
				}
			});
		}
	});
}


module.exports=function(server,callback) {
	var sockjs=require('sockjs');
	// var connector = sockjs.createServer({ sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js' });
	async.waterfall([
		function(){
			var user; //FIX THIS

			sub.psubscribe(REDIS_BUCKET+"*");
			var connector = sockjs.createServer({ sockjs_url: 'http://cdn.jsdelivr.net/sockjs/1.0.1/sockjs.min.js' });

			sub.on("pmessage",function(pattern,channel,message){
				console.log("Redis subscriber received a message.");
				var parsed_message=JSON.parse(message);
				switch(parsed_message.type){
					case "subscribe":
						console.log("New user: "+user);
						writer.sadd("code_users:"+parsed_message.room,JSON.stringify(_.omit(parsed_message,["type","room"])));
						break;
					case "codeChange":
						writer.hset("code_change:"+parsed_message.room,"code",parsed_message.code);
						break;
					case "modeChange":
						writer.hset("code_change:"+parsed_message.room,"mode",parsed_message.mode);
						break;
				}
			});

			connector.on('connection',function(conn){
				var room=url.parse(conn.url,true).query.code;
				clients[conn.id]=conn;
				console.log('Socket chala iss code pe!: '+room);

				// subscribers_redis.subscribe("subscribers:"+code);
				// code_redis.subscribe("code:"+code);

				
				conn.on('close',function(){
					
					//Remove user from subscribers list in Redis cache
					if(user!==null&&user!==undefined){
						writer.srem("code_users:"+room,user);
						// console.log(user);
						console.log('Gaya connection!: '+room);
					}
					
					//Remove conn from connected clients
					delete clients[conn.id];

					//Write the data to MongoDB
					writer.hmget('code_change:'+room,"code","mode",function(err,values){
						if(err){
							console.log('Could not read code from Redis Cache while writing to MongoDb: '+err);
						}
						else{
							console.log(values);
							Url.findOne({ url: room }, function (err, doc){
							  doc.data = values[0];
							  doc.language = values[1];
							  doc.save();
							});
						}
					});

					//If the last instance of a code exits, the data is removed from Redis cache
					writer.smembers("code_users:"+room,function(err,users){
						if(err){
							console.log("Error reading members info subscribed for the code: "+err);
							return;
						}
						if(users===null||users.length===0){
							console.log("code changes removed from Redis: ",room);
							sub.del("code_change:"+room,"code");
						}
					});

				});

				conn.on('data',function(msg){
					msg=JSON.parse(msg);
					var _code;
					switch(msg.type){
						case "connection":
							var _user={
								type:"subscribe",
								username:msg.username,
								userid:msg.userid,
								connectionid:conn.id,
								room:room
							};
							user=JSON.stringify(_user);
							publisher.publish(REDIS_BUCKET+REDIS_SUBSCRIBERS_STRING,user);
							break;
						case "codeChange":
							_code={
								type:"codeChange",
								code:msg.code,
								room:room
							};
							broadcast_change(room,conn.id,msg.change,msg.type);
							publisher.publish(REDIS_BUCKET+REDIS_CODE_STRING,JSON.stringify(_code));
							break;
						case "modeChange":
							_code={
								type:"modeChange",
								mode:msg.change.mode,
								room:room
							};
							broadcast_change(room,conn.id,msg.change,msg.type);
							publisher.publish(REDIS_BUCKET+REDIS_CODE_STRING,JSON.stringify(_code));
							break;
					}
				});

			});
			connector.installHandlers(server,{prefix:'/socket_swag'});


		},
		function(){
			return callback;
		}],function(err,res){
		if(err)
			console.log("ERROR in Socket: "+err);
	});
	

	// connector.on('connection',function(conn){
	// 	var code=url.parse(conn.url,true).query.code;
	// 	clients[conn.id]=conn;
	// 	var user;
	// 	console.log('Socket chala iss code pe!: '+code);
		
	// 	var subscribers_redis=redis.createClient(config.redis.port,config.redis.host);
	// 	var code_redis=redis.createClient(config.redis.port,config.redis.host);

	// 	subscribers_redis.subscribe("subscribers:"+code);
	// 	code_redis.subscribe("code:"+code);

	// 	subscribers_redis.on("message",function(channel,message){
	// 		console.log("New user: "+user);
	// 		client.sadd("code_users:"+code,message);
	// 	});

	// 	code_redis.on("message",function(channel,message){
	// 		var code_change=JSON.parse(message);
	// 		switch(code_change.type){
	// 			case "codeChange":
	// 				client.hset("code_change:"+code,"code",code_change.code);
	// 				break;
	// 			case "modeChange":
	// 				client.hset("code_change:"+code,"mode",code_change.mode);
	// 				break;
	// 		}
	// 	});

		
	// 	conn.on('close',function(){
			
	// 		//Remove user from subscribers list in Redis cache
	// 		if(user!==null&&user!==undefined){
	// 			client.srem("code_users:"+code,user);
	// 			// console.log(user);
	// 			console.log('Gaya connection!: '+code);
	// 		}
			
	// 		//Remove conn from connected clients
	// 		delete clients[conn.id];

	// 		//Write the data to MongoDB
	// 		client.hmget('code_change:'+code,"code","mode",function(err,values){
	// 			if(err){
	// 				console.log('Could not read code from Redis Cache while writing to MongoDb: '+err);
	// 			}
	// 			else{
	// 				console.log(values);
	// 				Url.findOne({ url: code }, function (err, doc){
	// 				  doc.data = values[0];
	// 				  doc.language = values[1];
	// 				  doc.save();
	// 				});
	// 			}
	// 		});

	// 		//If the last instance of a code exits, the data is removed from Redis cache
	// 		client.smembers("code_users:"+code,function(err,users){
	// 			if(err){
	// 				console.log("Error reading members info subscribed for the code: "+err);
	// 				return;
	// 			}
	// 			if(users===null||users.length===0){
	// 				console.log("code changes removed from Redis: ",code);
	// 				client.del("code_change:"+code,"code");
	// 			}
	// 		});

	// 	});

	// 	conn.on('data',function(msg){
	// 		msg=JSON.parse(msg);
	// 		var _code;
	// 		switch(msg.type){
	// 			case "connection":
	// 				var _user={
	// 					username:msg.username,
	// 					userid:msg.userid,
	// 					connectionid:conn.id
	// 				};
	// 				user=JSON.stringify(_user);
	// 				console.log("Jaaneman main chal raha hoon!");
	// 				publisher.publish('subscribers:'+code,user);
	// 				break;
	// 			case "codeChange":
	// 				_code={
	// 					type:"codeChange",
	// 					code:msg.code
	// 				};
	// 				broadcast_change(code,conn.id,msg.change,msg.type);
	// 				publisher.publish('code:'+code,JSON.stringify(_code));
	// 				break;
	// 			case "modeChange":
	// 				_code={
	// 					type:"modeChange",
	// 					mode:msg.change.mode
	// 				};
	// 				broadcast_change(code,conn.id,msg.change,msg.type);
	// 				publisher.publish('code:'+code,JSON.stringify(_code));
	// 				break;
	// 		}
	// 	});

	// });

	// connector.installHandlers(server,{prefix:'/socket_swag'});
};



// http://jinzhangg.github.io/posts/2013/sockjs-redis-nodejs-tutorial/
// http://www.phloxblog.in/redis-commands-with-node-js/#.V8BN13V96Uk