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

angular.module('myApp.state.service', [] )

  .service(
    'StateService',
    ['$log',
     function($log) {

       this.reset = function() {
         this.tracksSearch = undefined;
         this.itinerarySearch = undefined;
         this.tracksPage = 1;
         this.itinerariesPage = 1;
         this.itinerarySharingReportPage = 1;
         this.itinerarySearchResultsPage = 1;
         this.admin = undefined;
         this.message = undefined;
         this.pageMap = [];
       };
       this.reset();

       this.savePage = function(name, page) {
         this.pageMap[name] = page;
       };

       this.getPage = function(name) {
         var retval = this.pageMap[name];
         return retval === undefined ? 1: retval;
       };

       this.saveSearch = function(search) {
         this.tracksSearch = search;
       };

       this.getSearch = function() {
         return this.tracksSearch;
       };

       this.saveItinerarySearch = function(search) {
         this.itinerarySearch = search;
       };

       this.getItinerarySearch = function(search) {
         return this.itinerarySearch;
       };

       this.saveTracksPage = function(page) {
         this.tracksPage = page;
       };
       this.getTracksPage = function() {
         return this.tracksPage;
       };

       this.saveAdmin = function(admin) {
         this.admin = admin;
       };
       this.getAdmin = function() {
         return this.admin;
       };

       this.saveItinerariesPage = function(page) {
         this.itinerariesPage = page;
       };
       this.getItinerariesPage = function() {
         return this.itinerariesPage;
       };

       this.saveItinerarySharingReportPage = function(page) {
         this.itinerarySharingReportPage = page;
       };
       this.getItinerarySharingReportPage = function() {
         return this.itinerarySharingReportPage;
       };

       this.saveItinerarySearchResultsPage = function(page) {
         this.itinerarySearchResultsPage = page;
       };
       this.getItinerarySearchResultsPage = function() {
         return this.itinerarySearchResultsPage;
       };

       this.setMessage = function(message) {
         this.message = message;
       };
       this.getMessage = function() {
         return this.message;
       };

     }]);
