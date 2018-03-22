var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var dudiSchema = new Schema({
    _id: String,
    namaDudi: String,
    alamat: String,
    kota: String,
    telp: String,
    pemilik: String,
    _guru: {
        type: String,
        ref: 'Guru'
    }
});

module.exports = mongoose.model('Dudi', dudiSchema, 'dudis');