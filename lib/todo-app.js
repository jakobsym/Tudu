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








/* module.exports is needed to run the functions using Node.js for testing! */
/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      model: init_model,
      update: update,
      render_item: render_item,
    }
  }
  