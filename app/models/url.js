const app = require('../../index');
const mongoose = require('mongoose');

const UrlSchema=mongoose.Schema({
	created:Date,
	url:String,
	data:String,
	language:String,
	owner:String,
	messages:[{
		body: String,
		created: Date,
		userName: String
	}]
});

UrlSchema.methods.info = function(){
	console.log("New URL created: "+ this.url + " Created at: "+ this.created);
};

const Url=mongoose.model('Url',UrlSchema);

