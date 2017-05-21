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

describe('ItineraryTrackSegmentEditCtrl', function() {

  beforeEach(module('myApp'));

  var scope,
      $httpBackend,
      $location,
      createController,
      itineraryTrackSegmentParams = {
        itineraryId: '42',
        trackId: '66',
        segmentId: '99'
      },
      segments = {count: 2,
                  points:
                  [
                    {id: 1, selected: true},
                    {id: 2, selected: true}
                  ]},
      testSegment = {
        id: itineraryTrackSegmentParams.segmentId,
        points:
        [
          {id: 1, lat: 0, lng: 0},
          {id: 2, lat: 0, lng: 0},
          {id: 3, lat: 0, lng: 0},
          {id: 4, lat: 0, lng: 0}
        ]},
      splitSegments = {count: 4,
                       points:
                  [
                    {id: 1},
                    {id: 2, selected: true},
                    {id: 3},
                    {id: 4}
                  ]},
      testTracks = [
        {id: 1,
         segments: [
           testSegment
         ]
        }
      ];

  beforeEach(inject(function(_$httpBackend_) {
    _$httpBackend_.when('GET', /config\/map\/layers$/).respond([{text: 'simple test'}]);
  }));

  describe('delete points', function() {

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller, _$location_) {
      scope = $rootScope;
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      $httpBackend.when('GET', /itinerary\/\d+\/track\/\d+\/segment\/\d+\?offset=0&page_size=\d+$/).respond(segments);
      $httpBackend.when('GET', /itinerary\/\d+\/track\/\d+\/segment\/\d+$/).respond(testSegment);
      $httpBackend.when('PUT',
                        /itinerary\/\d+\/track\/\d+\/segment\/\d+\/delete-points$/,
                        function(data) {
                          return /"points":\[1,2\]/.test(data);
                        }
                       ).respond(null);
      createController = function(routeParams) {
        return $controller('ItineraryTrackSegmentEditCtrl', {
          $scope: scope,
          $routeParams: routeParams
        });
      };
    }));

    it('should fetch a list of points for a track segment', function() {
      createController(itineraryTrackSegmentParams);
      $httpBackend.flush();
      expect(scope.pageSize).toBeDefined();
      expect(scope.itineraryId).toEqual(itineraryTrackSegmentParams.itineraryId);
      expect(scope.trackId).toEqual(itineraryTrackSegmentParams.trackId);
      expect(scope.segmentId).toEqual(itineraryTrackSegmentParams.segmentId);
      expect(scope.totalCount).toEqual(segments.count);
      expect(scope.points).toEqual(segments.points);
    });

    it('should delete a list of points for a track segment', function() {
      createController(itineraryTrackSegmentParams);
      $httpBackend.flush();
      scope.deletePoints();
      $httpBackend.flush();
    });

  });

  describe('split segment', function() {

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller, _$location_) {
      scope = $rootScope;
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      $httpBackend.when('GET', /itinerary\/\d+\/track\/\d+\/segment\/\d+\?offset=0&page_size=\d+$/).respond(splitSegments);
      $httpBackend.when('GET', /itinerary\/\d+\/track\/\d+\/segment\/\d+$/).respond(testSegment);
      $httpBackend.when('POST', /itinerary\/\d+\/tracks\/selected$/).respond(testTracks);
      $httpBackend.when('POST',
                        /itinerary\/\d+\/track\/\d+$/,
                        function(data) {
                          return /"segments":.*"points":/.test(data);
                        }
                       ).respond(null);
      createController = function(routeParams) {
        return $controller('ItineraryTrackSegmentEditCtrl', {
          $scope: scope,
          $routeParams: routeParams
        });
      };
    }));

    it('should split a segment', function() {
      createController(itineraryTrackSegmentParams);
      $httpBackend.flush();
      scope.split();
      $httpBackend.flush();
    });

  });

});
