'use strict';

var isValid = require('is-valid-app');

module.exports = function(app) {
  if (!isValid(app, 'generate-updater')) return;
  app.option('layout', false);

  /**
   * Plugin
   */

  app.use(require('generate-project'));
  app.use(require('generate-git'));

  /**
   * Attempt to pre-populate answers
   */

  app.on('ask', function(val, key, question, answers) {
    if (typeof val !== 'undefined') return;
    if (/^author\./.test(key)) {
      answers[key] = app.common.get(key);
    } else {
      answers[key] = app.data(key) || app.base.data(key);
    }
  });

  /**
   * Scaffold out an [update][] updater project. Alias for the [updater](#updater)
   * task, to allow running the updater with the following command:
   *
   * ```sh
   * $ gen updater
   * ```
   * @name updater:default
   * @api public
   */

  app.task('default', ['updater']);
  app.task('updater', [
    'prompt-data',
    'test',
    'dotfiles',
    'main',
    'rootfiles'
  ]);

  /**
   * Scaffold out a minimal [Update][] updater project.
   *
   * ```sh
   * $ gen updater:min
   * # or
   * $ gen updater:minimal
   * ```
   * @name updater:minimal
   * @api public
   */

  app.task('min', ['minimal']);
  app.task('minimal', [
    'prompt-data',
    'gitignore-node',
    'main',
    'license-mit',
    'package',
    'readme'
  ]);

  /**
   * Scaffold out a project for a [Update][] micro-updater.
   *
   * ```sh
   * $ gen updater:micro
   * ```
   * @name updater:micro
   * @api public
   */

  app.task('micro', [
    'prompt-data',
    'test',
    'dotfiles',
    'main-micro',
    'rootfiles',
    'prompt-install',
    'prompt-git'
  ]);

  /**
   * Write a `updater.js` file to the current working directory.
   *
   * ```sh
   * $ gen updater:file
   * ```
   * @name updater:file
   * @api public
   */

  task(app, 'main', ['templates/updatefile.js', 'templates/index.js']);

  /**
   * Write the `updater.js` and `index.js` files for a micro-updater.
   *
   * ```sh
   * $ gen updater:main-micro
   * ```
   * @name updater:main-micro
   */

  task(app, 'main-micro', ['templates/updater-micro.js', 'templates/index.js']);

  /**
   * Generate the LICENSE, package.json and README.md files for an updater project.
   *
   * ```sh
   * $ gen updater:rootfiles
   * ```
   * @name updater:rootfiles
   * @api public
   */

  app.task('rootfiles', [
    'license-mit',
    'package',
    'readme'
  ]);

  /**
   * Add a `verbfile.js` and basic docs in the `docs` directory.
   *
   * ```sh
   * $ gen updater:docs
   * ```
   * @name updater:docs
   * @api public
   */

  task(app, 'docs', ['templates/docs/*.md', 'templates/verbfile.js']);

  /**
   * Create a `test.js` file in the `test` directory, with unit tests for all of the tasks
   * in the generated updater.
   *
   * ```sh
   * $ gen updater:test
   * ```
   * @name updater:test
   * @api public
   */

  task(app, 'test', ['templates/tests/test.js', 'templates/tests/plugin.js']);
  task(app, 'test-basic', ['templates/tests/basic.js']);

  /**
   * Generate files in the updater's `templates` directory.
   *
   * ```sh
   * $ gen updater:templates
   * ```
   * @name updater:templates
   * @api public
   */

  task(app, 'templates', 'templates/templates/*.*');

  /**
   * Middleware for updating the context
   */

  app.preRender(/package\.json$/, function(file, next) {
    app.cache.answers = app.cache.answers || {};
    var desc = (app.cache.answers.description || '').replace(/[.\s]+$/, '');
    app.cache.answers.description = desc + `. Use from the command line when Update's CLI is installed globally, or use as a plugin in your own updater.`
    next();
  });

  /**
   * Don't ask the same questions more than once
   */

  app.task('prompt-data', ['prompt'], function(cb) {
    app.option('askWhen', 'not-answered');
    app.data('description', 'My awesome updater.');
    cb();
  });
};

/**
 * Create a task with the given `name` and glob `pattern`
 */

function task(app, name, patterns) {
  app.task(name, function() {
    return file(app, patterns);
  });
}

function file(app, patterns) {
  return app.src(patterns, {cwd: __dirname})
    .pipe(app.renderFile('*', {layout: null})).on('error', console.log)
    .pipe(app.conflicts(app.cwd))
    .pipe(app.dest(app.cwd));
}
