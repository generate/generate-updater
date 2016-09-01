---
rename:
  basename: 'test.js'
  dirname: 'test'
---
'use strict';

var assert = require('assert');
var <%= camelcase(alias) %> = require('<%= relative(typeof dest === "string" ? dest : "./") %>');
<% } %>

describe('Before <%= name %> is published', function () {
  it('should have real unit tests', function () {
    assert(false, 'expected <%= author.name %> to add real unit tests!');
  });
});
