/**
 * @license TRIP - Trip Recording and Itinerary Planning application.
 * (c) 2016-2020 Frank Dean <frank@fdsd.co.uk>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
'use strict';

var fs = require('fs');

module.exports = {
  keySequenceForChromeDate: keySequenceForChromeDate,
  keySequenceForChromeDateTime: keySequenceForChromeDateTime,
  wait: wait,
  takeScreenshot: takeScreenshot
}

function wait(time = 400) {
  if (browser.privateConfig.browserName.toLowerCase() == 'safari') {
    browser.sleep(time);
  }
}

function writeScreenshot(png, name, takeshot = true, separator = '_') {
  var filename = browser.privateConfig.browserName.toLowerCase() + separator + name + '.png',
      stream = fs.createWriteStream(filename);
  stream.write(new Buffer.from(png, 'base64'));
  stream.end();
}

function takeScreenshot(name, takeshot = browser.privateConfig.takeScreenshots, separator = '_') {
  if (takeshot) {
    browser.takeScreenshot().then(function(png) {
      writeScreenshot(png, name, separator);
    });
  }
}

const mdyRegexCountries = '^.*_(AS|FM|GU|KY|MH|MP|PA|PH|PR|TG|UM|US|VI)';
const ymdRegexCountries = '^.*_(BT|CA|CN|GH|HU|JP|KE|KP|KR|LT|MN|TW)';
const non24hourRegexCountries = '^.*_(AS|FM|GU|KY|MH|MP|PA|PH|PR|TG|UM|US|VI)';

/**
 * Converts a date into a string sequence, appropriate to input as a
 * date using element.sendKeys for the current browser and user
 * language settings.
 *
 * Note: this implementation makes assumptions about the format required
 * in the browser and has not been validated for all languages.  It will
 * need updating on a case-by-case basis where the implementation is
 * incorrect.
 *
 * @param {string} day the day of the month
 * @param {string} month the day of the month
 * @param {string} year the day of the month
 */
function keySequenceForChromeDate(year, month, day) {
  var mdy = new RegExp(mdyRegexCountries);
  var ymd = new RegExp(ymdRegexCountries);
  if (process.env.LANG == null || mdy.test(process.env.LANG)) {
    return month.padStart(2, '0') + day.padStart(2, '0') + year;
  } else if (ymd.test(process.env.LANG)) {
    return year + month.padStart(2, '0') + day.padStart(2, '0');
  } else {
    return day.padStart(2, '0') + month.padStart(2, '0') + year;
  }
}

/**
 * Converts a date and time into a string sequence, appropriate to input as a
 * date using element.sendKeys for the current browser and user
 * language settings.
 *
 * Note: this implementation makes assumptions about the format required
 * in the browser and has not been validated for all languages.  It will
 * need updating on a case-by-case basis where the implementation is
 * incorrect.
 *
 * @param {string} day the day of the month
 * @param {string} month the day of the month
 * @param {string} year the day of the month
 * @param {string) hour the hour of the day
 * @param {string) minute the minute of the hour
 * @param {string) second the second of the minute
 */
function keySequenceForChromeDateTime(year, month, day, hour, minute, second) {
  var am = true,
      h = Number(hour),
      h12 = h;

  var h12Regex = new RegExp(non24hourRegexCountries);

  var retval = keySequenceForChromeDate(year, month, day, hour);
  if (process.env.LANG == null || h12Regex.test(process.env.LANG)) {
    if (h >= 12) {
      am = false;
      if (h > 12) {
        h12 = h - 12;
      } else {
        h12 = h;
      }
    }
    retval += '\t' + h12.toString().padStart(2, '0') + minute.padStart(2, '0');
    if (second != null) {
      retval += second.padStart(2, 0);
    }
    retval += (am ? 'am' : 'pm');
  } else {
    retval += '\t' + hour.padStart(2, 0) + minute.padStart(2, '0');
    if (second != null) {
      retval += second;
    }
  }
  return retval;
}
