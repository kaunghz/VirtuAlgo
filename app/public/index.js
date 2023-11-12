// add code
let stockSearch = document.getElementById("stockSearch");
let stockSearchButton = document.getElementById("stockSearchButton");

stockSearchButton.addEventListener("click", () => {
    let ticker = stockSearch.value;

    fetch(
        `/alpaca/market/${ticker}`
    ).then((response) => {
        return response.json();
    }).then((response) => {
        console.log(response);
    }).catch((error) => {
        console.log(error);
    })
});