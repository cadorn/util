
function dump(obj) { print(require('test/jsdump').jsDump.parse(obj)) };

var MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];


/**
 * 1 = January
 */
exports.monthStringForNumeric = function(number) {
    number = number*10/10;
    if(number<1 || number > 12) {
        throw new Error("Month number out of range (1-12): " + number);
    }
    return MONTHS[number-1];
}
