/**
 * init_model is a JavaScript Object with two keys and no methods.
 * it is used both as the "initial" model when mounting the Todo List App
 * and as the "reset" state when all todos are deleted at once.
 */

var init_model = {
    todos: [],     // Empty Array that gets filled
    hash: "#/",   // hash from url (for routing)
};


/**
 * `update` transforms the state of the `model` based on `action` passed/
 * @param {Object} model - app data which creates app 'state'
 * @param {String} action - desired action perfomed on model
 * @returns {Object} new_model - transformed model
 */
function update(model, action){     // think of update() method as "brain" of app
    /* Possible actions */
        // task finished
        // add new task
        // remove a task


    return new_model // transformed model based on action param
}








/* module.exports is needed to run the functions using Node.js for testing! */
/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      model: init_model,
    }
  }
  