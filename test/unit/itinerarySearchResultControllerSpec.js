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
    createController = function() {
      return $controller('ItinerarySearchResultCtrl', {$scope: scope, $routeParams: routeParams});
    };
    $httpBackend.when('GET', /^partials\/tracks.html$/).respond(null);
    $httpBackend.when('GET', /itineraries\?distance=\d+&lat=[.\d]+&lng=[.\d]+.*/).respond(null);
  }));

  describe('Controller initialisation', function() {

    it('should initialise the controller', function() {
      createController();
      $httpBackend.flush();
    });
    
  });

});
