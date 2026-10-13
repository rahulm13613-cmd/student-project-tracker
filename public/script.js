const form = document.getElementById("project-form");
const nameInput = document.getElementById("name");
const statusInput = document.getElementById("status");
const projectList = document.getElementById("project-list");
const emptyState = document.getElementById("empty-state");

let projects = [];

function displayProjects() {
  projectList.replaceChildren();

  emptyState.hidden = projects.length > 0;

  projects.forEach((project) => {
    const item = document.createElement("li");
    const details = document.createElement("span");

    details.textContent = `${project.name} — ${project.status}`;

    item.appendChild(details);
    projectList.appendChild(item);
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const status = statusInput.value;

  if (!name) {
    return;
  }

  const project = {
    id: crypto.randomUUID(),
    name: name,
    status: status
  };

  projects.push(project);

  displayProjects();

  form.reset();
});

displayProjects();