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

describe('Itineries page', function() {
  var list,
      EC = protractor.ExpectedConditions;

  beforeEach(function() {
    browser.get(browser.baseUrl + '/itineraries');
    browser.wait(EC.visibilityOf(element(by.repeater('itinerary in itineraries.payload'))), 4000, 'Timeout waiting for list to be populated');
    list = element.all(by.repeater('itinerary in itineraries.payload'));
  });

  it('should display at least one itinerary', function() {
    expect(list.first().all(by.tagName('td')).get(1).getText()).toMatch(/.+/);
  });

  it('should render links for editing each itinerary', function() {
    expect(list.first().all(by.tagName('a')).first().getAttribute('href')).toMatch(/\/itinerary\?id=[0-9]+/);
  });

  it('should show the edit page when an itinerary is clicked', function() {
    list.first().all(by.tagName('a')).first().click();
    expect(browser.getCurrentUrl()).toMatch(/(%2F|\/)itinerary(%3F|\?)id=[0-9]+/);
  });

});
