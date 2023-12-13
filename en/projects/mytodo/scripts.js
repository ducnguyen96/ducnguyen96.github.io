const mainInput = document.querySelector("#input");
const center = document.querySelector("#center");
const countActive = document.querySelector("#count-active");
const filterAll = document.querySelector("#filter-all");
const filterActive = document.querySelector("#filter-active");
const filterCompleted = document.querySelector("#filter-completed");
const clearCompletedButton = document.querySelector("#clear-completed");

/**
 * @typedef TODO
 * @property {string} id
 * @property {string} content
 * @property {'active'|'completed'} status
 */

/** @type {TODO[]} */
let todos = JSON.parse(localStorage.getItem("todos")) || [];

/** @type {'active'|'completed'|'all'} */
let filter = "all";

/**
 * - receive content from input
 * - add new one to todos
 * - update ui
 * @param {string} content
 */
function add(content) {
	const id = new Date().getTime().toString();
	todos.push({ id, content, status: "active" });

	updateUI();
}

/**
 * - update status of todos
 * - update ui
 * @param {string} id
 */
function update(id) {
	const todo = todos.find((todo) => todo.id === id);
	todo.status = todo.status === "active" ? "completed" : "active";

	updateUI();
}

/**
 * - update filter
 * - update ui
 * @param {'all'|'active'|'completed'} newFilter
 */
function changeFilter(newFilter) {
	filter = newFilter;
	updateUI();
}

/**
 * - update todos
 * - update ui
 */
function clearCompleted() {
	todos = todos.filter(({ status }) => status === "active");
	updateUI();
}

/**
 * @param {TODO} todo
 */
function buildElement(todo) {
	const { id, content, status } = todo;

	const div = document.createElement("div");
	div.className = "todo";

	const checkbox = document.createElement("input");
	checkbox.setAttribute("type", "checkbox");
	checkbox.id = id;
	checkbox.checked = status === "active" ? false : true;

	const label = document.createElement("label");
	label.className = status;
	label.innerText = content;
	label.setAttribute("for", id);

	div.append(checkbox);
	div.append(label);

	return { div, checkbox };
}

function updateStorage() {
	localStorage.setItem("todos", JSON.stringify(todos));
}

/**
 * - re-render todos
 * - re-render todo count
 */
function updateUI() {
	// re-render todos;
	let filteredTodos;
	switch (filter) {
		case "active":
			filteredTodos = todos.filter((todo) => todo.status === "active");
			break;
		case "completed":
			filteredTodos = todos.filter((todo) => todo.status === "completed");
			break;
		default:
			filteredTodos = todos;
	}

	center.textContent = "";

	filteredTodos.forEach((todo) => {
		// build HTML element
		const { div, checkbox } = buildElement(todo);
		checkbox.addEventListener("click", () => update(todo.id));

		// append element to center
		center.appendChild(div);
	});

	// re-render count active
	const actives = todos.filter(({ status }) => status === "active").length;
	countActive.innerText = `${actives} ${actives > 1 ? "items" : "item"} left`;

	updateStorage();
}

mainInput.addEventListener("keypress", (e) => {
	if (e.key === "Enter") {
		add(mainInput.value);
		mainInput.value = "";
	}
});

filterAll.addEventListener("click", () => {
	changeFilter("all");
	filterAll.className = "selected";
	filterActive.className = "";
	filterCompleted.className = "";
});

filterActive.addEventListener("click", () => {
	changeFilter("active");
	filterAll.className = "";
	filterActive.className = "selected";
	filterCompleted.className = "";
});

filterCompleted.addEventListener("click", () => {
	changeFilter("completed");
	filterAll.className = "";
	filterActive.className = "";
	filterCompleted.className = "selected";
});

clearCompletedButton.addEventListener("click", () => {
	clearCompleted();
});

updateUI();
