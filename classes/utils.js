export function FormatNumber (value) {
    var newValue = value;
    if (value >= 1000) {
        var suffixes = ["", "k", "m", "b","t"];
        var suffixNum = Math.floor(("" + value).length / 3);
        var shortValue = '';
        for (var precision = 1; precision >= 1; precision--) {
            shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000, suffixNum)) : value).toPrecision(precision));
            var dotLessShortValue = (shortValue + '').replace(/[^a-z A-Z 0-9]+/g,'');
            if (dotLessShortValue.length <= 1) { break; }
        }
        if (shortValue % 1 != 0) shortValue = shortValue.toFixed(1);
        newValue = shortValue + suffixes[suffixNum];
    }
    return newValue;
}

export function FormatToMysql(time) {
    return new Date(time).toJSON().slice(0, 19).replace('T', ' ')
}

export function IsSpotifyPlaylist(url) {
    if (url.includes("/playlist/")) return true;
    return false;
}