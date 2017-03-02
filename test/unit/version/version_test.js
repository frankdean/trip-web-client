'use strict';

describe('myApp.version module', function() {
  beforeEach(module('myApp.version'));

  describe('version service', function() {
    it('should return current version', inject(function(version) {
      expect(version).toMatch(/[0-9]+\.[0-9]+\.[0-9]+/);
    }));
  });
});
