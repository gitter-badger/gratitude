var DocumentDBClient = require('documentdb').DocumentClient;
var async = require('async');

function TaskList(taskDao) {
  this.taskDao = taskDao;
}

module.exports = TaskList;

TaskList.prototype = {
    showTasks: function (req, res) {
        var self = this;

        var querySpec = {
            query: 'SELECT * FROM root r WHERE r.completed=@completed',
            parameters: [{
                name: '@completed',
                value: false
            }]
        };

        self.taskDao.find(querySpec, function (err, items) {
            if (err) {
                throw (err);
            }

              res.setHeader('Content-Type', 'application/json');
              res.send(JSON.stringify(items));

        });
    },

    addTask: function (req, res) {
        var self = this;
        var item = req.body;

        self.taskDao.addItem(item, function (err) {
            if (err) {
                throw (err);
            }

            res.redirect('/');
        });
    },

    completeTask: function (req, res) {
        var self = this;
        var completedTasks = Object.keys(req.body);

        async.forEach(completedTasks, function taskIterator(completedTask, callback) {
            self.taskDao.updateItem(completedTask, function (err) {
                if (err) {
                    callback(err);
                } else {
                    callback(null);
                }
            });
        }, function goHome(err) {
            if (err) {
                throw err;
            } else {
                res.redirect('/');
            }
        });
    }
};
