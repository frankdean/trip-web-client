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
    ['$rootScope',
     '$scope',
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
     'StateService',
     'RecentPoints',
     'UtilsService',
     function ($rootScope,
               $scope,
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
               StateService,
               RecentPoints,
               UtilsService) {
       var itineraryNavIndexKey = 'itinerary-nav-index', delay = false;
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
       $scope.status = StateService.getKey(itineraryNavIndexKey);
       if ($scope.status == undefined) {
         $scope.status = {
           navIndex: 0,
           routesOpen: true,
           waypointsOpen: true,
           tracksOpen: true,
           routesInitialized: false,
           waypointsInitialized: false,
           tracksInitialized: false
         };
       }
       $scope.itineraryId = $routeParams.id !== undefined ? decodeURIComponent($routeParams.id) : undefined;
       $scope.routing = $routeParams.routing !== undefined ? decodeURIComponent($routeParams.routing) : undefined;
       delay = $routeParams.delay !== undefined ? decodeURIComponent($routeParams.delay) == 'true' : undefined;
       $scope.loadItinerary = function() {
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
               $rootScope.pageTitle = ' - ' + itinerary.title;
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
                 if (!$scope.status.waypointsInitialized) {
                   $scope.status.waypointsOpen = $scope.waypoints.length > 0;
                   $scope.status.waypointsInitialized = true;
                 }
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
                 if (!$scope.status.routesInitialized) {
                   $scope.status.routesOpen = $scope.routeNames.length > 0;
                   $scope.status.routesInitialized = true;
                 }
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
                 if (!$scope.status.tracksInitialized) {
                   $scope.status.tracksOpen = $scope.trackNames.length > 0;
                   $scope.status.tracksInitialized = true;
                 }
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
       };
       if (delay) {
         $timeout(function() {
           $scope.loadItinerary();
         }, 1000);
       } else {
         $scope.loadItinerary();
       }
       $scope.savePageState = function() {
         StateService.setKey(itineraryNavIndexKey, $scope.status);
       };
       $scope.clearPageState = function() {
         StateService.removeKey(itineraryNavIndexKey);
       };
       $scope.edit = function(form) {
         $scope.savePageState();
         $location.path('/itinerary-edit');
         $location.search({id: encodeURIComponent($scope.itineraryId)});
       };
       $scope.close = function() {
         $scope.clearPageState();
         $location.path('/itineraries');
         $location.search('');
       };
       $scope.back = function() {
         $scope.clearPageState();
         $location.path('/itinerary-search-result');
         $location.search('');
       };
       $scope.sharing = function() {
         $scope.savePageState();
         $location.path('/itinerary-sharing');
         $location.search({id: encodeURIComponent($scope.data.id)});
       };
       $scope.upload = function() {
         $scope.savePageState();
         $location.path('/gpx-upload');
         $location.search({id: encodeURIComponent($scope.data.id)});
       };
       $scope.showMap = function(form) {
         var searchParams, waypoints = [], routes = [], tracks = [];
         $scope.savePageState();
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
         searchParams = {
           id: encodeURIComponent($scope.data.id)
         };
         if ($scope.routing === 'itinerary-search-results') {
           searchParams.routing = 'itinerary-search-results';
         }
         $location.path('/itinerary-map');
         $location.search(searchParams);
      };
       $scope.copyItemsForPaste = function(form) {
         var options = [], selectedCount = 0,
             waypoints = [], routes = [], tracks = [];
         $scope.ajaxRequestError = {error: false};
         $scope.messages = {};
         $scope.formError = {editOnlyOne: false};
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
             options.push({
               itineraryId: $scope.itineraryId,
               routes: routes,
               waypoints: waypoints,
               tracks: tracks
             });
           CopyAndPasteService.copy('itinerary-features', options);
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
         if (CopyAndPasteService.type == 'itinerary-features' && Array.isArray(options) && options.length > 0) {
           options.forEach(function(itineraryOption) {
             if (itineraryOption.tracks && itineraryOption.tracks.length > 0) {
               ItineraryTrackService.getTracks(
                 {id: itineraryOption.itineraryId,
                  tracks: itineraryOption.tracks})
                 .$promise.then(function(tracks) {
                   tracks.forEach(function(t) {
                     ItineraryTrackService.save(
                       {id: $scope.itineraryId,
                        track: t
                       })
                       .$promise.then(function() {
                         $scope.status.tracksInitialized = false;
                         $scope.updateTrackNames();
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
             }
             if (itineraryOption.routes && itineraryOption.routes.length > 0) {
               ItineraryRouteService.getRoutes(
                 {id: itineraryOption.itineraryId,
                  routes: itineraryOption.routes})
                 .$promise.then(function(routes) {
                   routes.forEach(function(r) {
                     ItineraryRouteService.save({},
                                                {id: $scope.itineraryId,
                                                 name: r.name,
                                                 color: r.color,
                                                 points: r.points})
                       .$promise.then(function(result) {
                         $scope.status.routesInitialized = false;
                         $scope.updateRouteNames();
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
             }
             if (itineraryOption.waypoints && itineraryOption.waypoints.length > 0) {
               ItineraryWaypointService.getSpecifiedWaypoints(
                 {id: itineraryOption.itineraryId,
                  waypoints: itineraryOption.waypoints})
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
                                                     $scope.status.waypointsInitialized = false;
                                                     $scope.updateWaypoints();
                                                   }).catch(function(response) {
                                                     $log.error('Creating new waypoint from paste failed');
                                                   });
                   }); // forEach
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
           }); // options.forEach
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
                 $scope.status.tracksInitialized = false;
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
                                               $scope.status.waypointsInitialized = false;
                                               $scope.updateWaypoints();
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
                                           $scope.status.waypointsInitialized = false;
                                           $scope.updateWaypoints();
                                         }).catch(function(response) {
                                           $log.error('Creating new waypoint from pasted location failed');
                                         });

         } else {
           $log.error('Unexpected paste request for ', CopyAndPasteService.type, ' type and options of ', CopyAndPasteService.paste());
         }
       };
       $scope.refreshData = function() {
         $scope.updateWaypoints();
         $scope.updateRouteNames();
         $scope.updateTrackNames();
       };
       $scope.editSelected = function(form) {
         $scope.savePageState();
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
         $scope.savePageState();
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
         $scope.savePageState();
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
         $scope.savePageState();
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
         $scope.savePageState();
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
