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
            quantityP.textContent = `Buy: ${algorithm.sellabovequantity}`;
            tickerP.textContent = `Stock: ${algorithm.ticker}`;
            priceP.textContent = `Buy Below: $${algorithm.sellaboveprice}`;
            
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
            quantityP.textContent = `Buy: ${algorithm.sellbelowquantity}`;
            tickerP.textContent = `Stock: ${algorithm.ticker}`;
            priceP.textContent = `Buy Below: $${algorithm.sellbelowprice}`;
            
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
