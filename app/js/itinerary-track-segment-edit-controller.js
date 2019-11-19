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

angular.module('myApp.itinerary.track.segment.edit.controller', [])

  .controller(
    'ItineraryTrackSegmentEditCtrl',
    ['$rootScope', '$scope',
     '$routeParams',
     '$location',
     '$log',
     '$window',
     'ConfigService',
     'MapConfigService',
     'leafletBoundsHelpers',
     'ItineraryTrackService',
     'ItineraryTrackSegmentService',
     function($rootScope, $scope,
              $routeParams,
              $location,
              $log,
              $window,
              ConfigService,
              MapConfigService,
              leafletBoundsHelpers,
              ItineraryTrackService,
              ItineraryTrackSegmentService) {
       $rootScope.pageTitle = null;

       $scope.itineraryId = $routeParams.itineraryId !== undefined ? decodeURIComponent($routeParams.itineraryId) : undefined;
       $scope.trackId = $routeParams.trackId !== undefined ? decodeURIComponent($routeParams.trackId) : undefined;
       $scope.segmentId = $routeParams.segmentId !== undefined ? decodeURIComponent($routeParams.segmentId) : undefined;
       $scope.shared = $routeParams.shared !== undefined ? decodeURIComponent($routeParams.shared) === "true" : false;
       $scope.pageSize = 10;
       $scope.offset = $scope.page ? $scope.pageSize * ($scope.page -1) : 0;
       $scope.totalCount = 0;
       $scope.autozoom = true;
       $scope.data = {};

       angular.extend($scope, {
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

       $scope.listPoints = function() {
         $scope.markers.splice(0);
         ItineraryTrackSegmentService.getPoints(
           {itineraryId: $scope.itineraryId,
            trackId: $scope.trackId,
            segmentId: $scope.segmentId,
            page_size: $scope.pageSize,
            offset: $scope.offset
           })
           .$promise.then(function(segmentInfo) {
             $scope.points = segmentInfo.points;
             $scope.totalCount = segmentInfo.count;
             if ($scope.data.selectAll) {
               $scope.selectAll();
             }
           }).catch(function(response) {
             if (response.status === 401) {
               $location.path('/login');
             } else {
               $log.warn('Error fetching track segment points:', response.status, response.statusText);
               $scope.ajaxRequestError = {
                 error: true,
                 status: response.status
               };
             }
           });
       };

       $scope.showSegment = function() {
         $scope.paths.splice(0);
         ItineraryTrackSegmentService.getPoints(
           {itineraryId: $scope.itineraryId,
            trackId: $scope.trackId,
            segmentId: $scope.segmentId
           })
           .$promise.then(function(segmentInfo) {
             var latlng, latlngs = new Array(segmentInfo.points.length);
             $scope.segment = {
               distance: segmentInfo.distance,
               ascent: segmentInfo.ascent,
               descent: segmentInfo.descent,
               lowest: segmentInfo.lowest,
               highest: segmentInfo.highest
             };
             segmentInfo.points.forEach(function(v, index) {
               latlng =  {lat: parseFloat(v.lat, 10), lng: parseFloat(v.lng, 10)};
               latlngs[index] = latlng;
             });
             if ($scope.autozoom) {
               var bounds = L.latLngBounds(latlngs);
               $scope.paths.forEach(function(p) {
                 bounds.extend(p.latlngs);
               });
               if (bounds && bounds.isValid()) {
                 $scope.bounds = leafletBoundsHelpers.createBoundsFromLeaflet(bounds);
                 $scope.bounds.options = {maxZoom: 16};
               }
             }
             $scope.paths.push({
               color: 'red',
               opacity: 0.5,
               weight: 4,
               latlngs: latlngs
             });
           }).catch(function(response) {
             if (response.status === 401) {
               $location.path('/login');
             } else {
               $log.warn('Error fetching track segment points:', response.status, response.statusText);
               $scope.ajaxRequestError = {
                 error: true,
                 status: response.status
               };
             }
           });
       };

       $scope.showSegment();
       $scope.listPoints();
       $scope.doPagingAction = function(text, page, pageSize, total) {
         $scope.formError = undefined;
         $scope.offset = pageSize * (page - 1);
         $scope.listPoints();
       };
       $scope.cancel = function(form) {
         $location.path('/itinerary-track-edit');
         $location.search({
           itineraryId: encodeURIComponent($scope.itineraryId),
           trackId: encodeURIComponent($scope.trackId)
         });
       };
       $scope.selectAll = function(form) {
         $scope.formError = undefined;
         $scope.markers.splice(0);
         $scope.points.forEach(function(v) {
           v.selected = $scope.data.selectAll;
           $scope.showMarker(v);
         });
       };
       $scope.removeMarker = function(pointId) {
         var i = $scope.markers.findIndex(function(v) {
           return (v.tripPointId === pointId);
         });
         if (i > -1) {
           $scope.markers.splice(i, 1);
         }
       };
       $scope.showMarker = function(point) {
         var msg;
         if (point.selected) {
           if ($scope.autozoom) {
             var bounds = L.latLngBounds({lat: point.lat, lng: point.lng});
             $scope.markers.forEach(function(p) {
               bounds.extend({lat: p.lat, lng: p.lng});
             });
             if (bounds && bounds.isValid()) {
               $scope.bounds = leafletBoundsHelpers.createBoundsFromLeaflet(bounds);
               $scope.bounds.options = {maxZoom: 16};
             } else {
               if ($scope.points) {
                 $scope.points.forEach(function(v) {
                   bounds.extend({lat: v.lat, lng: v.lng});
                   if (bounds.isValid()) {
                     $scope.bounds = leafletBoundsHelpers.createBoundsFromLeaflet(bounds);
                     $scope.bounds.options = {maxZoom: 16};
                   }
                 });
               }
             }
           }
           msg = 'ID: ' + point.id;
           if (point.time) {
             msg += '</br>' + (new Date(point.time)).toLocaleString('en-GB');
           }
           $scope.markers.push(
             {tripPointId: point.id,
              lat: point.lat,
              lng: point.lng,
              icon: ConfigService.getDefaultMarkerIcon(),
              message: msg
             });
         } else {
           $scope.removeMarker(point.id);
         }
       };
       $scope.deletePoints = function(form) {
         var selectedPoints = [],
             selectedCount = 0;
         $scope.formError = undefined;
         $scope.points.forEach(function(v) {
           if (v.selected) {
             selectedCount++;
             selectedPoints.push(v.id);
             $scope.removeMarker(v.id);
           }
         });
         if ($scope.totalCount - $scope.offset - selectedCount < 1) {
           // If we've deleted all the items on the last page, decrement the page number
           if ($scope.offset > $scope.pageSize) {
             $scope.offset -= $scope.pageSize;
           } else {
             $scope.offset = 0;
           }
         }
         ItineraryTrackSegmentService.deletePoints(
           {itineraryId: $scope.itineraryId,
            trackId: $scope.trackId,
            segmentId: $scope.segmentId,
            points: selectedPoints})
           .$promise.then(function() {
             $scope.showSegment();
             $scope.listPoints();
           }).catch(function(response) {
             $log.warn('Error deleting track segment points:', response.status, response.statusText);
             $scope.ajaxRequestError = {
               error: true,
               status: response.status
             };
           });
       };
       $scope.split = function(form) {
         var findSegmentId,
             selectedPointId,
             selectedCount = 0,
             pointIndex,
             segmentIndex,
             newSegment = {};

         findSegmentId = Number($scope.segmentId);
         $scope.formError = undefined;
         $scope.points.forEach(function(v) {
           if (v.selected) {
             selectedCount++;
             selectedPointId = Number(v.id);
           }
         });
         if (selectedCount > 1) {
           $log.error('Too many selected');
           $scope.formError = {editOnlyOne: true};
         } else {
           ItineraryTrackService.getTracks(
             {id: $scope.itineraryId,
              tracks: [$scope.trackId]
             })
             .$promise.then(function(tracks) {
               if (tracks.length > 0) {
                 segmentIndex = tracks[0].segments.findIndex(function(e) {
                   return Number(e.id) === findSegmentId;
                 });
                 if (segmentIndex > -1) {
                   pointIndex = tracks[0].segments[segmentIndex].points.findIndex(function(e) {
                     return e.id === selectedPointId;
                   });
                   if (pointIndex > -1) {
                     // Slice found segment on selectedPointId creating newSegment
                     newSegment.points = tracks[0].segments[segmentIndex].points.slice(pointIndex);
                     tracks[0].segments[segmentIndex].points.splice(pointIndex);
                     // Split segments and insert one
                     pointIndex = tracks[0].segments.splice(segmentIndex + 1, 0, newSegment);
                     ItineraryTrackService.save(
                       {id: $scope.itineraryId,
                        trackId: $scope.trackId,
                        segments: tracks[0].segments
                       })
                       .$promise.then(function() {
                         $location.path('/itinerary-track-edit');
                         $location.search({
                           itineraryId: encodeURIComponent($scope.itineraryId),
                           trackId: encodeURIComponent($scope.trackId)
                         });
                       }).catch(function(response) {
                         $log.warn('Error updating track segments:', response.status, response.statusText);
                         $scope.ajaxRequestError = {
                           error: true,
                           status: response.status
                         };
                       });
                   } else {
                     $log.error('Failed to find selected point in track segment', selectedPointId);
                   }
                 } else {
                   $log.error('Could not find segment ID: %d', $scope.segmentId);
                 }
               } else {
                 $log.error('Track not found');
               }
             }).catch(function(response) {
               $log.warn('Error deleting track segment points:', response.status, response.statusText);
               $scope.ajaxRequestError = {
                 error: true,
                 status: response.status
               };
             });
         }
       };

     }]);
