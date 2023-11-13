// add code
let stockSearch = document.getElementById("stockSearch");
let stockSearchButton = document.getElementById("stockSearchButton");
let stockChart = document.getElementById("stockchart");
let intervalID;

function fetchStock(ticker) {
    fetch(
        `/alpaca/market/${ticker}`
    ).then((response) => {
        return response.json();
    }).then((response) => {
        console.log(response);
        if (response.length == 0) {
            stockChart.textContent = "Stock Market is Closed";
        }
    }).catch((error) => {
        console.log(error);
    })
}

stockSearchButton.addEventListener("click", () => {
    stockChart.textContent = "";
    let ticker = stockSearch.value;
    if (intervalID) {
        clearInterval(intervalID);
    }
    intervalID = setInterval(function() {
        fetchStock(ticker);
        console.log("herereere");
    }, 1000);
});