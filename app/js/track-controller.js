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

angular.module('myApp.track.controller', [])

  .controller(
    'TracksCtrl',
    ['$rootScope', '$scope',
     '$log',
     '$location',
     'SharedLocationNickname',
     'RecentPoints',
     'InitGpxDownload',
     'Storage',
     'SaveAs',
     'StateService',
     'CopyAndPasteService',
     function($rootScope, $scope, $log, $location, SharedLocationNickname,
              RecentPoints, InitGpxDownload, Storage, SaveAs, StateService, CopyAndPasteService) {
       $rootScope.pageTitle = null;
       $scope.data = {};
       $scope.master = {};
       $scope.messages = {};
       $scope.page = StateService.getTracksPage();
       $scope.pageSize = 10;
       $scope.offset = $scope.page ? $scope.pageSize * ($scope.page -1) : 0;
       $scope.totalCount = 0;
       $scope.nicknames = SharedLocationNickname.query(
         {},
         function() {
           // success
         },
         function(response) {
           if (response.status === 401) {
             $location.path('/login');
           } else {
             $log.warn('Error fetching nicknames: ', response.status, response.statusText);
             $scope.ajaxRequestError = {
               error: true,
               status: response.status
             };
           }
         }
       );
       $scope.listTracks = function() {
         $scope.ajaxRequestError = {error: false};
         $scope.master = angular.copy($scope.tracks.search);
         RecentPoints.query(
           {nickname: $scope.tracks.search.nicknameSelect,
            from: $scope.tracks.search.dateFrom,
            to: $scope.tracks.search.dateTo,
            max_hdop: $scope.tracks.search.hdop,
            notesOnlyFlag: $scope.tracks.search.notesOnlyFlag,
            order: 'DESC',
            page_size: $scope.pageSize,
            offset: $scope.offset},
           function (trackResults) {
             // success
             StateService.saveSearch($scope.tracks.search);
             $scope.locations = trackResults;
             $scope.totalCount = trackResults.count;
             if (trackResults.payload.length === 0) {
               // Suggests page number is now higher than the number of results
               // Reset so that at least the next query will be correct
               StateService.saveTracksPage(1);
             }
             // Workaround to value being lost on returning to the page
             $scope.page = Math.floor($scope.offset / $scope.pageSize + 1);
           }, function(response) {
             if (response.status === 401) {
               $location.path('/login');
             } else {
               $log.warn('Error fetching tracks: ', response.status, response.statusText);
               $scope.ajaxRequestError = {
                 error: true,
                 status: response.status
               };
             }
           });
       };
       if (StateService.getSearch()) {
         $scope.tracks = {};
         $scope.tracks.search = StateService.getSearch();
         $scope.listTracks();
       } else {
         var start = new Date();
         start.setHours(0);
         start.setMinutes(0);
         start.setSeconds(0);
         start.setMilliseconds(0);
         var finish = new Date();
         finish.setHours(23);
         finish.setMinutes(59);
         finish.setSeconds(59);
         finish.setMilliseconds(0);
         angular.extend($scope, {
           tracks: {
             search: {
               dateFrom: start,
               dateTo: finish,
               hdop: null,
               notesOnlyFlag: null,
               nicknameSelect: null
             }
           }
         });
       }
       $scope.master = angular.copy($scope.tracks.search);
       $scope.doListTracks = function(parms) {
         $scope.messages = {};
         if ($scope.form && $scope.form.$valid) {
           $scope.offset = 0;
           $scope.listTracks(parms);
         }
       };
       $scope.showMap = function(parms) {
         if ($scope.form && $scope.form.$valid) {
           $scope.master = angular.copy($scope.tracks.search);
           StateService.saveSearch($scope.tracks.search);
           $location.path('/map');
           $location.search({nickname: parms.nicknameSelect !== null ? encodeURIComponent(parms.nicknameSelect) : undefined,
                             from: encodeURIComponent(parms.dateFrom.toISOString()),
                             to: encodeURIComponent(parms.dateTo.toISOString()),
                             hdop: parms.hdop !== null ?  encodeURIComponent(parms.hdop) : undefined,
                             notesOnlyFlag: parms.notesOnlyFlag !== null ? encodeURIComponent(parms.notesOnlyFlag) : undefined
                            });
         }
       };
       $scope.gpxDownload = function(parms) {
         $scope.messages = {};
         if ($scope.form && $scope.form.$valid) {
           $scope.ajaxRequestError = {error: false};
           $scope.master = angular.copy($scope.tracks.search);
           InitGpxDownload.downloadTracks(
             {nickname: $scope.tracks.search.nicknameSelect,
              from: $scope.tracks.search.dateFrom,
              to: $scope.tracks.search.dateTo,
              max_hdop: $scope.tracks.search.hdop,
              notesOnlyFlag: $scope.tracks.search.notesOnlyFlag
             }).$promise.then(function(response) {
               StateService.saveSearch($scope.tracks.search);
               SaveAs(response.data, 'trip.gpx');
             }).catch(function(response) {
               $log.warn('GPX tracks download failed', response.status);
               $scope.ajaxRequestError = {
                 error: true,
                 status: response.status
               };
             });
         }
       };
       $scope.copyTrackForPaste = function(form) {
         $scope.ajaxRequestError = {error: false};
         $scope.messages = {};
         CopyAndPasteService.copy('location-history', {
           nickname: $scope.tracks.search.nicknameSelect,
           from: $scope.tracks.search.dateFrom,
           to: $scope.tracks.search.dateTo,
           max_hdop: $scope.tracks.search.hdop,
           notesOnlyFlag: $scope.tracks.search.notesOnlyFlag
         });
         $scope.messages.copied = true;
       };
       // Fetch first page of results using the initial default values
       $scope.doPagingAction = function(text, page, pageSize, total) {
         $scope.messages = {};
         $scope.offset = pageSize * (page -1);
         StateService.saveTracksPage(page);
         $scope.listTracks();
       };
       $scope.reset = function(form) {
         $scope.messages = {};
         $scope.ajaxRequestError = {error: false};
         if (form) {
           form.$setPristine();
           form.$setUntouched();
         }
         $scope.tracks.search = angular.copy($scope.master);
       };
       $scope.reset();
     }]);
