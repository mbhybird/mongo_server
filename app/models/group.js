// app/models/group.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var GroupSchema   = new Schema({
    name		:String,
    updateDate	:Date,
    things		:[{ type: Schema.Types.ObjectId, ref: 'Things' }],
    priority	:Number
});

module.exports = mongoose.model('Group', GroupSchema);