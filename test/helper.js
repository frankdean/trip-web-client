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
