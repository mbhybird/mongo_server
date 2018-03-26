// app/models/catalog.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var CatalogSchema   = new Schema({
    tag			:String,
    name		:String,
    updateDate	:Date
});

module.exports = mongoose.model('Catalog', CatalogSchema);