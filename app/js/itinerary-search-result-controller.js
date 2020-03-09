/**
 * @license TRIP - Trip Recording and Itinerary Planning application.
 * (c) 2016-2019 Frank Dean <frank@fdsd.co.uk>
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

angular.module('myApp.itinerary.search.result.controller', [])

  .controller(
    'ItinerarySearchResultCtrl',
    ['$rootScope', '$scope',
     '$log',
     '$window',
     '$location',
     '$sanitize',
     '$routeParams',
     'leafletBoundsHelpers',
     'CopyAndPasteService',
     'MapConfigService',
     'StateService',
     'ItineraryRouteService',
     'ItineraryWaypointService',
     'ItineraryTrackService',
     'ItinerarySelectionService',
     'ItinerarySearchService',
     function($rootScope, $scope,
              $log,
              $window,
              $location,
              $sanitize,
              $routeParams,
              leafletBoundsHelpers,
              CopyAndPasteService,
              MapConfigService,
              StateService,
              ItineraryRouteService,
              ItineraryWaypointService,
              ItineraryTrackService,
              ItinerarySelectionService,
              ItinerarySearchService
             ) {
       var searchState, lat, lng, distance;
       $scope.messages = {};
       $rootScope.pageTitle = null;
       angular.extend($scope, {
         routeMapLayers: new Map(),
         waypointMapLayers: new Map(),
         trackMapLayers: new Map(),
         state: {
           showMap: false
         },
         map: {
           height: $window.innerHeight - 168,
           controls: {
             scale: {
               position: "bottomright"
             }
           },
           bounds: {},
           markers: [],
           paths: []
         }
       });
       lat = $routeParams.lat === undefined ? undefined : decodeURIComponent($routeParams.lat);
       lng = $routeParams.lng === undefined ? undefined : decodeURIComponent($routeParams.lng);
       distance = $routeParams.distance === undefined ? undefined : decodeURIComponent($routeParams.distance);
       if (lat !== undefined && lng !== undefined && distance !== undefined) {
         StateService.saveItinerarySearch({lat: lat, lng: lng, distance: distance});
       } else {
         searchState = StateService.getItinerarySearch();
         if (searchState !== undefined) {
           lat = searchState.lat;
           lng = searchState.lng;
           distance = searchState.distance;
         }
       }
       $scope.page = StateService.getItinerarySearchResultsPage();
       $scope.pageSize = 10;
       $scope.offset = $scope.page ? $scope.pageSize * ($scope.page -1) : 0;
       $scope.totalCount = 0;
       $scope.listItineraries = function () {
         ItinerarySearchService.query(
           {
             lat: lat,
             lng: lng,
             distance: distance,
             offset: $scope.offset,
             page_size: $scope.pageSize
           })
           .$promise.then(function(itineraries) {
             $scope.itineraries = itineraries;
             $scope.totalCount = $scope.itineraries.count;
             if (itineraries && itineraries.payload) {
               if (!$scope.selection) {
                 $scope.selection = {};
               }
               itineraries.payload.forEach(function(itinerary) {
                 if (!$scope.selection[itinerary.id]) {
                   $scope.selection[itinerary.id] = {
                     allGeoItemsSelected: false,
                     allRoutesSelected: false,
                     allWaypointsSelected: false,
                     allTracksSelected: false
                   };
                 }
                 if ($scope.selection[itinerary.id].expanded) {
                   $scope.fetchItineraryItems(itinerary);
                 }
               });
             }
             // Workaround to value being lost on returning to the page
             $scope.page = Math.floor($scope.offset / $scope.pageSize + 1);
             if (itineraries.payload.length === 0) {
               // Suggests page number is now higher than the number of results
               // Reset so that at least the next query will be correct
               $scope.offset = 0;
               $scope.page = 1;
               StateService.saveItinerarySearchResultsPage(1);
               if (itineraries.count > 0) {
                 // Repeat the query to get the first page
                 $scope.ajaxRequestError = {error: false};
                 ItinerarySearchService.query(
                   {
                     lat: lat,
                     lng: lng,
                     distance: distance,
                     offset: $scope.offset,
                     page_size: $scope.pageSize
                   })
                   .$promise.then(function(itineraries) {
                     $scope.itineraries = itineraries;
                     $scope.totalCount = $scope.itineraries.count;
                   }).catch(function(response) {
                     $scope.ajaxRequestError = {error: true};
                   });
               } // end query second attempt
             }
           }).catch(function(response) {
             if (response.status === 401) {
               $location.path('/login');
             } else {
               $scope.ajaxRequestError = {
                 error: true,
                 status: response.status
               };
               $log.warn('Error fetching itinerary search results:', response.status, response.statusText);
             }
           });
       };
       MapConfigService.getMapLayers()
         .then(function(layers) {
           angular.extend($scope.map, {
             layers: {
               baselayers: layers
             },
             drawOptions: {
               position: "topright",
               draw: {
                 polyline: false,
                 polygon: false,
                 rectangle: false,
                 circlemarker: false,
                 circle: false,
                 marker: false
               },
               edit: {
                 featureGroup: new L.FeatureGroup(),
                 edit: false,
                 remove: false
               }
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
         })
         .catch(function(error) {
           $log.error('Failed to get the map layer configuration:', error);
           $scope.mapLayersError = {error: error};
         });

       $scope.listItineraries();

       $scope.doPagingAction = function(text, page, pageSize, total) {
         $scope.offset = pageSize * (page - 1);
         StateService.saveItinerarySearchResultsPage(page);
         $scope.listItineraries();
       };
       $scope.fetchItineraryItems = function(itinerary) {
         searchState = StateService.getItinerarySearch();
         $scope.myBounds = null;
         if (!itinerary.populated && $scope.selection[itinerary.id].expanded && searchState !== undefined) {
           if (!$scope.selection[itinerary.id]) {
             $scope.selection[itinerary.id].routesExpanded = false;
             $scope.selection[itinerary.id].waypointsExpanded = false;
             $scope.selection[itinerary.id].tracksExpanded = false;
           }
           itinerary.populated = true;
           lat = searchState.lat;
           lng = searchState.lng;
           distance = searchState.distance;
           $scope.ajaxRequestError = {error: false};
           ItinerarySearchService.routes(
             {
               id: itinerary.id,
               lat: lat,
               lng: lng,
               distance: distance
             })
             .$promise.then(function(routes) {
               itinerary.routes = routes;
               if ($scope.selection[itinerary.id].routesExpanded == null) {
                 $scope.selection[itinerary.id].routesExpanded = routes.length > 0;
               }
               routes.forEach(function(r) {
                 r.selected = $scope.routeMapLayers.has(r.id);
               });
             }).catch(function(response) {
               $scope.ajaxRequestError = {error: true};
             });
           ItinerarySearchService.waypoints(
             {
               id: itinerary.id,
               lat: lat,
               lng: lng,
               distance: distance
             })
             .$promise.then(function(waypoints) {
               itinerary.waypoints = waypoints;
               if ($scope.selection[itinerary.id].waypointsExpanded == null) {
                 $scope.selection[itinerary.id].waypointsExpanded = waypoints.length > 0;
               }
               waypoints.forEach(function(w) {
                 w.selected = $scope.waypointMapLayers.has(w.id);
               });
             }).catch(function(response) {
               $scope.ajaxRequestError = {error: true};
             });
           ItinerarySearchService.tracks(
             {
               id: itinerary.id,
               lat: lat,
               lng: lng,
               distance: distance
             })
             .$promise.then(function(tracks) {
               itinerary.tracks = tracks;
               if ($scope.selection[itinerary.id].tracksExpanded == null) {
                 $scope.selection[itinerary.id].tracksExpanded = tracks.length > 0;
               }
               tracks.forEach(function(t) {
                 t.selected = $scope.trackMapLayers.has(t.id);
               });
             }).catch(function(response) {
               $scope.ajaxRequestError = {error: true};
             });
         } else {
           if (!itinerary.populated && $scope.selection[itinerary.id].expanded) {
             $log.warn('Unable to retrieve search parameters');
           }
         }
       };
       $scope.showItinerary = function(itinerary) {
         if (!$scope.selection[itinerary.id]) {
           $scope.selection[itinerary.id] = {};
         }
         $scope.selection[itinerary.id].expanded = !$scope.selection[itinerary.id].expanded;
         $scope.fetchItineraryItems(itinerary);
       };
       $scope.showFeature = function(itinerary, route, waypoint, track) {
         var waypoints = [], routes = [], tracks = [];
         if (route != null) {
           routes.push(route.id);
         }
         if (waypoint != null) {
           waypoints.push(waypoint.id);
         }
         if (track != null) {
           tracks.push(track.id);
         }
         ItinerarySelectionService.setChoices({
           canEdit: itinerary.nickname === null,
           waypoints: waypoints,
           routes: routes,
           tracks: tracks
         });
         $location.path('/itinerary-map');
         $location.search({id: encodeURIComponent(itinerary.id)});
       };
       $scope.selectAllGeoItems = function(itinerary, selectedState) {
         $scope.selection[itinerary.id].allGeoItemsSelected = selectedState;
         $scope.selection[itinerary.id].allRoutesSelected = selectedState;
         $scope.selection[itinerary.id].allWaypointsSelected = selectedState;
         $scope.selection[itinerary.id].allTracksSelected = selectedState;
         $scope.showRoutes(itinerary, itinerary.routes, selectedState);
         $scope.showWaypoints(itinerary, itinerary.waypoints, selectedState);
         $scope.showTracks(itinerary, itinerary.tracks, selectedState);
       };
       $scope.showRoute = function(itinerary, route) {
         $scope.showRoutes(itinerary, [route]);
       };
       $scope.showRoutes = function(itinerary, routes, selectedState) {
         var route, ids = [];
         if (routes && routes.length > 0) {
           routes.forEach(function(r) {
             r.selected = selectedState != null ? selectedState : r.selected;
             if (r.selected) {
               if (!$scope.routeMapLayers.has(r.id)) {
                 ids.push(r.id);
               }
             } else if ($scope.routeMapLayers.has(r.id)) {
               $scope.map.drawOptions.edit.featureGroup.removeLayer($scope.routeMapLayers.get(r.id));
               $scope.routeMapLayers.delete(r.id);
             }
           });
           if (ids.length > 0) {
             ItineraryRouteService.getRoutes(
               {id: itinerary.id,
                routes: [ids]})
               .$promise.then(function(routeList) {
                 var latlng, routeOptions;
                 routeList.forEach(function(r) {
                   var latlngs = [];
                   r.points.forEach(function(rp) {
                     latlng =  {lat: parseFloat(rp.lat, 10), lng: parseFloat(rp.lng, 10), time: (new Date(rp.time)).toLocaleString('en-GB')};
                     latlngs.push(latlng);
                   });
                   if ($scope.myBounds) {
                     $scope.myBounds.extend(latlngs);
                   } else {
                     $scope.myBounds = L.latLngBounds(latlngs);
                   }
                   routeOptions = {
                     color: r.htmlcolor ? r.htmlcolor : 'Fuchsia',
                     opacity: r.color === 'Transparent' ? 0.25 : 0.5,
                     weight: 4
                   };
                   var lpolyline = new L.Polyline(latlngs, routeOptions);
                   lpolyline.tl_id = r.id;
                   route = routes.find(function(e) {
                     return e.id === r.id;
                   });
                   if (route && !$scope.routeMapLayers.has(r.id)) {
                     $scope.routeMapLayers.set(r.id, lpolyline);
                     $scope.map.drawOptions.edit.featureGroup.addLayer(lpolyline);
                   }
                 });
                 if ($scope.myBounds && $scope.myBounds.isValid()) {
                   $scope.map.bounds = leafletBoundsHelpers.createBoundsFromLeaflet($scope.myBounds);
                   $scope.map.bounds.options = {maxZoom: 14};
                 }
                 $scope.state.showMap = true;
               }).catch(function(response) {
                 $scope.ajaxRequestError = {
                   error: true,
                   status: response.status
                 };
                 if (response.status === 401) {
                   $location.path('/login');
                 } else if (response.status === 400) {
                   $log.warn('Invalid request for itinerary routes:', response.statusText);
                 } else {
                   $log.warn('Error fetching itinerary routes:', response.status, response.statusText);
                 }
               });
           }
         }
       };
       $scope.showWaypoint = function(itinerary, waypoint) {
         $scope.showWaypoints(itinerary, [waypoint]);
       };
       $scope.showWaypoints = function(itinerary, waypoints, selectedState) {
         var waypoint, ids = [];
         if (waypoints && waypoints.length > 0) {
           waypoints.forEach(function(w) {
             w.selected = selectedState != null ? selectedState : w.selected;
             if (w.selected) {
               if (!$scope.waypointMapLayers.has(w.id)) {
                 ids.push(w.id);
               }
             } else if ($scope.waypointMapLayers.has(w.id)) {
               $scope.map.drawOptions.edit.featureGroup.removeLayer($scope.waypointMapLayers.get(w.id));
               $scope.waypointMapLayers.delete(w.id);
             }
           });
           if (ids.length > 0) {
             ItineraryWaypointService.getSpecifiedWaypoints(
               {id: itinerary.id,
                waypoints:[ids]})
               .$promise.then(function(waypointList) {
                 var wptLatLngs = [], latlng, time, mText;
                 waypointList.forEach(function(w) {
                   time = w.time ? (new Date(w.time)).toLocaleString('en-GB') : undefined;
                   latlng =  {lat: parseFloat(w.lat, 10), lng: parseFloat(w.lng, 10), time: time};
                   wptLatLngs.push(latlng);
                   var lmarker = new L.Marker(latlng);
                   lmarker.tl_id = w.id;
                   mText = '';
                   mText = w.name && w.name.length > 0 ? '<b>' + w.name + '</b>' : '';
                   mText += w.name && w.name.length > 0 && w.comment && w.comment.length > 0 ? '</br>' : '';
                   mText += w.comment && w.comment.length > 0 ? w.comment : '';
                   lmarker.bindPopup(mText && mText.length > 0 ? $sanitize(mText) : '<b>ID: ' + w.id + '</b>');
                   waypoint = waypoints.find(function(e) {
                     return e.id === w.id;
                   });
                   if (waypoint && !$scope.waypointMapLayers.has(waypoint.id)) {
                     $scope.waypointMapLayers.set(waypoint.id, lmarker);
                     $scope.map.drawOptions.edit.featureGroup.addLayer(lmarker);
                   }
                 });
                 if ($scope.myBounds) {
                   $scope.myBounds.extend(wptLatLngs);
                 } else {
                   $scope.myBounds = L.latLngBounds(wptLatLngs);
                 }
                 if ($scope.myBounds && $scope.myBounds.isValid()) {
                   $scope.map.bounds = leafletBoundsHelpers.createBoundsFromLeaflet($scope.myBounds);
                   $scope.map.bounds.options = {maxZoom: 14};
                 }
                 $scope.state.showMap = true;
               }).catch(function(response) {
                 $log.error('Fetch waypoints failed');
                 $scope.ajaxRequestError = {
                   error: true,
                   status: response.status
                 };
                 if (response.status === 401) {
                   $location.path('/login');
                 } else if (response.status === 400) {
                   $log.warn('Invalid request for itinerary waypoints:', response.statusText);
                 } else {
                   $log.warn('Error fetching itinerary waypoints:', response.status, response.statusText);
                 }
               });
           }
         }
       };
       $scope.showTrack = function(itinerary, track) {
         $scope.showTracks(itinerary, [track]);
       };
       $scope.showTracks = function(itinerary, tracks, selectedState) {
         var track, ids = [];
         if (tracks && tracks.length > 0) {
           tracks.forEach(function(t) {
             t.selected = selectedState != null ? selectedState : t.selected;
             if (t.selected) {
               if (!$scope.trackMapLayers.has(t.id)) {
                 ids.push(t.id);
               }
             } else if ($scope.trackMapLayers.has(t.id)) {
               $scope.map.drawOptions.edit.featureGroup.removeLayer($scope.trackMapLayers.get(t.id));
               $scope.trackMapLayers.delete(t.id);
             }
           });
           if (ids.length > 0) {
             ItineraryTrackService.getTracks(
               {id: itinerary.id,
                tracks: [ids]})
               .$promise.then(function(trackList) {
                 var latlng, pathOptions;
                 trackList.forEach(function(t) {
                   var latlngs = [];
                   t.segments.forEach(function(ts) {
                     ts.points.forEach(function(tp) {
                       latlng =  {lat: parseFloat(tp.lat, 10), lng: parseFloat(tp.lng, 10), time: (new Date(tp.time)).toLocaleString('en-GB')};
                       latlngs.push(latlng);
                     });
                   });
                   pathOptions = {
                     color: t.htmlcolor ? t.htmlcolor : 'red',
                     weight: t.color === 'Transparent' ? 8 : 4,
                     opacity: t.color === 'Transparent' ? 0.25 : 1,
                     latlngs: latlngs
                   };
                   var lpolyline = new L.Polyline(latlngs, pathOptions);
                   lpolyline.tl_id = t.id;
                   track = tracks.find(function(e) {
                     return e.id === t.id;
                   });
                   if (track && !$scope.trackMapLayers.has(track.id)) {
                     $scope.trackMapLayers.set(track.id, lpolyline);
                     $scope.map.drawOptions.edit.featureGroup.addLayer(lpolyline);
                   }
                   if ($scope.myBounds) {
                     $scope.myBounds.extend(latlngs);
                   } else {
                     $scope.myBounds = L.latLngBounds(latlngs);
                   }
                 });
                 if ($scope.myBounds && $scope.myBounds.isValid()) {
                   $scope.map.bounds = leafletBoundsHelpers.createBoundsFromLeaflet($scope.myBounds);
                   $scope.map.bounds.options = {maxZoom: 14};
                 }
                 $scope.state.showMap = true;
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
           }
         }
       };
       $scope.copyItemsForPaste = function(form) {
         var options = [], selectedCount, waypoints, routes, tracks;
         $scope.ajaxRequestError = {error: false};
         $scope.messages = {};
         $scope.formError = {editOnlyOne: false};
         $scope.itineraries.payload.forEach(function(itinerary) {
           selectedCount = 0;
           waypoints = [];
           routes = [];
           tracks = [];
           if (itinerary.routes && itinerary.routes.length > 0) {
             itinerary.routes.forEach(function(v) {
               if (v.selected) {
                 routes.push(v.id);
                 selectedCount++;
               }
             });
           }
           if (itinerary.waypoints && itinerary.waypoints.length > 0) {
             itinerary.waypoints.forEach(function(v) {
               if (v.selected) {
                 waypoints.push(v.id);
                 selectedCount++;
               }
             });
           }
           if (itinerary.tracks && itinerary.tracks.length > 0) {
             itinerary.tracks.forEach(function(v) {
               if (v.selected) {
                 tracks.push(v.id);
                 selectedCount++;
               }
             });
           }
           if (selectedCount > 0) {
             options.push({
               itineraryId: itinerary.id,
               routes: routes,
               waypoints: waypoints,
               tracks: tracks
             });
           }
         }); // itineraries.forEach
         if (options.length > 0) {
           CopyAndPasteService.copy('itinerary-features', options);
           $scope.messages.copied = true;
         } else {
           $scope.messages.copyNothingSelected = true;
         }
       };
     }]);
