const app = require('../../index');
const mongoose = require('mongoose');

const ChatSchema=mongoose.Schema({
	created:Date,
	content:String,
	username:String,
	room:String
});

const Chat=mongoose.model('Chat',ChatSchema);

