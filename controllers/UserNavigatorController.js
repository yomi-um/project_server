var UserNavigatorModel = require('../models/UserNavigatorModel.js');
var NavigatorHistoryModel = require('../models/NavigatorHistoryModel.js');

/**
 * UserNavigatorController.js
 *
 * @description :: Server-side logic for managing UserNavigators.
 */
module.exports = {

    /**
     * UserNavigatorController.list()
     */
    list: function (req, res) {
        UserNavigatorModel.find().populate('history').exec(function (err, UserNavigators) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting UserNavigator.',
                    error: err
                });
            }

            return res.json(UserNavigators);
        });
    },

    /**
     * UserNavigatorController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        UserNavigatorModel.findOne({ _id: id }, function (err, UserNavigator) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting UserNavigator.',
                    error: err
                });
            }

            if (!UserNavigator) {
                return res.status(404).json({
                    message: 'No such UserNavigator'
                });
            }

            return res.json(UserNavigator);
        });
    },

    /**
     * UserNavigatorController.create()
     */
    create: function (req, res) {
        UserNavigatorModel.findOne({ user: req.session.userid, finished: false }, function (err, UserNavigator) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting UserNavigator.',
                    error: err
                });
            }

            let navigationHistory = new NavigatorHistoryModel(req.body);
            navigationHistory.save(function (err, navigationHistory) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when creating NavigationHistory.',
                        error: err
                    });
                }

                if (!UserNavigator) {
                    UserNavigator = new UserNavigatorModel({
                        user: req.session.userid,
                        history: [navigationHistory]
                    });
                }
                else {
                    UserNavigator.history.push(navigationHistory);
                }

                UserNavigator.save(function (err, UserNavigator) {
                    if (err) {
                        return res.status(500).json({
                            message: 'Error when creating UserNavigator',
                            error: err
                        });
                    }

                    return res.status(201).json(UserNavigator);
                });
            });
        });
    },

    finish: function (req, res) {
        UserNavigatorModel.findOneAndUpdate({ user: req.session.userid, finished: false }, { finished: true, finishedAt: new Date() }, function (err, UserNavigator) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting UserNavigator',
                    error: err
                });
            }

            if (!UserNavigator) {
                return res.status(500).json({
                    message: 'Error when updating UserNavigator.'
                });
            }

            return res.json(UserNavigator);
        });
    },

    /**
     * UserNavigatorController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        UserNavigatorModel.findOne({ _id: id }, function (err, UserNavigator) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting UserNavigator',
                    error: err
                });
            }

            if (!UserNavigator) {
                return res.status(404).json({
                    message: 'No such UserNavigator'
                });
            }

            UserNavigator.save(function (err, UserNavigator) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating UserNavigator.',
                        error: err
                    });
                }

                return res.json(UserNavigator);
            });
        });
    },

    /**
     * UserNavigatorController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        UserNavigatorModel.findByIdAndRemove(id, function (err, UserNavigator) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the UserNavigator.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    }
};
