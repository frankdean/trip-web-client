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

// Override global value set in angular-pagedown[.min].js
var mdExtraOptions = {
  // extensions: ["tables", "fenced_code_gfm", "def_list", "attr_list", "footnotes", "smartypants", "strikethrough", "newlines"],
  // Constrained to markup included in the [CommonMark Spec](http://spec.commonmark.org)
  extensions: ["fenced_code_gfm"],
  table_class: 'table'
};

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'ngMessages',
  'ngAnimate',
  'ngSanitize',
  'ngFileSaver',
  'ui.bootstrap',
  'mwl.confirm',
  'bw.paging',
  'angular-jwt',
  'nemLogging',
  'ui-leaflet',
  'validation.match',
  'btford.socket-io',
  'ui.pagedown',
  'myApp.admin.password.reset.controller',
  'myApp.config.factory',
  'myApp.gpxdownload.factory',
  'myApp.gpxupload',
  'myApp.itineries.controller',
  'myApp.itinerary.controller',
  'myApp.itinerary.edit.controller',
  'myApp.itinerary.factory.js',
  'myApp.itinerary.map.controller',
  'myApp.itinerary.sharing.controller',
  'myApp.itinerary.sharing.report.controller',
  'myApp.itinerary.wpt.controller',
  'myApp.itinerary.route.name.controller',
  'myApp.itinerary.track.name.controller',
  'myApp.login.controller',
  'myApp.map.controller',
  'myApp.map.point.controller',
  'myApp.shares.controller',
  'myApp.socket.factory',
  'myApp.state.service',
  'myApp.storage.factory',
  'myApp.admin.system.status.controller',
  'myApp.admin.system.status.service',
  'myApp.track.controller',
  'myApp.track.factory',
  'myApp.trackinfo.controller',
  'myApp.user.controller',
  'myApp.user.edit.controller',
  'myApp.user.factory',
  'myApp.utils.factory',
  'myApp.user.prefs.factory',
  'myApp.coord.filter',
  'myApp.version'
])

  .config(['$compileProvider', function ($compileProvider) {
    // disable for production release
    $compileProvider.debugInfoEnabled(true);
  }])

  .config(
    ['$routeProvider', '$httpProvider', 'jwtOptionsProvider', '$logProvider',
     function($routeProvider, $httpProvider, jwtOptionsProvider, $logProvider) {
       $logProvider.debugEnabled(true);
       $routeProvider.
         when('/login', {
           templateUrl: 'partials/login.html',
           controller: 'LoginCtrl'
         }).
         when('/logout', {
           templateUrl: 'partials/login.html',
           controller: 'LogoutCtrl'
         }).
         when('/tracks', {
           templateUrl: 'partials/tracks.html',
           controller: 'TracksCtrl'
         }).
         when('/map', {
           templateUrl: 'partials/map.html',
           controller: 'MapCtrl'
         }).
         when('/map-point', {
           templateUrl: 'partials/map_point.html',
           controller: 'MapPointCtrl'
         }).
         when('/tracker-info', {
           templateUrl: 'partials/tracker-info.html',
           controller: 'TrackerInfoCtrl'
         }).
         when('/sharing', {
           templateUrl: 'partials/sharing.html',
           controller: 'SharesCtrl'
         }).
         when('/itineraries', {
           templateUrl: 'partials/itineraries.html',
           controller: 'ItinerariesCtrl'
         }).
         when('/itinerary', {
           templateUrl: 'partials/itinerary.html',
           controller: 'ItineraryCtrl'
         }).
         when('/itinerary-edit', {
           templateUrl: 'partials/itinerary-edit.html',
           controller: 'ItineraryEditCtrl'
         }).
         when('/itinerary-sharing', {
           templateUrl: 'partials/itinerary-sharing.html',
           controller: 'ItinerarySharingCtrl'
         }).
         when('/itinerary-sharing-report', {
           templateUrl: 'partials/itinerary-sharing-report.html',
           controller: 'ItinerarySharingReportCtrl'
         }).
         when('/itinerary-map', {
           templateUrl: 'partials/itinerary-map.html',
           controller: 'ItineraryMapCtrl'
         }).
         when('/itinerary-wpt', {
           templateUrl: 'partials/itinerary-wpt.html',
           controller: 'ItineraryWaypointCtrl'
         }).
         when('/itinerary-route-name', {
           templateUrl: 'partials/itinerary-route-name.html',
           controller: 'ItineraryRouteNameCtrl'
         }).
         when('/itinerary-track-name', {
           templateUrl: 'partials/itinerary-track-name.html',
           controller: 'ItineraryTrackNameCtrl'
         }).
         when('/gpx-upload', {
           templateUrl: 'partials/gpx-upload.html',
           controller: 'GpxController'
         }).
         when('/users', {
           templateUrl: 'partials/users.html',
           controller: 'UserCtrl'
         }).
         when('/edit-user', {
           templateUrl: 'partials/user-edit.html',
           controller: 'UserEditCtrl'
         }).
         when('/admin-password-reset', {
           templateUrl: 'partials/admin_password_reset.html',
           controller: 'AdminPasswordResetCtrl'
         }).
         when('/status', {
           templateUrl: 'partials/system-status.html',
           controller: 'SystemStatusCtrl'
         }).
         otherwise({
           redirectTo: '/tracks'
         });
       $httpProvider.useLegacyPromiseExtensions(false);
       jwtOptionsProvider.config({
         urlParam: 'access_token',
         tokenGetter: ['$log', 'Storage', 'options',
                       function($log, Storage, options) {
                         try {
                           // Don't append to template requests e.g. ui-bootstrap templates
                           if (options.url.substr(options.url.length - 5) == '.html') {
                             return null;
                           }
                           return Storage.getItem('id_token');
                         } catch(ex) {
	                       $log.warn("Local storage is not enabled!");
                         }
                         return null;
                       }]
       });
       $httpProvider.interceptors.push('jwtInterceptor');
     }])

  .run(
    ['$rootScope', 'Storage', 'jwtHelper', 'confirmationPopoverDefaults',
     function($rootScope, Storage, jwtHelper, confirmationPopoverDefaults) {
       confirmationPopoverDefaults.confirmButtonType = "danger";
       var jwtToken = Storage.getItem('id_token');
       if (jwtToken) {
         var token = jwtHelper.decodeToken(jwtToken);
         if (token) {
           $rootScope.admin = token.admin;
         }
       }
     }]);
