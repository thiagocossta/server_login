const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://root:1q3e2w5t4rmmm@serverj-o7jm9.mongodb.net/test?retryWrites=true&w=majority',
{useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});
mongoose.Promise = global.Promise;

module.exports = mongoose;

