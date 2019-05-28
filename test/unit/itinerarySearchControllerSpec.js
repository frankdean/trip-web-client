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

describe('ItinerarySearchController', function() {

  beforeEach(module('myApp'));

  var $httpBackend, $location, userService, scope, createController,
      georefFormatsRequestHandler, userPreferenceService;

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
                             _$location_,
                             GeorefFormatService,
                             UserPreferencesService) {
    $httpBackend = _$httpBackend_;
    $location = _$location_;
    scope = $rootScope;
    userPreferenceService = UserPreferencesService;
    spyOn(userPreferenceService, 'getCoordFormat').and.callThrough();
    spyOn(userPreferenceService, 'getPositionFormat').and.callThrough();
    createController = function() {
      return $controller('ItinerarySearchCtrl', {$scope: scope/*, GeorefFormatService: GeorefFormatService*/});
    };
    $httpBackend.when('GET', /^partials\/tracks.html$/).respond(null);
    georefFormatsRequestHandler = $httpBackend.when('GET', /georef\/formats/).respond(null);
  }));

  describe('Controller initialisation', function() {

    it('should initialise the controller', function() {
      createController();
      $httpBackend.flush();
      expect(scope.data).toBeDefined();
      expect(scope.ajaxRequestError).toBeUndefined();
      expect(scope.georefFormats).toBeDefined();
      expect(userPreferenceService.getCoordFormat).toHaveBeenCalled();
      expect(userPreferenceService.getPositionFormat).toHaveBeenCalled();
    });

    it('should set an error state when fetching georef formats fails', function() {
      createController();
      georefFormatsRequestHandler.respond(500, '');
      $httpBackend.flush();
      expect(scope.ajaxRequestError.error).toBeTruthy();
    });
    
    it('should redirect to login when not authorized', function() {
      createController();
      georefFormatsRequestHandler.respond(401, '');
      spyOn($location, 'path').and.stub();
      $httpBackend.flush();
      expect($location.path).toHaveBeenCalledWith('/login');
    });
    
  });

});
