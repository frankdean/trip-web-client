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

describe('Itineraries sharing report', function() {
  var list,
      screenshotCounter = 0,
      testName = '10_itinerary_sharing_report',
      takeScreenshots = browser.privateConfig.takeScreenshots;

  beforeEach(function() {
    browser.get(browser.baseUrl + '/itinerary-sharing-report');
    browser.wait(protractor.ExpectedConditions.visibilityOf(element(by.repeater('itinerary in itineraries'))), 500, 'Timeout waiting for itinerary sharing report to be displayed');
    list = element.all(by.repeater('itinerary in itineraries'));
    helper.takeScreenshot(testName + '_before_each_' + ('0000' + (++screenshotCounter)).substr(-4, 4), takeScreenshots);
  });

  it('should display at least one itinerary', function() {
    expect(list.first().all(by.tagName('td')).get(1).getText()).toMatch(/.+/);
  });

  it('should render links to the itinerary sharing page', function() {
    expect(list.first().all(by.tagName('a')).first().getAttribute('href')).toMatch(/\/itinerary-sharing\?id=[0-9]+/);
  });

  it('should show the itinerary sharing page when an itinerary is clicked', function() {
    list.first().all(by.tagName('a')).first().click();
    expect(browser.getCurrentUrl()).toMatch(/(%2F|\/)itinerary-sharing(%3F|\?)id=[0-9]+/);
    expect(element(by.id('btn-show-itinerary')).isDisplayed()).toBeTruthy();
  });

  it('should show the itinerary when the "show itinerary" button on the itinerary sharing page is clicked', function() {
    list.first().all(by.tagName('a')).first().click();
    expect(browser.getCurrentUrl()).toMatch(/(%2F|\/)itinerary-sharing(%3F|\?)id=[0-9]+/);
    expect(element(by.id('btn-show-itinerary')).isDisplayed()).toBeTruthy();
    element(by.id('btn-show-itinerary')).click();
    expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=\d+$/);
  });

  it('should show the itinerary sharing report when the back button on the itinerary sharing page is clicked', function() {
    list.first().all(by.tagName('a')).first().click();
    helper.takeScreenshot(testName + '_back_button_', takeScreenshots);
    expect(browser.getCurrentUrl()).toMatch(/(%2F|\/)itinerary-sharing(%3F|\?)id=[0-9]+/);
    expect(element(by.id('btn-show-itinerary')).isDisplayed()).toBeTruthy();
    element(by.id('btn-close')).click();
    expect(browser.getCurrentUrl()).toMatch(/\/itinerary-sharing-report$/);
  });

});
