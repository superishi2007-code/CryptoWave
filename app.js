// =============================================
// app.js - Crypto Watchlist | Milestone 2
// API: CoinLayer (https://coinlayer.com)
// =============================================

// CoinLayer API key
var API_KEY = "af5efca4ba3badf41b6d8d3aa5cf3cf4";

// CoinLayer live endpoint
// NOTE: Free plan only supports http:// (not https)
// Open index.html directly in browser as a local file - it will work fine
var API_URL = "http://api.coinlayer.com/live?access_key=" + API_KEY + "&symbols=BTC,ETH,BNB,XRP,ADA,SOL,DOGE,DOT,LTC,AVAX,MATIC,SHIB,TRX,UNI,ATOM";

// CoinLayer only gives us symbol + price
// So we manually store name and icon for each coin
var coinInfo = {
  BTC:   { name: "Bitcoin",   icon: "https://assets.coincap.io/assets/icons/btc@2x.png" },
  ETH:   { name: "Ethereum",  icon: "https://assets.coincap.io/assets/icons/eth@2x.png" },
  BNB:   { name: "BNB",       icon: "https://assets.coincap.io/assets/icons/bnb@2x.png" },
  XRP:   { name: "XRP",       icon: "https://assets.coincap.io/assets/icons/xrp@2x.png" },
  ADA:   { name: "Cardano",   icon: "https://assets.coincap.io/assets/icons/ada@2x.png" },
  SOL:   { name: "Solana",    icon: "https://assets.coincap.io/assets/icons/sol@2x.png" },
  DOGE:  { name: "Dogecoin",  icon: "https://assets.coincap.io/assets/icons/doge@2x.png" },
  DOT:   { name: "Polkadot",  icon: "https://assets.coincap.io/assets/icons/dot@2x.png" },
  LTC:   { name: "Litecoin",  icon: "https://assets.coincap.io/assets/icons/ltc@2x.png" },
  AVAX:  { name: "Avalanche", icon: "https://assets.coincap.io/assets/icons/avax@2x.png" },
  MATIC: { name: "Polygon",   icon: "https://assets.coincap.io/assets/icons/matic@2x.png" },
  SHIB:  { name: "Shiba Inu", icon: "https://assets.coincap.io/assets/icons/shib@2x.png" },
  TRX:   { name: "TRON",      icon: "https://assets.coincap.io/assets/icons/trx@2x.png" },
  UNI:   { name: "Uniswap",   icon: "https://assets.coincap.io/assets/icons/uni@2x.png" },
  ATOM:  { name: "Cosmos",    icon: "https://assets.coincap.io/assets/icons/atom@2x.png" },
};

// Getting the HTML elements we need
var loadingDiv     = document.getElementById("loading");
var coinsContainer = document.getElementById("coins-container");
var errorMessage   = document.getElementById("error-message");


// =============================================
// FUNCTION: fetchCoins
// Calls CoinLayer API and shows the data
// =============================================
function fetchCoins() {

  // Show loading, hide everything else
  loadingDiv.classList.remove("hidden");
  coinsContainer.classList.add("hidden");
  errorMessage.classList.add("hidden");
  coinsContainer.innerHTML = "";

  // Make the API call using fetch()
  fetch(API_URL)
    .then(function(response) {

      // Check if response is okay
      if (!response.ok) {
        throw new Error("Network error: " + response.status);
      }

      // Convert to JSON
      return response.json();

    })
    .then(function(data) {

      // CoinLayer returns: { success: true, rates: { BTC: 45000, ETH: 3000, ... } }
      // First check if the API returned success: true
      if (!data.success) {
        throw new Error("API error: " + data.error.info);
      }

      // Hide loading spinner
      loadingDiv.classList.add("hidden");

      // Show the coins section
      coinsContainer.classList.remove("hidden");

      // data.rates is an object: { BTC: 45000.12, ETH: 2800.55, ... }
      // We loop through each key (symbol) using for...in
      var rates = data.rates;

      for (var symbol in rates) {

        // Get the price for this coin
        var price = rates[symbol];

        // Get extra info (name, icon) from our lookup object above
        var info = coinInfo[symbol];

        // If we don't have info for this coin, skip it
        if (!info) {
          continue;
        }

        // Create the card and add it to the page
        var card = createCoinCard(symbol, price, info);
        coinsContainer.appendChild(card);
      }

    })
    .catch(function(error) {

      // Something went wrong - show the error section
      console.log("Error fetching data:", error);

      loadingDiv.classList.add("hidden");
      errorMessage.classList.remove("hidden");

    });
}


// =============================================
// FUNCTION: createCoinCard
// symbol = "BTC"
// price  = 45000.23
// info   = { name: "Bitcoin", icon: "url..." }
// Returns a card div element
// =============================================
function createCoinCard(symbol, price, info) {

  var card = document.createElement("div");
  card.classList.add("coin-card");

  // Format the price nicely
  var formattedPrice = formatPrice(price);

  // Build the card HTML using template literals
  card.innerHTML = `
    <div class="coin-header">
      <img src="${info.icon}" alt="${info.name}" onerror="this.src='https://placehold.co/40x40'" />
      <div>
        <div class="coin-name">${info.name}</div>
        <div class="coin-symbol">${symbol}</div>
      </div>
    </div>

    <div class="coin-price">${formattedPrice}</div>

    <div class="coin-info">
      <span>
        <span class="info-label">Currency</span>
        <span class="info-value">USD</span>
      </span>
      <span>
        <span class="info-label">Source</span>
        <span class="info-value">CoinLayer</span>
      </span>
    </div>
  `;

  return card;
}


// =============================================
// FUNCTION: formatPrice
// Makes prices look readable
// BTC = $45,000.23  |  SHIB = $0.00001234
// =============================================
function formatPrice(price) {

  if (price >= 1) {
    // Normal coins like BTC, ETH - show 2 decimal places
    return "$" + price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  } else if (price >= 0.01) {
    // Mid-range small coins - show 4 decimal places
    return "$" + price.toFixed(4);

  } else {
    // Very small coins like SHIB - show 8 decimal places
    return "$" + price.toFixed(8);
  }
}


// =============================================
// START: Call fetchCoins when page loads
// =============================================
fetchCoins();
