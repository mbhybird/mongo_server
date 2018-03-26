// app/models/post.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var PostSchema	= new Schema({
	title		:String,
	description	:String,
	html		:String,
	photo		:[String],
	audio		:[String],
	video		:[String],
	updateBy	:{ type: Schema.Types.ObjectId, ref: 'User' },
	updateDate	:Date,
	topic		:{ type: Schema.Types.ObjectId, ref: 'Topic' }
});

module.exports = mongoose.model('Post', PostSchema);