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








/* module.exports is needed to run the functions using Node.js for testing! */
/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      model: init_model,
      update: update,
    }
  }
  