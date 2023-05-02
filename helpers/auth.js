const express = require('express');
var app = express();
const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport')
const md5 = require('md5');
const userModel = require('../models/users');

module.exports.commonMiddileware = (app) => {
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
        /**function for login user
        * @param {string} email
        * @param {string} password
        * @param {Function} done
        * @return {[type]}
        */
        function (req, email, password, done) {
            userModel.findOne({
                'email': {
                    $regex: '^' + email + '$',
                    $options: 'i'
                },
                password: md5(password)
            }, {
                _id: 1,
                firstName: 1,
                lastName: 1,
                gender: 1,
                password: 1,
                profilePath: 1,
                isVerified : 1,
                email: 1,
            }).then(async function (user) {
                // if user not found
                if (!user) {
                    return done(null, false, {
                        message: 'Please enter valid login details'
                    });
                } else {
                    return done(null, user);
                }
                // handle catch 
            }).catch(function (err) {
                console.log(err);
                return done(null, false, {
                    message: 'Please enter valid login details'
                });
            });
        }
    ));

    passport.serializeUser(function (user, done) {
        console.log("serializeUser");
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        try {
            done(null, user);
        } catch (error) {
            console.log(error);
        }
    });
}