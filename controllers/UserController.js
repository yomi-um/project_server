var UserModel = require('../models/UserModel.js');

/**
 * UserController.js
 *
 * @description :: Server-side logic for managing Users.
 */
module.exports = {

    login: function(req, res, next) {
        UserModel.findOne({ username: req.body.username }, function(err, user) {
            if (err) return next(err);
            if (user && req.body.password == user.password) {
                if (req.file) {
                    req.session.userid = user._id;
                    return res.status(200).send(user);
                } else {
                    return res.status(401).send('Image not provided');
                }
            }
            return res.status(404).send('Not found');
        });
    },

    auth: function(req, res, next) {
        if (!req.session.userid)
            return res.status(404).send('Not logged in');

        UserModel.findById(req.session.userid, function(err, user) {
            if (err) return next(err);
            if (!user) {
                return res.status(403).send('Not found')
            };

            next();
        })
    },

    /**
     * UserController.list()
     */
    list: function(req, res) {
        UserModel.find(function(err, Users) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting User.',
                    error: err
                });
            }

            return res.json(Users);
        });
    },

    /**
     * UserController.show()
     */
    show: function(req, res) {
        var id = req.params.id;

        UserModel.findOne({ _id: id }, function(err, User) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting User.',
                    error: err
                });
            }

            if (!User) {
                return res.status(404).json({
                    message: 'No such User'
                });
            }

            return res.json(User);
        });
    },

    is_exists: function(req, res, next) {
        UserModel.countDocuments({ 'username': req.body.username }, function(err, count) {
            if (count > 0) {
                return res.status(409).json({
                    message: 'User already exists'
                });
            }
            next();
        });
    },

    /**
     * UserController.create()
     */
    create: function(req, res) {
        var User = new UserModel({
            username: req.body.username,
            password: req.body.password
        });

        User.save(function(err, User) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating User',
                    error: err
                });
            }
            req.session.userid = User._id;

            return res.status(201).json(User);
        });
    },

    /**
     * UserController.update()
     */
    update: function(req, res) {
        var id = req.params.id;

        UserModel.findOne({ _id: id }, function(err, User) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting User',
                    error: err
                });
            }

            if (!User) {
                return res.status(404).json({
                    message: 'No such User'
                });
            }

            User.username = req.body.username ? req.body.username : User.username;
            User.password = req.body.password ? req.body.password : User.password;

            User.save(function(err, User) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating User.',
                        error: err
                    });
                }

                return res.json(User);
            });
        });
    },

    /**
     * UserController.remove()
     */
    remove: function(req, res) {
        var id = req.params.id;

        UserModel.findByIdAndRemove(id, function(err, User) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the User.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    }
};