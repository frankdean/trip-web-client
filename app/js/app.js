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
  'myApp.itinerary.search.controller',
  'myApp.itinerary.search.result.controller',
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

  .config(
    ['$compileProvider', '$locationProvider', '$provide',
     function ($compileProvider, $locationProvider, $provide) {
       // disable for production release
       $compileProvider.debugInfoEnabled(true);
       $locationProvider.html5Mode(true).hashPrefix('!');
       /*
       // Force hashbang mode in HTML5 (for testing)
       $provide.decorator('$sniffer', ['$delegate', function($delegate) {
         $delegate.history = false;
         return $delegate;
       }]);
       */
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
         when('/itinerary-search', {
           templateUrl: 'partials/itinerary-search.html',
           controller: 'ItinerarySearchCtrl'
         }).
         when('/itinerary-search-result', {
           templateUrl: 'partials/itinerary-search-result.html',
           controller: 'ItinerarySearchResultCtrl'
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
         when('/account', {
           templateUrl: 'partials/account.html',
           controller: 'AccountCtrl'
         }).
         when('/change-password', {
           templateUrl: 'partials/change-password.html',
           controller: 'ChangePasswordCtrl'
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
       jwtOptionsProvider.config({
         tokenGetter: ['$log', 'Storage', 'options', 'jwtHelper', '$location', 'Login', '$rootScope',
                       function($log, Storage, options, jwtHelper, $location, Login, $rootScope) {
                         var renewWithin, iat, token, decodedToken;
                         try {
                           // Don't append to template requests e.g. ui-bootstrap templates
                           if (options.url.substr(options.url.length - 5) == '.html') {
                             return null;
                           }
                           token = Storage.getItem('id_token');
                           if (token) {
                             try {
                               decodedToken = jwtHelper.decodeToken(token);
                             } catch (e) {
                               $log.error('Failure decoding current token');
                             }
                             renewWithin = decodedToken && decodedToken.uk_co_fdsd_trip_renewWithin || 60;
                           }
                           if (!token || jwtHelper.isTokenExpired(token)) {
                             $log.debug('Token missing or has expired');
                           } else if (!$rootScope.tokenRenewalGuard && jwtHelper.isTokenExpired(token, renewWithin)) {
                             $rootScope.tokenRenewalGuard = true;
                             $log.debug('Token will expire soon - renewing');
                             Login.renew({},
                                         {},
                                         function(value) {
                                           $rootScope.tokenRenewalGuard = false;
                                           if (value.resourceToken != null) {
                                             Storage.setItem('id_token_maptile', value.resourceToken);
                                           }
                                           if (value.token !== undefined) {
                                             Storage.setItem('id_token', value.token);
                                             try {
                                               token = jwtHelper.decodeToken(value.token);
                                             } catch (e) {
                                               $log.error('Failure decoding renewal token');
                                             }
                                             $rootScope.admin = token.uk_co_fdsd_trip_admin;
                                             iat = new Date(0);
                                             if (token && token.iat) {
                                               iat.setUTCSeconds(token.iat);
                                               $log.debug('Renewed token issued at:', iat);
                                             }
                                             try {
                                               $log.debug('Renewed token expires:', jwtHelper.getTokenExpirationDate(value.token));
                                             } catch (e) {
                                               $log.error('Failure extracting expiration date from token');
                                             }
                                           } else {
                                             $log.warn('No token received in response:', value);
                                           }
                                         }, function(response) {
                                           $rootScope.tokenRenewalGuard = false;
                                           $log.warn('Token renewal failed.  Status code:', response.status);
                                           $rootScope.admin = undefined;
                                           $location.path('/login');
                                         });
                           }
                           return token;
                         } catch(e) {
	                   $log.warn("Error handling token renewal", e);
                         }
                         return null;
                       }]
         // unauthenticatedRedirectPath: '/login'
       });
       $httpProvider.interceptors.push('jwtInterceptor');
       $httpProvider.defaults.xsrfCookieName = 'TRIP-XSRF-TOKEN';
       $httpProvider.defaults.xsrfHeaderName = 'X-TRIP-XSRF-TOKEN';
     }])

  .run(
    ['$rootScope', 'Storage', 'jwtHelper', 'confirmationPopoverDefaults', '$log',
     function($rootScope, Storage, jwtHelper, confirmationPopoverDefaults, $log) {
       /*
       // Debug routing issues
       $rootScope.$on('$routeChangeStart', function(angularEvent, next, current) {
         var currentPath = current === undefined ? null : current.originalPath;
         var nextPath = next.originalPath;
         console.log('routeChangeStart for current path:', currentPath, 'next:', nextPath);
       });
       $rootScope.$on('$locationChangeStart', function(event, newUrl, oldUrl, newState, oldState) {
         console.log('Location leaving', oldUrl, 'for', newUrl);
       });
       $rootScope.$on('$locationChangeSuccess', function(event, newUrl, oldUrl, newState, oldState) {
         console.log('Location left', oldUrl, 'arrived', newUrl);
       });
       */
       confirmationPopoverDefaults.confirmButtonType = "danger";
       var jwtToken = Storage.getItem('id_token');
       if (jwtToken) {
         try {
           var token = jwtHelper.decodeToken(jwtToken);
           if (token) {
             $rootScope.admin = token.uk_co_fdsd_trip_admin;
           }
         } catch (e) {
           $log.error('Failure decoding token from local storage');
           delete $rootScope.admin;
         }
       }
     }]);
