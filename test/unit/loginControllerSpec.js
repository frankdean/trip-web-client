/**
 * @license TRIP - Trip Recording and Itinerary Planning application.
 * (c) 2016-2018 Frank Dean <frank@fdsd.co.uk>
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

describe('login-controller.js', function() {

  beforeEach(module('myApp'));

  var scope, $httpBackend, authRequestHandler;
  var expectedToken = {token: 'eyJzdWIiOiJzZWNyZXRAc2VjcmV0Lm9yZyIsImFsZyI6IkhTMjU2IiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.EPre_WvMAKIt8kGU8K9AjtqgqCvYTB-6rpOCxdFp1Ro'};
  var expectedLogin = {email: 'user@trip.test', password: 'secret'};
  var expectedAdminLogin = {email: 'user@trip.test', password: 'secret', admin: 'true'};
  var expectedAdminToken = {token: 'eyJzdWIiOiJzZWNyZXRAc2VjcmV0Lm9yZyIsImFsZyI6IkhTMjU2IiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwidWtfY29fZmRzZF90cmlwX2FkbWluIjp0cnVlfQ.uGpuiTcQgXS03iw1G0xvdPxL189nm51dWw5aDpSSSZY'};
  var storage;

  beforeEach(inject(function(_$httpBackend_, $rootScope, Storage) {
    $httpBackend = _$httpBackend_;
    _$httpBackend_.when('GET', /^partials\/tracks.html$/).respond(null);
    scope = $rootScope.$new();
  }));

  describe('LoginCtrl', function() {
    var ctrl;

    beforeEach(inject(function($controller, Storage) {
      $httpBackend.when('GET', /^partials\/tracks.html$/).respond(null);
      authRequestHandler = $httpBackend.when('POST', new RegExp("login(\\?access_token=[\\.a-zA-Z0-9]+)?$")).
        respond(expectedToken);
      storage = Storage;
      // spyOn(storage, 'getItem').and.callFake(function(){return expectedToken.token;});
      spyOn(storage, 'setItem').and.stub();
      spyOn(storage, 'removeItem').and.stub();
      ctrl = $controller('LoginCtrl', {$scope: scope});
    }));

    it('should store the token in local storage', function() {
      expect(scope.ajaxRequestError).toBeDefined();
      expect(scope.ajaxRequestError).toEqual({error: false});
      scope.doLogin(expectedLogin);
      $httpBackend.flush();
      expect(scope.ajaxRequestError).toBeDefined();
      expect(scope.ajaxRequestError).toEqual({error: false});
      expect(scope.admin).toBeFalsy();
      expect(storage.setItem).toHaveBeenCalledWith('id_token', expectedToken.token);
    });

    it('should define an admin user based on the token contents', function() {
      expect(scope.ajaxRequestError).toBeDefined();
      expect(scope.ajaxRequestError).toEqual({error: false});
      authRequestHandler.respond(expectedAdminToken);
      scope.doLogin(expectedAdminLogin);
      $httpBackend.flush();
      expect(scope.ajaxRequestError).toBeDefined();
      expect(scope.ajaxRequestError).toEqual({error: false});
      expect(scope.admin).toBeTruthy();
      expect(storage.setItem).toHaveBeenCalledWith('id_token', expectedAdminToken.token);
    });

    it('should handle a bad request as a login failure', function() {
      expect(scope.ajaxRequestError).toBeDefined();
      expect(scope.ajaxRequestError).toEqual({error: false});
      authRequestHandler.respond(400, '');
      scope.doLogin(expectedLogin);
      $httpBackend.flush();
      expect(scope.ajaxRequestError).toBeDefined();
      expect(scope.ajaxRequestError).toEqual({unauthorized: true});
      expect(storage.removeItem).toHaveBeenCalledWith('id_token');
    });

    it('should fail authentication', function() {
      expect(scope.ajaxRequestError).toBeDefined();
      expect(scope.ajaxRequestError).toEqual({error: false});
      authRequestHandler.respond(401, '');
      scope.doLogin(expectedLogin);
      $httpBackend.flush();
      expect(scope.ajaxRequestError).toBeDefined();
      expect(scope.ajaxRequestError).toEqual({unauthorized: true});
      expect(storage.removeItem).toHaveBeenCalledWith('id_token');
    });

    it('should handle failure', function() {
      expect(scope.ajaxRequestError).toBeDefined();
      expect(scope.ajaxRequestError).toEqual({error: false});
      authRequestHandler.respond(500, '');
      scope.doLogin(expectedLogin);
      $httpBackend.flush();
      expect(scope.ajaxRequestError.error).toBeTruthy();
      expect(storage.removeItem).toHaveBeenCalledWith('id_token');
    });

  });

  describe('AccountCtrl', function() {
    var stateService, accountController;

    describe('with message', function() {

      beforeEach(inject(function($controller, StateService) {
        stateService = StateService;
        spyOn(stateService, 'getMessage').and.callFake(function() {
          return 'test message';
        });
        spyOn(stateService, 'setMessage').and.stub();
        accountController = $controller('AccountCtrl', {$scope: scope});
        $httpBackend.flush();
      }));

      it('should copy a message to the scope', function() {
        expect(stateService.getMessage).toHaveBeenCalled();
        expect(stateService.setMessage).toHaveBeenCalledWith(null);
        expect(scope.messages).toEqual({message: 'test message'});
      });

    });

    describe('with a null message', function() {

      beforeEach(inject(function($controller, StateService) {
        stateService = StateService;
        spyOn(stateService, 'getMessage').and.callFake(function() {
          return null;
        });
        spyOn(stateService, 'setMessage').and.stub();
        accountController = $controller('AccountCtrl', {$scope: scope});
        $httpBackend.flush();
      }));

      it('should not copy a message to the scope', function() {
        expect(stateService.getMessage).toHaveBeenCalled();
        expect(stateService.setMessage).not.toHaveBeenCalled();
        expect(scope.messages).not.toBeDefined();
      });

    });

    describe('with an undefined message', function() {

      beforeEach(inject(function($controller, StateService) {
        stateService = StateService;
        spyOn(stateService, 'getMessage').and.callFake(function() {
          return undefined;
        });
        spyOn(stateService, 'setMessage').and.stub();
        accountController = $controller('AccountCtrl', {$scope: scope});
        $httpBackend.flush();
      }));

      it('should not copy a message to the scope', function() {
        expect(stateService.getMessage).toHaveBeenCalled();
        expect(stateService.setMessage).not.toHaveBeenCalled();
        expect(scope.messages).not.toBeDefined();
      });

    });

  });

  describe('ChangePasswordCtrl', function() {
    var passwordService, stateService, changePasswordController, $location;

    var mockValidForm = {$valid: true,
                         $setPristine: function() {},
                         $setUntouched: function() {}
                        };
    var mockInvalidForm = {$valid: false,
                           $setPristine: function() {},
                           $setUntouched: function() {}
                          };
    beforeEach(inject(function($controller, StateService, UserPasswordChangeService, _$location_) {
      stateService = StateService;
      passwordService = UserPasswordChangeService;
      $location = _$location_;
      $httpBackend.when('GET', /^partials\/account.html$/).respond(null);
      spyOn(stateService, 'getMessage').and.callFake(function() {
        return 'test success message';
      });
      spyOn(stateService, 'setMessage').and.stub();
      spyOn(passwordService, 'update').and.callThrough();
      spyOn($location, 'path').and.stub();
      spyOn($location, 'search').and.stub();
      changePasswordController = $controller('ChangePasswordCtrl', {$scope: scope});
    }));

    describe('cancel change password', function() {

      beforeEach(function() {
        scope.cancelEdit();
      });

      it('should return to the account page when the form is cancelled', function() {
        expect($location.path).toHaveBeenCalledWith('/account');
        expect($location.search).toHaveBeenCalledWith('');
        expect(stateService.setMessage).not.toHaveBeenCalled();
      });

    });

    describe('change password', function() {
      var successRequestHandler;

      beforeEach(function() {
        scope.data =  {
          current: 'current',
          password2: 'password2'
        };
        successRequestHandler = $httpBackend.when('PUT', /\/account\/password$/).respond(null);
        scope.form = mockValidForm;
        scope.changePassword();
      });

      it('should set a success message', function() {
        $httpBackend.flush();
        expect(stateService.setMessage).toHaveBeenCalledWith('Password changed successfully');
        expect(passwordService.update).toHaveBeenCalledWith({current: 'current', password: 'password2'});
        expect($location.path).toHaveBeenCalledWith('/account');
        expect($location.search).toHaveBeenCalledWith('');
        expect(scope.ajaxRequestError).toEqual({});
      });

      it('should set a failure message when backend rejects change', function() {
        successRequestHandler.respond(400, '');
        $httpBackend.flush();
        expect(stateService.setMessage).not.toHaveBeenCalled();
        expect(passwordService.update).toHaveBeenCalledWith({current: 'current', password: 'password2'});
        expect(scope.ajaxRequestError).toEqual({error: false, badRequest: true});
      });

      it('should set a system error message when backend fails', function() {
        successRequestHandler.respond(500, '');
        $httpBackend.flush();
        expect(stateService.setMessage).not.toHaveBeenCalled();
        expect(passwordService.update).toHaveBeenCalledWith({current: 'current', password: 'password2'});
        expect(scope.ajaxRequestError).toEqual({error: true, status: 500});
      });

    });

  });

});
