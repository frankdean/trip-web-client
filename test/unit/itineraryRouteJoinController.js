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

describe('ItineraryRouteJoinCtrl', function() {

  beforeEach(module('myApp'));

  var scope,
      $httpBackend,
      $location,
      createController,
      selectionService,
      testRouteParams = {
        itineraryId: 42
      },
      testRoute1 = {
        id: 99,
        points: [{id: 23, lat: 0, lng: 0}]
      },
      testRoute2 = {
        id: 100,
        points: [{id: 44, lat: 0, lng: 0}]
      },
      testRoutes = [testRoute1];

  beforeEach(inject(function(_$httpBackend_) {
    _$httpBackend_.when('GET', /config\/map\/layers$/).respond([{text: 'simple test'}]);
    _$httpBackend_.when('GET', /path\/colors$/).respond(null);
    _$httpBackend_.when('GET', /^partials\/tracks.html$/).respond(null);
  }));

  describe('join routes', function() {

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller, _$location_, ItinerarySelectionService) {
      scope = $rootScope;
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      selectionService = ItinerarySelectionService;
      $httpBackend.when('POST', /itinerary\/\d+\/routes/).respond(testRoutes);
      $httpBackend.when('POST', /itinerary\/\d+\/route$/).respond();
      createController = function(routeParams) {
        return $controller('ItineraryRouteJoinCtrl', {
          $scope: scope,
          $routeParams: routeParams
        });
      };
      spyOn(selectionService, 'getChoices').and.callThrough();
    }));

    it('should fetch the selected routes', function() {
      selectionService.setChoices({routes: [1, 2]});
      createController(testRouteParams);
      $httpBackend.flush();
    });


    describe('join and save', function() {

      beforeEach(inject(function(_$httpBackend_) {
        _$httpBackend_.when('GET', /^partials\/itinerary.html$/).respond(null);
      }));

      it('should join the selected routes', function() {
        selectionService.setChoices({routes: [1, 2]});
        createController(testRouteParams);
        $httpBackend.flush();
        scope.join();
        $httpBackend.flush();
      });

    });

  });

});
