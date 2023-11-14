// add code
let stockSearch = document.getElementById("stockSearch");
let stockSearchButton = document.getElementById("stockSearchButton");
let stockChart = document.getElementById("stockchart");

stockSearchButton.addEventListener("click", () => {
    stockChart.textContent = "";

    let ticker = stockSearch.value;

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
});

// Buy and Sell Skeleton

let buyButton = document.getElementById("buy");
    
buyButton.addEventListener("click", () => {
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
});

let sellButton = document.getElementById("sell");
    
sellButton.addEventListener("click", () => {
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
});