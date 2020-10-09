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

describe('TRIP app', function() {
  var EC = protractor.ExpectedConditions;

  function clear(elem) {
    elem.getAttribute('value').then(function (text) {
      if (browser.privateConfig.browserName !== 'chrome') {
        elem.clear();
      } else {
        elem.value = '';
      }
    });
  }

  describe('default redirect', function() {
    it('should automatically redirect to /tracks when location hash/fragment is empty', function() {
      browser.get(browser.baseUrl + '/rubbish');
      expect(browser.getCurrentUrl()).toMatch("/tracks");
    });
  });

  describe('tracks page', function() {

    beforeEach(function() {
      browser.get(browser.baseUrl + '/tracks');
      helper.wait(800);
    });

    var elemDateFrom = element(by.model('tracks.search.dateFrom'));
    var elemDateTo = element(by.model('tracks.search.dateTo'));
    var elemDateFromInvalid = element(by.id('invalid-date-from'));
    var elemDateToInvalid = element(by.id('invalid-date-to'));
    var elemDateFromRequired = element(by.id('error-required-from'));
    var elemDateToRequired = element(by.id('error-required-to'));
    var elemListButton = element(by.id('btn-tracks'));


    describe('paging tests', function() {

      beforeEach(function() {
        browser.wait(EC.visibilityOf(elemDateFrom), 4000, 'Timeout waiting for date from field to be visibile');
        if (browser.privateConfig.browserName !== 'chrome') {
          elemDateFrom.clear();
          elemDateFrom.sendKeys('2015-12-10T17:48:00');
          elemDateTo.clear();
          elemDateTo.sendKeys('2015-12-13T09:55:00');
        } else {
          clear(elemDateFrom);
          elemDateFrom.sendKeys('10120020151748');
          clear(elemDateTo);
          elemDateTo.sendKeys('13120020150955');
        }
        element(by.id('btn-tracks')).click();
        var conditionPage3LinkVisible = EC.visibilityOf(element(by.linkText('3')));
        var conditionLastPageLinkVisible = EC.visibilityOf(element(by.linkText('>>')));
        var conditionLocationsRepeaterVisible = EC.visibilityOf(element(by.repeater('location in locations')));
        var conditionNicknameRepeaterVisible = EC.visibilityOf(element(by.repeater('nickname in nicknames')));
        browser.wait(EC.and(conditionPage3LinkVisible, conditionLastPageLinkVisible, conditionLocationsRepeaterVisible, conditionNicknameRepeaterVisible),
                     4000,
                     'Timeout waiting for data to populate page');
        if (browser.privateConfig.browserName.toLowerCase() == 'safari') {
          browser.sleep(800);
        }
      });

      it('should page through the list of locations', function() {
        var pageLink3 = element(by.linkText('3'));
        pageLink3.click();
        var locationList = element.all(by.repeater('location in locations'));
        expect(locationList.first().all(by.tagName('td')).first().getText()).toEqual('253');
        expect(locationList.last().all(by.tagName('td')).first().getText()).toEqual('244');
      });

      it('should show the oldest item on the last page', function() {
        var lastPageLink, locationList;
        lastPageLink = element(by.linkText('>>'));
        lastPageLink.click();
        locationList = element.all(by.repeater('location in locations'));
        expect(locationList.first().all(by.tagName('td')).first().getText()).toEqual('3');
        expect(locationList.last().all(by.tagName('td')).first().getText()).toEqual('1');
      });

    });


    it('should show invalid date for dateFrom', function() {
      if (browser.privateConfig.browserName !== 'chrome') {
        elemDateFrom.clear();
        expect(elemDateFromInvalid.isDisplayed()).toBe(false);
        elemDateFrom.sendKeys('XX');
        elemDateTo.click();
        expect(elemDateFromInvalid.isDisplayed()).toBe(true);
      }
    });

    it('should not submit the form if there is an error', function() {
      if (browser.privateConfig.browserName !== 'chrome') {
        elemDateFrom.clear();
        expect(elemDateFromInvalid.isDisplayed()).toBe(false);
        elemDateFrom.sendKeys('XX');
        elemListButton.click();
        expect(elemDateFromInvalid.isDisplayed()).toBe(true);
      }
    });

    it('should show invalid date for dateTo', function() {
      if (browser.privateConfig.browserName !== 'chrome') {
        elemDateTo.clear();
        expect(elemDateToInvalid.isDisplayed()).toBe(false);
        elemDateTo.sendKeys('XX');
        elemDateFrom.click();
        expect(elemDateToInvalid.isDisplayed()).toBe(true);
      }
    });

    it('should show non-numeric error for max hdop', function() {
      var hdop = element(by.id('input-max-hdop'));
      clear(hdop);
      hdop.sendKeys('xx');
      elemDateTo.click();
      var errElem = element(by.id('error-number-hdop'));
      if (browser.privateConfig.browserName === 'chrome') {
        // Chrome doesn't allow the invalid characters in the first place
        expect(hdop.getAttribute('value')).toEqual('');
        // so the error message isn't shown
        expect(errElem.isDisplayed()).toBe(false);
      } else {
        expect(errElem.isDisplayed()).toBe(true);
      }
    });

    it('should show maximum exceeded error for max hdop', function() {
      var hdop = element(by.model('tracks.search.hdop'));
      hdop.clear();
      expect(element(by.id('error-max-hdop')).isDisplayed()).toBe(false);
      hdop.sendKeys('999999');
      elemDateTo.click();
      expect(element(by.id('error-max-hdop')).isDisplayed()).toBe(true);
    });

    it('should show the count of tracks', function() {
      if (browser.privateConfig.browserName !== 'chrome') {
        elemDateFrom.clear();
        elemDateFrom.sendKeys('2015-12-10T17:48:50');
        elemDateTo.clear();
        elemDateTo.sendKeys('2015-12-13T10:10:22');
        var submit = element(by.id('btn-tracks'));
        submit.click();
        var locationCount = element.all(by.id('location-count'));
        expect(locationCount.isDisplayed()).toBeTruthy();
        var span = element.all(by.xpath('//*[@id="location-count"]/div/div[1]/h3/span'));
        expect(span.isDisplayed()).toBeTruthy();
        expect(span.getText()).toMatch("273");
        var locationList = element.all(by.repeater('location in locations'));
        expect(locationList.count()).toBe(10);
        expect(element(by.binding('locations.date_from')).isDisplayed()).toBeTruthy();
        expect(element(by.binding('locations.date_to')).isDisplayed()).toBeTruthy();
      }
    });

    it('should show only locations having notes when filtered', function() {
      if (browser.privateConfig.browserName !== 'chrome') {
        elemDateFrom.clear();
        elemDateFrom.sendKeys('2016-04-22T00:00:00');
        elemDateTo.clear();
        elemDateTo.sendKeys('2016-08-22T20:53:00');
      } else {
        clear(elemDateFrom);
        // These dates may fail in a non-European locale
        elemDateFrom.sendKeys('22042016', protractor.Key.TAB, '0000');
        clear(elemDateTo);
        elemDateTo.sendKeys('22042016', protractor.Key.TAB, '205300');
      }
      var submit = element(by.id('btn-tracks'));
      // Display notes and non-notes
      submit.click();
      var locationCount = element.all(by.id('location-count'));
      expect(locationCount.isDisplayed()).toBeTruthy();
      var span = element.all(by.xpath('//*[@id="location-count"]/div/div[1]/h3/span'));
      expect(span.getText()).toMatch("29");
      // Display notes only
      element(by.id('input-notes-only')).click();
      submit.click();
      locationCount = element.all(by.id('location-count'));
      expect(locationCount.isDisplayed()).toBeTruthy();
      span = element.all(by.xpath('//*[@id="location-count"]/div/div[1]/h3/span'));
      expect(span.getText()).toMatch("2");
    });

    it('should display results for the specified criteria', function() {
      // This test introduced after a page failed to display any locations.
      // Hasn't occurred since.  The cause hasn't been determined.
      // Test left here for posterity.
      if (browser.privateConfig.browserName !== 'chrome') {
        elemDateFrom.clear();
        elemDateFrom.sendKeys('2015-12-10T00:00:00');
        elemDateTo.clear();
        elemDateTo.sendKeys('2015-12-10T23:59:59');
      } else {
        clear(elemDateFrom);
        // These dates may fail in a non-European locale
        elemDateFrom.sendKeys('10122015\t0000');
        clear(elemDateTo);
        elemDateTo.sendKeys('10122015\t235959');
      }
      var submit = element(by.id('btn-tracks'));
      submit.click();
      var locationCount = element.all(by.id('location-count'));
      expect(locationCount.isDisplayed()).toBeTruthy();
      var span = element.all(by.xpath('//*[@id="location-count"]/div/div[1]/h3/span'));
      expect(span.getText()).toMatch("38");
      expect(element(by.binding('locations.date_from')).isDisplayed()).toBeTruthy();
      expect(element(by.binding('locations.date_to')).isDisplayed()).toBeTruthy();
      element(by.linkText('>')).click();
      var locationList = element.all(by.repeater('location in locations'));
      expect(locationList.count()).toBe(10);
      // Check the last page
      element(by.linkText('>>')).click();
      expect(locationList.count()).toBe(8);
    });

    it('should list the tracks for a specific date range and nickname', function() {
      if (browser.privateConfig.browserName !== 'chrome') {
        elemDateFrom.clear();
        elemDateFrom.sendKeys('2015-12-14T00:00:00');
        elemDateTo.clear();
        elemDateTo.sendKeys('2015-12-14T23:59:59');
        var nicknameSelect = element(by.model('tracks.search.nicknameSelect'));
        // We expect this to select 'Fred' from the list of nicknames
        nicknameSelect.sendKeys('F\t');
        var submit = element(by.id('btn-tracks'));
        submit.click();
        var locationCount = element.all(by.id('location-count'));
        expect(locationCount.isDisplayed()).toBeTruthy();
        var span = element.all(by.xpath('//*[@id="location-count"]/div/div[1]/h3/span'));
        expect(span.getText()).toMatch("57");
        var locationList = element.all(by.repeater('location in locations'));
        expect(locationList.count()).toBe(10);
      }
    });

    it('should list tracks when the form is submitted', function() {
      if (browser.privateConfig.browserName !== 'chrome') {
        elemDateFrom.clear();
        elemDateFrom.sendKeys('2015-01-01T00:00:00');
        var submit = element(by.id('btn-tracks'));
        submit.click();
        var locationList = element.all(by.repeater('location in locations'));
        expect(locationList.count()).toBe(10);
      }
    });

    it('should not show the count of tracks when the page is first displayed', function() {
      expect(element(by.id('location-count')).isDisplayed()).toBeFalsy();
    });

    it('should not show the locations, or navigation keys when no results', function() {
      if (browser.privateConfig.browserName !== 'chrome') {
        elemDateFrom.clear();
        elemDateFrom.sendKeys('2010-01-01T00:00:00');
        elemDateTo.clear();
        elemDateTo.sendKeys('2010-01-01T23:59:00');
      } else {
        clear(elemDateFrom);
        elemDateFrom.sendKeys('01010020100000');
        clear(elemDateTo);
        elemDateTo.sendKeys('01010020102359');
      }
      var nicknameSelect = element(by.model('tracks.search.nicknameSelect'));
      // We expect this to select 'Fred' from the list of nicknames
      nicknameSelect.sendKeys('F\t');
      var submit = element(by.id('btn-tracks'));
      submit.click();
      // A zero count should be displayed
      expect(element(by.id('location-count')).isDisplayed()).toBeTruthy();
      expect(element(by.id('div-locations-table')).isDisplayed()).toBeFalsy();
      expect(element(by.id('div-paging')).isDisplayed()).toBeFalsy();
    });

    it('should render title', function() {
      expect(element.all(by.css('[ng-view] h1')).first().getText()).
        toEqual('Tracks');
    });

    it('should have some nicknames in the shared tracks select box', function() {
      if (browser.privateConfig.browserName.toLowerCase() == 'safari') {
        browser.wait(EC.visibilityOf(element(by.repeater('nickname in nicknames'))), 4000, 'Timeout waiting for nickname list to be populated');
      }
      var nicknameList = element.all(by.repeater('nickname in nicknames'));
      var nicknameSelect = element(by.model('tracks.search.nicknameSelect'));
      expect(nicknameList.first().getText()).toEqual('Fred');
      expect(nicknameList.last().getText()).toEqual('test2');
      nicknameSelect.$('[value="Fred"]').click();
      var nicknameSelectResult = element(by.model('tracks.search.nicknameSelect'));
      expect(nicknameSelect.getText()).toMatch("Fred");
    });

    it('should show an error message if "date from" is blank', function() {
      clear(elemDateFrom);
      // Move to a different field
      elemDateTo.click();
      expect(elemDateFrom.getText()).toEqual('');
      if (browser.privateConfig.browserName !== 'chrome') {
        expect(elemDateFromRequired.getText()).toMatch('Enter the start date to fetch points from.|');
      }
    });

    it('should show an error message if "date to" is blank', function() {
      clear(elemDateTo);
      // Move to a different field
      elemDateFrom.click();
      expect(elemDateTo.getText()).toEqual('');
      if (browser.privateConfig.browserName !== 'chrome') {
        expect(elemDateToRequired.getText()).toEqual('Enter the end date to fetch points from.');
      }
    });

    it('should remove the template directive and css class', function() {
      expect(element(by.css('#template')).getAttribute('ng-cloak')).toBeNull();
      expect(element(by.css('#version')).getAttribute('ng-cloak')).toBeNull();
    });

    it('should default the "from" date to midnight this morning', function() {
      expect(element(by.model('tracks.search.dateFrom')).getAttribute('value')).toMatch(/^[0-9]{4}-[0-9]{2}-[0-9]{2}T00:00:00(\.000)?(Z|\+00:00)?$/);
    });

    it('should default the "to" date to one second before midnight today', function() {
      expect(element(by.model('tracks.search.dateTo')).getAttribute('value')).toMatch(/^[0-9]{4}-[0-9]{2}-[0-9]{2}T23:59:59(\.000)?(Z|\+00:00)?$/);
    });

    it('should navigate to the map page when the submit button is clicked', function() {
      element(by.id('btn-map')).click();
      expect(browser.getCurrentUrl()).toMatch(new RegExp('^' + browser.baseUrl + '\\/map'));
    });

    it('should navigate to the map point page when a map link is clicked', function() {
      if (browser.privateConfig.browserName !== 'chrome') {
        elemDateFrom.clear();
        elemDateFrom.sendKeys('2015-12-12T10:48:00');
        elemDateTo.clear();
        elemDateTo.sendKeys('2015-12-12T10:59:00');
      } else {
        clear(elemDateFrom);
        elemDateFrom.sendKeys('12120020151048');
        clear(elemDateTo);
        elemDateTo.sendKeys('12120020151059');
      }
      element(by.id('btn-tracks')).click();
      helper.wait(400);
      var locationList = element.all(by.repeater('location in locations'));
      var link = locationList.first().all(by.tagName('a')).first();
      expect(locationList.first().all(by.tagName('a')).first().getAttribute('href')).toMatch(/\/map-point\?lat=[-.0-9]+&lng=[-.0-9]+/);
      expect(locationList.first().all(by.tagName('a')).get(1).getAttribute('href')).toMatch(/\/map-point\?lat=[-.0-9]+&lng=[-.0-9]+/);
      link.click();
      browser.waitForAngular();
      expect(browser.getCurrentUrl()).toMatch(new RegExp('^' + browser.baseUrl + '\\/map-point'));
    });

    it('should download an empty GPX file for another nickname', function() {
      // Selenium driver for Safari does not support opening the download dialog
      if (browser.privateConfig.browserName.toLowerCase() !== 'safari') {
        // ugly, but need each browser to use a different directory, otherwise race conditions
        var filename = browser.privateConfig.tmpDir + '/' + browser.privateConfig.browserName + '/trip.gpx';
        if (fs.existsSync(filename)) {
          fs.unlinkSync(filename);
        }
        if (browser.privateConfig.browserName !== 'chrome') {
          elemDateFrom.clear();
          elemDateFrom.sendKeys('2015-12-12T10:48:00');
          elemDateTo.clear();
          elemDateTo.sendKeys('2015-12-12T10:59:00');
        } else {
          clear(elemDateFrom);
          elemDateFrom.sendKeys('12120020151048');
          clear(elemDateTo);
          elemDateTo.sendKeys('12120020151059');
        }
        var nicknameSelect = element(by.model('tracks.search.nicknameSelect'));
        // We expect this to select 'test2' from the list of nicknames
        nicknameSelect.sendKeys('t\t');
        element(by.id('btn-download')).click();
        element(by.css('.confirm-button')).click();
        browser.driver.wait(function() {
          var retval = fs.existsSync(filename);
          return retval;
        }).then(function() {
          expect(fs.existsSync(filename, { encoding: 'utf8'}));
          // give the download time to complete - may need increasing depending on cpu etc
          browser.sleep(640).then(function() {
            expect(fs.existsSync(filename, { encoding: 'utf8'}));
            var content = fs.readFileSync(filename, 'utf8');
            // Matcher testing the main tags exist from the beginning of the file
            // up to the first trkpt and from the last trkpt to the end of the file.
            // It should not care whether white space is present or not.
            // If it fails, chances are that there is something wrong with the file
            // or at least it has no trkpts in it.
            expect(content).toMatch(/^<\?xml version="1.0" encoding="(utf|UTF)-8"\?>[\s\n]*<gpx[\s\S]+<trk>[\s\n]*<trkseg\/>[\s\n]*<\/trk>[\s\n]*<\/gpx>[\s\n]*$/);
          });
        });
      }
    });

    it('should download a GPX file when the download button is clicked', function() {
      // Selenium driver for Safari does not support openingn the download dialog
      if (browser.privateConfig.browserName.toLowerCase() !== 'safari') {
        // ugly, but need each browser to use a different directory, otherwise race conditions
        var filename = browser.privateConfig.tmpDir + '/' + browser.privateConfig.browserName + '/trip.gpx';
        if (fs.existsSync(filename)) {
          fs.unlinkSync(filename);
        }
        if (browser.privateConfig.browserName !== 'chrome') {
          elemDateFrom.clear();
          elemDateFrom.sendKeys('2015-12-12T10:48:00');
          elemDateTo.clear();
          elemDateTo.sendKeys('2015-12-12T10:59:00');
        } else {
          clear(elemDateFrom);
          elemDateFrom.sendKeys('12120020151048');
          clear(elemDateTo);
          elemDateTo.sendKeys('12120020151059');
        }
        element(by.id('btn-download')).click();
        element(by.css('.confirm-button')).click();
        browser.driver.wait(function() {
          var retval = fs.existsSync(filename);
          return retval;
        }).then(function() {
          expect(fs.existsSync(filename, { encoding: 'utf8'}));
          // give the download time to complete - may need increasing depending on cpu etc
          browser.sleep(640).then(function() {
            expect(fs.existsSync(filename, { encoding: 'utf8'}));
            var content = fs.readFileSync(filename, 'utf8');
            // Matcher testing the main tags exist from the beginning of the file
            // up to the first trkpt and from the last trkpt to the end of the file.
            // It should not care whether white space is present or not.
            // If it fails, chances are that there is something wrong with the file
            // or at least it has no trkpts in it.
            expect(content).toMatch(/^<\?xml version="1.0" encoding="(utf|UTF)-8"\?>[\s\n]*<gpx[\s\S]+<trk>[\s\n]*<trkseg>[\s\n]*<trkpt[\s\S]+<\/trkpt>[\s\n]*<\/trkseg>[\s\n]*<\/trk>[\s\n]*<\/gpx>[\s\n]*$/);
          });
        });
      }
    });

  });

  describe('tracker info page', function() {

    var uuidUrlRegex = /https?:\/\/[\S]+\/log_point(\.php)?[\S]+uuid=[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
    beforeEach(function() {
      browser.get(browser.baseUrl + '/tracker-info');
    });

    it('should display the GPSLogger URL prefix in the link element', function() {
      expect(element(by.id('gpslog-href-url')).getAttribute('href')).toMatch(uuidUrlRegex);
    });

    it('should display the OsmAnd URL prefix in the link element', function() {
      expect(element(by.id('osmand-href-url')).getAttribute('href')).toMatch(uuidUrlRegex);
    });

    it('should generate and display the new UUID when the generate button is clicked', function() {
      var testElement = element(by.id('gpslog-href-url'));
      var urlBefore = testElement.getAttribute('href');
      element(by.id('btn-generate')).click();
      helper.wait();
      expect(testElement.getAttribute('href')).not.toEqual(urlBefore);
      expect(element(by.id('msg-success')).isDisplayed()).toBeTruthy();
    });

    it('should download a default TripLogger Settings file', function() {
      // Selenium driver for Safari does not support opening the download dialog
      if (browser.privateConfig.browserName.toLowerCase() !== 'safari') {
        // ugly, but need each browser to use a different directory, otherwise race conditions
        var filename = browser.privateConfig.tmpDir + '/' + browser.privateConfig.browserName + '/triplogger-settings.yaml';
        if (fs.existsSync(filename)) {
          fs.unlinkSync(filename);
        }
        element(by.id('btn-download')).click();
        browser.driver.wait(function() {
          var retval = fs.existsSync(filename);
          return retval;
        }).then(function() {
          expect(fs.existsSync(filename, { encoding: 'utf8'}));
          // give the download time to complete - may need increasing depending on cpu etc
          browser.sleep(640).then(function() {
            expect(fs.existsSync(filename, { encoding: 'utf8'}));
            var content = fs.readFileSync(filename, 'utf8');
            // Matcher testing the main tags exist from the beginning of the file
            // up to the first trkpt and from the last trkpt to the end of the file.
            // It should not care whether white space is present or not.
            // If it fails, chances are that there is something wrong with the file
            // or at least it has no trkpts in it.
            expect(content).toMatch(/currentSettingUUID: [0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
            expect(content).toMatch(/userId: [0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
          });
        });
      }
    });

  });

});
