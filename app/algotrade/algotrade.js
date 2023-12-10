let newAlgorithmForm = document.getElementById("new-algorithm-form");

let newAlgorithmName = document.getElementById("new-name");
let buyBelowPrice = document.getElementById("buy-below-price");
let buyBelowStocks = document.getElementById("buy-below-stocks");
let sellBelowPrice = document.getElementById("sell-below-price");
let sellBelowStocks = document.getElementById("sell-below-stocks");
let sellAbovePrice = document.getElementById("sell-above-price");
let sellAboveStocks = document.getElementById("sell-above-stocks");

let algorithmsList = document.getElementById("algorithms");

fetch('/get-algorithms').then((response) => {
    if (response.status === 401) {
        alert("You must sign in again. Redirecting to login page...");
        setTimeout(function () {
            window.location.href = './';
        }, 500);
        throw new Error(`Unauthorized: ${response.status} - ${response.statusText}`);
    }
    return response.json();
}).then((result) => {
    console.log(result);
    for (const algorithm of result) {
        let divider = document.createElement('hr');
        let container = document.createElement('div');
        let algorithmName = document.createElement('p');
        let buyBelowP = document.createElement('p');
        let buyBelowS = document.createElement('p');
        let sellBelowP = document.createElement('p');
        let sellBelowS = document.createElement('p');
        let sellAboveP = document.createElement('p');
        let sellAboveS = document.createElement('p');

        algorithmName.textContent = `Algorithm: ${algorithm.name}`;
        buyBelowP.textContent = `Buy below $${algorithm.buybelowprice}`;
        buyBelowS.textContent = `Buy ${algorithm.buybelowstocks} shares`;
        sellBelowP.textContent = `Sell below $${algorithm.sellbelowprice}`;
        sellBelowS.textContent = `Sell ${algorithm.sellbelowstocks} shares`;
        sellAboveP.textContent = `Sell above $${algorithm.sellaboveprice}`;
        sellAboveS.textContent = `Sell ${algorithm.sellabovestocks} shares`;

        container.append(divider, algorithmName, buyBelowP, buyBelowS, sellBelowP, sellBelowS, sellAboveP, sellAboveS, divider);
        
        algorithmsList.append(container);
    }
}).catch((error) => {
    console.log(error);
});


newAlgorithmForm.addEventListener("submit", function(e) {
    e.preventDefault();

    fetch("/new-algorithm", {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "new-algorithm-name": newAlgorithmName.value,
            "buy-below-price": buyBelowPrice.value,
            "buy-below-stocks": buyBelowStocks.value,
            "sell-below-price": sellBelowPrice.value,
            "sell-below-stocks": sellBelowStocks.value,
            "sell-above-price": sellAbovePrice.value,
            "sell-above-stocks": sellAboveStocks.value
        })
    }).then(response => {
        if (response.status === 401) {
            alert("You must sign in again. Redirecting to login page...");
            setTimeout(function () {
                window.location.href = './';
            }, 500);
            throw new Error(`Unauthorized: ${response.status} - ${response.statusText}`);
        }
        console.log(response);
        location.reload();
    }).catch(error => {
        console.log(error);
    });
});
