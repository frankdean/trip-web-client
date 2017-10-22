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

describe('ItinerarySharingCtrl', function() {

  beforeEach(module('myApp'));

  var $httpBackend, scope, controller, createController, $location,
      itinerarySharingService, saveNicknameRequestHandler, saveShareRequestHandler;
  var routeParams = {id: 42};
  var mockValidForm = {$valid: true,
                       $setPristine: function() {},
                       $setUntouched: function() {}
                      };
  var mockInvalidForm = {$valid: false,
                         $setPristine: function() {},
                         $setUntouched: function() {}
                        };
  var testShares = {payload: [
    {"id":42,"nickname":"testNickname","active":false,"selected": true},
    {"id":142,"nickname":"testNickname142","active":true,"selected": true},
    {"id":242,"nickname":"testNickname242","deleted":true,"selected": true}
  ], count: '42'};
  var testShares2 = {payload: [
    {"id":42,"nickname":"testNickname","active":false,"selected": false},
    {"id":142,"nickname":"testNickname142","active":true,"selected": true},
    {"id":242,"nickname":"testNickname242","deleted":true,"selected": false}
  ], count: '42'};
  var emptyShares = {payload: [], count: '0'};

  beforeEach(inject(function(_$httpBackend_,
                             $rootScope,
                             $controller,
                             _$location_,
                             ItinerarySharingService) {
    $httpBackend = _$httpBackend_;
    saveNicknameRequestHandler = $httpBackend.when('PUT', /itinerary\/share\/\d+/,
                      function(data) {
                        return '{"id":42,"nickname":"testNickname","active":true}' === data;
                      }).respond(null);
    saveShareRequestHandler = $httpBackend.when('POST', /itinerary\/share\/\d+/,
                      function(data) {
                        return /{"updateType":"(delete|activeStateChange)".*/.test(data);
                      }).respond(null);
    scope = $rootScope;
    controller = $controller;
    createController = function () {
      return $controller('ItinerarySharingCtrl', {
        $scope: scope,
        $routeParams: routeParams,
        $location: $location
      });
    };
    $location = _$location_;
    itinerarySharingService = ItinerarySharingService;
    scope.form = mockValidForm;
  }));

  describe('when list is empty', function() {

    beforeEach(function() {
      $httpBackend.when('GET', /itinerary\/share(\/\d+)?\?offset=\d+&page_size=\d+$/).respond(emptyShares);
    });

    it('should set the edit state to new on initial display if the list is empty', function() {
      createController();
      $httpBackend.flush();
      expect(scope.data.state.new).toBeTruthy();
    });

  });

  describe('when multiple itinerary shares are selected', function() {

    beforeEach(function() {
      $httpBackend.when('GET', /itinerary\/share(\/\d+)?\?offset=\d+&page_size=\d+$/).respond(testShares);
    });

    it('should fetch a list of itinerary shares', function() {
      spyOn(itinerarySharingService, 'query').and.callThrough();
      createController();
      $httpBackend.flush();
      expect(scope.shares).toBeDefined();
      expect(scope.shares.count).toBeDefined();
      expect(scope.shares.payload).toBeDefined();
      expect(scope.totalCount).toEqual(testShares.count);
    });

    it('should set the edit state to undefined on initial display', function() {
      createController();
      $httpBackend.flush();
      expect(scope.data.state.new).not.toBeDefined();
    });

    it('should fetch a new page of itinerary shares', function() {
      spyOn(itinerarySharingService, 'query').and.callThrough();
      createController();
      scope.doPagingAction('test', 2, 100, 200);
      $httpBackend.flush();
      expect(scope.shares).toBeDefined();
      expect(scope.shares.count).toBeDefined();
      expect(scope.shares.payload).toBeDefined();
      expect(scope.totalCount).toEqual(testShares.count);
    });

    it('should create an empty form when the new button is clicked', function() {
      createController();
      scope.new(mockValidForm);
      expect(scope.data.state.new).toBeTruthy();
    });

    it('should save the current share', function() {
      createController();
      $httpBackend.flush();
      scope.new(mockValidForm);
      scope.itineraryId = 42;
      scope.data.nickname = 'testNickname';
      scope.data.active = true;
      scope.save(mockValidForm);
      $httpBackend.flush();
    });

    it('should show a error when the nickname is not found', function() {
      createController();
      $httpBackend.flush();
      scope.new(mockValidForm);
      scope.itineraryId = 42;
      scope.data.nickname = 'testNickname';
      scope.data.active = true;
      scope.save(mockValidForm);
      saveNicknameRequestHandler.respond(400, '');
      $httpBackend.flush();
      expect(scope.ajaxRequestError.saveFailed).toBeTruthy();
    });

    it('should show a error when the nickname is not found due to a system error', function() {
      createController();
      $httpBackend.flush();
      scope.new(mockValidForm);
      scope.itineraryId = 42;
      scope.data.nickname = 'testNickname';
      scope.data.active = true;
      scope.save(mockValidForm);
      saveNicknameRequestHandler.respond(500, '');
      $httpBackend.flush();
      expect(scope.ajaxRequestError.saveFailed).toBeFalsy();
      expect(scope.ajaxRequestError.error).toBeTruthy();
    });

    it('should delete the selected itinerary shares', function() {
      createController();
      $httpBackend.flush();
      scope.itineraryId = 42;
      scope.delete();
      $httpBackend.flush();
    });

    it('should show an error when deleting the selected itinerary shares fails', function() {
      createController();
      $httpBackend.flush();
      scope.itineraryId = 42;
      scope.delete();
      saveShareRequestHandler.respond(500, '');
      $httpBackend.flush();
    });

    it('should activate the selected itinerary shares', function() {
      createController();
      $httpBackend.flush();
      scope.itineraryId = 42;
      scope.activate();
      $httpBackend.flush();
    });

    it('should deactivate the selected itinerary shares', function() {
      createController();
      $httpBackend.flush();
      scope.itineraryId = 42;
      scope.activate();
      $httpBackend.flush();
    });

  });

  describe('when only one itinerary share is selected', function() {

    beforeEach(function() {
      $httpBackend.when('GET', /itinerary\/share(\/\d+)?\?offset=\d+&page_size=\d+$/).respond(testShares2);
      spyOn($location, 'path').and.stub();
      spyOn($location, 'search').and.stub();
    });

    it('should populate the form when the edit button is clicked', function() {
      createController();
      $httpBackend.flush();
      scope.edit(mockValidForm);
      expect(scope.data.state.new).toBeFalsy();
      expect(scope.data.nickname).toEqual(testShares2.payload[1].nickname);
      expect(scope.data.active).toEqual(testShares2.payload[1].active);
    });

    it('should display the itineary list when the "show itineary" button is clicked', function() {
      createController();
      $httpBackend.flush();
      scope.cancel();
      expect($location.path).toHaveBeenCalledWith('/itinerary');
      expect($location.search).toHaveBeenCalledWith({id: '' + routeParams.id});
    });

    it('should display the itineary list when the cancel/back button is clicked', function() {
      createController();
      $httpBackend.flush();
      scope.cancel();
      expect($location.path).toHaveBeenCalledWith('/itinerary');
      expect($location.search).toHaveBeenCalledWith({id: '' + routeParams.id});
    });

    it('should display the itineary sharing report when the cancel/back button is clicked when routing parameter is set', function() {
      controller('ItinerarySharingCtrl', {
        $scope: scope,
        $routeParams: {id: routeParams.id,
                       routing: 'itinerary-sharing-report'},
        $location: $location
      });
      $httpBackend.flush();
      scope.cancel();
      expect($location.path).toHaveBeenCalledWith('/itinerary-sharing-report');
      expect($location.search).toHaveBeenCalledWith('');
    });

  });

});
