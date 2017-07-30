(function() {
//add new currencies below
 var config = {
  baseUrl: 'https://coincap.io/sscoins',
  currencies: ['BTC', 'ETH', 'XRP'],
  current_rate: {},
  last_updated: null
};

var lastUpdated, updateRate = 5000;

function timeNow() {
  var d = new Date(),
      h = (d.getHours()<10?'0':'') + d.getHours(),
      m = (d.getMinutes()<10?'0':'') + d.getMinutes(),
      s = (d.getSeconds()<10?'0':'') + d.getSeconds();
  config.last_updated = h + ':' + m + ':' + s;
  console.log('updating time...' + config.last_updated);
  $('#update_ts').text(config.last_updated);
}

function updateBoard() {
  console.log('updateBoard');
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
  $.get(config.baseUrl)
      .done(filterResults);
  update()
}

function update() {
  lastUpdated = Date.now()
  requestAnimationFrame(fetchLatestRates)
}

init()
})();
