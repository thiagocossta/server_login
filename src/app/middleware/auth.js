const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth.json');

module.exports = (req, res, next) => {
    const header = req.headers.authorization;
    if(!header){
        return res.status(401).send({ error: 'No token provided' });
    }
    const tokenSplit = header.split(' ');
    if(!tokenSplit.length === 2){
        return res.status(401).send({ error: 'Token error' });
    }
    const [ scheme, token ] = tokenSplit;
    if(!scheme.includes('Bearer')){
        return res.status(401).send({ error: 'Invalid token format'});
    }

    jwt.verify(token, authConfig.key, (err, decoded) => {
        if(err) return res.status(401).send({ error: 'Invalid token'});
        req.userId = decoded.id;
        return next();
    })

}