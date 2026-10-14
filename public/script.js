const form = document.getElementById("project-form");
const nameInput = document.getElementById("name");
const statusInput = document.getElementById("status");
const projectList = document.getElementById("project-list");
const emptyState = document.getElementById("empty-state");
const saveButton = document.getElementById("save-button");
const cancelButton = document.getElementById("cancel-button");
const formTitle = document.getElementById("form-title");
const message = document.getElementById("message");

let projects = [];
let editingId = null;

function showMessage(text) {
  message.textContent = text;
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }

  return data;
}

async function loadProjects() {
  try {
    projects = await apiRequest("/api/projects");
    displayProjects();
    showMessage("Projects loaded from the database.");
  } catch (error) {
    showMessage("Could not load projects: " + error.message);
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

    editButton.textContent = "Edit";
    editButton.type = "button";

    editButton.addEventListener("click", () => {
      editingId = project.id;
      nameInput.value = project.name;
      statusInput.value = project.status;

      saveButton.textContent = "Save changes";
      cancelButton.hidden = false;
      formTitle.textContent = "Edit a project";

      showMessage("Editing project. Submit to save changes.");
      nameInput.focus();
    });

    deleteButton.textContent = "Delete";
    deleteButton.type = "button";

    deleteButton.addEventListener("click", async () => {
      if (!window.confirm(`Delete "${project.name}"?`)) {
        return;
      }

      try {
        await apiRequest(`/api/projects/${project.id}`, {
          method: "DELETE"
        });

        await loadProjects();
        showMessage("Project deleted successfully.");
      } catch (error) {
        showMessage("Could not delete project: " + error.message);
      }
    });

    item.append(details, editButton, deleteButton);
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

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const status = statusInput.value;

  if (!name) {
    nameInput.focus();
    return;
  }

  const project = { name, status };

  try {
    if (editingId !== null) {
      await apiRequest(`/api/projects/${editingId}`, {
        method: "PUT",
        body: JSON.stringify(project)
      });

      showMessage("Project updated successfully.");
    } else {
      await apiRequest("/api/projects", {
        method: "POST",
        body: JSON.stringify(project)
      });

      showMessage("Project added successfully.");
    }

    resetForm();
    await loadProjects();
  } catch (error) {
    showMessage("Could not save project: " + error.message);
  }
});

cancelButton.addEventListener("click", () => {
  resetForm();
  showMessage("Edit cancelled.");
});

loadProjects();