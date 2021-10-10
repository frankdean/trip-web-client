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

describe('Itinerary map', function() {

  var testName = '11_itinerary_map',
      takeScreenshots = browser.privateConfig.takeScreenshots;

  var EC = protractor.ExpectedConditions,
      elemMap,
      elemCreatePolylineControl,
      elemCreateMarkerControl,
      elemEditControl,
      elemDeleteControl,
      elemZoomOutControl,
      selectAllWaypoints,
      markerIcons,
      popups,
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
    elemZoomOutControl = element(by.css('.leaflet-control-zoom-out'));
    selectAllWaypoints = element(by.model('selection.allWaypointsSelected'));
  });

  describe('Itinerary owned by user', function() {
    var routesList, waypointsList, tracksList;

    beforeEach(function() {
      browser.get(browser.baseUrl + '/itinerary?id=' + testItineraryId);
      browser.sleep(100);
      browser.wait(EC.visibilityOf(element(by.id('features-tab'))), 500, 'Timeout waiting for features-tab to be displayed');
      element(by.id('features-tab')).click();
      browser.sleep(100);
      browser.wait(EC.visibilityOf(selectAllWaypoints), 4000);
      routesList = element.all(by.repeater('route in routeNames'));
      waypointsList = element.all(by.repeater('waypoint in waypoints'));
      tracksList = element.all(by.repeater('track in trackNames'));
    });

    it('should select all routes', function() {
      element(by.id('input-select-all-routes')).click();
      expect(routesList.all(by.model('route.selected')).first().getAttribute('checked').isSelected()).toBeTruthy();
      expect(routesList.all(by.model('route.selected')).get(1).getAttribute('checked').isSelected()).toBeTruthy();
    });

    it('should select all waypoints', function() {
      element(by.id('input-select-all-waypoints')).click();
      expect(waypointsList.all(by.model('waypoint.selected')).first().getAttribute('checked').isSelected()).toBeTruthy();
      expect(waypointsList.all(by.model('waypoint.selected')).get(1).getAttribute('checked').isSelected()).toBeTruthy();
      expect(waypointsList.all(by.model('waypoint.selected')).get(2).getAttribute('checked').isSelected()).toBeTruthy();
      expect(waypointsList.all(by.model('waypoint.selected')).get(3).getAttribute('checked').isSelected()).toBeTruthy();
      expect(waypointsList.all(by.model('waypoint.selected')).get(4).getAttribute('checked').isSelected()).toBeTruthy();
    });

    it('should select all tracks', function() {
      element(by.id('input-select-all-tracks')).click();
      expect(tracksList.all(by.model('track.selected')).first().getAttribute('checked').isSelected()).toBeTruthy();
      expect(tracksList.all(by.model('track.selected')).get(1).getAttribute('checked').isSelected()).toBeTruthy();
    });

    it('should select all routes, waypoints and tracks', function() {
      element(by.id('input-select-all')).click();
      expect(routesList.all(by.model('route.selected')).first().getAttribute('checked').isSelected()).toBeTruthy();
      expect(routesList.all(by.model('route.selected')).get(1).getAttribute('checked').isSelected()).toBeTruthy();
      expect(waypointsList.all(by.model('waypoint.selected')).first().getAttribute('checked').isSelected()).toBeTruthy();
      expect(waypointsList.all(by.model('waypoint.selected')).get(1).getAttribute('checked').isSelected()).toBeTruthy();
      expect(waypointsList.all(by.model('waypoint.selected')).get(2).getAttribute('checked').isSelected()).toBeTruthy();
      expect(waypointsList.all(by.model('waypoint.selected')).get(3).getAttribute('checked').isSelected()).toBeTruthy();
      expect(waypointsList.all(by.model('waypoint.selected')).get(4).getAttribute('checked').isSelected()).toBeTruthy();
      expect(tracksList.all(by.model('track.selected')).first().getAttribute('checked').isSelected()).toBeTruthy();
      expect(tracksList.all(by.model('track.selected')).get(1).getAttribute('checked').isSelected()).toBeTruthy();
    });

    describe('editing', function() {

      it('should display the edit-path button', function() {
        element(by.id('edit-pill')).click();
        helper.wait(100);
        expect(element(by.id('btn-edit-path')).isDisplayed()).toBeTruthy();
        expect(element(by.id('btn-view-path')).isDisplayed()).toBeFalsy();
      });

      describe('Waypoint editing', function() {

        beforeEach(function() {
          // browser.waitForAngular();
          element(by.id('features-tab')).click();
          browser.sleep(100);
          browser.wait(
            EC.and(
              EC.visibilityOf(selectAllWaypoints),
              EC.visibilityOf(element(by.id('input-select-all-waypoints'))),
              EC.elementToBeClickable(selectAllWaypoints)
            ),
            4000, 'Waypoint select-all element not found');
          selectAllWaypoints.click().then(function() {
            // expect(selectAllWaypoints.isSelected()).toBeTruthy();
            expect(element(by.model('selection.allWaypointsSelected')).isDisplayed()).toBeTruthy();
            element(by.id('view-pill')).click();
            helper.wait(300);
            browser.sleep(100);
            browser.element(by.id('btn-map')).click();
            browser.sleep(100);
            markerIcons = element.all(by.css('.leaflet-marker-icon'));
            browser.wait(EC.elementToBeClickable(elemEditControl), 4000);
          });
          // Zoom out, otherwise sometimes the marker is partly off the map
          element(by.css('.leaflet-control-zoom-out')).click();
          helper.wait(300);
          browser.sleep(400);
        });

        it('should display the waypoints on the map', function() {
          expect(markerIcons.count()).toBeGreaterThan(2);
        });

        it('should display the waypoint label on the map', function() {
          markerIcons = element.all(by.css('.leaflet-marker-icon'));
          browser.sleep(400);
          markerIcons.first().click();
          browser.sleep(400);
          helper.takeScreenshot(testName + '_display_map_markers_test1', takeScreenshots);
          popups = element.all(by.css('.leaflet-popup-content'));
          expect(popups.count()).toEqual(1);
          expect(popups.first().getText()).toMatch(/London/);
        });

        it('should allow a marker to be deleted', function() {
          browser.wait(EC.elementToBeClickable(elemEditControl), 4000);
          var count = element.all(by.css('.leaflet-marker-icon')).count();
          // Test data is set up with 5 markers
          expect(count).toEqual(5);
          elemCreateMarkerControl.click();
          helper.wait(400);
          browser.actions()
            .mouseMove(elemMap, {x:150, y:150})
            .click()
            .perform();
          helper.wait(800);
          // Check the number of markers is incremented
          expect(element.all(by.css('.leaflet-marker-icon')).count()).toEqual(6);
          // Then delete it at that position
          browser.actions()
            .mouseMove(elemMap, {x:150, y:150})
            .click()
            .perform();
          elemDeleteControl.click();
          markerIcons.last().click();
          elemZoomOutControl.click();
          element(by.linkText(saveControlText)).click();
          expect(element.all(by.css('.leaflet-marker-icon')).count()).toEqual(count);
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
          if (browser.privateConfig.browserName.toLowerCase() == 'safari') {
            browser.actions()
              .mouseDown(e1)
              .mouseMove(e1, {x:10, y: 10})
              // .mouseMove(e1, {x:20, y: 20})
              // .mouseMove(elemMap, {x:100, y:20})
              .mouseUp()
              .perform();
          } else {
            browser.actions()
              .mouseDown(e1)
              .mouseMove(e1, {x:10, y: 10})
              .mouseMove(e1, {x:20, y: 20})
              .mouseMove(elemMap, {x:100, y:20})
              .mouseUp()
              .perform();
          }
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

        it('should allow deleting a marker to be cancelled', function() {
          if (browser.privateConfig.browserName.toLowerCase() !== 'safari') {
            var e1 = markerIcons.first();
            elemDeleteControl.click();
            e1.click();
            element(by.linkText(cancelControlText)).click();
          }
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
            browser.sleep(100);
            element(by.id('view-pill')).click();
            helper.wait(300);
            browser.sleep(100);
            browser.element(by.id('btn-map')).click();
            browser.sleep(100);
            routeMarkerIcons = element.all(by.css('.leaflet-editing-icon'));
            browser.wait(EC.elementToBeClickable(elemEditControl), 4000);
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
              .mouseMove(elemMap, {x:450, y:200})
              .click()
              .mouseMove(elemMap, {x:400, y:190})
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
            // By selecting a waypoint, we stop the app attempting to establish the
            // current location which appears to interfere with creating the polyline.
            element(by.xpath('//*[@id="table-waypoints"]/tbody/tr[2]/td[1]/label')).click();
            browser.sleep(100);
            element(by.id('view-pill')).click();
            helper.wait(300);
            browser.sleep(100);
            browser.element(by.id('btn-map')).click();
            browser.sleep(100);
            browser.wait(EC.elementToBeClickable(elemCreatePolylineControl), 4000);
          });

          it('should allow a route to be deleted', function() {
            elemCreatePolylineControl.click();
            browser.sleep(100);
            helper.takeScreenshot(testName + '_delete_route_test_01', takeScreenshots);
            browser.actions()
              .mouseMove(elemMap, {x:500, y:180})
              .click();
            // helper.takeScreenshot(testName + '_delete_route_test_02', takeScreenshots);
            browser.actions()
              .mouseMove(elemMap, {x:490, y:180})
              .click();
            // helper.takeScreenshot(testName + '_delete_route_test_03', takeScreenshots);
            browser.actions()
              .mouseMove(elemMap, {x:480, y:200})
              .click();
            // helper.takeScreenshot(testName + '_delete_route_test_04', takeScreenshots);
            browser.actions()
              .mouseMove(elemMap, {x:495, y:200})
              .click();
            // helper.takeScreenshot(testName + '_delete_route_test_05', takeScreenshots);
            browser.actions()
              .mouseMove(elemMap, {x:500, y:300})
              .click();
            // helper.takeScreenshot(testName + '_delete_route_test_06', takeScreenshots);
            browser.actions()
              .mouseMove(elemMap, {x:450, y:250})
              .click();
            // helper.takeScreenshot(testName + '_delete_route_test_07', takeScreenshots);
            browser.actions()
              .mouseMove(elemMap, {x:150, y:150})
              .click();
            // helper.takeScreenshot(testName + '_delete_route_test_08', takeScreenshots);
            browser.actions()
              .mouseMove(elemMap, {x:400, y:220})
              .click();
            // helper.takeScreenshot(testName + '_delete_route_test_09', takeScreenshots);
            browser.actions()
              .mouseMove(elemMap, {x:470, y:250})
              .click();
            // helper.takeScreenshot(testName + '_delete_route_test_10', takeScreenshots);
            browser.actions()
              .perform();
            helper.takeScreenshot(testName + '_delete_route_test_20', takeScreenshots);
            browser.sleep(100);
            helper.takeScreenshot(testName + '_delete_route_test_30', takeScreenshots);
            element(by.linkText(finishControlText)).click();
            browser.sleep(100);
            elemDeleteControl.click();
            browser.sleep(100);
            browser.actions()
              .mouseMove(elemMap, {x:150, y:150})
              .click()
              .perform();
            browser.sleep(100);
            element(by.linkText(saveControlText)).click();
          });

          it('should allow a route deletion to be cancelled', function() {
            elemCreatePolylineControl.click();
            browser.sleep(100);
            browser.actions()
              .mouseMove(elemMap, {x:500, y:180})
              .click()
              .mouseMove(elemMap, {x:490, y:200})
              .click()
              .mouseMove(elemMap, {x:240, y:250})
              .click()
              .perform();
            element(by.linkText(finishControlText)).click();
            elemDeleteControl.click();
            browser.sleep(100);
            browser.actions()
              .mouseMove(elemMap, {x:240, y:250})
              .click()
              .perform();
            // element(by.linkText(cancelControlText)).click();
            element(by.xpath('//*[@id="template"]/div/div/div[5]/div[3]/div[2]/div/div[2]/ul/li[2]/a')).click();
          });

        });

      });

    });

    describe('tracks', function() {
      var eachItineraryCounter = 0;

      beforeEach(function() {
        if (browser.privateConfig.browserName.toLowerCase() == 'safari') {
          // Doesn't seem to scroll to element properly in Safari
          browser.sleep(400);
          element(by.xpath('//*[@id="tracks"]/div/div')).click();
          browser.sleep(400);
        }
        element(by.id('input-select-all-tracks')).click();
        helper.wait(800);
        helper.takeScreenshot(testName + '_view_tracks_' + ('0000' + (++eachItineraryCounter)).substr(-4, 4), takeScreenshots);
        element(by.id('view-pill')).click();
        helper.wait(400);
        browser.element(by.id('btn-map')).click();
        helper.wait(800);
        browser.wait(EC.visibilityOf(element(by.css('.leaflet-control-scale'))), 4000);
      });

      it('should display the tracks', function() {
        helper.wait(400);
        helper.takeScreenshot(testName + '_display_tracks_on_map', takeScreenshots);
        expect(element.all(by.tagName('path')).count()).toBeGreaterThan(0);
      });

    });

    describe('live updates', function() {
      var nicknames;

      beforeEach(function() {
        element(by.id('input-select-all-tracks')).click();
        element(by.id('view-pill')).click();
        helper.wait(400);
        browser.element(by.id('btn-map')).click();
        browser.wait(EC.visibilityOf(element(by.css('.leaflet-control-scale'))), 4000);
        element(by.id('input-live-map')).click();
        nicknames = element.all(by.repeater('nickname in data.nicknames'));
        helper.wait(400);
      });

      it('should display user\'s own nickname when live map enabled', function() {
        // expect(browser.isElementPresent(by.tagName('label'))).toBeTruthy();
        // var label1 = element(by.binding('data.myNickname'));
        // expect(label1.getText()).toBe('user');
        expect(element(by.binding('data.myNickname')).getText()).toBe('user');
        expect(nicknames.all(by.binding('nickname.nickname')).first().getText()).toBe('Fred');
        expect(nicknames.all(by.binding('nickname.nickname')).get(1).getText()).toBe('test2');
      });

    });

  });

  describe('itinerary owned and shared by someone else', function() {

    beforeEach(function() {
      browser.get(browser.baseUrl + '/itinerary?id=' + testSharedItineraryId);
      browser.wait(EC.visibilityOf(element(by.id('features-tab'))), 500, 'Timeout waiting for itinerary page to be displayed');
      element(by.id('features-tab')).click();
      helper.wait(400);
    });

    it('should not display the edit-path button', function() {
      expect(element(by.id('edit-pill')).isDisplayed()).toBeTruthy();
      expect(element(by.id('view-pill')).isDisplayed()).toBeTruthy();
      element(by.id('view-pill')).click();
      helper.wait(400);
      expect(element(by.id('btn-view-path')).isDisplayed()).toBeTruthy();
    });

    describe('waypoints', function() {

      beforeEach(function() {
        element(by.id('input-select-all-waypoints')).click();
        element(by.id('view-pill')).click();
        browser.element(by.id('btn-map')).click();
        markerIcons = element.all(by.css('.leaflet-marker-icon'));
        browser.wait(EC.visibilityOf(element(by.css('.leaflet-control-scale'))), 4000);
        helper.wait(400);
      });

      it('should display the waypoints', function() {
        expect(markerIcons.count()).toBeGreaterThan(2);
      });

    });

    describe('routes', function() {

      beforeEach(function() {
        helper.wait(400);
        element(by.id('input-select-all-routes')).click();
        helper.wait(400);
        element(by.id('view-pill')).click();
        helper.wait(400);
        browser.element(by.id('btn-map')).click();
        browser.wait(EC.visibilityOf(element(by.css('.leaflet-control-scale'))), 4000);
        helper.wait(400);
      });

      it('should display the routes', function() {
        helper.wait(800);
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
        element(by.id('view-pill')).click();
        helper.wait(400);
        browser.element(by.id('btn-map')).click();
        browser.wait(EC.visibilityOf(element(by.css('.leaflet-control-scale'))), 4000);
        helper.wait(400);
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
      browser.wait(EC.visibilityOf(element(by.id('features-tab'))), 500, 'Timeout waiting for itinerary page to be displayed');
      element(by.id('features-tab')).click();
      browser.wait(EC.visibilityOf(element(by.id('edit-pill'))), 500, 'Timeout waiting for itinerary features tab to be displayed');
    });

    it('should reset the coordinates of the London waypoint ready for another test run', function() {
      element(by.id('input-waypoints-' + w1)).click();
      element(by.id('edit-pill')).click();
      helper.wait(400);
      element(by.id('btn-edit-selected')).click();
      browser.waitForAngular();
      element(by.id('input-position')).clear();
      element(by.id('input-position')).sendKeys('51.513724,-0.098383');
      element(by.id('btn-save')).click();
    });

    it('should reset the coordinates of the Montpellier waypoint ready for another test run', function() {
      element(by.id('input-waypoints-' + w2)).click();
      element(by.id('edit-pill')).click();
      helper.wait(400);
      element(by.id('btn-edit-selected')).click();
      browser.waitForAngular();
      element(by.id('input-position')).clear();
      element(by.id('input-position')).sendKeys('43.610694,3.876629');
      element(by.id('btn-save')).click();
    });

    it('should reset the coordinates of the Paris waypoint ready for another test run', function() {
      element(by.id('input-waypoints-' + w3)).click();
      element(by.id('edit-pill')).click();
      helper.wait(400);
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
      element(by.id('edit-pill')).click();
      helper.wait(400);
      element(by.id('btn-delete')).click();
      element(by.xpath('/html/body/div[5]/div[2]/div/div[1]/button')).click();
    });

  });

});
