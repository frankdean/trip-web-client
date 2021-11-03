/**
 * @license TRIP - Trip Recording and Itinerary Planning application.
 * (c) 2016-2021 Frank Dean <frank@fdsd.co.uk>
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

describe('ItinerarySimplifyPathCtrl', function() {

  beforeEach(module('myApp'));

  var scope,
      $httpBackend,
      $location,
      createController,
      simplifyService,
      testTracks = [
        {
          id: 42,
          name: 'test track name',
          segments: [
            {
              id: 1,
              points: [
                {lng: -64.45214081, lat: 18.49486923},
                {lng: -105.49706268, lat: 45.40974808},
                {lng: -133.70994568, lat: -3.32189083},
                {lng: -90.73143768, lat: -0.59913325},
                {lng: -6.79588938, lat: 4.05566788},
                {lng: 13.4189539, lat: -9.08620834}
              ]
            },
            {
              id: 2,
              points: [
                {lng: 17.81348419, lat: -33.34461975},
                {lng: 26.07520294, lat: -34.80059052},
                {lng: 44.26856232, lat: -25.94357681},
                {lng: 51.12403107, lat: 11.79707623},
                {lng: -5.8290925, lat: 36.11537552},
                {lng: -27.8896389, lat: 38.62944031},
                {lng: -61.20018387, lat: 11.79707623}
              ]
            }
          ]
        }
      ],
      itineraryTrackParams = {
        itineraryId: '42',
        trackId: '99'
      };

  describe('simplify track', function() {

    beforeEach(inject(function(_$httpBackend_, $rootScope, $controller, _$location_, SimplifyService) {
      scope = $rootScope;
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      $httpBackend.when('GET', /config\/map\/layers$/).respond([{text: 'simple test'}]);
      $httpBackend.when('POST', /itinerary\/\d+\/tracks\/selected$/).respond(testTracks);
      $httpBackend.when('POST', /itinerary\/\d+\/track$/).respond(null);
      $httpBackend.when('GET', /^partials\/(itinerary|tracks).html$/).respond(null);
      simplifyService = SimplifyService;
      createController = function(routeParams) {
        return $controller('ItinerarySimplifyPathCtrl', {
          $scope: scope,
          $routeParams: routeParams
        });
      };
      spyOn(simplifyService, 'simplify').and.callThrough();
      spyOn($location, 'path').and.stub();
    }));

    it('should fetch the track', function() {
      createController(itineraryTrackParams);
      $httpBackend.flush();
      expect(scope.track).toBeDefined();
      expect(scope.totalOriginalPoints).toBeDefined();
      expect(scope.totalOriginalPoints).toEqual(13);
      expect(scope.originalPaths).toBeDefined();
      expect(scope.originalPaths.length).toEqual(2);
      expect(scope.originalPaths[0].latlngs.length).toEqual(6);
      expect(scope.originalPaths[1].latlngs.length).toEqual(7);
      expect(scope.maxTolerance).toBeDefined();
      expect(scope.step).toBeDefined();
      expect(scope.bounds).toBeDefined();
      expect(simplifyService.simplify).toHaveBeenCalled();
    });

    it('should simplify the path', function() {
      createController(itineraryTrackParams);
      $httpBackend.flush();
      scope.simplify();
      expect(scope.originalPaths.length).toEqual(2);
      expect(scope.originalPaths[0].latlngs.length).toEqual(6);
      expect(scope.originalPaths[1].latlngs.length).toEqual(7);
      expect(simplifyService.simplify).toHaveBeenCalledTimes(4);
      expect(scope.paths).toBeDefined();
      expect(Array.isArray(scope.paths)).toBeTruthy();
      expect(scope.paths.length).toEqual(4);
      expect(scope.paths[0]).toEqual(scope.originalPaths[0]);
      expect(scope.paths[1].latlngs).toBeDefined();
      expect(Array.isArray(scope.paths[1].latlngs)).toBeTruthy();
      expect(scope.paths[2].latlngs.length).toEqual(6);
      scope.tolerance = 3;
      scope.simplify();
      expect(scope.paths[2].latlngs.length).toEqual(5);
      expect(scope.paths[3].latlngs.length).toEqual(7);
      scope.tolerance = 7;
      scope.simplify();
      expect(scope.paths[2].latlngs.length).toEqual(5);
      expect(scope.paths[3].latlngs.length).toEqual(5);
    });

    it('should save the updated path', function() {
      createController(itineraryTrackParams);
      $httpBackend.flush();
      expect(scope.track).toBeDefined();
      scope.save();
      $httpBackend.flush();
      expect(simplifyService.simplify).toHaveBeenCalledTimes(4);
    });

    it('should cancel a session', function() {
      createController(itineraryTrackParams);
      $httpBackend.flush();
      scope.cancel();
      expect($location.path).toHaveBeenCalledWith('/itinerary');
      expect(simplifyService.simplify).toHaveBeenCalledTimes(2);
    });
  });

});
