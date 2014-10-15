'use strict';

var cordova = require('cordova'),
    API_BASE_URL = 'https://platform.telerik.com/feedback/api/v1',
    Feedback = function () {
        this.initialize = function (apiKey, options) {
            if (typeof apiKey !== 'string' || apiKey === '') {
                console.log('Please use a proper apiKey for initialization');
                return;
            }

            cordova.exec(function successCallback(result) {
                //not used right now. reserved for future use
            }, function errorCallback(error) {
                //not used right now. reserved for future use
            }, 'AppFeedback', 'initialize', [apiKey, API_BASE_URL]);
        };
        this.showFeedback = function () {
            cordova.exec(function successCallback(result) {
                //not used right now. reserved for future use
            }, function errorCallback(error) {
                //not used right now. reserved for future use
            }, 'AppFeedback', 'showFeedback', []);
        };
    },
    feedback = new Feedback();

module.exports = feedback;