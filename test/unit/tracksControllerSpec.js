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

describe('TRIP controllers', function() {

  var dateRegex = "[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\\.[0-9]{3})?(Z|\\+00:00)";
  var expectedLocations = {count: 1, payload: [ {id: 1, lat: 51, lng: 0, time: "2016-01-10 17:59:07+00", "hdop": null, "altitude": 0, "speed": 0, "bearing": 0} ]};

  var mockValidForm = {$valid: true,
                       $setPristine: function() {},
                       $setUntouched: function() {}
                      };
  var mockInvalidForm = {$valid: false,
                       $setPristine: function() {},
                       $setUntouched: function() {}
                      };
  beforeEach(function(){
    jasmine.addMatchers({
      toEqualData: function() {
        return {
          compare: function(actual, expected) {
            return {
              pass: angular.equals(actual, expected)
            };
          }
        };
      }
    });
  });

  beforeEach(module('myApp'));

  describe('TracksCtrl', function() {
    var scope, $httpBackend, nicknamesRequestHandler, requestHandler, downloadRequestHandler,
        createController, $location, recentPoints, initGpxDownload;
    var expectedNicknames = [{nickname: 'Fred'}, {nickname: 'Freda'}];
    var testTrackSearchParams = {nicknameSelect: 'John & Smith', dateFrom: new Date('2016-01-22T16:30:24'), dateTo: new Date('2016-01-22T16:31:00'), hdop: '20', notesOnlyFlag: 'false'};

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller,
                               modalDialog,
                               _$location_, RecentPoints, InitGpxDownload) {
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      recentPoints = RecentPoints;
      initGpxDownload = InitGpxDownload;
      nicknamesRequestHandler = $httpBackend.when('GET', new RegExp("nicknames(\\?access_token=[\\.a-zA-Z0-9]+)?$")).
        respond(expectedNicknames);
      requestHandler = $httpBackend.when('GET', new RegExp("location\\?(access_token=[\\.a-zA-Z0-9]+&)?from=" + dateRegex + "&offset=0&order=DESC&page_size=10&to=" + dateRegex + "$")).
        respond(expectedLocations);
      downloadRequestHandler = $httpBackend.when('GET', /download\/tracks\/[\w\d&%]+\?/).respond(null);
      scope = $rootScope.$new();
      spyOn(modalDialog, 'confirm').and.returnValue(true);
      spyOn($location, 'path').and.stub();
      spyOn($location, 'search').and.stub();
      createController = function() {
        return $controller('TracksCtrl', {$scope: scope});
      };
    }));

    it('should show a location in the list of recent points', function() {
      spyOn(recentPoints, 'query').and.callThrough();
      createController();
      scope.form = mockValidForm;
      scope.doListTracks(testTrackSearchParams);
      $httpBackend.flush();
      expect(recentPoints.query).toHaveBeenCalled();
      expect(scope.locations).toBeDefined();
      expect(scope.locations).toEqualData(expectedLocations);
    });

    it('should show an error when there is a backend failure fetching tracks', function() {
      createController();
      scope.form = mockValidForm;
      scope.doListTracks(testTrackSearchParams);
      requestHandler.respond(500, '');
      $httpBackend.flush();
      expect(scope.ajaxRequestError.error).toBeTruthy();
    });

    it('should show an error when there is a backend fetching nicknames', function() {
      createController();
      scope.doListTracks(testTrackSearchParams);
      nicknamesRequestHandler.respond(500, '');
      $httpBackend.flush();
      expect(scope.ajaxRequestError.error).toBeTruthy();
    });

    it('should create "nicknames" model with 2 nicknames fetched via http', function() {
      createController();
      $httpBackend.flush();
      expect(scope).toBeDefined();
      expect(scope.tracks.search).toBeDefined();
      expect(scope.nicknames).toBeDefined();
      expect(scope.nicknames).toEqualData(expectedNicknames);
    });

    it('should default the "from" date to midnight this morning', function() {
      createController();
      $httpBackend.flush();
      expect(scope.tracks).toBeDefined();
      expect(scope.tracks.search).toBeDefined();
      expect(scope.tracks.search.dateFrom).toBeDefined();
      // toISOString() breaks if the current time zone is not UTC
      // expect(scope.tracks.search.dateFrom.toISOString()).toMatch(/^[0-9]{4}-[0-9]{2}-[0-9]{2}T00:00:00(\.000)?(Z|\+00:00)?$/);
      expect(scope.tracks.search.dateFrom.getHours()).toEqual(0);
      expect(scope.tracks.search.dateFrom.getMinutes()).toEqual(0);
      expect(scope.tracks.search.dateFrom.getSeconds()).toEqual(0);
    });

    it('should default the "to" date to one second before midnight today', function() {
      createController();
      $httpBackend.flush();
      expect(scope.tracks.search.dateTo).toBeDefined();
      // toISOString() breaks if the current time zone is not UTC
      // expect(scope.tracks.search.dateTo.toISOString()).toMatch(/^[0-9]{4}-[0-9]{2}-[0-9]{2}T23:59:59(\.000)?(Z|\+00:00)?$/);
      expect(scope.tracks.search.dateTo.getHours()).toEqual(23);
      expect(scope.tracks.search.dateTo.getMinutes()).toEqual(59);
      expect(scope.tracks.search.dateTo.getSeconds()).toEqual(59);
    });

    it('should default hdop to blank', function() {
      createController();
      $httpBackend.flush();
      expect(scope.tracks.search.hdop).toBeDefined();
      expect(scope.tracks.search.hdop).toEqual(null);
    });

    it('should redirect to the login page if the user fails authentication during listTracks()', function() {
      requestHandler.respond(401, '');
      createController();
      scope.listTracks(testTrackSearchParams);
      $httpBackend.flush();
      expect($location.path.calls.argsFor(0)).toEqual(['/login']);
    });

    it('should redirect to the login page if the user fails authentication fetching nicknames', function() {
      nicknamesRequestHandler.respond(401, '');
      createController();
      $httpBackend.flush();
      expect($location.path.calls.argsFor(0)).toEqual(['/login']);
    });

    it('should change the location to display the map and set the URL search parameters', function() {
      createController();
      $httpBackend.flush();
      var expected = {nickname: encodeURIComponent(testTrackSearchParams.nicknameSelect),
                      from: encodeURIComponent(testTrackSearchParams.dateFrom.toISOString()),
                      to: encodeURIComponent(testTrackSearchParams.dateTo.toISOString()),
                      hdop: encodeURIComponent(testTrackSearchParams.hdop),
                      notesOnlyFlag: encodeURIComponent(testTrackSearchParams.notesOnlyFlag)};
      scope.form = mockValidForm;
      scope.showMap(testTrackSearchParams);
      expect($location.path).toHaveBeenCalled();
      expect($location.path.calls.argsFor(0)).toEqual(['/map']);
      expect($location.search).toHaveBeenCalled();
      expect($location.search.calls.argsFor(0)).toEqual([expected]);
    });

    it('should show an error when there is a backend failure downloading tracks', function() {
      createController();
      scope.tracks.search.nicknameSelect = testTrackSearchParams.nicknameSelect;
      scope.tracks.search.dateFrom = testTrackSearchParams.dateFrom.toISOString();
      scope.tracks.search.dateTo = testTrackSearchParams.dateTo.toISOString();
      scope.tracks.search.hdop = testTrackSearchParams.hdop;
      scope.tracks.search.notesOnlyFlag = testTrackSearchParams.notesOnlyFlag;
      scope.form = mockValidForm;
      scope.gpxDownload(testTrackSearchParams);
      downloadRequestHandler.respond(500, '');
      $httpBackend.flush();
      expect(scope.ajaxRequestError.error).toBeTruthy();
    });

    pending('Causes an undesirable file download of tracks on each test run');
    it('should call the GPX Download service when gpxDownload action is requested', function() {
      spyOn(initGpxDownload, 'downloadTracks').and.callThrough();
      createController();
      $httpBackend.flush();
      var expected = {nickname: testTrackSearchParams.nicknameSelect,
                      from: testTrackSearchParams.dateFrom.toISOString(),
                      to: testTrackSearchParams.dateTo.toISOString(),
                      max_hdop: testTrackSearchParams.hdop,
                      notesOnlyFlag: testTrackSearchParams.notesOnlyFlag};
      scope.tracks.search.nicknameSelect = testTrackSearchParams.nicknameSelect;
      scope.tracks.search.dateFrom = testTrackSearchParams.dateFrom.toISOString();
      scope.tracks.search.dateTo = testTrackSearchParams.dateTo.toISOString();
      scope.tracks.search.hdop = testTrackSearchParams.hdop;
      scope.tracks.search.notesOnlyFlag = testTrackSearchParams.notesOnlyFlag;
      scope.gpxDownload(testTrackSearchParams);
      $httpBackend.flush();
      expect(initGpxDownload.downloadTracks).toHaveBeenCalledWith(expected);
    });

  });

});
