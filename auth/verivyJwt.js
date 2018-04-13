var jwt = require('jsonwebtoken');
var secrets = ('./config/secrets');

module.exports = function(req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if(token) {
        // console.log(token);
        jwt.verify(token, 'sruput', function(err, decoded){
            if(err){
                return res.json({"error": true, msg: err});
            }
            req.decoded = decoded;
            // res.json(decoded);
            next();
        });
    } else {
        return res.status(403).send({
            "error": true,
            "msg": "Dilarang masuk"
        });
    }
}