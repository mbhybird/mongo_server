// app/models/topic.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var CommentSchema	= new Schema({
	text		:String,
	html		:String,
	photo		:String,
	audio		:String,
	video		:String,
	doodle		:String,
	type 		:String,//[T,H,P,A,V,D]
	createBy	:{ type: Schema.Types.ObjectId, ref: 'User' },
	createDate	:Date
});

var TopicSchema	= new Schema({
	title		:String,
	link		:String,
	type 		:String,//[Chat,Doodle,Html...]
	createBy	:{ type: Schema.Types.ObjectId, ref: 'User' },
	createDate	:Date,
	things		:{ type: Schema.Types.ObjectId, ref: 'Things' },
	comments	:[CommentSchema]
});


module.exports = mongoose.model('Topic', TopicSchema);