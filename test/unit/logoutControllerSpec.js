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

describe('LogoutCtrl', function() {

  beforeEach(module('myApp'));

  var scope, ctrl, $httpBackend, $location, Storage;

  beforeEach(inject(function($rootScope, $controller, _$location_, _Storage_) {
    scope = $rootScope.$new();
    scope.admin = true;
    $location = _$location_;
    Storage = _Storage_;
    spyOn($location, 'path').and.stub();
    spyOn(Storage, 'removeItem').and.stub();
    ctrl = $controller('LogoutCtrl', {$scope: scope});
  }));

  it('should remove the authentication token', function() {
    expect(Storage.removeItem).toHaveBeenCalled();
    expect(Storage.removeItem.calls.argsFor(0)).toEqual(['id_token']);
    expect(scope.admin).toBeFalsy();
  });

  it('should redirect to the login page', function() {
    expect($location.path).toHaveBeenCalled();
    expect($location.path.calls.argsFor(0)).toEqual(['/login']);
  });

});
