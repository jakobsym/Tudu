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

// Test update() (default case)
test("todo `update` default case, should return model unmodified", function(t){
    const model = JSON.parse(JSON.stringify(app.model));
    const unmodified_model = app.update(model, "UNKNOWN_ACTION");
    t.deepEqual(model, unmodified_model, " `model` and `unmodified_model` are equal.");
    t.end();
});


// Test update() (add item to 'empty' list)
test("`ADD` new item to model.todos Array using `update`", function(t){
    const model = JSON.parse(JSON.stringify(app.model));
    t.equal(model.todos.length, 0,  " `model` size equals 0. Nothing has been added yet.");
    const updated_model = app.update(model, "ADD", "Add todo list item");
    const expected = {id: 1, title: "Add todo list item", done: false};

    t.equal(updated_model.todos.length, 1, " `updated_model` size equals 1.");
    t.deepEqual(updated_model.todos[0], expected, "contents of `updated_model` equals contents of `expected`.");
    t.end();
});


// Test update() marking a task as complete (done: true)
test("`TOGGLE` item from done=false to done=true", function(t){
    const model = JSON.parse(JSON.stringify(app.model));    // initial state
    const model_w_todo = app.update(model, "ADD", "toggle a todo list item");   // Adds data to model for testing

    const item = model_w_todo.todos[0];                     // grab first element of model.todos array
    const model_todo_done = app.update(model_w_todo, "TOGGLE", item.id);
    const expected = {id: 1, title: "toggle a todo list item", done: true};

    t.deepEqual(model_todo_done.todos[0], expected, "`model_todo_done` is equal to `expected`.");
    t.end();
});

// Test update() changing finished task back to unfinished
test("`TOGGLE` (undo) item from done=true to done=false", function(t){
    const model = JSON.parse(JSON.stringify(app.model));                         // initial state
    const model_w_todo = app.update(model, "ADD", "toggle a todo list item");   // Adds data to model for testing
    const item = model_w_todo.todos[0];                                         // grab first element of model.todos array
    const model_todo_done = app.update(model_w_todo, "TOGGLE", item.id);        // get current state of model_w_todo
    const expected = {id: 1, title: "toggle a todo list item", done: true};
    t.deepEqual(model_todo_done.todos[0], expected, "Toggled done=false >> done=true");

    // Adding another task before 'undo' on first task added
    const model_second = app.update(model_todo_done, "ADD", "another todo list item");
    t.equal(model_second.todos.length, 2, "size of `model_second` = 2");   // Ensure "ADD" works

    // Turn orignal item from done=true >> done=false
    const model_undo = app.update(model_second, "TOGGLE", item.id);
    const undo_expected = {id: 1, title: "toggle a todo list item", done: false};
    t.deepEqual(model_undo.todos[0], undo_expected, "Toggled (undo) done=true >> done=false");
    t.end();
});

// Render Single Todo List item
test.only('render_item HTML for single Todo Item', function(t){
    const model = {
        todos: [
            {id: 1, title: "Learn Elm Architecture", done:true}
        ],
        hash: '#/'  // Route to display
    };
    // Render single todo list item
    document.getElementById(id).appendChild(app.render_item(model.todos[0]));

    const done = document.querySelectorAll('.completed')[0].textContent;    // Get [0] todo list item within 'completed'
    t.equal(done, 'Learn Elm Architecture', 'Done: Learn "TEA"');           // If `done` == "Learn Elm Architecuture" 

    const checked = document.querySelectorAll('input')[0].checked;
    t.equal(checked, true, 'Done: ' + model.todos[0].title + " is done=true"); // if `checked` == true
    
    elmish.empty(document.getElementById(id));                              // clear DOM, prepare for next test
    t.end();
});