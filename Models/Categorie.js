const nodeMongoose = require('mongoose');
const Schema = nodeMongoose.Schema;

const Categorie = new Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
});

nodeMongoose.model('categories', Categorie);