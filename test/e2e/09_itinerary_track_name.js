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

describe('Itinerary Track Name', function() {

  var testItineraryId=929,
      testTrackId = 1016;

  describe('Non-existant track ID', function() {

    beforeEach(function() {
      browser.get('app/index.html#itinerary-track-name?itineraryId=' + testItineraryId + '&trackId=-1');
    });

    it('should display a system error', function() {
      expect(element(by.id('system-error')).isDisplayed()).toBeTruthy();
    });

  });

  describe('edit', function() {

    beforeEach(function() {
      browser.get('app/index.html#itinerary-track-name?itineraryId=' + testItineraryId + '&trackId=' + testTrackId);
    });

    it('should fetch the track name', function() {
      expect(element(by.id('input-name')).isDisplayed()).toBeTruthy();
    });

    it('should allow an empty track name and color', function() {
      element(by.id('input-name')).clear();
      element(by.id('input-color')).sendKeys('-');
      element(by.id('btn-save')).click();
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=\d+/);
    });

    it('should save the amended track details', function() {
      element(by.id('input-name')).clear();
      element(by.id('input-name')).sendKeys('Modified track name');
      element(by.id('input-color')).sendKeys('g');
      element(by.id('btn-save')).click();
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=\d+/);
      browser.get('app/index.html#itinerary-track-name?itineraryId=' + testItineraryId + '&trackId=' + testTrackId);
      expect(element(by.id('input-name')).getAttribute('value')).toEqual('Modified track name');
      expect(element(by.id('input-color')).getAttribute('value')).toEqual('Green');
    });

    it('should save the amended track details again', function() {
      element(by.id('input-name')).clear();
      element(by.id('input-name')).sendKeys('Test track name');
      element(by.id('input-color')).sendKeys('y');
      element(by.id('btn-save')).click();
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=\d+/);
      browser.get('app/index.html#itinerary-track-name?itineraryId=' + testItineraryId + '&trackId=' + testTrackId);
      expect(element(by.id('input-name')).getAttribute('value')).toEqual('Test track name');
      expect(element(by.id('input-color')).getAttribute('value')).toEqual('Yellow');
    });

    it('should cancel the form when there are no changes', function() {
      element(by.id('btn-cancel')).click();
      element.all((by.css('.confirm-button'))).get(0).click();
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=\d+/);
    });

    it('should cancel the form if the confirm dialog is accepted', function() {
      element(by.id('input-name')).clear();
      element(by.id('input-name')).sendKeys('test change');
      element(by.id('input-color')).sendKeys('b');
      element(by.id('btn-cancel')).click();
      element.all((by.css('.confirm-button'))).get(0).click();
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=\d+/);
    });

    it('should not cancel the form if the confirm dialog is dismissed', function() {
      element(by.id('input-name')).clear();
      element(by.id('input-name')).sendKeys('test change');
      element(by.id('btn-cancel')).click();
      element.all((by.css('.cancel-button'))).get(0).click();
      expect(browser.getCurrentUrl()).toMatch(/itinerary-track-name\?itineraryId=\d+&trackId=\d+/);
    });

    it('should not reset the form when there are no changes', function() {
      var nameBefore = element(by.id('input-name')).getAttribute('value');
      var colorBefore = element(by.id('input-color')).getAttribute('value');
      element(by.id('btn-reset')).click();
      element.all((by.css('.cancel-button'))).get(1).click();
      expect(element(by.id('input-name')).getAttribute('value')).toEqual(nameBefore);
      expect(element(by.id('input-color')).getAttribute('value')).toEqual(colorBefore);
    });

    it('should reset the form if the confirm dialog is accepted', function() {
      var nameBefore = element(by.id('input-name')).getAttribute('value');
      var colorBefore = element(by.id('input-color')).getAttribute('value');
      element(by.id('input-name')).clear();
      element(by.id('input-name')).sendKeys('test do reset');
      element(by.id('input-color')).sendKeys('r');
      element(by.id('btn-reset')).click();
      element.all((by.css('.confirm-button'))).get(1).click();
      expect(element(by.id('input-name')).getAttribute('value')).toEqual(nameBefore);
      expect(element(by.id('input-color')).getAttribute('value')).toEqual(colorBefore);
    });

    it('should not reset the form if the confirm dialog is dismissed', function() {
      element(by.id('input-name')).clear();
      element(by.id('input-name')).sendKeys('name test do not reset');
      element(by.id('input-color')).sendKeys('r');
      element(by.id('btn-reset')).click();
      element.all((by.css('.cancel-button'))).get(1).click();
      expect(element(by.id('input-name')).getAttribute('value')).toEqual('name test do not reset');
      expect(element(by.id('input-color')).getAttribute('value')).toEqual('Red');
    });

  });

});
