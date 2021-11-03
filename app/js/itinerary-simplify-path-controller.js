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

angular.module('myApp.itinerary.simplify.path.controller', [])

  .controller(
    'ItinerarySimplifyPathCtrl',
    ['$rootScope',
     '$scope',
     '$location',
     '$routeParams',
     'MapConfigService',
     'ItineraryTrackService',
     'leafletBoundsHelpers',
     'SimplifyService',
     '$log',
     function(
       $rootScope,
       $scope,
       $location,
       $routeParams,
       MapConfigService,
       ItineraryTrackService,
       leafletBoundsHelpers,
       SimplifyService,
       $log) {

       $scope.itineraryId = $routeParams.itineraryId !== undefined ? decodeURIComponent($routeParams.itineraryId) : undefined;
       $scope.trackId = $routeParams.trackId !== undefined ? decodeURIComponent($routeParams.trackId) : undefined;

       angular.extend($scope, {
         tolerance: 0,
         highestQuality: true,
         showJoined: false,
         height: 240,
         status: {
           showMap: false
         },
         controls: {
           scale: {
             position: "bottomright"
           }
         },
         bounds: {},
         markers: [],
         paths: []
       });

       MapConfigService.getMapLayers()
         .then(function(layers) {
           angular.extend($scope, {
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
               }
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
          tracks: [$scope.trackId]})
         .$promise.then(function(tracks) {
           var myBounds, size, latlng, latlngs, totalOriginalPoints = 0;
           if (tracks.length > 0) {
             $scope.track = tracks[0];
             $scope.originalPaths = [];
             tracks[0].segments.forEach(function(ts) {
               latlngs = [];
               ts.points.forEach(function(tp) {
                 latlng =  {lat: parseFloat(tp.lat, 10), lng: parseFloat(tp.lng, 10), time: (new Date(tp.time)).toLocaleString('en-GB')};
                 latlngs.push(latlng);
               });
               totalOriginalPoints += ts.points.length;
               $scope.originalPaths.push({
                 color: tracks[0].htmlcolor ? tracks[0].htmlcolor : 'red',
                 weight: 4,
                 opacity: 0.25,
                 latlngs: latlngs
               });
               if (myBounds) {
                 myBounds.extend(latlngs);
               } else {
                 myBounds = L.latLngBounds(latlngs);
               }
             });
             $scope.totalOriginalPoints = totalOriginalPoints;
             if (myBounds && myBounds.isValid()) {
               size = L.bounds(
                 L.point(myBounds._northEast.lng, myBounds._northEast.lat),
                 L.point(myBounds._southWest.lng, myBounds._southWest.lat)
               ).getSize();
               $scope.maxTolerance = Math.max(size.x, size.y) / 20;
               $scope.step = $scope.maxTolerance / 1000;
               $scope.bounds = leafletBoundsHelpers.createBoundsFromLeaflet(myBounds);
               $scope.bounds.options = {maxZoom: 14};
             } else {
               $scope.maxTolerance = 0.5;
             }
             $scope.simplify();
           }
         }).catch(function(response) {
           $scope.ajaxRequestError = {
             error: true,
             status: response.status
           };
           if (response.status === 401) {
             $location.path('/login');
           } else if (response.status === 400) {
             $log.warn('Invalid request for itinerary tracks:', response.statusText);
           } else {
             $log.warn('Error fetching itinerary tracks:', response.status, response.statusText);
           }
         });

       $scope.simplify = function() {
         var latlng,
             originalPaths, simplifiedPaths = [],
             path, sPoints, latlngs;
         $scope.totalPoints = 0;
         if ($scope.originalPaths) {
           $scope.originalPaths.forEach(function(originalPath) {
             latlngs = SimplifyService.simplify(originalPath.latlngs, $scope.tolerance, $scope.highestQuality);
             $scope.totalPoints += latlngs.length;
             simplifiedPaths.push({
               color: $scope.originalPaths[0].color ? $scope.originalPaths[0].color : 'red',
               weight: 2,
               opacity: 1,
               latlngs: latlngs
             });
           });
           if ($scope.showJoined) {
             latlngs = [];
             $scope.originalPaths.forEach(function(p) {
               latlngs= latlngs.concat(p.latlngs);
             });
             $scope.paths = [];
             if ($scope.originalPaths.length > 0) {
               $scope.paths.push({
                 color: $scope.originalPaths[0].color,
                 weight: $scope.originalPaths[0].weight,
                 opacity: $scope.originalPaths[0].opacity,
                 latlngs: latlngs
               });
             }
             latlngs = [];
             simplifiedPaths.forEach(function(p) {
               latlngs= latlngs.concat(p.latlngs);
             });
             if (simplifiedPaths.length > 0) {
               $scope.paths.push({
                 color: simplifiedPaths[0].color,
                 weight: simplifiedPaths[0].weight,
                 opacity: simplifiedPaths[0].opacity,
                 latlngs: latlngs
               });
             }
           } else {
             $scope.paths = $scope.originalPaths.concat(simplifiedPaths);
           }
         }
       };

       $scope.save = function() {
         var points;
         if ($scope.track) {
           $scope.track.name = $scope.track.name + ' (simplified)';
           $scope.track.segments.forEach(function(ts) {
             ts.points = SimplifyService.simplify(ts.points, $scope.tolerance, $scope.highestQuality);
             delete ts.id;
             ts.points.forEach(function(tp) {
               delete tp.id;
             });
           });
           delete $scope.track.id;
           ItineraryTrackService.save(
             {id: $scope.itineraryId,
              track: $scope.track
             })
             .$promise.then(function() {
               $location.path('/itinerary');
               $location.search({
                 id: encodeURIComponent($scope.itineraryId)
               });
             }).catch(function(response) {
               $log.warn('Error creating new track:', response.status, response.statusText);
               $scope.ajaxRequestError = {
                 error: true,
                 status: response.status
               };
             });
         }
       };

       $scope.cancel = function() {
         $location.path('/itinerary');
         $location.search({
           id: encodeURIComponent($scope.itineraryId)
         });
       };

     }]);
