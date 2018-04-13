var express  = require('express'),
    app     = express(),
    port    = process.env.PORT || 4567,
    bodyParser  = require('body-parser'),
    //router      = express.Router(),
    mongoose    = require('mongoose'),
    morgan      = require('morgan'),
    auth        = require('./auth/user'),
    api         = require('./api/routes/api'),
    umum        = require('./api/routes/api_umum'),
    path        = require('path'),
    verifyToken = require('./auth/verivyJwt'),
    cors        = require('cors'),
    db          = require('./config/db');


// Menyambung ke Database
db.dbconnect();

// Logging pada proses pengembangan dengan morgan
app.use(morgan('dev'));
app.use(cors());
// Middleware body-parser untuk mengambil data dari form
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Menggunakan directory public untuk dapat diakses secara statis
app.use(express.static(__dirname + '/public'));

app.use('/user', auth);
app.use('/umum', umum);
app.use('/api', verifyToken, api);
 

app.get('*', function(req, res, next) {
    res.sendFile(path.resolve(__dirname + '/public/index.html'));
    next();
});

// Menjalankan Server pada port 8000
app.listen(port, function() {
console.log('Kami siap melayani Anda pada jalur port ' + port);
});