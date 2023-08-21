const inputBox = document.querySelector("#input-box");
const taskContainer = document.querySelector(".todo-list");
const filters = document.querySelectorAll('[name="filter"]');
const leftItem = document.querySelector(".footer-leftitem");
const rightItem = document.querySelector(".footer-rightitem");
const addForm = document.querySelector(".add-form");
const confirmModal = document.getElementById("confirmModal");
const confirmButton = document.querySelector(".confirm-button");
const cancelButton = document.querySelector(".cancel-button");

const LeftTask = () => {
  const itemLeft = document.querySelectorAll("li.task:not(.completed)").length;
  leftItem.innerText = itemLeft > 1 ? itemLeft + ' items left' : itemLeft + ' item left';
};

function clearCompleted() {
  const completedItems = [...taskContainer.querySelectorAll('.completed')];
  completedItems.forEach(element => {
    element.remove();
    fetch(`https://todorestapi-20432433159e.herokuapp.com/api/todos/delete/${element.id}/`, {
        method: 'DELETE'
    })
  });
}
rightItem.addEventListener('click', clearCompleted);

const addTask = (e) => {
  e.preventDefault();

  if (inputBox.value === "") {
    inputBox.classList.add("warn");
  }

  fetch('https://todorestapi-20432433159e.herokuapp.com/api/todos/create/', {
      method: 'POST',
      body: JSON.stringify({
          title: inputBox.value,
          completed: false,
          actor: 1,
          assignee: 1
      }),
      headers: {
          'Content-type': 'application/json;'
      }
  })

  window.location.reload(false)
  addForm.reset();
  taskContainer.insertAdjacentHTML("beforeend", taskHTML);
  inputBox.classList.remove("warn");
  

  if([...taskContainer.children].length >= 3){
    taskContainer.id = "scroll";
  } else {
    taskContainer.id = "";
  }

  AddEventListenerDrag();
};
addForm.addEventListener('submit', addTask);

taskContainer.addEventListener("dblclick", (e) => {
  if (e.target.tagName === "LI") {
    enableEdit(e.target);
  }
});

const enableEdit = (todoItem) => {
  const todoText = todoItem.firstChild;
  const input = document.createElement("input");
  input.value = todoText.textContent.trim();

  todoItem.replaceChild(input, todoText);
  input.focus();

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      if (input.value.trim() !== "") {
        todoText.textContent = input.value;
      }
      todoItem.replaceChild(todoText, input);
      saveData();
    }
  });
};

taskContainer.addEventListener("click", (tikla) => {
  let myComplete;
  if (tikla.target.tagName === "LI") {
    tikla.target.classList.toggle("completed");
    console.log(tikla.target.className);
    if(tikla.target.className === "task completed"){myComplete = true} else {myComplete = false}
    console.log(myComplete);
    console.log(tikla.target.id);
    fetch(`https://todorestapi-20432433159e.herokuapp.com/api/todos/update/${tikla.target.id}/`, {
        method: 'PUT',
        body: JSON.stringify({
          title: tikla.target.firstChild.textContent,
          completed: myComplete,
          actor: 1,
          assignee: 1
        }),
        headers: {
            'Content-type': 'application/json;'
        }
    })
    systemFunction();
  } else if (tikla.target.classList.contains("sil")) {
    confirmModal.style.display = "flex";

    confirmButton.addEventListener("click", () => {
      confirmModal.style.display = "none";
      const parentElement = tikla.target.parentElement;
      parentElement.classList = "deletedtask";
      tikla.target.parentElement.firstChild.textContent = "Deleted Task";
      console.log(parentElement);
      fetch(`https://todorestapi-20432433159e.herokuapp.com/api/todos/delete/${parentElement.id}/`, {
        method: 'DELETE'
      })
      setTimeout(function() {
        if([...taskContainer.children].length <= 3){
          taskContainer.id = "";
        }
        parentElement.remove();
        systemFunction();
      }, 650);
    });

    cancelButton.addEventListener("click", () => {
      confirmModal.style.display = "none";
    });
  }
});

const addFetchTask = async  () => {
  let taskHTML;
  let taskClass= "task"
  await fetch("https://todorestapi-20432433159e.herokuapp.com/api/todos/")
      .then(response => response.json())
      .then(data => {
        data.forEach(x => {
          if(x.completed === true){taskClass = "task completed"} else {taskClass = "task"}
          taskHTML = `<li class="${taskClass}" draggable="true" id="${x.id}"><h1>${x.title}</h1>
              <div class="created"><h5>Oluşturulma Zamanı: ${x.created_at}</h5></div>
              <div class="updated"><h5>Güncellenme Zamanı: ${x.updated_at}</h5></div>
              <span class="sil">×</span>
            </li>`
          taskContainer.insertAdjacentHTML("beforeend", taskHTML);
        })
      })
  
  
  systemFunction();

  if([...taskContainer.children].length >= 3){
    taskContainer.id = "scroll";
  } else {
    taskContainer.id = "";
  }

};

const saveData = () => {
  localStorage.setItem("data", taskContainer.innerHTML);
};

const loadData = (e) => {
  addFetchTask();
  if([...taskContainer.children].length <= 3){
    taskContainer.id = "";
  } else {
    taskContainer.id = "scroll";
  }
  AddEventListenerDrag();
  systemFunction();
};

for (const filter of document.querySelectorAll('[name="filter"]')) {
  filter.addEventListener("click", function () {
    taskContainer.classList.value = `todo-list ${this.value}`;
  });
}

loadData();

let dragStartIndex;

function AddEventListenerDrag (){
  const draggable = taskContainer.querySelectorAll("li.task");

  draggable.forEach(e => {
    e.addEventListener("dragstart", dragStart);
    e.addEventListener("dragleave", dragLeave);
    e.addEventListener("dragover", dragOver);
    e.addEventListener("drop", dragDrop);
    e.addEventListener("dragenter", dragEnter);
  });
}

const liElements = [...taskContainer.querySelectorAll("li.task")];
function dragStart(event) {
  dragStartIndex = liElements.indexOf(event.target);
}

function dragOver(e){
  e.preventDefault();
  this.id = "over";
}

function dragDrop(event){
  event.preventDefault();
  const dragEndIndex = liElements.indexOf(event.target);
  swapItems(dragStartIndex, dragEndIndex);
  event.target.id = "";
}

function swapItems(fromIndex, toIndex){
  const items = Array.from(taskContainer.querySelectorAll("li.task"));
  const itemOne = items[fromIndex];
  const itemTwo = items[toIndex];

  taskContainer.removeChild(itemOne);
  taskContainer.removeChild(itemTwo);

  if (toIndex > fromIndex) {
    taskContainer.insertBefore(itemTwo, items[fromIndex]);
    taskContainer.insertBefore(itemOne, items[toIndex]);
  } else {
    taskContainer.insertBefore(itemOne, items[toIndex]);
    taskContainer.insertBefore(itemTwo, items[fromIndex]);
  }
}

function dragEnter(){
  this.id = "over";
}

function dragLeave() {
  this.id = "";
}

function systemFunction() {
  saveData();
  LeftTask();
}

