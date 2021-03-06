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

  beforeEach(inject(function(_$httpBackend_) {
    _$httpBackend_.when('GET', /^partials\/tracks.html$/).respond(null);
  }));

  var mockValidForm = {$valid: true,
                       $setPristine: function() {},
                       $setUntouched: function() {}
                      };
  var mockInvalidForm = {$valid: false,
                         $setPristine: function() {},
                         $setUntouched: function() {}
                        };

  describe('view', function() {
    var scope, form, $location, $httpBackend, requestHandler,
        getWaypointNamesRequestHandler, getRouteNamesRequestHandler, getTrackNamesRequestHandler,
        deleteRequestHandler, createController, gpxDownloadService, kmlDownloadService,
        itineraryService;
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
                               _$location_,
                               ItineraryService,
                               ItineraryRouteService,
                               InitGpxDownload,
                               InitKmlDownload,
                               ItineraryTrackService) {
      $httpBackend = _$httpBackend_;
      scope = $rootScope;
      requestHandler = $httpBackend.when('GET', itineraryRegex).respond(expected);
      getWaypointNamesRequestHandler = $httpBackend.when('GET', /\/itinerary\/\d+\/waypoint$/).respond(expectedWaypoints);
      getRouteNamesRequestHandler = $httpBackend.when('GET', /\/itinerary\/\d+\/routes\/names$/).respond(expectedRouteNames);
      getTrackNamesRequestHandler = $httpBackend.when('GET', /\/itinerary\/\d+\/track\/names$/).respond(expectedTrackNames);
      deleteRequestHandler = $httpBackend.when('PUT', /\/download\/itinerary\/\d+\/delete-gpx$/).respond(null);
      $location = _$location_;
      gpxDownloadService = InitGpxDownload;
      kmlDownloadService = InitKmlDownload;
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

    it('should delete an itinerary', function() {
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

    describe('GPX download', function() {

      beforeEach(inject(function(
        InitGpxDownload) {
        $httpBackend.when('POST',
                          /\/download\/itinerary\/\d+\/gpx$/,
                          function(data) {
                            return true;
                          }).respond(200, '');
        gpxDownloadService = InitGpxDownload;
        spyOn(gpxDownloadService, 'downloadItineraryGpx').and.callThrough();
        createController();
        $httpBackend.flush();
        scope.data = {};
        scope.waypoints = [];
        scope.routeNames = [];
        scope.trackNames = [];
        scope.data.id = testItinerarySearchObject.id;
        scope.download();
        $httpBackend.flush();
      }));

      it('should initiate a GPX file download', function() {
        expect(gpxDownloadService.downloadItineraryGpx).toHaveBeenCalled();
      });

    });

    describe('KML download', function() {

      beforeEach(inject(function(
        InitKmlDownload) {
        $httpBackend.when('POST',
                          /\/download\/itinerary\/\d+\/kml$/,
                          function(data) {
                            return true;
                          }).respond(200, '');
        kmlDownloadService = InitKmlDownload;
        spyOn(kmlDownloadService, 'downloadItineraryKml').and.callThrough();
        createController();
        $httpBackend.flush();
        scope.data = {};
        scope.waypoints = [];
        scope.routeNames = [];
        scope.trackNames = [];
        scope.data.id = testItinerarySearchObject.id;
        scope.downloadKml();
        $httpBackend.flush();
      }));

      it('should initiate a KML file download', function() {
        expect(kmlDownloadService.downloadItineraryKml).toHaveBeenCalled();
      });

    });

    describe('YAML itinerary download', function() {
      var downloadService;

      beforeEach(inject(function(
        ItineraryDownloadService) {
        $httpBackend.when('GET',
                          /\/itinerary\/\d+\/download\/yaml$/,
                          function(data) {
                            return true;
                          }).respond(200, '');
        downloadService = ItineraryDownloadService;
        spyOn(downloadService, 'downloadYaml').and.callThrough();
        createController();
        $httpBackend.flush();
        scope.data = {};
        scope.waypoints = [];
        scope.routeNames = [];
        scope.trackNames = [];
        scope.data.id = testItinerarySearchObject.id;
        scope.downloadItineraryAsYaml();
        $httpBackend.flush();
      }));

      it('should initiate a GPX file download', function() {
        expect(downloadService.downloadYaml).toHaveBeenCalled();
      });

    });

    describe('paste', function() {
      var copyAndPasteService,
          testLocations = {
            payload: [{note: 'Test note 01', lat: 51, lng: -3, altitude: 42}, {note: 'Test note 02', lat: 51.1, lng: -3.1, altitude: 414}]
          };

      beforeEach(inject(function(CopyAndPasteService
                                ) {
        copyAndPasteService = CopyAndPasteService;
        $httpBackend.when('POST',
                          /\/itinerary\/\d+\/track$/,
                          function(data) {
                            if ('{"id":"42","track":{"segments":[{"points":[{"note":"Test note 01","lat":51,"lng":-3,"altitude":42},{"note":"Test note 02","lat":51.1,"lng":-3.1,"altitude":414}]}]}}' === data) {
                              return true;
                            }
                            return false;
                          }).respond(200, '');
        $httpBackend.when('POST',
                          /\/itinerary\/\d+\/waypoints\/create$/,
                          function(data) {
                            if ('{"id":"42","waypoints":[{"lat":51,"lng":-3,"altitude":42,"comment":"Test note 01","description":"Created from track log note"},{"lat":51.1,"lng":-3.1,"altitude":414,"comment":"Test note 02","description":"Created from track log note"}]}' === data) {
                              return true;
                            }
                            return false;
                          }).respond(200, '');
        $httpBackend.when('GET',/location\?from/).respond(testLocations);
        createController();
        $httpBackend.flush();
        CopyAndPasteService.copy('location-history', {
          nickname: null,
          from: new Date(),
          to: new Date(),
          max_hdop: 70,
          notesOnlyFlag: false
        });
        spyOn(copyAndPasteService, 'paste').and.callThrough();
        scope.data = {};
        scope.waypoints = [];
        scope.routeNames = [];
        scope.trackNames = [];
        scope.data.id = testItinerarySearchObject.id;
        scope.pasteItems();
        $httpBackend.flush();
      }));

      it('should paste location history as a track with waypoints', function() {
        expect(copyAndPasteService.paste).toHaveBeenCalled();
      });

    });

  });

});
