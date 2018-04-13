var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
    
var jadwalSchema = new Schema({
	_id: String,
    start: Date,
    end: Date,
    kegiatan: String,
    pelaksana: String,
    tempat: String
});

module.exports = mongoose.model('Jadwal', jadwalSchema, 'jadwals');