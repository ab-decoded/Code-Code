mongoose=require('mongoose');
Url = mongoose.model('Url');
var async=require("async");
var redis = require("redis"),
	client = redis.createClient(config.redis.port,config.redis.host);

var slugPattern=new RegExp("^[a-z0-9-]+$");

var redis_db_map={
	"code":"data",
	"mode":"language"
};

function check_in_redis_or_get_from_db(key,url,msg,callback){
	client.hexists("code_change:"+url,key,function(err,exists){
		if(err){
			console.log("Error in searching code in Redis cache: "+err);
			callback(null,"");
		}else{
			var value="";
			if(exists===0){
				client.hset('code_change:'+url,key,msg[redis_db_map[key]],function(){
					console.log("Setting " + key + " in redis: "+url);
					// Page refresh causes problem.
					// First the GET request arrives, then the previous Socket connection is broken, and the new connection is established.
				});
			}
			client.hget('code_change:'+url,key,function(err,value){
				if(err){
					console.log('Could not load code from Redis Cache: '+err);
					callback(null,"");
				}
				else{
					console.log(value);
					callback(null,value);
				}
			});
		}
	});	
}

exports.index = function(req,res){
	var url=req.url.replace("/","");
	if(slugPattern.test(url)){
		Url.find({
			'url':url
		}).exec(function(err,msgs){
			if(msgs.length){
				console.log('Url '+url + " already exists.");
				var params={};

				async.series({
				    code:function(callback){
				    	encodeURI(check_in_redis_or_get_from_db("code",url,msgs[0],callback));
				    },
				    mode:function(callback){
				    	check_in_redis_or_get_from_db("mode",url,msgs[0],callback);
					}
				}, function(err, results) {
					console.log(results);
					return res.render("code/code",results);
				});

			}
			else{
				req.flash('error','No such code-URL exists. Please create a new one.');
				return res.redirect('/');
			}
		});
	}else{
		req.flash('error','Please follow the regex.');
		return res.redirect('/');
	}
};

exports.urlController= function(req,res){
	var url = req.query.url;
	if(slugPattern.test(url)){
		Url.find({
			'url':url
		}).exec(function(err,msgs){
			if(err)
				return console.log("Error in finding Code URL: "+err);
			else{
				if(msgs.length){
					console.log('Url '+ url + " already exists.");
					return res.json({"status":"success","urlExists":true,"created":false,url:msgs[0].url});
				}
				else{
					var newCodeUrl=new Url({
						created:Date(),
						url:url,
						data:"",
						language:"Plain Text",
						messages:[]
					});
					return newCodeUrl.save(function(err,newCodeUrl){
						if(err) {
							console.log("Error in created new code Url: "+err);
							return res.json({"status":"failed","error":err});
						}
						else {
							newCodeUrl.info();
							return res.json({"status":"success","urlExists":false,"created":true,url:newCodeUrl.url});
						}
					});
				}
			}
		});
	}
	else{
		return res.json({"status":"failed","error":"The identifier must be represented as a slug(RegExp: /^[a-zA-Z0-9-]+$/)"});
	}
};