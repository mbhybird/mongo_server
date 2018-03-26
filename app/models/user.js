// app/models/user.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserSchema   = new Schema({
    firstname	:String,
    lastname	:String,
    nickname	:String,
    password	:String,
    gender		:String,//[F,M]
    email		:String,
    photo		:String,//base64
    wechat		:{},
    facebook	:{}
});

module.exports = mongoose.model('User', UserSchema);