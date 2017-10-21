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

// Polyfills for String.padEnd and String.repeat
// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
/**
 * String.padEnd()
 * version 1.0.1
 * Feature	        Chrome  Firefox Internet Explorer   Opera	Safari	Edge
 * Basic support	57   	48      (No)	            44   	10      15
 * -------------------------------------------------------------------------------
 */
if (!String.prototype.padEnd) {
    String.prototype.padEnd = function padEnd(targetLength,padString) {
        targetLength = targetLength>>0; //floor if number or convert non-number to 0;
        padString = String(padString || ' ');
        if (this.length > targetLength) {
            return String(this);
        }
        else {
            targetLength = targetLength-this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
            }
            return String(this) + padString.slice(0,targetLength);
        }
    };
}

/**
 * String.padStart()
 * version 1.0.1
 * Feature	        Chrome  Firefox Internet Explorer   Opera	Safari	Edge
 * Basic support	57   	51      (No)	            44   	10      15
 * -------------------------------------------------------------------------------
 */
if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength,padString) {
        targetLength = targetLength>>0; //floor if number or convert non-number to 0;
        padString = String(padString || ' ');
        if (this.length > targetLength) {
            return String(this);
        }
        else {
            targetLength = targetLength-this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
            }
            return padString.slice(0,targetLength) + String(this);
        }
    };
}

/**
 * String.repeat()
 * version 0.0.0
 * Feature	        Chrome  Firefox Internet Explorer   Opera	Safari	Edge
 * Basic support	41   	24      (No)	            (Yes)   9       (Yes)
 * -------------------------------------------------------------------------------
 */
if (!String.prototype.repeat) {
    String.prototype.repeat = function (count) {
        if (this === null) {
            throw new TypeError('can\'t convert ' + this + ' to object');
        }
        var str = '' + this;
        count = +count;
        if (count != count) {
            count = 0;
        }
        if (count < 0) {
            throw new RangeError('repeat count must be non-negative');
        }
        if (count == Infinity) {
            throw new RangeError('repeat count must be less than infinity');
        }
        count = Math.floor(count);
        if (str.length === 0 || count === 0) {
            return '';
        }
        if (str.length * count >= 1 << 28) {
            throw new RangeError('repeat count must not overflow maximum string size');
        }
        var rpt = '';
        for (; ;) {
            if ((count & 1) == 1) {
                rpt += str;
            }
            count >>>= 1;
            if (count === 0) {
                break;
            }
            str += str;
        }
        return rpt;
    };
}

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
  'myApp.kmldownload.factory',
  'myApp.gpxupload',
  'myApp.itineries.controller',
  'myApp.itinerary.controller',
  'myApp.itinerary.edit.controller',
  'myApp.itinerary.factory.js',
  'myApp.itinerary.map.controller',
  'myApp.itinerary.sharing.controller',
  'myApp.itinerary.sharing.report.controller',
  'myApp.itinerary.wpt.controller',
  'myApp.itinerary.wpt.view.controller',
  'myApp.itinerary.route.name.controller',
  'myApp.itinerary.route.edit.controller',
  'myApp.itinerary.route.join.controller',
  'myApp.itinerary.track.name.controller',
  'myApp.itinerary.track.edit.controller',
  'myApp.itinerary.track.segment.edit.controller',
  'myApp.itinerary.track.join.controller',
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
  'myApp.location.controller',
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
         when('/itinerary-wpt-edit', {
           templateUrl: 'partials/itinerary-wpt-edit.html',
           controller: 'ItineraryWaypointCtrl'
         }).
         when('/itinerary-wpt', {
           templateUrl: 'partials/itinerary-wpt.html',
           controller: 'ItineraryWaypointViewCtrl'
         }).
         when('/itinerary-route-name', {
           templateUrl: 'partials/itinerary-route-name.html',
           controller: 'ItineraryRouteNameCtrl'
         }).
         when('/itinerary-route-edit', {
           templateUrl: 'partials/itinerary-route-edit.html',
           controller: 'ItineraryRouteEditCtrl'
         }).
         when('/itinerary-route-join', {
           templateUrl: 'partials/itinerary-route-join.html',
           controller: 'ItineraryRouteJoinCtrl'
         }).
         when('/itinerary-track-name', {
           templateUrl: 'partials/itinerary-track-name.html',
           controller: 'ItineraryTrackNameCtrl'
         }).
         when('/itinerary-track-edit', {
           templateUrl: 'partials/itinerary-track-edit.html',
           controller: 'ItineraryTrackEditCtrl'
         }).
         when('/itinerary-track-segment-edit', {
           templateUrl: 'partials/itinerary-track-segment-edit.html',
           controller: 'ItineraryTrackSegmentEditCtrl'
         }).
         when('/itinerary-track-join', {
           templateUrl: 'partials/itinerary-track-join.html',
           controller: 'ItineraryTrackJoinCtrl'
         }).
         when('/gpx-upload', {
           templateUrl: 'partials/gpx-upload.html',
           controller: 'GpxController'
         }).
         when('/users', {
           templateUrl: 'partials/users.html',
           controller: 'UserCtrl'
         }).
         when('/location', {
           templateUrl: 'partials/location.html',
           controller: 'LocationCtrl'
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
