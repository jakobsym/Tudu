/* if require is available, it means we are in Node.js Land i.e. testing! */
/* istanbul ignore next */
if (typeof require !== 'undefined' && this.window !== this) {
    var { a, button, div, empty, footer, input, h1, header, label, li, mount,
      route, section, span, strong, text, ul } = require('./elmish.js');
}

/**
 * init_model is a JavaScript Object with two keys and no methods.
 * it is used both as the "initial" model when mounting the Todo List App
 * and as the "reset" state when all todos are deleted at once.
 */
var init_model = {
    todos: [
            ],     
    hash: "#/",   // hash from url (for routing)
    //editing:
};

/**
 * `update` transforms the state of the `model` based on `action` passed
 * @param {Object} model - app data which creates app 'state'
 * @param {String} action - desired action perfomed on model
 * @param {String} data - data we want to "apply" to the item. e.g: item Title.
 * @returns {Object} new_model - transformed model
 */
function update(action, model , data){     // think of update() method as "brain" of app
    var new_model = JSON.parse(JSON.stringify(model));    // make copy of model
    switch(action){
        case 'ADD':
            var last = (typeof model.todos !== 'undefined' && model.todos.length > 0) // get last todo item if it exists
             ? model.todos[model.todos.length - 1] : null;

            var id = last ? last.id + 1 : 1;
            var input = document.getElementById('new-todo');

            new_model.todos = (new_model.todos && new_model.todos.length > 0)
             ? new_model.todos : [];
            
            new_model.todos.push({
                id: id,
                title: data || input.value.trim(),
                done: false
            });
            break;
        case 'TOGGLE':  // named `TOGGLE` so user can mark task as done=true, then if req. change to done=false
            new_model.todos.forEach(function (item) { 
                /*
                if current item === passed in data, then we revert items truth value
                */
                if(item.id === data) {    // this should only "match" one item.     
                item.done = !item.done;  // invert state of "done" e.g false >> true
                }
            });
            // get all done=false(tasks not done yet) and create array of them
            var all_done = new_model.todos.filter(function(item){
                return item.done === false;
            }).length;  // return length of array to rep. count of todo items not done yet

            /* if all_done = 0 (all items compeleted), thus mark all as true
            else mark all as false (all items NOT completed) */
            new_model.all_done = all_done === 0 ? true : false;
            break;
        case 'TOGGLE_ALL':
            // assign done value of all todos
            new_model.all_done = new_model.all_done ? false : true;
            // iterate through e/a todo item marking as true if all done, false otherwise
            new_model.todos.forEach(function (element){
                element.done = new_model.all_done;
            })
            break;
        case 'DELETE':
          new_model.todos.forEach(function (item){
            if(item.id === data){
              new_model.todos.splice(item, 1);
            }
          })
          break;

        case 'EDIT':
          if (new_model.clicked && new_model.clicked == data &&
            Date.now() - 300 < new_model.click_time ){

              new_model.editing = data;

              console.log('DOUBLE-CLICK', "item.id=", data,
                "| model.editing=", model.editing,
                "| diff Date.now() - new_model.click_time: ",
                Date.now(), "-", new_model.click_time, "=",
                Date.now() - new_model.click_time);
            }
          else{ // one click
            new_model.clicked = data; // check if same item was clicked twice
            new_model.click_time = Date.now() // timer to detect double-click
            new_model.editing = false;  // reset
          }
          break;
        case 'SAVE':
          var edit = document.getElementsByClassName('edit')[0];
          var value = edit.value;
          var id = parseInt(edit.id, 10); // 10 as we want decimal numbers

          // finish Editing
          new_model.clicked = false;
          new_model.editing = false;

          if(!value || value.length === 0){ // if title blank, delete item
            return update('DELETE', new_model, id);
          }
          // update value of item.title which has been edited
          new_model.todos = new_model.todos.map(function(item){
            if(item.id === id && value && value.length > 0){
              item.title = value.trim();
            }
            return item;
          });
          break;
        default: 
            return model;
    }
  return new_model;                      
}

/**
 * `render_item` creates a DOM "tree" w/ single Todo List Item
 * using the "elmish" DOM functions (`li`, `div`, `input`, `label` and `button`)
 * returns a `<li>` HTML element w/ a nested `<div>` which in turn has the:
 *  `<input type=checkbox>` which lets users to "Toggle" the status of the item
 *  `<label>` which displays the Todo item text (`title`) in a `<text>` node
 *  `<button class="destroy">` lets people "delete" a todo item.
 * @param {Object} item the todo item object
 * @param {Object} model - app data which creates app 'state'
 * @param {Function} signal - 'Dispatcher' which runs 'update' and 'render' functions
 * @return {Object} <li> DOM Tree nested in the <ul>
 * @example
 * // returns <li> DOM element w/ <div>, <input> and <button> nested
 * var DOM = render_item({id: 1, title: "Build Todo List App", done:false});
 */
function render_item(item, model, signal){
    return(
        li([
            "data-id=" + item.id,
            "id=" + item.id,
            item.done ? "class=completed" : "",
            model && model.editing && model.editing === item.id ? "class=editing" : ""
        ], [
            div(["class=view"], [
                input([
                    (item.done ? "checked=true" : ""),
                    "class=toggle", 
                    "type=checkbox",
                    typeof signal === 'function' ? signal('TOGGLE', item.id) : ''
                    ], []),  
                label([typeof signal === 'function' ? signal('EDIT', item.id) : ''], 
                  [text(item.title)]),
                button(["class=destroy", typeof signal === 'function' ? signal('DELETE', item.id) : ''])  // if user clicks button, send a 'DELETE' signal
              ]
            ),  // </div>
        ].concat(model && model.editing && model.editing == item.id ? [
            input(["class=edit", "id=" + item.id, "value=" + item.title, "autofocus"])
        ]  : [])
        )     // </li>
    )
}

/**
 * `render_main` renders the `<section class="main">` of the Todo List App
 * which contains all the "main" controls and the `<ul>` with the todo items.
 * @param {Object} model - the App's (current) model (or "state").
 * @param {Function} signal - 'Dispatcher' which runs 'update' and 'render' functions
 * @return {Object} <section> DOM Tree which containing the todo list <ul>, etc.
 */
function render_main (model, signal) {
    // Requirement #1 - No Todos, should hide #footer and #main
    var display = "style=display:"
      + (model.todos && model.todos.length > 0 ? "block" : "none");
  
    return (
      section(["class=main", "id=main", display], [ // hide if no todo items.
        input(["id=toggle-all", "type=checkbox",
        // if signal is an option in update function, then assign signal to be TOGGLE_ALL
          typeof signal === 'function' ? signal('TOGGLE_ALL') : '',
          (model.all_done ? "checked=checked" : ""),
          "class=toggle-all"
        ], []),
        label(["for=toggle-all"], [ text("Mark all as complete") ]),
        ul(["class=todo-list"],
          (model.todos && model.todos.length > 0) ?
          model.todos
          .filter(function (item) {
            switch(model.hash) {
              case '#/active':
                return !item.done;
              case '#/completed':
                return item.done;
              default: // if hash doesn't match Active/Completed render ALL todos:
                return item;
            }
          })
          .map(function (item) {
            return render_item(item, model, signal)
          }) : null
        ) // </ul>
      ]) // </section>
    )
}

/**
 * `render_footer` renders the `<footer class="footer">` of the Todo List App
 * which contains count of items to (still) to be done and a `<ul>` "menu"
 * with links to filter which todo items appear in the list view.
 * @param {Object} model - the App's (current) model (or "state").
 * @return {Object} <section> DOM Tree which containing the <footer> element.
 * @example
 * // returns <footer> DOM element with other DOM elements nested:
 * var DOM = render_footer(model);
 */
function render_footer (model, signal) {
    // count how many "active" (not yet done) items by filtering done === false:

    /* If model.todos exists and len > 0 then we filter all items marked as done
    and get that count assigned to `done`. Else set == 0 */
    var done = (model.todos && model.todos.length > 0) ?
      model.todos.filter( function (i) { return i.done; }).length : 0;
      
    var count = (model.todos && model.todos.length > 0) ?
      model.todos.filter( function (i) { return !i.done; }).length : 0;
    
    var done = (model.todos && model.todos.length > 0) ?
     (model.todos.length - count) : 0;
  
    // No Todos, should hide #footer and #main
    var display = (count > 0 || done > 0) ? "block" : "none";

    var display_clear =  (done > 0) ? "block;" : "none;";

    // pluarisation of number of items:
    var left = (" item" + ( count > 1 || count === 0 ? 's' : '') + " left");
  
    return (
        footer(["class=footer", "id=footer", "style=display:" + display], [
            span(["class=todo-count", "id=count"], [
                strong(count),
                text(left)
            ]),
            ul(["class=filters"], [
                li([], [
                    a([
                        "href=#/", "id=all", "class=" +
                        (model.hash === '#/' ? "selected" : '')
                    ],
                    [text("All")])
                ]),
                li([], [
                    a([
                        "href=#/active", "id=active", "class=" +
                        (model.hash === "#/active" ? "selected": '')
                    ],
                    [text("Active")])
                ]),
                li([], [
                    a([
                        "href=#/completed", "id=completed", "class=" + 
                        (model.hash === "#/completed" ? "selected" : '')
                    ],
                    [text("Completed")])
                ])
            ]), // </ul>
            button(["class=clear-completed", "style=display:" + display_clear,
              typeof signal === 'function' ? signal('CLEAR_COMPLETED') : ''
                ],
                [
                text("Clear completed ["),
                span(["id=completed-count"], [
                    text(done)
                ]),
                text("]")
                ]
            )
        ])
    )
}
/**
 * `view` utilizes `render_item`, `render_footer`, and `render_main` functions to build
 * the overall GUI of the application
 * @param {Object} model - the App's (current) model (or "state").
 * @param {Function} signal - 'Dispatcher' which runs 'update' and 'render' functions
 * @return {Object} <section> DOM tree containing all other DOM elements
 * @example
 * // returns <section class="todo-app"> DOM element with other DOM els nested:
 * var DOM = view(model);
 */
function view(model, signal){
    return(
        section(["class=todoapp"], [
            header(["class=header"],[
                h1([], [
                    text("Tudus")
                ]),
                input(["id=new-todo", "class=new-todo" ,"placeholder=What needs to be done?", "autofocus"],
                []),
            ]),  // </header>

            render_main(model, signal),
            render_footer(model, signal),
        ])  // </section>
    )
}
/**
 * `subscriptions` function utilizies EventListeners to allow for users to 
 * edit/enter todo list items based on key presses.
 * Based on key pressed by user, function will 'signal' what action needs to be
 * passed to the 'update' function.
 * @param {Function} signal - 'Dispatcher' which runs 'update' and 'render' functions
 */
function subscriptions (signal) {
	var ENTER_KEY = 'Enter'; // add a new todo item when [Enter] key is pressed
	var ESCAPE_KEY = 'Escape'; // used for "escaping" when editing a Todo item

  document.addEventListener('keyup', function handler (e) {
    //console.log('key:', e.key);
    switch(e.key) {
      case ENTER_KEY:
        // If user wishes to edit a Todotask
        var editing = document.getElementsByClassName('editing');
        if (editing && editing.length > 0) {
          signal('SAVE')(); // invoke signal inner callback
        }

        var new_todo = document.getElementById('new-todo');
        
        if(new_todo.value.length > 0) {
          signal('ADD')(); // invoke signal inner callback
          new_todo.value = ''; // reset <input> so we can add another todo
          document.getElementById('new-todo').focus();
        }
        break;
      case ESCAPE_KEY:
        signal('SAVE')(); // previously signal('CANCEL')();
        break;
    }
  });

  window.onhashchange = function route () {
    signal('ROUTE')();
  }
}
/* module.exports is needed to run the functions using Node.js for testing! */
/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      model: init_model,
      update: update,
      render_item: render_item,
      render_main: render_main,
      render_footer: render_footer,
      subscriptions: subscriptions,
      view: view,
    }
  }
  