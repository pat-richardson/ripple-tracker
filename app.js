(function() {
  /**
   * Main application config
   * Add currencies to track to config.currencies
   */
  var envWalletAddress = process.env.RIPPLE_WALLET || '';
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

  /**
   * Code for updating ticker
   */
  var lastUpdated, updateRate = 5000;

  function timeNow() {
    var d = new Date(),
        h = (d.getHours()<10?'0':'') + d.getHours(),
        m = (d.getMinutes()<10?'0':'') + d.getMinutes(),
        s = (d.getSeconds()<10?'0':'') + d.getSeconds();
    config.last_updated = h + ':' + m + ':' + s;
    $('#update_ts').text(config.last_updated);
  }
  //uppdate currency ticker
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

  //create currency rate object
  function createRate(values) {
    return {
      name: values.long,
      price: values.price,
      trend: values.cap24hrChange
    };
  }

  //loop through results and update currency data
  function updateCurrencyData(filteredData) {
    for(var i = 0; i < filteredData.length; i++) {
      var crypto = filteredData[i].short;
      config.current_rate[crypto] = createRate(filteredData[i]);
    }
    timeNow();
    updateBoard();
  }

  //filter api results and keep currencies set in config
  function filterResults(data) {
    var results = data.filter(function(item) {
      return config.currencies.indexOf(item.short.toUpperCase()) > -1;
    });
    updateCurrencyData(results);
  }

  //request latest currency values from api
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

  //maintain update interval even when window is not in focus
  function update() {
    lastUpdated = Date.now()
    requestAnimationFrame(fetchLatestRates)
  }

  /**
   * Code for updating wallet
   */
  //add 2 values
  function add(a,b) {
    return parseInt(a) + parseInt(b);
  }

  //format api amounts to correct decimal point
  function formatZerps(total) {
    return parseFloat(total) / 1e6;
  }

  //display XRP total and value
  function showZerpsStats() {
    $('.hide-element').toggleClass();
  }

  //hide or show ripple form controls when clicked
  function hideControls() {
    $('.wallet-controls').toggleClass('hide-element');
  }

  //extract transaction data from ripple api and update wallet
  function extractTransactionsFromWalletResponse(data) {
    var count = data.count;
    var zerpTotal = data.transactions.map(function(el,index,array) {
      if(el.hasOwnProperty('tx')) {
        if(el.tx.TransactionType === 'Payment' && Object.prototype.toString.call(el.tx.Amount) === '[object String]') {
          return el.tx.Amount;
        }  
      }
    }).filter(function(el,i,a) {
      return el !== undefined;
    }).reduce(add);
    config.wallet.amount = formatZerps(zerpTotal); 
    showZerpsStats();
  }

  //request total XRP for ripple address from api
  function getWalletData() {
    if(config.wallet.address !== null) {
      var url = config.ripple_url.replace('PLACEHOLDER', config.wallet.address);
      $.get(url)
        .done(extractTransactionsFromWalletResponse);
    }
  }

  //update application config with input ripple address
  function setWalletAddress() {
    var userAddress = $('#wallet-address').val() || '';
    var walletAddress = userAddress !== '' ? userAddress : envWalletAddress;

    if(walletAddress !== '') {
      $('#wallet-address').val('');
      config.wallet.address = walletAddress;
      getWalletData();
    } else {
      alert('please enter a valid address');
    }
  }

  //update ripple value display with amount owned * latest valuation
  function updateRippleNetworth() {
    if(config.wallet.address !== null) {
      config.wallet.value = '$' + parseFloat((config.current_rate.XRP.price * config.wallet.amount).toFixed(2));
      $('#xrp_total').text(config.wallet.amount);
      $('#xrp_value').text(config.wallet.value);
    }
  }

  /**
   * Start application
   */

  //add event listeners and fetch initial results
  function init() {
    document.querySelector('#wallet-btn').addEventListener('click', setWalletAddress);
    document.querySelector('#hide-btn').addEventListener('click', hideControls);
    //set wallet to env address if saved
    if(envWalletAddress !== '') {
      setWalletAddress();
    }

    $.get(config.baseUrl)
        .done(filterResults);
    update();
  }

  init();
})();
