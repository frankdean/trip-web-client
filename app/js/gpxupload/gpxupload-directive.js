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

angular.module('myApp.gpxupload.gpxupload-directive', [])

  .directive('gpxUpload', ['$log', function($log) {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        element.bind('change', function() {
          scope.fileObject = element[0].files[0];
          scope.formData = new FormData();
          scope.formData.append('file', scope.fileObject);
          $log.debug('File', scope.fileObject.name);
          scope.fileLog = {
            'lastModified': scope.fileObject.lastModified,
            'lastModifiedDate': scope.fileObject.lastModifiedDate,
            'name': scope.fileObject.name,
            'size': scope.fileObject.size,
            'type': scope.fileObject.type
          };
          scope.$apply();
        });
      }
    };
  }]);
