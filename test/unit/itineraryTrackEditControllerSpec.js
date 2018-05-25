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

describe('ItineraryTrackEditCtrl', function() {

  beforeEach(module('myApp'));

  var scope,
      $httpBackend,
      $location,
      createController,
      itineraryTrackParams = {
        itineraryId: '42',
        trackId: '99'
      },
      segments = {count: 0, track: {
        segments: [
          {id: 1, selected: true},
          {id: 2, selected: true}
        ]}},
      splitTrack = {count: 0, track: {
        segments: [
          {id: 1},
          {id: 2, selected: true},
          {id: 3},
          {id: 4}
        ]}},
      testTracks = [
        {id: itineraryTrackParams.itineraryId,
         segments: [
          {id: 1},
          {id: 2},
          {id: 3},
          {id: 4}
         ]
        }
      ];

  beforeEach(inject(function(_$httpBackend_) {
    _$httpBackend_.when('GET', /config\/map\/layers$/).respond([{text: 'simple test'}]);
    _$httpBackend_.when('GET', /^partials\/tracks.html$/).respond(null);
 }));

  describe('delete segments', function() {

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller, _$location_) {
      scope = $rootScope;
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      $httpBackend.when('GET', /itinerary\/\d+\/track\/\d+\/segment\?offset=0&page_size=\d+$/).respond(segments);
      $httpBackend.when('PUT',
                        /itinerary\/\d+\/track\/\d+\/delete-segments$/,
                        function(data) {
                          return /"segments":\[1,2\]/.test(data);
                        }
                       ).respond(null);
      createController = function(routeParams) {
        return $controller('ItineraryTrackEditCtrl', {
          $scope: scope,
          $routeParams: routeParams
        });
      };
    }));

    it('should fetch a list of track segments', function() {
      createController(itineraryTrackParams);
      $httpBackend.flush();
      expect(scope.data).toBeDefined();
    });

    it('should delete a list of track segments', function() {
      createController(itineraryTrackParams);
      $httpBackend.flush();
      scope.deleteSegments();
      $httpBackend.flush();
    });

  });

  describe('split track', function() {

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller, _$location_) {
      scope = $rootScope;
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      $httpBackend.when('GET', /^partials\/itinerary.html$/).respond(null);
      $httpBackend.when('GET', /itinerary\/\d+\/track\/\d+\/segment\?offset=0&page_size=\d+$/).respond(splitTrack);
      $httpBackend.when('POST', /itinerary\/\d+\/tracks\/selected$/).respond(testTracks);
      $httpBackend.when('PUT',
                        /itinerary\/\d+\/track\/\d+\/delete-segments$/,
                        function(data) {
                          return /"segments":\[2,3,4\]/.test(data);
                        }
                       ).respond(null);
      $httpBackend.when('POST', /itinerary\/\d+\/track$/,
                        function(data) {
                          return /"track":.*"segments":/.test(data);
                        }
                       ).respond(null);
      createController = function(routeParams) {
        return $controller('ItineraryTrackEditCtrl', {
          $scope: scope,
          $routeParams: routeParams
        });
      };
    }));

    it('should split a track', function() {
      createController(itineraryTrackParams);
      $httpBackend.flush();
      scope.split();
      $httpBackend.flush();
    });

  });

});
