let stockSearch = document.getElementById("stockSearch");
let stockSearchButton = document.getElementById("stockSearchButton");
let errorMsg = document.getElementById("ErrorMsg");
let balanceBlock = document.getElementById('balance');
let balance = 100000;
let intervalID;
// Dynamic Components
let valueDisplay;
let chartContainer;
let canvas;
let buyStockButton;
let sellStockButton;
let buySellEventAdded = false;
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
        console.log(response);
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
function makeChart(stocks, symbol) {
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
                label: symbol,
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
    makeBuySellButtons(curStock.ClosePrice);
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

// Buy and Sell Skeleton
function makeBuySellButtons(curPrice) {
    // Create buttons dynamically
    if (!buyStockButton) {
        buyStockButton = document.createElement("button");
        buyStockButton.textContent = "Buy Stock";
        document.body.appendChild(buyStockButton);
        document.body.appendChild(document.createElement("br"));
    }
    if (!sellStockButton) {
        sellStockButton = document.createElement("button");
        sellStockButton.textContent = "Sell Stock";
        document.body.appendChild(sellStockButton);
        document.body.appendChild(document.createElement("br"));
    }
    if (!buySellEventAdded) {
        buySellEventAdded = true;
        buyStockButton.addEventListener("click", buyHandler);
        sellStockButton.addEventListener("click", sellHandler);
    }
    // THIS HAS A BUG ------------- does not get the latest price
    function buyHandler() {
        buy(curPrice);
    }
    function sellHandler() {
        sell(curPrice);
    }
}

// buy and sell backend
function buy(curPrice) {
    console.log(curPrice, "------------------", balance, "==========", balance - curPrice)
    balance -= curPrice;
    fetch("/buy-stock", {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify({stockName: "APPL", amount: 45.56, username: "test", portfolioName: "port1"}),
    }).then(response => {
        console.log("Status:", response.status);
    }).then(body => {
        console.log("Body:", body);
    }).catch(error => {
        console.log(error);
    });
};

function sell(curPrice) {
    balance += curPrice;
    fetch("/sell-stock", {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify({stockName: "APPL", amount: 45.56, username: "test", portfolioName: "port1"}),
    }).then(response => {
        console.log("Status:", response.status);
    }).then(body => {
        console.log("Body:", body);
    }).catch(error => {
        console.log(error);
    });
};