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

angular.module('myApp.itinerary.track.edit.controller', [])

  .controller(
    'ItineraryTrackEditCtrl',
    ['$rootScope', '$scope',
     '$routeParams',
     '$location',
     '$log',
     '$window',
     'ConfigService',
     'MapConfigService',
     'leafletBoundsHelpers',
     'ItineraryTrackService',
     'ItineraryTrackNameService',
     'ItineraryTrackSegmentService',
     'PathColorService',
     'StateService',
     function($rootScope, $scope,
              $routeParams,
              $location,
              $log,
              $window,
              ConfigService,
              MapConfigService,
              leafletBoundsHelpers,
              ItineraryTrackService,
              ItineraryTrackNameService,
              ItineraryTrackSegmentService,
              PathColorService,
              StateService) {
       $rootScope.pageTitle = null;
       $scope.data={};
       $scope.state = {edit: false};
       $scope.itineraryId = $routeParams.itineraryId !== undefined ? decodeURIComponent($routeParams.itineraryId) : undefined;
       $scope.trackId = $routeParams.trackId !== undefined ? decodeURIComponent($routeParams.trackId) : undefined;
       $scope.shared = $routeParams.shared !== undefined ? decodeURIComponent($routeParams.shared) === "true" : false;
       $scope.pageSize = 10;
       $scope.offset = $scope.page ? $scope.pageSize * ($scope.page -1) : 0;
       $scope.totalCount = 0;
       $scope.autozoom = true;

       angular.extend($scope, {
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

       $scope.listSegments = function() {
         $scope.map.paths.splice(0);
         ItineraryTrackSegmentService.query(
           {itineraryId: $scope.itineraryId,
            trackId: $scope.trackId,
            page_size: $scope.pageSize,
            offset: $scope.offset
           })
           .$promise.then(function(trackInfo) {
             $scope.data.selectAll = false;
             $scope.data = trackInfo;
             $scope.totalCount = $scope.data.count;
           }).catch(function(response) {
             if (response.status === 401) {
               $location.path('/login');
             } else {
               $log.warn('Error fetching track segments:', response.status, response.statusText);
               $scope.ajaxRequestError = {
                 error: true,
                 status: response.status
               };
             }
           });
       };
       $scope.listSegments();
       $scope.doPagingAction = function(text, page, pageSize, total) {
         $scope.formError = undefined;
         $scope.offset = pageSize * (page - 1);
         $scope.listSegments();
       };
       $scope.cancel = function(form) {
         $location.path('/itinerary');
         $location.search({
           id: encodeURIComponent($scope.itineraryId)
         });
       };
       $scope.selectAll = function(form) {
         $scope.formError = undefined;
         $scope.map.paths.splice(0);
         $scope.data.track.segments.forEach(function(v) {
           v.selected = $scope.data.selectAll;
           $scope.showSegment(v);
         });
       };
       $scope.removeSegment = function(segmentId) {
         var i = $scope.map.paths.findIndex(function(v) {
           return (v.tripSegmentId === segmentId);
         });
         if (i > -1) {
           $scope.map.paths.splice(i, 1);
         }
       };
       $scope.showSegment = function(segment) {
         if (segment.selected) {
           ItineraryTrackSegmentService.getPoints(
             {itineraryId: $scope.itineraryId,
              trackId: $scope.trackId,
              segmentId: segment.id
             })
             .$promise.then(function(segmentInfo) {
               var latlng, latlngs = new Array(segmentInfo.points.length);
               segmentInfo.points.forEach(function(v, index) {
                 latlng =  {lat: parseFloat(v.lat, 10), lng: parseFloat(v.lng, 10)/*, time: (new Date(v.time)).toLocaleString('en-GB')*/};
                 latlngs[index] = latlng;
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
               $scope.map.paths.push({
                 tripSegmentId: segment.id,
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
         } else {
           $scope.removeSegment(segment.id);
         }
       };
       $scope.deleteSegments = function(form) {
         var selectedSegments = [],
             selectedCount = 0;
         $scope.formError = undefined;
         $scope.data.track.segments.forEach(function(v) {
           if (v.selected) {
             selectedCount++;
             selectedSegments.push(v.id);
             $scope.removeSegment(v.id);
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
         ItineraryTrackSegmentService.deleteSegments(
           {itineraryId: $scope.itineraryId,
            trackId: $scope.trackId,
            segments: selectedSegments})
           .$promise.then(function() {
             $scope.listSegments();
           }).catch(function(response) {
             $log.warn('Error deleting track segments:', response.status, response.statusText);
             $scope.ajaxRequestError = {
               error: true,
               status: response.status
             };
           });
       };
       $scope.split = function(form) {
         var selectedSegmentId,
             selectedSegments = [],
             selectedCount = 0,
             segmentIndex,
             newTrack = {};
         $scope.formError = undefined;
         $scope.data.track.segments.forEach(function(v) {
           if (v.selected) {
             selectedCount++;
             selectedSegmentId = Number(v.id);
           }
         });
         if (selectedCount > 1) {
           $log.error('More than one segment selected');
           $scope.formError = {editOnlyOne: true};
         } else {
           ItineraryTrackService.getTracks(
             {id: $scope.itineraryId,
              tracks: [$scope.trackId]
             })
             .$promise.then(function(tracks) {
               if (tracks.length > 0) {
                 segmentIndex = tracks[0].segments.findIndex(function(e) {
                   return Number(e.id) === selectedSegmentId;
                 });
                 if (segmentIndex > -1) {
                   newTrack.itinerary_id = $scope.itineraryId;
                   newTrack.name = tracks[0].name + ' (split)';
                   newTrack.color = tracks[0].color;
                   newTrack.segments = tracks[0].segments.splice(segmentIndex);
                   ItineraryTrackService.save(
                     {id: $scope.itineraryId,
                      track: newTrack
                     })
                     .$promise.then(function() {
                       newTrack.segments.forEach(function(v) {
                         selectedSegments.push(v.id);
                       });
                       // Delete the segments from the current track
                       ItineraryTrackSegmentService.deleteSegments(
                         {itineraryId: $scope.itineraryId,
                          trackId: $scope.trackId,
                          segments: selectedSegments})
                         .$promise.then(function() {
                           $location.path('/itinerary');
                           $location.search({id: encodeURIComponent($scope.itineraryId)});
                         }).catch(function(response) {
                           $log.warn('Error deleting track segments for original track:',
                                     response.status, response.statusText);
                           $scope.ajaxRequestError = {
                             error: true,
                             status: response.status
                           };
                         });
                     }).catch(function(response) {
                       $log.warn('Error creating new track:', response.status, response.statusText);
                       $scope.ajaxRequestError = {
                         error: true,
                         status: response.status
                       };
                     });
                 } else {
                   $log.error('Could not find segment ID: %d to split the track', selectedSegmentId);
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

       $scope.mergeSegments = function(form) {
         $scope.formError = undefined;
         var i,
             contiguous = true,
             open = false,
             combinedSegment,
             selectedSegments = [],
             selectedCount = 0;
         $scope.data.track.segments.forEach(function(v) {
           if (v.selected) {
             selectedCount++;
             selectedSegments.push(v.id);
             if (selectedCount === 1) {
               open = true;
             }
             if (!open) {
               contiguous = false;
             }
           } else {
             if (open) {
               open = false;
             }
           }
         });
         if (!contiguous) {
           $log.error('Selected items are not contiguous');
           $scope.formError = {notContiguous: true};
         } else {
           if (selectedCount > 1) {
             ItineraryTrackService.getTracks(
               {id: $scope.itineraryId,
                tracks: [$scope.trackId]
               })
               .$promise.then(function(tracks) {
                 if (tracks.length > 0) {
                   // Combine all segments that exist in the selected list into a single segment
                   tracks[0].segments.forEach(function(segment) {
                     i = selectedSegments.findIndex(function(sid) {
                       // $log.debug('Comparing', sid, 'with', segment.id);
                       return sid === segment.id;
                     });
                     if (i > -1) {
                       // segment is selected
                       if (combinedSegment) {
                         combinedSegment.points = combinedSegment.points.concat(segment.points);
                         segment.points = [];
                       } else {
                         combinedSegment = segment;
                       }
                     }
                   });
                   // Prune empty segments
                   tracks[0].segments = tracks[0].segments.filter(function(segment) {
                     return segment.points.length > 0;
                   });
                   ItineraryTrackService.save(
                     {id: $scope.itineraryId,
                      trackId: $scope.trackId,
                      segments: tracks[0].segments
                     })
                     .$promise.then(function() {
                       $scope.listSegments();
                     }).catch(function(response) {
                       $log.warn('Error updating track segments:', response.status, response.statusText);
                       $scope.ajaxRequestError = {
                         error: true,
                         status: response.status
                       };
                     });
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
           } else {
             $scope.formError = {selectTwoMinimum: true};
           }
         }
       };

       $scope.startEditAttributes = function() {
         if ($scope.colors) {
           $scope.state.edit = true;
         } else {
           PathColorService.query()
             .$promise.then(function(colors) {
               $scope.colors = colors;
               $scope.state.edit = true;
             }).catch(function(response) {
               $log.warn('Error fetching track colors', response.status, response.statusText);
               $scope.ajaxRequestError = {
                 error: true,
                 status: response.status
               };
             });
         }
       };

       $scope.saveAttributes = function(form) {
         $scope.ajaxRequestError = {error: false};
         if (form && form.$valid) {
           ItineraryTrackNameService.save({},
                                          {itineraryId: $scope.itineraryId,
                                           trackId: $scope.trackId,
                                           name: $scope.data.track.name,
                                           color: $scope.data.track.color
                                          })
             .$promise.then(function(value) {
               $scope.state.edit = false;
             }).catch(function(response) {
               $log.warn('Save itinerary track attributes failed');
               if (response.status === 401) {
                 $location.path('/login');
               } else {
                 $scope.ajaxRequestError = {
                   error: true,
                   status: response.status
                 };
               }
             });
         } else {
           $log.error('Form is invalid');
         }
       };

     }]);
