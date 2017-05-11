/**
 *  Main rendering function for GET request
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('calc.html')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

var MAX_REWARD = 50 * 1e6;

/**
 *  Calculate the reward and type of hauler needed for a given value of goods
 *  to haul and volume.
 *
 * TODO: Consider evepraisal or inventory block result.
 * Note, this has difficulty with packaged ship volumes.  Evepraisal always
 * returns the unpacked ship volume, and has no way to differentiate between a
 * packaged or unpackaged ship.  It's unclear how a copy and paste from the EVE
 * inventory would deal with this.
 */
function calculateReward(value, volume) {
  value = parseInt(value.replace(/,/g, ''));
  volume = parseFloat(volume.replace(/,/g, ''));
  // Returns the cheapest, fastest hauler that the cargo fits in
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
      if (value <= hauler.value && volume <= hauler.volume) {
        return hauler.type;
      }
    }
    return "Doesn't even fit in an Orca!";
  };

  // TODO error handling
  return {
    value: value,
    hauler_type: fitsIn(value, volume),
    reward: MAX_REWARD * Math.max(value / (500 * 1e6),
                                  volume / 60000)
  };
}
