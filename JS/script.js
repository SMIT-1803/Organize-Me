let checkBoxContainer = document.getElementById('checkBoxContainer');
let tasksContainer = document.getElementById('tasksContainer');

let courses = [];
let apiKey = window.localStorage.getItem("theAPI");
const canvasUrlInput = "canvas.sfu.ca";

function loadAssignments(selectedCourseIds) {
    let coursesToLoad = [];
    if (selectedCourseIds === "all" || (Array.isArray(selectedCourseIds) && selectedCourseIds.length === 0)) {
        coursesToLoad = courses;
    } else {
        coursesToLoad = courses.filter(course => selectedCourseIds.includes(String(course.id)));
    }

    if (coursesToLoad.length === 0) {
        return;
    }

    coursesToLoad.forEach(course => {
        fetch(`https://${canvasUrlInput}/api/v1/courses/${course.id}/assignments?access_token=${apiKey}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch assignments for ${course.name}`);
                }
                return response.json();
            })
            .then(assignments => {
                let hasUpcoming = false;
                assignments.forEach(assignment => {
                    if (!assignment.due_at) return;
                    const dueDate = new Date(assignment.due_at);
                    if (dueDate < new Date()) return;

                    hasUpcoming = true;
                    const taskBox = document.createElement('div');
                    taskBox.className = 'aTask';
                    const nameElem = document.createElement('p');
                    nameElem.className = 'task-name';
                    nameElem.textContent = assignment.name;
                    const dueElem = document.createElement('p');
                    dueElem.className = 'task-due';
                    const dueDateText = new Date(assignment.due_at).toLocaleString();
                    dueElem.textContent = `Due: ${dueDateText}`;
                    taskBox.appendChild(nameElem);
                    taskBox.appendChild(dueElem);
                    tasksContainer.appendChild(taskBox);
                });
                if (!hasUpcoming) {
                    const taskBox = document.createElement('div');
                    taskBox.className = 'aTask no-assignments';
                    taskBox.textContent = `No upcoming assignments for course: ${course.name}`;
                    tasksContainer.appendChild(taskBox);
                }
            })
            .catch(error => {
                console.error(error);
                const taskBox = document.createElement('div');
                taskBox.className = 'aTask error-task';
                taskBox.textContent = `Error: ${error.message}`;
                tasksContainer.appendChild(taskBox);
            });
    });
}

fetch(`https://${canvasUrlInput}/api/v1/courses?access_token=${apiKey}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch courses');
        }
        return response.json();
    })
    .then(fetchedCourses => {
        // Filter courses to only include those with valid names
        courses = fetchedCourses.filter(course => course.name && course.name.trim() !== "");
        checkBoxContainer.innerHTML = ''; // Clear existing checkboxes

        // Add "All Subjects" checkbox
        const allDiv = document.createElement('div');
        allDiv.className = "checkbox-item";
        const allCheckbox = document.createElement('input');
        allCheckbox.type = "checkbox";
        allCheckbox.id = "all";
        allCheckbox.name = "course";
        allCheckbox.value = "all";
        allCheckbox.checked = true;
        allDiv.appendChild(allCheckbox);
        const allLabel = document.createElement('label');
        allLabel.htmlFor = "all";
        allLabel.textContent = "All Subjects";
        allDiv.appendChild(allLabel);
        checkBoxContainer.appendChild(allDiv);

        // Add course checkboxes for valid courses
        courses.forEach(course => {
            const div = document.createElement('div');
            div.className = "checkbox-item";
            const checkbox = document.createElement('input');
            checkbox.type = "checkbox";
            checkbox.id = "course-" + course.id;
            checkbox.name = "course";
            checkbox.value = course.id;
            div.appendChild(checkbox);
            const label = document.createElement('label');
            label.htmlFor = "course-" + course.id;
            label.textContent = course.name;
            div.appendChild(label);
            checkBoxContainer.appendChild(div);
        });

        // Update assignments initially
        updateAssignments();

        // Add event listeners to checkboxes
        const allCheckboxes = document.querySelectorAll('input[name="course"]');
        allCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                if (this.value === "all" && this.checked) {
                    // If "All Subjects" is checked, uncheck all others
                    allCheckboxes.forEach(cb => {
                        if (cb.value !== "all") cb.checked = false;
                    });
                } else if (this.value !== "all" && this.checked) {
                    document.getElementById('all').checked = false;
                } else if (!document.querySelector('input[name="course"]:checked')) {
                    document.getElementById('all').checked = true;
                }
                updateAssignments();
            });
        });
    })
    .catch(error => {
        console.error(error);
        const errorBox = document.createElement('div');
        errorBox.className = 'error';
        errorBox.textContent = 'Error: Unable to fetch courses. Please check your API key.';
        checkBoxContainer.appendChild(errorBox);
    });

function updateAssignments() {
    tasksContainer.innerHTML = ''; // Clear existing task boxes
    const checkedBoxes = document.querySelectorAll('input[name="course"]:checked');
    const selectedValues = Array.from(checkedBoxes).map(cb => cb.value);
    if (selectedValues.includes("all") || selectedValues.length === 0) {
        loadAssignments("all");
    } else {
        loadAssignments(selectedValues);
    }
}