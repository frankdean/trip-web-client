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

describe('ItineraryCtrl', function() {

  beforeEach(module('myApp'));

  var mockValidForm = {$valid: true,
                       $setPristine: function() {},
                       $setUntouched: function() {}
                      };
  var mockInvalidForm = {$valid: false,
                         $setPristine: function() {},
                         $setUntouched: function() {}
                        };

  describe('view', function() {
    var scope, form, $location, $httpBackend, confirmDialog, requestHandler,
        getWaypointNamesRequestHandler, getRouteNamesRequestHandler, getTrackNamesRequestHandler,
        deleteRequestHandler, createController, gpxDownloadService, itineraryService;
    var routeParams = {id: '42'};
    var expectedWaypoints = [{id: 234, name: 'wp234', symbol: 'Flag, Blue', comment: 'test234'}];
    var expectedRouteNames = [{id: 1, name: 'test'}];
    var expectedTrackNames = [{id: 2, name: 'Another test'}];
    var expected = {id: routeParams.id,
                    start: '2016-06-05T00:00:00Z',
                    finish: '2016-06-05T00:00:00Z',
                    title: 'Test itinerary',
                    description: 'Descripton of the itinerary'
                   };
    var testItinerary = {id: routeParams.id,
                         start: new Date(expected.start),
                         finish: new Date(expected.finish),
                         title: 'Test itinerary',
                         description: 'Descripton of the itinerary'
                        };
    var itineraryRegex = new RegExp('/itinerary/' + routeParams.id + '$');
    var testItinerarySearchObject = {
      id: '' + testItinerary.id
    };

    beforeEach(inject(function(_$httpBackend_,
                               $rootScope,
                               $controller,
                               modalDialog,
                               _$location_,
                               ItineraryService,
                               ItineraryRouteService,
                               InitGpxDownload,
                               ItineraryTrackService) {
      $httpBackend = _$httpBackend_;
      scope = $rootScope;
      requestHandler = $httpBackend.when('GET', itineraryRegex).respond(expected);
      getWaypointNamesRequestHandler = $httpBackend.when('GET', /\/itinerary\/\d+\/waypoint$/).respond(expectedWaypoints);
      getRouteNamesRequestHandler = $httpBackend.when('GET', /\/itinerary\/\d+\/routes\/names$/).respond(expectedRouteNames);
      getTrackNamesRequestHandler = $httpBackend.when('GET', /\/itinerary\/\d+\/tracks\/names$/).respond(expectedTrackNames);
      deleteRequestHandler = $httpBackend.when('PUT', /\/download\/itinerary\/\d+\/delete-gpx$/).respond(null);
      confirmDialog = modalDialog;
      $location = _$location_;
      gpxDownloadService = InitGpxDownload;
      itineraryService = ItineraryService;
      createController = function() {
        return $controller('ItineraryCtrl', {$scope: scope,
                                             $routeParams: routeParams});
      };
      scope.form = mockValidForm;
    }));

    it('should redirect to the itinerary sharing page when the sharing button is clicked', function() {
      createController();
      scope.data = {};
      scope.data.id = testItinerarySearchObject.id;
      spyOn($location, 'path').and.stub();
      spyOn($location, 'search').and.stub();
      scope.sharing();
      expect($location.path.calls.argsFor(0)).toEqual(['/itinerary-sharing']);
      expect($location.search.calls.argsFor(0)).toEqual([testItinerarySearchObject]);
    });

    it('should redirect to the itinerary edit page when the edit button is clicked', function() {
      createController();
      scope.data = {};
      scope.data.id = testItinerarySearchObject.id;
      spyOn($location, 'path').and.stub();
      spyOn($location, 'search').and.stub();
      scope.edit();
      expect($location.path.calls.argsFor(0)).toEqual(['/itinerary-edit']);
      expect($location.search.calls.argsFor(0)).toEqual([testItinerarySearchObject]);
    });

    it('should deleting an itinerary', function() {
      spyOn(confirmDialog, 'confirm').and.returnValue(true);
      spyOn(gpxDownloadService, 'deleteItineraryGpx').and.callThrough();
      createController();
      $httpBackend.flush();
      scope.data = {};
      scope.waypoints = [];
      scope.routeNames = [];
      scope.trackNames = [];
      scope.data.id = testItinerarySearchObject.id;
      scope.deleteUploads();
      $httpBackend.flush();
      expect(gpxDownloadService.deleteItineraryGpx).toHaveBeenCalled();
    });

    it('should show an error when deleting an itinerary fails', function() {
      spyOn(confirmDialog, 'confirm').and.returnValue(true);
      createController();
      scope.data = {};
      scope.waypoints = [];
      scope.routeNames = [];
      scope.trackNames = [];
      scope.data.id = testItinerarySearchObject.id;
      scope.deleteUploads();
      deleteRequestHandler.respond(500, '');
      $httpBackend.flush();
      expect(scope.ajaxRequestError.error).toBeTruthy();
    });

    it('should show an error when there is a backend failure fetching the itinerary', function() {
      createController();
      requestHandler.respond(500, '');
      $httpBackend.flush();
      expect(scope.ajaxRequestError.error).toBeTruthy();
    });

    it('should show an error when there is a backend failure fetching the waypoint names', function() {
      createController();
      getWaypointNamesRequestHandler.respond(500, '');
      $httpBackend.flush();
      expect(scope.ajaxRequestError.error).toBeTruthy();
    });

    it('should show an error when there is a backend failure fetching the route names', function() {
      createController();
      getRouteNamesRequestHandler.respond(500, '');
      $httpBackend.flush();
      expect(scope.ajaxRequestError.error).toBeTruthy();
    });

    it('should show an error when there is a backend failure fetching the track names', function() {
      createController();
      getTrackNamesRequestHandler.respond(500, '');
      $httpBackend.flush();
      expect(scope.ajaxRequestError.error).toBeTruthy();
    });

  });

});
