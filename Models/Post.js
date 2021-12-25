const nodeMongoose = require('mongoose');
const Schema = nodeMongoose.Schema;

const Post = new Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'categories',
        required: true,
    },
    date: {
        type: Date,
        default: Date.now()
    }
});

nodeMongoose.model('posts', Post);