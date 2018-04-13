var express = require('express');
var bcrypt = require('bcrypt-nodejs');
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
    var usr = req.body.uname;
    var levelkey = usr.substr(0,1);
    if(levelkey == '@'){
      uname = User;
    } else if (levelkey == 'u') {
      uname = Praktikan;
    } else {
      uname = Guru;
    }

    // console.log(uname);
    uname.findOne({ uname: req.body.uname}).exec(function(err,user){
        // console.log(user);
      
        if (err) console.log(err);
        if(!user){
          res.json({success: false, message: 'Username belum terdaftar.'});
        } else if (user) {
          // if(req.body.password) {
            var pass = req.body.password;
            var savedpass = user.password;
            // try {
            bcrypt.compare(pass, savedpass, function(err, valid){
              if (err) {
                if (err == 'Not a valid BCrypt hash.') {
                  res.json({ success: false, message:'Maaf, Ada kesahalan pada password Anda. Mohon hubungi admin'});
                } else if(err == 'ERR_HTTP_HEADERS_SENT') {
                  res.json({ success: false, message:'Sistem Error'});
                }
              }
              else {
                if(!valid){
                  res.json({ success: false, message: 'Password Tidak Sesuai. Cek Kembali!'});
                } else {
                  var token = jwt.sign({ uname: user.uname, nama: user.nama, email: user.email, _role: user._role }, secret, { expiresIn: '10h'} );
                  res.json({success: true, message: 'Pengguna boleh masuk. Sebentar . .', token: token, role: user._role});
                }
              }
              
            });
                  
        }
        // catch(err) {
        //   if(err){
        //     res.json({ success: false, message:"Maaf ada kesalahan sistem. Hubungi Admin"});
        //   }
        // }
            // if (!validPassword) {
            //   res.json({ success: false, message:'Password is wrong'});
            // } else {
            //   //console.log(user.pic);
            //   var token = jwt.sign({ uname: user.uname, nama: user.nama, email: user.email, _role: user._role }, secret, { expiresIn: '10h'} );
            //   res.json({success: true, message: 'Pengguna boleh masuk. Sebentar . .', token: token, role: user._role});
            // }
          // } else {
          //   res.json({ success: false, message: "Password belum dimasukkan"});
          // }
          
          
        // }
    });
  });
  // Get token decrypted
  
module.exports = authrouter;