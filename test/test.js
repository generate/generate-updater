'use strict';

var isTravis = process.env.CI || process.env.TRAVIS;
require('mocha');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var generate = require('generate');
var isValid = require('is-valid-app');
var npm = require('npm-install-global');
var del = require('delete');
var pkg = require('../package');
var generator = require('..');
var app;

var cwd = path.resolve.bind(path, process.cwd());
var tests = path.resolve.bind(path, __dirname);
var actual = path.resolve.bind(path, __dirname, 'actual');

function exists(name, cb) {
  return function(err) {
    if (err) return cb(err);
    fs.stat(actual(name), function(err, stat) {
      if (err) return cb(err);
      del(actual(), cb);
    });
  };
}

describe('generate-updater', function() {
  this.slow(350);

  if (!process.env.CI && !process.env.TRAVIS) {
    before(function(cb) {
      npm.maybeInstall('generate', cb);
    });
  }

  before(function(cb) {
    del([tests('actual'), tests('trees')], cb);
  });

  after(function(cb) {
    del([tests('actual'), tests('trees')], cb);
  });

  beforeEach(function() {
    app = generate({silent: true});
    app.cwd = actual();

    app.use(require('verb-repo-data'));

    // pre-populate template data to avoid prompts from `ask` helper
    app.option('prompt', false);
    app.option('check-directory', false);
    app.option('askWhen', 'not-answered');
    app.option('dest', actual());
    app.option('trees', cwd('test/trees'));
    app.option('overwrite', function(file) {
      return /actual/.test(file.path);
    });
  });

  describe('tasks', function() {
    it('should extend tasks onto the instance', function() {
      app.use(generator);
      assert(app.tasks.hasOwnProperty('default'));
      assert(app.tasks.hasOwnProperty('package'));
    });

    it('should run the `default` task with .build', function(cb) {
      app.use(generator);
      app.build(['default'], exists('package.json', cb));
    });

    it('should run the `default` task with .generate', function(cb) {
      app.use(generator);
      app.generate('default', exists('package.json', cb));
    });
  });

  describe('files', function() {
    beforeEach(function() {
      app.cwd = actual();
    });

    it('should generate a LICENSE file', function(cb) {
      app.register('updater', generator);
      app.generate('updater:license-mit', exists('LICENSE', cb));
    });

    it('should generate an index.js file', function(cb) {
      app.register('updater', generator);
      app.generate('updater:index', exists('index.js', cb));
    });

    it('should generate a .eslintrc.json file', function(cb) {
      app.register('updater', generator);
      app.generate('updater:eslintrc', exists('.eslintrc.json', cb));
    });

    it('should generate a README.md file', function(cb) {
      app.register('updater', generator);
      app.generate('updater:readme', exists('README.md', cb));
    });

    it('should generate a package.json file', function(cb) {
      app.register('updater', generator);
      app.generate('updater:package', exists('package.json', cb));
    });

    it('should run the `gitignore-node` task', function(cb) {
      app.register('updater', generator);
      app.generate('updater:gitignore-node', exists('.gitignore', cb));
    });

    it('should generate a .gitattributes file', function(cb) {
      app.register('updater', generator);
      app.generate('updater:gitattributes', exists('.gitattributes', cb));
    });

    it('should generate a .editorconfig file', function(cb) {
      app.register('updater', generator);
      app.generate('updater:editorconfig', exists('.editorconfig', cb));
    });

    it('should generate dotfiles', function(cb) {
      app.register('updater', generator);
      app.generate('updater:dotfiles', exists('.editorconfig', cb));
    });
  });

  describe('generator (CLI)', function() {
    it('should run the default task using the `generate-updater` name', function(cb) {
      if (isTravis) {
        this.skip();
        return;
      }
      app.generate('generate-updater', exists('package.json', cb));
    });

    it('should run the default task using the `updater` generator alias', function(cb) {
      if (isTravis) {
        this.skip();
        return;
      }
      app.generate('updater', exists('package.json', cb));
    });
  });

  describe('generator (API)', function() {
    it('should run the default task on the generator', function(cb) {
      app.register('updater', generator);
      app.generate('updater', exists('package.json', cb));
    });

    it('should run the `package` task', function(cb) {
      app.register('updater', generator);
      app.generate('updater:package', exists('package.json', cb));
    });

    it('should run the `default` task when defined explicitly', function(cb) {
      app.register('updater', generator);
      app.generate('updater:default', exists('package.json', cb));
    });
  });

  describe('updater:minimal', function() {
    it('should run the minimal task on the generator', function(cb) {
      app.register('updater', generator);
      app.generate('updater:minimal', exists('package.json', cb));
    });

    it('should run the `min` alias task', function(cb) {
      app.register('updater', generator);
      app.generate('updater:min', exists('package.json', cb));
    });
  });

  describe('updater:gulp', function() {
    it('should run the gulp task on the generator', function(cb) {
      app.register('updater', generator);
      app.generate('updater:gulp', exists('gulpfile.js', cb));
    });
  });

  describe('sub-generator', function() {
    it('should work as a sub-generator', function(cb) {
      app.register('foo', function(foo) {
        foo.register('updater', generator);
      });
      app.generate('foo.updater', exists('package.json', cb));
    });

    it('should run the `default` task by default', function(cb) {
      app.register('foo', function(foo) {
        foo.register('updater', generator);
      });
      app.generate('foo.updater', exists('package.json', cb));
    });

    it('should run the `updater:default` task when defined explicitly', function(cb) {
      app.register('foo', function(foo) {
        foo.register('updater', generator);
      });
      app.generate('foo.updater:default', exists('package.json', cb));
    });

    it('should run the `updater:package` task', function(cb) {
      app.register('foo', function(foo) {
        foo.register('updater', generator);
      });
      app.generate('foo.updater:package', exists('package.json', cb));
    });

    it('should work with nested sub-generators', function(cb) {
      app
        .register('foo', generator)
        .register('bar', generator)
        .register('baz', generator);
      app.generate('foo.bar.baz', exists('package.json', cb));
    });
  });
});
