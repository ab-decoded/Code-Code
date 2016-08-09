const app = require('../../index');
const mongoose = require('mongoose');

const UrlSchema=mongoose.Schema({
	created:Date,
	url:String,
	data:String,
	language:String,
	messages:[{
		body: String,
		created: Date,
		userName: String
	}]
});

const Url=mongoose.model('Url',UrlSchema);

