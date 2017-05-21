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

describe('ItineraryRouteEditCtrl', function() {

  beforeEach(module('myApp'));

  var scope,
      $httpBackend,
      $location,
      createController,
      testRouteParams = {
        itineraryId: 42,
        routeId: 28
      },
      testRouteInfo = {
        name: 'route name',
        color: 'red'
      },
      testPoints = {
        count: 99,
        points: [{id: 1, lat: 0, lng: 0, selected: true},
                 {id: 2, lat: 1, lng: -1},
                 {id: 3, lat: 1, lng: -1, selected: true}
                ]
      },
      testSplitPoints = {
        count: 99,
        points: [{id: 1, lat: 0, lng: 0},
                 {id: 2, lat: 1, lng: -1, selected: true},
                 {id: 3, lat: 1, lng: -1}
                ]
      },
      testSplitRouteInfo = {
        id: 36,
        name: 'route name',
        color: 'red',
        points: testSplitPoints.points
      };

    beforeEach(inject(function(_$httpBackend_) {
    _$httpBackend_.when('GET', /config\/map\/layers$/).respond([{text: 'simple test'}]);
  }));


  describe('Get route info', function() {

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller, _$location_) {
      scope = $rootScope;
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      $httpBackend.when('GET', /\/itinerary\/\d+\/route\/\d+$/).respond(testRouteInfo);
      $httpBackend.when('PUT', /\/itinerary\/\d+\/route\/\d+\/delete-points$/,
                        function(data) {
                          return /"points":\[1,3\]/.test(data);
                        }
                       ).respond(testRouteInfo);
      $httpBackend.when('GET', /\/itinerary\/\d+\/route\/\d+\/points(\?offset=\d+&page_size=\d+)?$/).respond(testPoints);
      createController = function(routeParams) {
        return $controller('ItineraryRouteEditCtrl', {
          $scope: scope,
          $routeParams: routeParams
        });
      };
    }));

    it('should get the route', function() {
      createController(testRouteParams);
      $httpBackend.flush();
      expect(scope.route.name).toEqual(testRouteInfo.name);
      expect(scope.route.color).toEqual(testRouteInfo.color);
      expect(scope.totalCount).toEqual(testPoints.count);
      expect(scope.data.points).toEqual(testPoints.points);
    });

    it('should delete the selected points', function() {
      createController(testRouteParams);
      $httpBackend.flush();
      expect(scope.route.name).toEqual(testRouteInfo.name);
      expect(scope.totalCount).toEqual(testPoints.count);
      expect(scope.data.points).toEqual(testPoints.points);
      scope.deletePoints();
      $httpBackend.flush();
    });

  });

  describe('Split Route', function() {

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller, _$location_) {
      scope = $rootScope;
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      $httpBackend.when('GET', /\/itinerary\/\d+\/route\/\d+$/).respond(testSplitRouteInfo);
      $httpBackend.when('POST', /\/itinerary\/\d+\/route$/,
                        function(data) {
                          return /"points":.*"id":2,.*"id":3,/.test(data);
                        }
                       ).respond(testRouteInfo);
      $httpBackend.when('PUT', /\/itinerary\/\d+\/route\/\d+\/points$/,
                        function(data) {
                          return /"points":.*"id":1,/.test(data);
                        }
                       ).respond(testRouteInfo);
      $httpBackend.when('GET', /\/itinerary\/\d+\/route\/\d+\/points(\?offset=\d+&page_size=\d+)?$/).respond(testSplitPoints);
      createController = function(routeParams) {
        return $controller('ItineraryRouteEditCtrl', {
          $scope: scope,
          $routeParams: routeParams
        });
      };
    }));

    it('should split the route', function() {
      createController(testRouteParams);
      $httpBackend.flush();
      scope.split();
      $httpBackend.flush();
    });

  });

});
