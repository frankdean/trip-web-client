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

var fs = require('fs'),
    helper = require('../helper.js');

describe('Itinerary management', function() {
  var EC = protractor.ExpectedConditions;
  var elemTitle, elemStartDate, elemFinishDate, elemDescription,
      elemSave, elemDelete, elemReset;
  var testItineraryId = 2333,
      testSharedItineraryId = 983;

  beforeEach(function() {
    elemTitle = element(by.id('input-title'));
    elemStartDate = element(by.id('input-start-date'));
    elemFinishDate = element(by.id('input-finish-date'));
    elemDescription = element(by.id('wmd-input-input-description'));
    elemSave = element(by.id('btn-save'));
    elemDelete = element(by.id('btn-delete'));
    elemReset = element(by.id('btn-reset'));
  });

  describe('new itinerary page', function() {

    beforeEach(function() {
      browser.get(browser.baseUrl + '/itinerary-edit');
      browser.wait(EC.visibilityOf(elemSave), 4000, 'Timeout waiting for itinerary edit');
    });

    it('should create a new itinerary', function() {
      expect(elemSave.isDisplayed()).toBeTruthy();
      expect(elemDelete.isDisplayed()).toBeFalsy();
      expect(elemReset.isDisplayed()).toBeTruthy();
      expect(elemDescription.isDisplayed()).toBeTruthy();
      elemTitle.sendKeys('Test title');
      if (browser.privateConfig.browserName !== 'chrome') {
        elemStartDate.sendKeys('2001-12-12');
        elemFinishDate.sendKeys('2001-12-13');
      } else {
        elemStartDate.sendKeys('12122001');
        elemFinishDate.sendKeys('13122001');
      }
      elemDescription.sendKeys('# Test Itinerary',
                               protractor.Key.ENTER,
                               protractor.Key.ENTER,
                               '## Lorem ipsum',
                               protractor.Key.ENTER);
      elemSave.click();
      helper.wait(100);
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=\d+/);
      expect(element(by.id('itinerary-text-title')).getText()).toEqual('Test title');
      expect(element(by.id('itinerary-text-date')).getText()).toMatch(/Date from:\s+(\w+ )?12.Dec.2001\s+((\w+ )?12.Dec.2001 \d{2}:\d{2}\s*)?to:\s+(\w+ )?13.Dec.2001/);
      // cleanup
      element(by.id('btn-edit-itinerary')).click();
      element(by.id('btn-delete')).click();
      element.all((by.css('.confirm-button'))).get(0).click();
    });

    it('should create a new itinerary if only the title field is entered', function() {
      elemTitle.sendKeys('Test title 2');
      elemSave.click();
      helper.wait(100);
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=\d+/);
      expect(element(by.id('itinerary-text-title')).getText()).toEqual('Test title 2');
      // expect(element(by.id('itinerary-text-date')).getText()).toEqual('');
      // 'from' should be hidden
      expect(element(by.xpath('//*[@id="itinerary-text-date"]/b/span[1]')).getAttribute('class')).toEqual('ng-hide');
      // 'to' should be hidden
      expect(element(by.xpath('//*[@id="itinerary-text-date"]/b[2]/span')).getAttribute('class')).toEqual('ng-hide');
      // cleanup
      element(by.id('btn-edit-itinerary')).click();
      element(by.id('btn-delete')).click();
      element.all((by.css('.confirm-button'))).get(0).click();
    });

    it('should show an error when the title is blank', function() {
      elemSave.click();
      expect(element(by.id('title-required')).isDisplayed()).toBeTruthy();
      expect(elemSave.isDisplayed()).toBeTruthy();
      expect(elemDelete.isDisplayed()).toBeFalsy();
      expect(elemReset.isDisplayed()).toBeTruthy();
    });

    // it('should show errors when dates are invalid', function() {
    //   // None of the browsers will allow invalid dates to be entered in their latest versions
    // });

    it('should clear the fields when the reset button is clicked', function() {
      if (browser.privateConfig.browserName !== 'safari') {
        elemTitle.sendKeys('Test title');
        if (browser.privateConfig.browserName !== 'chrome') {
          elemStartDate.sendKeys('2049-12-12');
        } else {
          elemStartDate.sendKeys('12122049');
        }
        elemDescription.sendKeys('# Test Itinerary\r\r## Lorem ipsum\r');
        element(by.id('btn-reset')).click();
        element.all((by.css('.confirm-button'))).get(2).click();
        expect(elemTitle.getAttribute('value')).toEqual('');
        expect(elemStartDate.getAttribute('value')).toEqual('');
        expect(elemDescription.getAttribute('value')).toEqual('');
      }
    });

    it('should show the Add Waypoint button after creating a new itinerary', function() {
      elemTitle.sendKeys('Test title 3');
      elemSave.click();
      helper.wait(100);
      element(by.id('features-tab')).click();
      helper.wait(100);
      element(by.id('edit-pill')).click();
      helper.wait(100);
      expect(element(by.id('btn-new-waypoint')).isDisplayed()).toBeTruthy();
      // cleanup
      element(by.id('heading-tab')).click();
      helper.wait(100);
      element(by.id('btn-edit-itinerary')).click();
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary-edit\?id=\d+/);
      elemDelete.click();
      element.all((by.css('.confirm-button'))).get(0).click();
    });

    it('should delete an itinerary when the delete button is clicked', function() {
      elemTitle.sendKeys('Test deleting itinerary');
      elemSave.click();
      browser.sleep(100);
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=\d+/);
      element(by.id('heading-tab')).click();
      element(by.id('btn-edit-itinerary')).click();
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary-edit\?id=\d+/);
      elemDelete.click();
      element.all((by.css('.confirm-button'))).get(0).click();
      helper.wait(400);
      expect(browser.getCurrentUrl()).toMatch(/\/itineraries/);
    });

  });

  describe('edit itinerary page', function() {

    beforeEach(function() {
      browser.get(browser.baseUrl + '/itinerary-edit?id=' + testItineraryId);
      browser.wait(EC.visibilityOf(elemSave), 4000, 'Timeout waiting for lists of shares');
    });

    it('should show the start date input field', function() {
      expect(elemStartDate.isDisplayed()).toBeTruthy();
    });

    it('should be able to modify each field', function() {
      elemTitle.clear();
      elemTitle.sendKeys('Test itinerary ' + testItineraryId + ' - DO NOT DELETE');
      if (browser.privateConfig.browserName !== 'chrome') {
        elemStartDate.clear();
        elemStartDate.sendKeys('2015-11-22');
        elemFinishDate.sendKeys('2015-11-23');
      } else {
        elemStartDate.sendKeys('22112015');
        elemFinishDate.sendKeys('23112015');
      }
      elemDescription.clear();
      elemDescription.sendKeys('# Test modified Itinerary',
                               protractor.Key.ENTER,
                               protractor.Key.ENTER,
                               '## Lorem ipsum modified too',
                               protractor.Key.ENTER);
      elemSave.click();
      helper.wait(100);
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=\d+/);
      expect(element(by.id('itinerary-text-title')).getText()).toEqual('Test itinerary ' + testItineraryId + ' - DO NOT DELETE');
      expect(element(by.id('itinerary-text-date')).getText()).toMatch(/Date from:\s+(\w+ )?22.Nov.2015\s+((\w+ )?22.Nov.2015 \d{2}:\d{2}\s*)?to:\s+(\w+ )?23.Nov.2015/);
    });

    it('should show the date range when both dates are specified', function() {
      elemTitle.clear();
      elemTitle.sendKeys('Test itinerary ' + testItineraryId + ' - DO NOT DELETE');
      if (browser.privateConfig.browserName !== 'chrome') {
        elemStartDate.clear();
        elemFinishDate.clear();
        elemStartDate.sendKeys('2001-12-12');
        elemFinishDate.sendKeys('2001-12-13');
      } else {
        elemStartDate.sendKeys('12122001');
        elemFinishDate.sendKeys('13122001');
      }
      elemSave.click();
      helper.wait(100);
      if (browser.privateConfig.browserName.toLowerCase() == 'safari') {
        expect(element(by.xpath('//*[@id="itinerary-text-date"]/span[1]')).getText()).toMatch(/(\w+ )?12.Dec.2001/);
        expect(element(by.xpath('//*[@id="itinerary-text-date"]/span[3]')).getText()).toMatch(/(\w+ )?13.Dec.2001/);
        // 'from' should not be hidden
        expect(element(by.xpath('//*[@id="itinerary-text-date"]/b/span[1]')).getAttribute('class')).toEqual('');
        // 'to' should not be hidden
        expect(element(by.xpath('//*[@id="itinerary-text-date"]/b[2]/span')).getAttribute('class')).toEqual('');
      } else {
        expect(element(by.id('itinerary-text-date')).getText()).toMatch(/Date from: (\w+ )?12.Dec.2001 to: (\w+ )?13.Dec.2001/);
      }
    });

    it('should show only the start date range when the end date is not specified', function() {
      elemTitle.clear();
      elemTitle.sendKeys('Test itinerary ' + testItineraryId + ' - DO NOT DELETE');
      if (browser.privateConfig.browserName !== 'chrome') {
        elemStartDate.clear();
        elemStartDate.sendKeys('2001-12-12');
      } else {
        elemStartDate.sendKeys('12122001');
      }
      if (browser.privateConfig.browserName === 'chrome') {
        elemFinishDate.sendKeys(protractor.Key.BACK_SPACE,
                                protractor.Key.TAB,
                                protractor.Key.BACK_SPACE,
                                protractor.Key.TAB,
                                protractor.Key.BACK_SPACE
                               );
      } else {
        elemFinishDate.clear();
      }
      elemSave.click();
      if (browser.privateConfig.browserName.toLowerCase() == 'safari') {
        browser.sleep(100);
        expect(element(by.xpath('//*[@id="itinerary-text-date"]/span[1]')).getText()).toMatch(/(\w+ )?12.Dec.2001/);
        // 'from' should be hidden
        expect(element(by.xpath('//*[@id="itinerary-text-date"]/b/span[1]')).getAttribute('class')).toEqual('ng-hide');
        // 'to' should  be hidden
        expect(element(by.xpath('//*[@id="itinerary-text-date"]/b[2]/span')).getAttribute('class')).toEqual('ng-hide');
      } else {
        expect(element(by.id('itinerary-text-date')).getText()).toMatch(/Date: (\w+ )?12.Dec.2001/);
      }
    });

    it('should show only the start date range when the end date is not specified', function() {
      elemTitle.clear();
      elemTitle.sendKeys('Test itinerary ' + testItineraryId + ' - DO NOT DELETE');
      if (browser.privateConfig.browserName === 'chrome') {
        elemStartDate.sendKeys(protractor.Key.BACK_SPACE,
                                protractor.Key.TAB,
                                protractor.Key.BACK_SPACE,
                                protractor.Key.TAB,
                                protractor.Key.BACK_SPACE
                               );
        elemFinishDate.sendKeys('13122001');
      } else {
        elemStartDate.clear();
        elemFinishDate.clear();
        elemFinishDate.sendKeys('2001-12-13');
      }
      elemSave.click();
      helper.wait(200);
      if (browser.privateConfig.browserName.toLowerCase() == 'safari') {
        // 'from' should be hidden
        expect(element(by.xpath('//*[@id="itinerary-text-date"]/b/span[1]')).getAttribute('class')).toEqual('ng-hide');
        expect(element(by.xpath('//*[@id="itinerary-text-date"]/span[3]')).getText()).toMatch(/(\w+ )?13.Dec.2001/);
        // 'to' should not be hidden
        expect(element(by.xpath('//*[@id="itinerary-text-date"]/b[2]/span')).getAttribute('class')).toEqual('');
      } else {
        expect(element(by.id('itinerary-text-date')).getText()).toMatch(/Date to: (\w+ )?13.Dec.2001/);
      }
    });

    it('should not show start or end date range when no dates are specified', function() {
      elemTitle.clear();
      elemTitle.sendKeys('Test itinerary ' + testItineraryId + ' - DO NOT DELETE');
      if (browser.privateConfig.browserName === 'chrome') {
        elemStartDate.sendKeys(protractor.Key.BACK_SPACE,
                                protractor.Key.TAB,
                                protractor.Key.BACK_SPACE,
                                protractor.Key.TAB,
                                protractor.Key.BACK_SPACE
                               );
        elemFinishDate.sendKeys(protractor.Key.BACK_SPACE,
                                protractor.Key.TAB,
                                protractor.Key.BACK_SPACE,
                                protractor.Key.TAB,
                                protractor.Key.BACK_SPACE
                               );
      } else {
        elemStartDate.clear();
        elemFinishDate.clear();
      }
      elemSave.click();
      if (browser.privateConfig.browserName.toLowerCase() == 'safari') {
        browser.sleep(100);
        expect(element(by.xpath('//*[@id="itinerary-text-date-range"]')).getAttribute('class')).toMatch(/ng-hide/);
      } else {
        expect(element(by.id('itinerary-text-date-range')).isDisplayed()).toBeFalsy();
      }
    });

    it('should reset the itinerary values when the reset button is clicked', function() {
      var titleBefore = elemTitle.getAttribute('value');
      var startDateBefore = elemStartDate.getAttribute('value');
      var finishDateBefore = elemFinishDate.getAttribute('value');
      var descriptionBefore = elemDescription.getAttribute('value');
      if (browser.privateConfig.browserName !== 'safari') {
        elemTitle.sendKeys(protractor.Key.CONTROL,"a",
                           protractor.Key.NULL,
                           'Test itinerary ' + testItineraryId + ' - DO NOT DELETE');
        if (browser.privateConfig.browserName !== 'chrome') {
          elemStartDate.sendKeys(protractor.Key.CONTROL,"a",
                                 protractor.Key.NULL,
                                 '2015-11-22');
          elemFinishDate.sendKeys(protractor.Key.CONTROL,"a",
                                  protractor.Key.NULL,
                                  '2015-11-22');
        } else {
          elemStartDate.sendKeys('22112015');
          elemFinishDate.sendKeys('22112015');
        }
        elemDescription.sendKeys(protractor.Key.CONTROL,"a",
                                 protractor.Key.NULL,
                                 '# Test modified Itinerary',
                                 protractor.Key.ENTER,
                                 protractor.Key.ENTER,
                                 '## Lorem ipsum modified too',
                                 protractor.Key.ENTER);
        elemReset.click();
        element.all((by.css('.confirm-button'))).get(2).click();
        expect(browser.getCurrentUrl()).toMatch(/\/itinerary-edit\?id=\d+/);
        expect(elemTitle.getAttribute('value')).toEqual(titleBefore);
        expect(elemStartDate.getAttribute('value')).toEqual(startDateBefore);
        expect(elemFinishDate.getAttribute('value')).toEqual(finishDateBefore);
        expect(elemDescription.getAttribute('value')).toEqual(descriptionBefore);
      }
    });

  });

  describe('view', function() {

    beforeEach(function() {
      browser.get(browser.baseUrl + '/itinerary?id=' + testItineraryId);
      helper.wait(400);
    });

    it('should show the sharing page when the sharing button is clicked', function() {
      element(by.id('btn-sharing')).click();
      helper.wait(400);
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary-sharing\?id=\d+/);
      helper.wait(100);
    });

    it('should show the Add Waypoint button whilst the form is in edit mode', function() {
      element(by.id('features-tab')).click();
      helper.wait(400);
      element(by.id('edit-pill')).click();
      helper.wait(400);
      expect(element(by.id('btn-new-waypoint')).isDisplayed()).toBeTruthy();
    });

  });

  describe('shared view', function() {

    beforeEach(function() {
      browser.get(browser.baseUrl + '/itinerary?id=' + testSharedItineraryId);
    });

    it('should download the itinerary as a YAML file', function() {
      // Selenium driver for Safari does not support opening the download dialog
      if (browser.privateConfig.browserName.toLowerCase() !== 'safari') {
        // ugly, but need each browser to use a different directory, otherwise race conditions
        var filename = browser.privateConfig.tmpDir + '/' + browser.privateConfig.browserName + '/trip-itinerary-' + testSharedItineraryId + '.yaml';
        if (fs.existsSync(filename)) {
          fs.unlinkSync(filename);
        }
        element(by.id('features-tab')).click();
        element(by.id('transfer-pill')).click();
        element(by.id('btn-download-yaml')).click();
        element(by.xpath('/html/body/div[7]/div[2]/div/div[1]/button')).click();
        browser.driver.wait(function() {
          var retval = fs.existsSync(filename);
          return retval;
        }).then(function() {
          expect(fs.existsSync(filename, { encoding: 'utf8'}));
          // give the download time to complete - may need increasing depending on cpu etc
          browser.sleep(640).then(function() {
            expect(fs.existsSync(filename, { encoding: 'utf8'}));
            var content = fs.readFileSync(filename, 'utf8');
            // Matcher testing the main attributes exist from the beginning of the file
            // It should not care whether white space is present or not.
            expect(content).toMatch(/id: 983/);
            expect(content).toMatch(/owned_by_nickname: orange/);
            expect(content).toMatch(/name: Test track name/);
          });
        });
      }
    });

    it('should not show the Add Waypoint button whilst the form is not in edit mode', function() {
      element(by.id('features-tab')).click();
      helper.wait(400);
      element(by.id('edit-pill')).click();
      helper.wait(400);
      expect(element(by.id('btn-new-waypoint')).isDisplayed()).toBeFalsy();
      expect(element(by.id('btn-copy')).isDisplayed()).toBeTruthy();
      expect(element(by.id('btn-duplicate')).isDisplayed()).toBeTruthy();
    });

  });

  describe('download', function() {

    beforeEach(function() {
      browser.get(browser.baseUrl + '/itinerary');
    });

  });

  describe('Copy location history to itinerary', function() {

    function clear(elem) {
      elem.getAttribute('value').then(function (text) {
        if (browser.privateConfig.browserName !== 'chrome') {
          elem.clear();
        } else {
          elem.value = '';
        }
      });
    }

    beforeEach(function() {
      browser.get(browser.baseUrl + '/tracks');
      browser.wait(EC.visibilityOf(element(by.id('btn-tracks'))), 4000, 'Timeout waiting for list of locations (tracks)');
      var elemDateFrom = element(by.model('tracks.search.dateFrom'));
      if (browser.privateConfig.browserName !== 'chrome') {
        elemDateFrom.clear();
        elemDateFrom.sendKeys('2015-12-10T17:48:00');
      } else {
        clear(elemDateFrom);
        elemDateFrom.sendKeys('10120020151748');
      }
      element(by.id('btn-copy')).click();
      browser.wait(EC.visibilityOf(element(by.id('info-copy-message'))), 4000, 'Timeout waiting for successful copy message');

      // browser.get(browser.baseUrl + '/itinerary-edit');

      element(by.xpath('//*[@id="navbar"]/ul/li[4]/a')).click();
      helper.wait(100);
      element(by.id('btn-new')).click();
      browser.wait(EC.visibilityOf(elemSave), 4000, 'Timeout waiting for new itinerary page');
      elemTitle.sendKeys('Paste test');
      elemSave.click();
      browser.wait(EC.visibilityOf(element(by.id('features-tab'))), 4000, 'Timeout waiting for itinerary featues tab to be displayed');
      element(by.id('features-tab')).click();
      helper.wait(100);
      element(by.id('edit-pill')).click();
      helper.wait(100);
    });

    it('should show the paste option', function() {
      expect(element(by.id('btn-paste')).isDisplayed()).toBeTruthy();
      element(by.id('btn-paste')).click();
      element.all((by.css('.confirm-button'))).get(0).click();
      // element(by.xpath('/html/body/div[2]/div[2]/div/div[1]/button')).click();
      browser.sleep(500);
      expect(element(by.xpath('//*[@id="table-waypoints"]/tbody/tr[2]/td[3]')).getText()).toEqual('Test note');
      expect(element(by.xpath('//*[@id="table-waypoints"]/tbody/tr[3]/td[3]')).getText()).toEqual('A longer note than the previous one.');
      expect(element(by.xpath('//*[@id="table-waypoints"]/tbody/tr[4]/td[3]')).getText()).toEqual('Test note 01');
      expect(element(by.xpath('//*[@id="table-waypoints"]/tbody/tr[5]/td[3]')).getText()).toEqual('Test note 02');
      expect(element(by.xpath('//*[@id="table-waypoints"]/tbody/tr[6]/td[3]')).getText()).toEqual('Test note 03');
      expect(element(by.xpath('//*[@id="table-waypoints"]/tbody/tr[7]/td[3]')).getText()).toEqual('Test note 04');
      expect(element(by.xpath('//*[@id="table-waypoints"]/tbody/tr[8]/td[3]')).getText()).toEqual('Test note 05');
      // cleanup
      element(by.id('heading-tab')).click();
      helper.wait(100);
      element(by.id('btn-edit-itinerary')).click();
      element(by.id('btn-delete')).click();
      element.all((by.css('.confirm-button'))).get(0).click();
    });

  });

});
