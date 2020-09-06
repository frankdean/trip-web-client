/**
 * @license TRIP - Trip Recording and Itinerary Planning application.
 * (c) 2016-2018 Frank Dean <frank@fdsd.co.uk>
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

describe('Itinerary search', function() {

  var EC = protractor.ExpectedConditions;

  describe('input', function() {

    beforeEach(function() {
      browser.get(browser.baseUrl + '/itinerary-search');
      browser.wait(EC.visibilityOf(element(by.id('input-position'))), 4000, 'Timeout waiting for itinerary search page to be displayed');
    });

    it('should accept valid values', function() {
      element(by.id('input-position')).sendKeys('48.858222,2.2945');
      element(by.id('input-distance')).sendKeys('0.9001');
      helper.wait(400);
      element(by.id('btn-search')).click();
      helper.wait(400);
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary-search-result\?lat=48\.858222&lng=2\.2945&distance=900\.1$/);
    });

    it('should not submit an invalid form', function() {
      element(by.id('btn-search')).click();
      expect(element(by.id('position-required')).isDisplayed()).toBeTruthy();
      expect(element(by.id('distance-required')).isDisplayed()).toBeTruthy();
    });

    it('should reject an invalid position', function() {
      element(by.id('input-position')).sendKeys('48.858222');
      helper.wait(400);
      expect(element(by.id('position-invalid')).isDisplayed()).toBeTruthy();
      element(by.id('input-distance')).sendKeys('-1');
      element(by.id('btn-search')).click();
      expect(element(by.id('range-error-distance')).isDisplayed()).toBeTruthy();
    });

  });

  describe('results', function() {
    var itineraryElements, routeElements, waypointElements, trackElements,
        itineraryElement, viewItineraryElement, visibleCondition;

    beforeEach(function() {
      browser.get(browser.baseUrl + '/itinerary-search-result?lat=48.858222&lng=2.2945&distance=900.1');
      browser.wait(EC.visibilityOf(element(by.repeater('itinerary in itineraries.payload'))), 4000, 'Timeout waiting for features tab to be displayed');
      itineraryElements = element.all(by.repeater('itinerary in itineraries.payload'));
    });

    it('should return matching itineries', function() {
      expect(itineraryElements.count()).toBe(10);
    });

    it('should show an itinerary title', function() {
      itineraryElement = itineraryElements.get(9).all(by.css('.text-primary')).first();
      expect(itineraryElement.getText()).toEqual('Test 18');
    });

    it('should show a link to view the full itinerary', function() {
      itineraryElement = element(by.id('itinerary-2434'));
      itineraryElement.click();
      // XPath to the 'View itinerary' link text - cannot use by.linkText() with Safari as it includes hidden elements in its search
      viewItineraryElement = element(by.xpath('//*[@id="itinerary-search-result"]/uib-accordion/div/div[3]/div/div[2]/div[2]/a'));
      visibleCondition = EC.visibilityOf(viewItineraryElement);
      browser.wait(visibleCondition, 4000, 'Timeout waiting for viewItinerary link to be visibile');
      expect(viewItineraryElement.isDisplayed()).toBeTruthy();
    });

    it('should view the full itinerary when link clicked', function() {
      itineraryElement = itineraryElements.all(by.id('itinerary-2434'));
      itineraryElement.click();
      // XPath to the 'View itinerary' link text - cannot use by.linkText() with Safari as it includes hidden elements in its search
      viewItineraryElement = element(by.xpath('//*[@id="itinerary-search-result"]/uib-accordion/div/div[3]/div/div[2]/div[2]/a'));
      visibleCondition = EC.visibilityOf(viewItineraryElement);
      browser.wait(visibleCondition, 4000, 'Timeout waiting for viewItinerary link to be visibile');
      viewItineraryElement.click();
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=2434&routing=itinerary-search-results$/);
    });

    it('should expand routes, waypoints and tracks when itinerary clicked', function() {
      itineraryElement = itineraryElements.all(by.id('itinerary-2434'));
      itineraryElement.click();
      helper.wait(400);
      // XPath to the 'View itinerary' link text - cannot use by.linkText() with Safari as it includes hidden elements in its search
      viewItineraryElement = element(by.xpath('//*[@id="itinerary-search-result"]/uib-accordion/div/div[3]/div/div[2]/div[2]/a'));
      visibleCondition = EC.visibilityOf(viewItineraryElement);
      browser.wait(visibleCondition, 4000, 'Timeout waiting for viewItinerary link to be visibile');
      expect(element(by.xpath('//*[@id="route-8332"]/div[1]/label/span[2]')).getText()).toEqual('Route 01');
      expect(element(by.xpath('//*[@id="route-8334"]/div[1]/label/span[2]')).getText()).toEqual('Route 02');
      expect(element(by.xpath('//*[@id="route-8333"]/div[1]/label/span[1]')).getText()).toEqual('ID: 8333');
      expect(element(by.xpath('//*[@id="waypoint-10888"]/div[1]/label/span[2]')).getText()).toEqual('Eiffel Tower');
      expect(element(by.xpath('//*[@id="track-1048"]/div[1]/label/span[2]')).getText()).toEqual('Track 01');
      expect(element(by.xpath('//*[@id="track-1049"]/div[1]/label/span[2]')).getText()).toEqual('Track 02');
      expect(element(by.xpath('//*[@id="track-1051"]/div[1]/label/span[2]')).getText()).toEqual('Track 04');

    });

  });

});
