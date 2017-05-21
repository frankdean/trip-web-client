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

describe('LocationCtrl', function() {

  beforeEach(module('myApp'));

  var scope,
      $httpBackend,
      $location,
      createController;

  describe('Update location', function() {

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller, _$location_) {
      scope = $rootScope;
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      $httpBackend.when('GET', /\/georef\/formats$/).respond(null);
      $httpBackend.when('GET', /\/tracking_uuid$/).respond();
      $httpBackend.when('GET', /\/config\/map\/layers$/).respond([{text: 'simple test'}]);
      $httpBackend.when('GET', /\/log_point\?lat=[-.\d]+&lng=[-.\d]+$/).respond();
      createController = function(routeParams) {
        return $controller('LocationCtrl', {
          $scope: scope,
          $routeParams: routeParams
        });
      };
    }));

    it('should initialise the form', function() {
      createController();
      $httpBackend.flush();
    });

    it('should record the specified location', function() {
      createController();
      $httpBackend.flush();
      scope.data.latitude = 53.33333;
      scope.data.longitude = -3.9999;
      scope.sendLocation();
      $httpBackend.flush();
    });

  });

});
