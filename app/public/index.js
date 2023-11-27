let stockSearch = document.getElementById("stockSearch");
let stockSearchButton = document.getElementById("stockSearchButton");
let errorMsg = document.getElementById("ErrorMsg");
let balanceBlock = document.getElementById('balance');
/*
    TODO: Fectch this balance from the database

DATABASE INTEGRATION TASK 1
Now the default is set 100k initial. We should fetch this value from the database.
*/
let balance = 100000.00;
let intervalID;
// Dynamic Components
let valueDisplay;
let chartContainer;
let canvas;
let buyStockInput = document.getElementById("buy-stock-count");
let buyStockButton = document.getElementById("buy-stock");
let sellStockInput = document.getElementById("sell-stock-count");
let sellStockButton = document.getElementById("sell-stock");
// initial state
balanceBlock.textContent = "Balance: $" + balance.toFixed(2);

stockSearchButton.addEventListener("click", () => {
    var loading = document.createElement("span");
    loading.textContent = "Loading...";
    loading.style.marginTop = "10px";
    document.body.appendChild(loading);
    let ticker = stockSearch.value;
    if (intervalID) {
        clearInterval(intervalID);
    }
    intervalID = setInterval(function() {
        balanceBlock.textContent = "Balance: $" + balance.toFixed(2);
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
        "Open": curStock.OpenPrice,
        "High": curStock.HighPrice,
        "Low": curStock.LowPrice,
        "Current": curStock.ClosePrice
    }
    displayCurrentStockPrice(curPricesDict);
    displayBuySell();
}

function displayCurrentStockPrice(curPrices) {
    // Check if valueDisplay already exists
    let prices = ""
    if (!valueDisplay) {
        // If it doesn't exist, create a new span element
        valueDisplay = document.createElement("span");
        valueDisplay.style.marginTop = "10px";
        document.body.appendChild(valueDisplay);
    }
    // Update the content of valueDisplay
    for (var key in curPrices) {
        prices += key + ": " + curPrices[key] + "<br>";
    }
    valueDisplay.innerHTML = prices
}

/*
    TODO: Make the stock count input box for buy and sell button
*/
// Buy and Sell Skeleton
function displayBuySell() {
    buyStockInput.style.display = "block"; 
    buyStockButton.style.display = "block"; 
    sellStockInput.style.display = "block"; 
    sellStockButton.style.display = "block"; 
}

buyStockButton.addEventListener("click", buyHandler);
sellStockButton.addEventListener("click", sellHandler);

function buyHandler() {
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
    
    // Note that the username and portfolioName are hard-coded right now
    // Need to fetch how many stocks the user owns and the total price of the stocks
    // Can potentially move this fetch into the sellHandler() function then pass in totalBoughtPrice and totalShares into this sell() function.
    fetch(`/get-stock?stockName=${ticker}&username=test&portfolioName=port1`).then((response) => {
        return response.json();
    }).then((result) => {
        console.log(result);
        totalBoughtPrice = result.rows[0].totalPrice;
        totalSharesOwned = result.rows[0].stockAmount;
    }).catch((error) => {
        console.log(error);
        return;
    }) 

    let sellStockCountValue = document.getElementById("sell-stock-count").value;

    if(sellStockCountValue === "") {
        alert("No shares entered to sell.");
        return;
    }

    let sellStockCount = parseInt(sellStockCountValue);

    if(isNaN(sellStockCount) || sellStockCount <= 0 || sellStockCount > totalShares) {
        alert("Please enter a valid number of shares to sell.");
        return;
    }
    sell(ticker, curPrice, sellStockCount, totalBoughtPrice, totalSharesOwned);
}

/*
    TODO: Integrate buy and sell to database

DATABASE INTEGRATION TASK 2
Now this will do computation of subtration (buy) and addition (sell) to the "balance" variable.

What is left is we must update the new values into the database. The values to update are:

For buy:
- new balance (subtraced balance)  
- stock name
- how many stock
- total price of the stock

For sell:
- new balance (added balance after computation)
- total price of the leftover stock (say you holds 4 stocks with total $100, sold 3 for $30 each,
        then it should update 1 stock left with total $25, meaning you made $15 profit)
(since we don't hold the history of stock selling, we don't need stock name and how many)
*/

// buy and sell backend
async function buy(ticker, numShares) {
    const curPrice = await getClosePrice(ticker);

    balance -= curPrice * parseFloat(numShares);

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
};

function sell(ticker, curPrice, numShares, totalStockPrice, totalSharesOwned) {
    // Need to calculate the stock amount after selling stock
    // stockCount does not need to be calculated as the POST request performs subtraction of shares already
    let originalBoughtStockPrice = totalStockPrice / totalSharesOwned; // In the provided example, this would be 100 / 4 = $25 each
    let newTotalStockPrice = (totalShares - numShares) * originalBoughtStockPrice;

    fetch("/sell-stock", {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify({stockName: ticker, stockCount: numShares, totalStockAmount: newTotalStockPrice, username: "test", portfolioName: "port1"}),
    }).then(response => {
        console.log("Status:", response.status);
    }).then(body => {
        console.log("Body:", body);
    }).catch(error => {
        console.log(error);
    });

    // Calculate the new balance after selling stock
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