var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var suratSchema = new Schema({
    no : String,
    perihal: String
});

module.exports = mongoose.model('Surat', suratSchema, 'surats');