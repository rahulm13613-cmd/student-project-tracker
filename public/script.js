const form = document.getElementById("project-form");
const nameInput = document.getElementById("name");
const statusInput = document.getElementById("status");
const projectList = document.getElementById("project-list");
const emptyState = document.getElementById("empty-state");
const saveButton = document.getElementById("save-button");
const cancelButton = document.getElementById("cancel-button");
const formTitle = document.getElementById("form-title");
const message = document.getElementById("message");

const STORAGE_KEY = "workshop-projects-v1";

let projects = [];
let editingId = null;
let storageAvailable = true;

function showMessage(text) {
  message.textContent = text;
}

function loadProjects() {
  let savedText;

  try {
    savedText = localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    storageAvailable = false;
    showMessage("Could not read saved projects from browser storage.");
    return;
  }

  if (savedText === null) {
    projects = [];
    return;
  }

  try {
    const savedProjects = JSON.parse(savedText);

    const validProjects =
      Array.isArray(savedProjects) &&
      savedProjects.every(
        (project) =>
          project !== null &&
          typeof project === "object" &&
          typeof project.id === "string" &&
          typeof project.name === "string" &&
          typeof project.status === "string"
      );

    if (!validProjects) {
      storageAvailable = false;
      showMessage(
        "Saved project data is invalid. Your saved data has not been overwritten."
      );
      projects = [];
      return;
    }

    projects = savedProjects;
  } catch (error) {
    storageAvailable = false;
    showMessage(
      "Saved project data could not be read. Your saved data has not been overwritten."
    );
    projects = [];
  }
}

function saveProjects() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(projects)
    );

    storageAvailable = true;
    showMessage("Changes saved in this browser.");
    return true;
  } catch (error) {
    showMessage(
      "Changes could not be saved in browser storage."
    );
    return false;
  }
}

function displayProjects() {
  projectList.replaceChildren();

  emptyState.hidden = projects.length > 0;

  projects.forEach((project) => {
    const item = document.createElement("li");
    const details = document.createElement("span");
    const editButton = document.createElement("button");
    const deleteButton = document.createElement("button");

    details.textContent = `${project.name} — ${project.status}`;

    // Edit button
    editButton.textContent = "Edit";
    editButton.type = "button";

    editButton.addEventListener("click", () => {
      editingId = project.id;

      nameInput.value = project.name;
      statusInput.value = project.status;

      saveButton.textContent = "Save changes";
      cancelButton.hidden = false;
      formTitle.textContent = "Edit a project";

      showMessage("Editing project. Your changes are not saved yet.");
      nameInput.focus();
    });

    // Delete button
    deleteButton.textContent = "Delete";
    deleteButton.type = "button";

    deleteButton.addEventListener("click", () => {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${project.name}"?`
      );

      if (!confirmed) {
        return;
      }

      const previousProjects = projects;

      projects = projects.filter(
        (item) => item.id !== project.id
      );

      if (!saveProjects()) {
        projects = previousProjects;
        displayProjects();
        return;
      }

      // If the deleted project is being edited, exit Edit mode.
      if (editingId === project.id) {
        resetForm();
      }

      displayProjects();
    });

    item.appendChild(details);
    item.appendChild(editButton);
    item.appendChild(deleteButton);

    projectList.appendChild(item);
  });
}

function resetForm() {
  form.reset();

  editingId = null;

  saveButton.textContent = "Add project";
  cancelButton.hidden = true;
  formTitle.textContent = "Add a project";
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const status = statusInput.value;

  if (!name) {
    nameInput.focus();
    return;
  }

  const previousProjects = projects.map((project) => ({
    ...project
  }));

  if (editingId !== null) {
    const project = projects.find(
      (item) => item.id === editingId
    );

    if (!project) {
      showMessage("This project could not be found.");
      resetForm();
      displayProjects();
      return;
    }

    project.name = name;
    project.status = status;
  } else {
    const project = {
      id: crypto.randomUUID(),
      name: name,
      status: status
    };

    projects.push(project);
  }

  if (!saveProjects()) {
    projects = previousProjects;
    displayProjects();
    return;
  }

  displayProjects();
  resetForm();
});

cancelButton.addEventListener("click", () => {
  resetForm();
  showMessage("Edit cancelled. Saved project data is unchanged.");
});

loadProjects();
displayProjects();