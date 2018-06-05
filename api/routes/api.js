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
var Info = require('./../../models/info');
var Dudiguru = require('./../../models/gurududis');
var Pembekalan = require('./../../models/pembekalans');
var Nilai = require('./../../models/nilai');
var AspekNilai = require('./../../models/aspeknilais');

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
  Guru.find({}).populate('_dudi.id').exec(function(err, gurus) {
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
  dudi._guru = req.body._guru;
  dudi.pemilik = req.body.pemilik;
  dudi.save((err, ok)=>{
    if(ok) res.send('ok_add');
  });
});
apirouter.post('/upddudi', (req, res) => {
  Dudi.findOneAndUpdate({_id: req.body._id}, {$set:{_id : req.body._id, namaDudi : req.body.namaDudi, alamat : req.body.alamat, kota : req.body.kota,_guru: req.body._guru, pemilik: req.body.pemilik}},function(err, ok){
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
    dudi._guru = req.body[i]._guru;
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
    console.log(req.query);
    var Profile;
    if ( role === '1' || role === '4') {
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
apirouter.get('/getmydudis', (req, res, next) => {
  var _id = req.query.id;
  var periode = req.query.periode;
  Dudiguru.find({_guru: _id, periode: periode})
          .populate('_dudi')
          .exec(function(err, dudis) {
            res.json(dudis)
          })
          // .catch((err) => {
          //   next(err);
          // })
});
apirouter.get('/getpkl/:periode', (req, res, next) => {
  Prakerlap.find({periode: req.params.periode})
          .populate('_guru _dudi _siswa')
          .exec((err, datas) => {
            if (!datas) {
              return res.status(404).json({'err': 'ko', 'msg': 'No Data'});
            } else {
              // return console.log(datas);
              return res.status(200).json(datas);
              // next();
            }
          })
});
apirouter.get("/getmypkl", (req, res, next) => {
  var _id = req.query.id;
  var periode = req.query.periode;
  Prakerlap.find({"_guru": _id, "periode": periode})
            .populate('_dudi')
            .exec((err, datas) => {
              if (!datas) {
                return res.status(404).json({'err': 'ko', 'msg': 'No Data'});
              } else {
                // return console.log(datas);
                return res.status(200).json(datas);
                // next();
              }
            })
            // .catch((err) => {
            //   res.status(500).json(err);
            // });
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
  var periode = req.query.periode;
  // console.log(_id);
  Prakerlap.find({"_guru" : _id, "_dudi": _dudi, "periode": periode})
           .populate('_dudi _guru _siswa')
           .exec((err,siswas) => {
             res.json(siswas);
           });
});

apirouter.get('/praktikans/:periode', ( req, res ) => {
  Praktikan.find({periode: req.params.periode})
           // .populate('_guru _dudi')
           .exec(( err, praktikans ) => {
              if ( err ) {
                res.json(err);
              } else {
                res.json(praktikans);
              }
           });
});
apirouter.get('/getsiswas/:periode', (req, res) => {
  // console.log(req.params.periode);
  Praktikan.find({'periode': req.params.periode})
    // .populate('_dudi _guru')
    .exec((err, siswas) => {
      if (!siswas) { return res.json('no data');}
      else { return res.json(siswas);}
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
  siswa.nis = req.body.nis;
  siswa.uname = req.body.uname;
  siswa.password = req.body.password;
  siswa.nama = req.body.nama;
  siswa.kelas = req.body.kelas;
  siswa.progli = req.body.progli;
  siswa.periode = req.body.periode
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
    siswa.nis = req.body[i].nis;
    siswa.uname = req.body[i].uname;
    siswa.password = req.body.password;
    siswa.nama = req.body[i].nama;
    siswa.periode = req.body[i].periode;
    siswa.kelas = req.body[i].kelas;
    siswa.progli = req.body[i].progli;
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
// $and: [
//           { $or: [{a: 1}, {b: 1}] },
//           { $or: [{c: 1}, {d: 1}] }
//       ]
apirouter.get('/jmlterdaftar/:periode', (req, res) => {
  var periode = req.params.periode;
  Prakerlap.find({periode}, function(err, terdaftar) {
    // console.log(terdaftar);
    res.json(terdaftar);
  })
  .catch((err)=>{
    res.json(err);
  });
});

apirouter.get('/regSiswas/:periode', (req, res) => {
  var periode = req.params.periode;
  Prakerlap.find({'periode': periode})
            .populate('_siswa _dudi _guru')
            .exec(function(err, siswas) {
              if ( err ) return res.json(err)
              res.json(siswas);
            });
});
apirouter.get('/calon/:periode', (req, res) => {
  Praktikan.find({periode: req.params.periode, 'isActive': '0'}, function(err, siswas){
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

apirouter.post('/newpkl', (req, res) => {
  // console.log(req.body.data);
  var pkls = req.body.data;
  var jml = pkls.length;
  var msg = '';
  for ( var i = 0; i < jml ; i++){
    var pkl = new Prakerlap(pkls[i]);
    // console.log(pkl._siswa);
    pkl.save()
       .catch((err)=>{
          return res.status(500).json(err)
        })
       .then(function(pkl){
        // console.log(pkl._siswa);
          Praktikan.update({_id: pkl._siswa}, {$set: {'isActive': '1'}}, {multi: true}, (err, ok) => {
            if (err) { return res.status(500).json(err)}
            else if (!ok) {msg = 'Gagal Aktifkan siswa '}
            else {msg = 'Sukses mendaftarkan siswa' }
          })
       })
  }
  console.log(msg);
  res.send(msg);
  // var pkl = new Prakerlap(req.body);
  // pkl.save()
  // .catch((err) => {
  //   return res.status(500).json(err);
  //   // return false;
  // })
  // .then(function(){
  //   Praktikan.findOneAndUpdate({_id: req.body._siswa}, {$set: {'isActive': '1'}}, function(err, ok){
  //     if (err) {return res.status(500).json(err);}
  //     else {return res.json({'status': 'success', 'msg': 'Calon PEserta telah didaftarkan.'})}
  //   })
  // })
});
// API for Jadwal

apirouter.get('/jadwal/:periode', (req, res) => {
  var periode = req.params.periode
  Jadwal.find({periode: periode}, function(err, jadwals) {
    res.json(jadwals);
  });
});
apirouter.post('/jadwal', (req, res) => {
  var data = req.body;
  var jadwal = new Jadwal(data)
  jadwal.save(function(err, ok) {
    if (err) { return res.json(err);}
    else { return res.json({'msg': 'ok'})}
  })
})
apirouter.put('/jadwal', (req, res, next) => {
  var data = req.body;
  Jadwal.findOneAndUpdate({_id: data._id}, {$set: {
    start: data.start,
    end: data.end,
    kegiatan: data.kegiatan,
    pelaksana: data.pelaksana,
    tempat: data.tempat,
    periode: data.periode
  }})
  .then(function(err, ok) {
    res.json({'msg': 'upd_ok'})
  })
  .catch(err => {
    next(err)
  })
})
// Info
apirouter.get('/getinfos', function(req, res) {
  Info.find({}, function(err, infos){
    res.json(infos);
  });
});

// API Guru Dudi
apirouter.post('/newdg', (req, res) => {
  var dg = new Dudiguru(req.body);
  dg.save(function(err, ok) {
    if (err ) {return console.log('err');}
    else { res.json({'sukses': 'ok'});}
  })
  // console.log(req.body);
});

apirouter.get('/dgs/:periode', (req, res) => {
  Dudiguru.find({periode: req.params.periode})
          .populate('_guru _dudi')
          .exec(function(err, results) {
            if (err) {
              res.json(err);
            } else {
              res.json(results);
            }
          })
});
apirouter.get('/siswasperdudi', (req, res) => {
  Prakerlap.find({_dudi: req.query._dudi})
          .populate('_siswa')
          .exec((err, results) => {
            if (err) { res.json(err); }
            else { res.json(results);}
          });
});
apirouter.get('/siswas', (req, res) => {
  Prakerlap.find({})
          .populate('_siswa _guru _dudi')
          .exec((err, results) => {
            if (err) { res.json(err); }
            else { res.json(results);}
          });
});
// Router Menu
apirouter.get('/menu/:role', function(req, res) {
  Menu.find({role: req.params.role}, function(err, menus){
    if (err) {
      console.log(err);
    }
    res.json(menus);
  });
});

// API Pembekalan
apirouter.get('/bekals/:periode', (req, res) => {
  var periode = req.params.periode;
  Pembekalan.find({periode: periode})
            .populate('_guru _siswa')
            .exec((err, results) => {
              if (err) {return res.status(500).json(err)}
              else if (results < 1) { return res.status(404).json({'msg': 'nodata'})}
              else { return res.status(200).json(results)}
            });
});

apirouter.post('/bekal', (req, res) => {
  var datas = req.body;
  var jml = datas.length;
  // var bekal = new Pembekalan(req.body);
  for ( var i = 0; i < jml ; i++) {
    var bekal = new Pembekalan(datas[i]);

    bekal.save().catch(err=> { return res.json(err)}).then(()=>{ return res.json({'msg': 'ok'})})
  }
  console.log(jml);
  // bekal.save((err, ok) => {
  //   if (err) { return res.json(err)}
  //   else { return res.json({'msg': 'save_ok'})}
  // });
});

// Penilaian
apirouter.get('/getkategorinilai', (req, res) => {
  AspenNilai.find({}, (err, penilaians) => {
    res.json(penilaians)
  })
})

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