var express = require('express');
var apirouter = express.Router();
//var verifyToken = require('./../../auth/verivyJwt');
var User = require('./../../models/user');
var Guru = require('./../../models/guru');
var Praktikan = require('./../../models/praktikan');
var Dudi = require('./../../models/dudi');
var Surat = require('./../../models/surat');
var Jadwal = require('./../../models/jadwal');


    
apirouter.get('/', (req, res) => {
    res.send('Sruput API Provider');
});
// Routes for Admin
apirouter.get('/getgurus', (req, res) => {
  Guru.find({}, function(err, gurus) {
    res.json(gurus);
  });
});


apirouter.get('/dudis', (req, res) => {
  Dudi.find({}).populate('_guru')
  .exec(( err, dudis ) => {
     if ( err ) {
       res.json(err);
     } else {
       res.json(dudis);
     }
  });
});

apirouter.get('/users', (req, res) => {
    User.find({}, (err, users) => {
        if (err) {
            res.json({'success': false, 'kodeErr': '404', 'msg': err});
        } else {
            res.json(users);
        }
    });
});

apirouter.get('/profile', (req, res) => {
    var role = req.query.role;
    var uname = req.query.id;
    var Profile;
    if ( role === '1') {
        Profile = User;
    } else if ( role === '2') {
        Profile = Guru;
    } else if ( role === '3') {
        Profile = Praktikan;
    }
    Profile.find({'uname': uname}, function(err, profile) {
        if ( err ) {
            res.json( err );
        } else {
          console.log(profile);
            res.send(profile);
        }
    });
});

// Get Dudis for this Guru
apirouter.get("/getmydudis", (req, res) => {
  var _id = req.query.id;
  Dudi.find({"_guru": _id}, function(err, dudis) {
    if ( err ) {
      res.json(err);
    } else {
      res.json(dudis);
    }
  });
});
// Get Siswas of this Guru
apirouter.get('/getmysiswas', (req, res) => {
  var _id = req.query.id;
  var _dudi = req.query.dudi;
  // console.log(_id);
  Praktikan.find({"_guru" : _id, "_dudi": _dudi})
           .populate('_dudi _guru')
           .exec((err,siswas) => {
             res.json(siswas);
           });
});

apirouter.get('/praktikans', ( req, res ) => {
  Praktikan.find({})
           .populate('_guru _dudi')
           .exec(( err, praktikans ) => {
              if ( err ) {
                res.json(err);
              } else {
                res.json(praktikans);
              }
           });
});
apirouter.get('/getsiswas', (req, res) => {
  Praktikan.find({})
    .populate('_dudi _guru')
    .exec((err, siswas) => {
      res.json(siswas);
    });
    
});

//Route Praktikan by Guru and Dudi
apirouter.get('/statistik', (req, res) => {
  if ( req.query.guru){
    
  var guru = req.query.guru;
  Praktikan.find({'_guru': guru}).populate( '_dudi').exec( function (err, praktikans) {
                if ( err ) {
                  res.json( err );
                } else {
                  res.json( praktikans );
                  console.log(praktikans);
                }
              });
  
  } else {
    Praktikan.find({}).populate( '_dudi').exec( function (err, praktikans) {
                if ( err ) {
                  res.json( err );
                } else {
                  res.json( praktikans );
                  //console.log(praktikans);
                }
              });
  }
});
apirouter.get('/gurus', ( req, res ) => {
  Guru.find({ 'active': true }, (err, gurus) => {
    if ( err ) {
      res.json( err );
    } else {
      res.json( gurus );
    }
  });
});

// No Surat
apirouter.get('/nosurat', function(req, res) {
  Surat.findOne().sort({_id: -1}).limit(1)
      .exec(function(err, no){
        if ( err ) {
          res.send(err);
        } else {
          res.send(no);
        }
      });
});
apirouter.post('/nosurat', (req, res) => {
  var no = req.body.no,
      perihal = 'Surat Permohonan Praktek Kerja Lapangan';
  console.log(no);
  if ( no = null ) {
    res.send('No Surat Tidak Ada');
  } else {
    var surat = new Surat();
      surat.no = req.body.no,
      surat.perihal = perihal;
    
    surat.save(function(err) {
      if (err) {
        res.send(err);
      } else {
        res.send('Surat berhasil disimpan');
      }
    });
  }
});

// API for Jadwal
apirouter.get('/jadwal', (req, res) => {
  Jadwal.find({}, function(err, jadwals) {
    res.json(jadwals);
  });
});
apirouter.use(function(req, res, next) {
var token = req.body.token || req.body.query || req.headers['x-access-token'];
if (token) {
  jwt.verify(token, secret, function(err, decoded) {
    if (err) {
      res.json({ success: false, message: 'Token invalid'});
    } else {
      req.decoded = decoded;
      next();
    }
  });
} else {
  res.json({ success: false, message: 'No Token'});
}
});
apirouter.post('/me', function(req, res){
    res.send(req.decoded);
});
  
 
module.exports = apirouter;