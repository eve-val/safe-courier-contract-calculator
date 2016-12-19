/**
 *  Main rendering function for GET request
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('calc.html');
}

var MAX_REWARD = 50 * 1e6;

/**
 *  Calculate the value, volume, reward, and type of hauler for a given
 *  inventory block represented by an evepraisal URL.
 */
function calculateReward(evepraisal_url) {
  var json = UrlFetchApp.fetch(evepraisal_url + '.json');
  var evepraisal = JSON.parse(json);

  // Returns the cheapest, fastest hauler that the cargo fits in
  //
  // TODO(wfurr): This does not handle packaged ship volumes correctly.
  // Evepraisal always reports unpackaged volume, and there's no way to
  // differentiate.  Will have to investigate in-game inventory copypasta for
  // determining packaged vs unpacked volume.  This may require a different
  // input UI than evepraisal links.
  //
  var fitsIn = function(value, volume) {
    var hauler_limits = [ // Ordered by value and volume from least to greatest
      { type: 'Interceptor',          value:  100 * 1e6, volume: 100 },
      { type: 'T1 Industrial',        value:  100 * 1e6, volume: 30000 },
      { type: 'Blockade Runner',      value:  500 * 1e6, volume: 9000 },
      { type: 'Deep Space Transport', value:  500 * 1e6, volume: 55000 },
      { type: 'Orca',                 value: 2000 * 1e6, volume: 90000 },
    ];
    for (var i = 0; i < hauler_limits.length; i++) {
      var hauler = hauler_limits[i];
      if (value < hauler.value && volume < hauler.volume) {
        return hauler.type;
      }
    }
    return "Doesn't even fit in an Orca!";
  };

  // TODO error handling
  return {
    value: evepraisal.totals.sell,
    volume: evepraisal.totals.volume,
    hauler_type: fitsIn(evepraisal.totals.sell, evepraisal.totals.volume),
    reward: MAX_REWARD * Math.max(evepraisal.totals.volume / 60000,
                                  evepraisal.totals.sell / (500 * 1e6))
  };
}
