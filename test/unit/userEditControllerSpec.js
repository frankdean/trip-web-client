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

describe('UserEditCtrl', function() {

  beforeEach(module('myApp'));

  var $httpBackend, $location, userService, scope, createController,
  confirmDialog;
  var mockValidForm = {$valid: true,
                       $setPristine: function() {},
                       $setUntouched: function() {}
                      };
  var mockInvalidForm = {$valid: false,
                       $setPristine: function() {},
                       $setUntouched: function() {}
                      };
  var testUser = {
    id: 48,
    nickname: 'testNickname',
    email: 'testEmail',
    firstname: 'testFirstname',
    lastname: 'testLastname',
    admin: undefined
  };
  var routeParams = {id: testUser.id};

  beforeEach(inject(function(_$httpBackend_,
                             $rootScope,
                             $controller,
                             _$location_,
                             UserService,
                             modalDialog) {
    $httpBackend = _$httpBackend_;
    $location = _$location_;
    userService = UserService;
    scope = $rootScope;
    confirmDialog = modalDialog;
    createController = function() {
      return $controller('UserEditCtrl', {$scope: scope, $location: $location, $routeParams: routeParams});
    };
    scope.form = mockValidForm;
  }));

  describe('Initialise form', function() {
    var requestHandler;

    beforeEach(function() {
      requestHandler = $httpBackend.when('GET', /admin\/user\/[\d]+$/).respond(testUser);
    });

    it('should fetch the specified user', function() {
      createController();
      $httpBackend.flush();
    });

    it('should show an error when there is a backend failure fetching a user', function() {
      createController();
      requestHandler.respond(500, '');
      $httpBackend.flush();
      expect(scope.ajaxRequestError.error).toBeTruthy();
    });

    describe('Update user', function() {
      var updateRequestHandler;

      beforeEach(function() {
        var expectedBody = {
          id: testUser.id,
          nickname: testUser.nickname,
          username: testUser.email,
          firstname: testUser.firstname,
          lastname: testUser.lastname
        };
        updateRequestHandler = $httpBackend.when(
          'POST',
            /admin\/user\/[\d]+$/,
          function(data) {
            var expected = JSON.stringify(expectedBody);
            if (expected === data) {
              return true;
            }
            // console.log('POST body was:', data, ' but expected:', expected);
            return false;
          }
        ).respond(null);
      });

      it('should save changes to a user', function() {
        spyOn($location, 'path').and.stub();
        spyOn($location, 'search').and.stub();
        createController();
        $httpBackend.flush();
        scope.saveUser(mockValidForm);
        $httpBackend.flush();
        expect($location.path.calls.argsFor(0)).toEqual(['/users']);
        expect($location.search.calls.argsFor(0)).toEqual(['']);
      });

      it('should show an error when there is a backend failure updating a user', function() {
        createController();
        $httpBackend.flush();
        scope.saveUser(mockValidForm);
        updateRequestHandler.respond(500, '');
        $httpBackend.flush();
        expect(scope.ajaxRequestError.error).toBeTruthy();
      });

    });

    describe('Cancel save user', function() {

      it('should cancel without confirmation if the form is not dirty', function() {
        spyOn(confirmDialog, 'confirm').and.stub();
        spyOn($location, 'path').and.stub();
        spyOn($location, 'search').and.stub();
        mockValidForm.$dirty = false;
        createController();
        $httpBackend.flush();
        scope.cancelEdit(mockValidForm);
        expect(confirmDialog.confirm).not.toHaveBeenCalled();
        expect($location.path).toHaveBeenCalled();
        expect($location.path.calls.argsFor(0)).toEqual(['/users']);
        expect($location.search).toHaveBeenCalled();
        expect($location.search.calls.argsFor(0)).toEqual(['']);
      });

      it('should confirm before cancelling if the form is dirty', function() {
        spyOn(confirmDialog, 'confirm').and.returnValue(true);
        spyOn($location, 'path').and.stub();
        spyOn($location, 'search').and.stub();
        mockValidForm.$dirty = true;
        createController();
        $httpBackend.flush();
        scope.cancelEdit(mockValidForm);
        expect(confirmDialog.confirm).toHaveBeenCalled();
        expect($location.path).toHaveBeenCalled();
        expect($location.path.calls.argsFor(0)).toEqual(['/users']);
        expect($location.search).toHaveBeenCalled();
        expect($location.search.calls.argsFor(0)).toEqual(['']);
      });

    });

    describe('Reset update user', function() {

      it('should require confirmation if the form is dirty', function() {
        spyOn(confirmDialog, 'confirm').and.returnValue(true);
        createController();
        $httpBackend.flush();
        expect(scope.data).toEqual(testUser);
        scope.data = {};
        mockValidForm.$dirty = true;
        scope.reset(mockValidForm);
        expect(confirmDialog.confirm).toHaveBeenCalled();
        expect(scope.data).toEqual(testUser);
      });

      it('should do nothing if the form is not dirty', function() {
        spyOn(confirmDialog, 'confirm').and.stub();
        createController();
        $httpBackend.flush();
        expect(scope.data).toEqual(testUser);
        mockValidForm.$dirty = false;
        scope.reset(mockValidForm);
        expect(confirmDialog.confirm).not.toHaveBeenCalled();
        expect(scope.data).toEqual(testUser);
      });

    });

  });

});

