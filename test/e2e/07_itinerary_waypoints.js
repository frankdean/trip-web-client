/**
 * @license TRIP - Trip Recording and Itinerary Planning application.
 * (c) 2016, 2017 Frank Dean <frank@fdsd.co.uk>
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

var helper = require('../helper.js');

describe('Itinerary Waypoints', function() {

  var testName = '07_itinerary_waypoints',
      takeScreenshots = browser.privateConfig.takeScreenshots;

  var eleName, elePosition, eleCoordFormat, elePositionFormat, eleAltitude,
      eleSymbol, eleTime, eleComment, eleDescription, eleType, eleColor,
      eleSamples, btnSave, btnCancel, btnReset,
      testItineraryId = 1744,
      EC = protractor.ExpectedConditions;

  beforeEach(function() {
    eleName = element(by.id('input-name'));
    elePosition = element(by.id('input-position'));
    eleCoordFormat = element(by.id('input-coord-format'));
    elePositionFormat = element(by.id('input-position-separator'));
    eleAltitude = element(by.id('input-altitude'));
    eleSymbol = element(by.id('input-symbol'));
    eleTime = element(by.id('input-time'));
    eleComment = element(by.id('input-comment'));
    eleDescription = element(by.id('input-description'));
    eleType = element(by.id('input-type'));
    eleColor = element(by.id('input-color'));
    eleSamples = element(by.id('input-samples'));
    btnSave = element(by.id('btn-save'));
    btnCancel = element(by.id('btn-cancel'));
    btnReset = element(by.id('btn-reset'));
  });

  describe('edit', function() {

    var testWaypointId = 9356;

    beforeEach(function() {
      browser.get(browser.baseUrl + '/itinerary-wpt-edit?itineraryId=929&waypointId=' + testWaypointId);
      browser.wait(EC.visibilityOf(element(by.id('input-name'))), 4000, 'Timeout waiting for edit waypoint page to be displayed');
    });

    it('should not show an error message if the name is blank', function() {
      eleName.clear();
      helper.wait(400);
      btnSave.click();
      helper.wait(400);
      helper.takeScreenshot(testName + '_blank_name', takeScreenshots);
      browser.wait(EC.visibilityOf(element(by.id('heading-tab'))), 4000, 'Timeout waiting for itinerary page to be displayed');
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=\d+/);
    });

    it('should show an error message if the position is blank', function() {
      elePosition.clear();
      helper.wait(400);
      btnSave.click();
      expect(element(by.id('position-required')).isDisplayed()).toBeTruthy();
    });

    it('should show an error message if the position is invalid', function() {
      elePosition.clear();
      elePosition.sendKeys(51);
      helper.wait(400);
      expect(element(by.id('position-invalid')).isDisplayed()).toBeTruthy();
    });

    it('should show an error message if the latitude is less than -90', function() {
      elePosition.clear();
      elePosition.sendKeys('-90.01,180');
      helper.wait(400);
      expect(element(by.id('position-invalid')).isDisplayed()).toBeTruthy();
    });

    it('should show an error message if the latitude is greater than 90', function() {
      elePosition.clear();
      elePosition.sendKeys('90.01,180');
      helper.wait(400);
      expect(element(by.id('position-invalid')).isDisplayed()).toBeTruthy();
    });

    it('should show an error message if the longitude is less than -180', function() {
      elePosition.clear();
      elePosition.sendKeys('90,-180.01');
      helper.wait(400);
      expect(element(by.id('position-invalid')).isDisplayed()).toBeTruthy();
    });

    it('should show an error message if the longitude is greater than 180', function() {
      elePosition.clear();
      elePosition.sendKeys('-90,180.01');
      helper.wait(400);
      expect(element(by.id('position-invalid')).isDisplayed()).toBeTruthy();
    });

    it('should display the position in the default format if the position is valid', function() {
      elePosition.clear();
      elePosition.sendKeys('51.5125,-3.5125');
      helper.wait(400);
      expect(element(by.id('position-text')).getText()).toMatch(/51.30.45.N\s3.30.45.W/);
    });

    it('should not show an error message if the latitude and longitude are -90,-180', function() {
      elePosition.clear();
      elePosition.sendKeys('-90,-180');
      expect(element(by.id('position-invalid')).isDisplayed()).toBeFalsy();
    });

    it('should not show an error message if the latitude and longitude are 90,180', function() {
      elePosition.clear();
      elePosition.sendKeys('90,180');
      expect(element(by.id('position-invalid')).isDisplayed()).toBeFalsy();
    });

    it('should not display an error message if other fields are left blank', function() {
      eleName.clear();
      eleAltitude.clear();
      eleSymbol.sendKeys('-');
      eleComment.clear();
      eleDescription.clear();
      eleSamples.clear();
      eleType.clear();
      eleColor.clear();
      btnSave.click();
      browser.wait(EC.visibilityOf(element(by.id('heading-tab'))), 500, 'Timeout waiting for itinerary page to be displayed');
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=\d+/);
    });

    it('should save valid modifications', function() {
      eleName.clear();
      eleName.sendKeys('Test waypoint modification');
      elePosition.clear();
      elePosition.sendKeys('50,-3');
      eleAltitude.clear();
      eleSymbol.sendKeys('-');
      eleComment.clear();
      eleDescription.clear();
      eleSamples.clear();
      eleType.clear();
      eleColor.clear();
      eleAltitude.sendKeys(450);
      if (browser.privateConfig.browserName.toLowerCase() !== 'XXXfirefox') {
        eleSymbol.$('[value="Flag, Blue"]').click();
      } else {
        eleSymbol.sendKeys('Flag, Blue');
      }
      if (browser.privateConfig.browserName === 'firefox') {
        eleTime.clear();
        eleTime.sendKeys('2015-12-12T10:48:00');
      } else if (browser.privateConfig.browserName === 'safari') {
        eleTime.sendKeys(helper.keySequenceForSafariDateTime('2015', '12', '12', '10', '48'));
      } else {
        // eleTime.clear();
        eleTime.sendKeys(helper.keySequenceForChromeDateTime('2015', '12', '12', '10', '48'));
      }
      eleComment.sendKeys('Test comment');
      eleDescription.sendKeys('Test description');
      eleSamples.sendKeys('99');
      eleType.sendKeys('Restaurant');
      eleColor.sendKeys('#ff0000');
      helper.takeScreenshot(testName + '_save_01', takeScreenshots);
      btnSave.click();
      helper.wait();
      helper.takeScreenshot(testName + '_save_02', takeScreenshots);
      browser.wait(EC.visibilityOf(element(by.id('heading-tab'))), 500, 'Timeout waiting for itinerary page to be displayed');
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=\d+/);
      browser.get(browser.baseUrl + '/itinerary-wpt-edit?itineraryId=929&waypointId=' + testWaypointId);
      helper.wait();
      helper.takeScreenshot(testName + '_save_03', takeScreenshots);
      expect(eleName.getAttribute('value')).toEqual('Test waypoint modification');
      expect(elePosition.getAttribute('value')).toEqual('50,-3');
      expect(eleAltitude.getAttribute('value')).toEqual('450');
      expect(eleSymbol.getAttribute('value')).toEqual('Flag, Blue');
      expect(eleTime.getAttribute('value')).toMatch(/2015-12-12T10:48(:00.000)?/);
      expect(eleComment.getAttribute('value')).toEqual('Test comment');
      expect(eleDescription.getAttribute('value')).toEqual('Test description');
      expect(eleSamples.getAttribute('value')).toEqual('99');
      expect(eleType.getAttribute('value')).toEqual('Restaurant');
      expect(eleColor.getAttribute('value')).toEqual('#ff0000');
    });

    it('should not ask for confirmation before cancelling an unmodified form', function() {
      btnCancel.click();
      element.all((by.css('.confirm-button'))).get(0).click();
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=\d+/);
    });

    it('should ask for confirmation before cancelling a modified form', function() {
      eleName.clear();
      eleName.sendKeys('test');
      btnCancel.click();
      element.all((by.css('.confirm-button'))).get(0).click();
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=\d+/);
    });

    it('should not cancel the edit when confirmation is dismissed', function() {
      eleName.clear();
      eleName.sendKeys('test');
      btnCancel.click();
      element.all((by.css('.cancel-button'))).get(0).click();
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary-wpt-edit\?itineraryId=\d+&waypointId=\d+/);
    });

    it('should not ask for confirmation before resetting an unmodified form', function() {
      btnReset.click();
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary-wpt-edit\?itineraryId=\d+&waypointId=\d+/);
    });

    it('should ask for confirmation before resetting a modified form', function() {
      var nameBefore = eleName.getAttribute('value');
      eleName.clear();
      eleName.sendKeys('test');
      btnReset.click();
      element.all((by.css('.confirm-button'))).get(1).click();
      expect(eleName.getAttribute('value')).toEqual(nameBefore);
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary-wpt-edit\?itineraryId=\d+&waypointId=\d+/);
    });

    it('should not reset the form when confirmation is cancelled', function() {
      eleName.clear();
      eleName.sendKeys('test');
      btnReset.click();
      element.all((by.css('.cancel-button'))).get(1).click();
      expect(eleName.getAttribute('value')).toEqual('test');
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary-wpt-edit\?itineraryId=\d+&waypointId=\d+/);
    });

    it('should show an error message when the samples value is less than one', function() {
      eleSamples.clear();
      eleSamples.sendKeys('0');
      btnSave.click();
      expect(element(by.id('range-error-samples')).isDisplayed()).toBeTruthy();
    });

    it('should show an error message when the samples value is less than one', function() {
      eleSamples.clear();
      eleSamples.sendKeys('0');
      btnSave.click();
      expect(element(by.id('range-error-samples')).isDisplayed()).toBeTruthy();
    });

    it('should show an error message when the samples value is greater than 99,999', function() {
      eleSamples.clear();
      eleSamples.sendKeys('100000');
      btnSave.click();
      expect(element(by.id('range-error-samples')).isDisplayed()).toBeTruthy();
    });

    it('should show an error message when the color value is invalid', function() {
      eleColor.clear();
      eleColor.sendKeys('abcde');
      btnSave.click();
      expect(element(by.id('error-color')).isDisplayed()).toBeTruthy();
    });

  });

  describe('new', function() {

    beforeEach(function() {
      browser.get(browser.baseUrl + '/itinerary-wpt-edit?itineraryId=' + testItineraryId);
    });

    it('the time should default to now', function() {
      expect(eleTime.getAttribute('value')).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}([.,]\d+)?(Z|\+\d{2}:\d{2})?$/);
    });

    it('should show error messages if no details are entered when the form is submitted', function() {
      expect(element(by.id('position-required')).isDisplayed()).toBeFalsy();
      btnSave.click();
      expect(element(by.id('position-required')).isDisplayed()).toBeTruthy();
    });

    it('should create a new waypoint with minimal data', function() {
      eleName.sendKeys('Test new waypoint');
      elePosition.clear();
      elePosition.sendKeys('48.858222,2.2945');
      helper.wait(400);
      btnSave.click();
      browser.wait(EC.visibilityOf(element(by.id('heading-tab'))), 1000, 'Timeout waiting for itinerary page to be displayed');
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=\d+/);
    });

    it('should create a new waypoint with all data', function() {
      eleName.sendKeys('Test new waypoint');
      elePosition.sendKeys('48.858222,2.2945');
      eleAltitude.sendKeys('9000.45');
      eleSymbol.sendKeys('Flag, Blue');
      if (browser.privateConfig.browserName !== 'chrome') {
        eleTime.clear();
        eleTime.sendKeys('2015-12-10T17:48:00');
      } else {
        eleTime.sendKeys('10120020151748');
      }
      eleComment.sendKeys('Test comment');
      eleDescription.sendKeys('Test description');
      eleSamples.sendKeys('99');
      eleType.sendKeys('Restaurant');
      eleColor.sendKeys('#ff0000');
      btnSave.click();
      browser.wait(EC.visibilityOf(element(by.id('heading-tab'))), 1000, 'Timeout waiting for itinerary page to be displayed');
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=\d+/);
    });

  });

  describe('test cleanup', function() {

    beforeEach(function() {
      browser.get(browser.baseUrl + '/itinerary?id=' + testItineraryId);
      element(by.id('features-tab')).click();
      helper.wait(400);
    });

    it('should delete waypoints that were created', function() {
      element(by.id('input-select-all-waypoints')).click();
      element(by.id('edit-pill')).click();
      element(by.id('btn-delete')).click();
      element(by.xpath('/html/body/div[5]/div[2]/div/div[1]/button')).click();
    });

  });

});
