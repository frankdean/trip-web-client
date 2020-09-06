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

describe('itinerary sharing', function() {
  var EC = protractor.ExpectedConditions;
  // Just needs to be the ID of an existing itinerary that we will modify
  var testItineraryId = 929;

  var testName = '05_itinerary_sharing',
      takeScreenshots = browser.privateConfig.takeScreenshots;

  beforeEach(function() {
    browser.get(browser.baseUrl + '/itinerary-sharing?id=' + testItineraryId);
  });

  describe('create itinerary shares', function() {
    var list = element.all(by.repeater('share in shares.payload'));

    describe('should create itinerary shares', function() {

      beforeEach(function() {
        // Click the new button if it is displayed
        element(by.id('btn-new')).isDisplayed().then(function(isDisplaying) {
          if (isDisplaying) {
            element(by.id('btn-new')).click();
          }
        });
      });

      it('should save a share for an existing nickname', function() {
        element(by.id('input-nickname')).sendKeys('admin');
        element(by.id('input-active')).click();
        element(by.id('btn-save')).click();
        expect(browser.getCurrentUrl()).toMatch(/\/itinerary-sharing\?id=\d+/);
      });

      it('should save another share for an existing nickname', function() {
        element(by.id('input-nickname')).sendKeys('Adam');
        element(by.id('input-active')).click();
        element(by.id('btn-save')).click();
      });

      it('should show an error when nickname is empty', function() {
        element(by.id('btn-save')).click();
        expect(element(by.id('error-nickname-required')).isDisplayed()).toBeTruthy();
      });

      it('should show an error when the nickname does not exist', function() {
        element(by.id('input-nickname')).sendKeys('This nickname should not exist');
        element(by.id('btn-save')).click();
        if (browser.privateConfig.browserName.toLowerCase() == 'safari') {
          browser.sleep(400);
        }
        expect(element(by.id('error-invalid-nickname')).isDisplayed()).toBeTruthy();
      });

    });

    describe('Back button', function() {

      it('should not display the "itinerary" button', function() {
        expect(element(by.id('btn-show-itinerary')).isDisplayed()).toBeFalsy();
      });

      it('should show the itinerary list when the close/back button is clicked', function() {
        element(by.id('btn-close')).click();
        expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=\d+/);
      });

    });

    describe('select all operations', function() {
      var selectAllShares, screenshotCounter = 0;

      beforeEach(function() {
        browser.sleep(400);
        selectAllShares = element(by.id('input-select-all'));
        browser.wait(EC.visibilityOf(selectAllShares), 4000);
        helper.takeScreenshot(testName + '_select_all_shares_' + ('0000' + ++screenshotCounter).substr(-4, 4), takeScreenshots);
        element(by.id('input-select-all')).click();
        if (browser.privateConfig.browserName.toLowerCase() == 'safari') {
          browser.sleep(400);
        }
      });

      it('should de-activate all shares', function() {
        helper.takeScreenshot(testName + '_before_deactivate_click', takeScreenshots);
        element(by.id('btn-deactivate')).click();
        if (browser.privateConfig.browserName.toLowerCase() == 'safari') {
          browser.sleep(400);
        }
        helper.takeScreenshot(testName + '_after_deactivate_click', takeScreenshots);
        expect(list.first().all(by.tagName('td')).get(1).getText()).toMatch('');
      });

      it('should activate all shares', function() {
        element(by.id('btn-activate')).click();
        browser.sleep(400);
        helper.takeScreenshot(testName + '_before_activate_click', takeScreenshots);
        element(by.id('btn-activate')).click();
        browser.sleep(600);
        helper.takeScreenshot(testName + '_after_activate_click', takeScreenshots);
        // expect(list.first().all(by.tagName('td')).get(1).getText()).toMatch('\u2713');
        expect(element(by.xpath('//*[@id="table-shares"]/tbody/tr[2]/td[2]')).getText()).toMatch('\u2713');
      });

      it('should not allow edit of multiple items', function() {
        element(by.id('btn-edit')).click();
        expect(element(by.id('error-edit-only-one')).isDisplayed()).toBeTruthy();
      });

      it('should allow edit of a single itinerary share', function() {
        element(by.id('input-select-all')).click();
        list.first().all(by.model('share.selected')).first().click();
        element(by.id('btn-edit')).click();
        expect(element(by.id('form')).isDisplayed()).toBeTruthy();
        expect(element(by.id('input-nickname')).getAttribute('disabled')).toEqual('true');
        expect(element(by.id('input-active')).isDisplayed()).toBeTruthy();
      });

      it('should allow delete of multiple items', function() {
        helper.takeScreenshot(testName + '_delete_multiple_itinerary_shares', takeScreenshots);
        element(by.id('btn-delete')).click();
        element.all((by.css('.confirm-button'))).get(0).click();
        browser.sleep(300).then(function() {
          expect(element(by.id('table-shares')).isDisplayed()).toBeFalsy();
        });
      });

    });

  });

});
