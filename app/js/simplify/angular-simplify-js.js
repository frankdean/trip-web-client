/**
 * @license TRIP - Trip Recording and Itinerary Planning application.
 * (c) 2016-2021 Frank Dean <frank@fdsd.co.uk>
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

angular.module('myApp.simplify', []).service('SimplifyService', function() {

  if (typeof simplify !== 'undefined') {
    // Normal runtime behaviour
    return {simplify: simplify};
  } else {
    // This is the scenario when running unit tests
    return {simplify: module.exports};
  }
});
