mongoose=require('mongoose');
Chat = mongoose.model('Chat');

exports.index = function(req,res){
	return res.render('chat/index');
};

exports.messages=function(req,res){
	Chat.find({
		'room':req.query.room.toLowerCase()
	}).exec(function(err,msgs){

	});
};
