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

  var customMatchers = {
    toHaveBeenCalledWithColors: function(util, customEqualityTesters) {
      return {
        compare: function(actual, expected) {
          var result = {},
              actualNames = [];

          if (actual.calls.allArgs().length > 0) {
            actual.calls.allArgs().forEach(function(params) {
              if (params.length > 1) {
                actualNames.push(params[1].color);
              }
            });
          }

          result.pass = util.equals(actualNames, expected, customEqualityTesters);
          if (result.pass) {
            result.message = "Was called with the expected color keys";
          } else {
            result.message = "Expected color keys of " + util.pp(expected) + " but the actual color keys were " + util.pp(actualNames);
          }
          return result;
        }
      };
    }
  };

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

    describe('colourItems', function() {
      var pathColorService,
          itineraryRouteNameService,
          itineraryTrackNameService;

      beforeEach(function() {
        jasmine.addMatchers(customMatchers);
      });

      beforeEach(inject(
        function(PathColorService,
                 ItineraryRouteNameService,
                 ItineraryTrackNameService) {
          pathColorService = PathColorService;
          itineraryRouteNameService = ItineraryRouteNameService;
          itineraryTrackNameService = ItineraryTrackNameService;
          createController();
          $httpBackend.when('GET',/path\/colors/).respond([ {key: 'red', value: 'Red'}, {key: 'green', value: 'Green'} ]);
          $httpBackend.flush();
          spyOn(pathColorService, 'query').and.callThrough();
          scope.data = {};
          scope.waypoints = [];
          scope.routeNames = [ {selected: true}, {selected: true}, {selected: true} ];
          scope.trackNames = [  {selected: true}, {selected: true}, {selected: true}, {selected: true} ];
          scope.data.id = testItinerarySearchObject.id;
          scope.colorItems();
          $httpBackend.when('POST',
                            /itinerary\/\d+\/route\/name/,
                            function(data) {
                              return true;
                            }).respond(200);
          $httpBackend.when('POST',
                            /itinerary\/\d+\/track\/name/,
                            function(data) {
                              return true;
                            }).respond(200);
          spyOn(itineraryRouteNameService, 'save').and.callThrough();
          spyOn(itineraryTrackNameService, 'save').and.callThrough();
          $httpBackend.flush();
        }
      ));

      it('should color each of the selected tracks and route', function() {
        expect(pathColorService.query).toHaveBeenCalledTimes(1);
        expect(itineraryRouteNameService.save).toHaveBeenCalledTimes(3);
        expect(itineraryTrackNameService.save).toHaveBeenCalledTimes(4);
        expect(itineraryRouteNameService.save).toHaveBeenCalledWithColors(['red', 'green', 'red']);
        expect(itineraryTrackNameService.save).toHaveBeenCalledWithColors(['green', 'red', 'green', 'red']);
      });

    });

    describe('NoSystemColors', function() {
      var pathColorService,
          itineraryRouteNameService,
          itineraryTrackNameService;

      beforeEach(function() {
        jasmine.addMatchers(customMatchers);
      });

      beforeEach(inject(
        function(PathColorService,
                 ItineraryRouteNameService,
                 ItineraryTrackNameService) {
          pathColorService = PathColorService;
          itineraryRouteNameService = ItineraryRouteNameService;
          itineraryTrackNameService = ItineraryTrackNameService;
          createController();
          $httpBackend.when('GET',/path\/colors/).respond([]);
          $httpBackend.flush();
          spyOn(pathColorService, 'query').and.callThrough();
          scope.data = {};
          scope.waypoints = [];
          scope.routeNames = [ {selected: true}, {selected: true}, {selected: true} ];
          scope.trackNames = [  {selected: true}, {selected: true}, {selected: true}, {selected: true} ];
          scope.data.id = testItinerarySearchObject.id;
          scope.colorItems();
          $httpBackend.when('POST',
                            /itinerary\/\d+\/route\/name/,
                            function(data) {
                              return true;
                            }).respond(200);
          $httpBackend.when('POST',
                            /itinerary\/\d+\/track\/name/,
                            function(data) {
                              return true;
                            }).respond(200);
          spyOn(itineraryRouteNameService, 'save').and.callThrough();
          spyOn(itineraryTrackNameService, 'save').and.callThrough();
          $httpBackend.flush();
        }
      ));

      it('should not color selected tracks and routes when there are no colors defined', function() {
        expect(pathColorService.query).toHaveBeenCalledTimes(1);
        expect(itineraryRouteNameService.save).not.toHaveBeenCalled();
        expect(itineraryTrackNameService.save).not.toHaveBeenCalled();
      });

    });

    describe('NoItemsSelectedForColor', function() {
      var pathColorService,
          itineraryRouteNameService,
          itineraryTrackNameService;

      beforeEach(function() {
        jasmine.addMatchers(customMatchers);
      });

      beforeEach(inject(
        function(PathColorService,
                 ItineraryRouteNameService,
                 ItineraryTrackNameService) {
          pathColorService = PathColorService;
          itineraryRouteNameService = ItineraryRouteNameService;
          itineraryTrackNameService = ItineraryTrackNameService;
          createController();
          $httpBackend.when('GET',/path\/colors/).respond([ {key: 'red', value: 'Red'}, {key: 'green', value: 'Green'} ]);
          $httpBackend.flush();
          spyOn(pathColorService, 'query').and.callThrough();
          scope.data = {};
          scope.waypoints = [];
          scope.routeNames = [ {selected: false}, {selected: false}, {selected: false} ];
          scope.trackNames = [  {selected: false}, {selected: false}, {selected: false}, {selected: false} ];
          scope.data.id = testItinerarySearchObject.id;
          scope.colorItems();
          $httpBackend.when('POST',
                            /itinerary\/\d+\/route\/name/,
                            function(data) {
                              return true;
                            }).respond(200);
          $httpBackend.when('POST',
                            /itinerary\/\d+\/track\/name/,
                            function(data) {
                              return true;
                            }).respond(200);
          spyOn(itineraryRouteNameService, 'save').and.callThrough();
          spyOn(itineraryTrackNameService, 'save').and.callThrough();
          // $httpBackend.flush();
        }
      ));

      it('should color each of the selected tracks and route', function() {
        expect(pathColorService.query).not.toHaveBeenCalled();
        expect(itineraryRouteNameService.save).not.toHaveBeenCalled();
        expect(itineraryTrackNameService.save).not.toHaveBeenCalled();
      });

    });

    describe('convertTracks', function() {
      var itineraryRouteService,
          itineraryTrackService;

      beforeEach(inject(
        function(ItineraryRouteService,
                 ItineraryTrackService) {
          itineraryRouteService = ItineraryRouteService;
          itineraryTrackService = ItineraryTrackService;
          createController();
          $httpBackend.when('GET',/path\/colors/).respond([ {key: 'red', value: 'Red'}, {key: 'green', value: 'Green'} ]);
          $httpBackend.flush();
          scope.data = {};
          scope.waypoints = [];
          scope.trackNames = [  {selected: true}, {selected: false}, {selected: true}, {selected: true} ];
          scope.data.id = testItinerarySearchObject.id;
          $httpBackend.when('POST',
                            /itinerary\/\d+\/tracks\/selected/,
                            function(data) {
                              return true;
                            }).respond(200, [
                              {
                                name: 'Track one',
                                color: 'Orange',
                                segments: [
                                  {
                                    points: [
                                      { lng: 1, lat: 2, altitude: 99 },
                                      { lng: 3, lat: 4, altitude: 999 }
                                    ]
                                  },
                                  {
                                    points: [
                                      { lng: 5, lat: 6, altitude: 9999 },
                                      { lng: 7, lat: 8, altitude: 99999 }
                                    ]
                                  }
                                ]
                              },
                              {
                                name: 'Track two',
                                color: 'Purple',
                                segments: [
                                  {
                                    points: [
                                      { lng: 11, lat: 12, altitude: 199 },
                                      { lng: 13, lat: 14, altitude: 1999 }
                                    ]
                                  },
                                  {
                                    points: [
                                      { lng: 15, lat: 16, altitude: 19999 },
                                      { lng: 17, lat: 18, altitude: 199999 }
                                    ]
                                  }
                                ]
                              }
                            ]);
          $httpBackend.when('POST',
                            /itinerary\/\d+\/route$/,
                            function(data) {
                              return data === '{"id":"42","name":"Track one","color":"Orange","points":[{"lng":1,"lat":2,"altitude":99},{"lng":3,"lat":4,"altitude":999},{"lng":5,"lat":6,"altitude":9999},{"lng":7,"lat":8,"altitude":99999}]}' ||
                                data === '{"id":"42","name":"Track two","color":"Purple","points":[{"lng":11,"lat":12,"altitude":199},{"lng":13,"lat":14,"altitude":1999},{"lng":15,"lat":16,"altitude":19999},{"lng":17,"lat":18,"altitude":199999}]}';
                            }).respond(200);
          spyOn(itineraryRouteService, 'save').and.callThrough();
          spyOn(itineraryTrackService, 'getTracks').and.callThrough();
          scope.convertTracks();
          $httpBackend.flush();
        }
      ));

      it('should create a route for each selected track', function() {
        expect(itineraryTrackService.getTracks).toHaveBeenCalledTimes(1);
        expect(itineraryRouteService.save).toHaveBeenCalledTimes(2);
      });

    });

  });

});
