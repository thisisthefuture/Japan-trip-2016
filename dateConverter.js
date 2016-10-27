var moment = require('moment-timezone');
// var tripStart = moment(new Date('2016-11-01'));
var tripStart = moment(new Date('2016-10-27')); // for testing

// converts the local time to Tokyo time
var japanDate = moment().tz("Asia/Tokyo");

var tripDate = -1;

if (moment().isBefore(tripStart)) {
  var difference = tripStart.diff(moment(), 'days');
  if (difference > 0)
    console.log('t-minus', difference, 'days!');
  else {
    console.log('going to japan today!');
  }
  // console.log('t-minus ', tripStart.subtract(moment()).date().format());
} else if (moment().isSame(tripStart)) {
  tripDate = 0;
  console.log('in Japan!')
} else {
  tripDate = moment().diff(tripStart, 'days');
  console.log('today it is trip day #', tripDate);
}


module.exports.number = tripDate;
