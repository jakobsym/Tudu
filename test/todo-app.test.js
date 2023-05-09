const test = require('tape');   // https://github.com/dwyl/learn-tape
const fs = require('fs');       // Allow to read .html files
const path = require('path');   // open files cross-platform 
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'));
require('jsdom-global')(html);  // https://github.com/rstacruz/jsdom-global
const app = require('../lib/todo-app.js');  // functions to test
const id = 'test-app';                      // 'test-app' as root element


// Test Model object structure
test('todo `model` (Object) has desired keys', function(t){
    const keys = Object.keys(app.model);    // get 'keys' from model object (todos, hash)
    t.deepEqual(keys, ['todos', 'hash'], " `todos` and `hash` keys are present.");  // compare keys with expected keys
    t.true(Array.isArray(app.model.todos), "models.todos is an Array.");            // ensure 'todos' object is an array
    t.end();    // finish test
});