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
						switch(message_type){
							case "codeChage":
								clients[user.connectionid].emit("codeChangeSet",JSON.stringify(message));	
								break;
							case "modeChange":	
								clients[user.connectionid].emit("modeChangeSet",JSON.stringify(message));	
								break;
						}
					}
				}
			});
		}
	});
}

function removePropFromJSON(obj,properties){
	return _.omit(obj,properties);
}

module.exports=function(server,callback) {
	var io=require('socket.io')(server);
	async.waterfall([
		function(){

			sub.psubscribe(REDIS_BUCKET+"*");

			sub.on("pmessage",function(pattern,channel,message){
				console.log("Redis subscriber received a message.");
				var parsed_message=JSON.parse(message);
				var message_type=parsed_message.type;
				var message_room=parsed_message.room;
				parsed_message=removePropFromJSON(parsed_message,["type","room"]);
				switch(message_type){
					case "subscribe":
						writer.sadd("code_users:"+message_room,JSON.stringify(parsed_message));
						break;
					case "codeChange":
						writer.hset("code_change:"+message_room,"code",parsed_message.code);
						break;
					case "modeChange":
						writer.hset("code_change:"+message_room,"mode",parsed_message.mode);
						break;
				}
			});

			io.of('/socket_swag').on('connection',function(conn){
				var user; //FIX THIS			
				var room=url.parse(conn.handshake.url,true).query.code;
				clients[conn.id]=conn;
				console.log('Socket chala iss code pe!: '+room);

				// subscribers_redis.subscribe("subscribers:"+code);
				// code_redis.subscribe("code:"+code);

				
				conn.on('disconnect',function(){
					//Remove user from subscribers list in Redis cache
					if(user!==null&&user!==undefined){
						var temp_user = JSON.stringify(removePropFromJSON(JSON.parse(user),["type","room"]));
						console.log("Fucked: "+temp_user);
						writer.srem("code_users:"+room,temp_user);
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
							writer.del("code_change:"+room,"code");
						}
					});

				});

				conn.on('connected',function(msg){
					msg=JSON.parse(msg);

					var _user={
						type:"subscribe",
						username:msg.username,
						userid:msg.userid,
						connectionid:conn.id,
						room:room
					};
					user=JSON.stringify(_user);
					publisher.publish(REDIS_BUCKET+REDIS_SUBSCRIBERS_STRING,user);
				});

				conn.on('modeChanged',function(msg){
					msg=JSON.parse(msg);
					_code={
						type:"modeChange",
						mode:msg.change.mode,
						room:room
					};
					broadcast_change(room,conn.id,msg.change,msg.type);
					publisher.publish(REDIS_BUCKET+REDIS_CODE_STRING,JSON.stringify(_code));
				});

				conn.on('codeChanged',function(msg){
					msg=JSON.parse(msg);
					_code={
						type:"codeChange",
						code:msg.change.code,
						room:room
					};
					publisher.publish(REDIS_BUCKET+REDIS_CODE_STRING,JSON.stringify(_code));
				});


				// conn.on('data',function(msg){
				// 	msg=JSON.parse(msg);
				// 	var _code;
				// 	console.log(msg);
				// 	switch(msg.type){
				// 		case "connection":
				// 			var _user={
				// 				type:"subscribe",
				// 				username:msg.username,
				// 				userid:msg.userid,
				// 				connectionid:conn.id,
				// 				room:room
				// 			};
				// 			user=JSON.stringify(_user);
				// 			publisher.publish(REDIS_BUCKET+REDIS_SUBSCRIBERS_STRING,user);
				// 			break;
				// 		case "codeChange":
				// 			_code={
				// 				type:"codeChange",
				// 				code:msg.code,
				// 				room:room
				// 			};
				// 			broadcast_change(room,conn.id,msg.change,msg.type);
				// 			publisher.publish(REDIS_BUCKET+REDIS_CODE_STRING,JSON.stringify(_code));
				// 			break;
				// 		case "modeChange":
				// 			_code={
				// 				type:"modeChange",
				// 				mode:msg.change.mode,
				// 				room:room
				// 			};
				// 			broadcast_change(room,conn.id,msg.change,msg.type);
				// 			publisher.publish(REDIS_BUCKET+REDIS_CODE_STRING,JSON.stringify(_code));
				// 			break;
				// 	}
				// });

			});


		},
		function(){
			return callback;
		}],function(err,res){
		if(err)
			console.log("ERROR in Socket: "+err);
	});
	

};



// http://jinzhangg.github.io/posts/2013/sockjs-redis-nodejs-tutorial/
// http://www.phloxblog.in/redis-commands-with-node-js/#.V8BN13V96Uk