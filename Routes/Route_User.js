require('../Models/User')
const nodeExpress = require('express');
const nodeMongoose = require('mongoose');
const nodeBCryptJs = require('bcryptjs');
const nodePassport = require('passport');

const nodeRouter = nodeExpress.Router();
const User = nodeMongoose.model('users');

nodeRouter.get('/register', (request, response) => {
    response.render('User/Register');
});

nodeRouter.post('/register/done', (request, response) => {
    let errorsFound = [];

    if (!request.body.name || typeof request.body.name === undefined || typeof request.body.name === null) {
        errorsFound.push({error: 'This Name is invalid!'});
    }

    if (!request.body.email || typeof request.body.email === undefined || typeof request.body.email === null) {
        errorsFound.push({error: 'This Email Address is invalid!'});
    }

    if (!request.body.password || typeof request.body.password === undefined || typeof request.body.password === null) {
        errorsFound.push({error: 'This Password is invalid!'});
    } else if (request.body.password.length < 4) {
        errorsFound.push({error: 'This Password is too short!'});
    }

    if (!request.body.passwordTwo || typeof request.body.passwordTwo === undefined || typeof request.body.password === null) {
        errorsFound.push({error: 'Invalid Password Confirmation!'});
    } else if (request.body.passwordTwo !== request.body.password) {
        errorsFound.push({error: 'Invalid Password Confirmation!'});
    }

    const numberOfErrors = errorsFound.length;

    if (numberOfErrors > 0) {
        response.render('User/Register', {errorsFound: errorsFound});
    } else {
        User.findOne({email: request.body.email}).lean().then((user) => {
            if (user) {
                console.log(`This Email Address has already been registered!`);
                request.flash('errorMessage', 'This Email Address has already been registered!');
                response.redirect('/register');
            } else {
                const newUser = new User({
                    name: request.body.name,
                    email: request.body.email,
                    password: request.body.password
                })

                nodeBCryptJs.genSalt(10, (error, salt) =>{
                    nodeBCryptJs.hash(newUser.password, salt, (error, hash) => {
                        if (error) {
                            console.log(`An internal fault has been found: ${error}`);
                            request.flash('errorMessage', 'An internal fault has been found!');
                            response.redirect('/');
                        } else {
                            newUser.password = hash
                            newUser.save().then(() => {
                                console.log('Registered user successfully!');
                                request.flash('successMessage', 'Registered user successfully!');
                                response.redirect('/login');
                            }).catch((error) => {
                                console.log(`Failed to register the user: ${error}`);
                                request.flash('errorMessage', 'Failed to register the user!');
                                response.redirect('/');
                            });
                        }
                    });
                });
            }
        }).catch((error) => {
            console.log(`An internal fault has been found: ${error}`);
            request.flash('errorMessage', 'An internal fault has been found!');
            response.redirect('/');
        });
    }
});

nodeRouter.get('/login', (request, response) => {
    response.render('User/Login');
});

nodeRouter.post('/login/done', (request, response, next) => {
    nodePassport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login",
        failureFlash: true
    })(request, response, next);
});

nodeRouter.get('/logout', (request, response) => {
    request.logout();
    request.flash('successMessage', 'Logout successfully performed!');
    response.redirect('/');
});

module.exports = nodeRouter;