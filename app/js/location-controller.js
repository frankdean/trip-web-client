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

angular.module('myApp.location.controller', [])
  .controller(
    'LocationCtrl',
    ['$rootScope', '$scope',
     '$routeParams',
     '$log',
     '$location',
     'ConfigService',
     'LocationService',
     'TrackingUuid',
     'MapConfigService',
     'UtilsService',
     'GeorefFormatService',
     'UserPreferencesService',
     'CopyAndPasteService',
     function($rootScope, $scope,
              $routeParams,
              $log,
              $location,
              ConfigService,
              LocationService,
              TrackingUuid,
              MapConfigService,
              UtilsService,
              GeorefFormatService,
              UserPreferencesService,
              CopyAndPasteService) {
       $rootScope.pageTitle = null;

       var markerLayer,
           drawnItems = new L.FeatureGroup();
       $scope.ajaxRequestError = {error: false};
       $scope.data = {};
       $scope.data.highAccuracy = false;
       $scope.coordFormat = UserPreferencesService.getCoordFormat();
       $scope.positionFormat = UserPreferencesService.getPositionFormat();
       angular.extend($scope, {
         status: {
           // Delay construction of map object until attribution fetched from server
           showMap: false
         },
         messages: {},
         map: {}
       });
       $scope.data.uuid = TrackingUuid.query(
         {},
         function(value) {
           // success
         },
         function(response) {
           // error
           if (response.status === 401) {
             $location.path('/login');
           } else {
             $log.warn('Error fetching current UUID ', response.status, response.statusText);
             $scope.ajaxRequestError = {
               error: true,
               status: response.status
             };
           }
         });
       GeorefFormatService.query()
         .$promise.then(function(georefFormats) {
           $scope.georefFormats = georefFormats;
         }).catch(function(response) {
           $log.warn('Error fetching Georef Formats', response.status, response.statusText);
           $scope.ajaxRequestError = {
             error: true,
             status: response.status
           };
         });
       MapConfigService.getMapLayers()
         .then(function(layers) {
           angular.extend($scope.map, {
             height: 240,
             controls: {
               scale: {
                 position: "bottomright"
               }
             },
             center: {
               autoDiscover: true,
               enableHighAccuracy: false,
               zoom: 16
             },
             layers: {
               baselayers: layers
             },
             defaults: {
               controls: {
                 layers: {
                   visible: (layers.length > 1),
                   position: 'topleft',
                   collapsed: true
                 }
               },
               maxZoom: 17
             },
             drawOptions: {
               position: "topright",
               draw: {
                 polyline: false,
                 polygon: false,
                 rectangle: false,
                 circlemarker: false,
                 circle: false,
                 marker: false
               },
               edit: {
                 featureGroup: drawnItems,
                 remove: false
               }
             }
           });
           $scope.status.showMap = true;
         })
         .catch(function(error) {
           $log.error('Failed to get the map layer configuration: ', error);
           $scope.mapLayersError = {error: error};
         });

       $scope.$on('leafletDirectiveMap.locationfound', function(event, data) {
         var now = new Date(), eventDate;
         $scope.locationNotFound = undefined;
         $scope.updateSuccess = undefined;
         $scope.ajaxRequestError = {error: false};
         if (data.leafletEvent && data.leafletEvent.latlng) {
           markerLayer = new L.Marker(data.leafletEvent.latlng);
           eventDate = new Date(data.leafletEvent.timestamp);
           // Epoch of 978307200 seconds between 1-Jan-1970 and 1-Jan-2001
           // Safari desktop appears to be based on Epoch of 1-Jan-2001
           // If the difference between now and the event date is more than 10 years
           if (now.getTime() - eventDate.getTime() > 315576000000) {
             eventDate = new Date(eventDate.getTime() + 978307200000);
             // If the timestamp looks more than 24 hours out, let's just play safe and use current time
             if (Math.abs(now.getTime() - eventDate.getTime()) > 86400000) {
               eventDate = now;
               $log.debug('Timestamp still looks wrong (%s).  Will use the current time', eventDate.toLocaleString('en-GB'));
             }
             $log.warn('Altered event date to %s', eventDate.toLocaleString('en-GB'));
           }
           angular.extend($scope.data,
                          {position: data.leafletEvent.latitude + ',' + data.leafletEvent.longitude},
                          {latitude: data.leafletEvent.latitude},
                          {longitude: data.leafletEvent.longitude},
                          {time: eventDate.getTime()},
                          {altitude: data.leafletEvent.altitude},
                          {vdop: data.leafletEvent.altitudeAccuracy},
                          {heading: data.leafletEvent.heading},
                          {speed: data.leafletEvent.speed},
                          {hdop: data.leafletEvent.accuracy},
                          {provider: 'web-browser'}
                         );
           markerLayer.bindPopup((new Date(data.leafletEvent.timestamp)).toLocaleString('en-GB'));
           drawnItems.addLayer(markerLayer);
         }
       });
       $scope.$on('leafletDirectiveMap.locationerror', function(event, data) {
         $scope.locationNotFound = {error: true};
       });

       $scope.sendLocation = function() {
         $scope.messages = {};
         $scope.locationNotFound = undefined;
         $scope.updateSuccess = undefined;
         $scope.ajaxRequestError = {error: false};
         LocationService.save({
           uuid: $scope.data.uuid.uuid,
           lat: $scope.data.latitude,
           lng: $scope.data.longitude,
           mstime: $scope.data.time,
           hdop: $scope.data.hdop,
           vdop: $scope.data.vdop,
           altitude: $scope.data.altitude,
           speed: $scope.data.speed,
           bearing: $scope.data.heading,
           prov: $scope.data.provider,
           note: $scope.data.note
         }).$promise.then(function() {
           $scope.updateSuccess = {ok: true};
         }).catch(function(response) {
           $scope.ajaxRequestError = {
             error: true,
             status: response.status
           };
           if (response.status === 401) {
             $location.path('/login');
           } else  {
             $log.error('Location update failed: ', response.status, response.statusText);
           }
         });
       };

       $scope.updateLocation = function() {
         $scope.messages = {};
         $scope.locationNotFound = undefined;
         $scope.updateSuccess = undefined;
         $scope.ajaxRequestError = {error: false};
         if (markerLayer) {
           drawnItems.removeLayer(markerLayer);
         }
         $scope.map.center.enableHighAccuracy = $scope.data.highAccuracy;
         $scope.map.center.autoDiscover = true;
       };

       $scope.copyWaypointForPaste = function() {
         $scope.messages = {};
         CopyAndPasteService.copy('current-position', {
           latitude: $scope.data.latitude,
           longitude: $scope.data.longitude,
           time: new Date($scope.data.time),
           altitude: $scope.data.altitude,
           vdop: $scope.data.vdop,
           heading: $scope.data.heading,
           speed: $scope.data.speed,
           hdop: $scope.data.hdop,
           note: $scope.data.note,
           provider: $scope.data.provider
         });
         $scope.messages.copied = true;
       };

       $scope.$on('leafletDirectiveDraw.draw:edited', function(e, payload) {
         $scope.ajaxRequestError = {error: false};
         $scope.invalidMarkerError = {error: false};
         var layers = payload.leafletEvent.layers;
         layers.eachLayer(function (layer) {
           if (layer instanceof L.Marker) {
             // Allow some editing around 180 degrees of longitude
             while (layer.getLatLng().lng > 180) {
               layer.getLatLng().lng -= 360;
             }
             while (layer.getLatLng().lng < -180) {
               layer.getLatLng().lng += 360;
             }
             if (UtilsService.validateCoordinate(
               layer.getLatLng().lat,
               layer.getLatLng().lng)) {
               angular.extend($scope.data,
                              {position: layer.getLatLng().lat + ',' + layer.getLatLng().lng},
                              {latitude: layer.getLatLng().lat},
                              {longitude: layer.getLatLng().lng},
                              {time: Date.now()},
                              {altitude: undefined},
                              {vdop: undefined},
                              {heading: undefined},
                              {speed: undefined},
                              {hdop: undefined},
                              {provider: 'manual'}
                             );
               markerLayer.bindPopup((new Date($scope.data.time)).toLocaleString('en-GB'));
           } else {
               $log.warn('Invalid marker position', layer.getLatLng().lat, layer.getLatLng().lng);
               $scope.invalidMarkerError = {error: true,
                                            lat: layer.getLatLng().lat,
                                            lng: layer.getLatLng().lng
                                           };
             }

           } else {
             $log.warn('Layer is not an instance of L.Marker');
           }
         });
       });

       $scope.$on('TL_COORD_FORMAT_CHANGED', function(e, data) {
         if (data) {
           UserPreferencesService.setCoordFormat(data);
         }
       });
       $scope.$on('TL_POSITION_FORMAT_CHANGED', function(e, data) {
         if (data) {
           UserPreferencesService.setPositionFormat(data);
         }
       });

     }]);
