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

describe('ItineraryEditCtrl', function() {

  beforeEach(module('myApp'));

  var mockValidForm = {$valid: true,
                       $setPristine: function() {},
                       $setUntouched: function() {}
                      };
  var mockInvalidForm = {$valid: false,
                         $setPristine: function() {},
                         $setUntouched: function() {}
                        };

  beforeEach(inject(function(_$httpBackend_) {
    _$httpBackend_.when('GET', /^partials\/tracks.html$/).respond(null);
    _$httpBackend_.when('GET', /^partials\/itinerary.html$/).respond(null);
  }));

  describe('new', function() {
    var scope, form, $location, $httpBackend, requestHandler, createController, itineraryService;
    var testStrDate = '2016-06-05T00:00:00Z';
    var testItinerary = {id: 42,
                         start: new Date(testStrDate),
                         finish: new Date(testStrDate),
                         title: 'Test itinerary',
                         description: 'Descripton of the itinerary'
                        };
    var expected = {id: undefined,
                    start: testStrDate,
                    finish: testStrDate,
                    title: testItinerary.title,
                    description: testItinerary.description
                   };

    beforeEach(inject(function(_$httpBackend_,
                               $rootScope,
                               $controller,
                               _$location_,
                               ItineraryService) {
      $httpBackend = _$httpBackend_;
      scope = $rootScope;
      requestHandler = $httpBackend.when('POST', /itinerary\/?$/).respond({id: testItinerary.id});
      $location = _$location_;
      itineraryService = ItineraryService;
      createController = function() {
        return $controller('ItineraryEditCtrl', {$scope: scope});
      };
      scope.form = mockValidForm;
    }));

    it('should enter edit mode when a new itinerary is requested', function() {
      createController();
      expect(scope.data.id).toBeUndefined();
      expect(scope.data.start).toBeUndefined();
      expect(scope.data.finish).toBeUndefined();
      expect(scope.data.title).toBeUndefined();
      expect(scope.data.description).toBeUndefined();
      expect(scope.data).toEqual(scope.master);
    });

    it('should create a new itinerary when the form is submitted', function() {
      spyOn(itineraryService, 'save').and.callThrough();
      spyOn($location, 'search').and.stub();
      createController();
      scope.data.title = expected.title;
      scope.data.start = expected.start;
      scope.data.finish = expected.finish;
      scope.data.description = expected.description;
      scope.saveItinerary(scope.data);
      $httpBackend.flush();
      expect(itineraryService.save).toHaveBeenCalledWith({}, expected);
      expect($location.search).toHaveBeenCalledWith({id: testItinerary.id + ''});
      expect(scope.data.id).toEqual(testItinerary.id);
      expect(scope.data.start).toBeDefined();
      expect(scope.data.finish).toBeDefined();
      expect(scope.data.title).toEqual(expected.title);
      expect(scope.data.description).toEqual(expected.description);
    });

    it('should redirect to the login page when authentication fails', function() {
      requestHandler.respond(401, '');
      createController();
      spyOn($location, 'path').and.stub();
      scope.saveItinerary(scope.data);
      $httpBackend.flush();
      expect($location.path).toHaveBeenCalledWith('/login');
    });

  });

  describe('edit', function() {
    var scope, form, $location, $httpBackend, requestHandler,
        saveRequestHandler, createController, itineraryService,
        itineraryWaypointService, itineraryRouteService, itineraryTrackService;
    var routeParams = {id: '42'};
    var expected = {id: routeParams.id,
                    start: new Date('2016-06-05T00:00:00Z'),
                    finish: new Date('2016-06-05T00:00:00Z'),
                    title: 'Test itinerary',
                    description: 'Descripton of the itinerary'
                   };
    var testItinerary = {id: routeParams.id,
                         start: new Date(expected.start),
                         finish: new Date(expected.finish),
                         title: 'Test itinerary',
                         description: 'Descripton of the itinerary'
                        };

    beforeEach(inject(function(_$httpBackend_,
                               $rootScope,
                               $controller,
                               _$location_,
                               ItineraryService,
                               ItineraryWaypointService,
                               ItineraryRouteService,
                               ItineraryTrackService) {
      $httpBackend = _$httpBackend_;
      scope = $rootScope;
      requestHandler = $httpBackend.when('GET', /\/itinerary\/\d+$/).respond(expected);
      $httpBackend.when('POST', /\/download\/itinerary\/\d+\/gpx(\?.*)?/).respond(null);
      saveRequestHandler = $httpBackend.when('POST', /\/itinerary\/\d+$/).respond(null);
      $location = _$location_;
      itineraryService = ItineraryService;
      createController = function() {
        var r = $controller('ItineraryEditCtrl', {$scope: scope,
                                              $routeParams: routeParams});
        return r;
      };
      scope.form = mockValidForm;
    }));

    it('should fetch the itinerary waypoints when the form is first displayed', function() {
      spyOn(itineraryService, 'get').and.callThrough();
      createController();
      $httpBackend.flush();
      expect(itineraryService.get).toHaveBeenCalledWith(routeParams);
    });

    it('should fetch an existing itinerary when called with an ID', function() {
      spyOn(itineraryService, 'get').and.callThrough();
      createController();
      $httpBackend.flush();
      expect(itineraryService.get).toHaveBeenCalledWith(routeParams);
      expect(scope.data).toBeDefined();
      expect(scope.data.id).toBeDefined();
      expect(scope.data.title).toBeDefined();
      expect(scope.data.start).toBeDefined();
      expect(scope.data.description).toBeDefined();
      expect(scope.data).toEqual(scope.master);
    });

    it('should update an itinerary when the form is submitted', function() {
      spyOn(itineraryService, 'save').and.callThrough();
      spyOn(mockValidForm, '$setPristine').and.callThrough();
      spyOn(mockValidForm, '$setUntouched').and.callThrough();
      createController();
      $httpBackend.flush();
      scope.saveItinerary(testItinerary);
      $httpBackend.flush();
      expect(itineraryService.save).toHaveBeenCalledWith({}, expected);
      expect(mockValidForm.$setPristine).toHaveBeenCalled();
      expect(mockValidForm.$setUntouched).toHaveBeenCalled();
      expect(scope.data.id).toEqual(expected.id);
      expect(scope.data.start).toBeDefined();
      expect(scope.data.title).toEqual(expected.title);
      expect(scope.data.description).toEqual(expected.description);
      expect(scope.master.id).toEqual(expected.id);
      expect(scope.master.start).toBeDefined();
      expect(scope.master.title).toEqual(expected.title);
      expect(scope.master.description).toEqual(expected.description);
      expect(scope.data).toEqual(scope.master);
    });

    it('should not clear the form when there is an error saving', function() {
      saveRequestHandler.respond(400, '');
      spyOn(itineraryService, 'save').and.callThrough();
      createController();
      $httpBackend.flush();
      expect(itineraryService.save).not.toHaveBeenCalled();
      expect(scope.master.id).toEqual(expected.id);
      expect(scope.master.title).toEqual(expected.title);
      expect(scope.master.start).toBeDefined();
      expect(scope.master.description).toEqual(expected.description);
      scope.saveItinerary(scope.data);
      $httpBackend.flush();
      expect(itineraryService.save).toHaveBeenCalledWith({}, expected);
      expect(scope.master.id).toEqual(expected.id);
      expect(scope.master.title).toEqual(expected.title);
      expect(scope.master.start).toBeDefined();
      expect(scope.master.description).toEqual(expected.description);
      expect(scope.data.id).toEqual(expected.id);
      expect(scope.data.title).toEqual(expected.title);
      expect(scope.data.start).toBeDefined();
      expect(scope.data.description).toEqual(expected.description);
    });

    it('should not attempt to save an invalid form', function() {
      spyOn(itineraryService, 'save').and.callThrough();
      createController();
      scope.data = expected;
      scope.form = mockInvalidForm;
      scope.saveItinerary(scope.data);
      $httpBackend.flush();
      expect(itineraryService.save).not.toHaveBeenCalled();
      expect(scope.data.id).toEqual(expected.id);
      expect(scope.data.title).toEqual(expected.title);
      expect(scope.data.start).toEqual(expected.start);
      expect(scope.data.description).toEqual(expected.description);
    });

    it('should redirect to the login page when authentication fails', function() {
      requestHandler.respond(401, '');
      createController();
      spyOn($location, 'path').and.stub();
      scope.saveItinerary(testItinerary);
      $httpBackend.flush();
      expect($location.path).toHaveBeenCalledWith('/login');
    });

    it('should show an error when there is a backend failure saving the itinerary', function() {
      createController();
      $httpBackend.flush();
      scope.saveItinerary(testItinerary);
      saveRequestHandler.respond(500, '');
      $httpBackend.flush();
      expect(scope.ajaxRequestError.error).toBeTruthy();
    });

    it('should reset the form after confirmation', function() {
      scope.data = {};
      scope.master = expected;
      spyOn(mockValidForm, '$setPristine').and.callThrough();
      spyOn(mockValidForm, '$setUntouched').and.callThrough();
      createController();
      scope.reset(mockValidForm);
      expect(mockValidForm.$setPristine).toHaveBeenCalled();
      expect(mockValidForm.$setUntouched).toHaveBeenCalled();
      expect(scope.data).toEqual(scope.master);
    });

    it('should show an error when there is a backend failure', function() {
      createController();
      requestHandler.respond(500, '');
      $httpBackend.flush();
      expect(scope.ajaxRequestError.error).toBeTruthy();
    });

    pending('Causes an undesirable file download of itinerary on each test run');
    it('should download itinerary waypoints and routes', function() {
      createController();
      scope.itineraryId = 42;
      $httpBackend.flush();
      scope.waypointSelected = true;
      scope.routeNames = [{id: 1, name: 'test1', selected: true}];
      scope.download(mockValidForm);
      $httpBackend.flush();
    });

  });

  describe('delete', function() {
    var scope, form, $location, $httpBackend, requestHandler,
        deleteRequestHandler, createController, itineraryService;
    var routeParams = {id: '42'};
    var expectedWaypoints = [{id: 234, name: 'wp234', symbol: 'Flag, Blue', comment: 'test234'}];
    var expectedRouteNames = [{id: 1, name: 'test'}];
    var expectedTrackNames = [{id: 2, name: 'Another test'}];
    var expected = {id: routeParams.id,
                    start: '2016-06-05T00:00:00Z',
                    finish: '2016-06-05T00:00:00Z',
                    title: 'Test itinerary',
                    description: 'Descripton of the itinerary'
                   };
    var testItinerary = {id: routeParams.id,
                         start: new Date(expected.start),
                         finish: new Date(expected.finish),
                         title: 'Test itinerary',
                         description: 'Descripton of the itinerary'
                        };
    var itineraryRegex = new RegExp('/itinerary/' + routeParams.id + '$');
    var testItinerarySearchObject = {
      id: '' + testItinerary.id
    };

    beforeEach(inject(function(_$httpBackend_,
                               $rootScope,
                               $controller,
                               _$location_,
                               ItineraryService,
                               ItineraryRouteService,
                               ItineraryTrackService) {
      $httpBackend = _$httpBackend_;
      scope = $rootScope;
      requestHandler = $httpBackend.when('GET', itineraryRegex).respond(expected);
      deleteRequestHandler =
        $httpBackend.when('DELETE', itineraryRegex).respond(null);
      $location = _$location_;
      itineraryService = ItineraryService;
      createController = function() {
        return $controller('ItineraryEditCtrl', {$scope: scope,
                                             $routeParams: routeParams});
      };
      scope.form = mockValidForm;
    }));

    it('should delete the itinerary after confirmation', function() {
      spyOn($location, 'path').and.stub();
      spyOn($location, 'search').and.stub();
      createController();
      $httpBackend.flush();
      scope.delete(testItinerary);
      $httpBackend.flush();
      expect($location.path).toHaveBeenCalled();
      expect($location.path).toHaveBeenCalledWith('/itineraries');
      expect($location.search).toHaveBeenCalledWith('');
    });

  });

});
