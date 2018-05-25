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

describe('ItineraryWaypointCtrl', function() {

  beforeEach(module('myApp'));

  var scope, $httpBackend, itineraryWaypointService, createController,
      getWaypointRequestHandler, getWaypointSymbolsRequestHandler,
      getGeoRefFormatsRequestHandler, saveWaypointRequestHandler,
      testWaypoint={
        id: '42',
        name: 'waypoint name',
        lat: 50.5,
        lng: -2.5,
        altitude: 42.5,
        time: new Date('2016-12-01T19:43:27.000Z'),
        symbol: 'Flag, Blue',
        comment: 'test comment',
        description: 'test desc'
      },
      testWaypointSymbols = [
        {key: 'Flag, Blue', value: 'Flag, Blue'}
      ],
      expectedWaypoint,
      waypointRouteParams = {itineraryId: '99', waypointId: testWaypoint.id},
      mockValidForm = {$valid: true,
                       $setPristine: function() {},
                       $setUntouched: function() {}
                      },
      mockInvalidForm = {$valid: false,
                         $setPristine: function() {},
                         $setUntouched: function() {}
                        };

  beforeEach(inject(function(_$httpBackend_, $rootScope, $controller, ItineraryWaypointService) {
    $httpBackend = _$httpBackend_;
    scope = $rootScope;
    itineraryWaypointService = ItineraryWaypointService;
    _$httpBackend_.when('GET', /^partials\/tracks.html$/).respond(null);
    _$httpBackend_.when('GET', /^partials\/itinerary.html$/).respond(null);
    getWaypointRequestHandler = $httpBackend.when('GET', /itinerary\/\d+\/waypoint\/\d+$/).respond(testWaypoint);
    getWaypointSymbolsRequestHandler = $httpBackend.when('GET', /waypoint\/symbols$/).respond(testWaypointSymbols);
    getGeoRefFormatsRequestHandler = $httpBackend.when('GET', /georef\/formats$/).respond(testWaypointSymbols);
    saveWaypointRequestHandler = $httpBackend.when('POST', /itinerary\/\d+\/waypoint\/\d+$/,
                      function(data) {
                        return expectedWaypoint === data;
                      }).respond(null);
    spyOn(itineraryWaypointService, 'get').and.callThrough();
    createController = function(routeParams) {
      return $controller('ItineraryWaypointCtrl', {
        $scope: scope,
        $routeParams: routeParams
      });
    };
  }));

  it('should show an error when there is a backend failure fetching waypoints', function() {
    createController(waypointRouteParams);
    getWaypointRequestHandler.respond(500, '');
    $httpBackend.flush();
    expect(scope.ajaxRequestError.error).toBeTruthy();
  });

  it('should show an error when there is a backend failure fetching waypoint symbols', function() {
    createController(waypointRouteParams);
    getWaypointSymbolsRequestHandler.respond(500, '');
    $httpBackend.flush();
    expect(scope.ajaxRequestError.error).toBeTruthy();
  });

  it('should show an error when there is a backend failure fetching Georef formats', function() {
    createController(waypointRouteParams);
    getGeoRefFormatsRequestHandler.respond(500, '');
    $httpBackend.flush();
    expect(scope.ajaxRequestError.error).toBeTruthy();
  });

  it('should fetch the specified waypoint when a waypoint id is passed', function() {
    createController(waypointRouteParams);
    $httpBackend.flush();
    expect(itineraryWaypointService.get).toHaveBeenCalled();
    expect(scope.data.name).toEqual(testWaypoint.name);
    expect(scope.data.position).toEqual(testWaypoint.lat + ',' + testWaypoint.lng);
    expect(scope.data.lat).toEqual(testWaypoint.lat);
    expect(scope.data.lng).toEqual(testWaypoint.lng);
    expect(scope.data.altitude).toEqual(testWaypoint.altitude);
    expect(scope.data.time).toEqual(testWaypoint.time);
    expect(scope.data.symbol).toEqual(testWaypoint.symbol);
    expect(scope.data.comment).toEqual(testWaypoint.comment);
    expect(scope.data.description).toEqual(testWaypoint.description);
    expect(scope.master).toEqual(scope.data);
  });

  it('should not fetch the specified waypoint when a waypoint id is not passed', function() {
    createController({itineraryId: waypointRouteParams.itineraryId});
    expect(itineraryWaypointService.get).not.toHaveBeenCalled();
    expect(scope.data.time).toEqual(jasmine.any(Date));
  });

  it('should save the waypoint', function() {
    createController(waypointRouteParams);
    spyOn(itineraryWaypointService, 'save').and.callThrough();
    $httpBackend.flush();
    scope.save(mockValidForm);
    expectedWaypoint = '{"id":"99","wptId":"42","name":"waypoint name","lat":50.5,"lng":-2.5,"altitude":42.5,"time":"2016-12-01T19:43:27.000Z","symbol":"Flag, Blue","comment":"test comment","description":"test desc"}';
    $httpBackend.flush();
    expect(itineraryWaypointService.save).toHaveBeenCalled();
  });

  it('should show an error when saving the waypoint fails', function() {
    createController(waypointRouteParams);
    spyOn(itineraryWaypointService, 'save').and.callThrough();
    $httpBackend.flush();
    scope.save(mockValidForm);
    expectedWaypoint = '{"id":"99","wptId":"42","name":"waypoint name","lat":50.5,"lng":-2.5,"altitude":42.5,"time":"2016-12-01T19:43:27.000Z","symbol":"Flag, Blue","comment":"test comment","description":"test desc"}';
    saveWaypointRequestHandler.respond(500, '');
    $httpBackend.flush();
    expect(scope.ajaxRequestError.error).toBeTruthy();
  });

  it('should save the waypoint with an empty time value', function() {
    createController(waypointRouteParams);
    spyOn(itineraryWaypointService, 'save').and.callThrough();
    $httpBackend.flush();
    scope.data.time = null;
    scope.save(mockValidForm);
    expectedWaypoint = '{"id":"99","wptId":"42","name":"waypoint name","lat":50.5,"lng":-2.5,"altitude":42.5,"time":null,"symbol":"Flag, Blue","comment":"test comment","description":"test desc"}';
    $httpBackend.flush();
    expect(itineraryWaypointService.save).toHaveBeenCalled();
  });

});
