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

angular.module('myApp.itinerary.wpt.controller', [])

  .controller(
    'ItineraryWaypointCtrl',
    ['$scope',
     '$routeParams',
     '$location',
     '$log',
     'UserPreferencesService',
     'WaypointSymbolService',
     'GeorefFormatService',
     'ItineraryWaypointService',
     'modalDialog',
     function ($scope, $routeParams, $location, $log, UserPreferencesService,
               WaypointSymbolService, GeorefFormatService,
               itineraryWaypointService, modalDialog) {
       $scope.data = {};
       $scope.master = {};
       $scope.coordFormat = UserPreferencesService.getCoordFormat();
       $scope.positionFormat = UserPreferencesService.getPositionFormat();
       $scope.itineraryId = $routeParams.itineraryId !== undefined ? decodeURIComponent($routeParams.itineraryId) : undefined;
       $scope.wptId = $routeParams.waypointId !== undefined ? decodeURIComponent($routeParams.waypointId) : undefined;
       WaypointSymbolService.query()
         .$promise.then(function(symbols) {
           $scope.symbols = symbols;
         }).catch(function(response) {
           $log.warn('Error fetching waypoint symbols', response.status, response.statusText);
           $scope.ajaxRequestError = {
             error: true,
             status: response.status
           };
         });
       GeorefFormatService.query()
         .$promise.then(function(georefFormats) {
           $scope.georefFormats = georefFormats;
         }).catch(function(response) {
           $log.warn('Error fetching Georef Formats', response.status, response.statusText);
           $scope.ajaxRequestError = {
             error: true,
             status: response.status
           };
         });
       if ($scope.wptId) {
         itineraryWaypointService.get({id: $scope.itineraryId, wptId: $scope.wptId})
           .$promise.then(function(wpt) {
             var time = wpt.time ? new Date(wpt.time) : undefined;
             angular.extend($scope.data, wpt, {position: wpt.lat + ',' + wpt.lng}, {time: time});
             $scope.master = angular.copy($scope.data);
           }).catch(function(response) {
             if (response.status === 401) {
               $location.path('/login');
             } else {
               $log.warn('Error fetching itinerary waypoint:', response.status, response.statusText);
               $scope.ajaxRequestError = {
                 error: true,
                 status: response.status
               };
             }
           });
       } else {
         // New waypoint
         $scope.data.time = new Date();
       }
       $scope.save = function(form) {
         if (form && form.$valid) {
           itineraryWaypointService.save({},
                                         {id: $scope.itineraryId,
                                          wptId: $scope.wptId,
                                          name: $scope.data.name,
                                          lat: $scope.data.lat,
                                          lng: $scope.data.lng,
                                          altitude: $scope.data.altitude,
                                          time: $scope.data.time,
                                          symbol: $scope.data.symbol,
                                          comment: $scope.data.comment,
                                          description: $scope.data.description,
                                          samples: $scope.data.samples,
                                          type: $scope.data.type,
                                          color: $scope.data.color
                                         })
             .$promise.then(function(value) {
               $location.path('/itinerary');
               $location.search({id: encodeURIComponent($scope.itineraryId)});
             }).catch(function(response) {
               $log.warn('Save itinerary waypoint failed');
               $scope.ajaxRequestError = {
                 error: true,
                 status: response.status
               };
               if (response.status === 401) {
                 $location.path('/login');
               }
             });
         }
       };
       $scope.cancel = function(form) {
         if (!form.$dirty || modalDialog.confirm('Cancel?') === true) {
           $location.path('/itinerary');
           $location.search({id: encodeURIComponent($scope.itineraryId)});
         }
       };
       $scope.reset = function(form) {
         $scope.ajaxRequestError = {error: false};
         if (form && form.$dirty && modalDialog.confirm('Reset changes?')) {
           form.$setPristine();
           form.$setUntouched();
           $scope.data = angular.copy($scope.master);
         }
       };
       $scope.$on('TL_COORD_FORMAT_CHANGED', function(e, data) {
         if (data) {
           UserPreferencesService.setCoordFormat(data);
         }
       });
       $scope.$on('TL_POSITION_FORMAT_CHANGED', function(e, data) {
         if (data) {
           UserPreferencesService.setPositionFormat(data);
         }
       });
     }])

  .directive(
    'position',
    ['$q', 'UtilsService', '$log', function($q, UtilsService, $log) {

      function link(scope, element, attrs, ctrl) {
        ctrl.$asyncValidators.position = function(modelValue, viewValue) {
          var def = $q.defer();
          var coord = UtilsService.parseTextAsDegrees(modelValue);
          if (isFinite(coord.lat) && isFinite(coord.lng) && coord.lat >= -90 && coord.lat <= 90 && coord.lng >= -180 && coord.lng <= 180) {
            def.resolve();
          } else {
            def.reject();
          }
          return def.promise;
        };
      }

      return {
        require: 'ngModel',
        restrict: 'A',
        link: link
      };
    }])

  .directive(
    'tlLatLng',
    ['coordFilter', 'UtilsService', '$log', function(coordFilter, UtilsService, $log) {

      function link(scope, element, attrs) {
        scope.$watch(attrs.tlLatLng, function(value) {
          if (value) {
            var coord = UtilsService.parseTextAsDegrees(value);
            scope.$eval(attrs.lat + ' = ' + coord.lat);
            scope.$eval(attrs.lng + ' = ' + coord.lng);
            scope.$emit('TL_POSITION_UPDATED', {lat: coord.lat, lng: coord.lng});
          }
        });
      }

      return {
        restrict: 'A',
        link: link
      };
    }])

  .directive(
    'tlCoordFormat',
    ['coordFilter', 'UtilsService', '$log', function(coordFilter, UtilsService, $log) {

      var myElement, format, formatPosition;

      function link(scope, element, attrs) {
        scope.$watch(attrs.tlCoordFormat, function(value) {
          if (value) {
            myElement = element;
            format = value;
            element.text(UtilsService.convertToFormat(scope.$eval(attrs.lat), scope.$eval(attrs.lng), format, formatPosition));
            scope.$emit('TL_COORD_FORMAT_CHANGED', format);
          } else {
            element.text('');
          }
        });
        scope.$watch(attrs.positionFormat, function(value) {
          if (value) {
            formatPosition = value;
            if (format) {
              element.text(UtilsService.convertToFormat(scope.$eval(attrs.lat), scope.$eval(attrs.lng), format, formatPosition));
            }
            scope.$emit('TL_POSITION_FORMAT_CHANGED', formatPosition);
          } else {
            element.text('');
          }
        });
      }

      return {
        restrict : 'A',
        controller : ['$scope', function($scope) {
          $scope.$on('TL_POSITION_UPDATED', function(e, data) {
            if (myElement && format) {
              myElement.text(UtilsService.convertToFormat(data.lat, data.lng, format, formatPosition));
            }
          });
        }],
        link : link
      };
    }]);
