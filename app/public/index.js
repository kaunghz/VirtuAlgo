let stockSearch = document.getElementById("stockSearch");
let stockSearchButton = document.getElementById("stockSearchButton");
let errorMsg = document.getElementById("ErrorMsg");
let balanceBlock = document.getElementById('balance');

let intervalID;
// Dynamic Components
let valueDisplay;
let chartContainer;
let canvas;
let buyStockInput = document.getElementById("buy-stock-count");
let buyStockButton = document.getElementById("buy-stock");
let sellStockInput = document.getElementById("sell-stock-count");
let sellStockButton = document.getElementById("sell-stock");
let stocksOwnedDisplay = document.getElementById("stocksOwnedDisplay");

stockSearchButton.addEventListener("click", () => {
    var loading = document.createElement("span");
    loading.textContent = "Loading...";
    loading.style.marginTop = "10px";
    document.body.appendChild(loading);
    let ticker = stockSearch.value.toUpperCase();
    if (intervalID) {
        clearInterval(intervalID);
    }
    intervalID = setInterval(function() {
        displayBalance();
        loading.remove();
        fetchStock(ticker);
    }, 2000);
});

stockSearch.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        stockSearchButton.click();
    }
});

function fetchStock(ticker) {
    fetch(
        `/alpaca/market/${ticker}`
    ).then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    }).then((response) => {
        //console.log(response);
        if (response.length == 0) {
            errorMsg.textContent = "Stock Market is Closed.";
        }
        var result = [];
        for (var i in response) {
            result.push(response[i]);
        }
        if (result.length > 0) {
            makeChart(result, ticker);
        }
    }).catch((error) => {
        console.log("Error Fetching stock data: ", error);
        throw error;
    })
}

/*
Function to generate an array of timestamps starting from the current time
For x-axis values on chart
*/
function generateTimeLabels(numberOfPoints, intervalMinutes) {
    const labels = [];
    let currentTime = new Date();
    for (let i = 0; i < numberOfPoints; i++) {
        labels.push(`${currentTime.getHours()}:${(currentTime.getMinutes() < 10 ? '0' : '') + currentTime.getMinutes()}`);
        currentTime.setTime(currentTime.getTime() - intervalMinutes * 60 * 1000);
    }
    return labels.reverse();
}

function displayBuySell() {
    buyStockInput.style.display = "block";
    buyStockButton.style.display = "block";
    sellStockInput.style.display = "block";
    sellStockButton.style.display = "block";
    stocksOwnedDisplay.style.display = "block";
}

/*
generate the chart given the array of stock prices
*/
function makeChart(stocks, ticker) {
    var existingChart = Chart.getChart("stockChart");
    if (existingChart) {
        existingChart.destroy();
    }
    // dynamically create the chart
    if (!chartContainer) {
        chartContainer = document.createElement("div");
        chartContainer.style.width = "800px";
        chartContainer.style.height = "400px";
        chartContainer.id = "chartContainer";
    }
    if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.id = "stockChart";
        chartContainer.appendChild(canvas);
        document.body.appendChild(chartContainer);
    }
    var labels = generateTimeLabels(stocks.length, 1);

    var curStock = stocks[0];
    var prices = []
    for (var i in stocks) {
        prices.push(stocks[i].ClosePrice);
    }
    const liveChart = new Chart(stockChart, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: ticker,
                data: prices.reverse(),
                fill: true,
            }]
        },
        options: {
            animation: {
                duration: 0
            },
        }
    });

    var curPricesDict = {
        "Current": curStock.ClosePrice,
        "Open": curStock.OpenPrice,
        "High": curStock.HighPrice,
        "Low": curStock.LowPrice
    }
    displayOwnStock(ticker, curStock.ClosePrice);
    displayCurrentStockPrice(curPricesDict);
    displayBuySell();
}

function displayCurrentStockPrice(curPrices) {
    // Check if valueDisplay already exists
    let prices = "<table style='border-collapse: collapse; border: 1px solid #ddd;'>";
    if (!valueDisplay) {
        // If it doesn't exist, create a new span element
        valueDisplay = document.createElement("span");
        valueDisplay.style.marginTop = "10px";
        document.body.appendChild(valueDisplay);
    }
    // Update the content of valueDisplay
    for (var key in curPrices) {
        if (key === "Current") {
            prices += "<tr style='border: 5px solid #36A2EB;'><th style='border: 5x solid #36A2EB; padding: 8px;'>" + key + "</th><th style='border: 5px solid #36A2EB; padding: 8px;'>" + curPrices[key] + "</th></tr>";
        } else {
            prices += "<tr style='border: 1px solid #ddd;'><th style='border: 1px solid #ddd; padding: 8px;'>" + key + "</th><th style='border: 1px solid #ddd; padding: 8px;'>" + curPrices[key] + "</th></tr>";
        }
    }
    prices += "</table>";
    valueDisplay.innerHTML = prices;
}


buyStockButton.addEventListener("click", buyHandler);
sellStockButton.addEventListener("click", sellHandler);

async function getPortfolio() {
    const stocks = await fetch("/portfolio/stocks").then((res) => {
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

async function displayOwnStock(ticker, curPrice) {
    const stocks = await getPortfolio();
    let stocksOwned = "Owned: <table style='border-collapse: collapse; border: 1px solid #ddd;'>";
    for (const stock of stocks) {
        const stockName = stock.stockname;
        const stockAmount = stock.stockamount;
        let stockeach = 0;
        let profit = 0;
        let profitDisplay = "";
        if (stock.totalprice != 0) {
            stockeach = (stock.totalprice / stockAmount).toFixed(2);
            profit = (stockeach - curPrice).toFixed(2);
            if (profit >= 0) {
                profitDisplay = "<span style='color: green;'> +" + profit + "</span>"
            } else {
                profitDisplay = "<span style='color: red;'> -" + profit + "</span>"
            }
        }
        if (stockName === ticker) {
            curAmount = "<tr style='border: 2px solid #36A2EB;'><th style='border: 2px solid #36A2EB; padding: 5px;'>" + ticker + "#: " + stockAmount + "</th><th style='border: 2px solid #36A2EB; padding: 5px;'>" + stockeach + " each" + profitDisplay + "</th></tr>";
            stocksOwned += curAmount + "<br>"
        }
    }
    stocksOwnedDisplay.innerHTML = stocksOwned;
}

async function buyHandler() {
    let buyStockCountValue = document.getElementById("buy-stock-count").value;
    let ticker = stockSearch.value;

    if(buyStockCountValue === "") {
        alert("No shares entered to buy.");
        return;
    }

    let buyStockCount = parseInt(buyStockCountValue);

    if(isNaN(buyStockCount) || buyStockCount <= 0) {
        alert("Please enter a valid number of shares to buy.");
        return;
    }

    buy(ticker, buyStockCount);
}

function sellHandler() {
    let totalBoughtPrice;
    let totalSharesOwned;
    let ticker = stockSearch.value;
    // Note that the username and portfolioName are hard-coded right now
    // Need to fetch how many stocks the user owns and the total price of the stocks
    // Can potentially move this fetch into the sellHandler() function then pass in totalBoughtPrice and totalShares into this sell() function.
    fetch(`/get-stock?stockName=${ticker}&portfolioName=port1`).then((response) => {
        return response.json();
    }).then((result) => {
        console.log(result[0]);
        totalBoughtPrice = result[0].totalprice;
        totalSharesOwned = result[0].stockamount;

        let sellStockCountValue = document.getElementById("sell-stock-count").value;

        if(sellStockCountValue === "") {
            alert("No shares entered to sell.");
            return;
        }
        let sellStockCount = parseInt(sellStockCountValue);
        if(isNaN(sellStockCount) || sellStockCount <= 0 || sellStockCount > totalSharesOwned) {
            alert("Please enter a valid number of shares to sell.");
            return;
        }
        console.log("Total Value of Shares:", totalBoughtPrice);
        console.log("Shares Owned:", totalSharesOwned);
        sell(ticker, sellStockCount, totalBoughtPrice, totalSharesOwned);
    }).catch((error) => {
        console.log(error);
        return;
    })
}

// buy and sell backend
async function buy(ticker, numShares) {
    let curPrice = await getClosePrice(ticker);
    let cost = curPrice * parseFloat(numShares);
    let balance = await getBalance();

    if (balance >= cost) {
        balance -= cost;

        // Updates the stock details for current user's portfolio
        //  - Essentially updates "Portfolio_Stock" table
        fetch("/buy-stock", {
            method: "POST",
            headers: {
            "Content-Type": "application/json"
            },
            body: JSON.stringify({stockName: ticker, stockCount: numShares, totalStockAmount: curPrice * numShares, portfolioName: "port1"}),
        }).then(response => {
            console.log("Status:", response.status);
        }).then(body => {
            console.log("Body:", body);
        }).catch(error => {
            console.log(error);
        });

        // Updates the portfolio details for current user
        //  - Essentally updates "Portfolio" table
        fetch("/update-portfolio", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({portfolioName: "port1", balance: balance})
        }).then(response => {
            console.log("Status:", response.status);
        }).then(body => {
            console.log("Body:", body);
        }).catch(error => {
            console.log(error);
        });
    } else {
        alert("Please enter a valid number of shares to sell.");
    }
};

async function sell(ticker, numShares, totalStockPrice, totalSharesOwned) {
    const curPrice = await getClosePrice(ticker);

    // Need to calculate the stock amount after selling stock
    // stockCount does not need to be calculated as the POST request performs subtraction of shares already
    let originalBoughtStockPrice = (parseFloat(totalStockPrice) / parseFloat(totalSharesOwned)).toFixed(2); // In the provided example, this would be 100 / 4 = $25 each
    console.log(originalBoughtStockPrice);
    let newTotalStockPrice = ((totalSharesOwned - numShares) * originalBoughtStockPrice).toFixed(2);
    console.log(newTotalStockPrice);

    fetch("/sell-stock", {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify({stockName: ticker, stockCount: numShares, totalStockAmount: newTotalStockPrice, portfolioName: "port1"}),
    }).then(response => {
        console.log("Status:", response.status);
    }).then(body => {
        console.log("Body:", body);
    }).catch(error => {
        console.log(error);
    });

    // Calculate the new balance after selling stock
    let balance = await getBalance();
    balance += (curPrice * numShares);

    fetch("/update-portfolio", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({portfolioName: "port1", balance: balance})
    }).then(response => {
        console.log("Status:", response.status);
    }).then(body => {
        console.log("Body:", body);
    }).catch(error => {
        console.log(error);
    });
};

async function getClosePrice(ticker) {
    return await fetch(
        `/alpaca/market/${ticker}`
    ).then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    }).then((response) => {
        var result = [];
        for (var i in response) {
            result.push(response[i]);
        }
        return result[0].ClosePrice;
    }).catch((error) => {
        console.log("Error Fetching stock data: ", error);
    });
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
    balanceBlock.textContent = "Balance: $" + balance.toFixed(2);
}

displayBalance();