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

angular.module('myApp.gotopage.directive', [])

  .directive('gotoPage', ['$log', function($log) {

    function link(scope, attrs) {
      scope.$watchCollection('[page, pageSize, total]', function () {
        scope.targetPage = scope.page;
        scope.maxPages = Math.ceil(scope.total / scope.pageSize);
        scope.hide = !scope.minimumPages || scope.minimumPages > scope.maxPages;
      });
      scope.goToPage = function() {
        if (scope.targetPage) {
          scope.pagingAction({
            page: scope.targetPage,
            pageSize: scope.pageSize,
            total: scope.total
          });
        }
      };
    }

    return {
      restrict: 'E',
      scope: {
        pagingAction: '&',
        page: '=',
        pageSize: '=',
        total: '=',
        minimumPages: '=',
      },
      template: '<div class="tl-goto-page" data-ng-hide="hide"><input style="width: 5em;" ng-model="targetPage" type="number" size="3" min="1" max="{{maxPages}}" required="" /><button class="btn btn-xs btn-primary" ng-click="goToPage()">Go</button></div>',
      link: link,
    };
  }]);
