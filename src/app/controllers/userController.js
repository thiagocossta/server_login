const express = require('express');
const User = require('../models/User');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth.json');
const crypto = require('crypto');

function createToken(userInfo) {
    const token = jwt.sign(userInfo, authConfig.key, {expiresIn: 86400});
    return token;
}

router.get('/get', async (req, res) => {
    const { id } = req.body;
    try {
        const user = await User.findById(id);
        console.log(user)
        if(user){
            return res.status(200).send(user)
        } else {
            return res.status(400).send({ error: 'User not found'})
        }
    } catch (err) {
        return res.status(400).send({ error: 'User not found'})
    }
});

router.get('/get_all', async (req, res) => {
    try {
        const users = await User.find();
        console.log(users)
        if(users.length !== 0){
            return res.status(200).send(users)
        } else {
            return res.status(400).send({ error: 'Theres no user in database'})
        }
    } catch (err) {
        return res.status(400).send({ error: 'Theres no user in database'})
    }
});

router.post('/create', async (req, res) => {
    const { email } = req.body;
    try {
        if(await User.findOne({ email })){
            return res.status(400).send({ error: 'User already exists'})
        }
        const user = req.body;
        user.token = createToken({ id: user.id })
        const userCreated = await User.create(user);
        userCreated.password = undefined;
        console.log('o user', userCreated);
        
        return res.send({ 
            userCreated
        });
    } catch (err) {
        return res.status(400).send({ error: 'Not registered. Fail to create an user'})
    }
});

router.delete('/delete', async (req, res) => {
    const { id } = req.body;
    console.log('o req', id)
    await User.findByIdAndDelete(id, function(err){
        if(err) {
            return res.status(400).send({ error: 'Can not delete user'})
        }
        return res.status(200).send();
    })
});

router.put('/update_name', async (req, res) => {
    const { id, name } = req.body;
    console.log('o req', id)
    await User.findByIdAndUpdate(id, {name: name}, {new: true}, function(err, user){
        if(err) {
            return res.status(400).send({ error: 'Can not update user'})
        }
        return res.status(200).send(user);
    })
});

module.exports = app => app.use('/user', router)