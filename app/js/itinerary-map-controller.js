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
    ['$scope',
     '$sanitize',
     '$routeParams',
     '$location',
     'ConfigService',
     'leafletBoundsHelpers',
     '$log',
     '$window',
     'MapConfigService',
     'UtilsService',
     'ItineraryWaypointService',
     'ItineraryTrackService',
     'ItineraryRouteService',
     'ItinerarySelectionService',
     function($scope,
              $sanitize,
              $routeParams,
              $location,
              ConfigService,
              leafletBoundsHelpers,
              $log,
              $window,
              MapConfigService,
              UtilsService,
              ItineraryWaypointService,
              ItineraryTrackService,
              ItineraryRouteService,
              ItinerarySelectionService) {
       var choices = ItinerarySelectionService.getChoices(),
           drawnItems = new L.FeatureGroup(),
           autoDiscover = true,
           myBounds;
       $scope.itineraryId = $routeParams.id !== undefined ? decodeURIComponent($routeParams.id) : undefined;
       $scope.ajaxRequestError = {error: false};
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
                 $log.warn('Invalid request for itinerary tracks: ', response.statusText);
               } else {
                 $log.warn('Error fetching itinerary tracks: ', response.status, response.statusText);
               }
             });
         }
         if (choices.routes && choices.routes.length > 0) {
           autoDiscover = false;
           ItineraryRouteService.getRoutes(
             {id: $scope.itineraryId,
              routes: choices.routes})
             .$promise.then(function(routes) {
               var latlng, path;
               routes.forEach(function(r) {
                 var latlngs = [];
                 r.points.forEach(function(rp) {
                   latlng =  {lat: parseFloat(rp.lat, 10), lng: parseFloat(rp.lng, 10), time: (new Date(rp.time)).toLocaleString('en-GB')};
                   latlngs.push(latlng);
                 });
                 path = {
                   color: 'blue',
                   weight: 4,
                   latlngs: latlngs
                 };
                 if (myBounds) {
                   myBounds.extend(latlngs);
                 } else {
                   myBounds = L.latLngBounds(latlngs);
                 }
                 var lpolyline = new L.Polyline(latlngs, {color: 'Fuchsia', opacity: 0.5, weight: 4});
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
                 $log.warn('Invalid request for itinerary routes: ', response.statusText);
               } else {
                 $log.warn('Error fetching itinerary routes: ', response.status, response.statusText);
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
                 mText = w.name && w.name.length > 0 ? '<b>' + _.escape(w.name) + '</b>' : '';
                 mText += w.name && w.name.length > 0 && w.comment && w.comment.length > 0 ? '</br>' : '';
                 mText += w.comment && w.comment.length > 0 ? _.escape(w.comment) : '';
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
                 $log.warn('Invalid request for itinerary waypoints: ', response.statusText);
               } else {
                 $log.warn('Error fetching itinerary waypoints: ', response.status, response.statusText);
               }
             });
         }
       } else {
         $log.warn('Display selection not set - no routes, waypoints or tracks specified');
         $location.path('/itinerary');
         $location.search({id: encodeURIComponent($scope.itineraryId)});
       }

       angular.extend($scope, {
         status: {
           // Delay construction of map object until attribution fetched from server
           showMap: false
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
           autoDiscover: true,
           zoom: 16
         };
       }
       $scope.$on('leafletDirectiveDraw.draw:created', function(e, payload) {
         $scope.ajaxRequestError = {error: false};
         $scope.invalidMarkerError = {error: false};
         $scope.invalidRouteError = {error: false};
         if (payload.leafletEvent.layerType === 'marker') {
           if (!payload.leafletEvent.layer.tl_id) {
             // Create a new marker
             // Allow some editing around 180 degrees of longitude
             if (payload.leafletEvent.layer._latlng.lng > 180) {
               payload.leafletEvent.layer._latlng.lng -= 360;
             } else if (payload.leafletEvent.layer._latlng.lng < -180) {
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
             if (v.lng > 180) {
               v.lng -= 360;
             } else if (v.lng < -180) {
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
         var layers = payload.leafletEvent.layers;
         layers.eachLayer(function (layer) {
           if (layer instanceof L.Marker) {
             if (layer.tl_id) {
               // Allow some editing around 180 degrees of longitude
               if (layer.getLatLng().lng > 180) {
                 layer.getLatLng().lng -= 360;
               } else if (layer.getLatLng().lng < -180) {
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
                     $scope.ajaxRequestError = {
                       error: true,
                       status: response.status
                     };
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
                 if (v.lng > 180) {
                   v.lng -= 360;
                 } else if (v.lng < -180) {
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
         payload.leafletEvent.layers.eachLayer(function (layer) {
           if (layer instanceof L.Marker) {
             if (layer.tl_id) {
               ItineraryWaypointService.delete({},
                                               {id: $scope.itineraryId,
                                                wptId: layer.tl_id})
                 .$promise.catch(function(response) {
                   $scope.ajaxRequestError = {
                     error: true,
                     status: response.status
                   };
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
                 });
             }
           }
         });
       });
       $scope.markPosition = function() {
         $scope.ajaxRequestError = {error: false};
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
           });
       };
       $scope.goBack = function() {
         $location.path('/itinerary');
         $location.search({id: encodeURIComponent($scope.itineraryId)});
       };

     }]);
