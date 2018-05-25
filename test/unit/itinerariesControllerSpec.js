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

describe('ItinerariesCtrl', function() {

  beforeEach(module('myApp'));

  var scope, $location, $httpBackend, requestHandler, createController, itineraryService;
  var testItineraries =
      [{id: 1,
        date: null,
        title: 'Test 1'
       },
       {id: 2,
        date: '2016-03-08',
        TITLE: 'Test 2'
       }];

  beforeEach(inject(function(_$httpBackend_,
                             $rootScope,
                             $controller,
                             _$location_,
                             ItineraryService) {
    _$httpBackend_.when('GET', /^partials\/tracks.html$/).respond(null);
    $httpBackend = _$httpBackend_;
    scope = $rootScope;
    requestHandler = $httpBackend.when('GET', /itineraries\?offset=0&page_size=[0-9]+$/).respond({payload: testItineraries, count: testItineraries.length});
    $location = _$location_;
    itineraryService = ItineraryService;
    createController = function() {
      return $controller('ItinerariesCtrl', {$scope: scope});
    };
  }));

  it('should redirect to the new itinerary page when the new button is clicked', function() {
    createController();
    spyOn($location, 'path').and.stub();
    scope.newItinerary();
    expect($location.path.calls.argsFor(0)).toEqual(['/itinerary-edit']);
  });

  it('should fetch a list of itineraries', function() {
    spyOn(itineraryService, 'query').and.callThrough();
    createController();
    $httpBackend.flush();
    expect(scope.itineraries).toBeDefined();
    expect(scope.itineraries.count).toBeDefined();
    expect(scope.itineraries.payload).toBeDefined();
    expect(scope.itineraries.count).toEqual(testItineraries.length);
    expect(scope.totalCount).toEqual(testItineraries.length);
    expect(scope.ajaxRequestError.error).toBeFalsy();
  });

  it('should show an error when the backend call fails', function() {
    createController();
    requestHandler.respond(500, '');
    $httpBackend.flush();
    expect(scope.ajaxRequestError.error).toBeTruthy();
  });

});
