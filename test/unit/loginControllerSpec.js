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

describe('LoginCtrl', function() {

  beforeEach(module('myApp'));

  var scope, ctrl, $httpBackend, authRequestHandler;
  var expectedToken = {token: 'eyJzdWIiOiJzZWNyZXRAc2VjcmV0Lm9yZyIsImFsZyI6IkhTMjU2IiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.EPre_WvMAKIt8kGU8K9AjtqgqCvYTB-6rpOCxdFp1Ro'};
  var expectedLogin = {email: 'user@trip.test', password: 'secret'};
  var expectedAdminLogin = {email: 'user@trip.test', password: 'secret', admin: 'true'};
  var expectedAdminToken = {token: 'eyJzdWIiOiJzZWNyZXRAc2VjcmV0Lm9yZyIsImFsZyI6IkhTMjU2IiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.bB7kbfdEyLr4f7gsP5JCKZnHBD9kAz7Jaa2NWUHMMzk'};
  var storage;

  beforeEach(inject(function(_$httpBackend_, $rootScope, $controller, Storage) {
    $httpBackend = _$httpBackend_;
    _$httpBackend_.when('GET', /^partials\/tracks.html$/).respond(null);
    authRequestHandler = $httpBackend.when('POST', new RegExp("login(\\?access_token=[\\.a-zA-Z0-9]+)?$")).
      respond(expectedToken);
    storage = Storage;
    // spyOn(storage, 'getItem').and.callFake(function(){return expectedToken.token;});
    spyOn(storage, 'setItem').and.stub();
    spyOn(storage, 'removeItem').and.stub();
    scope = $rootScope.$new();
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
