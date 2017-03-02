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

describe('GPX Upload Controller', function() {

  beforeEach(module('myApp'));

  var scope, $httpBackend, routeParams, createController, service;

  beforeEach(inject(function(_$httpBackend_, $rootScope, $controller, gpxUploadService) {
    $httpBackend = _$httpBackend_;
    scope = $rootScope;
    service = gpxUploadService;
    routeParams = {id: 243};
    $httpBackend.when(
      'POST',
      /itinerary\/file\/\d+/,
      function(data) {
        // console.log('Data', data);
        return true;
      }
    ).respond(null);
    createController = function() {
      return $controller('GpxController', {
        $scope: scope,
        $routeParams: routeParams
      });
    };
  }));

  it('should upload the file', function() {
    scope.formData = new FormData();
    scope.formData.append('file', {'name': 'test.gpx', 'size': 999});
    createController();
    scope.upload();
    $httpBackend.flush();
  });

});
