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

describe('MapPointCtrl', function() {

  beforeEach(module('myApp'));

  var scope, ctrl, $httpBackend, $routeParams, configService;
  var routeParams = {lat: 51,
                     lng: -1};

  beforeEach(inject(function($rootScope, _$httpBackend_, $controller, ConfigService) {
    scope = $rootScope.$new();
    configService = ConfigService;
    $httpBackend = _$httpBackend_;
    $httpBackend.when('GET', /config\/map\/layers$/).respond([{text: 'simple test'}]);
    ctrl = $controller('MapPointCtrl', {$scope: scope,
                                        $routeParams: routeParams,
                                        ConfigService: configService});
  }));

  it('should create a marker and centre the map on it', function() {
    $httpBackend.flush();
    expect(scope.defaults).toBeDefined();
    expect(scope.center).toBeDefined();
    expect(scope.markers).toBeDefined();
    expect(scope.markers.selected).toBeDefined();
    expect(scope.markers.selected.lat).toEqual(routeParams.lat);
    expect(scope.markers.selected.lng).toEqual(routeParams.lng);
    expect(scope.markers.selected.message).toEqual(routeParams.lat + ', ' + routeParams.lng);
    expect(scope.center).toBeDefined();
    expect(scope.center.lat).toEqual(routeParams.lat);
    expect(scope.center.lng).toEqual(routeParams.lng);
    expect(scope.center.zoom).toEqual(14);
  });

});
