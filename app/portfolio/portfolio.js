let createPortfolioButton = document.getElementById("createPortfolioButton");
let updatePortfolioButton = document.getElementById("updatePortfolioButton");

let createPortfolioName = document.getElementById("createPortfolioName");
let updatePortfolioName = document.getElementById("updatePortfolioName");
let updatePortfolioBalance = document.getElementById("updatePortfolioBalance");

createPortfolioButton.addEventListener("click", function() {
    fetch("/add-portfolio", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({portfolioName: createPortfolioName.value})
    }).then(response => {
        console.log("Status:", response.status);
    }).then(body => {
        console.log("Body:", body);
    }).catch(error => {
        console.log(error);
    });
});

updatePortfolioButton.addEventListener("click", function() {
    fetch("/update-portfolio", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({portfolioName: updatePortfolioName.value, balance: updatePortfolioBalance.value})
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