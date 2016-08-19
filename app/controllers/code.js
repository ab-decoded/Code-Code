mongoose=require('mongoose');
Url = mongoose.model('Url');

exports.index = function(req,res){
	return res.render('code/code');
};

exports.urlController= function(req,res){
	var url = req.query.url;
	var slugPattern=new RegExp("^[a-z0-9-]+$");
	if(slugPattern.test(url)){
		Url.find({
			'url':url
		}).exec(function(err,msgs){
			if(err)
				return console.log("Error in finding Code URL: "+err);
			else{
				if(msgs.length){
					console.log('Url '+ url +" already exists.");
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