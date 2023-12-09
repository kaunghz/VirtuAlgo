import { getPortfolio } from "../portfolio/portfolio";

// Create Algorithm Forms
const newAlgorithmBuyBelowForm = document.getElementById("new-buy-below-algorithm");
const newAlgorithmSellAboveForm = document.getElementById("new-sell-above-algorithm");
const newAlgorithmSellBelowForm = document.getElementById("new-sell-below-algorithm");

// Show Algorithm Buttons
const showBuyBelowAlgorithmsButton = document.getElementById("show-buy-below-algorithms");
const showSellAboveAlgorithmsButton = document.getElementById("show-sell-above-algorithms");
const showSellBelowAlgorithmsButton = document.getElementById("show-sell-below-algorithms");

// Algorithm List
const algorithmsList = document.getElementById("algorithms");


/* Show Algorithms */

showBuyBelowAlgorithmsButton.addEventListener("click", showBuyBelowAlgorithms);
showSellAboveAlgorithmsButton.addEventListener("click", showSellAboveAlgorithms);
showSellBelowAlgorithmsButton.addEventListener("click", showSellBelowAlgorithms);

function showBuyBelowAlgorithms() {
    clearAlgorithmsList();

    fetch("/algorithm/get/buy-below", (response) => {
        return response.body();
    }).then((result) => {
        return result.json();
    }).then((result) => {
        createAlgorithmsListHeader("Buy Below Algorithms");

        for (const algorithm of result) {
            const divider = document.createElement('hr');
            const container = document.createElement('div');
            const nameP = document.createElement('p');
            const priceP = document.createElement('p');
            const quantityP = document.createElement('p');
            const tickerP = document.createElement('p');

            nameP.textContent = `Algorithm: ${algorithm.name}`;
            quantityP.textContent = `Buy: ${algorithm.buybelowquantity}`;
            tickerP.textContent = `Stock: ${algorithm.ticker}`;
            priceP.textContent = `Buy Below: $${algorithm.buybelowprice}`;
            
            container.append(divider, nameP, quantityP, tickerP, priceP, divider);
            algorithmsList.append(container);
        }
    }).catch((error) => {
        console.log(error);
    });
}

function showSellAboveAlgorithms() {
    clearAlgorithmsList();

    fetch("/algorithm/get/sell-above", (response) => {
        return response.body();
    }).then((result) => {
        return result.json();
    }).then((result) => {
        createAlgorithmsListHeader("Sell Above Algorithms");

        for (const algorithm of result) {
            const divider = document.createElement('hr');
            const container = document.createElement('div');
            const nameP = document.createElement('p');
            const priceP = document.createElement('p');
            const quantityP = document.createElement('p');
            const tickerP = document.createElement('p');

            nameP.textContent = `Algorithm: ${algorithm.name}`;
            quantityP.textContent = `Sell Quantity: ${algorithm.sellabovequantity}`;
            tickerP.textContent = `Stock: ${algorithm.ticker}`;
            priceP.textContent = `Sell Price: $${algorithm.sellaboveprice}`;
            
            container.append(divider, nameP, quantityP, tickerP, priceP, divider);
            algorithmsList.append(container);
        }
    }).catch((error) => {
        console.log(error);
    });
}

function showSellBelowAlgorithms() {
    clearAlgorithmsList();

    fetch("/algorithm/get/sell-below", (response) => {
        return response.body();
    }).then((result) => {
        return result.json();
    }).then((result) => {
        createAlgorithmsListHeader("Sell Below Algorithms");

        for (const algorithm of result) {
            const divider = document.createElement('hr');
            const container = document.createElement('div');
            const nameP = document.createElement('p');
            const priceP = document.createElement('p');
            const quantityP = document.createElement('p');
            const tickerP = document.createElement('p');

            nameP.textContent = `Algorithm: ${algorithm.name}`;
            quantityP.textContent = `Sell Quantity: ${algorithm.sellbelowquantity}`;
            tickerP.textContent = `Stock: ${algorithm.ticker}`;
            priceP.textContent = `Sell Price: $${algorithm.sellbelowprice}`;
            
            container.append(divider, nameP, quantityP, tickerP, priceP, divider);
            algorithmsList.append(container);
        }
    }).catch((error) => {
        console.log(error);
    });
}


/* Algorithm Forms */

newAlgorithmBuyBelowForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("buy-below-name").value;
    const quantity = document.getElementById("buy-below-quantity").value;
    const ticker = document.getElementById("buy-below-ticker").value;
    const price = document.getElementById("buy-below-price").value;

    if (!(name || quantity || ticker || price)) {
        alert("Fields cannot be null");
        return;
    }

    if (!Number.isInteger(Number.parseInt(quantity))) {
        alert("Quantity must be an integer.");
        return;
    } else if (Number.parseInt(quantity) < 1) {
        alert("Quantity must be greater than 0.");
        return;
    }

    if (Number.isNaN(Number.parseFloat(price))) {
        alert("Price must be a valid float.");
        return;
    } else if (price < 0.0) {
        alert("Price must be greater than 0.0.");
        return;
    }

    await fetch("/algorithm/new/buy-below", {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "name": name,
            "quantity": quantity,
            "ticker": ticker,
            "price": price,
        })
    }).then(response => {
        console.log(response);
        alert("New buy below algorithm added.");
        location.reload();
    }).catch(error => {
        console.log(error);
        alert("Could not create algorithm.");
    });
});

newAlgorithmSellAboveForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("sell-above-name").value;
    const quantity = document.getElementById("sell-above-quantity").value;
    const ticker = document.getElementById("sell-above-ticker").value;
    const price = document.getElementById("sell-above-price").value;

    if (!(name || quantity || ticker || price)) {
        alert("Fields cannot be null");
        return;
    }

    if (!Number.isInteger(Number.parseInt(quantity))) {
        alert("Quantity must be an integer.");
        return;
    } else if (Number.parseInt(quantity) < 1) {
        alert("Quantity must be greater than 0.");
        return;
    }

    if (Number.isNaN(Number.parseFloat(price))) {
        alert("Price must be a valid float.");
        return;
    } else if (price < 0.0) {
        alert("Price must be greater than 0.0.");
        return;
    }

    await fetch("/algorithm/new/sell-above", {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "name": name,
            "quantity": quantity,
            "ticker": ticker,
            "price": price,
        })
    }).then(response => {
        console.log(response);
        alert("New sell above algorithm added.");
        location.reload();
    }).catch(error => {
        console.log(error);
        alert("Could not create algorithm.");
    });
});

newAlgorithmSellBelowForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("sell-below-name").value;
    const quantity = document.getElementById("sell-below-quantity").value;
    const ticker = document.getElementById("sell-below-ticker").value;
    const price = document.getElementById("sell-below-price").value;

    if (!(name || quantity || ticker || price)) {
        alert("Fields cannot be null");
        return;
    }

    if (!Number.isInteger(Number.parseInt(quantity))) {
        alert("Quantity must be an integer.");
        return;
    } else if (Number.parseInt(quantity) < 1) {
        alert("Quantity must be greater than 0.");
        return;
    }

    if (Number.isNaN(Number.parseFloat(price))) {
        alert("Price must be a valid float.");
        return;
    } else if (price < 0.0) {
        alert("Price must be greater than 0.0.");
        return;
    }

    await fetch("/algorithm/new/sell-below", {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "name": name,
            "quantity": quantity,
            "ticker": ticker,
            "price": price,
        })
    }).then(response => {
        console.log(response);
        alert("New sell below algorithm added.");
        location.reload();
    }).catch(error => {
        console.log(error);
        alert("Could not create algorithm.");
    });
});


/* Helper Functions */

function clearAlgorithmsList() {
    while (algorithmsList.firstChild) {
        algorithmsList.removeChild(algorithmsList.lastChild);
    }
}

function createAlgorithmsListHeader(headerText) {
    const firstDivider = document.createElement('hr');
    const secondDivider = document.createElement('hr');
    const header = document.createElement("h4");
    header.textContent = headerText;
    algorithmsList.append(firstDivider, header, secondDivider);
}


/* Execute Algorithms' Logic */

const runAlgorithmsButton = document.getElementById("run-algorithms-button");

runAlgorithmsButton.addEventListener("click", runUserTradingAlgorithms);

async function runUserTradingAlgorithms() {

    /* Retrieve User's Algorithms By Methodology */

    const algorithmsBuyBelow = await fetch("/algorithm/get/buy-below", (response) => {
        return response.body();
    }).then((result) => {
        return result.json();
    }).catch((error) => {
        console.log(error);
        return [];
    });

    const algorithmsSellAbove = await fetch("/algorithm/get/sell-above", (response) => {
        return response.body();
    }).then((result) => {
        return result.json();
    }).catch((error) => {
        console.log(error);
        return [];
    });

    const algorithmsSellBelow = await fetch("/algorithm/get/sell-below", (response) => {
        return response.body();
    }).then((result) => {
        return result.json();
    }).catch((error) => {
        console.log(error);
        return [];
    });

    /* Run The Algorithms By Setting Intervals For Every Algorithm Of Each Methodology */

    for (const algorithm of algorithmsBuyBelow) {
        setInterval(async () => {
            const stockData = await fetch(`/alpaca/market/${algorithm.ticker}`).then((response) => {
                return response.json();
            }).then((result) => {
                console.log(result);
                return result;
            }).catch((error) => {
                console.log(error);
                return [];
            });

            const balance = await fetch("/balance").then((response) => {
                return response.json();
            }).then((result) => {
                console.log(result);
                return result;
            }).catch((error) => {
                console.log(error);
                return 0.0;
            });

            if (stockData.length > 1) {
                const curStock = stockData[0];
                const prevStock = stockData[1];

                if (prevStock.closePrice >= algorithm.buybelowprice && curStock.closePrice < algorithm.buybelowprice) {
                    const total = ((algorithm.buybelowquantity).toFixed(0) * curStock.closePrice).toFixed(2);
                    if (total <= balance) {
                        await fetch("/buy-stock", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({stockName: algorithm.ticker, stockCount: algorithm.buybelowquantity, totalStockAmount: total}),
                        }).then(response => {
                            console.log("Status:", response.status);
                        }).then(body => {
                            console.log("Body:", body);
                        }).catch(error => {
                            console.log(error);
                        });
                    }
                }
            }
            
            console.log(stockData);
        }, 2000);
    }

    for (const algorithm of algorithmsSellAbove) {
        setInterval(async () => {
            const stockData = await fetch(`/alpaca/market/${algorithm.ticker}`).then((response) => {
                return response.json();
            }).then((result) => {
                console.log(result);
                return result;
            }).catch((error) => {
                console.log(error);
                return [];
            });

            const stocks = await getPortfolio();
            const userStockData = getUserStockDataFromPortfolioStocks(stocks, algorithm.ticker);

            if (stockData.length > 1) {
                const curStock = stockData[0];
                const prevStock = stockData[1];
                
                if (Object.keys(userStockData).length === 2) {
                    if (prevStock.closePrice <= algorithm.sellaboveprice && curStock.closePrice > algorithm.sellaboveprice) {
                        if (userStockData.quantity >= algorithm.sellabovequantity) {
                            const total = ((algorithm.sellaboveprice).toFixed(0) * algorithm.sellabovequantity).toFixed(2);

                            fetch("/sell-stock", {
                                method: "POST",
                                headers: {
                                "Content-Type": "application/json"
                                },
                                body: JSON.stringify({stockName: algorithm.ticker, stockCount: algorithm.sellabovequantity, totalStockAmount: total}),
                            }).then(response => {
                                console.log("Status:", response.status);
                            }).then(body => {
                                console.log("Body:", body);
                            }).catch(error => {
                                console.log(error);
                            });
                        }
                    }
                }
            }
            
            console.log(stockData);
        }, 2000);
    }

    for (const algorithm of algorithmsSellBelow) {
        setInterval(async () => {
            const stockData = await fetch(`/alpaca/market/${algorithm.ticker}`).then((response) => {
                return response.json();
            }).then((result) => {
                console.log(result);
                return result;
            }).catch((error) => {
                console.log(error);
                return [];
            });

            const stocks = await getPortfolio();
            const userStockData = getUserStockDataFromPortfolioStocks(stocks, algorithm.ticker);

            if (stockData.length > 1) {
                const curStock = stockData[0];
                const prevStock = stockData[1];
                
                if (Object.keys(userStockData).length === 2) {
                    if (prevStock.closePrice >= algorithm.sellbelowprice && curStock.closePrice < algorithm.sellbelowprice) {
                        if (userStockData.quantity >= algorithm.sellbelowquantity) {
                            const total = ((algorithm.sellbelowprice).toFixed(0) * algorithm.sellbelowquantity).toFixed(2);

                            fetch("/sell-stock", {
                                method: "POST",
                                headers: {
                                "Content-Type": "application/json"
                                },
                                body: JSON.stringify({stockName: algorithm.ticker, stockCount: algorithm.sellbelowquantity, totalStockAmount: total}),
                            }).then(response => {
                                console.log("Status:", response.status);
                            }).then(body => {
                                console.log("Body:", body);
                            }).catch(error => {
                                console.log(error);
                            });
                        }
                    }
                }
            }
            
            console.log(stockData);
        }, 2000);
    }
}


/* Helpers */

const getUserStockDataFromPortfolioStocks =  (stocks, ticker) => {
    for (const stock of stocks) {
        if (stock.stockname === ticker) {
            return {
                "ticker": stock.stockname,
                "quantity": stock.stockamount,
            };
        }
    }

    return {};
}
