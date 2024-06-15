function calculateBudget() {
  const netIncome = document.getElementById("netIncome").value;
  const categories = [
    { id: "charity", percent: 5 },
    { id: "family", percent: 5 },
    { id: "utilities", percent: 17 },
    { id: "commute", percent: 7 },
    { id: "investments", percent: 20 },
    { id: "savings", percent: 20 },
    { id: "personal", percent: 26 },
  ];

  categories.forEach((category) => {
    const allocatedAmount = (netIncome * category.percent) / 100;
    document.getElementById(`${category.id}Allocated`).textContent =
      allocatedAmount.toFixed(2);
    updateBudget(category.id, category.percent);
  });
}

function updateBudget(categoryId, percentage) {
  const netIncome = document.getElementById("netIncome").value;
  const expense = document.getElementById(categoryId).value;
  const allocatedAmount = (netIncome * percentage) / 100;
  const actualPercentage = (expense / netIncome) * 100;
  const difference = actualPercentage - percentage;

  const spentAmountElement = document.getElementById(
    `${categoryId}SpentAmount`
  );
  const spentPercentElement = document.getElementById(
    `${categoryId}SpentPercent`
  );
  const resultElement = document.getElementById(`${categoryId}Result`);

  spentAmountElement.textContent = expense;
  spentPercentElement.textContent = actualPercentage.toFixed(2) + "%";

  if (difference > 0) {
    resultElement.className = "result-over";
    resultElement.textContent = `Over budget by ${difference.toFixed(2)}%`;
  } else {
    resultElement.className = "result-under";
    resultElement.textContent = `Under budget by ${Math.abs(difference).toFixed(
      2
    )}%`;
  }
}

function calculateTotals() {
  let totalAllocatedAmount = 0;
  let totalSpentAmount = 0;
  let totalSpentPercentage = 0; // Initialize total spent percentage

  // Get all category rows in the table
  const categoryRows = document.querySelectorAll("table tbody tr");

  categoryRows.forEach((row) => {
    const categoryId = row.querySelector("td:first-child").textContent.trim();
    const allocatedAmountText = row.querySelector("td:nth-child(3)").textContent;
    const spentAmountText = row.querySelector("td:nth-child(4) input").value;
    const spentPercentText = row.querySelector("td:nth-child(6)").textContent;

    const allocatedAmount = parseFloat(allocatedAmountText.replace(",", ""));
    const spentAmount = parseFloat(spentAmountText.replace(",", ""));
    const spentPercent = parseFloat(spentPercentText.replace("%", ""));

    if (!isNaN(allocatedAmount)) {
      totalAllocatedAmount += allocatedAmount;
    }

    if (!isNaN(spentAmount)) {
      totalSpentAmount += spentAmount;
    }

    if (!isNaN(spentPercent)) {
      totalSpentPercentage += spentPercent;
    }
  });

  // Update the total amounts in the table footer
  document.getElementById("totalAllocatedAmount").textContent = totalAllocatedAmount.toFixed(2);
  document.getElementById("totalSpentAmount").textContent = totalSpentAmount.toFixed(2);
  document.getElementById("totalSpentPercent").textContent = totalSpentPercentage.toFixed(2) + "%";
}


// Call calculateTotals whenever there's a change in any input field
function attachInputListeners() {
  document.querySelectorAll('input[type="number"]').forEach((input) => {
    input.addEventListener("input", calculateTotals);
  });
}

window.onload = function() {
  calculateBudget();
  attachInputListeners(); // Attach listeners when the page loads
}

// Call calculateBudget when the page loads initially
function downloadCSV() {
  const netIncome = document.getElementById("netIncome").value;
  const totalSpentAmount =
    document.getElementById("totalSpentAmount").textContent;

  const rows = document.querySelectorAll("table tr");
  let csvContent = "data:text/csv;charset=utf-8,";

  csvContent += `Net Income: ${netIncome}\n`;
  csvContent += `Total Expenses: ${totalSpentAmount}\n\n`;

  // Get headers, excluding "Expense" column
  const headers = [];
  rows[0].querySelectorAll("th").forEach((header) => {
    const headerText = header.textContent.trim();
    if (headerText !== "Expense") {
      headers.push(headerText);
    }
  });
  csvContent += headers.join(",") + "\n";

  // Get rows data, excluding "Expense" column
  rows.forEach((row, rowIndex) => {
    if (rowIndex !== 0) {
      // Skip header row
      const rowData = [];
      row.querySelectorAll("td").forEach((cell, cellIndex) => {
        if (cellIndex !== 3) {
          // Skip "Expense" column
          rowData.push(cell.textContent.trim());
        }
      });
      csvContent += rowData.join(",") + "\n";
    }
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "budget_data.csv");
  document.body.appendChild(link);
  link.click();
}

function populateTableFromCSV(csvData) {
  const rows = csvData.split("\n");

  // Get net income from the first row
  const netIncome = rows[0].split(":")[1]?.split(",")[0]?.trim();
  document.getElementById("netIncome").value = netIncome;

  // Clear previous table data
  const tableBody = document.querySelector("table tbody");
  tableBody.innerHTML = "";

  // Populate table rows with CSV data
  for (let i = 4; i < rows.length; i++) {
    // Start from the third row to skip Net Income and Total Expenses rows
    const rowData = rows[i].split(",");
    const category = rowData[0]?.trim();
    if (category == "Totals") {
      break;
    }

    const allocatedPercent = parseFloat(rowData[1]?.split("%")[0]?.trim());
    // const allocatedAmount = rowData[2].trim();
    const spentAmount = parseFloat(rowData[3]?.trim());
    // const spentPercent = rowData[5].trim();
    // const budgetStatus = rowData[6].trim();

    const newRow = document.createElement("tr");
    const netIncome = document.getElementById("netIncome").value;
    const allocatedAmount = (parseFloat(netIncome) * allocatedPercent) / 100;

    newRow.innerHTML = `
      <td>${category}</td>
      <td>${allocatedPercent}%</td>
      <td id="${category.toLowerCase()}Allocated">${allocatedAmount.toFixed(2)}</td>
      <td><input type="number" id="${category.toLowerCase()}" value="${spentAmount}" placeholder="Enter ${category.toLowerCase()} expense" oninput="updateBudget('${category.toLowerCase()}', ${allocatedPercent})"></td>
      <td id="${category.toLowerCase()}SpentAmount"></td>
      <td id="${category.toLowerCase()}SpentPercent"></td>
      <td id="${category.toLowerCase()}Result"></td>
    `;
    tableBody.appendChild(newRow);
    updateBudget(category.toLowerCase(), allocatedPercent);
  }
  attachInputListeners();
  calculateTotals();
}

document
  .getElementById("csvFileInput")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const csvData = XLSX.utils.sheet_to_csv(sheet);
      console.log(csvData);
      populateTableFromCSV(csvData);
    };

    reader.readAsArrayBuffer(file);
  });

document.getElementById("downloadCSV").addEventListener("click", downloadCSV);
