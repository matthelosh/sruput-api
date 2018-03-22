var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs'),
    titlize = require('mongoose-title-case'),
    validate = require('mongoose-validator'),
    Schema   = mongoose.Schema;
    

var nameValidator = [
  validate({
    validator: 'matches',
    arguments: /^([a-zA-Z ]{3,30})+$/,
    message: 'Nama tidak boleh kurang dari 3, atau lebih dari 30 huruf.'
  })
];

var usernameValidator = [
   validate({
    validator: 'isLength',
    arguments: [3, 25],
    message: 'Email harus berjumlah di antara {ARGS[0]} dan {ARGS[1]} karakter.'
  }),
  validate({
    validator: 'isAlphanumeric',
    message:"Username hanya boleh terdiri dari Huruf dan Angka."
  })
];

var emailValidator = [
  validate({
    validator: 'isEmail',
    message: 'Email tidak valid'
  }),
  validate({
    validator: 'isLength',
    arguments: [3, 25],
    message: 'Email harus berjumlah di antara {ARGS[0]} dan {ARGS[1]} karakter.'
  })
];


   
var UserSchema = new Schema({
  _id: String,
  //uname: { type: String, required: true, unique: true, validate:  usernameValidator },
  uname: { type: String, required: true, unique: true},
  nama: { type: String, required: true},
  password: { type: String, required: true},
  email: { type: String, required: true, unique: true},
  hp: String,
  _role: String
});

UserSchema.pre('save', function(next){
  var user = this;
  bcrypt.hash(user.password, null, null, function(err, hash){
    if (err) return next(err);
    user.password = hash;
    next();
  });
});

//UserSchema.plugin(titlize, {
//  paths: ['nama']
//});

UserSchema.methods.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.password);
  // return password;
};

var User = mongoose.model('User', UserSchema, 'users');
module.exports = User;