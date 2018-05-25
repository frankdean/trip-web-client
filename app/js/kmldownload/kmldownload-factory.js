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

angular.module('myApp.kmldownload.factory', [] )

  .factory(
    'InitKmlDownload',
    ['$resource', 'ConfigService', 'Blob', '$window',
     function ($resource, ConfigService, Blob, $window) {
       return $resource(ConfigService.restUrlPrefix + '/downloadkml', {id: '@id'}, {
         downloadItineraryKml: {
           url: ConfigService.restUrlPrefix + '/download/itinerary/:id/kml',
           method: 'POST',
           headers: {
             'Content-type' : 'application/json',
             'Accept' : 'application/vnd.google-earth.kml+xml,application/octet-stream'
           },
           cache: false,
           transformResponse: function(data) {
             return {
               data: new Blob([data], {type: 'application/vnd.google-earth.kml+xml'})
             };
           },
           responseType : 'arraybuffer'
         }
       });
     }]);
