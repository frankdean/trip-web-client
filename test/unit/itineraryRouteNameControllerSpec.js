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

describe('ItineraryRouteNameCtrl', function() {

  beforeEach(module('myApp'));

  var scope,
      $httpBackend,
      $location,
      itineraryWaypointService,
      createController,
      getRequestHandler,
      colorRequestHandler,
      saveRequestHandler,
      getRouteRequestHandler,
      saveRouteRequestHandler,
      testRoute = {
        id: '42',
        name: 'route name'
      },
      testRoute2 = {
        id: '42',
        name: 'route name',
        points: [
          {
            id: 99,
            lat: 30,
            lng: -3,
            name: '001'
          },
          {
            id: 100,
            lat: 31,
            lng: -2,
            name: '002'
          }
        ]
      },
      itineraryRouteService,
      itineraryRouteNameService,
      expectedRoute,
      itineraryRouteParams = {itineraryId: '99', routeId: testRoute.id},
      testColors = ['Red', 'Blue', 'Green'],
      mockValidForm = {$valid: true,
                       $setPristine: function() {},
                       $setUntouched: function() {}
                      },
      mockInvalidForm = {$valid: false,
                         $setPristine: function() {},
                         $setUntouched: function() {}
                        };

  beforeEach(inject(function(_$httpBackend_, $rootScope, $controller, _$location_, ItineraryRouteService, ItineraryRouteNameService) {
    $httpBackend = _$httpBackend_;
    $location = _$location_;
    scope = $rootScope;
    itineraryRouteService = ItineraryRouteService;
    itineraryRouteNameService = ItineraryRouteNameService;
    getRequestHandler = $httpBackend.when('GET', /itinerary\/\d+\/route\/name\/\d+$/).respond(testRoute);
    getRouteRequestHandler = $httpBackend.when('GET', /itinerary\/\d+\/route\/\d+$/).respond(testRoute2);
    colorRequestHandler = $httpBackend.when('GET', /path\/colors$/).respond(testColors);
    saveRequestHandler = $httpBackend.when('POST', /itinerary\/\d+\/route\/name\/\d+$/,
                      function(data) {
                        return expectedRoute === data;
                      }).respond(null);
    saveRouteRequestHandler = $httpBackend.when('POST', /itinerary\/\d+\/route$/,
                      function(data) {
                        return expectedRoute === data;
                      }).respond(null);
    spyOn($location, 'path').and.stub();
    spyOn($location, 'search').and.stub();
    spyOn(itineraryRouteService, 'get').and.callThrough();
    spyOn(itineraryRouteService, 'save').and.callThrough();
    spyOn(itineraryRouteNameService, 'get').and.callThrough();
    spyOn(itineraryRouteNameService, 'save').and.callThrough();
    spyOn(mockValidForm, '$setPristine').and.callThrough();
    spyOn(mockValidForm, '$setUntouched').and.callThrough();
    createController = function(routeParams) {
      return $controller('ItineraryRouteNameCtrl', {
        $scope: scope,
        $routeParams: routeParams
      });
    };

  }));

  it('should redirect after save to the login page if the user is not authorised', function() {
    saveRequestHandler = $httpBackend.when('POST').respond(401, '');
    createController(itineraryRouteParams);
    $httpBackend.flush();
    expect(itineraryRouteNameService.get).toHaveBeenCalled();
    scope.save(mockValidForm);
    expect(itineraryRouteNameService.save).toHaveBeenCalled();
    $httpBackend.flush();
    expect(scope.ajaxRequestError.error).toBeFalsy();
    expect($location.path).toHaveBeenCalledWith('/login');
    expect($location.search).not.toHaveBeenCalled();
    expect(itineraryRouteNameService.save).toHaveBeenCalled();
    expect(mockValidForm.$setPristine).not.toHaveBeenCalled();
    expect(mockValidForm.$setUntouched).not.toHaveBeenCalled();
  });

  it('should set an error flag when the backend call fails to save the name change', function() {
    saveRequestHandler = $httpBackend.when('POST').respond(400, '');
    createController(itineraryRouteParams);
    $httpBackend.flush();
    expect(itineraryRouteNameService.get).toHaveBeenCalled();
    scope.save(mockValidForm);
    expect(itineraryRouteNameService.save).toHaveBeenCalled();
    $httpBackend.flush();
    expect(scope.ajaxRequestError.saveFailed).toBeDefined();
    expect($location.search).not.toHaveBeenCalled();
    expect(itineraryRouteNameService.save).toHaveBeenCalled();
    expect(mockValidForm.$setPristine).not.toHaveBeenCalled();
    expect(mockValidForm.$setUntouched).not.toHaveBeenCalled();
  });

  it('should set an error flag when the backend call fails to get the route name', function() {
    createController(itineraryRouteParams);
    getRequestHandler.respond(500, '');
    $httpBackend.flush();
    expect(scope.ajaxRequestError.error).toBeTruthy();
  });

  it('should fetch the specified route name', function() {
    createController(itineraryRouteParams);
    expect(itineraryRouteNameService.get).toHaveBeenCalled();
    $httpBackend.flush();
    expect(scope.data.itineraryId).toEqual(testRoute.itineraryId);
    expect(scope.data.routeId).toEqual(testRoute.routeId);
    expect(scope.data.name).toEqual(testRoute.name);
    expect(scope.master).toEqual(scope.data);
    expect(scope.ajaxRequestError).not.toBeDefined();
  });

  it('should redirect to the login page if the user is not authorised', function() {
    getRequestHandler.respond(401, '');
    createController(itineraryRouteParams);
    $httpBackend.flush();
    expect(itineraryRouteNameService.get).toHaveBeenCalled();
    expect(scope.ajaxRequestError).not.toBeDefined();
    expect($location.path).toHaveBeenCalledWith('/login');
    expect($location.search).not.toHaveBeenCalled();
  });

  it('should save the specified route name', function() {
    createController(itineraryRouteParams);
    $httpBackend.flush();
    expectedRoute = '{"itineraryId":"99","routeId":"42","name":"route name"}';
    scope.save(mockValidForm);
    $httpBackend.flush();
    expect(itineraryRouteNameService.save).toHaveBeenCalled();
    expect(mockValidForm.$setPristine).not.toHaveBeenCalled();
    expect(mockValidForm.$setUntouched).not.toHaveBeenCalled();
  });

  it('should copy the specified route name when copy checkbox selected', function() {
    createController(itineraryRouteParams);
    $httpBackend.flush();
    scope.data.copy = true;
    scope.data.reverse = false;
    scope.save(mockValidForm);
    expectedRoute = '{"id":"99","name":"route name","points":[{"lat":30,"lng":-3,"name":"001"},{"lat":31,"lng":-2,"name":"002"}]}';
    $httpBackend.flush();
    expect(itineraryRouteService.get).toHaveBeenCalled();
    expect(itineraryRouteService.save).toHaveBeenCalled();
    expect(mockValidForm.$setPristine).not.toHaveBeenCalled();
    expect(mockValidForm.$setUntouched).not.toHaveBeenCalled();
  });

  it('should copy and reverse the specified route name when copy and reverse checkboxes are selected', function() {
    createController(itineraryRouteParams);
    $httpBackend.flush();
    scope.data.copy = true;
    scope.data.reverse = true;
    scope.save(mockValidForm);
    expectedRoute = '{"id":"99","name":"route name","points":[{"lat":31,"lng":-2,"name":"002"},{"lat":30,"lng":-3,"name":"001"}]}';
    $httpBackend.flush();
    expect(itineraryRouteService.get).toHaveBeenCalled();
    expect(itineraryRouteService.save).toHaveBeenCalled();
    expect(mockValidForm.$setPristine).not.toHaveBeenCalled();
    expect(mockValidForm.$setUntouched).not.toHaveBeenCalled();
  });

  it('should show an error when saving the specified route name fails', function() {
    createController(itineraryRouteParams);
    $httpBackend.flush();
    scope.save(mockValidForm);
    expectedRoute = '{"itineraryId":"99","routeId":"42","name":"route name"}';
    saveRequestHandler.respond(500, '');
    $httpBackend.flush();
    expect(scope.ajaxRequestError.error).toBeTruthy();
  });

  it('should show an error when copying a route fails', function() {
    createController(itineraryRouteParams);
    $httpBackend.flush();
    scope.data.copy = true;
    scope.data.reverse = true;
    scope.save(mockValidForm);
    expectedRoute = '{"id":"99","name":"route name","points":[{"lat":31,"lng":-2,"name":"002"},{"lat":30,"lng":-3,"name":"001"}]}';
    saveRouteRequestHandler.respond(500, '');
    $httpBackend.flush();
    expect(scope.ajaxRequestError.error).toBeTruthy();
  });

  it('should not save an invalid form', function() {
    createController(itineraryRouteParams);
    $httpBackend.flush();
    scope.save(mockInvalidForm);
    expect(itineraryRouteNameService.save).not.toHaveBeenCalled();
    expect(mockValidForm.$setPristine).not.toHaveBeenCalled();
    expect(mockValidForm.$setUntouched).not.toHaveBeenCalled();
  });

  it('should cancel the form after confirmation', function() {
    createController(itineraryRouteParams);
    $httpBackend.flush();
    mockValidForm.$dirty = true;
    scope.cancel(mockValidForm);
    expect(itineraryRouteNameService.save).not.toHaveBeenCalled();
    expect($location.path).toHaveBeenCalledWith('/itinerary');
    expect($location.search).toHaveBeenCalledWith({id: '99'});
  });

  it('should reset the form after cancellation', function() {
    createController(itineraryRouteParams);
    $httpBackend.flush();
    mockValidForm.$dirty = true;
    scope.reset(mockValidForm);
    expect(itineraryRouteNameService.save).not.toHaveBeenCalled();
    expect(mockValidForm.$setPristine).toHaveBeenCalled();
    expect(mockValidForm.$setUntouched).toHaveBeenCalled();
  });

});
