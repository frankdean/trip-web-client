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

angular.module('myApp.itinerary.factory.js', [] )

  .service(
  'ItinerarySelectionService',
  ['$log',
   function($log) {
     this.options = undefined;
     this.setChoices = function(choices) {
       this.options = choices;
     };
     this.getChoices = function() {
       return this.options;
     };
   }])

  .factory(
    'ItineraryService',
    ['$resource', 'ConfigService',
  function($resource, ConfigService){
    var url = ConfigService.restUrlPrefix + '/itinerary/:id';
    return $resource(url, {id: '@id'}, {
      query: {url: ConfigService.restUrlPrefix + '/itineraries'}
    });
  }])

  .factory(
    'ItineraryWaypointService',
    ['$resource', 'ConfigService',
  function($resource, ConfigService){
    var url = ConfigService.restUrlPrefix + '/itinerary/:id/waypoint/:wptId';
    return $resource(url, {id: '@id', wptId: '@wptId'}, {
      count: {url: ConfigService.restUrlPrefix + '/itinerary/:id/waypoints/count'},
      move: {method: 'POST', url: ConfigService.restUrlPrefix + '/itinerary/:id/waypoint/:wptId/move'},
      getSpecifiedWaypoints: {method: 'POST',
                              isArray: true,
                              url: ConfigService.restUrlPrefix + '/itinerary/:id/waypoints/specified'}
    });
  }])

  .factory(
    'ItineraryRouteNameService',
    ['$resource', 'ConfigService',
     function($resource, ConfigService) {
       var url = ConfigService.restUrlPrefix + '/itinerary/:itineraryId/route/name/:routeId';
       return $resource(url, {itineraryId: '@itineraryId', routeId: '@routeId'}, {
       });
     }])

  .factory(
    'ItineraryTrackNameService',
    ['$resource', 'ConfigService',
     function($resource, ConfigService) {
       var url = ConfigService.restUrlPrefix + '/itinerary/:itineraryId/track/name/:trackId';
       return $resource(url, {itineraryId: '@itineraryId', trackId: '@trackId'}, {
       });
     }])

  .factory(
    'PathColorService',
    ['$resource', 'ConfigService',
     function($resource, ConfigService) {
       var url = ConfigService.restUrlPrefix + '/path/colors';
       return $resource(url);
     }])

  .factory(
    'WaypointSymbolService',
    ['$resource', 'ConfigService',
     function($resource, ConfigService) {
       var url = ConfigService.restUrlPrefix + '/waypoint/symbols';
       return $resource(url);
     }])

  .factory(
    'GeorefFormatService',
    ['$resource', 'ConfigService',
     function($resource, ConfigService) {
       var url = ConfigService.restUrlPrefix + '/georef/formats';
       return $resource(url);
     }])

.factory(
  'ItineraryRouteService',
  ['$resource', 'ConfigService',
   function($resource, ConfigService) {
     var url = ConfigService.restUrlPrefix + '/itinerary/:id/route/:routeId';
     return $resource(url, {id: '@id', routeId: '@routeId'}, {
       routeNames: {isArray: true, url: ConfigService.restUrlPrefix + '/itinerary/:id/routes/names'},
       getRoutes: {method: 'POST', url: ConfigService.restUrlPrefix + '/itinerary/:id/routes', isArray: true},
       update: {method: 'PUT', url: ConfigService.restUrlPrefix + '/itinerary/:id/route/:routeId/points'}
     });
   }])

.factory(
  'ItineraryTrackService',
  ['$resource', 'ConfigService',
   function($resource, ConfigService) {
     var url = ConfigService.restUrlPrefix + '/itinerary/:id/tracks';
     return $resource(url, {id: '@id'}, {
       trackNames: {isArray: true, url: url + '/names'},
       getTracks: {method: 'POST', isArray: true}
     });
   }])

  .factory(
    'ItinerarySharingService',
    ['$resource', 'ConfigService',
  function($resource, ConfigService){
    var url = ConfigService.restUrlPrefix + '/itinerary/share/:id';
    return $resource(url, {id: '@id'}, {
      query: {isArray: false},
      update: {method: 'POST'},
      save: {method: 'PUT'}
    });
  }])

  .factory(
    'ItinerarySharingReportService',
    ['$resource', 'ConfigService',
     function($resource, ConfigService) {
       var url = ConfigService.restUrlPrefix + '/itineraries/shares';
       return $resource(url, {}, {
         query: {isArray: false}
       });
     }]);
