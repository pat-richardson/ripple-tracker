(function() {

    var config = {
    currencies: ['BTC', 'ETH', 'XRP'],
    current_rate: {},
    last_updated: null
    };

    function timeNow() {
    var d = new Date(),
        h = (d.getHours()<10?'0':'') + d.getHours(),
        m = (d.getMinutes()<10?'0':'') + d.getMinutes();
    config.last_updated = h + ':' + m;
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
    console.log('updating...');
    $.get('https://coincap.io/sscoins')
    .done(filterResults);
    }

    function init() {
    fetchLatestRates();
    setTimeout(fetchLatestRates, 60000);
    }

    init();

})();