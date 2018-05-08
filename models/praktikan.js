var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs'),
    Schema = mongoose.Schema;
    
var praktikanSchema = new Schema({
    _id: String,
    nis: {type: String},
    uname: String,
    password: String,
    kelas: String,
    periode: String,
    nama: String,
    progli: String,
    hp: String,
    isActive: {type: String, default: '0'},// 0 = Not Registered; 1 = Registered; 2 = Approved
    pindah: {type: String, default: '0'},
    // _guru: {
    //     type: String,
    //     ref: 'Guru',
    //     default: '0'
    // },
    // _dudi: {
    //     type: String,
    //     ref: 'Dudi',
    //     default: '0'
    // },
    _role: {type: String, default: '3'}
});

praktikanSchema.pre('save', function(next){
  var user = this;
  bcrypt.hash(user.password, null, null, function(err, hash){
    if (err) return next(err);
    user.password = hash;
    next();
  });
});
praktikanSchema.pre('updateMany', function(next){
  var user = this;
  bcrypt.hash(user.password, null, null, function(err, hash){
    if (err) return next(err);
    user.password = hash;
    next();
  });
});

// praktikanSchema.methods.comparePassword = function(password) {
//     return bcrypt.compareSync(password, this.password);
//     // return password;
//   };
module.exports = mongoose.model('Praktikan', praktikanSchema, 'praktikans');