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

angular.module('myApp.itinerary.map.controller', [])

  .controller(
    'ItineraryMapCtrl',
    ['$rootScope', '$scope',
     '$sanitize',
     '$routeParams',
     '$location',
     'ConfigService',
     'leafletBoundsHelpers',
     '$log',
     '$window',
     '$timeout',
     'MapConfigService',
     'UtilsService',
     'ItineraryWaypointService',
     'ItineraryTrackService',
     'ItineraryRouteService',
     'ItinerarySelectionService',
     'RecentPoints',
     'UserService',
     'mySocket',
     'SharedLocationNickname',
     function($rootScope, $scope,
              $sanitize,
              $routeParams,
              $location,
              ConfigService,
              leafletBoundsHelpers,
              $log,
              $window,
              $timeout,
              MapConfigService,
              UtilsService,
              ItineraryWaypointService,
              ItineraryTrackService,
              ItineraryRouteService,
              ItinerarySelectionService,
              RecentPoints,
              UserService,
              mySocket,
              SharedLocationNickname) {
       $rootScope.pageTitle = null;
       // Hack to disable option to clear all layers from the map
       L.EditToolbar.Delete.include({
         removeAllLayers: false
       });
       var choices = ItinerarySelectionService.getChoices(),
           drawnItems = new L.FeatureGroup(),
           autoDiscover = true,
           myBounds,
           start = new Date(),
           trackColor = 0,
           trackColors = [
             'red',
             'lime',
             'fuchsia',
             'blue',
             'green',
             'navy',
             'purple',
             'maroon',
             'olive',
             'teal',
             'aqua',
             'gray',
             'black',
             'yellow',
             'silver',
             'white'
           ];
       $scope.routing = $routeParams.routing !== undefined ? decodeURIComponent($routeParams.routing) : undefined;
       start.setHours(0);
       start.setMinutes(0);
       start.setSeconds(0);
       start.setMilliseconds(0);
       angular.extend($scope, {
         ajaxRequestError: {error: false},
         itineraryId: $routeParams.id !== undefined ? decodeURIComponent($routeParams.id) : undefined,
         data: {
           highAccuracy: false,
           liveTracks: [],
           dateFrom: start

         },
         state: {
           autocenter: false,
           liveMap: false,
           updateBounds: true,
           showMap: false,
           locationFound: {error: false, success: false}
         },
         map: {
           height: $window.innerHeight - 168,
           controls: {
             scale: {
               position: "bottomright"
             }
           },
           center: {},
           bounds: {},
           markers: [],
           paths: []
         }
       });


       $scope.$on('leafletDirectiveMap.locationfound', function(event, data) {
         $scope.state.locationFound = {error: false, success: true};
       });
       $scope.$on('leafletDirectiveMap.locationerror', function(event, data) {
         $scope.state.locationFound = {error: true, success: false};
       });

       if (choices) {
         if (choices.tracks && choices.tracks.length > 0) {
           autoDiscover = false;
           ItineraryTrackService.getTracks(
             {id: $scope.itineraryId,
              tracks: choices.tracks})
             .$promise.then(function(tracks) {
               var latlng, path;
               tracks.forEach(function(t) {
                 var latlngs = [];
                 t.segments.forEach(function(ts) {
                   ts.points.forEach(function(tp) {
                     latlng =  {lat: parseFloat(tp.lat, 10), lng: parseFloat(tp.lng, 10), time: (new Date(tp.time)).toLocaleString('en-GB')};
                     latlngs.push(latlng);
                   });
                 });
                 path = {
                   color: t.htmlcolor ? t.htmlcolor : 'red',
                   weight: 4,
                   latlngs: latlngs
                 };
                 if (t.color === 'Transparent') {
                   path.weight = 8;
                   path.opacity = 0.25;
                 }
                 if (myBounds) {
                   myBounds.extend(latlngs);
                 } else {
                   myBounds = L.latLngBounds(latlngs);
                 }
                 $scope.map.paths.push(path);
               });
               if (myBounds && myBounds.isValid()) {
                 $scope.map.bounds = leafletBoundsHelpers.createBoundsFromLeaflet(myBounds);
                 $scope.map.bounds.options = {maxZoom: 14};
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
         }
         if (choices.routes && choices.routes.length > 0) {
           autoDiscover = false;
           ItineraryRouteService.getRoutes(
             {id: $scope.itineraryId,
              routes: choices.routes})
             .$promise.then(function(routes) {
               var latlng, routeOptions;
               routes.forEach(function(r) {
                 var latlngs = [];
                 r.points.forEach(function(rp) {
                   latlng =  {lat: parseFloat(rp.lat, 10), lng: parseFloat(rp.lng, 10), time: (new Date(rp.time)).toLocaleString('en-GB')};
                   latlngs.push(latlng);
                 });
                 if (myBounds) {
                   myBounds.extend(latlngs);
                 } else {
                   myBounds = L.latLngBounds(latlngs);
                 }
                 routeOptions = {
                   color: r.htmlcolor ? r.htmlcolor : 'Fuchsia',
                   opacity: r.color === 'Transparent' ? 0.25 : 0.5,
                   weight: 4
                 };
                 var lpolyline = new L.Polyline(latlngs, routeOptions);
                 lpolyline.tl_id = r.id;
                 drawnItems.addLayer(lpolyline);
               });
               if (myBounds && myBounds.isValid()) {
                 $scope.map.bounds = leafletBoundsHelpers.createBoundsFromLeaflet(myBounds);
                 $scope.map.bounds.options = {maxZoom: 14};
               }
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
         if (choices.waypoints && choices.waypoints.length > 0) {
           autoDiscover = false;
           ItineraryWaypointService.getSpecifiedWaypoints(
             {id: $scope.itineraryId,
              waypoints: choices.waypoints})
             .$promise.then(function(waypoints) {
               var wptLatLngs = [], latlng, time, mText;
               waypoints.forEach(function(w) {
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
                 drawnItems.addLayer(lmarker);
               });
               if (myBounds) {
                 myBounds.extend(wptLatLngs);
               } else {
                 myBounds = L.latLngBounds(wptLatLngs);
               }
               if (myBounds && myBounds.isValid()) {
                 $scope.map.bounds = leafletBoundsHelpers.createBoundsFromLeaflet(myBounds);
                 $scope.map.bounds.options = {maxZoom: 14};
               }
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
       } else {
         $location.path('/itinerary');
         $location.search({id: encodeURIComponent($scope.itineraryId)});
       }

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
           $scope.state.showMap = true;
         })
         .catch(function(error) {
           $log.error('Failed to get the map layer configuration:', error);
           $scope.mapLayersError = {error: error};
         });
       if (choices && choices.canEdit) {
         $scope.canDropMarker = true;
         angular.extend(
           $scope.map, {
             drawOptions: {
               position: "topright",
               draw: {
                 polyline: {
                   metric: true,
                   feet: false
                 },
                 polygon: false,
                 rectangle: false,
                 circlemarker: false,
                 circle: false
               },
               edit: {
                 featureGroup: drawnItems,
                 remove: true
               }
             }
           });
       } else {
         angular.extend(
           $scope.map, {
             drawOptions: {
               position: "topright",
               draw: {
                 polyline: false,
                 polygon: false,
                 rectangle: false,
                 circlemarker: true,
                 circle: false,
                 marker: false
               },
               edit: {
                 featureGroup: drawnItems,
                 edit: false,
                 remove: false
               }
             }
           });
       }
       if (autoDiscover) {
         $scope.map.center = {
           enableHighAccuracy: $scope.data.highAccuracy,
           autoDiscover: true,
           zoom: 16
         };
       }
       $scope.$on('leafletDirectiveDraw.draw:created', function(e, payload) {
         $scope.ajaxRequestError = {error: false};
         $scope.invalidMarkerError = {error: false};
         $scope.invalidRouteError = {error: false};
         $scope.state.locationFound = {error: false, success: false};
         if (payload.leafletEvent.layerType === 'marker') {
           if (!payload.leafletEvent.layer.tl_id) {
             // Create a new marker
             // Allow some editing around 180 degrees of longitude
             while (payload.leafletEvent.layer._latlng.lng > 180) {
               payload.leafletEvent.layer._latlng.lng -= 360;
             }
             while (payload.leafletEvent.layer._latlng.lng < -180) {
               payload.leafletEvent.layer._latlng.lng += 360;
             }
             if (UtilsService.validateCoordinate(payload.leafletEvent.layer._latlng.lat,
                                                 payload.leafletEvent.layer._latlng.lng)) {
               ItineraryWaypointService.save({},
                                             {id: $scope.itineraryId,
                                              lat: payload.leafletEvent.layer._latlng.lat,
                                              lng: payload.leafletEvent.layer._latlng.lng,
                                              time: new Date()
                                             })
                 .$promise.then(function(result) {
                   payload.leafletEvent.layer.tl_id = result.id;
                   payload.leafletEvent.layer.bindPopup('ID: ' + result.id);
                   drawnItems.addLayer(payload.leafletEvent.layer);
                 }).catch(function(response) {
                   $log.error('Save waypoint failed', response);
                   $scope.ajaxRequestError = {
                     error: true,
                     status: response.status
                   };
                   if (response.status === 401) {
                     $location.path('/login');
                   }
                 });
             } else {
               $log.warn('Invalid marker position',
                         payload.leafletEvent.layer._latlng.lat,
                         payload.leafletEvent.layer._latlng.lng);
               $scope.invalidMarkerError = {error: true,
                                            lat: payload.leafletEvent.layer._latlng.lat,
                                            lng: payload.leafletEvent.layer._latlng.lng
                                           };
             }
           }
         } else if (payload.leafletEvent.layerType === 'polyline') {
           payload.leafletEvent.layer._latlngs.forEach(function(v, k, a) {
             // Allow some editing around 180 degrees of longitude
             while (v.lng > 180) {
               v.lng -= 360;
             }
             while (v.lng < -180) {
               v.lng += 360;
             }
           });
           if (UtilsService.validateCoordinates(payload.leafletEvent.layer._latlngs)) {
             ItineraryRouteService.save({},
                                        {id: $scope.itineraryId,
                                         points: payload.leafletEvent.layer._latlngs
                                        })
               .$promise.then(function(result) {
                 payload.leafletEvent.layer.tl_id = result.id;
                 angular.extend(
                   payload.leafletEvent.layer.options, {
                     color: 'Fuchsia', opacity: 0.5, weight: 4
                   });
                 drawnItems.addLayer(payload.leafletEvent.layer);
               }).catch(function(response) {
                 $log.error('Save route failed', response);
                 $scope.ajaxRequestError = {
                   error: true,
                   status: response.status
                 };
                 if (response.status === 401) {
                   $location.path('/login');
                 }
               });
           } else {
             $log.error('Create Route. One or more coordinates are out of range: -90 <= lat <= 90, -180 <= lng <= 180');
             $scope.invalidRouteError = {error: true};
           }
         } else {
           drawnItems.addLayer(payload.leafletEvent.layer);
         }
       });
       $scope.$on('leafletDirectiveDraw.draw:edited', function(e, payload) {
         $scope.ajaxRequestError = {error: false};
         $scope.invalidMarkerError = {error: false};
         $scope.invalidRouteError = {error: false};
         $scope.state.locationFound = {error: false, success: false};
         var layers = payload.leafletEvent.layers;
         layers.eachLayer(function (layer) {
           if (layer instanceof L.Marker) {
             if (layer.tl_id) {
               // Allow some editing around 180 degrees of longitude
               while (layer.getLatLng().lng > 180) {
                 layer.getLatLng().lng -= 360;
               }
               while (layer.getLatLng().lng < -180) {
                 layer.getLatLng().lng += 360;
               }
               if (UtilsService.validateCoordinate(
                 layer.getLatLng().lat,
                 layer.getLatLng().lng)) {
                 ItineraryWaypointService.move({},
                                               {id: $scope.itineraryId,
                                                wptId: layer.tl_id,
                                                lat: layer.getLatLng().lat,
                                                lng: layer.getLatLng().lng
                                               })
                   .$promise.catch(function(response) {
                     $log.error('Edit marker failed');
                     $scope.ajaxRequestError = {
                       error: true,
                       status: response.status
                     };
                     if (response.status === 401) {
                       $location.path('/login');
                     }
                   });
               } else {
                 $log.warn('Invalid marker position', layer.getLatLng().lat, layer.getLatLng().lng);
                 $scope.invalidMarkerError = {error: true,
                                              lat: layer.getLatLng().lat,
                                              lng: layer.getLatLng().lng
                                              };
               }
             }
           } else if (layer instanceof L.Polyline) {
             if (layer.tl_id) {
               // Allow some editing around 180 degrees of longitude
               layer.getLatLngs().forEach(function(v, k, a) {
                 while (v.lng > 180) {
                   v.lng -= 360;
                 }
                 while (v.lng < -180) {
                   v.lng += 360;
                 }
               });
               if (UtilsService.validateCoordinates(layer.getLatLngs())) {
                 ItineraryRouteService.update({},
                                              {id: $scope.itineraryId,
                                               routeId: layer.tl_id,
                                               points: layer.getLatLngs()
                                              })
                   .$promise.catch(function(response) {
                     $log.error('Update route failed', response);
                     $scope.ajaxRequestError = {
                       error: true,
                       status: response.status
                     };
                     if (response.status === 401) {
                       $location.path('/login');
                     }
                   });
               } else {
                 $log.error('One or more coordinates are out of range: -90 <= lat <= 90, -180 <= lng <= 180');
                 $scope.invalidRouteError = {error: true};
               }
             } else {
               $log.error('Polyline edited without having an ID');
             }
           } else {
             $log.error('Layer being saved is neither a marker or polyline');
           }
         });
       });
       $scope.$on('leafletDirectiveDraw.draw:deleted', function(e, payload) {
         $scope.ajaxRequestError = {error: false};
         $scope.invalidMarkerError = {error: false};
         $scope.invalidRouteError = {error: false};
         $scope.state.locationFound = {error: false, success: false};
         payload.leafletEvent.layers.eachLayer(function (layer) {
           if (layer instanceof L.Marker) {
             if (layer.tl_id) {
               ItineraryWaypointService.delete({},
                                               {id: $scope.itineraryId,
                                                wptId: layer.tl_id})
                 .$promise.catch(function(response) {
                   $log.error('Delete marker failed');
                   $scope.ajaxRequestError = {
                     error: true,
                     status: response.status
                   };
                   if (response.status === 401) {
                     $location.path('/login');
                   }
                 });
             }
           } else if (layer instanceof L.Polyline) {
             if (layer.tl_id) {
               ItineraryRouteService.delete({},
                                            {id: $scope.itineraryId,
                                             routeId: layer.tl_id})
                 .$promise.catch(function(response) {
                   $log.error('Delete route failed');
                   $scope.ajaxRequestError = {
                     error: true,
                     status: response.status
                   };
                   if (response.status === 401) {
                     $location.path('/login');
                   }
                 });
             }
           }
         });
       });
       $scope.updatePosition = function() {
         $scope.ajaxRequestError = {error: false};
         $scope.state.locationFound = {error: false, success: false};
         $scope.map.center = {
           enableHighAccuracy: $scope.data.highAccuracy,
           autoDiscover: true
         };
       };
       $scope.markPosition = function() {
         $scope.ajaxRequestError = {error: false};
         $scope.state.locationFound = {error: false, success: false};
         var lat = $scope.map.center.lat,
             lng = $scope.map.center.lng;
         ItineraryWaypointService.save({},
                                       {id: $scope.itineraryId,
                                        lat: lat,
                                        lng: lng,
                                        time: new Date()
                                       })
           .$promise.then(function(result) {
             var lmarker = new L.Marker({lat: lat, lng: lng, message: 'ID: ' + result.id});
             lmarker.tl_id = result.id;
             drawnItems.addLayer(lmarker);
             $scope.map.center.zoom = 16;
           }).catch(function(response) {
             $log.error('Drop waypoint failed', response);
             $scope.ajaxRequestError = {
               error: true,
               status: response.status
             };
             if (response.status === 401) {
               $location.path('/login');
             }
           });
       };
       $scope.goBack = function() {
         var searchParams;
         searchParams = {
             id: encodeURIComponent($scope.itineraryId)
         };
         if ($scope.routing === 'itinerary-search-results') {
           searchParams.routing = 'itinerary-search-results';
         }
         $location.path('/itinerary');
         $location.search(searchParams);
       };

       $scope.initLiveMapSettings = function() {
         $scope.state.locationFound = {error: false, success: false};
         if ($scope.state.liveMap) {
           if (!$scope.state.connected) {
             mySocket.connect();
             mySocket.on('connect', function() {
               $scope.state.connected = true;
             });
             mySocket.on('disconnect', function() {
               $scope.state.connected = false;
             });
           }
           SharedLocationNickname.query({})
             .$promise.then(function(nicknames) {
               $scope.data.nicknames = nicknames;
             });
           UserService.nickname({})
             .$promise.then(function(data) {
               $scope.data.myNickname = data.nickname;
             });
         } else {
           $scope.data.selfSelected = false;
           $scope.data.myNickname = null;
           $scope.data.nicknames = null;
           mySocket.disconnect();
           $scope.data.liveTracks.forEach(function(i) {
             $scope.removeListener(i.nickname);
           });
           mySocket.removeAllListeners();
           $scope.state.connected = false;
         }
       };
       // Injected factory service connects during injection only on the
       // first occasion the socket factory is injected.  In scenarios where
       // we don't acutally need the websocket, it would be nice to close it
       // in this first use scenario, but it cannot be closed before it is
       // established and if we close it on a timer it may be too early or
       // so late that the user has changed options such that we do need the
       // websocket.  Decided to leave it connected until we leave the page.
       $scope.$on('$destroy', function() {
         mySocket.disconnect();
         mySocket.removeAllListeners();
       });

       $scope.selectNickname = function(nickname) {
         $scope.state.locationFound = {error: false, success: false};
         if ($scope.data.myNickname && nickname === $scope.data.myNickname) {
           $scope.data.trackSelf = $scope.data.selfSelected;
         } else {
           nickname.selected = nickname.selected ? false : true;
         }
       };

       $scope.addListener = function(nickname) {
         var liveItem;
         var i = $scope.data.liveTracks.findIndex(function(e) {
           return e.nickname === nickname;
         });
         if (i === -1) {
           liveItem =
             {
               nickname: nickname,
               marker: null,
               path: null,
               listen: false,
               color: trackColors[trackColor],
               apply: function(socket, args) {
                 if (args && args[0] && args[0].update) {
                   $scope.state.updateBounds = false;
                   $scope.updateLiveTrack(this.nickname, true);
                 }
               }
             };
           trackColor++;
           if (trackColor >= trackColors.length) {
             trackColor = 0;
           }
           $scope.data.liveTracks.push(liveItem);
         } else {
           liveItem = $scope.data.liveTracks[i];
         }
         if (!liveItem.listen) {
           liveItem.listen = true;
           mySocket.addListener(liveItem.nickname, liveItem);
         }
       };

       $scope.removeLiveItem = function(liveItem) {
         var pos;
         if (liveItem.path) {
           pos = $scope.map.paths.indexOf(liveItem.path);
           if (pos !== -1) {
             $scope.map.paths.splice(pos, 1);
           }
         }
         if (liveItem.marker) {
           pos = $scope.map.markers.indexOf(liveItem.marker);
           if (pos !== -1) {
             $scope.map.markers.splice(pos, 1);
           }
         }
       };

       $scope.removeListener = function(nickname) {
         var i, liveItem;
         i = $scope.data.liveTracks.findIndex(function(e) {
           return e.nickname === nickname;
         });
         if (i !== -1) {
           liveItem = $scope.data.liveTracks[i];
           if (liveItem.listen) {
             mySocket.removeListener(liveItem.nickname, liveItem);
             liveItem.listen = false;
           }
           if (liveItem.path) {
             $scope.removeLiveItem(liveItem);
             liveItem.path = null;
           }
         }
       };

       $scope.updateLiveTrack = function(nickname, focusMarker) {
         var i, liveItem;
         $scope.ajaxRequestError = {error: false};
         i = $scope.data.liveTracks.findIndex(function(e) {
           return e.nickname === nickname;
         });
         if (i !== -1) {
           liveItem = $scope.data.liveTracks[i];
           if (!liveItem.updating) {
             liveItem.updating = true;
             if (liveItem.path) {
               $scope.removeLiveItem(liveItem);
               liveItem.path = null;
             }
             var path, latlng, latlngs = [], now = new Date();
             RecentPoints.query(
               {nickname: nickname === $scope.data.myNickname ? undefined : nickname,
                max_hdop: $scope.data.maxHdop,
                from: $scope.data.dateFrom,
                to: now
               })
               .$promise.then(function(trackData) {
                 path = {
                   color: liveItem.color,
                   opacity: 1,
                   weight: 2,
                   latlngs: latlngs
                 };
                 trackData.payload.forEach(function(item) {
                   latlng =  {lat: parseFloat(item.lat, 10), lng: parseFloat(item.lng, 10), time: (new Date(item.time)).toLocaleString('en-GB'), note: item.note};
                   latlngs.push(latlng);
                 });
                 if (latlng !== undefined) {
                   liveItem.marker = {
                     lat: latlng.lat,
                     lng: latlng.lng,
                     icon: ConfigService.getDefaultMarkerIcon(),
                     focus: /*!$scope.state.updateBounds && */ $scope.state.autocenter && focusMarker ? true : false,
                     message: $sanitize('<b>' + nickname + '</br>'  + latlng.time)
                   };
                   if (latlng.note && latlng.note !== '') {
                     liveItem.marker.message += $sanitize('</br>' + latlng.note);
                   }
                   $scope.map.markers.push(liveItem.marker);
                 }
                 liveItem.path = path;
                 $scope.map.paths.push(path);
                 if (myBounds) {
                   myBounds.extend(latlngs);
                 } else {
                   myBounds = L.latLngBounds(latlngs);
                 }
                 if ($scope.state.updateBounds) {
                   if (myBounds && myBounds.isValid()) {
                     $scope.map.bounds = leafletBoundsHelpers.createBoundsFromLeaflet(myBounds);
                     $scope.map.bounds.options = {maxZoom: 14};
                   } else if (latlng && $scope.state.autocenter) {
                     $scope.map.center = {
                       lat: latlng.lat,
                       lng: latlng.lng,
                       zoom: 14
                     };
                   } else {
                     $scope.map.center = {
                       enableHighAccuracy: $scope.data.highAccuracy,
                       autoDiscover: true,
                       zoom: 16
                     };
                   }
                 } else if (latlng && $scope.state.autocenter) {
                   $scope.map.center = {
                     lat: latlng.lat,
                     lng: latlng.lng,
                     zoom: 14
                   };
                 }
                 if (nickname === $scope.data.myNickname) {
                   $scope.data.myDistance = trackData.distance;
                   $scope.data.myColor = liveItem.path.color;
                 } else if (Array.isArray($scope.data.nicknames)) {
                   $scope.data.nicknames.forEach(function(v) {
                     if (v.nickname === nickname) {
                       v.distance = trackData.distance;
                       v.color = liveItem.path.color;
                     }
                   });
                 }
                 $timeout(function() {
                   liveItem.updating = false;
                 }, 1000);
               }).catch(function(response) {
                 $log.error('Error whilst fetching points - status code:', response.status);
                 $scope.ajaxRequestError = {
                   error: true,
                   status: response.status
                 };
                 if (response.status === 401) {
                   $location.path('/login');
                 }
                 $timeout(function() {
                   liveItem.updating = false;
                 }, 10000);
               });
           // } else {
             // $log.debug('Already running update for', nickname, 'skipping request');
           }
         }
       };

       $scope.updateLiveMapSettings = function() {
         if ($scope.form  && $scope.form.$valid) {
           $scope.state.updateBounds = true;
           $scope.state.locationFound = {error: false, success: false};
           if ($scope.data.trackSelf) {
             $scope.addListener($scope.data.myNickname);
             $scope.updateLiveTrack($scope.data.myNickname, true);
           } else {
             $scope.removeListener($scope.data.myNickname);
           }
           $scope.data.nicknames.forEach(function(v) {
             if (v.selected) {
               $scope.addListener(v.nickname);
               $scope.updateLiveTrack(v.nickname, true);
             } else {
               $scope.removeListener(v.nickname);
             }
           });
           $timeout(function() {
             $scope.state.updateBounds = false;
           }, 3000);
         }
       };

     }]);
