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

angular.module('myApp.config.factory', [])

  .factory(
    'ConfigService',
    ['Storage', '$location', '$log',
     function(Storage, $location, $log) {
       var service = {};
       // service.restUrlPrefix = '';
       service.restUrlPrefix = '/trip/rest';
       service.osmAndTrackerUrlPrefix = service.restUrlPrefix +
         '/log_point?lat={0}&lon={1}&mstime={2}&hdop={3}&altitude={4}&speed={5}&bearing={6}';
       service.gpsLoggerUrlPrefix = service.restUrlPrefix +
         '/log_point?lat=%LAT&lon=%LON&time=%TIME&hdop=%ACC&altitude=%ALT&speed=%SPD&bearing=%DIR&sat=%SAT&prov=%PROV&batt=%BATT&note=%DESC';
       // Implemented as a function to allow for token changes
       service.getTileUrl = function(index) {
         return $location.protocol() + '://' + $location.host() +
           ':' + $location.port() + service.restUrlPrefix +
           '/tile?' + 'id=' + index + '&z={z}&x={x}&y={y}&access_token=' +
           encodeURIComponent(Storage.getItem('id_token'));
       };
       service.getOsmAndTrackerUrlPrefix = function() {
         // Don't include the protocol or port as the client does not support https.
         // If a different port is required, this code will need amending.
         return 'http://' + $location.host() +
           service.osmAndTrackerUrlPrefix + '&uuid=';
       };
       service.getGpsLoggerUrlPrefix = function() {
         // Don't include the protocol or port as the client does not support https.
         // If a different port is required, this code will need amending.
         return 'http://' + $location.host() +
           service.gpsLoggerUrlPrefix + '&uuid=';
       };
       service.getWebSocketPath = function() {
         // Assume if host is on public network we are proxying through Apache
         // and prefix path with /wstrack.
         return /localhost|127\..*|10\..*|192\.168\..*/.test($location.host()) ? '/socket.io' : '/wstrack/socket.io';
       };
       service.getDefaultMarkerIcon = function() {
         return {
           iconUrl: 'node_modules/leaflet/dist/images/marker-icon.png',
           shadowUrl: 'node_modules/leaflet/dist/images/marker-shadow.png',
           iconSize: [25, 41],
           iconAnchor: [12, 41],
           popupAnchor: [1, -34],
           shadowSize: [41, 41]
         };
       };
       return service;
     }])

  .factory(
    'MapConfigService',
    ['RemoteConfigService', 'UtilsService', '$q', '$log',
     function(remoteConfigService, utilsService, $q, $log) {
       var layers;

       var service = {
         getMapLayers: function() {
           var deferred = $q.defer();
           if (layers) {
             deferred.resolve(layers);
           } else {
             remoteConfigService.get({})
               .$promise.then(function(cfg) {
                 layers = utilsService.createMapLayers(cfg);
                 deferred.resolve(layers);
               }).catch(function(response) {
                 $log.error('Failure fetching map attribution config', response);
                 deferred.reject('Failure fetching map attribution config');
               });

           }
           return deferred.promise;
         }
       };
       return service;
     }])

  .factory(
    'RemoteConfigService',
    ['$resource', 'ConfigService', '$log',
     function($resource, ConfigService, $log) {
       var url = ConfigService.restUrlPrefix + '/config/map/layers';
       return $resource(url, {}, {
         get: {isArray: true}
       });
     }]);
