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

describe('UserCtrl', function() {

  beforeEach(module('myApp'));

  var scope, $httpBackend, createController, userListRequestHandler, userServiceRequestHandler,
      $location, userService, passwordResetService, confirmDialog, testUser, testUser2,
      userList, passwordResetHandler;
  var testUserId = 42;
  var testUserId2 = 43;
  var mockValidForm = {$valid: true,
                       $setPristine: function() {},
                       $setUntouched: function() {}
                      };
  var mockInvalidForm = {$valid: false,
                       $setPristine: function() {},
                       $setUntouched: function() {}
                      };
  var expectedUser = {
    id: undefined,
    nickname: 'test nickname',
    username: 'secret@secret.org',
    password: 'secret',
    firstname: 'first name',
    lastname: 'last name'
  };

  beforeEach(inject(function(_$httpBackend_,
                             $rootScope,
                             $controller,
                             _$location_,
                             UserService,
                             PasswordResetService,
                             modalDialog) {
    $httpBackend = _$httpBackend_;
    $location = _$location_;
    userService = UserService;
    passwordResetService = PasswordResetService;
    confirmDialog = modalDialog;
    scope = $rootScope;
    createController = function() {
      return $controller('UserCtrl', {$scope: scope});
    };
    scope.form = mockValidForm;
    testUser = {
      id: testUserId,
      nickname: expectedUser.nickname,
      email: expectedUser.username,
      firstname: expectedUser.firstname,
      lastname: expectedUser.lastname
    };
    testUser2 = {
      id: testUserId2,
      nickname: expectedUser.nickname,
      email: expectedUser.username,
      firstname: expectedUser.firstname,
      lastname: expectedUser.lastname
    };
    userList = {count: 1, payload: [testUser, testUser2]};
  }));

  describe('Search users', function() {

    beforeEach(function() {
      userListRequestHandler = $httpBackend.when('GET', /admin\/user\?offset=[\d]+&page_size=[\d]+&searchType=(?:exact|partial)$/).respond(userList);
    });

    it('should redirect to the login page when authentication fails when searching for users', function() {
      userListRequestHandler.respond(401, '');
      createController();
      spyOn($location, 'path').and.stub();
      scope.searchUsers();
      $httpBackend.flush();
      expect($location.path.calls.argsFor(0)).toEqual(['/login']);
    });

    it('should fetch a page when the page navigation buttons are pressed', function() {
      createController();
      scope.doPagingAction('test', 2, 5, 20);
      $httpBackend.flush();
      expect(scope.users).toBeDefined();
      expect(scope.state.edit).toBeFalsy();
    });

    it('should show an error when there is a backend failure', function() {
      createController();
      scope.doPagingAction('test', 2, 5, 20);
      userListRequestHandler.respond(500, '');
      $httpBackend.flush();
      expect(scope.ajaxRequestError.error).toBeTruthy();
    });

    it('should fetch a list of users when the search button is clicked', function() {
      createController();
      scope.offset = 10;
      scope.searchUsers();
      expect(scope.offset).toBe(0);
      $httpBackend.flush();
      expect(scope.users).toBeDefined();
      expect(scope.state.edit).toBeFalsy();
    });

  });

  describe('Create user', function() {

    describe('Success', function() {

      beforeEach(function() {
        userServiceRequestHandler = $httpBackend.when(
          'POST',
            /admin\/user$/,
          function(data) {
            var expected = JSON.stringify(expectedUser);
            if (expected === data) {
              return true;
            }
            // console.log('Expected body:', expected, 'but was:', data);
            return false;
          }
        ).respond(null);
      });

      it('should create a new user when the form is submitted', function() {
        spyOn(userService, 'save').and.callThrough();
        createController();
        scope.data.nickname = expectedUser.nickname;
        scope.data.username = expectedUser.username;
        scope.data.password = expectedUser.password;
        scope.data.firstname = expectedUser.firstname;
        scope.data.lastname = expectedUser.lastname;
        scope.saveUser();
        $httpBackend.flush();
        expect(userService.save).toHaveBeenCalledWith({}, expectedUser);
        expect(scope.data.nickname).toBeUndefined();
        expect(scope.data.username).toBeUndefined();
        expect(scope.data.password).toBeUndefined();
        expect(scope.data.password2).toBeUndefined();
        expect(scope.data.firstname).toBeUndefined();
        expect(scope.data.lastname).toBeUndefined();
      });

      it('should show an error when there is a backend failure', function() {
        createController();
        scope.data.nickname = expectedUser.nickname;
        scope.data.username = expectedUser.username;
        scope.data.password = expectedUser.password;
        scope.data.firstname = expectedUser.firstname;
        scope.data.lastname = expectedUser.lastname;
        scope.saveUser();
        userServiceRequestHandler.respond(500, '');
        $httpBackend.flush();
        expect(scope.ajaxRequestError.error).toBeTruthy();
      });

    });

    describe('failed authentication', function() {

      beforeEach(function() {
        userServiceRequestHandler = $httpBackend.when('POST', /admin\/user$/).respond(null);
      });

      it('should redirect to the login page when authentication fails when creating a new user', function() {
        userServiceRequestHandler.respond(401, '');
        createController();
        spyOn($location, 'path').and.stub();
        scope.saveUser();
        $httpBackend.flush();
        expect($location.path.calls.argsFor(0)).toEqual(['/login']);
      });

    });

  });

  describe('Reset password', function() {
    var testPassword = 'testPassword';

    beforeEach(function() {
      var expectedBody = {email: testUser.email, password: testPassword};
      passwordResetHandler = $httpBackend.when(
        'POST',
          /admin\/password\/reset/,
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

    it('should reset a user password', function() {
      spyOn(userService, 'save').and.callThrough();
      spyOn(passwordResetService, 'save').and.callThrough();
      createController();
      scope.state.passwordOnly = true;
      scope.data.id = testUser.id;
      scope.data.username = testUser.email;
      scope.data.password = testPassword;
      scope.saveUser(mockValidForm);
      $httpBackend.flush();
      expect(passwordResetService.save).toHaveBeenCalled();
      expect(userService.save).not.toHaveBeenCalled();
    });

    it('should show an error when there is a backend failure resetting a password', function() {
      createController();
      scope.state.passwordOnly = true;
      scope.data.id = testUser.id;
      scope.data.username = testUser.email;
      scope.data.password = testPassword;
      scope.saveUser(mockValidForm);
      passwordResetHandler.respond(500, '');
      $httpBackend.flush();
      expect(scope.ajaxRequestError.error).toBeTruthy();
    });

  });

  describe('Update user', function() {

    beforeEach(function() {
      userServiceRequestHandler = $httpBackend.when('POST', /admin\/user\/[\d]+$/).
        respond(null);
    });

    it('should update an existing user when the form is submitted', function() {
      var testUpdateUser = expectedUser;
      testUpdateUser.id = testUserId;
      spyOn(userService, 'save').and.callThrough();
      createController();
      scope.data.id = testUserId;
      scope.data.nickname = expectedUser.nickname;
      scope.data.username = expectedUser.username;
      scope.data.password = expectedUser.password;
      scope.data.firstname = expectedUser.firstname;
      scope.data.lastname = expectedUser.lastname;
      scope.saveUser();
      $httpBackend.flush();
      expect(userService.save).toHaveBeenCalledWith({}, testUpdateUser);
      expect(scope.data.nickname).toBeUndefined();
      expect(scope.data.username).toBeUndefined();
      expect(scope.data.password).toBeUndefined();
      expect(scope.data.password2).toBeUndefined();
      expect(scope.data.firstname).toBeUndefined();
      expect(scope.data.lastname).toBeUndefined();
    });

  });

  describe('Actions on selected user', function() {

    beforeEach(function() {
      scope.users = userList;
      userList.payload.forEach(function(item) {
        item.selected = false;
      });
      userList.payload[0].selected = true;
    });

    describe('Confirmed delete', function() {

      beforeEach(function() {
        userServiceRequestHandler = $httpBackend.when('DELETE', /admin\/user\/[\d]+$/).
          respond(null);
        userListRequestHandler = $httpBackend.when('GET', /admin\/user\?offset=[\d]+&page_size=[\d]+&searchType=(?:exact|partial)$/).respond(userList);
      });

      it('should delete an existing user when the form is submitted', function() {
        var testUpdateUser = expectedUser;
        testUpdateUser.id = testUserId;
        // It is the selectedItem.id that is used
        scope.form.id = undefined;
        scope.users = userList;
        spyOn(userService, 'delete').and.callThrough();
        spyOn(confirmDialog, 'confirm').and.returnValue(true);
        createController();
        scope.delete(scope.form);
        $httpBackend.flush();
        expect(userService.delete).toHaveBeenCalled();
        expect(scope.data.nickname).toBeUndefined();
        expect(scope.data.username).toBeUndefined();
        expect(scope.data.password).toBeUndefined();
        expect(scope.data.password2).toBeUndefined();
        expect(scope.data.firstname).toBeUndefined();
        expect(scope.data.lastname).toBeUndefined();
      });

      describe('Cannot perform actions on multiple users', function() {

        beforeEach(function() {
          userList.payload[1].selected = true;
        });

        it('should not delete multiple users', function() {
          spyOn(userService, 'delete').and.callThrough();
          spyOn(confirmDialog, 'confirm').and.returnValue(true);
          createController();
          scope.delete(scope.form);
          expect(userService.delete).not.toHaveBeenCalled();
        });

        it('should not delete multiple users', function() {
          spyOn(userService, 'delete').and.callThrough();
          spyOn(confirmDialog, 'confirm').and.returnValue(true);
          createController();
          scope.delete(scope.form);
          expect(userService.delete).not.toHaveBeenCalled();
        });

        it('should not edit multiple users', function() {
          spyOn($location, 'path').and.stub();
          spyOn($location, 'search').and.stub();
          createController();
          scope.edit(scope.form);
          expect($location.path).not.toHaveBeenCalled();
          expect($location.search).not.toHaveBeenCalled();
        });

        it('should not reset multiple user passwords', function() {
          spyOn($location, 'path').and.stub();
          spyOn($location, 'search').and.stub();
          createController();
          scope.editPassword(scope.form);
          expect($location.path).not.toHaveBeenCalled();
          expect($location.search).not.toHaveBeenCalled();
        });

      });

    });

    describe('Cancelled delete', function() {

      it('should NOT delete an existing user when form submition is cancelled', function() {
        var testUpdateUser = expectedUser;
        testUpdateUser.id = testUserId;
        scope.form.id = testUserId;
        spyOn(userService, 'delete').and.callThrough();
        spyOn(confirmDialog, 'confirm').and.returnValue(false);
        createController();
        scope.delete(scope.form);
        expect(userService.delete).not.toHaveBeenCalled();
      });

    });

    describe('Edit user', function() {

      it('should display the form in edit mode', function() {
        spyOn($location, 'path').and.stub();
        spyOn($location, 'search').and.stub();
        createController();
        scope.edit(scope.form);
        expect($location.path.calls.argsFor(0)).toEqual(['/edit-user']);
        expect($location.search).toHaveBeenCalled();
        expect($location.search.calls.argsFor(0)).toEqual([{id: '' + testUserId}]);
      });

      it('should display the form in password edit mode', function() {
        spyOn($location, 'path').and.stub();
        spyOn($location, 'search').and.stub();
        createController();
        scope.editPassword(scope.form);
        expect($location.path.calls.argsFor(0)).toEqual(['/admin-password-reset']);
        expect($location.search).toHaveBeenCalled();
        expect($location.search.calls.argsFor(0)).toEqual([{id: '' + testUserId}]);
      });

    });

  });

});
