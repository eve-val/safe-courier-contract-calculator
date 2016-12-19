/**
 *  Main rendering function for GET request
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('calc.html');
}

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
      { type: 'Interceptor', value: 100000000, volume: 100 },
      { type: 'T1 Industrial', value: 100000000, volume: 30000 },
      { type: 'Blockade Runner', value: 500000000, volume: 9000 },
      { type: 'Deep Space Transport', value: 500000000, volume: 50000 },
      { type: 'Orca', value: 2000000000, volume: 90000 },
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
    reward: 20000000 // TODO calculate reward based on hauler type and fraction of max cargo
    // reward formula: MAX_REWARD*max(Volume/60,000, collateral/500,000,000)
    // e.g. MAX_REWARD 50M
  };
}

