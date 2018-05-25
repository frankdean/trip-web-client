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

describe('SystemStatusCtrl', function() {

  var $httpBackend, scope, systemStatusService, createController,
      requestHandler, $location,
      testResponse = {
        tileUsage: {
          count: 1000,
          time: new Date(Date.UTC(2017, 2))
        }
      };

  beforeEach(module('myApp'));

  beforeEach(inject(function(_$httpBackend_,
                             $rootScope,
                             $controller,
                             SystemStatusService,
                             _$location_) {
    $httpBackend = _$httpBackend_;
    scope = $rootScope;
    systemStatusService = SystemStatusService;
    $location = _$location_;
    _$httpBackend_.when('GET', /^partials\/tracks.html$/).respond(null);
    requestHandler = $httpBackend.when('GET', /admin\/system\/status/).respond(testResponse);
    createController = function() {
      return $controller('SystemStatusCtrl', {$scope: scope});
    };
    spyOn(systemStatusService, 'get').and.callThrough();
  }));

  it('should fetch the current status', function() {
    createController();
    $httpBackend.flush();
    expect(systemStatusService.get).toHaveBeenCalled();
    expect(scope.data).toBeDefined();
    expect(scope.data.tileUsage).toEqual(testResponse.tileUsage);
  });

  it('should redirect to the login page when authentication fails', function() {
    spyOn($location, 'path').and.stub();
    createController();
    requestHandler.respond(401, '');
    $httpBackend.flush();
    expect(systemStatusService.get).toHaveBeenCalled();
    expect($location.path).toHaveBeenCalledWith('/login');
  });

  it('should set an error condition when the backend call fails', function() {
    createController();
    requestHandler.respond(500, '');
    $httpBackend.flush();
    expect(systemStatusService.get).toHaveBeenCalled();
    expect(scope.ajaxRequestError).toBeDefined();
  });
  
});
