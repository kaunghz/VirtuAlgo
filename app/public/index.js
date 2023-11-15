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
        currentTime.setTime(currentTime.getTime() + intervalMinutes * 60 * 1000);
    }
    return labels;
}

/*
generate the chart given the array of stock prices
*/
function makeChart(stockPrices, symbol) {
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

    var labels = generateTimeLabels(stockPrices.length, 1);
    const liveChart = new Chart(stockChart, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: symbol,
                data: stockPrices,
                fill: true,
            }]
        },
        options: {
            animation: {
                duration: 0
            },
        }
    });
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