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

describe('Itinerary search', function() {

  describe('input', function() {

    beforeEach(function() {
      browser.get(browser.baseUrl + '/itinerary-search');
    });

    it('should accept valid values', function() {
      element(by.id('input-position')).sendKeys('48.858222,2.2945');
      element(by.id('input-distance')).sendKeys('0.9001');
      element(by.id('btn-search')).click();
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary-search-result\?lat=48\.858222&lng=2\.2945&distance=900\.1$/);
    });

    it('should not submit an invalid form', function() {
      element(by.id('btn-search')).click();
      expect(element(by.id('position-required')).isDisplayed()).toBeTruthy();
      expect(element(by.id('distance-required')).isDisplayed()).toBeTruthy();
    });

    it('should reject an invalid position', function() {
      element(by.id('input-position')).sendKeys('48.858222');
      expect(element(by.id('position-invalid')).isDisplayed()).toBeTruthy();
      element(by.id('input-distance')).sendKeys('-1');
      element(by.id('btn-search')).click();
      expect(element(by.id('range-error-distance')).isDisplayed()).toBeTruthy();
    });

  });
  
});
