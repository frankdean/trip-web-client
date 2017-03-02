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

angular.module('myApp.storage.factory', [] )

  .factory(
    'Storage',
    ['$window', '$log',
     function($window, $log){
       var storageService = {
         store: {},
         useLocalStorage: true,
         getItem: function(key) {
           if (this.useLocalStorage === undefined) {
             return undefined;
           }
           if (this.useLocalStorage) {
             return $window.localStorage.getItem(key);
           } else {
             return this.store[key];
           }
         },
         setItem: function(key, value) {
           if (this.useLocalStorage) {
             try {
               $window.localStorage.setItem(key, value);
               // try fetching it again
               var expected = $window.localStorage.getItem(key);
               if (expected !== value) {
                 this.useLocalStorage = false;
                 this.store[key] = value;
               }
             } catch (ex) {
               $log.warn('Exception', ex.message, 'attempting to store in localStorage - will use memory instead');
               this.useLocalStorage = false;
               this.store[key] = value;
             }
           } else {
             this.store[key] = value;
           }
         },
         removeItem: function(key) {
           if (this.useLocalStorage) {
             $window.localStorage.removeItem(key);
           } else {
             this.store[key] = undefined;
           }
         }
       };
       return storageService;
     }]);
