mongoose=require('mongoose');
Chat = mongoose.model('Url');

exports.index = function(req,res){
	return res.render('code/code');
};

exports.urlExists = function(req,res){
	Url.findOne({
		'url':req.query.url.toLowerCase()
	}).exec(function(err,msg){
		if(err){
			console.log(err);
			return true;
		}
		else{
			return false;
		}
	});
}