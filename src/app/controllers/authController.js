const express = require('express');
const User = require('../models/User');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth.json');
const crypto = require('crypto');
const mailer = require('../modules/mailer');

function createToken(userInfo) {
    const token = jwt.sign(userInfo, authConfig.key, {expiresIn: 86400});
    return token;
}

router.post('/authenticate', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user){
        console.log('entrou no erro de user not found');
        return res.status(400).send({ error: 'User not found'})
    }
    const passwordCheck = await bcrypt.compare(password, user.password)
    if (!passwordCheck){
        return res.status(400).send({ error: 'Invalid password'})
    }
    user.password = undefined;
    const token = createToken({ id: user.id })
    user.token = token;
    res.send({ 
        user
    });
});

router.post('/forgot', async (req, res) => {
    const { email } = req.body;

    try{
        const user = await User.findOne({ email });
        if (!user){
            return res.status(400).send({ error: 'User not found'});
        }
        const token = crypto.randomBytes(20).toString('hex');
        const now = new Date();
        now.setHours(now.getHours() + 1);
        await User.findByIdAndUpdate(user.id, {
            '$set': {
                resetPassworToken: token,
                resetPasswordTokenExpiresAt: now
            }
        });

        mailer.sendMail({
            to: email,
            from: 'testemail@email.com',
            template: 'forgot_password',
            context: { token },
            subject: 'E-mail enviado usando Node!',
        }, (err) => {
            console.log(err)
            if(err) {
                return res.status(400).send({ error: 'Error on sending reset password email'})
            }
            return res.send({ok: 'success'})
        });
    } catch (err) {
        console.log(err);
        res.status(400).send({ error: 'Error on forgot password'})
    }
});

router.post('/reset_password', async (req, res) => {
    const { email, token, password } = req.body;

    try {
        const user = await User.findOne({ email })
            .select('+resetPassworToken resetPasswordTokenExpiresAt');
        
        if (!user) {
            return res.status(400).send({ error: 'User not found'});
        }
        if(token !== user.resetPassworToken){
            if(email !== user.email){
                return res.status(400).send({ error: 'Token and Email do not match'});
            }
            return res.status(400).send({ error: 'Invalid token'});
        }
        const now = new Date();
        if(now > user.resetPasswordTokenExpiresAt){
            return res.status(400).send({ error: 'Token expired. Try again'});
        }

        user.password = password;
        await user.save();

        res.send({ok: 'sucess'});
    } catch (err) {
        res.status(400).send({ error: 'Cannot reset password. Please, try again'})
    }
});

module.exports = app => app.use('/auth', router)