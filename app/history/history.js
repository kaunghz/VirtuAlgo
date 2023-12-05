let currentPortfolioName = document.getElementById("portfolioName");
let currentPortfolioBalance = document.getElementById("portfolioBalance");

async function getPortfolioName() {
    return await fetch("/portfolioName").then((res) => {
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
    const stocks = await fetch("/portfolio/history").then((res) => {
        console.log(res);
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

    const divHistory = document.getElementById("historyDiv");
    const hrFirst = document.createElement("hr");

    divHistory.append(hrFirst);

    const table = document.createElement('table');
    const trHeader = document.createElement('tr');

    const thStockName = document.createElement('th');
    const thStockAmount = document.createElement('th');
    const thStockPrice = document.createElement('th');
    const thTotalStock = document.createElement('th');
    const thBalance = document.createElement('th');
    const thDate = document.createElement('th');

    const thTextStockName = document.createTextNode("Stock");
    const thTextStockAmount = document.createTextNode("Amount");
    const thTextStockPrice = document.createTextNode("Price");
    const thTextTotalStock = document.createTextNode("Net Amount");
    const thTextBalance = document.createTextNode("Net Balance");
    const thTextDate = document.createTextNode("Date");

    thStockName.appendChild(thTextStockName);
    thStockAmount.appendChild(thTextStockAmount);
    thStockPrice.appendChild(thTextStockPrice);
    thTotalStock.appendChild(thTextTotalStock);
    thBalance.appendChild(thTextBalance);
    thDate.appendChild(thTextDate);

    trHeader.appendChild(thStockName);
    trHeader.appendChild(thStockAmount);
    trHeader.appendChild(thStockPrice);
    trHeader.appendChild(thTotalStock);
    trHeader.appendChild(thBalance);
    trHeader.appendChild(thDate);

    table.appendChild(trHeader);

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
    divHistory.appendChild(table);
}

displayHistory();