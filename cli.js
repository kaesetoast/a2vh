#! /usr/bin/env node

var a2vh = require('./');
var argv = require('minimist')(process.argv.slice(2));

a2vh(argv);