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

angular.module('myApp.user.prefs.factory', [])

  .factory(
    'UserPreferencesService',
    ['Storage', '$log',
     function(Storage, $log) {

       var COORD_FORMAT_KEY = 'coord_format';
       var POSITION_FORMAT_KEY = 'position_format';
       var DEFAULT_COORD_FORMAT = '%d\u00b0%M\u2032%S\u2033%c';
       var DEFAULT_POSITION_FORMAT = 'lat-lng';

       var _getCoordFormat = function() {
         var format = Storage.getItem(COORD_FORMAT_KEY);
         return format ? format : DEFAULT_COORD_FORMAT;
       };

       var _getPositionFormat = function() {
         var format = Storage.getItem(POSITION_FORMAT_KEY);
         return format ? format : DEFAULT_POSITION_FORMAT;
       };

       var _setCoordFormat = function(format) {
         Storage.setItem(COORD_FORMAT_KEY, format);
       };

       var _setPositionFormat = function(format) {
         Storage.setItem(POSITION_FORMAT_KEY, format);
       };

       return {
         getCoordFormat: _getCoordFormat,
         getPositionFormat: _getPositionFormat,
         setCoordFormat: _setCoordFormat,
         setPositionFormat: _setPositionFormat
       };
     }]);
