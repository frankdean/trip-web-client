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

describe('AdminPasswordResetCtrl', function() {

  beforeEach(module('myApp'));

  var $httpBackend, $location, userService, scope, createController;
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
    lastname: 'testLastname'
  };
  var routeParams = {id: testUser.id};

  beforeEach(inject(function(_$httpBackend_,
                             $rootScope,
                             $controller,
                             _$location_,
                             UserService) {
    _$httpBackend_.when('GET', /^partials\/tracks.html$/).respond(null);
    $httpBackend = _$httpBackend_;
    $location = _$location_;
    userService = UserService;
    scope = $rootScope;
    createController = function() {
      return $controller('AdminPasswordResetCtrl', {$scope: scope, $location: $location, $routeParams: routeParams});
    };
    scope.form = mockValidForm;
  }));

  describe('Admin password reset', function() {
    var testPassword = 'secret',
        getUserRequestHandler,
        resetPasswordRequestHandler;

    beforeEach(function() {
      var expectedBody = {
        id: testUser.id,
        password: testPassword,
        email: testUser.email
      };
      getUserRequestHandler = $httpBackend.when('GET', /admin\/user\/[\d]+$/).respond(testUser);
      resetPasswordRequestHandler = $httpBackend.when(
        'POST',
          /admin\/password\/reset$/,
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

    it('should fetch the specified user', function() {
      createController();
      $httpBackend.flush();
    });

    it('should save changes to a user', function() {
      spyOn($location, 'path').and.stub();
      spyOn($location, 'search').and.stub();
      createController();
      $httpBackend.flush();
      scope.data.password=testPassword;
      scope.resetPassword(mockValidForm);
      $httpBackend.flush();
      expect($location.path).toHaveBeenCalledWith('/users');
      expect($location.search).toHaveBeenCalledWith('');
    });

    it('should set an error when the backend fails to return the user', function() {
      getUserRequestHandler.respond(500, '');
      createController();
      $httpBackend.flush();
      expect(scope.ajaxRequestError.error).toBeTruthy();
    });

    it('should set an error when the backend fails to reset the password', function() {
      resetPasswordRequestHandler.respond(500, '');
      createController();
      $httpBackend.flush();
      scope.data.password=testPassword;
      scope.resetPassword(mockValidForm);
      $httpBackend.flush();
      expect(scope.ajaxRequestError.error).toBeTruthy();
    });

  });

});
