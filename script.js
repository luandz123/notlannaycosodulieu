// script.js

async function fetchData(url) {
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

fetchData('http://localhost:5000/tables').then(tableNames => {
    const tableDropdown = document.getElementById('tableDropdown');
    tableNames.forEach(tableName => {
        const option = document.createElement('option');
        option.text = tableName;
        tableDropdown.add(option);
    });
    updateTable();
});

function updateTable() {
    const tableName = document.getElementById('tableDropdown').value;
    fetchData(`http://localhost:5000/table/${tableName}`).then(data => {
        const dataTable = document.getElementById('dataTable');
        dataTable.innerHTML = '';

        const headerRow = dataTable.insertRow();
        for (const column in data[0]) {
            const headerCell = document.createElement('th');
            headerCell.textContent = column;
            headerRow.appendChild(headerCell);
        }

        data.forEach(row => {
            const dataRow = dataTable.insertRow();
            for (const column in row) {
                const dataCell = dataRow.insertCell();
                dataCell.textContent = row[column];
            }
            const actionsCell = dataRow.insertCell();
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.onclick = () => showEditForm(row, tableName);
            actionsCell.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = () => deleteRow(row[getPrimaryKeyColumnName(row, tableName)], tableName); // Sử dụng đúng tên cột khóa chính
            actionsCell.appendChild(deleteButton);
        });
    });
}

document.getElementById('tableDropdown').addEventListener('change', updateTable);

function addRow() {
    const tableName = document.getElementById('tableDropdown').value;
    const addForm = document.getElementById('addForm');
    const row = {};

    Array.from(addForm.querySelectorAll('input')).forEach(input => {
        row[input.name] = input.value;
    });

    fetch(`http://localhost:5000/table/${tableName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(row)
    }).then(() => {
        updateTable();
        addForm.style.display = 'none';
    });
}

function showAddForm() {
    const tableName = document.getElementById('tableDropdown').value;
    const addForm = document.getElementById('addForm');
    addForm.innerHTML = '';

    fetchData(`http://localhost:5000/table/${tableName}`).then(data => {
        const columns = Object.keys(data[0]);
        columns.forEach(column => {
            const input = document.createElement('input');
            input.name = column;
            input.placeholder = column;
            addForm.appendChild(input);
        });

        const submitButton = document.createElement('button');
        submitButton.textContent = 'Submit';
        submitButton.onclick = addRow;
        addForm.appendChild(submitButton);

        addForm.style.display = 'block';
    });
}

function showEditForm(row, tableName) {
    const editForm = document.getElementById('editForm');
    editForm.innerHTML = '';

    const columns = Object.keys(row);
    columns.forEach(column => {
        const input = document.createElement('input');
        input.name = column;
        input.placeholder = column;
        input.value = row[column];
        editForm.appendChild(input);
    });

    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit';
    submitButton.onclick = () => editRow(row[getPrimaryKeyColumnName(row, tableName)], tableName);
    editForm.appendChild(submitButton);

    editForm.style.display = 'block';
}

function editRow(id, tableName) {
    const editForm = document.getElementById('editForm');
    const updatedRow = {};

    Array.from(editForm.querySelectorAll('input')).forEach(input => {
        updatedRow[input.name] = input.value;
    });

    fetch(`http://localhost:5000/table/${tableName}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRow)
    }).then(() => {
        updateTable();
        editForm.style.display = 'none';
    });
}

function deleteRow(id, tableName) {
    fetch(`http://localhost:5000/table/${tableName}/${id}`, {
        method: 'DELETE'
    }).then(() => updateTable());
}

function getPrimaryKeyColumnName(row, tableName) {
    // Assuming the primary key column is the first column for simplicity
    return Object.keys(row)[0];
}

document.getElementById('addButton').addEventListener('click', showAddForm);
document.getElementById('editButton').addEventListener('click', function () {
    alert('Please use the Edit button next to each row to edit data.');
});
document.getElementById('deleteButton').addEventListener('click', function () {
    alert('Please use the Delete button next to each row to delete data.');
});
