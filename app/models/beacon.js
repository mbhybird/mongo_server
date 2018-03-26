// app/models/beacon.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var BeaconSchema   	= new Schema({
	major		:Number,
	minor		:Number,
	range		:String//[I,N,F]
});

module.exports = mongoose.model('Beacon', BeaconSchema);