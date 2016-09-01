{{#block "tasks"}}
## Tasks
Tasks are modularized in an effort to make it as easy as possible for you to create your own a-la-carte generator experience. As such:

- some tasks generate one specific file
- some tasks generate multiple files
- some tasks are just aliases for running "groups" of tasks

**Running tasks**

To run a task, just run `$ gen {%= alias %}:` followed by the name of the task to run. For example, either of the following commands can be used to run the `minimal` task:

```sh
$ gen {%= alias %}:min
$ gen {%= alias %}:minimal
```
### Available tasks
{%= increaseHeadings(apidocs("updatefile.js")) %}
{{/block}}

## Files trees
{%= doc('trees.md') %}

[docs]: {%= platform.docs %}/

## Next steps
### Running unit tests

It's never too early to begin running unit tests. When you're ready to get started, the following command will ensure the project's dependencies are installed then run all of the unit tests:

```sh
$ npm install && test
```

### Publishing your project

If you're tests are passing and you're ready to publish your project to [npm](https://www.npmjs.com), you can do that now with the following command:

**Are you sure you're ready?!**

```sh
$ npm publish
```
