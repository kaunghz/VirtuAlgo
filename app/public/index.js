let stockSearch = document.getElementById("stockSearch");
let stockSearchButton = document.getElementById("stockSearchButton");
let errorMsg = document.getElementById("ErrorMsg");
let intervalID;

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
    var chartContainer = document.createElement("div");
    chartContainer.style.width = "800px";
    chartContainer.style.height = "400px";
    chartContainer.id = "chartContainer";
    var canvas = document.createElement("canvas");
    canvas.id = "stockChart";
    chartContainer.appendChild(canvas);
    document.body.appendChild(chartContainer);

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
    console.log (curPricesDict);
    displayCurrentStockPrice(curPricesDict);
    makeBuySellButtons();
}

stockSearchButton.addEventListener("click", () => {
    let ticker = stockSearch.value;
    if (intervalID) {
        clearInterval(intervalID);
    }
    intervalID = setInterval(function() {
        fetchStock(ticker);
    }, 2000);
});

function displayCurrentStockPrice(curPrices) {
    // BUG -------------- it does not update
    for (var key in curPrices) {
        var valueDisplay = document.createElement("span");
        valueDisplay.textContent += (key + ": " + curPrices[key] + "\n");
        valueDisplay.style.marginTop = "10px";
        valueDisplay.style.fontWeight = "bold";
        document.body.appendChild(valueDisplay);
        document.body.appendChild(valueDisplay);
        document.body.appendChild(document.createElement("br"));
    }
}

// Buy and Sell Skeleton
function makeBuySellButtons() {
    // Create buttons dynamically
    var buyStockButton = document.createElement("button");
    buyStockButton.textContent = "Buy Stock";
    buyStockButton.addEventListener("click", function() {
        console.log("buy clicked");
        buy();
    });
    var sellStockButton = document.createElement("button");
    sellStockButton.textContent = "Sell Stock";
    sellStockButton.addEventListener("click", function() {
        console.log("sell clicked");
        sell();
    });
    document.body.appendChild(buyStockButton);
    document.body.appendChild(document.createElement("br"));
    document.body.appendChild(sellStockButton);
}

// buy and sell backend
function buy() {
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

function sell() {
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