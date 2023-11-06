const Alpaca = require("@alpacahq/alpaca-trade-api");

let apiFile = require("../env.json");
const apiKey = apiFile["alpaca_api"];
const apiSecret = apiFile["alpaca_secret"];
const alpaca = new Alpaca({ keyId: apiKey, secretKey: apiSecret, paper: true });
const symbol = 'AAPL';


// We have to test it in real time market data time, the code has bugs
// Function to update the HTML elements
function updateRealTimeData(message) {
  if (message.T === symbol) {
    document.getElementById('symbol').textContent = message.T;
    document.getElementById('lastPrice').textContent = message.p;
  }
}

alpaca.websocket.onConnect(() => {
  alpaca.websocket.subscribe(['trade_updates', `T.${symbol}`]);
});

alpaca.websocket.onStockTradeUpdate(updateRealTimeData);

alpaca.websocket.connect();
