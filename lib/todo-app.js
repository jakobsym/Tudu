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
};

/**
 * `update` transforms the state of the `model` based on `action` passed
 * @param {Object} model - app data which creates app 'state'
 * @param {String} action - desired action perfomed on model
 * @param {String} data - data we want to "apply" to the item. e.g: item Title.
 * @returns {Object} new_model - transformed model
 */
function update(model, action, data){     // think of update() method as "brain" of app
    
        var new_model = JSON.parse(JSON.stringify(model));    // make copy of model
        switch(action){
            case "ADD":     
                new_model.todos.push({
                    id: model.todos.length + 1, // increase size of model.todos by 1
                    title: data,                // assign data passed to title key
                    done: false,                // task isnt complete upon adding to list
                });
                break;
            case "TOGGLE":  // named `TOGGLE` so user can mark task as done=true, then if req. change to done=false
                new_model.todos.forEach(function (item) { 
                    /*
                    if current item === passed in data, then we revert items truth value
                    */
                    //console.log(item);
                    if(item.id === data) {    // this should only "match" one item.     
                    item.done = !item.done;  // invert state of "done" e.g false >> true
                    }
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
 * @return {Object} <li> DOM Tree nested in the <ul>
 * @example
 * // returns <li> DOM element w/ <div>, <input> and <button> nested
 * var DOM = render_item({id: 1, title: "Build Todo List App", done:false});
 */
function render_item(item){
    return(
        li([
            "data-id=" + item.id,
            "id=" + item.id,
            item.done ? "class=completed" : ""
        ], [
            div(["class=view"], [
                input(["class=toggle", "type=checkbox",
                (item.done ? "checked=true" : "")], []),  
                label([], [text(item.title)]),
                button(["class=destroy"])
            ])  // </div>
        ])     // </li>
    )
}

/**
 * `render_main` renders the `<section class="main">` of the Todo List App
 * which contains all the "main" controls and the `<ul>` with the todo items.
 * @param {Object} model - the App's (current) model (or "state").
 * @param {Function} singal - the Elm Architicture "dispacher" which will run
 * @return {Object} <section> DOM Tree which containing the todo list <ul>, etc.
 */
function render_main (model) {
    // Requirement #1 - No Todos, should hide #footer and #main
    var display = "style=display:"
      + (model.todos && model.todos.length > 0 ? "block" : "none");
  
    return (
      section(["class=main", "id=main", display], [ // hide if no todo items.
        input(["id=toggle-all", "type=checkbox",
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
            return render_item(item)
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
  // TODO: create render_footer function
function render_footer(model){
    // No todo-items, hide footer
    var display = "style=display:" + (model.todos && model.todos.length > 0 ? "block" : "none");

    return (
        footer(["class=footer", display], [
            span(["class=todo-count"],[
                strong(model.todos.length)," items left"
            ]),
            ul(["class=filters"], [
                li([
                    a(["href=#/"], "class=selected" ,"All")
                ]),
                li([
                    a(["href=#/active"], "Active")
                ]),
                li([
                    a(["href=#/completed"], "Completed")
                ])
            ]), // </ul>
            button(["class=clear-completed", display], 
            " Clear completed")
        ])     // </footer>
    )
}






/* module.exports is needed to run the functions using Node.js for testing! */
/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      model: init_model,
      update: update,
      render_item: render_item,
      render_main: render_main,
    }
  }
  