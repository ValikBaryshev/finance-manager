const expenseCategories = ["Transport", "Food", "Clothes", "Entertainment"];
const incomeCategories = ["Salary", "Freelance", "Bonus"];

const filterCategory = document.getElementById("filter-category");
const filterDateFrom = document.getElementById("filter-date-from");
const filterDateTo = document.getElementById("filter-date-to");
const filterBtn = document.getElementById("filter-btn");
const resetFilterBtn = document.getElementById("reset-filter-btn");

const showStatsBtn = document.getElementById("show-stats-btn");
const statisticsModal = document.getElementById("statistics-modal");
const closeStatsBtn = document.getElementById("close-stats-btn");

const incomeEx = document.getElementById("Income-exp");
const categories = document.getElementById("categories");
const add = document.getElementById("add");
const date = document.getElementById("start");
const amount = document.getElementById("amount");
const container = document.getElementById("container");
let balance = document.getElementById("balance");
let myBalance = 0;

incomeEx.addEventListener("change", function () {
  let currentCategory;

  if (incomeEx.value === "Expenses") {
    currentCategory = expenseCategories;
  } else if (incomeEx.value === "Income") {
    currentCategory = incomeCategories;
  }

  categories.textContent = "";

  for (let i = 0; i < currentCategory.length; i++) {
    let firstOption = document.createElement("option");
    firstOption.textContent = currentCategory[i];
    categories.appendChild(firstOption);
  }
});


let arrInputs = [amount, incomeEx, categories, date];
let operations = [];

if (localStorage.getItem("operations")) {
  operations = JSON.parse(localStorage.getItem("operations"));
  renderOperations();
}

add.addEventListener("click", function () {
  let hasErrors = false;

  for (let i = 0; i < arrInputs.length; i++) {
    if (arrInputs[i].value.trim() === "") {
      arrInputs[i].style.border = "2px solid #e63946";
      arrInputs[i].style.boxShadow = "0 0 8px rgba(230, 57, 70, 0.6)";
      arrInputs[i].style.backgroundColor = "#fff5f5";
      hasErrors = true;
    } else {
      arrInputs[i].style.border = "1px solid black";
      arrInputs[i].style.boxShadow = "none";
      arrInputs[i].style.backgroundColor = "#fff";
    }
  }

  let userAmount = Number(amount.value);
  if (isNaN(userAmount) || userAmount <= 0) {
    amount.style.border = "2px solid #e63946";
    amount.style.boxShadow = "0 0 8px rgba(230, 57, 70, 0.6)";
    amount.style.backgroundColor = "#fff5f5";
    hasErrors = true;
  }

  if (hasErrors) {
    return;
  }

  let objOperations = {
    amount: userAmount,
    type: incomeEx.value,
    category: categories.value,
    date: date.value,
  };

  operations.push(objOperations);


  localStorage.setItem("operations", JSON.stringify(operations));

  renderOperations();
});

function renderOperations(filteredOps) {
  let ops = filteredOps || operations;
  container.querySelectorAll(".operation-item").forEach((el) => el.remove());

  myBalance = 0;
  for (let i = 0; i < ops.length; i++) {
    if (ops[i].type === "Income") {
      myBalance += ops[i].amount;
    } else if (ops[i].type === "Expenses") {
      myBalance -= ops[i].amount;
    }

    let p = document.createElement("p");
    let sign = ops[i].type === "Income" ? "+" : "-";
    p.textContent =
      sign + ops[i].amount + "£ on a " + ops[i].category + " on " + ops[i].date;
    p.classList.add("operation-item");

    // Добавляем кнопку удаления
    let deleteBtn = document.createElement("button");
    deleteBtn.textContent = "✖";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.onclick = function () {
      let realIndex = operations.indexOf(ops[i]);
      operations.splice(realIndex, 1);
      localStorage.setItem("operations", JSON.stringify(operations));
      renderOperations();
    };

    p.appendChild(deleteBtn);
    container.appendChild(p);
  }
  balance.textContent = "Balance: £" + myBalance.toFixed(2);

  renderStatistics(filteredOps);
}

filterBtn.addEventListener("click", function () {
  let filtered = operations.filter((op) => {
    let categoryOk =
      !filterCategory.value || op.category === filterCategory.value;
    let dateOk = true;
    if (filterDateFrom.value) {
      dateOk = dateOk && op.date >= filterDateFrom.value;
    }
    if (filterDateTo.value) {
      dateOk = dateOk && op.date <= filterDateTo.value;
    }
    return categoryOk && dateOk;
  });
  renderOperations(filtered);
});

resetFilterBtn.addEventListener("click", function () {
  filterCategory.value = "";
  filterDateFrom.value = "";
  filterDateTo.value = "";
  renderOperations();
});

function renderStatistics(filteredOps) {
  let ops = filteredOps || operations;
  let incomeSum = 0;
  let expenseSum = 0;
  let categorySums = {};

  for (let op of ops) {
    if (op.type === "Income") {
      incomeSum += op.amount;
    } else if (op.type === "Expenses") {
      expenseSum += op.amount;
    }
    // Суммы по категориям
    if (!categorySums[op.category]) categorySums[op.category] = 0;
    categorySums[op.category] += op.amount;
  }


  let html = `<h3>Statistics</h3>
    <p>Income: £${incomeSum}</p>
    <p>Expenses: £${expenseSum}</p>
    <ul>`;
  for (let cat in categorySums) {
    html += `<li>${cat}: £${categorySums[cat]}</li>`;
  }
  html += `</ul>`;

  document.getElementById("statistics").innerHTML = html;
}

showStatsBtn.addEventListener("click", function () {
  statisticsModal.style.display = "block";
  renderStatistics();
  renderExpensesChart();
});

closeStatsBtn.addEventListener("click", function () {
  statisticsModal.style.display = "none";
});

function renderExpensesChart(filteredOps) {
  const ops = filteredOps || operations;

  const expenseData = {};
  for (let op of ops) {
    if (op.type === "Expenses") {
      if (!expenseData[op.category]) expenseData[op.category] = 0;
      expenseData[op.category] += op.amount;
    }
  }
  const categories = Object.keys(expenseData);
  const amounts = Object.values(expenseData);




  if (window.expensesChartInstance) {
    window.expensesChartInstance.destroy();
  }

  const ctx = document.getElementById("expensesChart").getContext("2d");
  window.expensesChartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels: categories,
      datasets: [
        {
          data: amounts,
          backgroundColor: [
            "#ff6384",
            "#36a2eb",
            "#ffce56",
            "#4bc0c0",
            "#9966ff",
            "#ff9f40",
          ],
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: true,
          position: "bottom",
        },
      },
    },
  });
}
