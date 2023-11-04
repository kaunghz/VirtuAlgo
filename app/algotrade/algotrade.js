let newAlgorithmForm = document.getElementById("new-algorithm-form");

let newAlgorithmName = document.getElementById("new-name");
let buyBelowPrice = document.getElementById("buy-below-price");
let buyBelowStocks = document.getElementById("buy-below-stocks");
let sellBelowPrice = document.getElementById("sell-below-price");
let sellBelowStocks = document.getElementById("sell-below-stocks");
let sellAbovePrice = document.getElementById("sell-above-price");
let sellAboveStocks = document.getElementById("sell-above-stocks");


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
        console.log(response);
    }).catch(error => {
        console.log(error);
    });
});
