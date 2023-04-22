//I'm having trouble with my JQuery and MockAPI running like it should.
//I keep getting errors with I try to click my buttons and my buttons don't work like they should.
//I've tried multiple API's, even downloading JSON server.
//If the buttons worked like they should, you should be able to add a to-do list for every member in your family.
//From there, you should be able to add tasks and about how long it would take to complete each task to each member's list.
//You could delete tasks as they are completed and also add new tasks.
//Lists can also be deleted.
//Here is the link for my local JSON server API: https://localhost:5500/lists.
//Created a db.json file for my local server.

class List {
  constructor(name) {
    this.name = name;
    this.tasks = [];
  }

  addTask(name, duration) {
    this.tasks.push(new Task(name, duration));
  }
}

class Task {
  constructor(name, duration) {
    this.name = name;
    this.duration = duration;
  }
}

class EditLists {
  static url = "https://6442dd7b33997d3ef91b58e8.mockapi.io/CRUD-app/task"; //mockAPI link

  static getAllLists() {
    return $.get(this.url);
  }

  static getList(id) {
    return $.get(this.url + `/${id}`);
  }

  static createList(list) {
    return $.post(this.url, list);
  }

  static updateList(list) {
    return $.ajax({
      url: this.url + `/${list._id}`,
      dataType: "json",
      data: JSON.stringify(list),
      contentType: "application/json",
      type: "PUT",
      crossDomain: true,
    });
  }

  static deleteList(id) {
    return $.ajax({
      url: this.url + `/${id}`,
      type: "DELETE",
      crossDomain: true,
    });
  }
}

//section that makes adding, updating, and deleting lists possible in HTML.

class DOMManager {
  static lists;

  static getAllLists() {
    EditLists.getAllLists().then((lists) => this.render(lists));
  }

  static createList(name) {
    EditLists.createList(new List(name))
      .then(() => {
        return EditLists.getAllLists();
      })
      .then((lists) => this.render(lists));
  }

  static deleteList(id) {
    EditLists.deleteList(id)
      .then(() => {
        return EditLists.getAllLists();
      })
      .then((lists) => this.render(lists));
  }

  static addTask(id) {
    for (const list of this.lists) {
      if (list._id === id) {
        list.tasks.push(
          new Task(
            $(`#${list._id}-task-name`).val(),
            $(`#${list._id}-task-duration`).val()
          )
        );
        EditLists.updateList(list)
          .then(() => {
            return EditLists.getAllLists();
          })
          .then((lists) => this.render(lists));
      }
    }
  }

  //navigates through the DOM updating/deleting lists and tasks and adding tasks to individual lists. 

  static deleteTask(listId, taskId) {
    for (const list of this.lists) {
      if (list._id === listId) {
        for (const task of list.tasks) {
          if (task._id === taskId)
            list.tasks.splice(list.tasks.indexOf(task), 1);
          EditLists.updateList(list)
            .then(() => {
              return EditLists.getAllLists();
            })
            .then((lists) => this.render(lists));
        }
      }
    }
  }

  //allows you to delete a task in an individual list.

  static render(lists) {
    this.lists = lists;
    $("#app").empty();
    for (const list of lists) {
      $("#app").prepend(
        `<div id="${list._id}" class="card">
                      <div class="card-header">
                          <h2>${list.name}</h2>
                          <button class="btn btn-danger" onclick="DOMManager.deleteList('${list._id}')">Delete List</button>
                      </div>
                      <div class="card-body">
                          <div class="card">
                              <div class="row">
                                  <div class="col-sm">
                                      <input type="text" id="${list._id}-task-name" class="form-control" placeholder="Task Name">
                                  </div>
                                  <div class="col-sm">
                                      <input type="text" id="${list._id}-task-duration" class="form-control" placeholder="Task Duration"> 
                                  </div>
                              </div>
                              <button id="${list._id}-new-task" onclick="DOMManager.addTask('${list._id}')" class="btn btn-secondary form-control">Add New Task</button>
                          </div>
                      </div>
                  </div><br>` //text boxes in individual lists for adding tasks and duration.
      );
      for (const task of list.tasks) {
        $(`#${list._id}`)
          .find(".card-body")
          .append(
            `<p>
                           <span id="name-${task._id}"><strong>Task Name: </strong> ${task.name}</span>
                           <span id="duration-${task._id}"><strong>Task Duration: </strong> ${task.duration}</span>
                           <button class="btn btn-danger" onclick="DOMManager.deleteTask('${list._id}', '${task._id}')">Delete Task</button>`
          ); //delete task button in individual lists.
      }
    }
  }
}

$("#create-new-list").on("click", () => {
  DOMManager.createList($("#new-list-name").val());
  $("#new-list-name").val("");
});

DOMManager.getAllLists();

//called to run all code and should make the main add list button work.