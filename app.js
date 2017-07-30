(function() {
//add new currencies below
 var config = {
  baseUrl: 'https://coincap.io/sscoins',
  ripple_url: 'https://data.ripple.com/v2/accounts/PLACEHOLDER/transactions?&limit=15&descending=true',
  currencies: ['BTC', 'ETH', 'XRP'],
  current_rate: {},
  last_updated: null,
  wallet: {
    address: null,
    amount: 0,
    value: 0
  }
};

var lastUpdated, updateRate = 5000;

function timeNow() {
  var d = new Date(),
      h = (d.getHours()<10?'0':'') + d.getHours(),
      m = (d.getMinutes()<10?'0':'') + d.getMinutes(),
      s = (d.getSeconds()<10?'0':'') + d.getSeconds();
  config.last_updated = h + ':' + m + ':' + s;
  $('#update_ts').text(config.last_updated);
}

function updateBoard() {
  var list = $('<ul/>');
  for(var i = 0; i < config.currencies.length; i++) {
    var key = config.currencies[i];    
    var listItem = $('<li/>');
    var textItem = $('<p>')
          .text(config.current_rate[key].name + ': $' + config.current_rate[key].price + ' ('+config.current_rate[key].trend +'%)')
          .appendTo(listItem);
    $(listItem).appendTo(list);
  }
  $('.market-watch-board').html(list);
  updateRippleNetworth();
}

function log() {
  updateBoard();
}

function createRate(values) {
  return {
    name: values.long,
    price: values.price,
    trend: values.cap24hrChange
  };
}

function showResults(filteredData) {
  for(var i = 0; i < filteredData.length; i++) {
    var crypto = filteredData[i].short;
    config.current_rate[crypto] = createRate(filteredData[i]);
  }
  timeNow();
  log();
}

function filterResults(data) {
  var results = data.filter(function(item) {
    return config.currencies.indexOf(item.short.toUpperCase()) > -1;
  });
  showResults(results);
}

function fetchLatestRates() {
  var elapsedTime = Date.now() - lastUpdated;
  var playback = elapsedTime / updateRate;
  if(playback < 0 || playback > 1) {
    $.get(config.baseUrl)
      .done(filterResults);
    update();
  }
  else {
    requestAnimationFrame(fetchLatestRates);    
  }
}

function init() {
  document.querySelector('#wallet-btn').addEventListener('click', setWalletAddress);
  document.querySelector('#hide-btn').addEventListener('click', hideControls);
  $.get(config.baseUrl)
      .done(filterResults);
  update()
}

function update() {
  lastUpdated = Date.now()
  requestAnimationFrame(fetchLatestRates)
}

/**
 * Code for updating wallet
 */

function add(a,b) {
  return parseInt(a) + parseInt(b);
}

function formatZerps(total) {
  return parseFloat(total) / 1e6;
}

function showZerpsStats() {
  $('.hide-element').toggleClass();
}

function hideControls() {
  $('.wallet-controls').toggleClass('hide-element');
}

function extractTransactionsFromWalletResponse(data) {
  var count = data.count;
  var zerpTotal = data.transactions.map(function(el,index,array) {
    if(el.hasOwnProperty('tx')) {
          return el.tx.Amount; 
    }
  }).filter(function(el,i,a) {
    return el !== undefined;
  }).reduce(add);
  config.wallet.amount = formatZerps(zerpTotal); 
  showZerpsStats();
}

function getWalletData() {
  if(config.wallet.address !== null) {
    var url = config.ripple_url.replace('PLACEHOLDER', config.wallet.address);
    $.get(url)
      .done(extractTransactionsFromWalletResponse);
  }
}

function setWalletAddress() {
  var userAddress = $('#wallet-address').val();
  if(userAddress !== '') {
    $('#wallet-address').val('');
    config.wallet.address = userAddress;
    getWalletData();
  } else {
    alert('please enter a valid address');
  }
}

function updateRippleNetworth() {
  if(config.wallet.address !== null) {
    config.wallet.value = '$' + parseFloat((config.current_rate.XRP.price * config.wallet.amount).toFixed(2));
    $('#xrp_total').text(config.wallet.amount);
    $('#xrp_value').text(config.wallet.value);
  }
}

/**
 * End code for updating wallet
 */

$(function() {
  init()
});
})();
