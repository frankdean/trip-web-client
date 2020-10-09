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

angular.module('myApp.user.factory', [])


  .factory(
    'Login',
    ['$resource', 'ConfigService',
     function($resource, ConfigService){
       return $resource(ConfigService.restUrlPrefix + '/login', null, {
         save: { method: 'POST', isArray: false},
         renew: {url: ConfigService.restUrlPrefix + '/login/token/renew'}
       });
     }])

  .factory(
    'UserPasswordChangeService',
    ['$resource', 'ConfigService',
     function($resource, ConfigService){
       var url = ConfigService.restUrlPrefix + '/account/password';
       return $resource(url, {}, {
         update: { method: 'PUT' }
       });
     }])

  .factory(
    'UserService',
    ['$resource', 'ConfigService',
     function($resource, ConfigService){
       var url = ConfigService.restUrlPrefix + '/admin/user/:id';
       return $resource(url, {id: '@id'}, {
         query: {isArray: false},
         nickname: {isArray: false, url: ConfigService.restUrlPrefix + '/nickname'}
       });
     }])

  .factory(
    'PasswordService',
    ['$resource', 'ConfigService',
     function($resource, ConfigService){
       var url = ConfigService.restUrlPrefix + '/admin/user/:id';
       return $resource(url, {}, {
         resetPassword: {
           url: ConfigService.restUrlPrefix + '/admin/password/reset',
           method: 'POST'
         }
       });
     }])

  .factory(
    'PasswordResetService',
    ['$resource', 'ConfigService',
     function($resource, ConfigService){
       var url = ConfigService.restUrlPrefix + '/admin/password/reset/:id';
       return $resource(url, {id: '@id'}, {
       });
     }])

  .factory(
    'TrackingUuid',
    ['$resource', 'ConfigService',
     function($resource, ConfigService) {
       var url = ConfigService.restUrlPrefix + '/tracking_uuid';
       return $resource(url, {}, {
         query: {isArray: false},
         update: {method: 'PUT', url: url}
       });
     }])

  .factory('TripLoggerSettingsUploadService', [
    '$resource',
    'ConfigService',
    '$httpParamSerializerJQLike',
    function($resource, ConfigService, $httpParamSerializerJQLike) {
      return $resource(ConfigService.restUrlPrefix + '/nickname/settings/triplogger', {}, {
        save: {
          method: "POST",
          headers: {"Content-Type": undefined},
          transformRequest: []
        }
      });
    }])

  .factory('TripLoggerSettingsDownload', [
    '$resource', 'ConfigService', 'Blob', '$window',
    function ($resource, ConfigService, Blob, $window) {
      return $resource(ConfigService.restUrlPrefix + '/nickname/download', {}, {
        download: {
          url: ConfigService.restUrlPrefix + '/nickname/download/settings/triplogger',
          method: 'POST',
          headers: {
            'Content-type' : 'application/json',
            'Accept' : 'application/x-yaml,application/octet-stream'
          },
          cache: false,
          transformResponse: function(data) {
            return {
              data: new Blob([data], {type: 'application/x-yaml'})
            };
          },
          responseType : 'arraybuffer'
        }
      });
    }]);
