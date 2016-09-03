const app = require('../../index');
const mongoose = require('mongoose');

const BoardSchema=mongoose.Schema({
	created:Date,
	url:String,
	owner:String,
	paths:[String]
});

BoardSchema.methods.info = function(){
	console.log("New Drawingboard created: "+ this.url + " Created at: "+ this.created);
};

const Board=mongoose.model('Board',BoardSchema);

