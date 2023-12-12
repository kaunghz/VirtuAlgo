let currentPortfolioName = document.getElementById("portfolioName");
let currentPortfolioBalance = document.getElementById("portfolioBalance");
let updateNameButton = document.getElementById("updatePortfolioNameButton");
let updateBalanceButton = document.getElementById("updatePortfolioBalanceButton");

let newPortfolioName = document.getElementById("newPortfolioName");
let newPortflioBalance = document.getElementById("newPortfolioBalance");

async function getPortfolioName() {
    return await fetch("/portfolioName").then((res) => {
        if (res.status === 401) {
            alert("You must sign in again. Redirecting to login page...");
            setTimeout(function () {
                window.location.href = './';
            }, 500);
            throw new Error(`Unauthorized: ${res.status} - ${res.statusText}`);
        }
        return res.json();
    }).then((res) => {
        return res;
    }).catch((err) => {
        console.log(err);
    });
}

async function displayPortfolioName() {
    const portfolioName = await getPortfolioName();
    currentPortfolioName.textContent = portfolioName;
}

async function getBalance() {
    return await fetch("/balance").then((res) => {
        return res.json();
    }).then((res) => {
        let userBalance = parseFloat(res);
        return userBalance;
    }).catch((err) => {
        console.log(err);
    });
}

async function displayBalance() {
    const balance = await getBalance();
    const formattedBalance = balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    currentPortfolioBalance.textContent = "Balance: " + formattedBalance;
}

displayPortfolioName();
displayBalance();

updateNameButton.addEventListener("click", function() {
    fetch("/update-portfolio-name", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({newPortfolioName: newPortfolioName.value})
    }).then(response => {
        console.log("Status:", response.status);
    }).then(body => {
        console.log("Body:", body);
        displayPortfolioName();
    }).catch(error => {
        console.log(error);
    });
});

updateBalanceButton.addEventListener("click", function() {
    fetch("/update-portfolio-balance", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({balance: newPortflioBalance.value})
    }).then(response => {
        console.log("Status:", response.status);
    }).then(body => {
        console.log("Body:", body);
        displayBalance();
    }).catch(error => {
        console.log(error);
    });
});

async function getPortfolio() {

    let dest = "/portfolio/stocks";
    var filter = document.getElementById("portfolio-filter");
    if (filter.options[filter.selectedIndex].id === "priced") {
        dest = "/portfolio/stocks/sort/price-desc";
    } else if (filter.options[filter.selectedIndex].id === "pricea") {
        dest = "/portfolio/stocks/sort/price-asc";
    } else if (filter.options[filter.selectedIndex].id === "namea") {
        dest = "/portfolio/stocks/sort/alphabetical-asc";
    } else if (filter.options[filter.selectedIndex].id === "named") {
        dest = "/portfolio/stocks/sort/alphabetical-desc";
    } else if (filter.options[filter.selectedIndex].id === "amountd") {
        dest = "/portfolio/stocks/sort/amount-desc";
    } else if (filter.options[filter.selectedIndex].id === "amounta") {
        dest = "/portfolio/stocks/sort/amount-asc";
    }

    const stocks = await fetch(dest).then((res) => {
        if (response.status === 401) {
            alert("You must sign in again. Redirecting to login page...");
            setTimeout(function () {
                window.location.href = './';
            }, 500);
            throw new Error(`Unauthorized: ${response.status} - ${response.statusText}`);
        }
        return response.json();
    }).then((res) => {
        console.log(res);
        return res;
    }).catch((err) => {
        console.log(err);
    });
    return stocks;
}

async function displayPortfolio() {
    const stocks = await getPortfolio();

    const table = document.getElementById("stockTable");
    while (table.children.length > 1) {
        table.removeChild(table.lastChild);
    }

    for (const stock of stocks) {
        const stockName = stock.stockname;
        const stockAmount = stock.stockamount;
        const stockPrice = stock.totalprice;

        if (0 < stockAmount) {
            const tr = document.createElement('tr');

            const tdStockName = document.createElement('td');
            const tdStockAmount = document.createElement('td');
            const tdStockPrice = document.createElement('td');

            const textStockName = document.createTextNode(stockName);
            const textStockAmount = document.createTextNode(stockAmount);
            const textStockPrice = document.createTextNode(stockPrice);

            tdStockName.appendChild(textStockName);
            tdStockAmount.appendChild(textStockAmount);
            tdStockPrice.appendChild(textStockPrice);

            tr.appendChild(tdStockName);
            tr.appendChild(tdStockAmount);
            tr.appendChild(tdStockPrice);

            table.appendChild(tr);
        }
    }
}

displayPortfolio();
