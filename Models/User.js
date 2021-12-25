const nodeMongoose = require('mongoose');
const Schema = nodeMongoose.Schema;

const User = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    administrator: {
        type: Number,
        default: 0
    }
});

nodeMongoose.model('users', User);