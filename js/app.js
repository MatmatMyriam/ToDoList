window.TaskManager = (() => {
  let module = {};
  module.Task = class Task {
    constructor(name = 'untitled', duration = 0, tags = null) {
      this.name = name;
      this.duration = duration;
      this.tags = tags;
    }

    display_item() {
      let properties = $('<ul>');
      properties.append(this.display_duration());
      properties.append(this.display_tags());
      return $('<li>')
             .addClass('card').addClass('task')
             .append(this.display_name())
             .append(properties);
    }

    display_name() {
      return $('<span>')
             .addClass('card-header')
             .text(this.name);
    }

    display_duration() {
      let item = $('<li>').addClass('duration').text(this.duration);
      if (this.duration <= 10) {
        item.addClass('short');
      } else if (this.duration >= 20) {
        item.addClass('long');
      }
      return item;
    }

    display_tags() {
      let container = $('<li>').addClass('tags').text(this.tags);
      let field = $('<input>').prop('type', 'text');
      let button = $('<input>').prop('type', 'submit');
      let editor = $('<form>').append(field).append(button);

      let task = this;

      let in_edit = false;

      container.click((event) => {

        event.stopPropagation();
        event.preventDefault();

        let target = $(event.target);

        if (target.is('li') && !in_edit) {
          container.empty();
          container.append(editor);
          in_edit = true;
        }

        if (target.is('input') && target.prop('type') === 'submit') {
          task.tags = field.val();

            if(!(navigator.onLine)){
                localStorage.setItem('Tasks',JSON.stringify(TaskManager.tasks));
            }else{
                $.post("/server/public/products", {"nom":task.name,"val": task.duration, "tag":task.tags});
            }

          container.empty();
          container.text(task.tags);
          in_edit = false;
        }

      });

      return container;

    }

    save () {
        let buttonSave = $('<input>').prop('type', 'submit').addClass('buttonSave');
    
    }
  }

  module.tasks = [];

  module.display_tasks = (div_id) => {
    let container = $('<ul>').prop('id', 'tasks');
    $(div_id).append(container);


    for (let task of module.tasks) {
      $(container).append(task.display_item());

    }

    TaskManager.addButton('#addTasks');
  }
  module.addButton = (div_id) => {
    let button =$('<button>').prop('id','addTasks').addClass("btn btn-large btn-success");
    button.text('Add Tasks');
    $(div_id).append(button);

    let fieldName = $('<input>').prop('type', 'text').prop("placeholder","Votre nom").addClass("form-control").addClass("field");
    let fieldDuration = $('<input>').prop('min',"1").prop('type', 'number').prop("placeholder","Le temps que vous estimé").addClass("field").addClass("form-control");
    let fieldTag = $('<input>').prop('type',"text").prop("placeholder","Votre tag").addClass("form-control").addClass("field");
    let addButton = $('<input>').prop('type', 'submit').addClass("btn btn-large btn-success");
    let editor = $('<form>').append(fieldName).append(fieldDuration).append(fieldTag).append(addButton);

    button.click((event) => {
      event.stopPropagation();
      event.preventDefault();
    $(div_id).append(editor);
    });

    addButton.click((event)=> {
      event.stopPropagation();
      event.preventDefault();
      TaskManager.tasks.push(new TaskManager.Task(fieldName.val(), fieldDuration.val(),fieldTag.val()));
      if(!(navigator.onLine)){
          localStorage.setItem('Tasks',JSON.stringify(TaskManager.tasks));
      }else{
          $.post("/server/public/products", {"nom":fieldName.val(),"val": fieldDuration.val(), "tag":fieldTag.val()});
      }
      $(div_id).empty();
      $('#taskmanager').empty();
      TaskManager.display_tasks('#taskmanager');
    });
}

module.listenOnline = () => {
    /** Pour se rendre compte que la verif offline varie toujours*/
    window.addEventListener('online', function () {
        //Vider tout task manager
        alert('Vous venez de vous reconnecter à internet. La synchronisation va débuter')
        $.post("/server/public/synchro", {"tasks":JSON.parse(localStorage.getItem("Tasks"))});
        //dans synchro => vider le json et remettre tout le local storage


    });


}

  return module;
})();


$(() => {

   $.get("/server/public/products").done(function (data) {

     $.each(data, (i, data) => {
         let OneTask = new TaskManager.Task(data.nom, data.prix, data.description);
         TaskManager.tasks.push(OneTask);
     });
         TaskManager.display_tasks('#taskmanager');


});
TaskManager.listenOnline();
});
