// app/models/log.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var BeaconSchema   	= new Schema({
	major		:Number,
	minor		:Number,
	range		:String//[I,N,F]
});

var LogSchema	= new Schema({
	logTime		:Date,
	logType		:String,//['I','O'...]
	createBy	:{ type: Schema.Types.ObjectId, ref: 'User' },
	things		:{ type: Schema.Types.ObjectId, ref: 'Things' },
	beacon		:{major:Number,minor:Number,range:String},
	location 	:{lat:Number,lng:Number}
});

module.exports = mongoose.model('Log', LogSchema);