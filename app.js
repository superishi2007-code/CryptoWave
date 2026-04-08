
// ---- API Setup ----
var API_KEY = "af5efca4ba3badf41b6d8d3aa5cf3cf4";
var API_URL = "http://api.coinlayer.com/live?access_key=" + API_KEY + "&symbols=BTC,ETH,BNB,XRP,ADA,SOL,DOGE,DOT,LTC,AVAX,MATIC,SHIB,TRX,UNI,ATOM";
 
 
// ---- Coin name and icon lookup ----
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
 
 
// ---- Global Variables ----
var allCoins  = [];    // all fetched coins stored here as an array of objects
var favorites = [];    // stores symbols of favorited coins e.g. ["BTC", "ETH"]
var isDarkMode = true; // page starts in dark mode
 
 
// ---- Get HTML elements ----
var loadingDiv     = document.getElementById("loading");
var coinsContainer = document.getElementById("coins-container");
var errorMessage   = document.getElementById("error-message");
 
 
// =============================================
// FUNCTION: fetchCoins
// Calls CoinLayer API and stores data
// =============================================
function fetchCoins() {
 
  // Show loading, hide everything else
  loadingDiv.classList.remove("hidden");
  coinsContainer.classList.add("hidden");
  errorMessage.classList.add("hidden");
  coinsContainer.innerHTML = "";
 
  fetch(API_URL)
    .then(function(response) {
      if (!response.ok) {
        throw new Error("Network error: " + response.status);
      }
      return response.json();
    })
    .then(function(data) {
 
      if (!data.success) {
        throw new Error("API error: " + data.error.info);
      }
 
      // Convert the rates object { BTC: 45000, ETH: 3000 }
      // into an ARRAY of objects so we can use HOFs on it
      // [ { symbol: "BTC", price: 45000, name: "Bitcoin", icon: "..." }, ... ]
      var rates = data.rates;
 
      allCoins = Object.keys(rates)
        .filter(function(symbol) {
          return coinInfo[symbol]; // only keep coins we have info for
        })
        .map(function(symbol) {
          return {
            symbol: symbol,
            price:  rates[symbol],
            name:   coinInfo[symbol].name,
            icon:   coinInfo[symbol].icon
          };
        });
 
      loadingDiv.classList.add("hidden");
      coinsContainer.classList.remove("hidden");
 
      applyAll(); // display coins after fetching
 
    })
    .catch(function(error) {
      console.log("Error fetching data:", error);
      loadingDiv.classList.add("hidden");
      errorMessage.classList.remove("hidden");
    });
}
 
 
// =============================================
// FUNCTION: applyAll
// Runs Search + Filter + Sort together
// Called every time user types or changes a dropdown
// =============================================
function applyAll() {
 
  // Read current values from the controls
  var searchText  = document.getElementById("search-input").value.toLowerCase();
  var filterValue = document.getElementById("filter-select").value;
  var sortValue   = document.getElementById("sort-select").value;
 
 
  // -------------------------------------------
  // HOF 1: .filter() — SEARCH
  // Keep coins where name OR symbol matches what user typed
  // -------------------------------------------
  var result = allCoins.filter(function(coin) {
    return coin.name.toLowerCase().includes(searchText) ||
           coin.symbol.toLowerCase().includes(searchText);
  });
 
 
  // -------------------------------------------
  // HOF 2: .filter() — FILTER BY PRICE RANGE
  // -------------------------------------------
  if (filterValue === "high") {
    // Only coins priced above $100
    result = result.filter(function(coin) {
      return coin.price >= 100;
    });
 
  } else if (filterValue === "mid") {
    // Coins between $1 and $100
    result = result.filter(function(coin) {
      return coin.price >= 1 && coin.price < 100;
    });
 
  } else if (filterValue === "low") {
    // Coins below $1 (small coins like SHIB, DOGE)
    result = result.filter(function(coin) {
      return coin.price < 1;
    });
 
  } else if (filterValue === "favorites") {
    // Only show favorited coins
    result = result.filter(function(coin) {
      return favorites.includes(coin.symbol);
    });
  }
  // if filterValue === "all", no filter needed
 
 
  // -------------------------------------------
  // HOF 3: .sort() — SORT
  // .sort() compares two coins (a and b)
  // Negative = a comes first | Positive = b comes first
  // -------------------------------------------
  if (sortValue === "price-high") {
    result = result.sort(function(a, b) {
      return b.price - a.price; // highest price first
    });
 
  } else if (sortValue === "price-low") {
    result = result.sort(function(a, b) {
      return a.price - b.price; // lowest price first
    });
 
  } else if (sortValue === "name-az") {
    result = result.sort(function(a, b) {
      return a.name.localeCompare(b.name); // A to Z
    });
 
  } else if (sortValue === "name-za") {
    result = result.sort(function(a, b) {
      return b.name.localeCompare(a.name); // Z to A
    });
  }
  // Default order = the order they came from the API
 
 
  // Show the final result
  displayCoins(result);
}
 
 
// =============================================
// FUNCTION: displayCoins
// Uses .map() to build HTML cards for each coin
// =============================================
function displayCoins(coins) {
 
  // No results case
  if (coins.length === 0) {
    coinsContainer.innerHTML = "<p class='no-results'>No coins found. Try a different search!</p>";
    return;
  }
 
  // -------------------------------------------
  // HOF 4: .map() — Build one HTML string per coin
  // .join("") glues all strings into one
  // -------------------------------------------
  var htmlCards = coins.map(function(coin) {
 
    // Is this coin in favorites?
    var isFav    = favorites.includes(coin.symbol);
    var favClass = isFav ? "fav-btn active" : "fav-btn";
    var favIcon  = isFav ? "★" : "☆";
 
    // Format the price nicely
    var formattedPrice = formatPrice(coin.price);
 
    return `
      <div class="coin-card">
 
        <button class="${favClass}" onclick="toggleFavorite('${coin.symbol}')">
          ${favIcon} Favorite
        </button>
 
        <div class="coin-header">
          <img src="${coin.icon}" alt="${coin.name}" onerror="this.src='https://placehold.co/40x40'" />
          <div>
            <div class="coin-name">${coin.name}</div>
            <div class="coin-symbol">${coin.symbol}</div>
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
 
      </div>
    `;
  }).join("");
 
  coinsContainer.innerHTML = htmlCards;
}
 
 
// =============================================
// FUNCTION: toggleFavorite
// Adds or removes a coin from favorites array
// =============================================
function toggleFavorite(symbol) {
 
  if (favorites.includes(symbol)) {
    // Already favorited → REMOVE it using .filter()
    favorites = favorites.filter(function(s) {
      return s !== symbol;
    });
  } else {
    // Not favorited → ADD it
    favorites.push(symbol);
  }
 
  applyAll(); // re-render so the star button updates
}
 
 
// =============================================
// FUNCTION: toggleTheme
// Switches between dark and light mode
// =============================================
function toggleTheme() {
  isDarkMode = !isDarkMode; // flip: true → false → true
 
  var btn = document.getElementById("theme-btn");
 
  if (isDarkMode) {
    document.body.classList.remove("light-mode");
    btn.textContent = "☀️ Light Mode";
  } else {
    document.body.classList.add("light-mode");
    btn.textContent = "🌙 Dark Mode";
  }
}
 
 
// =============================================
// FUNCTION: formatPrice
// Makes prices look readable
// BTC = $45,000.23  |  SHIB = $0.00001234
// =============================================
function formatPrice(price) {
 
  if (price >= 1) {
    return "$" + price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else if (price >= 0.01) {
    return "$" + price.toFixed(4);
  } else {
    return "$" + price.toFixed(8);
  }
}
 
 
// =============================================
// START: Fetch coins when page loads
// =============================================
fetchCoins();
