---
rename:
  dirname: test
install:
  devDependencies: ['update', 'npm-install-global', 'delete']
---
'use strict';

require('mocha');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var update = require('update');
var npm = require('npm-install-global');
var del = require('delete');
var copy = require('copy');
var pkg = require('../package');
var updater = require('..');
var app;

var isTravis = process.env.CI || process.env.TRAVIS;
var fixtures = path.resolve.bind(path, __dirname, 'fixtures');
var actual = path.resolve.bind(path, __dirname, 'actual');

function exists(name, cb) {
  return function(err) {
    if (err) return cb(err);
    var filepath = actual(name);

    fs.stat(filepath, function(err, stat) {
      if (err) return cb(err);
      assert(stat);
      del(actual(), cb);
    });
  };
}

describe('<%= ask("name") %>', function() {
  this.slow(250);

  if (!process.env.CI && !process.env.TRAVIS) {
    before(function(cb) {
      npm.maybeInstall('update', cb);
    });
  }

  beforeEach(function() {
    app = update({silent: true});
    app.cwd = actual();
    app.option('dest', actual());
    copy(fixtures('*'), actual(), cb);
  });

  afterEach(function(cb) {
    del(actual(), cb);
  });

  describe('tasks', function() {
    it('should extend tasks onto the instance', function() {
      app.use(updater);
      assert(app.tasks.hasOwnProperty('default'));
      assert(app.tasks.hasOwnProperty('<%= alias %>'));
    });

    it('should run the `default` task with .build', function(cb) {
      app.use(updater);
      app.build('default', exists('<%= ask("testFile", "Test file name ?", {default: "temp.txt"}) %>', cb));
    });

    it('should run the `default` task with .update', function(cb) {
      app.use(updater);
      app.update('default', exists('<%= ask("testFile", "Test file name ?") %>', cb));
    });
  });

  describe('<%= alias %> (CLI)', function() {
    it('should run the default task using the `<%= ask("name") %>` name', function(cb) {
      if (isTravis) {
        this.skip();
        return;
      }
      app.use(updater);
      app.update('<%= ask("name") %>', exists('<%= ask("testFile", "Test file name ?") %>', cb));
    });

    it('should run the default task using the `updater` updater alias', function(cb) {
      if (isTravis) {
        this.skip();
        return;
      }
      app.use(updater);
      app.update('<%= alias %>', exists('<%= ask("testFile", "Test file name ?") %>', cb));
    });
  });

  describe('<%= alias %> (API)', function() {
    it('should run the default task on the updater', function(cb) {
      app.register('<%= alias %>', updater);
      app.update('<%= alias %>', exists('<%= ask("testFile", "Test file name ?") %>', cb));
    });

    it('should run the `<%= alias %>` task', function(cb) {
      app.register('<%= alias %>', updater);
      app.update('<%= alias %>:<%= alias %>', exists('<%= ask("testFile", "Test file name ?") %>', cb));
    });

    it('should run the `default` task when defined explicitly', function(cb) {
      app.register('<%= alias %>', updater);
      app.update('<%= alias %>:default', exists('<%= ask("testFile", "Test file name ?") %>', cb));
    });
  });

  describe('sub-updater', function() {
    it('should work as a sub-updater', function(cb) {
      app.register('foo', function(foo) {
        foo.register('<%= alias %>', updater);
      });
      app.update('foo.<%= alias %>', exists('<%= ask("testFile", "Test file name ?") %>', cb));
    });

    it('should run the `default` task by default', function(cb) {
      app.register('foo', function(foo) {
        foo.register('<%= alias %>', updater);
      });
      app.update('foo.<%= alias %>', exists('<%= ask("testFile", "Test file name ?") %>', cb));
    });

    it('should run the `updater:default` task when defined explicitly', function(cb) {
      app.register('foo', function(foo) {
        foo.register('<%= alias %>', updater);
      });
      app.update('foo.<%= alias %>:default', exists('<%= ask("testFile", "Test file name ?") %>', cb));
    });

    it('should run the `updater:<%= alias %>` task', function(cb) {
      app.register('foo', function(foo) {
        foo.register('<%= alias %>', updater);
      });
      app.update('foo.<%= alias %>:<%= alias %>', exists('<%= ask("testFile", "Test file name ?") %>', cb));
    });

    it('should work with nested sub-generators', function(cb) {
      app
        .register('foo', updater)
        .register('bar', updater)
        .register('baz', updater);
      app.update('foo.bar.baz', exists('<%= ask("testFile", "Test file name ?") %>', cb));
    });
  });
});
