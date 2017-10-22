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

describe('Itinerary Route Name', function() {

  var testItineraryId=929,
      testRouteId = 8304;

  describe('Non-existant route ID', function() {

    beforeEach(function() {
      browser.get('app/index.html#' + browser.privateConfig.hashPrefix + '/itinerary-route-name?itineraryId=' + testItineraryId + '&routeId=-1');
    });

    it('should display a system error', function() {
      expect(element(by.id('system-error')).isDisplayed()).toBeTruthy();
    });

  });

  describe('edit', function() {

    beforeEach(function() {
      browser.get('app/index.html#' + browser.privateConfig.hashPrefix + '/itinerary-route-name?itineraryId=' + testItineraryId + '&routeId=' + testRouteId);
    });

    it('should fetch the route name', function() {
      expect(element(by.id('input-name')).isDisplayed()).toBeTruthy();
    });

    it('should allow an empty route name', function() {
      element(by.id('input-name')).clear();
      element(by.id('btn-save')).click();
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=\d+/);
    });

    it('should save the amended route name', function() {
      element(by.id('input-name')).clear();
      element(by.id('input-name')).sendKeys('Modified route name');
      element(by.id('btn-save')).click();
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=\d+/);
      browser.get('app/index.html#' + browser.privateConfig.hashPrefix + '/itinerary-route-name?itineraryId=' + testItineraryId + '&routeId=' + testRouteId);
      expect(element(by.id('input-name')).getAttribute('value')).toEqual('Modified route name');
    });

    it('should cancel the form when there are no changes', function() {
      element(by.id('btn-cancel')).click();
      element.all((by.css('.confirm-button'))).get(0).click();
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=\d+/);
    });

    it('should cancel the form if the confirm dialog is accepted', function() {
      element(by.id('input-name')).clear();
      element(by.id('input-name')).sendKeys('test change');
      element(by.id('btn-cancel')).click();
      element.all((by.css('.confirm-button'))).get(0).click();
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=\d+/);
    });

    it('should not cancel the form if the confirm dialog is dismissed', function() {
      element(by.id('input-name')).clear();
      element(by.id('input-name')).sendKeys('test change');
      element(by.id('btn-cancel')).click();
      element.all((by.css('.cancel-button'))).get(0).click();
      expect(browser.getCurrentUrl()).toMatch(/itinerary-route-name\?itineraryId=\d+&routeId=\d+/);
    });

    it('should not reset the form when there are no changes', function() {
      var before = element(by.id('input-name')).getAttribute('value');
      element(by.id('btn-reset')).click();
      element.all((by.css('.cancel-button'))).get(1).click();
      expect(element(by.id('input-name')).getAttribute('value')).toEqual(before);
    });

    it('should reset the form if the confirm dialog is accepted', function() {
      var before = element(by.id('input-name')).getAttribute('value');
      element(by.id('input-name')).clear();
      element(by.id('input-name')).sendKeys('test do reset');
      element(by.id('btn-reset')).click();
      element.all((by.css('.confirm-button'))).get(1).click();
      expect(element(by.id('input-name')).getAttribute('value')).toEqual(before);
    });

    it('should not reset the form if the confirm dialog is dismissed', function() {
      element(by.id('input-name')).clear();
      element(by.id('input-name')).sendKeys('test do not reset');
      element(by.id('btn-reset')).click();
      element.all((by.css('.cancel-button'))).get(1).click();
      expect(element(by.id('input-name')).getAttribute('value')).toEqual('test do not reset');
    });

    it('should make a reversed copy of the route', function() {
      element(by.id('input-name')).clear();
      element(by.id('input-name')).sendKeys('Copy');
      element(by.id('input-copy')).click();
      element(by.id('btn-save')).click();
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=\d+/);
    });

  });

});
