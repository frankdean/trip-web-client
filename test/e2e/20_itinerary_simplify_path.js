/**
 * @license TRIP - Trip Recording and Itinerary Planning application.
 * (c) 2016-2021 Frank Dean <frank@fdsd.co.uk>
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

describe('Simplify itinerary track', function() {

  var testName = '20_itinerary_simplify_path_',
      takeScreenshots = browser.privateConfig.takeScreenshots,
      EC = protractor.ExpectedConditions;

  var testItineraryId = 2425,
      testTrackId_01 = 1027,
      testTrackId_02 = 1028,
      testSharedItineraryId = 983,
      testSharedTrackId = 1025;

  describe('owned itinerary', function() {

    beforeEach(function() {
      browser.get(browser.baseUrl + '/itinerary-simplify-path?itineraryId=' + testItineraryId + '&trackId=' + testTrackId_01);
      browser.wait(EC.visibilityOf(element(by.id('btn-cancel'))), 4000, 'Timeout waiting for itinerary track edit page to be displayed');
    });

    it('should show the screen', function() {
      expect(element(by.id('track-name')).getText()).toMatch(/Name:\s*Test track 01/);
      expect(element(by.id('original-points')).getText()).toMatch(/Original points:\s*23/);
      expect(element(by.id('current-points')).getText()).toMatch(/Current points:\s*23/);
      helper.takeScreenshot(testName + 'show_track' , takeScreenshots);
    });

    it('should reduce the number of points', function() {
      expect(element(by.id('track-name')).getText()).toMatch(/Name:\s*Test track 01/);
      expect(element(by.id('original-points')).getText()).toMatch(/Original points:\s*23/);
      expect(element(by.id('current-points')).getText()).toMatch(/Current points:\s*23/);
      browser.actions().dragAndDrop(
        element(by.id('tolerance')),
        {x: 400, y:0}
      ).perform();
      helper.takeScreenshot(testName + 'simplify_track' , takeScreenshots);
      expect(element(by.id('original-points')).getText()).toMatch(/Original points:\s*23/);
      // Firefox and Chrome give different results.  Just check that it is less than 20.
      expect(element(by.id('current-points')).getText()).toMatch(/Current points:\s*(0|1)\d/);
    });

    it('should save the track', function() {
      element(by.id('btn-save')).click();
      browser.sleep(200);
      helper.takeScreenshot(testName + 'save_track' , takeScreenshots);
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=\d+/);
    });

    it('should cancel changes', function() {
      element(by.id('btn-cancel')).click();
      helper.wait();
      element(by.xpath('/html/body/div[2]/div[2]/div/div[1]/button')).click();
      browser.sleep(200);
      helper.takeScreenshot(testName + 'cancel' , takeScreenshots);
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=\d+/);
    });

    describe('Cleanup', function() {

      beforeEach(function() {
        browser.get(browser.baseUrl + '/itinerary?id=' + testItineraryId);
        browser.wait(EC.visibilityOf(element(by.id('features-tab'))), 4000, 'Timeout waiting for features tab to be displayed');
        element(by.id('features-tab')).click();
        helper.wait(400);
      });

      it('should remove tracks we created during testing', function() {
        element(by.id('input-select-all-tracks')).click();
        element(by.id('input-track-' + testTrackId_01)).click();
        element(by.id('input-track-' + testTrackId_02)).click();
        element(by.id('edit-pill')).click();
        helper.wait();
        element(by.id('btn-delete')).click();
        helper.wait();
        // The confirmation to delete button
        element(by.xpath('/html/body/div[5]/div[2]/div/div[1]/button')).click();
        browser.sleep(100);
        helper.takeScreenshot(testName + 'cleanup' , takeScreenshots);
      });

    });

  });

});
