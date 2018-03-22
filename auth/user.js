var express = require('express');
var authrouter = express.Router();   
var User    = require('./../models/user');
var Guru    = require('./../models/guru');
var Praktikan = require('./../models/praktikan');
var jwt     = require('jsonwebtoken');
var uname;


// Register new user

authrouter.post('/users', function(req, res){
  //console.log(req.body);
  var user = new User();
  user._id = req.body._id;
  user.uname = req.body.uname;
  user.nama = req.body.nama;
  user.password = req.body.password;
  user.email    = req.body.email;
  user.hp = req.body.hp;
  user._role = req.body._role;
  
  if (req.body.uname == null || req.body.uname == "" || req.body.password == '' || req.body.email == '' || req.body.nama == '' || req.body._role == '') {
    res.json({ success: false, message:'Pastikan kelengkapan data.' });

  } else {
    user.save((err)=>{
      if(err){
          res.send(err);
          console.log(err);
        //
        //if (err.errors.nama) {
        //  res.json({ success: false, message:err.errors.nama.message });
        //} else if (err.errors.email) {
        //  res.json({ success: false, message:err.errors.email.message });
        //} else if (err.errors.uname) {
        //  res.json({ success: false, message:err.errors.uname.message});
        //}
      }else{
        res.json({ success: true, message:'User created' });
      }
    });
  }
});
//var slugify = require('slugify');
//var multer = require('multer');
var secret = 'sruput';


    authrouter.get('/', function(req, res) {
        res.send('User Route');
    });
// Login Route
  authrouter.post('/authenticate', function(req, res){
    // console.log(req.body.uname);
    if(req.body._role == '1'){
      uname = User;
    } else if (req.body._role == '2') {
      uname = Guru;
    } else if (req.body._role == '3') {
      uname = Praktikan;
    }

    // console.log(uname);
    uname.findOne({ uname: req.body.uname}).exec(function(err,user){
      // console.log(user);
      
        if (err) throw err;
        if(!user){
          res.json({success: false, message: 'user not found'});
        } else if (user) {
          if(req.body.password) {
            var validPassword = user.comparePassword(req.body.password);
            if (!validPassword) {
              res.json({ success: false, message:'Password is wrong'});
            } else {
              //console.log(user.pic);
              var token = jwt.sign({ uname: user.uname, nama: user.nama, email: user.email, _role: user._role }, secret, { expiresIn: '10h'} );
              res.json({success: true, message: 'Pengguna boleh masuk. Sebentar . .', token: token});
            }
          } else {
            res.json({ success: false, message: "Password not provided yet"});
          }
          
          
        }
    });
  });
  // Get token decrypted
  
module.exports = authrouter;