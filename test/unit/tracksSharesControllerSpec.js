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

describe('SharesCtrl', function() {

  beforeEach(module('myApp'));

  var scope, $httpBackend, createController, sharesListRequestHandler,
  saveShareRequestHandler, sharesUpdateRequestHandler, sharesService,
  $location;
  var testShares = {
    count: "2",
    payload: [{nickname: 'Fred',
               recentDays: 1,
               recentHours: 2,
               recentMinutes: 3,
               recentLimit: '1d 2h 3m',
               maximumDays: 4,
               maximumHours: 5,
               maximumMinutes: 6,
               maximumLimit: '4d 5h 6m',
               active: true
              },
              {nickname: 'Jane',
               recentDays: 7,
               recentHours: 8,
               recentMinutes: 9,
               recentLimit: '7d 8h 9m',
               maximumDays: 10,
               maximumHours: 11,
               maximumMinutes: 12,
               maximumLimit: '10d 11h 12m',
               active: true
              }
             ]};

  beforeEach(inject(function(_$httpBackend_,
                             $rootScope,
                             $controller,
                             SharesService,
                             _$location_) {
    $httpBackend = _$httpBackend_;
    scope = $rootScope;
    sharesService = SharesService;
    $location = _$location_;
    sharesListRequestHandler = $httpBackend.when('GET', /shares\?offset=0&page_size=[0-9]+$/).
      respond(testShares);
    sharesUpdateRequestHandler = $httpBackend.when('POST', /shares$/).
      respond(null);
    saveShareRequestHandler = $httpBackend.when('PUT', /share$/).
      respond(null);
    createController = function() {
      return $controller('SharesCtrl', {$scope: scope});
    };
    testShares.payload.forEach(function(item) {
      item.active = true;
      item.selected = false;
      item.deleted = false;
    });
  }));

  it('should fetch a list of shares', function() {
    createController();
    $httpBackend.flush();
    expect(scope.shares).toBeDefined();
    expect(scope.shares.count).toEqual(testShares.count);
    expect(scope.shares.payload).toEqual(testShares.payload);
  });

  it('should show an error when there is a backend failure fetching track shares', function() {
    createController();
    sharesListRequestHandler.respond(500, '');
    $httpBackend.flush();
    expect(scope.ajaxRequestError.error).toBeTruthy();
  });

  it('should delete selected shares', function() {
    spyOn(sharesService, 'update').and.callThrough();
    createController();
    spyOn(scope, 'listShares').and.callThrough();
    scope.shares = testShares;
    testShares.payload[0].selected = true;
    var expectedShares = {updateType: 'delete', shares: testShares.payload};
    scope.delete();
    $httpBackend.flush();
    expect(testShares.payload[0].deleted).toBeDefined();
    expect(testShares.payload[0].deleted).toBeTruthy();
    expect(sharesService.update).toHaveBeenCalledWith(jasmine.any(Object), expectedShares, jasmine.any(Function), jasmine.any(Function));
    expect(scope.listShares).toHaveBeenCalled();
  });

  it('should show an error message when there is a failure deleting selected shares', function() {
    spyOn(sharesService, 'update').and.callThrough();
    createController();
    spyOn(scope, 'listShares').and.callThrough();
    scope.shares = testShares;
    testShares.payload[0].selected = true;
    var expectedShares = {updateType: 'delete', shares: testShares.payload};
    scope.delete();
    sharesUpdateRequestHandler.respond(500, '');
    $httpBackend.flush();
    expect(scope.ajaxRequestError.error).toBeTruthy();
  });

  it('should NOT call update after delete when no shares have been selected', function() {
    spyOn(sharesService, 'update').and.callThrough();
    createController();
    scope.shares = testShares;
    scope.delete();
    $httpBackend.flush();
    testShares.payload.forEach(function(item) {
      expect(item.deleted).toBeFalsy();
    });
    expect(sharesService.update.calls.any()).toBeFalsy();
  });

  it('should activate selected shares', function() {
    spyOn(sharesService, 'update').and.callThrough();
    createController();
    scope.shares = testShares;
    testShares.payload[0].selected = true;
    testShares.payload[0].active = false;
    var expectedShares = {updateType: 'activeStateChange', shares: testShares.payload};
    scope.activate();
    $httpBackend.flush();
    expect(testShares.payload[0].active).toBeTruthy();
    expect(testShares.payload[0].deleted).toBeFalsy();
    expect(testShares.payload[1].active).toBeTruthy();
    expect(testShares.payload[1].deleted).toBeFalsy();
    expect(sharesService.update).toHaveBeenCalledWith(jasmine.any(Object), expectedShares, jasmine.any(Function), jasmine.any(Function));
  });

  it('should NOT call update after activate when no shares have been selected', function() {
    spyOn(sharesService, 'update').and.callThrough();
    createController();
    scope.shares = testShares;
    testShares.payload[0].active = false;
    scope.activate();
    $httpBackend.flush();
    expect(testShares.payload[0].active).toBeFalsy();
    expect(testShares.payload[0].deleted).toBeFalsy();
    expect(testShares.payload[1].active).toBeTruthy();
    expect(testShares.payload[1].deleted).toBeFalsy();
    expect(sharesService.update.calls.any()).toBeFalsy();
  });

  it('should NOT call update after activate when no shares have been modified', function() {
    spyOn(sharesService, 'update').and.callThrough();
    testShares.payload[0].selected = true;
    createController();
    scope.shares = testShares;
    scope.activate();
    $httpBackend.flush();
    expect(testShares.payload[0].active).toBeTruthy();
    expect(testShares.payload[0].deleted).toBeFalsy();
    expect(testShares.payload[1].active).toBeTruthy();
    expect(testShares.payload[1].deleted).toBeFalsy();
    expect(sharesService.update.calls.any()).toBeFalsy();
  });

  it('should deactivate selected shares', function() {
    spyOn(sharesService, 'update').and.callThrough();
    createController();
    scope.shares = testShares;
    testShares.payload[0].selected = true;
    var expectedShares = {updateType: 'activeStateChange', shares: testShares.payload};
    scope.deactivate();
    $httpBackend.flush();
    expect(testShares.payload[0].active).toBeFalsy();
    expect(testShares.payload[0].deleted).toBeFalsy();
    expect(testShares.payload[1].active).toBeTruthy();
    expect(testShares.payload[1].deleted).toBeFalsy();
    expect(sharesService.update).toHaveBeenCalledWith(jasmine.any(Object), expectedShares, jasmine.any(Function), jasmine.any(Function));
  });

  it('should NOT call update after deactivate when no shares have been selected', function() {
    spyOn(sharesService, 'update').and.callThrough();
    createController();
    scope.shares = testShares;
    scope.activate();
    $httpBackend.flush();
    expect(testShares.payload[0].active).toBeTruthy();
    expect(testShares.payload[0].deleted).toBeFalsy();
    expect(testShares.payload[1].active).toBeTruthy();
    expect(testShares.payload[1].deleted).toBeFalsy();
    expect(sharesService.update.calls.any()).toBeFalsy();
  });

  it('should NOT call update after deactivate when no shares have been modified', function() {
    spyOn(sharesService, 'update').and.callThrough();
    testShares.payload[0].selected = true;
    testShares.payload[0].active = false;
    createController();
    scope.shares = testShares;
    scope.deactivate();
    $httpBackend.flush();
    expect(testShares.payload[0].active).toBeFalsy();
    expect(testShares.payload[0].deleted).toBeFalsy();
    expect(testShares.payload[1].active).toBeTruthy();
    expect(testShares.payload[1].deleted).toBeFalsy();
    expect(sharesService.update.calls.any()).toBeFalsy();
  });

  it('should mark all items as selected when select all option is true', function() {
    testShares.payload.forEach(function(item) {
      item.active = false;
    });
    spyOn(sharesService, 'update').and.callThrough();
    createController();
    scope.shares = testShares;
    scope.selectAllCheckbox = true;
    scope.markAllShares();
    $httpBackend.flush();
    testShares.payload.forEach(function(item) {
      expect(item.active).toBeFalsy();
      expect(item.selected).toBeTruthy();
      expect(item.deleted).toBeFalsy();
    });
    expect(sharesService.update.calls.any()).toBeFalsy();
  });

  it('should mark all items as not selected when select all option is false', function() {
    testShares.payload.forEach(function(item) {
      item.active = true;
      item.selected = true;
    });
    spyOn(sharesService, 'update').and.callThrough();
    createController();
    scope.shares = testShares;
    scope.selectAllCheckbox = false;
    scope.markAllShares();
    $httpBackend.flush();
    testShares.payload.forEach(function(item) {
      expect(item.active).toBeTruthy();
      expect(item.selected).toBeFalsy();
      expect(item.deleted).toBeFalsy();
    });
    expect(sharesService.update.calls.any()).toBeFalsy();
    expect(sharesService.update).not.toHaveBeenCalled();
  });

  it('should set the edit state to new on initial display', function() {
    createController();
    scope.shares = testShares;
    $httpBackend.flush();
    expect(scope.data.state.new).toBeTruthy();
  });

  it('should set the edit fields to match the first selected item', function() {
    testShares.payload.forEach(function(item) {
      item.active = true;
      item.selected = false;
    });
    testShares.payload[1].selected = true;
    createController();
    spyOn(sharesService,'query').and.callThrough();
    spyOn(sharesService,'update').and.callThrough();
    spyOn(sharesService,'save').and.callThrough();
    scope.shares = testShares;
    scope.selectAllCheckbox = false;
    scope.edit();
    $httpBackend.flush();
    expect(sharesService.query).not.toHaveBeenCalled();
    expect(sharesService.update).not.toHaveBeenCalled();
    expect(sharesService.save).not.toHaveBeenCalled();
    expect(scope.data.state.new).toBeFalsy();
    expect(scope.data.nickname).toEqual(testShares.payload[1].nickname);
    expect(scope.data.recentDays).toEqual(testShares.payload[1].recentDays);
    expect(scope.data.recentHours).toEqual(testShares.payload[1].recentHours);
    expect(scope.data.recentMinutes).toEqual(testShares.payload[1].recentMinutes);
    expect(scope.data.maxDays).toEqual(testShares.payload[1].maximumDays);
    expect(scope.data.maxHours).toEqual(testShares.payload[1].maximumHours);
    expect(scope.data.maxMinutes).toEqual(testShares.payload[1].maximumMinutes);
    expect(scope.data.active).toEqual(testShares.payload[1].active);
  });

  it('should call save when the save button is clicked', function() {
    testShares.payload.forEach(function(item) {
      item.active = true;
      item.selected = false;
    });
    testShares.payload[1].selected = true;
    createController();
    $httpBackend.flush();
    scope.edit();
    spyOn(sharesService,'query').and.callThrough();
    spyOn(sharesService,'update').and.callThrough();
    spyOn(sharesService,'save').and.callThrough();
    scope.save();
    $httpBackend.flush();
    expect(sharesService.query).toHaveBeenCalled();
    expect(sharesService.update).not.toHaveBeenCalled();
    expect(sharesService.save).toHaveBeenCalledWith(
      {},
      {nickname: scope.data.nickname,
       recentDays: scope.data.recentDays,
       recentHours: scope.data.recentHours,
       recentMinutes: scope.data.recentMinutes,
       maximumDays: scope.data.maxDays,
       maximumHours: scope.data.maxHours,
       maximumMinutes: scope.data.maxMinutes,
       active: scope.data.active
      },
      jasmine.any(Function),
      jasmine.any(Function)
    );
    expect(scope.data).toEqual(scope.master);
  });

  it('should redirect to the login page when authentication fails fetching list of shares', function() {
    sharesListRequestHandler.respond(401, '');
    createController();
    spyOn($location, 'path').and.stub();
    scope.listShares();
    $httpBackend.flush();
    expect($location.path.calls.argsFor(0)).toEqual(['/login']);
  });

  it('should redirect to the login page when authentication fails in save shares', function() {
    sharesUpdateRequestHandler.respond(401, '');
    createController();
    spyOn($location, 'path').and.stub();
    scope.saveShares({updateType: 'activeStateChange'});
    $httpBackend.flush();
    expect($location.path.calls.argsFor(0)).toEqual(['/login']);
  });

  it('should redirect to the login page when authentication fails in save share', function() {
    saveShareRequestHandler.respond(401, '');
    createController();
    spyOn($location, 'path').and.stub();
    scope.save();
    $httpBackend.flush();
    expect($location.path.calls.argsFor(0)).toEqual(['/login']);
  });

  it('should show an error when there is a backend failure saving a share', function() {
    createController();
    saveShareRequestHandler.respond(500, '');
    scope.save();
    $httpBackend.flush();
    expect(scope.ajaxRequestError.error).toBeTruthy();
  });

});
