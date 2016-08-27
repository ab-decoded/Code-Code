mongoose=require('mongoose');
Url = mongoose.model('Url');
var redis = require("redis"),
	client = redis.createClient(config.redis.port,config.redis.host);

var slugPattern=new RegExp("^[a-z0-9-]+$");

exports.index = function(req,res){
	var url=req.url.replace("/","");
	if(slugPattern.test(url)){
		Url.find({
			'url':url
		}).exec(function(err,msgs){
			if(msgs.length){
				console.log('Url '+url + " already exists.");
				client.hexists("code_text:"+url,"code",function(err,exists){
					if(err){
						console.log("Error in searching code in Redis cache: "+err);
						return res.render('code/code',{"code":""});
					}else{
						var code="";
						if(exists===0){
							client.hset('code_text:'+url,"code",msgs[0].data);
						}
						client.hget('code_text:'+url,"code",function(err,code){
							if(err){
								console.log('Could not load code from Redis Cache: '+err);
								return res.render('code/code',{"code":''});
							}
							else{
								console.log(code);
								return res.render('code/code',{"code":encodeURI(code)});
							}
						});
					}
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
						language:"plain-text",
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