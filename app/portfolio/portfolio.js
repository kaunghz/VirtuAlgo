let updateNameButton = document.getElementById("updatePortfolioNameButton");
let updateBalanceButton = document.getElementById("updatePortfolioBalanceButton");

let newPortfolioName = document.getElementById("newPortfolioName");
let newPortflioBalance = document.getElementById("newPortfolioBalance");

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
    }).catch(error => {
        console.log(error);
    });
});

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

async function displayPortfolio() {
    const stocks = await getPortfolio();

    const divStocks = document.getElementById("stocks");
    const hrFirst = document.createElement("hr");

    divStocks.append(hrFirst);

    for (const stock of stocks) {
        const stockName = stock.stockname;
        const stockAmount = stock.stockamount;

        if (0 < stockAmount) {
            const hr = document.createElement("hr");
            const div = document.createElement("div");
            const pTicker = document.createElement("p");
            const pAmount = document.createElement("p");

            pTicker.textContent = "Stock: " + stockName;
            pAmount.textContent = "Amount Owned: " + stockAmount;

            div.append(pTicker, pAmount, hr);
            divStocks.append(div);
        }
    }
}

displayPortfolio();