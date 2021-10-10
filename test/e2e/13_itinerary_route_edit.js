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

describe('Itinerary Route Edit', function() {

  var testName = '13_itinerary_route_edit',
      takeScreenshots = browser.privateConfig.takeScreenshots;

  var testItineraryId = 2425,
      testSharedItineraryId = 983,
      testSharedRouteId = 8309,
      testRouteId_01 = 8312,
      testRouteId_02 = 8313,
      list,
      EC = protractor.ExpectedConditions;

  describe('attributes', function() {

    beforeEach(function() {
      browser.get(browser.baseUrl + '/itinerary-route-edit?itineraryId=' + testItineraryId + '&routeId=' + testRouteId_01 + '&shared=false');
      browser.wait(EC.visibilityOf(element(by.id('route-name'))), 4000, 'Timeout waiting for itinerary route edit page to be displayed');
    });

    it('should show the route name', function() {
      expect(element(by.id('route-name')).getText()).toEqual('Test route 01');
      expect(element(by.id('route-color')).getText()).toEqual('Green');
    });

    it('should allow an empty route name to be saved', function() {
      if (browser.privateConfig.browserName.toLowerCase() !== 'safari') {
        element(by.id('btn-edit-attributes')).click();
        element(by.id('input-name')).clear();
        element(by.id('btn-save-attributes')).click();
        expect(element(by.id('route-name')).getText()).toEqual('ID: ' + testRouteId_01);
      }
    });

    it('should allow an empty route name to be modified', function() {
      if (browser.privateConfig.browserName.toLowerCase() !== 'safari') {
        element(by.id('btn-edit-attributes')).click();
        element(by.id('input-name')).clear();
        element(by.id('input-name')).sendKeys('Test route 01');
        element(by.id('btn-save-attributes')).click();
        expect(element(by.id('route-name')).getText()).toEqual('Test route 01');
      }
    });

    it('should close the form when the close button is clicked when editing is not active', function() {
      expect(element(by.id('btn-close')).isDisplayed()).toBeTruthy();
      expect(element(by.id('btn-cancel')).isDisplayed()).toBeFalsy();
      element(by.id('btn-close')).click();
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=\d+/);
    });

    it('should not close the form when the cancel button is clicked and cancelled', function() {
      if (browser.privateConfig.browserName.toLowerCase() !== 'safari') {
        element(by.id('btn-edit-attributes')).click();
        expect(element(by.id('btn-cancel')).isDisplayed()).toBeTruthy();
        expect(element(by.id('btn-close')).isDisplayed()).toBeFalsy();
        element(by.id('btn-cancel')).click();
        element(by.xpath('/html/body/div[4]/div[2]/div/div[2]/button')).click();
        expect(browser.getCurrentUrl()).toMatch(/\/itinerary-route-edit\?itineraryId=\d+&routeId=\d+&shared=false/);
      }
    });

    it('should close the form when the cancel button is clicked and confirmed', function() {
      if (browser.privateConfig.browserName.toLowerCase() !== 'safari') {
        element(by.id('btn-edit-attributes')).click();
        expect(element(by.id('btn-cancel')).isDisplayed()).toBeTruthy();
        expect(element(by.id('btn-close')).isDisplayed()).toBeFalsy();
        element(by.id('btn-cancel')).click();
        element(by.xpath('/html/body/div[4]/div[2]/div/div[1]/button')).click();
        expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=\d+/);
      }
    });

    it('should reverse the route', function() {
      if (browser.privateConfig.browserName.toLowerCase() !== 'safari') {
        expect(element(by.xpath('//*[@id="template"]/div/div/div[3]/div[2]/form/div/p[5]/span[3]')).getText()).toEqual('↗︎1,194 m ↘︎1,445 m');
        element(by.id('btn-reverse')).click();
        browser.waitForAngular();
        expect(element(by.xpath('//*[@id="template"]/div/div/div[3]/div[2]/form/div/p[5]/span[3]')).getText()).toEqual('↗︎1,445 m ↘︎1,194 m');
        element(by.id('btn-reverse')).click();
        browser.waitForAngular();
        expect(element(by.xpath('//*[@id="template"]/div/div/div[3]/div[2]/form/div/p[5]/span[3]')).getText()).toEqual('↗︎1,194 m ↘︎1,445 m');
      }
    });

  });

  describe('Join routes', function() {

    beforeEach(function() {
      browser.get(browser.baseUrl + '/itinerary?id=' + testItineraryId);
      browser.wait(EC.visibilityOf(element(by.id('features-tab'))), 4000, 'Timeout waiting for features tab to be displayed');
      element(by.id('features-tab')).click();
      helper.wait();
      element(by.id('input-route-' + testRouteId_01)).click();
      element(by.id('input-route-' + testRouteId_02)).click();
      element(by.id('edit-pill')).click();
      helper.wait();
      element(by.id('btn-join-path')).click();
      helper.wait(800);
      list = element.all(by.repeater('route in routes'));
      helper.wait(800);
    });

    it('should display the two routes', function() {
      expect(element(by.xpath('//*[@id="routes-table"]/tbody/tr[1]/td[2]/span')).getText()).toEqual('Test route 01');
      expect(element(by.xpath('//*[@id="routes-table"]/tbody/tr[2]/td[2]/span')).getText()).toEqual('Test route 02');
    });

    it('should return to the itinerary when cancel is selected', function() {
      element(by.id('btn-cancel')).click();
      element.all((by.css('.confirm-button'))).get(1).click();
      helper.wait();
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=\d+/);
    });

    it('should move the last route up in the list', function() {
      element.all((by.css('.btn-info'))).get(2).click();
      helper.wait();
      helper.takeScreenshot(testName + '_move_joined_route', takeScreenshots);
      expect(element(by.xpath('//*[@id="routes-table"]/tbody/tr[1]/td[2]/span')).getText()).toEqual('Test route 02');
      expect(element(by.xpath('//*[@id="routes-table"]/tbody/tr[2]/td[2]/span')).getText()).toEqual('Test route 01');
    });

    it('should create a new route when the join button is clicked', function() {
      element(by.id('input-name')).clear();
      element(by.id('input-name')).sendKeys('Test route 03');
      element(by.id('input-color')).sendKeys('R');
      element(by.id('btn-join')).click();
      element.all((by.css('.confirm-button'))).get(0).click();
      helper.wait();
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=\d+/);
    });

  });

  describe('Route points', function() {
    var points;

    beforeEach(function() {
      browser.get(browser.baseUrl + '/itinerary?id=' + testItineraryId);
      browser.wait(EC.visibilityOf(element(by.id('features-tab'))), 4000, 'Timeout waiting for features tab to be displayed');
      element(by.id('features-tab')).click();
      list = element.all(by.repeater('route in routeNames'));
      list.get(2).all(by.tagName('td')).get(0).click();
      helper.wait();
      element(by.id('edit-pill')).click();
      helper.wait();
      element(by.id('btn-edit-path')).click();
      helper.wait(800);
      browser.wait(EC.visibilityOf(element(by.repeater('point in data.points'))), 4000, 'Timeout waiting for points to be displayed');
      points = element.all(by.repeater('point in data.points'));
      helper.wait(800);
    });

    it('should select all points', function() {
      var pointElements = element.all(by.repeater('point in data.points'));
      element(by.id('select-all-points')).click();
      helper.wait();
      expect(pointElements.all(by.model('point.selected')).first().getAttribute('checked').isSelected()).toBeTruthy();
      expect(pointElements.all(by.model('point.selected')).get(1).getAttribute('checked').isSelected()).toBeTruthy();
      expect(pointElements.all(by.model('point.selected')).get(9).getAttribute('checked').isSelected()).toBeTruthy();
      element(by.id('select-all-points')).click();
      expect(pointElements.all(by.model('point.selected')).first().getAttribute('checked').isSelected()).toBeFalsy();
      expect(pointElements.all(by.model('point.selected')).get(1).getAttribute('checked').isSelected()).toBeFalsy();
      expect(pointElements.all(by.model('point.selected')).get(9).getAttribute('checked').isSelected()).toBeFalsy();
    });

    it('should display the edit buttons', function() {
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary-route-edit\?itineraryId=\d+&routeId=\d+&shared=false/);
      expect(element(by.id('div-buttons')).isDisplayed()).toBeTruthy();
      expect(element(by.id('btn-delete')).isDisplayed()).toBeTruthy();
      expect(element(by.id('btn-split')).isDisplayed()).toBeTruthy();
      expect(element(by.id('system-error')).isDisplayed()).toBeFalsy();
    });

    it('should allow a single point to be deleted', function() {
      points.get(9).all(by.tagName('td')).get(0).click();
      element(by.id('btn-delete')).click();
      helper.wait();
      element.all((by.css('.confirm-button'))).get(0).click();
    });

    it('should allow multiple points to be deleted', function() {
      points.get(1).all(by.tagName('td')).get(0).click();
      points.get(2).all(by.tagName('td')).get(0).click();
      element(by.id('btn-delete')).click();
      helper.wait();
      element.all((by.css('.confirm-button'))).get(0).click();
    });

    it('should not allow multiple points to be selected to split the route', function() {
      points.get(1).all(by.tagName('td')).get(0).click();
      points.get(2).all(by.tagName('td')).get(0).click();
      element(by.id('btn-split')).click();
      element.all((by.css('.confirm-button'))).get(1).click();
      helper.wait();
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
      helper.wait();
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=\d+/);
    });

  });

  describe('Read only', function() {

    beforeEach(function() {
      browser.get(browser.baseUrl + '/itinerary?id=' + testSharedItineraryId);
      element(by.id('features-tab')).click();
      list = element.all(by.repeater('route in routeNames'));
      list.get(0).all(by.tagName('td')).get(0).click();
      element(by.id('view-pill')).click();
      helper.wait();
      element(by.id('btn-view-path')).click();
      helper.wait(800);
    });

    it('should not display the edit buttons', function() {
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary-route-edit\?itineraryId=\d+&routeId=\d+&shared=true/);
      expect(element(by.id('div-buttons')).isDisplayed()).toBeFalsy();
      expect(element(by.id('btn-delete')).isDisplayed()).toBeFalsy();
      expect(element(by.id('btn-split')).isDisplayed()).toBeFalsy();
      expect(element(by.id('btn-edit-attributes')).isDisplayed()).toBeFalsy();
    });

  });

  describe('Handling of routes with no name', function() {

    beforeEach(function() {
      browser.get(browser.baseUrl + '/itinerary?id=' + testItineraryId);
      browser.wait(EC.visibilityOf(element(by.id('features-tab'))), 4000, 'Timeout waiting for features tab to be displayed');
      element(by.id('features-tab')).click();
      helper.wait(400);
      element(by.id('input-route-' + testRouteId_01)).click();
      element(by.id('input-route-' + testRouteId_02)).click();
      element(by.id('edit-pill')).click();
      helper.wait(100);
      element(by.id('btn-join-path')).click();
      helper.wait(100);
      list = element.all(by.repeater('route in routes'));
    });

    it('should allow creation of a new route with no name', function() {
      element(by.id('input-name')).clear();
      helper.wait(100);
      element(by.id('btn-join')).click();
      element.all((by.css('.confirm-button'))).get(0).click();
      helper.wait(800);
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=\d+/);
    });

    describe('Display of route names', function() {

      beforeEach(function() {
        browser.get(browser.baseUrl + '/itinerary?id=' + testItineraryId);
        browser.wait(EC.visibilityOf(element(by.id('features-tab'))), 4000, 'Timeout waiting for features tab to be displayed');
        element(by.id('features-tab')).click();
        browser.wait(EC.visibilityOf(element(by.id('input-select-all-routes'))), 4000, 'Timeout waiting for routes to be displayed');
        element(by.id('input-select-all-routes')).click();
        element(by.id('edit-pill')).click();
        helper.wait(100);
        element(by.id('btn-join-path')).click();
        helper.wait(400);
        browser.wait(EC.visibilityOf(element(by.repeater('route in routes'))), 4000, 'Timeout waiting for routes to be displayed');
        list = element.all(by.repeater('route in routes'));
      });

      // Test expects one of the previous tests to have created a route with no name
      it('should show route names, even when route has no name', function() {
        expect(list.first().all(by.tagName('td')).get(1).getText()).toMatch(/.+/);
        expect(list.get(1).all(by.tagName('td')).get(1).getText()).toMatch(/.+/);
        expect(list.get(2).all(by.tagName('td')).get(1).getText()).toMatch(/.+/);
      });

    });

  });

  describe('Cleanup', function() {

    beforeEach(function() {
      browser.get(browser.baseUrl + '/itinerary?id=' + testItineraryId);
      browser.wait(EC.visibilityOf(element(by.id('features-tab'))), 4000, 'Timeout waiting for features tab to be displayed');
      element(by.id('features-tab')).click();
      browser.wait(EC.visibilityOf(element(by.id('input-select-all-routes'))), 4000, 'Timeout waiting for features tab to be displayed');
    });

    it('should remove routes we created during testing', function() {
      element(by.id('input-select-all-routes')).click();
      element(by.id('input-route-' + testRouteId_01)).click();
      element(by.id('input-route-' + testRouteId_02)).click();
      element(by.id('edit-pill')).click();
      helper.wait(400);
      element(by.id('btn-delete')).click();
      helper.wait(400);
      // The confirmation to delete button
      element(by.xpath('/html/body/div[5]/div[2]/div/div[1]/button')).click();
    });

  });

});
