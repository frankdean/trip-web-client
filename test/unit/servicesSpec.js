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

describe('service', function() {
  beforeEach(function(){
    jasmine.addMatchers({
      toEqualData: function() {
        return {
          compare: function(actual, expected) {
            return {
              pass: angular.equals(actual.token, expected.token),
              message: 'Expected ' + expected.token + ' but got ' + actual.token
            };
          }
        };
      }
    });
  });

  beforeEach(module('myApp'));

  it('check the existence of a local storage factory', inject(function(Storage) {
    expect(Storage).toBeDefined();
  }));

  describe('Storage', function () {
    var testValue = {token: 'test'};

    it('should retrieve key value pairs',
       inject(function(Storage) {
         Storage.setItem('test', testValue);
         var r = Storage.getItem('test');
         expect(r).toBeDefined();
         expect(r).toEqualData(testValue);
       }));

    it('should remove key value pairs',
       inject(function(Storage) {
         Storage.setItem('test', testValue);
         expect(Storage.getItem('test')).toEqualData(testValue);
         Storage.removeItem('test');
         expect(Storage.getItem('test')).toBeUndefined();
       }));

    it('should retrieve numeric values',
       inject(function(Storage) {
         var n = 42;
         Storage.setItem('test', n);
         expect(Storage.getItem('test')).toEqual(n);
       }));

  });

  describe('ConfigService', function() {
    var testValue1 = {token: 'test1'};
    var testValue2 = {token: 'test2'};
    var configService;

    beforeEach(inject(function(ConfigService) {
      configService = ConfigService;
    }));

    it('should handle a change of token between successive calls to getTileUrl',
       inject(function(Storage) {
         spyOn(Storage, 'getItem').and.returnValues(testValue1.token, testValue2.token);
         expect(configService.getTileUrl(0)).toMatch(/http:\/\/server:80.*\/tile\?id=\d+&z=\{z\}&x=\{x\}&y=\{y\}&access_token=test1/);
         expect(Storage.getItem).toHaveBeenCalled();
         expect(configService.getTileUrl(0)).toMatch(/http:\/\/server:80.*\/tile\?id=\d+&z=\{z\}&x=\{x\}&y=\{y\}&access_token=test2/);
         expect(Storage.getItem).toHaveBeenCalled();
         expect(Storage.getItem.calls.allArgs()).toEqual([['id_token'], ['id_token']]);
       }));

    it('should return the URL prefix for the OsmAnd tracker client', function() {
      expect(configService.getOsmAndTrackerUrlPrefix()).toMatch(/^http:\/\/[^:]+\/.*&uuid=$/);
    });

    describe('Websocket path', function() {

      describe('when localhost', function() {

        beforeEach(inject(function($location) {
          spyOn($location, 'host').and.returnValue('localhost');
        }));

        it ('should not prefix the socket path if the host is not localhost', function() {
          expect(configService.getWebSocketPath()).toEqual('/socket.io');
        });

      });

      describe('when not localhost', function() {

        beforeEach(inject(function($location) {
          spyOn($location, 'host').and.returnValue('otherhost');
        }));

        it ('should prefix the socket path if the host is not localhost', function() {
          expect(configService.getWebSocketPath()).toEqual('/wstrack/socket.io');
        });

      });

    });

  });

});
