var express = require('express');
var multer = require('multer');
var apirouter = express.Router();
var bcrypt = require('bcrypt-nodejs');
var User = require('./../../models/user');
var Guru = require('./../../models/guru');
var Praktikan = require('./../../models/praktikan');
var Dudi = require('./../../models/dudi');
var Surat = require('./../../models/surat');
var Jadwal = require('./../../models/jadwal');
var Periode = require('./../../models/periode');
var Prakerlap = require('./../../models/prakerlap');
var Menu = require('./../../models/menu');

var storage = multer.diskStorage({ //multers disk storage settings
        destination: function (req, file, cb) {
            cb(null, './uploads/')
        },
        filename: function (req, file, cb) {
            var datetimestamp = Date.now();
            cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
        }
    });
  var upload = multer({ //multer settings
    storage: storage,
    fileFilter : function(req, file, callback) { //file filter
        if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length-1]) === -1) {
            return callback(new Error('Wrong extension type'));
        }
        callback(null, true);
    }
  }).single('file');

// Api post Excel

apirouter.get('/', (req, res) => {
    res.send('Sruput API Provider');
});
// Routes for Admin
apirouter.get('/getgurus', (req, res) => {
  Guru.find({}, function(err, gurus) {
    res.json(gurus);
  });
});

// Api DUDI
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
// _id : data._id,
//         namaDUdi: data.namaDudi,
//         alamat: data.alamat,
//         kota: data.kota,
//         _guru: data._guru._id
apirouter.post('/newdudi', (req, res) => {
  var dudi = new Dudi();
  dudi._id = req.body._id,
  dudi.namaDudi = req.body.namaDudi,
  dudi.alamat = req.body.alamat,
  dudi.kota = req.body.kota,
  // dudi._guru = req.body._guru;
  dudi.save((err, ok)=>{
    if(ok) res.send('ok_add');
  });
});
apirouter.post('/upddudi', (req, res) => {
  Dudi.findOneAndUpdate({_id: req.body._id}, {$set:{_id : req.body._id, namaDudi : req.body.namaDudi, alamat : req.body.alamat, kota : req.body.kota}},function(err, ok){
    if (err) res.console(err)
    else res.send('ok_upd');
  });
  // console.log(req.body);
});

apirouter.post('/importdudis', (req, res)=>{
  var jml = req.body.length;
  for(var i=0; i< jml; i++) {
    var dudi = new Dudi();
    dudi._id = req.body[i]._id,
    dudi.namaDudi = req.body[i].namaDudi,
    dudi.alamat = req.body[i].alamat,
    dudi.kota = req.body[i].kota,
    // dudi._guru = req.body[i]._guru;
    dudi.save();
  }
  res.send('ok_import');
});
// Import Gurus
apirouter.post('/importgurus', (req, res)=>{
  var jml = req.body.length;
  for(var i=0; i< jml; i++) {
    var guru = new Guru();
    guru._id = req.body[i]._id,
    guru.uname = req.body[i].uname,
    guru.password = req.body[i].password,
    guru.nama = req.body[i].nama,
    guru.alamat = req.body[i].alamat,
    guru.hp = req.body[i].hp,
    guru.nip = req.body[i].nip,
    guru._role = req.body[i]._role,
    guru.save();
  }
  res.send('ok_import');
});

// API USers
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
          // console.log(profile);
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
apirouter.get('/getlastdudi', (req, res) => {
  var kode = req.query.kode;
  var regx = new RegExp(kode, "i");
  Dudi.find({_id: regx}).sort({_id: -1}).limit(1)
      .exec(function(err, kode){
        res.json(kode);
      });
});
// Get Siswas of this Guru
apirouter.get('/getmysiswas', (req, res) => {
  var _id = req.query.id;
  var _dudi = req.query.dudi;
  // console.log(_id);
  Praktikan.find({"_guru" : _id, "_dudi": _dudi})
           // .populate('_dudi _guru')
           .exec((err,siswas) => {
             res.json(siswas);
           });
});

apirouter.get('/praktikans', ( req, res ) => {
  Praktikan.find({})
           // .populate('_guru _dudi')
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
    // .populate('_dudi _guru')
    .exec((err, siswas) => {
      res.json(siswas);
    });
    
});

// Api post insert new Praktikan
apirouter.post('/newsiswa', (req, res) => {
  var kls = req.body.kelas;
  var p = kls.substr(3,3);
  var progli = p.trim();
  var siswa = new Praktikan();
  siswa._id = req.body._id;
  siswa.uname = req.body.uname;
  siswa.password = req.body.password;
  siswa.nama = req.body.nama;
  siswa.kelas = req.body.kelas;
  siswa.progli = progli;
  siswa.hp = req.body.hp;
  // siswa._guru = req.body._guru._id;
  // siswa._dudi = req.body._dudi._id;
      siswa.save(function(err, sukses) {
        if (err) {
          res.send('err_save');
        } else {
          res.send('ok_save');
        }
      });
});
apirouter.put('/siswa', (req, res) => {
  var kls = req.body.kelas;
  var p = kls.substr(3,4);
  var progli = p.trim();
  var siswa = new Praktikan();
  siswa._id = req.body._id;
  siswa.uname = req.body.uname;
  siswa.password = req.body.password;
  siswa.nama = req.body.nama;
  siswa.kelas = req.body.kelas;
  siswa.progli = progli;
  siswa.hp = req.body.hp;
  // siswa._guru = req.body._guru._id;
  // siswa._dudi = req.body._dudi._id;
  Praktikan.findOneAndRemove({_id: siswa._id}, function(err, del, next){
    if( del ) {
      siswa.save((err, sukses) => {
        if (sukses) {
          res.send('ok_upd');
        }
      });
    }
  });
  
});
apirouter.post('/importsiswas', (req, res) => {
  var i = 0;
  var jml = req.body.length;
  for(i;i<jml;i++){
    var kls = req.body[i].kelas;
    var p = kls.substr(3,4);
    var progli = p.trim();
    var siswa = new Praktikan();
    siswa._id = req.body[i]._id;
    siswa.uname = req.body[i].uname;
    siswa.password = req.body.password;
    siswa.nama = req.body[i].nama;
    siswa.kelas = req.body[i].kelas;
    siswa.progli = progli;
    siswa.hp = req.body[i].hp;
    // if (req.body[i]._guru) siswa._guru = req.body[i]._guru
    // else siswa._guru = '0';
    // if (req.body[i]._dudi) siswa._dudi = req.body[i]._dudi
    // else siswa._dudi = '0';
    siswa.save();
  }
  res.send('Import Sukses');
});

apirouter.put('/updallsiswas', (req, res) =>{
  var i = 0;
  var jml = req.body.length;
    var kls = req.body[i].kelas;
    var p = kls.substr(3,3);
    var progli = p.trim();
    var siswa = new Praktikan();
    siswa._id = req.body[i]._id;
    siswa.uname = req.body[i].uname;
    siswa.password = req.body.password;
    siswa.nama = req.body[i].nama;
    siswa.kelas = req.body[i].kelas;
    siswa.progli = progli;
    siswa.hp = req.body[i].hp;
    // if (req.body[i]._guru) siswa._guru = req.body[i]._guru._id
    // else siswa._guru = '0';
    // if (req.body[i]._dudi) siswa._dudi = req.body[i]._dudi._id
    // else siswa._dudi = '0';
    // var criteria = {
    //  _id:{ $in: request.payload.split(‘,’)}
    // };
    // Praktikan.remove({}, function(err, del){
    //   if (err) {console.error(err);}
    //   else { 
        Praktikan.updateMany({}, function(err, siswa) {
          if (err) {console.error(err);}
          else {console.log('Berhasil diperbarui');}
        });
    //   }
    // });
    
});

apirouter.post('/delsiswa', function(req, res) {
  Praktikan.remove({_id: req.body._id}, function(err, del){
    if ( err ) {
      res.send('err_del');
    } else {
      res.send('ok_del');
    }
  })
})

//Route Praktikan by Guru and Dudi
apirouter.get('/statistik', (req, res) => {
  if ( req.query.guru){
    
  var guru = req.query.guru;
  Praktikan.find({'_guru': guru}).populate( '_dudi').exec( function (err, praktikans) {
                if ( err ) {
                  res.json( err );
                } else {
                  res.json( praktikans );
                  // console.log(praktikans);
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
  Guru.find({}, (err, gurus) => {
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
  // console.log(no);
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
// API Prakerlap
apirouter.get('/calon', (req, res) => {
  Praktikan.find({}, function(err, siswas){
    if (err) console.log(err);
    res.json(siswas);
  });
});

apirouter.get('/lastpkl', (req, res) => {
  Prakerlap.findOne({}).sort({regOn: -1}).limit(1).exec((err, last) => {
    if ( err ) {
      return res.status(500).json(err);
    } else if(!last) return res.status(404).json({err: false, msg:'nodata'});
    res.json(last);
  });
});
// API for Jadwal

apirouter.get('/jadwal', (req, res) => {
  Jadwal.find({}, function(err, jadwals) {
    res.json(jadwals);
  });
});
// apirouter.use(function(req, res, next) {
//   try {
//     if (!req.route)
//         return next (new Error('404'));  
//     next();
//   }
//   catch (next){
//     if (next == '404'){
//       console.log('Tidak Ketemu');
//     }
//   }
// });

// Router Menu
apirouter.get('/menu/:role', function(req, res) {
  Menu.find({role: req.params.role}, function(err, menus){
    if (err) {
      console.log(err);
    }
    res.json(menus);
  });
});
// 404
apirouter.get('*', (req, res) => {
  res.send('404');
});
apirouter.use(function(req, res, next) {
var token = req.body.token || req.body.query || req.headers['x-access-token'];
if (token) {
  jwt.verify(token, secret, function(err, decoded) {
    if (err) {
      res.json({ success: false, message: 'Token invalid'});
    } else {
      req.decoded = decoded;
      // next();
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