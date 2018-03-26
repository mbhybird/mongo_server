// app/models/topictype.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var TopicTypeSchema = new Schema({
	name 	:String,
	rule	:{}
});

module.exports = mongoose.model('TopicType', TopicTypeSchema);