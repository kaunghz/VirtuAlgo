let currentPortfolioName = document.getElementById("portfolioName");
let currentPortfolioBalance = document.getElementById("portfolioBalance");

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

async function getPortfolio() {

    let dest = "/portfolio/history";
    var filter = document.getElementById("portfolio-filter");
    if (filter.options[filter.selectedIndex].id === "priced") {
        dest = "/portfolio/history/sort/price-desc";
    } else if (filter.options[filter.selectedIndex].id === "pricea") {
        dest = "/portfolio/history/sort/price-asc";
    } else if (filter.options[filter.selectedIndex].id === "namea") {
        dest = "/portfolio/history/sort/alphabetical-asc";
    } else if (filter.options[filter.selectedIndex].id === "named") {
        dest = "/portfolio/history/sort/alphabetical-desc";
    } else if (filter.options[filter.selectedIndex].id === "amountd") {
        dest = "/portfolio/history/sort/amount-desc";
    } else if (filter.options[filter.selectedIndex].id === "amounta") {
        dest = "/portfolio/history/sort/amount-asc";
    } else if (filter.options[filter.selectedIndex].id === "buy") {
        dest = "/portfolio/history-buy";
    } else if (filter.options[filter.selectedIndex].id === "sell") {
        dest = "/portfolio/history-sell";
    } else if (filter.options[filter.selectedIndex].id === "new") {
        dest = "/portfolio/history";
    } else if (filter.options[filter.selectedIndex].id === "old") {
        dest = "/portfolio/history/oldest";
    }

    const stocks = await fetch(dest).then((res) => {
        if (res.status === 401) {
            alert("You must sign in again. Redirecting to login page...");
            setTimeout(function () {
                window.location.href = './';
            }, 500);
            throw new Error(`Unauthorized: ${res.status} - ${res.statusText}`);
        }
        return res.json();
    }).then((res) => {
        console.log(res);
        return res;
    }).catch((err) => {
        console.log(err);
    });
    return stocks;
}

async function displayHistory() {
    const history = await getPortfolio();

    const table = document.getElementById("historyTable");
    while (table.children.length > 1) {
        table.removeChild(table.lastChild);
    }

    for (const record of history) {
        const stockName = record.stockname;
        const stockAmount = record.stockamount;
        const stockPrice = record.stockprice;
        const totalStock = record.totalstock;
        const balance = record.portfoliobalance;
        const date = record.transactiondate;

        const tr = document.createElement('tr');

        const tdStockName = document.createElement('td');
        const tdStockAmount = document.createElement('td');
        const tdStockPrice = document.createElement('td');
        const tdTotalStock = document.createElement('td');
        const tdBalance = document.createElement('td');
        const tdDate = document.createElement('td');

        const textStockName = document.createTextNode(stockName);
        const textStockAmount = document.createTextNode(stockAmount);
        const textStockPrice = document.createTextNode(stockPrice);
        const textTotalStock = document.createTextNode(totalStock);
        const textBalance = document.createTextNode(balance);
        const textDate = document.createTextNode(date);

        tdStockName.appendChild(textStockName);
        tdStockAmount.appendChild(textStockAmount);
        tdStockPrice.appendChild(textStockPrice);
        tdTotalStock.appendChild(textTotalStock);
        tdBalance.appendChild(textBalance);
        tdDate.appendChild(textDate);

        tr.appendChild(tdStockName);
        tr.appendChild(tdStockAmount);
        tr.appendChild(tdStockPrice);
        tr.appendChild(tdTotalStock);
        tr.appendChild(tdBalance);
        tr.appendChild(tdDate);

        table.appendChild(tr);
    }
}

displayHistory();