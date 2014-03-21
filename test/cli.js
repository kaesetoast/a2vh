var exec = require('child_process').exec,
    expect = require('chai').expect;

describe('params', function () {
    it('should yell at me when not providing params', function (done) {
        exec('node cli.js', function(err, stdout, stderr) {
            expect(stderr).to.equal('Error: Please provide a sitename and the path to the document root\n');
            done();
        });
    });

    it('should yell at me when only providing one param', function (done) {
        exec('node cli.js testparam', function(err, stdout, stderr) {
            expect(stderr).to.equal('Error: Please provide a sitename and the path to the document root\n');
            done();
        });
    });
});
