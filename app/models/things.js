// app/models/things.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var BeaconSchema   	= new Schema({
	major		:Number,
	minor		:Number,
	range		:String//[I,N,F]
});

var ThingsSchema   	= new Schema({
	catalog		:{ type: Schema.Types.ObjectId, ref: 'Catalog' },
    name		:String,
    photo		:String,
    description	:String,
    contactInfo	:String,
    type 		:String,
    subType		:String,
    keyWord		:[String],
    owner		:{ type: Schema.Types.ObjectId, ref: 'User' },
    createDate	:Date,
    audioInfo	:[String],
    beacons		:[BeaconSchema],
    location 	:{lat:Number,lng:Number},
    areacode    :String
});


module.exports = mongoose.model('Things', ThingsSchema);