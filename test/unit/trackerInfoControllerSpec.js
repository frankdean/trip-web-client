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

describe('TrackerInfoCtrl', function() {

  beforeEach(module('myApp'));

  var scope, createController, $httpBackend,
  configService, trackingUuid,
  uuidRequestHandler, newUuidRequestHandler;
  var testUrlPrefix = 'http://foo/bar';
  var testUuid = {uuid: 'foo-bar'};
  var testNewUuid = {uuid: 'new-foo-bar'};
  var trackingUrlRegEx = new RegExp('tracking_uuid');

  beforeEach(inject(function(_$httpBackend_, $rootScope, $controller,
                             ConfigService, TrackingUuid) {
    $httpBackend = _$httpBackend_;
    _$httpBackend_.when('GET', /^partials\/tracks.html$/).respond(null);
    scope = $rootScope;
    configService = ConfigService;
    trackingUuid = TrackingUuid;
    spyOn(configService, 'getOsmAndTrackerUrlPrefix').and.returnValue(testUrlPrefix);
    uuidRequestHandler = $httpBackend.when('GET', trackingUrlRegEx).
      respond(testUuid);
    newUuidRequestHandler = $httpBackend.when('PUT', trackingUrlRegEx).
      respond(testNewUuid);
    createController = function() {
      return $controller('TrackerInfoCtrl', {$scope: scope});
    };
  }));

  it('should store the current UUID of the user in $scope', function() {
    createController();
    $httpBackend.flush();
    expect(scope.uuid).toBeDefined();
    expect(scope.uuid.uuid).toEqual(testUuid.uuid);
    expect(scope.ajaxRequestMessage).toBeUndefined();
    expect(scope.ajaxRequestError).toBeUndefined();
  });

  it('should show an error when there is a backend failure fetching the existing UUID', function() {
    createController();
    uuidRequestHandler.respond(500, '');
    $httpBackend.flush();
    expect(scope.ajaxRequestError.error).toBeTruthy();
  });

  it('should store the OsmAnd tracking URL prefix in $scope', function() {
    createController();
    $httpBackend.flush();
    expect(scope.osmAndTrackingUrlPrefix).toBeDefined();
    expect(scope.osmAndTrackingUrlPrefix).toEqual(testUrlPrefix);
    expect(scope.ajaxRequestMessage).toBeUndefined();
    expect(scope.ajaxRequestError).toBeUndefined();
  });

  it('should update the current UUID of the user when a new UUID is requested', function() {
    createController();
    scope.generateUuid();
    $httpBackend.flush();
    expect(scope.uuid).toBeDefined();
    expect(scope.uuid.uuid).toEqual(testNewUuid.uuid);
    expect(scope.ajaxRequestMessage).toBeDefined();
  });

  it('should show an error when there is a backend failure requesting a new UUID', function() {
    createController();
    scope.generateUuid();
    newUuidRequestHandler.respond(500, '');
    $httpBackend.flush();
    expect(scope.ajaxRequestError.error).toBeTruthy();
  });

  it('should NOT update the current UUID of the user when a new UUID request fails', function() {
    newUuidRequestHandler.respond(400, '');
    createController();
    scope.generateUuid();
    $httpBackend.flush();
    expect(scope.uuid).toBeDefined();
    expect(scope.uuid.uuid).toEqual(testUuid.uuid);
    expect(scope.ajaxRequestError.error).toBeTruthy();
  });

  it('should redirect to the login page if the user fails authentication when generating a new UUID', inject(function($location) {
    newUuidRequestHandler.respond(401, '');
    createController();
    spyOn($location, 'path').and.stub();
    scope.generateUuid();
    $httpBackend.flush();
    expect($location.path).toHaveBeenCalledWith('/login');
    expect(scope.ajaxRequestMessage).toBeUndefined();
    expect(scope.ajaxRequestError.error).toBeFalsy();
  }));

});
