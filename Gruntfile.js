module.exports = function(grunt) {

    'use strict';

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            all: ['Gruntfile.js', 'cli.js', 'index.js', 'test/**/*.js']
        },

        mochaTest: {
            test: {
                options: {
                    reporter: 'nyan'
                },
                src: ['test/**/*.js']
            }
        },

        watch: {
            js: {
                files: ['**/*.js'],
                tasks: ['jshint', 'mochaTest']
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['jshint', 'mochaTest', 'watch']);
    grunt.registerTask('test', ['mochaTest']);

};