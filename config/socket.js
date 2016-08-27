const url=require('url');
const mongoose=require('mongoose');
const Url = mongoose.model('Url');

const config=require('./config.js');
const redis = require("redis"),
	client = redis.createClient(config.redis.port,config.redis.host),
    publisher = redis.createClient(config.redis.port,config.redis.host);

const clients={};

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
		
		var subscribers_redis=redis.createClient(config.redis.port,config.redis.host);
		var code_redis=redis.createClient(config.redis.port,config.redis.host);

		subscribers_redis.subscribe("subscribers:"+code);
		code_redis.subscribe("code:"+code);

		subscribers_redis.on("message",function(channel,message){
			client.sadd("code_users:"+code,message);
		});

		code_redis.on("message",function(channel,message){
			client.hset("code_text:"+code,"code",message);
		});

		
		conn.on('close',function(){
			
			//Remove user from subscribers list in Redis cache
			if(user!==null){
				client.srem("code_users:"+code,user);
				// console.log(user);
				console.log('Gaya connection!: '+code);
			}
			
			//Remove conn from connected clients
			delete clients[conn.id];

			//Write the data to MongoDB
			client.hget('code_text:'+code,"code",function(err,text){
				if(err){
					console.log('Could not read code from Redis Cache while writing to MongoDb: '+err);
				}
				else{
					Url.findOne({ url: code }, function (err, doc){
					  doc.data = text;
					  doc.save();
					});
				}
			});

			//If the last instance of a code exits, the data is removed from Redis cache
			client.smembers("code_users:"+code,function(err,users){
				if(err){
					console.log("Error reading members info subscribed for the code: "+err);
					return;
				}
				if(users===null||users.length===0){
					client.del("code_text:"+code,"code");
				}
			});

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
				publisher.publish('code:'+code,msg.code);
				console.log(msg);
			}
		});

	});

	connector.installHandlers(server,{prefix:'/socket_swag'});
};



// http://jinzhangg.github.io/posts/2013/sockjs-redis-nodejs-tutorial/
// http://www.phloxblog.in/redis-commands-with-node-js/#.V8BN13V96Uk