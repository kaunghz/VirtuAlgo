const Alpaca = require('@alpacahq/alpaca-trade-api')
const API_KEY = 'PKI4VITKPPESG3OD7LKW';
const API_SECRET = 'JXgFjUn6GJdtyFq635qypOKZamshcMZp0SUwyZ4c';
const PAPER = true;
class LongShort {
  constructor(API_KEY, API_SECRET, PAPER){
    this.alpaca = new this.Alpaca({
      keyId: API_KEY, 
      secretKey: API_SECRET, 
      paper: PAPER
    });
    this.allStocks = ['DOMO', 'TLRY', 'SQ', 'MRO', 'AAPL', 'GM', 'SNAP', 'SHOP', 'SPLK', 'BA', 'AMZN', 'SUI', 'SUN', 'TSLA', 'CGC', 'SPWR', 'NIO', 'CAT', 'MSFT', 'PANW', 'OKTA', 'TWTR', 'TM', 'RTN', 'ATVI', 'GS', 'BAC', 'MS', 'TWLO', 'QCOM'];
    // Format the allStocks variable for use in the class.
    var temp = [];
    this.allStocks.forEach((stockName) => {
      temp.push({name: stockName, pc: 0});
    });
    this.allStocks = temp.slice();

    this.long = [];
    this.short = [];
    this.qShort = null;
    this.qLong = null;
    this.adjustedQLong = null;
    this.adjustedQShort = null;
    this.blacklist = new Set();
    this.longAmount = 0;
    this.shortAmount = 0;
    this.timeToClose = null;
  }
}

// Run the LongShort class
var ls = new LongShort(API_KEY, API_SECRET, PAPER);
ls.run();