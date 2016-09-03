mongoose=require('mongoose');
Url = mongoose.model('Url');
Board=mongoose.model('Board');

var async=require("async");
var redis = require("redis"),
	client = redis.createClient(config.redis.port,config.redis.host);


exports.index = function(req,res){
	var url=require('url').parse(req.url).pathname.replace("/board/","");
	if(req.query.new&&req.query.new==="true"){
		var newBoard=new Board({
			created:Date(),
			url:url,
			paths:[]
		});
		return newBoard.save(function(err,newBoard){
			if(err) {
				console.log("Error in created new board: "+err);
				return res.render('drawingboard/drawingboard',{error:err,paths:[]});
			}
			else {
				newBoard.info();
				return res.render('drawingboard/drawingboard',{new:true,created:newBoard.created});
			}
		});
	}
	else{
		Board.find({
			'url':url
		}).exec(function(err,msgs){
			client.lrange("paths:"+url,0,-1,function(err,paths){
				if(!err){
					if(!paths.length){
						var x=msgs[0].paths;
						if(x&&x.length){
							x.unshift('paths:'+url);
							client.lpush.apply(client,x);
						}
					}
				}
				return res.render('drawingboard/drawingboard');
			});
		});
	}
};


exports.getPaths = function(req,res){
	console.log('here')
	var url= req.query.url;
	client.lrange('paths:'+url,0,-1,function(err,paths){
		if(err)
			return res.json({'paths':[],"error":err});
		else
			return res.json({'paths':paths});
	});
};


