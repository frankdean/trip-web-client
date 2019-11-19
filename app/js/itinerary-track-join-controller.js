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

angular.module('myApp.itinerary.track.join.controller', [])
  .controller(
    'ItineraryTrackJoinCtrl',
    ['$rootScope', '$scope',
     '$routeParams',
     '$log',
     '$location',
     'ItinerarySelectionService',
     'ItineraryTrackService',
     'PathColorService',
     'MapConfigService',
     'leafletBoundsHelpers',
     function($rootScope, $scope,
              $routeParams,
              $log,
              $location,
              ItinerarySelectionService,
              ItineraryTrackService,
              PathColorService,
              MapConfigService,
              leafletBoundsHelpers) {
       $rootScope.pageTitle = null;

       $scope.itineraryId = $routeParams.itineraryId !== undefined ? decodeURIComponent($routeParams.itineraryId) : undefined;
       var i, t, choices = ItinerarySelectionService.getChoices();
       if (choices) {
         if (choices.tracks && choices.tracks.length > 0) {

           angular.extend($scope, {
             data: {},
             autozoom: true,
             joinTracks: false,
             status: {
               showMap: false
             },
             map: {
               height: 240,
               status: {
                 showMap: false
               },
               controls: {
                 scale: {
                   position: "bottomright"
                 }
               },
               center: {zoom: 14},
               paths: []
             }
           });

           PathColorService.query()
             .$promise.then(function(colors) {
               $scope.colors = colors;
             }).catch(function(response) {
               $log.warn('Error fetching track colors', response.status, response.statusText);
               $scope.ajaxRequestError = {
                 error: true,
                 status: response.status
               };
             });

           MapConfigService.getMapLayers()
             .then(function(layers) {
               angular.extend($scope.map, {
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
                 }
               });
               $scope.status.showMap = true;
             })
             .catch(function(error) {
               $log.error('Failed to get the map layer configuration: ', error);
               $scope.mapLayersError = {error: error};
             });

           ItineraryTrackService.getTracks(
             {id: $scope.itineraryId,
              tracks: choices.tracks})
             .$promise.then(function(tracks) {
               $scope.tracks = tracks;
               if (tracks && tracks.length > 0 && tracks[0].name && tracks[0].name.length > 0) {
                 $scope.data.name = tracks[0].name + ' (joined)';
               }
               $scope.updateMap();
             }).catch(function(response) {
               $scope.ajaxRequestError = {
                 error: true,
                 status: response.status
               };
               if (response.status === 401) {
                 $location.path('/login');
               } else if (response.status === 400) {
                 $log.warn('Invalid request for itinerary tracks: ', response.statusText);
               } else {
                 $log.warn('Error fetching itinerary tracks: ', response.status, response.statusText);
               }
             });
         }
       } else {
         $log.warn('Display selection not set - no tracks specified');
         $location.path('/itinerary');
         $location.search({id: encodeURIComponent($scope.itineraryId)});
       }

       $scope.updateMap = function() {
         var latlng, latlngs = [];
         $scope.map.paths = [];
         if ($scope.tracks) {
           $scope.tracks.forEach(function(track) {
             track.segments.forEach(function(ts) {
               ts.points.forEach(function(v) {
                 latlng =  {lat: parseFloat(v.lat, 10), lng: parseFloat(v.lng, 10)};
                 latlngs.push(latlng);
               });
             });
             if (!$scope.joinTracks) {
               $scope.map.paths.push({
                 color: track.htmlcolor ? track.htmlcolor : 'red',
                 opacity: 0.5,
                 weight: 4,
                 latlngs: latlngs
               });
               latlngs = [];
             }
           });
           if ($scope.autozoom) {
             var bounds = L.latLngBounds(latlngs);
             $scope.map.paths.forEach(function(p) {
               bounds.extend(p.latlngs);
             });
             if (bounds && bounds.isValid()) {
               $scope.map.bounds = leafletBoundsHelpers.createBoundsFromLeaflet(bounds);
               $scope.map.bounds.options = {maxZoom: 16};
             }
           }
           if ($scope.joinTracks) {
             $scope.map.paths.push({
               color: 'red',
               opacity: 0.5,
               weight: 4,
               latlngs: latlngs
             });
           }
         }
       };

       $scope.up = function(trackId) {
         i = $scope.tracks.findIndex(function(e) {
           return trackId === e.id;
         });
         if (i > -1) {
           t = $scope.tracks.splice(i, 1);
           i--;
           if (i < 0) {
             $scope.tracks.push(t[0]);
           } else {
             $scope.tracks.splice(i, 0, t[0]);
           }
         }
         $scope.updateMap();
       };
       $scope.down = function(trackId) {
         i = $scope.tracks.findIndex(function(e) {
           return trackId === e.id;
         });
         if (i > -1) {
           t = $scope.tracks.splice(i, 1);
           i++;
           if (i > $scope.tracks.length) {
             i = 0;
           }
           $scope.tracks.splice(i, 0, t[0]);
         }
         $scope.updateMap();
       };
       $scope.join = function(form) {
         var newTrack = {
           name: $scope.data.name,
           color: $scope.data.color,
           segments: []
         };
         $scope.tracks.forEach(function(track) {
           track.segments.forEach(function(ts) {
             newTrack.segments = newTrack.segments.concat(ts);
           });
         });

         ItineraryTrackService.save(
           {id: $scope.itineraryId,
            track: newTrack
           })
           .$promise.then(function() {
             $location.path('/itinerary');
             $location.search({id: encodeURIComponent($scope.itineraryId)});
           }).catch(function(response) {
             $log.warn('Error creating new track:', response.status, response.statusText);
             $scope.ajaxRequestError = {
               error: true,
               status: response.status
             };
           });
       };
       $scope.cancel = function(form) {
         $location.path('/itinerary');
         $location.search({id: encodeURIComponent($scope.itineraryId)});
       };
     }]);
