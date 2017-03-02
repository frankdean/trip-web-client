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

angular.module('myApp.gpxdownload.factory', [] )

  .factory(
    'InitGpxDownload',
    ['$resource', 'ConfigService', 'Blob', '$window',
     function ($resource, ConfigService, Blob, $window) {
       return $resource(ConfigService.restUrlPrefix + '/download', {id: '@id'}, {
         downloadTracks: {
           url: ConfigService.restUrlPrefix + '/download/tracks/:nickname',
           headers: {
             'Content-type' : 'application/gpx+xml',
             'Accept' : 'application/gpx+xml,application/octet-stream'
           },
           cache: false,
           transformResponse: function(data) {
             return {
               data: new Blob([data], {type: /[Ss]afari/.test($window.navigator.userAgent) ? 'text/plain' : 'application/gpx+xml'})
             };
           },
           responseType : 'arraybuffer'
         },
         downloadItineraryGpx: {
           url: ConfigService.restUrlPrefix + '/download/itinerary/:id/gpx',
           method: 'POST',
           headers: {
             'Content-type' : 'application/gpx+xml',
             'Accept' : 'application/gpx+xml,application/octet-stream'
           },
           cache: false,
           transformResponse: function(data) {
             return {
               data: new Blob([data], {type: /[Ss]afari/.test($window.navigator.userAgent) ? 'text/plain' : 'application/gpx+xml'})
             };
           },
           responseType : 'arraybuffer'
         },
         deleteItineraryGpx: {
           url: ConfigService.restUrlPrefix + '/download/itinerary/:id/delete-gpx',
           method: 'PUT',
           headers: {
             'Content-type' : 'application/gpx+xml',
             'Accept' : 'application/gpx+xml,application/octet-stream'
           },
           cache: false
         }
       });
     }]);
