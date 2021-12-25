//MODULES
require('./Models/Post');
require('./Models/User');
require('./Models/Categorie');
const nodePath = require('path');
const passport = require('passport');
require('./Config/Auth')(passport);
const nodeMoment = require('moment');
const nodeExpress = require('express');
const nodeMongoose = require('mongoose');
const nodeFlash = require('connect-flash');
const nodeBodyParser = require('body-parser');
const nodeSession = require('express-session');
const UserRoute = require('./Routes/Route_User');
const AdminRoute = require('./Routes/Route_Admin');
const nodeHandlebars = require('express-handlebars');
const {areLogged} = require('./Routes/Helpers/Logged');
const admin = require('./Routes/Helpers/Administrator');

const nodeApplication = nodeExpress();
const Post = nodeMongoose.model('posts');
const User = nodeMongoose.model('users');
const Category = nodeMongoose.model('categories');

//STATIC FILES
nodeApplication.use(nodeExpress.static(nodePath.join(__dirname, 'Public')));
nodeApplication.use('/js', nodeExpress.static(nodePath.join(__dirname + 'Public/js')));
nodeApplication.use('/img', nodeExpress.static(nodePath.join(__dirname + 'Public/img')));
nodeApplication.use('/css', nodeExpress.static(nodePath.join(__dirname + 'Public/css')));

//MONGOOSE CONNECTION
nodeMongoose.connect('mongodb://localhost/BlogDatabase').then(() => {
    console.log('Successful connection!');
}).catch((error) => {
    console.log(`Connection Failed: ${error}`);
});

//SETTINGS
    //SESSION
    nodeApplication.use(nodeSession({
        secret: '0102030405',
        resave: true,
        saveUninitialized: true
    }));

    //PASSPORT
    nodeApplication.use(passport.initialize());
    nodeApplication.use(passport.session());

    //CONNECT-FLASH
    nodeApplication.use(nodeFlash());

    //MIDDLEWARE
    nodeApplication.use((request, response, next) => {
        response.locals.admin = admin;
        response.locals.user = request.user || null;
        response.locals.error = request.flash('error');
        response.locals.errorMessage = request.flash('errorMessage');
        response.locals.successMessage = request.flash('successMessage');
        next();
    });

    //BODY-PARSER
    nodeApplication.use(nodeBodyParser.urlencoded({extended: false}));
    nodeApplication.use(nodeBodyParser.json());

    //HANDLEBARS
    nodeApplication.engine('handlebars', nodeHandlebars.engine({
        defaultLayout: 'Main',
        helpers: {
            formtDate: (date) => {
                return nodeMoment(date).format('DD.MM.YY');
            }
        }
    }));
    nodeApplication.set('view engine', 'handlebars');

//ROUTES
const serverRoutes = () => {
    nodeApplication.get('/', (request, response) => {
        Post.find().populate('category').sort({date: 'desc'}).lean().then((posts) => {
            response.render('Index', {posts: posts});
        }).catch((error) => {
            console.log(`Failed to list posts: ${error}`);
            request.flash('errorMessage', 'Failed to list posts!');
            response.redirect('/404');
        });
    });

    nodeApplication.get('/posts/:slug', areLogged, (request, response) => {
        Post.findOne({slug: request.params.slug}).populate('category').lean().then((post) => {
            if (post) {
                response.render('Post/Index', {post: post});
            } else {
                request.flash('errorMessage', 'Failed to find the post!');
                response.redirect('/');
            }
        }).catch((error) => {
            console.log(`An internal fault has been detected: ${error}`)
            request.flash('errorMessage', 'An internal fault has been detected!')
            response.redirect('/');
        });
    });

    nodeApplication.get('/categories', areLogged, (request, response) => {
        Category.find().lean().then((categories) => {
            response.render('Category/Index', {categories: categories});
        }).catch((error) => {
            console.log(`Internal failure when listing the categories: ${error}`);
            request.flash('errorMessage', 'Internal failure when listing the categories!');
            response.redirect('/');
        });
    });

    nodeApplication.get('/categories/:slug', areLogged, (request, response) => {
        Category.findOne({slug: request.params.slug}).lean().then((category) => {
            if (category) {
                Post.find({category: category._id}).lean().then((posts) => {
                    response.render('Category/Post', {posts: posts, category: category});
                }).catch((error) => {
                    console.log(`Failed to list posts: ${error}`);
                    request.flash('errorMessage', 'Failed to list posts!');
                    response.redirect('/');
                });
            } else {
                request.flash('errorMessage', 'This category does not exist!');
                response.redirect('/');
            }
        }).catch((error) => {
            console.log(`An internal fault has been detected: ${error}`)
            request.flash('errorMessage', 'An internal fault has been detected!')
            response.redirect('/');
        });
    });

    nodeApplication.get('/404', (request, response) => {
        response.send('ERROR 404');
    });

    nodeApplication.use('/', UserRoute);
    nodeApplication.use('/admin', AdminRoute);
}
serverRoutes();

//OTHERS
const PORT = process.env.PORT || 8080;
nodeApplication.listen(PORT, () => {console.log('Server Online!')});