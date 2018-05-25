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

describe('ItineraryTrackJoinCtrl', function() {

  beforeEach(module('myApp'));

  var scope,
      $httpBackend,
      $location,
      createController,
      selectionService,
      testRouteParams = {
        itineraryId: 42
      },
      testTrack1 = {
        id: 99,
        segments: [{
          points: [{id: 23, lat: 0, lng: 0}]
        }]
      },
      testTrack2 = {
        id: 100,
        segments: [{
          points: [{id: 44, lat: 0, lng: 0}]
        }]
      },
      testTracks = [testTrack1];

  beforeEach(inject(function(_$httpBackend_) {
    _$httpBackend_.when('GET', /^partials\/tracks.html$/).respond(null);
    _$httpBackend_.when('GET', /config\/map\/layers$/).respond([{text: 'simple test'}]);
    _$httpBackend_.when('GET', /path\/colors$/).respond(null);
  }));

  describe('join tracks', function() {

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller, _$location_, ItinerarySelectionService) {
      scope = $rootScope;
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      selectionService = ItinerarySelectionService;
      $httpBackend.when('GET', /^partials\/itinerary.html$/).respond(null);
      $httpBackend.when('POST', /itinerary\/\d+\/tracks\/selected/).respond(testTracks);
      $httpBackend.when('POST', /itinerary\/\d+\/track$/).respond(null);
      createController = function(routeParams) {
        return $controller('ItineraryTrackJoinCtrl', {
          $scope: scope,
          $routeParams: routeParams
        });
      };
      spyOn(selectionService, 'getChoices').and.callThrough();
    }));

    it('should fetch the selected tracks', function() {
      selectionService.setChoices({tracks: [1, 2]});
      createController(testRouteParams);
      $httpBackend.flush();
    });

    it('should join the selected tracks', function() {
      selectionService.setChoices({tracks: [1, 2]});
      createController(testRouteParams);
      $httpBackend.flush();
      scope.join();
      $httpBackend.flush();
    });

  });

});
