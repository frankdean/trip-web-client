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

describe('MapCtrl', function() {

  beforeEach(module('myApp'));

  var scope, createController, $httpBackend, requestHandler, $location, $routeParams, configService;
  var expectedLocations = {count: 1, payload: [ {id: 1, lat: 51, lng: 0, time: "2016-01-10 17:59:07+00", "hdop": null, "altitude": 0, "speed": 0, "bearing": 0} ]};
  var mapParams = {nicknameSelect: 'John & Smith',
                   dateFrom: new Date('2016-01-22T16:30:24'),
                   dateTo: new Date('2016-01-22T16:31:00'),
                   hdop: '20'};
  var routeParams = {nickname: encodeURIComponent(mapParams.nicknameSelect),
                     from: encodeURIComponent(mapParams.dateFrom.toISOString()),
                     to: encodeURIComponent(mapParams.dateTo.toISOString()),
                     hdop: encodeURIComponent(mapParams.hdop)};

  beforeEach(inject(function(_$httpBackend_, $rootScope, $controller, _$location_, RecentPoints, ConfigService) {
    $httpBackend = _$httpBackend_;
    $location = _$location_;
    scope = $rootScope.$new();
    configService = ConfigService;
    requestHandler = $httpBackend.when('GET', new RegExp("location\\/John%20&%20Smith")).respond(expectedLocations);
    $httpBackend.when('GET', /config\/map\/layers$/).respond([{tileAttributions: [{text: 'simple test'}]}]);
    spyOn($location, 'path').and.stub();
    spyOn($location, 'search').and.stub();
    spyOn(configService, 'getTileUrl').and.callThrough();
    createController = function() {
      return $controller('MapCtrl', {$scope: scope,
                                     $routeParams: routeParams,
                                     $location: $location,
                                     RecentPoints: RecentPoints});
    };
  }));

  it('should set the data model from the passed $routeParams', function() {
    createController();
    $httpBackend.flush();
    expect(scope.data).toBeDefined();
    expect(scope.data.nicknameSelect).toBeDefined();
    expect(scope.data.nicknameSelect).toEqual(mapParams.nicknameSelect);
    expect(scope.data.dateFrom).toBeDefined();
    expect(scope.data.dateFrom).toEqual(mapParams.dateFrom.toISOString());
    expect(scope.data.dateTo).toBeDefined();
    expect(scope.data.dateTo).toEqual(mapParams.dateTo.toISOString());
    expect(scope.data.hdop).toBeDefined();
    expect(scope.data.hdop).toEqual(mapParams.hdop);
    expect(scope.map.layers.baselayers).toBeDefined();
    expect(scope.map.layers.baselayers[0].layerOptions.attribution).toEqual('simple test');
  });

  it('should set some map defaults', function() {
    createController();
    $httpBackend.flush();
    expect(scope.map.defaults).toBeDefined();
    expect(scope.map.defaults.maxZoom).toBeDefined();
    expect(scope.map.bounds).toBeDefined();
    expect(scope.map.markers).toBeDefined();
    expect(scope.map.paths).toBeDefined();
    expect(configService.getTileUrl).toHaveBeenCalled();
  });

  it('should redirect to the login page if the user fails authentication', function() {
    requestHandler.respond(401, '');
    createController();
    $httpBackend.flush();
    expect($location.path).toHaveBeenCalledWith('/login');
  });

  it('should show an error when there is a backend failure', function() {
    createController();
    requestHandler.respond(500, '');
    $httpBackend.flush();
    expect(scope.ajaxRequestError.error).toBeTruthy();
  });

});
