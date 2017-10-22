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

describe('ItineraryTrackNameCtrl', function() {

  beforeEach(module('myApp'));

  var scope,
      $httpBackend,
      $location,
      itineraryWaypointService,
      createController,
      getRequestHandler,
      colorRequestHandler,
      saveRequestHandler,
      testTrack = {
        id: '42',
        name: 'track name',
        color: 'Red'
      },
      itineraryTrackNameService,
      expectedTrack,
      itineraryTrackParams = {itineraryId: '99', trackId: testTrack.id},
      testColors = ['Red', 'Blue', 'Green'],
      mockValidForm = {$valid: true,
                       $setPristine: function() {},
                       $setUntouched: function() {}
                      },
      mockInvalidForm = {$valid: false,
                         $setPristine: function() {},
                         $setUntouched: function() {}
                        };

  beforeEach(inject(function(_$httpBackend_, $rootScope, $controller, _$location_, ItineraryTrackNameService) {
    $httpBackend = _$httpBackend_;
    $location = _$location_;
    scope = $rootScope;
    itineraryTrackNameService = ItineraryTrackNameService;
    getRequestHandler = $httpBackend.when('GET', /itinerary\/\d+\/track\/name\/\d+$/).respond(testTrack);
    colorRequestHandler = $httpBackend.when('GET', /path\/colors$/).respond(testColors);
    saveRequestHandler = $httpBackend.when('POST', /itinerary\/\d+\/track\/name\/\d+$/,
                                           function(data) {
                                             return expectedTrack === data;
                                           }).respond(null);
    spyOn($location, 'path').and.stub();
    spyOn($location, 'search').and.stub();
    spyOn(itineraryTrackNameService, 'get').and.callThrough();
    spyOn(itineraryTrackNameService, 'save').and.callThrough();
    spyOn(mockValidForm, '$setPristine').and.callThrough();
    spyOn(mockValidForm, '$setUntouched').and.callThrough();
    createController = function(routeParams) {
      return $controller('ItineraryTrackNameCtrl', {
        $scope: scope,
        $routeParams: routeParams
      });
    };

  }));

  it('should redirect after save to the login page if the user is not authorised', function() {
    saveRequestHandler = $httpBackend.when('POST').respond(401, '');
    createController(itineraryTrackParams);
    $httpBackend.flush();
    expect(itineraryTrackNameService.get).toHaveBeenCalled();
    scope.save(mockValidForm);
    expect(itineraryTrackNameService.save).toHaveBeenCalled();
    $httpBackend.flush();
    expect(scope.ajaxRequestError).not.toBeDefined();
    expect($location.path).toHaveBeenCalledWith('/login');
    expect($location.search).not.toHaveBeenCalledWith();
    expect(itineraryTrackNameService.save).toHaveBeenCalled();
    expect(mockValidForm.$setPristine).not.toHaveBeenCalled();
    expect(mockValidForm.$setUntouched).not.toHaveBeenCalled();
  });

  it('should set an error flag when the backend call fails', function() {
    saveRequestHandler = $httpBackend.when('POST').respond(400, '');
    createController(itineraryTrackParams);
    $httpBackend.flush();
    expect(itineraryTrackNameService.get).toHaveBeenCalled();
    scope.save(mockValidForm);
    expect(itineraryTrackNameService.save).toHaveBeenCalled();
    $httpBackend.flush();
    expect(scope.ajaxRequestError.error).toBeDefined();
    expect($location.search).not.toHaveBeenCalled();
    expect(itineraryTrackNameService.save).toHaveBeenCalled();
    expect(mockValidForm.$setPristine).not.toHaveBeenCalled();
    expect(mockValidForm.$setUntouched).not.toHaveBeenCalled();
  });

  it('should fetch the specified track name', function() {
    createController(itineraryTrackParams);
    expect(itineraryTrackNameService.get).toHaveBeenCalled();
    $httpBackend.flush();
    expect(scope.data.itineraryId).toEqual(testTrack.itineraryId);
    expect(scope.data.trackId).toEqual(testTrack.trackId);
    expect(scope.data.name).toEqual(testTrack.name);
    expect(scope.data.color).toEqual(testTrack.color);
    expect(scope.master).toEqual(scope.data);
    expect(scope.ajaxRequestError).not.toBeDefined();
  });

  it('should show an error when there is a backend failure fetching the color', function() {
    createController(itineraryTrackParams);
    colorRequestHandler.respond(500, '');
    $httpBackend.flush();
    expect(scope.ajaxRequestError.error).toBeTruthy();
  });

  it('should show an error when there is a backend failure fetching the track name', function() {
    createController(itineraryTrackParams);
    getRequestHandler.respond(500, '');
    $httpBackend.flush();
    expect(scope.ajaxRequestError.error).toBeTruthy();
  });

  it('should redirect to the login page if the user is not authorised', function() {
    getRequestHandler.respond(401, '');
    createController(itineraryTrackParams);
    $httpBackend.flush();
    expect(itineraryTrackNameService.get).toHaveBeenCalled();
    expect(scope.ajaxRequestError).not.toBeDefined();
    expect($location.path).toHaveBeenCalledWith('/login');
    expect($location.search).not.toHaveBeenCalled();
  });

  it('should save the specified track name', function() {
    createController(itineraryTrackParams);
    $httpBackend.flush();
    expectedTrack = '{"itineraryId":"99","trackId":"42","name":"track name","color":"Red"}';
    scope.save(mockValidForm);
    $httpBackend.flush();
    expect(itineraryTrackNameService.save).toHaveBeenCalled();
    expect(mockValidForm.$setPristine).not.toHaveBeenCalled();
    expect(mockValidForm.$setUntouched).not.toHaveBeenCalled();
  });

  it('should show an error if there is a backend failure saving the track name', function() {
    createController(itineraryTrackParams);
    $httpBackend.flush();
    expectedTrack = '{"itineraryId":"99","trackId":"42","name":"track name","color":"Red"}';
    scope.save(mockValidForm);
    saveRequestHandler.respond(500, '');
    $httpBackend.flush();
    expect(scope.ajaxRequestError.error).toBeTruthy();
  });

  it('should not save an invalid form', function() {
    createController(itineraryTrackParams);
    $httpBackend.flush();
    scope.save(mockInvalidForm);
    expect(itineraryTrackNameService.save).not.toHaveBeenCalled();
    expect(mockValidForm.$setPristine).not.toHaveBeenCalled();
    expect(mockValidForm.$setUntouched).not.toHaveBeenCalled();
  });

  it('should cancel the form after confirmation', function() {
    createController(itineraryTrackParams);
    $httpBackend.flush();
    mockValidForm.$dirty = true;
    scope.cancel(mockValidForm);
    expect(itineraryTrackNameService.save).not.toHaveBeenCalled();
    expect($location.path).toHaveBeenCalledWith('/itinerary');
    expect($location.search).toHaveBeenCalledWith({id: '99'});
  });

  it('should reset the form after cancellation', function() {
    createController(itineraryTrackParams);
    $httpBackend.flush();
    mockValidForm.$dirty = true;
    scope.reset(mockValidForm);
    expect(itineraryTrackNameService.save).not.toHaveBeenCalled();
    expect(mockValidForm.$setPristine).toHaveBeenCalled();
    expect(mockValidForm.$setUntouched).toHaveBeenCalled();
  });

});
