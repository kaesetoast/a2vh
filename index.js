var async = require('async'),
    path = require('path'),
    fs = require('fs'),
    exec = require('child_process').exec,
    chalk = require('chalk'),
    dir = path.join('/', 'etc', 'apache2', 'sites-available'),
    hostsFile = path.join('/', 'etc', 'hosts'),
    home = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'],
    configFilePath = path.join(home, '.a2vh'),
    templatePath = path.join('.', 'templates', 'vhost');

module.exports = function a2vh(argv) {
    'use strict';

    var content,
        sitename,
        documentRoot;

    function readConfig(callback) {
        fs.exists(configFilePath, function(exists){
            if (exists) {
                fs.readFile(configFilePath, function(err, data) {
                    var config = JSON.parse(data);
                    if (config.documentRoot) {
                        documentRoot = config.documentRoot;
                    }
                    if (config.dir) {
                        dir = config.dir;
                    }
                    if (config.templatePath) {
                        templatePath = config.templatePath;
                    }
                    callback(null, 'config');
                });
            } else {
                callback(null, 'config');
            }
        });
    }

    function checkParams(callback) {
        if (typeof argv._[0] === 'undefined') {
            callback(new Error('Please provide a sitename'), 'check');
        } else if(typeof argv._[1] === 'undefined' && typeof documentRoot === 'undefined') {
            callback(new Error('Please provide the path to the documentRoot'), 'check');
        } else {
            sitename = argv._[0];
            documentRoot = typeof documentRoot === 'undefined' ? argv._[1] : documentRoot;
            callback(null, 'check');
        }
    }

    function checkDir(callback) {
        fs.exists(dir, function(exists) {
            if (!exists) {
                callback(new Error(chalk.red('Could not find directory "') + chalk.yellow(dir) + chalk.red('"')), 'one');
            } else {
                callback(null, 'one');
            }
        });
    }

    function getTemplate(callback) {
        fs.readFile(templatePath, function(err, data) {
            if (err) {
                callback(err, 'two');
            } else {
                data = data.toString().replace(/\{sitename\}/g, sitename);
                content = data.replace(/\{documentRoot\}/g, /\/$/.test(documentRoot) ? documentRoot : documentRoot + '/');
                callback(null, 'two');
            }
        });
    }

    function writeConfFile(callback) {
        var destination = path.join(dir, sitename + '.conf');
        fs.writeFile(destination, content, function(err) {
            if (err) {
                callback(err, 'three');
            } else {
                console.info(chalk.green(' ✓ vHost configuration was written to ' + destination));
                callback(null, 'three');
            }
        });
    }

    function writeHostsFile(callback) {
        fs.appendFile(hostsFile, '\n127.0.1.1 ' + sitename + '.dev', function(err) {
            if (err) {
                callback(err, 'four');
            } else {
                console.info(chalk.green(' ✓ ' + sitename + '.dev was added to your hosts file'));
                callback(null, 'four');
            }
        });
    }

    function activateVHost(callback) {
        exec('a2ensite ' + sitename + '.conf', function(err, stdout, stderr) {
            if (err) {
                console.info(chalk.bold.yellow(' x Failed to activate vhost with a2ensite. Please do this manually.'));
            } else {
                console.info(chalk.green(' ✓ activated vHost'));
            }
            callback(null, 'five');
        });
    }

    function reloadApache(callback) {
        exec('service apache2 reload', function(err, stdout, stderr) {
            if (err) {
                console.info(chalk.bold.yellow(' x Failed to reload Apache configuration. Please do this manually.'));
            } else {
                console.info(chalk.green(' ✓ Reloaded Apache configuration'));
            }
            callback(null, 'six');
        });
    }

    async.series(
        [
            readConfig,
            checkParams,
            checkDir,
            getTemplate,
            writeConfFile,
            writeHostsFile,
            activateVHost,
            reloadApache
        ],
        function(err) {
            if (err) {
                console.error(chalk.bold.red('Error: ') + err.message);
            } else {
                console.info(chalk.green('\nConfigured vHost successfully. You can now visit your site on http://' + sitename + '.dev'));
            }
        }
    );

};