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

angular.module('myApp.itinerary.controller', [])

  .controller(
    'ItineraryCtrl',
    ['$scope',
     '$routeParams',
     '$log',
     '$location',
     '$timeout',
     '$window',
     'ItineraryService',
     'ItineraryWaypointService',
     'ItineraryRouteService',
     'ItineraryTrackService',
     'InitGpxDownload',
     'InitKmlDownload',
     'SaveAs',
     'ItinerarySelectionService',
     'CopyAndPasteService',
     'RecentPoints',
     'UtilsService',
     function ($scope,
               $routeParams,
               $log,
               $location,
               $timeout,
               $window,
               ItineraryService,
               ItineraryWaypointService,
               ItineraryRouteService,
               ItineraryTrackService,
               InitGpxDownload,
               InitKmlDownload,
               SaveAs,
               ItinerarySelectionService,
               CopyAndPasteService,
               RecentPoints,
               UtilsService) {
       $scope.data = {};
       $scope.master = {};
       $scope.formError = {editOnlyOne: false};
       $scope.selection = {
         allGeoItemsSelected: false,
         allRoutesSelected: false,
         allWaypointsSelected: false,
         allTracksSelected: false
       };
       $scope.messages = {};
       $scope.canPaste = CopyAndPasteService.type == 'itinerary-features' || CopyAndPasteService.type == 'location-history' || CopyAndPasteService.type == 'current-position';
       $scope.status = {
         routesOpen: true,
         waypointsOpen: true,
         tracksOpen: true
       };
       $scope.itineraryId = $routeParams.id !== undefined ? decodeURIComponent($routeParams.id) : undefined;
       if ($scope.itineraryId) {
         $scope.state = {new: false, edit: false};
         ItineraryService.get({id: $scope.itineraryId})
           .$promise.then(function(itinerary) {
             $scope.data.id = itinerary.id;
             $scope.data.owned_by_nickname = itinerary.owned_by_nickname;
             $scope.data.shared_to_nickname = itinerary.shared_to_nickname;
             $scope.data.start = itinerary.start;
             $scope.data.finish = itinerary.finish;
             $scope.data.title = itinerary.title;
             $scope.data.description = itinerary.description;
             $scope.master = angular.copy($scope.data);
           }).catch(function(response) {
             $scope.ajaxRequestError = {
               error: true,
               status: response.status
             };
             if (response.status === 401) {
               $location.path('/login');
               $location.search('');
             } else {
               $log.warn('Error fetching itinerary:', response.status, response.statusText);
               $scope.ajaxRequestError = {
                 error: true,
                 status: response.status
               };
             }
           });
         $scope.updateWaypoints = function() {
           ItineraryWaypointService.query({id: $scope.itineraryId})
             .$promise.then(function(result) {
               $scope.waypoints = result;
               $scope.status.waypointsOpen = $scope.waypoints.length > 0;
             }).catch(function(response) {
               if (response.status === 401) {
                 $location.path('/login');
                 $location.search('');
               } else {
                 $log.warn('Error fetching itinerary waypoints');
                 $scope.ajaxRequestError = {
                   error: true,
                   status: response.status
                 };
               }
             });
         };
         $scope.updateRouteNames = function() {
           ItineraryRouteService.routeNames({id: $scope.itineraryId})
             .$promise.then(function(result) {
               $scope.routeNames = result;
               $scope.status.routesOpen = $scope.routeNames.length > 0;
             }).catch(function(response) {
               if (response.status === 401) {
                 $location.path('/login');
                 $location.search('');
               } else {
                 $log.warn('Error fetching itinerary route names');
                 $scope.ajaxRequestError = {
                   error: true,
                   status: response.status
                 };
               }
             });
         };
         $scope.updateTrackNames = function() {
           ItineraryTrackService.trackNames({id: $scope.itineraryId})
             .$promise.then(function(result) {
               $scope.trackNames = result;
               $scope.status.tracksOpen = $scope.trackNames.length > 0;
             }).catch(function(response) {
               if (response.status === 401) {
                 $location.path('/login');
                 $location.search('');
               } else {
                 $log.warn('Error fetching itinerary track names');
                 $scope.ajaxRequestError = {
                   error: true,
                   status: response.status
                 };
               }
             });
         };
         $scope.updateWaypoints();
         $scope.updateRouteNames();
         $scope.updateTrackNames();
       }
       $scope.edit = function(form) {
         $location.path('/itinerary-edit');
         $location.search({id: encodeURIComponent($scope.itineraryId)});
       };
       $scope.close = function() {
         $location.path('/itineraries');
         $location.search('');
       };
       $scope.sharing = function() {
         $location.path('/itinerary-sharing');
         $location.search({id: encodeURIComponent($scope.data.id)});
       };
       $scope.upload = function() {
         $location.path('/gpx-upload');
         $location.search({id: encodeURIComponent($scope.data.id)});
       };
       $scope.showMap = function(form) {
         var waypoints = [], routes = [], tracks = [];
         $scope.waypoints.forEach(function(v) {
           if (v.selected) {
             waypoints.push(v.id);
           }
         });
         $scope.routeNames.forEach(function(v) {
           if (v.selected) {
             routes.push(v.id);
           }
         });
         $scope.trackNames.forEach(function(v) {
           if (v.selected) {
             tracks.push(v.id);
           }
         });
         ItinerarySelectionService.setChoices({
           canEdit: $scope.data.shared_to_nickname === null,
           waypoints: waypoints,
           routes: routes,
           tracks: tracks
         });
         $location.path('/itinerary-map');
         $location.search({id: encodeURIComponent($scope.data.id)});
       };
       $scope.copyItemsForPaste = function(form) {
         $scope.ajaxRequestError = {error: false};
         $scope.messages = {};
         $scope.formError = {editOnlyOne: false};
         var selectedCount = 0,
             waypoints = [], routes = [], tracks = [];
         $scope.waypoints.forEach(function(v) {
           if (v.selected) {
             waypoints.push(v.id);
             selectedCount++;
           }
         });
         $scope.routeNames.forEach(function(v) {
           if (v.selected) {
             routes.push(v.id);
             selectedCount++;
           }
         });
         $scope.trackNames.forEach(function(v) {
           if (v.selected) {
             tracks.push(v.id);
             selectedCount++;
           }
         });
         if (selectedCount > 0) {
           CopyAndPasteService.copy('itinerary-features', {
             itineraryId: $scope.itineraryId,
             waypoints: waypoints,
             routes: routes,
             tracks: tracks
           });
           $scope.messages.copied = true;
           $scope.canPaste = true;
         } else {
           $scope.messages.copyNothingSelected = true;
         }
       };
       $scope.pasteItems = function() {
         var newWaypoints, newWaypoint;
         $scope.ajaxRequestError = {error: false};
         $scope.messages = {};
         var options = CopyAndPasteService.paste();
         if (CopyAndPasteService.type == 'itinerary-features') {
           if (options.tracks && options.tracks.length > 0) {
             ItineraryTrackService.getTracks(
               {id: options.itineraryId,
                tracks: options.tracks})
               .$promise.then(function(tracks) {
                 tracks.forEach(function(t) {
                   ItineraryTrackService.save(
                     {id: $scope.itineraryId,
                      track: t
                     })
                     .$promise.then(function() {
                       //
                     }).catch(function(response) {
                       $log.warn('Error creating new track:', response.status, response.statusText);
                       $scope.ajaxRequestError = {
                         error: true,
                         status: response.status
                       };
                     });
                 }); // tracks forEach
               }).catch(function(response) {
                 $scope.ajaxRequestError = {
                   error: true,
                   status: response.status
                 };
                 if (response.status === 401) {
                   $location.path('/login');
                 } else if (response.status === 400) {
                   $log.warn('Invalid request for pasting itinerary tracks: ', response.statusText);
                 } else {
                   $log.warn('Error fetching itinerary tracks for paste: ', response.status, response.statusText);
                 }
               });
             $timeout(function() {
               $scope.updateTrackNames();
             }, 1000);
           }
           if (options.routes && options.routes.length > 0) {
             ItineraryRouteService.getRoutes(
               {id: options.itineraryId,
                routes: options.routes})
               .$promise.then(function(routes) {
                 routes.forEach(function(r) {
                   ItineraryRouteService.save({},
                                              {id: $scope.itineraryId,
                                               name: r.name,
                                               color: r.color,
                                               points: r.points})
                     .$promise.then(function(result) {
                       //
                     }).catch(function(response) {
                       $log.error('Saving pasted route failed:', response);
                       $scope.ajaxRequestError = {
                         error: true,
                         status: response.status
                       };
                     });

                 });
               }).catch(function(response) {
                 $scope.ajaxRequestError = {
                   error: true,
                   status: response.status
                 };
                 if (response.status === 401) {
                   $location.path('/login');
                 } else if (response.status === 400) {
                   $log.warn('Invalid request for pasting itinerary routes: ', response.statusText);
                 } else {
                   $log.warn('Error fetching itinerary routes for paste: ', response.status, response.statusText);
                 }
               });
             $timeout(function() {
               $scope.updateRouteNames();
             }, 1000);
           }
           if (options.waypoints && options.waypoints.length > 0) {
             ItineraryWaypointService.getSpecifiedWaypoints(
               {id: options.itineraryId,
                waypoints: options.waypoints})
               .$promise.then(function(waypoints) {
                 waypoints.forEach(function(w) {
                   ItineraryWaypointService.save({},
                                                 {id: $scope.itineraryId,
                                                  wptId: undefined,
                                                  name: w.name,
                                                  lat: w.lat,
                                                  lng: w.lng,
                                                  altitude: w.altitude,
                                                  time: w.time,
                                                  symbol: w.symbol,
                                                  comment: w.comment,
                                                  description: w.description,
                                                  samples: w.samples,
                                                  type: w.type,
                                                  color: w.color
                                                 }).$promise.then(function(saveWaypointResponse) {
                                                   //
                                                 }).catch(function(response) {
                                                   $log.error('Creating new waypoint from paste failed');
                                                 });
                 }); // forEach
                 $timeout(function() {
                   $scope.updateWaypoints();
                 }, 1000);
               }).catch(function(response) {
                 $log.error('Fetch waypoints failed');
                 $scope.ajaxRequestError = {
                   error: true,
                   status: response.status
                 };
                 if (response.status === 401) {
                   $location.path('/login');
                 } else if (response.status === 400) {
                   $log.warn('Invalid request for pasting itinerary waypoints: ', response.statusText);
                 } else {
                   $log.warn('Error fetching itinerary waypoints for paste: ', response.status, response.statusText);
                 }
               });
           }
         } else if (CopyAndPasteService.type == 'location-history') {
           options = CopyAndPasteService.paste();
           var newTrack = {
             name: undefined,
             color: undefined,
             segments: [{points: []}]
           };
           RecentPoints.query(
             {nickname: options.nickname,
              from: options.from,
              to: options.to,
              max_hdop: options.max_hdop,
              notesOnlyFlag: options.notesOnlyFlag}
           ).$promise.then(function(result) {
             $scope.locations = result;

             newWaypoints = [];
             result.payload.forEach(function(point) {
               newTrack.segments[0].points.push(point);
               if (point.note != null) {
                 newWaypoint = {};
                 newWaypoint.lat = point.lat;
                 newWaypoint.lng = point.lng;
                 newWaypoint.altitude = point.altitude;
                 newWaypoint.time = point.time;
                 newWaypoint.comment = point.note;
                 newWaypoint.description = 'Created from track log note';
                 newWaypoints.push(newWaypoint);
               }

             }); // payload for Each (point)

             ItineraryTrackService.save(
               {id: $scope.itineraryId,
                track: newTrack
               })
               .$promise.then(function() {
                 $scope.updateTrackNames();
               }).catch(function(response) {
                 $log.warn('Error creating new track:', response.status, response.statusText);
                 $scope.ajaxRequestError = {
                   error: true,
                   status: response.status
                 };
               });

             newWaypoints.forEach(function(w) {
               ItineraryWaypointService.save({},
                                             {id: $scope.itineraryId,
                                              wptId: undefined,
                                              name: w.name,
                                              lat: w.lat,
                                              lng: w.lng,
                                              altitude: w.altitude,
                                              time: w.time,
                                              symbol: w.symbol,
                                              comment: w.comment,
                                              description: w.description,
                                              samples: w.samples,
                                              type: w.type,
                                              color: w.color
                                             }).$promise.then(function(saveWaypointResponse) {
                                               //
                                             }).catch(function(response) {
                                               $log.error('Creating new waypoint from pasting track log failed');
                                             });
             }); // forEach
             newWaypoints = null;
           }).catch(function(response) {
             $log.warn('Failed to fetch location history for paste', response);
             $scope.ajaxRequestError = {
               error: true,
               status: response.status
             };
           });
         } else if (CopyAndPasteService.type == 'current-position') {
           options = CopyAndPasteService.paste();
           ItineraryWaypointService.save({},
                                         {id: $scope.itineraryId,
                                          wptId: undefined,
                                          name: 'Current Location',
                                          lat: options.latitude.toFixed(6),
                                          lng: options.longitude.toFixed(6),
                                          altitude: (options.altitude !== undefined ? options.altitude.toFixed(3) : undefined),
                                          time: new Date(),// options.time,
                                          comment: options.note
                                         }).$promise.then(function(saveWaypointResponse) {
                                           $scope.updateWaypoints();
                                         }).catch(function(response) {
                                           $log.error('Creating new waypoint from pasted location failed');
                                         });

         } else {
           $log.debug('Unexpected paste request for ', CopyAndPasteService.type, ' type and options of ', CopyAndPasteService.paste());
         }
       };
       $scope.refreshData = function() {
         $scope.updateWaypoints();
         $scope.updateRouteNames();
         $scope.updateTrackNames();
       };
       $scope.editSelected = function(form) {
         $scope.ajaxRequestError = {error: false};
         $scope.messages = {};
         var selectedCount = 0,
             waypoints = [], routes = [], tracks = [];
         $scope.waypoints.forEach(function(v) {
           if (v.selected) {
             waypoints.push(v.id);
             selectedCount++;
           }
         });
         $scope.routeNames.forEach(function(v) {
           if (v.selected) {
             routes.push(v.id);
             selectedCount++;
           }
         });
         $scope.trackNames.forEach(function(v) {
           if (v.selected) {
             tracks.push(v.id);
             selectedCount++;
          }
         });
         if (selectedCount === 1) {
           if (waypoints.length === 1) {
             $location.path('/itinerary-wpt-edit');
             $location.search({
               itineraryId: encodeURIComponent($scope.data.id),
               waypointId: encodeURIComponent(waypoints[0])
             });
           }
           if (routes.length === 1) {
             $location.path('/itinerary-route-name');
             $location.search({
               itineraryId: encodeURIComponent($scope.data.id),
               routeId: encodeURIComponent(routes[0])
             });
           }
           if (tracks.length === 1) {
             $location.path('/itinerary-track-name');
             $location.search({
               itineraryId: encodeURIComponent($scope.data.id),
               trackId: encodeURIComponent(tracks[0])
             });
           }
         } else {
           $scope.formError = {editOnlyOne: true};
         }
       };
       $scope.editPath = function(form, isShared) {
         $scope.ajaxRequestError = {error: false};
         $scope.messages = {};
         var selectedCount = 0,
             waypoints = [], routes = [], tracks = [];
         $scope.waypoints.forEach(function(v) {
           if (v.selected) {
             waypoints.push(v.id);
             selectedCount++;
           }
         });
         $scope.routeNames.forEach(function(v) {
           if (v.selected) {
             routes.push(v.id);
             selectedCount++;
           }
         });
         $scope.trackNames.forEach(function(v) {
           if (v.selected) {
             tracks.push(v.id);
             selectedCount++;
          }
         });
         if (selectedCount === 1) {
           if (waypoints.length === 1) {
             $scope.formError = {editPathsOnly: true};
           }
           if (routes.length === 1) {
             $scope.formError = {editPathsOnly: true};
             $location.path('/itinerary-route-edit');
             $location.search({
               itineraryId: encodeURIComponent($scope.data.id),
               routeId: encodeURIComponent(routes[0]),
               shared: encodeURIComponent(isShared)
             });
           }
           if (tracks.length === 1) {
             $location.path('/itinerary-track-edit');
             $location.search({
               itineraryId: encodeURIComponent($scope.data.id),
               trackId: encodeURIComponent(tracks[0]),
               shared: encodeURIComponent(isShared)
             });
           }
         } else {
           $scope.formError = {editOnlyOne: true};
         }
       };
       $scope.joinPaths = function(form) {
         $scope.ajaxRequestError = {error: false};
         $scope.messages = {};
         var selectedCount = 0,
             waypoints = [], routes = [], tracks = [];
         $scope.waypoints.forEach(function(v) {
           if (v.selected) {
             waypoints.push(v.id);
             selectedCount++;
           }
         });
         $scope.routeNames.forEach(function(v) {
           if (v.selected) {
             routes.push(v.id);
             selectedCount++;
           }
         });
         $scope.trackNames.forEach(function(v) {
           if (v.selected) {
             tracks.push(v.id);
             selectedCount++;
          }
         });
         if (waypoints.length > 0) {
           $scope.formError = {joinPathsOnly: true};
         } else if (routes.length > 1) {
           ItinerarySelectionService.setChoices({
             routes: routes
           });
           $location.path('/itinerary-route-join');
           $location.search({
             itineraryId: encodeURIComponent($scope.itineraryId)
           });
         } else if (tracks.length > 1) {
           ItinerarySelectionService.setChoices({
             tracks: tracks
           });
           $location.path('/itinerary-track-join');
           $location.search({
             itineraryId: encodeURIComponent($scope.itineraryId)
           });
         } else {
           $scope.formError = {selectTwoPlusError: true};
         }
       };
       $scope.viewSelected = function(form) {
         $scope.ajaxRequestError = {error: false};
         $scope.messages = {};
         var selectedCount = 0,
             waypoints = [], routes = [], tracks = [];
         $scope.waypoints.forEach(function(v) {
           if (v.selected) {
             waypoints.push(v.id);
             selectedCount++;
           }
         });
         $scope.routeNames.forEach(function(v) {
           if (v.selected) {
             routes.push(v.id);
             selectedCount++;
           }
         });
         $scope.trackNames.forEach(function(v) {
           if (v.selected) {
             tracks.push(v.id);
             selectedCount++;
          }
         });
         if (selectedCount === 1) {
           if (waypoints.length === 1) {
             $location.path('/itinerary-wpt');
             $location.search({
               itineraryId: encodeURIComponent($scope.data.id),
               waypointId: encodeURIComponent(waypoints[0])
             });
           }
         } else {
           $scope.formError = {editOnlyOne: true};
         }
       };
       $scope.createWaypoint = function(form) {
         $location.path('/itinerary-wpt-edit');
         $location.search({
           itineraryId: encodeURIComponent($scope.data.id)
         });
       };
       $scope.selectAllWaypoints = function() {
         $scope.ajaxRequestError = {error: false};
         $scope.messages = {};
         if ($scope.waypoints) {
           $scope.waypoints.forEach(function(v) {
             v.selected = $scope.selection.allWaypointsSelected;
           });
         }
         $scope.formError = {editOnlyOne: false};
       };
       $scope.selectAllRoutes = function() {
         $scope.ajaxRequestError = {error: false};
         $scope.messages = {};
         if ($scope.routeNames) {
           $scope.routeNames.forEach(function(v) {
             v.selected = $scope.selection.allRoutesSelected;
           });
         }
         $scope.formError = {editOnlyOne: false};
       };
       $scope.selectAllTracks = function() {
         $scope.ajaxRequestError = {error: false};
         $scope.messages = {};
         if ($scope.trackNames) {
           $scope.trackNames.forEach(function(v) {
             v.selected = $scope.selection.allTracksSelected;
           });
         }
         $scope.formError = {editOnlyOne: false};
       };
       $scope.selectAllGeoItems = function() {
         $scope.ajaxRequestError = {error: false};
         $scope.messages = {};
         $scope.selection.allWaypointsSelected = $scope.selection.allGeoItemsSelected;
         $scope.selection.allRoutesSelected = $scope.selection.allGeoItemsSelected;
         $scope.selection.allTracksSelected = $scope.selection.allGeoItemsSelected;
         $scope.selectAllWaypoints();
         $scope.selectAllRoutes();
         $scope.selectAllTracks();
       };
       $scope.download = function(form) {
         $scope.ajaxRequestError = {error: false};
         $scope.messages = {};
         $scope.formError = {editOnlyOne: false};
         var waypoints = [], routes = [], tracks = [];
         $scope.waypoints.forEach(function(v) {
           if (v.selected) {
             waypoints.push(v.id);
           }
         });
         $scope.routeNames.forEach(function(v) {
           if (v.selected) {
             routes.push(v.id);
           }
         });
         $scope.trackNames.forEach(function(v) {
           if (v.selected) {
             tracks.push(v.id);
           }
         });
         InitGpxDownload.downloadItineraryGpx(
           { id: $scope.itineraryId,
             waypoints: waypoints,
             routes: routes,
             tracks: tracks
           }).$promise.then(function(response) {
             // Only likely to happen in unit tests
             if (response.data && response.data.size > 0) {
               SaveAs(response.data, 'trip.gpx');
             } else {
               $log.warn('Downloaded response contained no data');
             }
           }).catch(function(response) {
             if (response.status === 401) {
               $location.path('/login');
               $location.search('');
             } else {
               $scope.ajaxRequestError = {
                 error: true,
                 status: response.status
               };
               $log.warn('GPX itinerary download failed', response.status);
             }
           });
       };
       $scope.downloadKml = function(form) {
         $scope.ajaxRequestError = {error: false};
         $scope.messages = {};
         $scope.formError = {editOnlyOne: false};
         var waypoints = [], routes = [], tracks = [];
         $scope.waypoints.forEach(function(v) {
           if (v.selected) {
             waypoints.push(v.id);
           }
         });
         $scope.routeNames.forEach(function(v) {
           if (v.selected) {
             routes.push(v.id);
           }
         });
         $scope.trackNames.forEach(function(v) {
           if (v.selected) {
             tracks.push(v.id);
           }
         });
         InitKmlDownload.downloadItineraryKml(
           { id: $scope.itineraryId,
             waypoints: waypoints,
             routes: routes,
             tracks: tracks
           }).$promise.then(function(response) {
             if (response.data && response.data.size > 0) {
               SaveAs(response.data, 'trip.kml');
             } else {
               $log.warn('Downloaded response contained no data');
             }
           }).catch(function(response) {
             if (response.status === 401) {
               $location.path('/login');
               $location.search('');
             } else {
               $scope.ajaxRequestError = {
                 error: true,
                 status: response.status
               };
               $log.warn('KML itinerary download failed', response.status);
             }
           });
       };
       $scope.deleteUploads = function(form) {
         $scope.ajaxRequestError = {error: false};
         $scope.messages = {};
         $scope.formError = {editOnlyOne: false};
         var waypoints = [], routes = [], tracks = [];
         $scope.waypoints.forEach(function(v) {
           if (v.selected) {
             waypoints.push(v.id);
           }
         });
         $scope.routeNames.forEach(function(v) {
           if (v.selected) {
             routes.push(v.id);
           }
         });
         $scope.trackNames.forEach(function(v) {
           if (v.selected) {
             tracks.push(v.id);
           }
         });
         InitGpxDownload.deleteItineraryGpx(
           { id: $scope.itineraryId,
             waypoints: waypoints,
             routes: routes,
             tracks: tracks
           }).$promise.then(function(response) {
             $scope.selection.allGeoItemsSelected = false;
             $scope.selectAllGeoItems();
             $scope.refreshData();
           }).catch(function(response) {
             $scope.ajaxRequestError = {
               error: true,
               status: response.status
             };
             $log.warn('GPX itinerary delete failed', response.status);
             $scope.refreshData();
           });
       };
     }]);
