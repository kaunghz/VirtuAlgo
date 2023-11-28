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