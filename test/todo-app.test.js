const test = require('tape');   // https://github.com/dwyl/learn-tape
const fs = require('fs');       // Allow to read .html files
const path = require('path');   // open files cross-platform 
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'));
require('jsdom-global')(html);  // https://github.com/rstacruz/jsdom-global
const app = require('../lib/todo-app.js');  // functions to test
const id = 'test-app';                      // 'test-app' as root element
const elmish = require('../lib/elmish.js'); // import "elmish" core functions

// For testing view functions that require a signal
function mock_signal(){
    return function inner_function(){
        console.log("finish");
    }
}


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
    const unmodified_model = app.update("UNKNOWN_ACTION", model );
    t.deepEqual(model, unmodified_model, " `model` and `unmodified_model` are equal.");
    t.end();
});


// Test update() (add item to 'empty' list)
test("`ADD` new item to model.todos Array using `update`", function(t){
    const model = JSON.parse(JSON.stringify(app.model));
    t.equal(model.todos.length, 0,  " `model` size equals 0. Nothing has been added yet.");
    const updated_model = app.update('ADD',model , "Add todo list item");
    const expected = {id: 1, title: "Add todo list item", done: false};

    t.equal(updated_model.todos.length, 1, " `updated_model` size equals 1.");
    t.deepEqual(updated_model.todos[0], expected, "contents of `updated_model` equals contents of `expected`.");
    t.end();
});


// Test update() marking a task as complete (done: true)
test("`TOGGLE` item from done=false to done=true", function(t){
    const model = JSON.parse(JSON.stringify(app.model));    // initial state
    const model_w_todo = app.update('ADD', model, "toggle a todo list item");   // Adds data to model for testing

    const item = model_w_todo.todos[0];                     // grab first element of model.todos array
    const model_todo_done = app.update('TOGGLE', model_w_todo, item.id);
    const expected = {id: 1, title: "toggle a todo list item", done: true};

    t.deepEqual(model_todo_done.todos[0], expected, "`model_todo_done` is equal to `expected`.");
    t.end();
});

// Test update() changing finished task back to unfinished
test("`TOGGLE` (undo) item from done=true to done=false", function(t){
    const model = JSON.parse(JSON.stringify(app.model));                         // initial state
    const model_w_todo = app.update('ADD', model, "toggle a todo list item");   // Adds data to model for testing
    const item = model_w_todo.todos[0];                                         // grab first element of model.todos array
    const model_todo_done = app.update('TOGGLE', model_w_todo, item.id);        // get current state of model_w_todo
    const expected = {id: 1, title: "toggle a todo list item", done: true};
    t.deepEqual(model_todo_done.todos[0], expected, "Toggled done=false >> done=true");

    // Adding another task before 'undo' on first task added
    const model_second = app.update('ADD', model_todo_done, "another todo list item");
    t.equal(model_second.todos.length, 2, "size of `model_second` = 2");   // Ensure "ADD" works

    // Turn orignal item from done=true >> done=false
    const model_undo = app.update('TOGGLE', model_second, item.id);
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
    t.equal(clear_button, 'Clear completed [1]', '<button> in <footer> "Clear completed"');

    elmish.empty(document.getElementById(id));       // clear DOM, prepare for next test
    t.end();
});

// render_footer pluaruisation test
test('render_footer 1 item left (pluaruisation test)', function(t){
    const model = {
        todos:[
            {id: 1, title: "Learn Elm Architecture", done: false}
        ],
        hash: "#/"
    };

    // render footer view and append it to the DOM
    document.getElementById(id).appendChild(app.render_footer(model));

    // should display "1 items left"
    const items_left = document.getElementById('count').innerHTML;
    t.equal(items_left, "<strong>1</strong> item left", "Items left = " + items_left + 
    " equals 1");


    elmish.empty(document.getElementById(id));
    t.end();
});

test('`view` function using HTML DOM functions', function(t){
    
    // render view function and append to DOM
    document.getElementById(id).appendChild(app.view(app.model));
    
    // check <h1> element
    t.equal(document.querySelectorAll('h1')[0].textContent, "Tudus", "<h1>Tudus</h1>");

    // check placeholder of <input> element
    const placeholder = document.getElementById('new-todo').getAttribute("placeholder");
    t.equal(placeholder, "What needs to be done?", "placeholder set on <input>");

    // should display "0 items left"
    const items_left = document.getElementById('count').innerHTML;
    t.equal(items_left, "<strong>0</strong> items left", "Items left = " + items_left + 
    " equals 0");

    elmish.empty(document.getElementById(id));
    t.end();
});

// No todos, hide footer and main
test("1. No Todos, hide #footer and #main", function(t){
    const model = {
        todos: [],
        hash: '#/'  // Route to display
    };

    document.getElementById(id).appendChild(app.view(model));   // Pass no Todos

    // Create #main 
    const main_display = window.getComputedStyle(document.getElementById('main'));
    t.equal('none', main_display._values.display, "No todos, hide #main");

    // Create #footer
    const footer_display = window.getComputedStyle(document.getElementById('footer'));
    t.equal('none', footer_display._values.display, "No todos, hide #footer");

    elmish.empty(document.getElementById(id));
    t.end();
});

// Adding new item to todo list (checking localStorage so any data user enters persists on their browser)

/* if global.localStorage exists = global.localStorage
else create a mimic implementation of localStorage
*/
global.localStorage = global.localStorage ? global.localStorage : {
    getItem: function(key) {
     const value = this[key];
     return typeof value === 'undefined' ? null : value;
   },
   setItem: function (key, value) {
     this[key] = value;
   },
   removeItem: function (key) {
     delete this[key]
   }
}
localStorage.removeItem('todos-elmish_store');

test("2. New Todo, should allow user to add todo items", function(t){
    elmish.empty(document.getElementById(id));
    // Render view and append to the DOM
    elmish.mount({todos: []}, app.update, app.view, id, app.subscriptions);

    const new_todo = document.getElementById('new-todo');
    const todo_text = 'Make Everything Awesome!     ';   // white space intentional
    // assign a todo item
    new_todo.value = todo_text;

    // trigger `enter` keyboard key to ADD new todo
    //console.log("new_todo.value= ", new_todo.value);
    document.dispatchEvent(new KeyboardEvent('keyup', {'key': 'Enter'}));
    const items = document.querySelectorAll('.view');
    //console.log(items.length);  // returns 0
    t.equal(items.length, 1, "items length should = 1, as 1 item added");

    // Check if new todo was added to DOM
    const actual = document.getElementById('1').textContent;
    t.equal(todo_text.trim(), actual, "should trim text input");

    // subscription keyCode trigger test (!should fire signal)
    const clone = document.getElementById(id).cloneNode(true);  // create clone of DOM
    document.dispatchEvent(new KeyboardEvent('keyup', {'key': 42}));
    t.deepEqual(document.getElementById(id), clone, "#" + id + " no change");

    // check <input id="new-todo"> reset after new item was added
    t.equal(new_todo.value, '', "Should clear text input field when input added.");

    // check for #footer and #main to be 'block'// Create #main 
    const main_display = window.getComputedStyle(document.getElementById('main'));
    t.equal('block', main_display._values.display, "1 todos added, show #main");

    // Create #footer
    const footer_display = window.getComputedStyle(document.getElementById('footer'));
    t.equal('block', footer_display._values.display, "1 todos addded, show #footer");

    // clear DOM and clear 'localStorage' for next test
    elmish.empty(document.getElementById(id));
    localStorage.removeItem('todos-elmish_' + id);
    t.end();
});


// Mark all as completed test
test("3. Mark all as completed ('TOGGLE_ALL') " , function(t){
    elmish.empty(document.getElementById(id));  // ensure DOM empty
    localStorage.removeItem('elmish_' + id);
    // create test Model
    const model = {
        todos: [
            { id: 1, title: "Learn Elm Architecture", done: true },
            { id: 2, title: "Build Todo List App",    done: false },
            { id: 3, title: "Win the Internet!",      done: false }
        ],
        hash: '#/'  // Route to display
    };
    // render view and append to DOM inside 'test-app' node
    elmish.mount(model, app.update, app.view, id, app.subscriptions);

    // ensure first todo item == true
    const items = document.querySelectorAll('.view');
    document.querySelectorAll('.toggle').forEach(function(element ,index){
        t.equal(element.checked, model.todos[index].done, "Todo #" + index + " is done " + element.checked 
        + " text: " + items[index].textContent);
    })

    // toggle-all checkbox to trigger TOGGLE_ALL todo-items -> true
    document.getElementById('toggle-all').click();  // click the 'toggle-all' checkbox
    document.querySelectorAll('.toggle').forEach(function(element, index){
        t.equal(element.checked, true, "TOGGLE each Todo #" + index + " is done=" + element.checked + 
        " text: " + items[index].textContent);
    });
    t.equal(document.getElementById('toggle-all').checked, true, "should allow to mark all items as completed");

    //toggle-all checkbox to trigger TOGGLE_ALL todo-items(true) -> false
    document.getElementById('toggle-all').click();  // click the 'toggle-all' checkbox
    document.querySelectorAll('.toggle').forEach(function(element, index){
        t.equal(element.checked, false, "TOGGLE each Todo #" + index + " is done=" + element.checked + 
        " text: " + items[index].textContent);
    });
    t.equal(document.getElementById('toggle-all').checked, false, "should allow to mark all items as completed");


    // manually click e/a todo item
    document.querySelectorAll('.toggle').forEach(function(element, index){
        element.click();
        t.equal(element.checked, true, ".toggle.click() each Todo #" + index + " which is done=" + element.checked
        + " text: " + items[index].textContent);
    });
    
    // toggle-all checkbox should be "checked" as every todo-item.done == true
    t.equal(document.getElementById('toggle-all').checked, true, 
    "complete all checkbox should update states when items completed.");


    elmish.empty(document.getElementById(id));
    t.end();
});

// Toggle test (should pass w/o changing anything witihn 'todo-app.js')
test("4. Mark individual item as complete (done=true)", function(t){
    elmish.empty(document.getElementById(id));
    localStorage.removeItem('elmish_' + id);
    
    const model = {
        todos: [
            {id: 0, title: "Make something people want.", done:false}
        ],
        hash: "#/"
    };

    elmish.mount(model, app.update, app.view, id ,app.subscriptions);
    // ensure model was added to todo-list
    const item = document.getElementById('0');

    t.equal(item.textContent, model.todos[0].title, "Item contained in model.");

    // confirm todo-item is done=false
    t.equal(document.querySelectorAll('.toggle')[0].checked, false, 
    "Items start as 'done=false' ");

    // click checkbox to toggle done=false -> done=true
    document.querySelectorAll('.toggle')[0].click();
    t.equal(document.querySelectorAll('.toggle')[0].checked, true,
    "Item should be marked as complete")

    // click checkbox to toggle done=true -> done=false (undo)
    document.querySelectorAll('.toggle')[0].click();
    t.equal(document.querySelectorAll('.toggle')[0].checked, false,
    "Item should be undone if done=true.")
    
    t.end();
});

// DELETE an item test
test("4.1. Option to delete a task when clicking <button class='destroy'>", function(t){
    elmish.empty(document.getElementById(id))

    localStorage.removeItem('elmish_' + id);
    const model = {
        todos:[
            {id: 0, title: "Make something people want.", done: false}
        ],
        hash: "#/"
    }
    elmish.mount(model, app.update, app.view, id, app.subscriptions);

    t.equal(document.querySelectorAll('.destroy').length, 1, "one destroy button as 1 todoitem");
    
    const item = document.getElementById('0');
    // ensure item is in DOM
    t.equal(item.textContent, model.todos[0].title, "Item contained in DOM");
    // Try to delete item by clicking on <button class="destroy">
    const button = item.querySelectorAll('button.destroy')[0];
    button.click();

    // confirm <button class="destory"> no longer visible as we removed all todos
    t.equal(document.querySelectorAll('button.destroy').length, 0, 
    "No longer a <button class=destroy> as only todo item was deleted.");
    // ensure todoitem was succesfully removed.
    t.equal(document.getElementById('0'), null, "todo item succesfully removed.");

    t.end();
});


// EDIT item test
test("5. Option to allow user to edit todo task. -> Render an item in 'editing mode'", function(t){

    elmish.empty(document.getElementById(id))
    localStorage.removeItem('elmish_' + id);

    const model = {
        todos:[
            {id: 0, title: "Make something people want.", done: false},
            {id: 1, title: "Bootstrap", done: false},
            {id: 2, title: "Make dinner", done: false}
        ],
        hash: "#/",
        editing: 2  // attempt to edit 'id:2'
    }

    // render 1 todo list item in 'editing mode'
    document.getElementById(id).appendChild(app.render_item(model.todos[2], model, mock_signal),);

    // test signal is onclick attribute
    t.equal(document.querySelectorAll('.view > label')[0].onclick.toString(),
        mock_signal().toString(), "mock_signal is onclick attribute of label");

    // check if <li class="editing"> is rendered
    t.equal(document.querySelectorAll('.editing').length, 1,
    '<li class="editing"> was correctly rendered.')

    // check if <input class="edit"> is rendered
    t.equal(document.querySelectorAll('.edit').length, 1,
    '<input class="edit"> was correctly rendered.')

    // check `editing: 2` === (id: 2) todo task
    t.equal(document.querySelectorAll('.edit')[0].value, model.todos[2].title,
    '<input class="edit"> has value: ' + model.todos[2].title);

    t.end();
});

test('5.2 Double-click an item <label> to edit it', function (t) {
    elmish.empty(document.getElementById(id));
    localStorage.removeItem('elmish_' + id);

    const model = {
      todos: [
        { id: 0, title: "Make something people want.", done: false },
        { id: 1, title: "Let's solve our own problem", done: false }
      ],
      hash: '#/' // the "route" to display
    };

    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, app.update, app.view, id, app.subscriptions);
    const label = document.querySelectorAll('.view > label')[1]

    // "double-click" i.e. click the <label> twice in quick succession:
    label.click();
    label.click();

    // confirm that we are now in editing mode:
    t.equal(document.querySelectorAll('.editing').length, 1,
      "<li class='editing'> element is visible");

    t.equal(document.querySelectorAll('.edit')[0].value, model.todos[1].title,
      "<input class='edit'> has value: " + model.todos[1].title);

    t.end();
  });

// SAVE test: [Enter] key press in edit mode triggers SAVE
test("5.3 [Enter] key press in edit mode triggers SAVE", function(t){
    elmish.empty(document.getElementById(id));
    localStorage.removeItem('elmish_' + id);

    const model = {
        todos: [
          { id: 0, title: "Make something people want.", done: false },
          { id: 1, title: "Let's solve our own problem", done: false }
        ],
        hash: '#/', // the "route" to display
        editing: 1
    };

    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, app.update, app.view, id, app.subscriptions);
    const updated_title = "Do things that don\'t scale!  "
    
    // apply updated_title
    document.querySelectorAll('.edit')[0].value = updated_title;
    // press [Enter]
    document.dispatchEvent(new KeyboardEvent('keyup', {'key': 'Enter'}));
    const label = document.querySelectorAll('.view > label')[1].textContent;

    t.equal(label, updated_title.trim(), 
    "item title updated to: " + updated_title + '(trimmed)')

    t.end();
});

// Remove the item if an empty text string was entered
test("5.4 'SAVE' should remove the item if an empty text string was entered", function(t){
    elmish.empty(document.getElementById(id));
    localStorage.removeItem('elmish_' + id);

    const model = {
        todos: [
          { id: 0, title: "Make something people want.", done: false },
          { id: 1, title: "Let's solve our own problem", done: false }
        ],
        hash: '#/', // the "route" to display
        editing: 1
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, app.update, app.view, id, app.subscriptions);
    t.equal(document.querySelectorAll('.view').length, 2, 
    "Todo count = 2.")

    // empty string into <input class="edit">
    document.querySelectorAll('.edit')[0].value = "";
    // press [Enter]
    document.dispatchEvent(new KeyboardEvent('keyup', {'key':'Enter'}));

    // confirm only 1 todo item now
    t.equal(document.querySelectorAll('.view').length, 1,
    "Todo count = 1.")

    t.end();
});


// 'CANCEL' case: user pressing [Escape] should cancel any 'editing'
test("5.5, 'CANCEL' case: user pressing [Escape] should cancel any 'editing", function(t){
    elmish.empty(document.getElementById(id));
    localStorage.removeItem('elmish_' + id);

    const model = {
        todos: [
          { id: 0, title: "Make something people want.", done: false },
          { id: 1, title: "Let's solve our own problem", done: false }
        ],
        hash: '#/', // the "route" to display
        editing: 1
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, app.update, app.view, id, app.subscriptions);
    
    // Attempt to edit by passing empty string
    document.querySelectorAll('.edit')[0].value = "Hello World";
    // press [Escape]
    document.dispatchEvent(new KeyboardEvent('keyup', {'key':'Escape'}));

    // check that 2 todo items still exisit
    t.equal(document.querySelectorAll('.view').length, 2 ,"Todo items remain the same.");
    console.log("Id:1 has title= " + model.todos[1].title);

    // check that original title remains
    t.equal(document.querySelectorAll('.view > label')[1].textContent, 
    model.todos[1].title, "Todo id:1 has title " + model.todos[1].title);
    t.end();
});

// Counter Test: Display current number of todo items
test.only("5.6 Counter Test: Display current number of todo items", function(t){
    elmish.empty(document.getElementById(id));
    localStorage.removeItem('elmish_' + id);

    const model = {
        todos: [
          { id: 0, title: "Make something people want.", done: false },
          { id: 1, title: "Let's solve our own problem", done: false }
        ],
        hash: '#/', // the "route" to display
        editing: 1
    };
    // render the view and append it to the DOM inside the `test-app` node:
    elmish.mount(model, app.update, app.view, id, app.subscriptions);

    // current number of todo items
    const count = parseInt(document.getElementById('count').textContent, 10);
    console.log("count = "  + count);
    t.end();
});