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

var fs = require('fs');

var takeScreenshots = false;

function writeScreenshot(png, filename) {
  var stream = fs.createWriteStream(filename);
  stream.write(new Buffer(png, 'base64'));
  stream.end();
}

describe('Itinerary map', function() {

  var EC = protractor.ExpectedConditions,
      elemMap,
      elemCreatePolylineControl,
      elemCreateMarkerControl,
      elemEditControl,
      elemDeleteControl,
      selectAllWaypoints,
      markerIcons,
      saveControlText = 'Save',
      finishControlText = 'Finish',
      cancelControlText = 'Cancel',
      testItineraryId = 929,
      testSharedItineraryId = 983;

  beforeEach(function() {
    elemMap = element(by.css('.angular-leaflet-map'));
    elemCreateMarkerControl = element(by.css('.leaflet-draw-draw-marker'));
    elemCreatePolylineControl = element(by.css('.leaflet-draw-draw-polyline'));
    elemEditControl = element(by.css('.leaflet-draw-edit-edit'));
    elemDeleteControl = element(by.css('.leaflet-draw-edit-remove'));
    selectAllWaypoints = element(by.model('selection.allWaypointsSelected'));
  });

  describe('Itinerary owned by user', function() {

    beforeEach(function() {
      browser.get(browser.baseUrl + '/itinerary?id=' + testItineraryId);
      browser.wait(EC.visibilityOf(selectAllWaypoints), 5000);
      browser.waitForAngular();
    });

    describe('editing', function() {

      it('should display the edit-path button', function() {
        expect(element(by.id('btn-edit-path')).isDisplayed()).toBeTruthy();
        expect(element(by.id('btn-view-path')).isDisplayed()).toBeFalsy();
      });

      // Protractor/Selenium unreliable at selecting all waypoints
      xdescribe('Waypoint editing', function() {

        beforeEach(function() {
          browser.waitForAngular();
          browser.wait(
            EC.and(
              EC.visibilityOf(selectAllWaypoints),
              EC.visibilityOf(element(by.id('input-select-all-waypoints'))),
              EC.elementToBeClickable(selectAllWaypoints)
            ),
            2000, 'Waypoint select-all element not found');
          selectAllWaypoints.click().then(function() {
            // expect(selectAllWaypoints.isSelected()).toBeTruthy();
            browser.sleep(500);
            expect(element(by.model('selection.allWaypointsSelected')).isDisplayed()).toBeTruthy();
            browser.element(by.id('btn-map')).click();
            markerIcons = element.all(by.css('.leaflet-marker-icon'));
            browser.wait(EC.elementToBeClickable(elemEditControl), 5000);
          });
        });

        it('should display the waypoints on the map', function() {
          expect(markerIcons.count()).toBeGreaterThan(2);
        });

        it('should allow a marker creation to be cancelled', function() {
          elemCreateMarkerControl.click();
          element(by.linkText(cancelControlText)).click();
        });

        it('should allow a new marker to be created and saved', function() {
          elemCreateMarkerControl.click();
          browser.actions()
            .mouseMove(elemMap, {x:500, y:180})
            .click()
            .perform();
        });

        it('should allow a marker to be edited and saved', function() {
          elemEditControl.click();
          var e1 = markerIcons.first();
          browser.actions()
            .mouseDown(e1)
            .mouseMove(e1, {x:10, y: 10})
            .mouseMove(e1, {x:20, y: 20})
            .mouseMove(elemMap, {x:100, y:20})
            .mouseUp()
            .perform();
          element(by.linkText(saveControlText)).click();
        });

        it('should allow multiple markers to be edited and saved', function() {
          elemEditControl.click();
          var e1 = markerIcons.first(),
          e2 = markerIcons.get(1);
          browser.actions()
            .mouseDown(e1)
            .mouseMove(e1, {x:10, y: 10})
            .mouseMove(e1, {x:20, y: 20})
            .mouseMove(elemMap, {x:100, y:20})
            .mouseUp()
            .perform();
          browser.waitForAngular();
          browser.actions()
            .mouseDown(e2)
            .mouseMove(e2, {x:10, y: 10})
            .mouseMove(e2, {x:20, y: 20})
            .mouseMove(elemMap, {x:100, y:100})
            .mouseUp()
            .perform();
          e2.click();
          element(by.linkText(saveControlText)).click();
        });

        it('should allow a marker to be edited and cancelled', function() {
          // Zoom out, otherwise sometimes the marker is partly off the map
          element(by.css('.leaflet-control-zoom-out')).click();
          var e1 = markerIcons.first();
          elemEditControl.click();
          e1.click();
          browser.actions()
            .mouseDown(e1)
            .mouseMove(e1, {x:10, y: 10})
            .mouseMove(e1, {x:20, y: 20})
            .mouseMove(elemMap, {x:100, y:20})
            .mouseUp()
            .perform();
          element(by.linkText(cancelControlText)).click();
        });

        pending('Disabled as too random which marker gets deleted');
        it('should allow a marker to be deleted', function() {
          var e1 = markerIcons.last();
          e1.click();
          elemDeleteControl.click();
          e1.click();
          element(by.linkText(saveControlText)).click();
        });

        it('should allow deleting a marker to be cancelled', function() {
          var e1 = markerIcons.last();
          e1.click();
          elemDeleteControl.click();
          e1.click();
          element(by.linkText(cancelControlText)).click();
        });

        it('it should return to the itinerary page when the back button is clicked', function() {
          element(by.id('btn-back')).click();
          expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=[0-9]+/);
        });

      });

      describe('Routes', function() {
        var routeMarkerIcons;

        describe('editing', function() {

          beforeEach(function() {
            element(by.id('input-select-all-routes')).click();
            browser.element(by.id('btn-map')).click();
            routeMarkerIcons = element.all(by.css('.leaflet-editing-icon'));
            browser.wait(EC.elementToBeClickable(elemEditControl), 5000);
          });

          it('should allow a route creation to be cancelled', function() {
            elemCreatePolylineControl.click();
            element(by.linkText(cancelControlText)).click();
          });

          it('should allow a new route to be created and saved', function() {
            elemCreatePolylineControl.click();
            browser.actions()
              .mouseMove(elemMap, {x:500, y:180})
              .click()
              .mouseMove(elemMap, {x:600, y:200})
              .click()
              .mouseMove(elemMap, {x:700, y:250})
              .click()
              .perform();
            element(by.linkText(finishControlText)).click();
          });

          it('should allow a route to be updated', function() {
            elemEditControl.click();
            routeMarkerIcons.first().click();
            element(by.linkText(saveControlText)).click();
          });

        });

        describe('deleting routes', function() {

          beforeEach(function() {
            browser.element(by.id('btn-map')).click();
            browser.wait(EC.elementToBeClickable(elemCreatePolylineControl), 5000);
          });

          pending('Disabled as mouseMove functions have proven unreliable');
          it('should allow a route to be deleted', function() {
            elemCreatePolylineControl.click();
            if (takeScreenshots) {
              browser.takeScreenshot().then(function(png) {
                writeScreenshot(png, 'e2e-delete-route-test1.png');
              });
            }
            browser.actions()
              .mouseMove(elemMap, {x:500, y:180})
              .click()
              .mouseMove(elemMap, {x:550, y:180})
              .click()
              .mouseMove(elemMap, {x:600, y:200})
              .click()
              .mouseMove(elemMap, {x:650, y:200})
              .click()
              .mouseMove(elemMap, {x:500, y:300})
              .click()
              .mouseMove(elemMap, {x:450, y:250})
              .click()
              .perform();
            browser.sleep(1000);
            browser.actions()
              .mouseMove(elemMap, {x:150, y:150})
              .click()
              .mouseMove(elemMap, {x:400, y:220})
              .click()
              .mouseMove(elemMap, {x:700, y:250})
              .click()
              .perform();
            browser.sleep(1000);
            if (takeScreenshots) {
              browser.takeScreenshot().then(function(png) {
                writeScreenshot(png, 'e2e-delete-route-test2.png');
              });
            }
            element(by.linkText(finishControlText)).click();
            elemDeleteControl.click();
            browser.actions()
              .mouseMove(elemMap, {x:700, y:250})
              .click()
              .perform();
            element(by.linkText(saveControlText)).click();
          });

          it('should allow a route deletion to be cancelled', function() {
            elemCreatePolylineControl.click();
            browser.actions()
              .mouseMove(elemMap, {x:500, y:180})
              .click()
              .mouseMove(elemMap, {x:600, y:200})
              .click()
              .mouseMove(elemMap, {x:700, y:250})
              .click()
              .perform();
            element(by.linkText(finishControlText)).click();
            elemDeleteControl.click();
            browser.actions()
              .mouseMove(elemMap, {x:700, y:250})
              .click()
              .perform();
            element(by.linkText(cancelControlText)).click();
          });

        });

      });

    });

    describe('tracks', function() {

      beforeEach(function() {
        element(by.id('input-select-all-tracks')).click();
        browser.element(by.id('btn-map')).click();
        browser.wait(EC.visibilityOf(element(by.css('.leaflet-control-scale'))), 5000);
      });

      it('should display the tracks', function() {
        expect(element.all(by.tagName('path')).count()).toBeGreaterThan(0);
      });

    });

  });

  describe('itinerary owned and shared by someone else', function() {

    beforeEach(function() {
      browser.get(browser.baseUrl + '/itinerary?id=' + testSharedItineraryId);
    });

    it('should not display the edit-path button', function() {
      expect(element(by.id('btn-edit-path')).isDisplayed()).toBeFalsy();
      expect(element(by.id('btn-view-path')).isDisplayed()).toBeTruthy();
    });

    describe('waypoints', function() {

      beforeEach(function() {
        element(by.id('input-select-all-waypoints')).click();
        browser.element(by.id('btn-map')).click();
        markerIcons = element.all(by.css('.leaflet-marker-icon'));
        browser.wait(EC.visibilityOf(element(by.css('.leaflet-control-scale'))), 5000);
      });

      it('should display the waypoints', function() {
        expect(markerIcons.count()).toBeGreaterThan(2);
      });

    });

    describe('routes', function() {

      beforeEach(function() {
        element(by.id('input-select-all-routes')).click();
        browser.element(by.id('btn-map')).click();
        browser.wait(EC.visibilityOf(element(by.css('.leaflet-control-scale'))), 5000);
      });

      it('should display the routes', function() {
        expect(element.all(by.tagName('path')).count()).toBeGreaterThan(0);
        expect(elemCreateMarkerControl.isPresent()).toBe(false);
        expect(elemCreatePolylineControl.isPresent()).toBe(false);
        expect(elemEditControl.isPresent()).toBe(false);
        expect(elemDeleteControl.isPresent()).toBe(false);
      });

    });

    describe('tracks', function() {

      beforeEach(function() {
        element(by.id('input-select-all-tracks')).click();
        browser.element(by.id('btn-map')).click();
        browser.wait(EC.visibilityOf(element(by.css('.leaflet-control-scale'))), 5000);
      });

      it('should display the tracks', function() {
        expect(element.all(by.tagName('path')).count()).toBeGreaterThan(0);
        expect(elemCreateMarkerControl.isPresent()).toBe(false);
        expect(elemCreatePolylineControl.isPresent()).toBe(false);
        expect(elemEditControl.isPresent()).toBe(false);
        expect(elemDeleteControl.isPresent()).toBe(false);
      });

    });

  });

  describe('test cleanup', function() {
    var w1 = 10587, w2 = 10588, w3 = 10589,
        wptIds = [w1, w2, w3, 9356, 10795],
        routeIds = [8303, 8304];

    beforeEach(function() {
      browser.get(browser.baseUrl + '/itinerary?id=' + testItineraryId);
    });

    it('should reset the coordinates of the London waypoint ready for another test run', function() {
      element(by.id('input-waypoints-' + w1)).click();
      element(by.id('btn-edit-selected')).click();
      browser.waitForAngular();
      element(by.id('input-position')).clear();
      element(by.id('input-position')).sendKeys('51.513724,-0.098383');
      element(by.id('btn-save')).click();
    });

    it('should reset the coordinates of the Montpellier waypoint ready for another test run', function() {
      element(by.id('input-waypoints-' + w2)).click();
      element(by.id('btn-edit-selected')).click();
      browser.waitForAngular();
      element(by.id('input-position')).clear();
      element(by.id('input-position')).sendKeys('43.610694,3.876629');
      element(by.id('btn-save')).click();
    });

    it('should reset the coordinates of the Paris waypoint ready for another test run', function() {
      element(by.id('input-waypoints-' + w3)).click();
      element(by.id('btn-edit-selected')).click();
      browser.waitForAngular();
      element(by.id('input-position')).clear();
      element(by.id('input-position')).sendKeys('48.858222,2.2945');
      element(by.id('btn-save')).click();
    });

    it('should delete routes and waypoints that were created', function() {
      element(by.id('input-select-all-waypoints')).click();
      element(by.id('input-select-all-routes')).click();
      wptIds.forEach(function(v) {
        element(by.id('input-waypoints-' + v)).click();
      });
      routeIds.forEach(function(v) {
        element(by.id('input-route-' + v)).click();
      });
      element(by.id('btn-delete-gpx')).click();
      element.all((by.css('.confirm-button'))).get(1).click();
    });

  });

});
