/**
 * @license TRIP - Trip Recording and Itinerary Planning application.
 * (c) 2016-2019 Frank Dean <frank@fdsd.co.uk>
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

describe('ItinerarySearchResultController', function() {

  beforeEach(module('myApp'));

  var $httpBackend, $location, scope, createController,
      routeParams = {lat: 48.858222, lng: 2.2945, distance: 900};
  
  var mockValidForm = {$valid: true,
                       $setPristine: function() {},
                       $setUntouched: function() {}
                      };
  var mockInvalidForm = {$valid: false,
                       $setPristine: function() {},
                       $setUntouched: function() {}
                      };

  beforeEach(inject(function(_$httpBackend_,
                             $rootScope,
                             $controller,
                             _$location_) {
    $httpBackend = _$httpBackend_;
    $location = _$location_;
    scope = $rootScope;
    scope.selection = [];
    createController = function() {
      return $controller('ItinerarySearchResultCtrl', {$scope: scope, $routeParams: routeParams});
    };
    $httpBackend.when('GET', /^partials\/tracks.html$/).respond(null);
    $httpBackend.when('GET', /config\/map\/layers/).respond(null);
    $httpBackend.when('GET', /itineraries\?distance=\d+&lat=[.\d]+&lng=[.\d]+.*/).respond(null);
    $httpBackend.when('GET', /itinerary\/[\d]+\/(routes|waypoints|tracks)/,
                      function(data) {
                        return true;
                      }
                     ).respond([]);
  }));

  describe('Controller initialisation', function() {

    it('should initialise the controller', function() {
      createController();
      $httpBackend.flush();
    });
    
  });

  describe('Iterative itinerary search', function() {

    var testSearch = {id: 42};

    it('should search for itinerary routes, waypoints and tracks', function() {
      createController();
      $httpBackend.flush();
      scope.showItinerary(testSearch);
      $httpBackend.flush();
    });

  });

  describe('Test map behaviour', function() {
    var route01 = {id: 1, name: 'Route 01'},
        route02 = {id: 2, name: 'Route 02'},
        route03 = {id: 3, name: 'Route 03'},
        route04 = {id: 4, name: 'Route 04'},
        route05 = {id: 5, name: 'Route 05'},
        route06 = {id: 6, name: 'Route 06'},
        route07 = {id: 7, name: 'Route 07'},
        route08 = {id: 8, name: 'Route 08'},
        count,
        map,
        result;

    beforeEach(function() {
      map = new Map();
      map.set(route03.id, route03);
      map.set(route08.id, route08);
      map.set(route04.id, route04);
      map.set(route01.id, route01);
    });

    it('should return the map object when setting an item', function() {
      // [Mozilla docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
      // suggest Internet Explorer returns undefined.
      result = map.set(route06.id, route06);
      expect(result).toEqual(map);
    });

    it('should find route08', function() {
      expect(map).toBeDefined();
      result = map.get(route08.id);
      expect(result).toEqual(route08);
    });

    it('should contain route08', function() {
      expect(map).toBeDefined();
      result = map.has(route08.id);
      expect(result).toBeTruthy();
    });

    it('should not find route05', function() {
      expect(map).toBeDefined();
      result = map.get(route05.id);
      expect(result).not.toBeDefined();
    });

    it('should not find route08 after it is removed', function() {
      count = map.size;
      expect(map).toBeDefined();
      result = map.delete(route08.id);
      expect(result).toBeTruthy();
      result = map.get(route08.id);
      expect(result).not.toBeDefined();
      expect(map.size).toEqual(count -1);
    });

    it('should not be able to delete route05 after it is removed', function() {
      count = map.size;
      expect(map).toBeDefined();
      result = map.delete(route05.id);
      expect(result).toBeFalsy();
      expect(map.size).toEqual(count);
    });

    it('should not be able to insert route08 as it exists', function() {
      count = map.size;
      expect(map).toBeDefined();
      map.set(route08.id);
      expect(map.size).toEqual(count);
    });

  });

});
