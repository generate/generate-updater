---
install:
  dependencies: ['verb-trees', 'delete', 'verb-generate-readme']
---
'use strict';

var trees = require('verb-trees');
var del = require('delete');

/**
 * Build docs: `$ verb`
 *
 * (verb takes ~2 sec to run, since it has to
 * run all of the tasks to create file trees)
 */

module.exports = function(app) {
  app.use(require('verb-generate-readme'));
  app.option('check-directory', false);
  app.option('prompt', false);

  app.use(trees(require('./'), [
    'default',
    'minimal',
    '<%= camelcase(alias) %>'
  ]));

  app.task('docs', function(cb) {
    return app.src('docs/trees.md', {cwd: __dirname})
      .pipe(app.renderFile('*'))
      .pipe(app.dest(app.cwd));
  });

  app.task('delete', function(cb) {
    del('.temp-trees', cb);
  });

  app.task('default', ['trees', 'readme', 'docs', 'delete']);
};
