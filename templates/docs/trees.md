---
layout: false
rename:
  dirname: docs
---

The following files trees are automatically updated by a task in [verbfile.js](verbfile.js).

- [updated files](#updated-files): trees representing the actual updated "dest" files for each task

_(See Update's [customization docs ][docs]{customization.md} to learn how to override individual templates.)_

### Updated files

Files updated by each task. See the Update [customization docs][docs]{customization.md} to learn how to override individual templates.

Note that diffs are base on comparisons against the files updated by the `default` task.

{%= increaseHeadings(include("trees-dest")) %}

[docs]: {%= platform.docs %}/
