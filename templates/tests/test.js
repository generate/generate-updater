---
rename:
  dirname: test
install:
  devDependencies: ['generate', 'npm-install-global', 'delete']
---
'use strict';

require('mocha');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var generate = require('generate');
var npm = require('npm-install-global');
var del = require('delete');
var generator = require('..');
var app;

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
      npm.maybeInstall('generate', cb);
    });
  }

  beforeEach(function() {
    app = generate({silent: true});
    app.cwd = actual();
    app.option('dest', actual());

    // see: https://github.com/jonschlinkert/ask-when
    app.option('askWhen', 'not-answered');

    // set default data to use in templates. feel free
    // to remove anything that isn't used (e.g. if
    // "username" isn't defined in templates, just remove it)
    app.data(require('../package'));
    app.data('username', 'foo');
    app.data('owner', 'foo');
  });

  afterEach(function(cb) {
    del(actual(), cb);
  });

  describe('plugin', function() {
    it('should only register the plugin once', function(cb) {
      var count = 0;
      app.on('plugin', function(name) {
        if (name === '<%= ask("name") %>') {
          count++;
        }
      });
      app.use(generator);
      app.use(generator);
      app.use(generator);
      assert.equal(count, 1);
      cb();
    });

    it('should extend tasks onto the instance', function() {
      app.use(generator);
      assert(app.tasks.hasOwnProperty('default'));
      assert(app.tasks.hasOwnProperty('<%= camelcase(alias) %>'));
    });

    it('should run the `default` task with .build', function(cb) {
      app.use(generator);
      app.build('default', exists(fixtures('text.txt'), cb));
    });

    it('should run the `default` task with .generate', function(cb) {
      app.use(generator);
      app.generate('default', exists(fixtures('text.txt'), cb));
    });
  });

  if (!process.env.CI && !process.env.TRAVIS) {
    describe('<%= camelcase(alias) %> (CLI)', function() {
      it('should run the default task using the `<%= ask("name") %>` name', function(cb) {
        app.use(generator);
        app.generate('<%= ask("name") %>', exists(fixtures('text.txt'), cb));
      });

      it('should run the default task using the `generator` generator camelcase(alias)', function(cb) {
        app.use(generator);
        app.generate('<%= camelcase(alias) %>', exists(fixtures('text.txt'), cb));
      });
    });
  }

  describe('<%= camelcase(alias) %> (API)', function() {
    it('should run the default task on the generator', function(cb) {
      app.register('<%= camelcase(alias) %>', generator);
      app.generate('<%= camelcase(alias) %>', exists(fixtures('text.txt'), cb));
    });

    it('should run the `<%= camelcase(alias) %>` task', function(cb) {
      app.register('<%= camelcase(alias) %>', generator);
      app.generate('<%= camelcase(alias) %>:<%= camelcase(alias) %>', exists(fixtures('text.txt'), cb));
    });

    it('should run the `default` task when defined explicitly', function(cb) {
      app.register('<%= camelcase(alias) %>', generator);
      app.generate('<%= camelcase(alias) %>:default', exists(fixtures('text.txt'), cb));
    });
  });

  describe('sub-generator', function() {
    it('should work as a sub-generator', function(cb) {
      app.register('foo', function(foo) {
        foo.register('<%= camelcase(alias) %>', generator);
      });
      app.generate('foo.<%= camelcase(alias) %>', exists(fixtures('text.txt'), cb));
    });

    it('should run the `default` task by default', function(cb) {
      app.register('foo', function(foo) {
        foo.register('<%= camelcase(alias) %>', generator);
      });
      app.generate('foo.<%= camelcase(alias) %>', exists(fixtures('text.txt'), cb));
    });

    it('should run the `generator:default` task when defined explicitly', function(cb) {
      app.register('foo', function(foo) {
        foo.register('<%= camelcase(alias) %>', generator);
      });
      app.generate('foo.<%= camelcase(alias) %>:default', exists(fixtures('text.txt'), cb));
    });

    it('should run the `generator:<%= camelcase(alias) %>` task', function(cb) {
      app.register('foo', function(foo) {
        foo.register('<%= camelcase(alias) %>', generator);
      });
      app.generate('foo.<%= camelcase(alias) %>:<%= camelcase(alias) %>', exists(fixtures('text.txt'), cb));
    });

    it('should work with nested sub-generators', function(cb) {
      app
        .register('foo', generator)
        .register('bar', generator)
        .register('baz', generator)

      app.generate('foo.bar.baz', exists(fixtures('text.txt'), cb));
    });
  });
});
