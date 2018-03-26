// app/models/type.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var TypeSchema 	= new Schema({
	tag 	:String,
	name	:String,
	subType	:[TypeSchema]
});

module.exports = mongoose.model('Type', TypeSchema);