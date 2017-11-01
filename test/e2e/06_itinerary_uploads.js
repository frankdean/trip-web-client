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

describe('Itinerary uploads', function() {

  var EC = protractor.ExpectedConditions;

  describe('Itinerary owned by user', function() {

    beforeEach(function() {
      browser.get(browser.baseUrl + '/itinerary?id=929');
    });

    it('should show the Select-all checkboxes and list waypoints, routes and tracks', function() {
      expect(element(by.id('input-select-all')).isDisplayed()).toBeTruthy();
      expect(element(by.id('input-select-all-waypoints')).isDisplayed()).toBeTruthy();
      expect(element(by.id('input-select-all-routes')).isDisplayed()).toBeTruthy();
      expect(element(by.id('input-select-all-tracks')).isDisplayed()).toBeTruthy();
      expect(element.all(by.repeater('waypoint in waypoints')).first().all(by.tagName('td')).get(0).getText()).toMatch(/.+/);
      expect(element.all(by.repeater('route in routeNames')).first().all(by.tagName('label')).get(0).getText()).toMatch(/.+/);
      expect(element.all(by.repeater('track in trackNames')).first().all(by.tagName('label')).get(0).getText()).toMatch(/.+/);
      // Various buttons should or should not be displayed
      expect(element(by.id('btn-edit')).isDisplayed()).toBeTruthy();
      expect(element(by.id('btn-sharing')).isDisplayed()).toBeTruthy();
      expect(element(by.id('btn-upload')).isDisplayed()).toBeTruthy();
      expect(element(by.id('btn-close')).isDisplayed()).toBeTruthy();
      expect(element(by.id('btn-download')).isDisplayed()).toBeTruthy();
      expect(element(by.id('btn-map')).isDisplayed()).toBeTruthy();
      expect(element(by.id('btn-edit-selected')).isDisplayed()).toBeTruthy();
      expect(element(by.id('btn-delete-gpx')).isDisplayed()).toBeTruthy();
      expect(element(by.id('btn-new-waypoint')).isDisplayed()).toBeTruthy();
    });

    it('should show an error if the edit-selected button is clicked without selecting an item', function() {
      element(by.id('btn-edit-selected')).click();
      expect(element(by.id('error-edit-only-one')).isDisplayed()).toBeTruthy();
    });

    it('should show an error if the edit-selected button is clicked with more than one waypoint is selected', function() {
      element.all(by.repeater('waypoint in waypoints')).all(by.model('waypoint.selected')).first().click();
      element.all(by.repeater('waypoint in waypoints')).all(by.model('waypoint.selected')).get(1).click();
      element(by.id('btn-edit-selected')).click();
      expect(element(by.id('error-edit-only-one')).isDisplayed()).toBeTruthy();
    });

    it('should show an error if the edit-selected button is clicked with more than one item selected', function() {
      element.all(by.repeater('waypoint in waypoints')).all(by.model('waypoint.selected')).first().click();
      element.all(by.repeater('route in routeNames')).all(by.model('route.selected')).first().click();
      element(by.id('btn-edit-selected')).click();
      expect(element(by.id('error-edit-only-one')).isDisplayed()).toBeTruthy();
    });

    it('should show the itinerary waypoint edit page when a waypoint is selected for edit', function() {
      element.all(by.repeater('waypoint in waypoints')).all(by.model('waypoint.selected')).first().click();
      element(by.id('btn-edit-selected')).click();
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary-wpt-edit\?itineraryId=\d+&waypointId=\d+/);
    });

    it('should show the itinerary waypoint edit page when the add waypoint button is clicked', function() {
      element(by.id('btn-new-waypoint')).click();
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary-wpt-edit\?itineraryId=\d+$/);
    });

    describe('display geo items on map', function() {

      beforeEach(function() {
        browser.wait(
          EC.visibilityOf(
            element(by.model('selection.allTracksSelected'))),
          5000,
          'all tracks selected checkbox should be visible within 5 seconds');
      });

      it('should show everything on the map', function() {
        element(by.model('selection.allGeoItemsSelected')).click();
        element(by.id('btn-map')).click();
        expect(browser.getCurrentUrl()).toMatch(/\/itinerary-map\?id=\d+$/);
      });

      it('should show all waypoints on the map', function() {
        element(by.model('selection.allWaypointsSelected')).click();
        element(by.id('btn-map')).click();
        expect(browser.getCurrentUrl()).toMatch(/\/itinerary-map\?id=\d+$/);
      });

      it('should show all routes on the map', function() {
        element(by.model('selection.allRoutesSelected')).click();
        element(by.id('btn-map')).click();
        expect(browser.getCurrentUrl()).toMatch(/\/itinerary-map\?id=\d+$/);
      });

      it('should show all tracks on the map', function() {
        element(by.model('selection.allTracksSelected')).click();
        element(by.id('btn-map')).click();
        expect(browser.getCurrentUrl()).toMatch(/\/itinerary-map\?id=\d+$/);
      });

    });

  });

  describe('Itinerary shared to user', function() {

    beforeEach(function() {
      browser.get(browser.baseUrl + '/itinerary?id=983');
    });

    it('should show the Select-all checkboxes and list waypoints, routes and tracks', function() {
      expect(element(by.id('input-select-all')).isDisplayed()).toBeTruthy();
      expect(element(by.id('input-select-all-waypoints')).isDisplayed()).toBeTruthy();
      expect(element(by.id('input-select-all-routes')).isDisplayed()).toBeTruthy();
      expect(element(by.id('input-select-all-tracks')).isDisplayed()).toBeTruthy();
      expect(element.all(by.repeater('waypoint in waypoints')).first().all(by.tagName('td')).get(1).getText()).toMatch(/.+/);
      expect(element.all(by.repeater('route in routeNames')).first().all(by.tagName('label')).get(0).getText()).toMatch(/.+/);
      expect(element.all(by.repeater('track in trackNames')).first().all(by.tagName('label')).get(0).getText()).toMatch(/.+/);
      // Various buttons should or should not be displayed
      expect(element(by.id('btn-edit')).isDisplayed()).toBeFalsy();
      expect(element(by.id('btn-sharing')).isDisplayed()).toBeFalsy();
      expect(element(by.id('btn-upload')).isDisplayed()).toBeFalsy();
      expect(element(by.id('btn-close')).isDisplayed()).toBeTruthy();
      expect(element(by.id('btn-download')).isDisplayed()).toBeTruthy();
      expect(element(by.id('btn-map')).isDisplayed()).toBeTruthy();
      expect(element(by.id('btn-edit-selected')).isDisplayed()).toBeFalsy();
      expect(element(by.id('btn-delete-gpx')).isDisplayed()).toBeFalsy();
      expect(element(by.id('btn-new-waypoint')).isDisplayed()).toBeFalsy();
    });

    it('should show selected waypoints on the map', function() {
      element.all(by.repeater('waypoint in waypoints')).all(by.model('waypoint.selected')).first().click();
      element.all(by.repeater('waypoint in waypoints')).all(by.model('waypoint.selected')).get(1).click();
      element(by.id('btn-map')).click();
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary-map\?id=\d+$/);
    });

    it('should show routes on the map', function() {
      element.all(by.repeater('route in routeNames')).all(by.model('route.selected')).first().click();
      element.all(by.repeater('route in routeNames')).all(by.model('route.selected')).get(1).click();
      element(by.id('btn-map')).click();
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary-map\?id=\d+$/);
    });

    it('should show tracks on the map', function() {
      element.all(by.repeater('track in trackNames')).all(by.model('track.selected')).first().click();
      element.all(by.repeater('track in trackNames')).all(by.model('track.selected')).get(1).click();
      element(by.id('btn-map')).click();
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary-map\?id=\d+$/);
    });

  });

});
