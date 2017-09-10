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

describe('Itinerary Route Edit', function() {

  var testItineraryId = 2425,
      testSharedItineraryId = 983,
      testSharedRouteId = 8309,
      testRouteId_01 = 8312,
      testRouteId_02 = 8313,
      list;

  describe('Join routes', function() {

    beforeEach(function() {
      browser.get('app/index.html#itinerary?id=' + testItineraryId);
      element(by.id('input-route-' + testRouteId_01)).click();
      element(by.id('input-route-' + testRouteId_02)).click();
      element(by.id('btn-join-path')).click();
      list = element.all(by.repeater('route in routes'));
    });

    it('should display the two routes', function() {
      expect(list.first().all(by.tagName('td')).get(1).getText()).toEqual('Test route 01');
      expect(list.get(1).all(by.tagName('td')).get(1).getText()).toEqual('Test route 02');
    });

    it('should return to the itinerary when cancel is selected', function() {
      element(by.id('btn-cancel')).click();
      element.all((by.css('.confirm-button'))).get(1).click();
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=\d+/);
    });

    it('should move the last route up in the list', function() {
      element.all((by.css('.btn-info'))).get(2).click();
      expect(list.first().all(by.tagName('td')).get(1).getText()).toEqual('Test route 02');
      expect(list.get(1).all(by.tagName('td')).get(1).getText()).toEqual('Test route 01');
    });

    it('should create a new route when the join button is clicked', function() {
      element(by.id('input-name')).clear();
      element(by.id('input-name')).sendKeys('Test route 03');
      element(by.id('input-color')).sendKeys('R');
      element(by.id('btn-join')).click();
      element.all((by.css('.confirm-button'))).get(0).click();
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=\d+/);
    });

  });

  describe('Route points', function() {
    var points;

    beforeEach(function() {
      browser.get('app/index.html#itinerary?id=' + testItineraryId);
      list = element.all(by.repeater('route in routeNames'));
      list.get(2).all(by.tagName('td')).get(0).click();
      element(by.id('btn-edit-path')).click();
      points = element.all(by.repeater('point in data.points'));
    });

    it('should display the edit buttons', function() {
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary-route-edit\?itineraryId=\d+&routeId=\d+&shared=false/);
      expect(element(by.id('div-buttons')).isDisplayed()).toBeTruthy();
      expect(element(by.id('btn-delete')).isDisplayed()).toBeTruthy();
      expect(element(by.id('btn-split')).isDisplayed()).toBeTruthy();
    });

    it('should allow a single point to be deleted', function() {
      points.get(9).all(by.tagName('td')).get(0).click();
      element(by.id('btn-delete')).click();
      element.all((by.css('.confirm-button'))).get(0).click();
    });

    it('should allow multiple points to be deleted', function() {
      points.get(1).all(by.tagName('td')).get(0).click();
      points.get(2).all(by.tagName('td')).get(0).click();
      element(by.id('btn-delete')).click();
      element.all((by.css('.confirm-button'))).get(0).click();
    });

    it('should not allow multiple points to be selected to split the route', function() {
      points.get(1).all(by.tagName('td')).get(0).click();
      points.get(2).all(by.tagName('td')).get(0).click();
      element(by.id('btn-split')).click();
      element.all((by.css('.confirm-button'))).get(1).click();
      expect(element(by.id('error-edit-only-one')).isDisplayed()).toBeTruthy();
    });

    it('should return to the itinerary page when close is clicked', function() {
      element(by.id('btn-close')).click();
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=\d+/);
    });

    it('should split the route', function() {
      points.get(5).all(by.tagName('td')).get(0).click();
      element(by.id('btn-split')).click();
      element.all((by.css('.confirm-button'))).get(1).click();
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=\d+/);
    });

  });

  describe('Read only', function() {

    beforeEach(function() {
      browser.get('app/index.html#itinerary?id=' + testSharedItineraryId);
      list = element.all(by.repeater('route in routeNames'));
      list.get(0).all(by.tagName('td')).get(0).click();
      element(by.id('btn-view-path')).click();
    });

    it('should not display the edit buttons', function() {
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary-route-edit\?itineraryId=\d+&routeId=\d+&shared=true/);
      expect(element(by.id('div-buttons')).isDisplayed()).toBeFalsy();
      expect(element(by.id('btn-delete')).isDisplayed()).toBeFalsy();
      expect(element(by.id('btn-split')).isDisplayed()).toBeFalsy();
    });

  });

  describe('Cleanup', function() {

    beforeEach(function() {
      browser.get('app/index.html#itinerary?id=' + testItineraryId);
    });

    it('should remove routes we created during testing', function() {
      element(by.id('input-select-all-routes')).click();
      element(by.id('input-route-' + testRouteId_01)).click();
      element(by.id('input-route-' + testRouteId_02)).click();
      element(by.id('btn-delete-gpx')).click();
      element.all((by.css('.confirm-button'))).get(1).click();
    });

  });

});
