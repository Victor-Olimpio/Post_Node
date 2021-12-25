require('../Models/User');
const nodeMongoose = require('mongoose');
const nodeBCryptJs = require('bcryptjs');
const localStrategy = require('passport-local').Strategy;

const User = nodeMongoose.model('users');

module.exports = function(passport) {
    passport.use(new localStrategy({usernameField: 'email', passwordField: 'password'}, (email, password, done) => {
        User.findOne({email: email}).then((user) => {
            if (!user) {
                return done(null, false, {message: 'This account does not exist!'});
            } else {
                nodeBCryptJs.compare(password, user.password, (error, batem) => {
                    if (batem) {
                        return done(null, user);
                    } else {
                        return done(null, false, {message: 'Incorrect User Password!'});
                    }
                });
            }
        });
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (error, user) => {
            done(error, user);
        });
    });
}