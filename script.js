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

  const categories = [
    "charity",
    "family",
    "utilities",
    "commute",
    "investments",
    "savings",
    "personal",
  ];

  categories.forEach((category) => {
    const allocatedAmountText = document.getElementById(
      `${category}Allocated`
    ).textContent;
    const spentAmountText = document.getElementById(
      `${category}SpentAmount`
    ).textContent;
    const spentPercentText = document.getElementById(
      `${category}SpentPercent`
    ).textContent; // Get spent percentage text

    const allocatedAmount = parseFloat(allocatedAmountText.replace(",", ""));
    const spentAmount = parseFloat(spentAmountText.replace(",", ""));
    const spentPercent = parseFloat(spentPercentText.replace("%", "")); // Parse spent percentage

    if (!isNaN(allocatedAmount)) {
      totalAllocatedAmount += allocatedAmount;
    }

    if (!isNaN(spentAmount)) {
      totalSpentAmount += spentAmount;
    }

    if (!isNaN(spentPercent)) {
      // Update total spent percentage
      totalSpentPercentage += spentPercent;
    }
  });

  document.getElementById("totalAllocatedAmount").textContent =
    totalAllocatedAmount.toFixed(2);
  document.getElementById("totalSpentAmount").textContent =
    totalSpentAmount.toFixed(2);
  document.getElementById("totalSpentPercent").textContent =
    totalSpentPercentage.toFixed(2) + "%"; // Update total spent percentage
}

// Call calculateTotals whenever there's a change in any input field
document.querySelectorAll('input[type="number"]').forEach((input) => {
  input.addEventListener("input", calculateTotals);
});

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
  for (let i = 3; i < rows.length; i++) {
    // Start from the third row to skip Net Income and Total Expenses rows
    const rowData = rows[i].split(",");
    const category = rowData[0].trim();
    const allocatedPercent = rowData[1].trim();
    const allocatedAmount = rowData[2].trim();
    const spentAmount = rowData[4].trim();
    const spentPercent = rowData[5].trim();
    const budgetStatus = rowData[6].trim();

    const newRow = document.createElement("tr");
    newRow.innerHTML = `
      <td>${category}</td>
      <td>${allocatedPercent}</td>
      <td>${allocatedAmount}</td>
      <td><input type="number" value="${spentAmount}" oninput="updateBudget('${category}', ${allocatedPercent})"></td>
      <td>${spentAmount}</td>
      <td>${spentPercent}</td>
      <td class="${budgetStatus.toLowerCase()}">${budgetStatus}</td>
  `;
    tableBody.appendChild(newRow);
  }
}

document
  .getElementById("csvFileInput")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      console.log(e.target.result);
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      console.log(workbook);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const csvData = XLSX.utils.sheet_to_csv(sheet);
      console.log(csvData);
      // populateTableFromCSV(csvData);
    };

    reader.readAsArrayBuffer(file);
  });

document.getElementById("downloadCSV").addEventListener("click", downloadCSV);
