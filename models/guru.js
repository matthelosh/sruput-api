var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs'),
    Schema = mongoose.Schema;

var guruSchema = new Schema({
    _id: String,
    password: String,
    uname: String,
    nama: String,
    alamat: String,
    hp: String,
    // _dudi: {
    //     type: Array,
    //     ref: 'Dudi',
    //     default: '0'
    // },
    _role: {
        type: String,
        ref: 'Role',
        default: '2'
    },
    nip: String
});

guruSchema.pre('save', function(next){
  var user = this;
  bcrypt.hash(user.password, null, null, function(err, hash){
    if (err) return next(err);
    user.password = hash;
    next();
  });
});

guruSchema.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
    // return password;
    
  };
module.exports = mongoose.model('Guru', guruSchema, 'gurus');