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

describe('ItineraryMapCtrl', function() {

  beforeEach(module('myApp'));

  var scope, $httpBackend, routeParams, createController, service, selectionService;
  var track1 = {id: 16, name: 'test track 1', segments: [ {points: [{lat: 1, lng: 2, time: '2016-10-23T13:09:40+0000'}, {lat: 3, lng: 4, time: '2016-10-23T13:09:41+0000'}] }  ]};
  var track2 = {id: 17, name: 'test track 2', segments: [ {points: [{lat: 1, lng: 2, time: '2016-10-23T13:09:40+0000'}, {lat: 3, lng: 4, time: '2016-10-23T13:09:41+0000'}] }  ]};
  var tracks = [track1, track2];
  var waypoint1 = {id: 3, lat: 3, lng: -3},
      waypoint2 = {id: 3, lat: 3, lng: -3},
      waypoints = [waypoint1, waypoint2],
      routePoints = [{lat: 3, lng: -2}, {lat: 2, lng: 2}];
  var payload = {
        leafletEvent: {
          layer: undefined,
          layerType: undefined,
          layers: {
            _layers: [],
            eachLayer: function(func) {
              this._layers.forEach(function(v) {
                func(v);
              });
            }
          }
        }
      };

  beforeEach(inject(function(_$httpBackend_, $rootScope, $controller, ItineraryTrackService, ItinerarySelectionService) {
    $httpBackend = _$httpBackend_;
    scope = $rootScope;
    service = ItineraryTrackService;
    selectionService = ItinerarySelectionService;
    routeParams = {id: '42'};
    $httpBackend.when('POST', /itinerary\/\d+\/tracks$/,
                      function(data) {
                        return '{"id":"42","tracks":[1,2]}' === data;
                      }).respond(tracks);
    $httpBackend.when('POST', /itinerary\/\d+\/waypoints\/specified$/,
                      function(data) {
                        return '{"id":"42","waypoints":[3,4]}' === data;
                      }).respond(waypoints);
    $httpBackend.when('POST', /itinerary\/\d+\/waypoint$/,
                      function(data) {
                        return true;
                      }).respond({id: 76});
    $httpBackend.when('POST', /itinerary\/\d+\/waypoint\/\d+\/move$/,
                      function(data) {
                        return true;
                      }).respond(null);
    $httpBackend.when('DELETE', /itinerary\/\d+\/waypoint\/\d+$/,
                      function(data) {
                        return true;
                      }).respond(null);
    $httpBackend.when('POST', /itinerary\/\d+\/route$/,
                      function(data) {
                        return true;
                      }).respond({id: '99'});
    $httpBackend.when('PUT', /itinerary\/\d+\/route\/\d+\/points$/,
                      function(data) {
                        return true;
                      }).respond({id: '99'});
    $httpBackend.when('DELETE', /itinerary\/\d+\/route\/\d+$/,
                      function(data) {
                        return true;
                      }).respond({id: '99'});
    $httpBackend.when('GET', /config\/map\/layers$/).respond([{text: 'simple test'}]);
    createController = function() {
      return $controller('ItineraryMapCtrl', {
        $scope: scope,
        $routeParams: routeParams
      });
    };
    this.markerLayer = new L.Marker({lat: 51, lon: 2});
    this.polylineLayer = new L.Polyline(routePoints);
    spyOn(selectionService, 'getChoices').and.callThrough();
  }));

  it('should fetch a list of tracks', function() {
    selectionService.setChoices({tracks: [1, 2], waypoints: [3, 4]});
    createController();
    $httpBackend.flush();
    expect(selectionService.getChoices).toHaveBeenCalled();
    expect(scope.itineraryId).toEqual(routeParams.id);
    expect(scope.map.paths.length).toEqual(2);
    expect(scope.map.paths).toEqual([
      { color: 'red', weight: 4, latlngs: [ { lat: 1, lng: 2, time: jasmine.any(String) }, { lat: 3, lng: 4, time: jasmine.any(String) } ] },
      { color: 'red', weight: 4, latlngs: [ { lat: 1, lng: 2, time: jasmine.any(String) }, { lat: 3, lng: 4, time: jasmine.any(String) } ] }
    ]);
    expect(scope.map.bounds).toEqual({northEast: {lat: 3, lng: 4}, southWest: {lat: 1, lng: -3}, options: { maxZoom: 14 }});
  });

  it('should create a new waypoint', function() {
    createController();
    payload.leafletEvent.layer = this.markerLayer;
    payload.leafletEvent.layerType = "marker";
    scope.$broadcast('leafletDirectiveDraw.draw:created', payload);
    $httpBackend.flush();
  });

  it('should update an existing waypoint', function() {
    createController();
    this.markerLayer.tl_id = 42;
    payload.leafletEvent.layers._layers = [this.markerLayer];
    scope.$broadcast('leafletDirectiveDraw.draw:edited', payload);
    $httpBackend.flush();
  });

  it('should delete a waypoint', function() {
    createController();
    this.markerLayer.tl_id = 42;
    payload.leafletEvent.layers._layers = [this.markerLayer];
    scope.$broadcast('leafletDirectiveDraw.draw:deleted', payload);
    $httpBackend.flush();
  });

  it('should create a new route', function() {
    createController();
    payload.leafletEvent.layer = this.polylineLayer;
    payload.leafletEvent.layerType = "polyline";
    scope.$broadcast('leafletDirectiveDraw.draw:created', payload);
    $httpBackend.flush();
  });

  it('should update an existing route', function() {
    createController();
    payload.leafletEvent.layer = this.polylineLayer;
    payload.leafletEvent.layerType = "polyline";
    this.polylineLayer.tl_id = 42;
    payload.leafletEvent.layers._layers = [this.polylineLayer];
    scope.$broadcast('leafletDirectiveDraw.draw:edited', payload);
    $httpBackend.flush();
  });

  it('should delete an existing route', function() {
    createController();
    payload.leafletEvent.layer = this.polylineLayer;
    payload.leafletEvent.layerType = "polyline";
    this.polylineLayer.tl_id = 42;
    payload.leafletEvent.layers._layers = [this.polylineLayer];
    scope.$broadcast('leafletDirectiveDraw.draw:deleted', payload);
    $httpBackend.flush();
  });

});
