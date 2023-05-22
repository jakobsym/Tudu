const test = require('tape');   // https://github.com/dwyl/learn-tape
const fs = require('fs');       // Allow to read .html files
const path = require('path');   // open files cross-platform 
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'));
require('jsdom-global')(html);  // https://github.com/rstacruz/jsdom-global
const app = require('../lib/todo-app.js');  // functions to test
const id = 'test-app';                      // 'test-app' as root element
const elmish = require('../lib/elmish.js'); // import "elmish" core functions


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
// test.only() is a way to test only specified tests
test('render_item HTML for single Todo Item', function(t){
    const model = {
        todos: [
            {id: 1, title: "Learn Elm Architecture", done:true}
        ],
        hash: '#/'  // Route to display
    };
    // Render single todo list item
    document.getElementById(id).appendChild(app.render_item(model.todos[0]))

    const done = document.querySelectorAll('.completed')[0].textContent;    // Get [0] todo list item within 'completed'
    t.equal(done, 'Learn Elm Architecture', 'Done: Learn "TEA"');           // If `done` == "Learn Elm Architecuture" 

    const checked = document.querySelectorAll('input')[0].checked;
    t.equal(checked, true, 'Done: ' + model.todos[0].title + " is done=true"); // if `checked` == true

    elmish.empty(document.getElementById(id));                              // clear DOM, prepare for next test
    t.end();
});

// `render_main` test
test('render "main" view using (elmish) HTML DOM functions', function(t){
    const model = {
        todos: [
            { id: 1, title: "Learn Elm Architecture", done: true },
            { id: 2, title: "Build Todo List App",    done: false },
            { id: 3, title: "Win the Internet!",      done: false }
        ],
        hash: '#/'  // Route to display
    };

    // render "main" view and append it to the DOM inside the `test-app` node
    document.getElementById(id).appendChild(app.render_main(model));
    // test title text in model.todos was rendered to <label> node
    document.querySelectorAll('.view').forEach(function(item, index){
        t.equal(item.textContent, model.todos[index].title,
        "index #" + index + " <label> text: " + item.textContent);
    })

    const inputs = document.querySelectorAll('input');  // todo items are 1,2,3
    [true, false, false].forEach(function(state, index){
        //console.log("`index`= " + index + 1);
        console.log(inputs[index + 1]);
        t.equal(inputs[index + 1].checked, state, 
            "Todo #" + index + " is done=" + state);
    })
    
    elmish.empty(document.getElementById(id));       // clear DOM, prepare for next test
    t.end();
});

// 'render_footer' function test
test('render_footer view using (elmish) HTML DOM functions', function(t){
    const model = {
        todos: [
            { id: 1, title: "Learn Elm Architecture", done: true },
            { id: 2, title: "Build Todo List App",    done: false },
            { id: 3, title: "Win the Internet!",      done: false }
        ],
        hash: '#/'  // Route to display
    };

    // render footer view and append it to the DOM
    document.getElementById(id).appendChild(app.render_footer(model));

    // count should display 2 items left
    const items_left = document.getElementById('count').innerHTML;
    t.equal(items_left, "<strong>2</strong> items left", "Items left = " + items_left + 
    " equals 2");

    // count number of footer <li> items: (should be 3)
    t.equal(document.querySelectorAll('li').length, 3, "3 <li> within <footer>");

    // check footer link text and href
    const link_text = ['All', 'Active', 'Completed'];
    const href = ['#/', '#/active', '#/completed'];

    document.querySelectorAll('a').forEach(function(a, index){
        t.equal(a.textContent, link_text[index], "<footer> link #" + index
        + " is: " + a.textContent + "===" + link_text[index]);

        t.equal(a.href.replace('about:blank', ''), href[index], "<footer> link #" +
        index + " href is: " + href[index]);
    });

    // check if "clear" button is in footer
    const clear_button = document.querySelectorAll('.clear-completed')[0].textContent;
    t.equal(clear_button, 'Clear completed', '<button> in <footer> "Clear completed"');

    elmish.empty(document.getElementById(id));       // clear DOM, prepare for next test
    t.end();
});