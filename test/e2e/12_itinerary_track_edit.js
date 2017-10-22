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

describe('Itinerary Track Edit', function() {

  var testItineraryId = 2425,
      testSharedItineraryId = 983,
      testSharedTrackId = 1025,
      testTrackId_01 = 1027,
      testTrackId_02 = 1028,
      list;

  describe('Join tracks', function() {

    beforeEach(function() {
      browser.get('app/index.html#' + browser.privateConfig.hashPrefix + '/itinerary?id=' + testItineraryId);
      element(by.id('input-track-' + testTrackId_01)).click();
      element(by.id('input-track-' + testTrackId_02)).click();
      element(by.id('btn-join-path')).click();
      list = element.all(by.repeater('track in tracks'));
    });

    it('should display the two tracks', function() {
      expect(list.first().all(by.tagName('td')).get(1).getText()).toEqual('Test track 01');
      expect(list.get(1).all(by.tagName('td')).get(1).getText()).toEqual('Test track 02');
    });

    it('should return to the itinerary when cancel is selected', function() {
      element(by.id('btn-cancel')).click();
      element.all((by.css('.confirm-button'))).get(1).click();
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=\d+/);
    });

    it('should move the last track up in the list', function() {
      element.all((by.css('.btn-info'))).get(2).click();
      expect(list.first().all(by.tagName('td')).get(1).getText()).toEqual('Test track 02');
      expect(list.get(1).all(by.tagName('td')).get(1).getText()).toEqual('Test track 01');
    });

    it('should create a new track when the join button is clicked', function() {
      element(by.id('input-name')).clear();
      element(by.id('input-name')).sendKeys('Test track 03');
      element(by.id('input-color')).sendKeys('R');
      element(by.id('btn-join')).click();
      element.all((by.css('.confirm-button'))).get(0).click();
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=\d+/);
    });

  });

  describe('Track Segments', function() {
    var segments;

    beforeEach(function() {
      browser.get('app/index.html#' + browser.privateConfig.hashPrefix + '/itinerary?id=' + testItineraryId);
      list = element.all(by.repeater('track in trackNames'));
      list.get(2).all(by.tagName('td')).get(0).click();
      element(by.id('btn-edit-path')).click();
      segments = element.all(by.repeater('segment in data.track.segments'));
    });

    it('should display the track segment list', function() {
      // There should be two segments with the second column showing the segment ID
      expect(segments.get(1).all(by.tagName('td')).get(1).getText()).toMatch(/\d+/);
      expect(element(by.id('div-buttons')).isDisplayed()).toBeTruthy();
      expect(element(by.id('btn-delete')).isDisplayed()).toBeTruthy();
      expect(element(by.id('btn-split')).isDisplayed()).toBeTruthy();
      expect(element(by.id('btn-merge')).isDisplayed()).toBeTruthy();
    });

    describe ('Track points', function() {
      var points;

      beforeEach(function() {
        segments.get(1).all(by.tagName('a')).get(0).click();
        points = element.all(by.repeater('point in points'));
      });

      it('should display the edit buttons', function() {
        expect(browser.getCurrentUrl()).toMatch(/\/itinerary-track-segment-edit\?itineraryId=\d+&trackId=\d+&segmentId=\d+&shared=false/);
        expect(element(by.id('div-buttons')).isDisplayed()).toBeTruthy();
        expect(element(by.id('btn-delete')).isDisplayed()).toBeTruthy();
        expect(element(by.id('btn-split')).isDisplayed()).toBeTruthy();
      });

      it('should allow a single point to be deleted', function() {
        points.get(9).all(by.tagName('td')).get(0).click();
        element(by.id('btn-delete')).click();
        element.all((by.css('.confirm-button'))).get(0).click();
      });

      it('should allow multiple points to be deleted', function() {
        points.get(1).all(by.tagName('td')).get(0).click();
        points.get(2).all(by.tagName('td')).get(0).click();
        element(by.id('btn-delete')).click();
        element.all((by.css('.confirm-button'))).get(0).click();
      });

      it('should not allow multiple points to be selected to split the segment', function() {
        points.get(1).all(by.tagName('td')).get(0).click();
        points.get(2).all(by.tagName('td')).get(0).click();
        element(by.id('btn-split')).click();
        element.all((by.css('.confirm-button'))).get(1).click();
        expect(element(by.id('error-edit-only-one')).isDisplayed()).toBeTruthy();
      });

      it('should return to the itinerary track segment list when close is clicked', function() {
        element(by.id('btn-close')).click();
        expect(browser.getCurrentUrl()).toMatch(/\/itinerary-track-edit\?itineraryId=\d+&trackId=\d+/);
      });

      it('should split the segment', function() {
        points.get(5).all(by.tagName('td')).get(0).click();
        element(by.id('btn-split')).click();
        element.all((by.css('.confirm-button'))).get(1).click();
        expect(browser.getCurrentUrl()).toMatch(/\/itinerary-track-edit\?itineraryId=\d+&trackId=\d+/);
      });

    });

    describe('Mergings segments', function() {

      it('should require at least two elements to be selected before merging', function() {
        segments.get(1).all(by.model('segment.selected')).first().click();
        element(by.id('btn-merge')).click();
        element.all((by.css('.confirm-button'))).get(2).click();
        expect(element(by.id('error-minimum-select-two')).isDisplayed()).toBeTruthy();
      });

      it('should merge segments', function() {
        segments.get(1).all(by.model('segment.selected')).first().click();
        segments.get(2).all(by.model('segment.selected')).first().click();
        element(by.id('btn-merge')).click();
        element.all((by.css('.confirm-button'))).get(2).click();
      });

    });

  });

  describe('Split Track', function() {
    var segments;

    beforeEach(function() {
      browser.get('app/index.html#' + browser.privateConfig.hashPrefix + '/itinerary?id=' + testItineraryId);
      list = element.all(by.repeater('track in trackNames'));
      list.get(2).all(by.tagName('td')).get(0).click();
      element(by.id('btn-edit-path')).click();
      segments = element.all(by.repeater('segment in data.track.segments'));
    });

    it('should not allow more than one element to be selected to split a track', function() {
      segments.get(0).all(by.model('segment.selected')).first().click();
      segments.get(1).all(by.model('segment.selected')).first().click();
      element(by.id('btn-split')).click();
      element.all((by.css('.confirm-button'))).get(1).click();
      expect(element(by.id('error-edit-only-one')).isDisplayed()).toBeTruthy();
    });

    it('should split a track', function() {
      segments.get(1).all(by.model('segment.selected')).first().click();
      element(by.id('btn-split')).click();
      element.all((by.css('.confirm-button'))).get(1).click();
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=\d+/);
    });

  });

  describe('Delete Track Segments', function() {
    var segments, points;

    beforeEach(function() {
      browser.get('app/index.html#' + browser.privateConfig.hashPrefix + '/itinerary?id=' + testItineraryId);
      list = element.all(by.repeater('track in trackNames'));
      list.get(2).all(by.tagName('td')).get(0).click();
      element(by.id('btn-edit-path')).click();
      segments = element.all(by.repeater('segment in data.track.segments'));
      segments.get(0).all(by.tagName('a')).get(0).click();
      points = element.all(by.repeater('point in points'));
      points.get(9).all(by.tagName('td')).get(0).click();
      element(by.id('btn-split')).click();
      element.all((by.css('.confirm-button'))).get(1).click();
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary-track-edit\?itineraryId=\d+&trackId=\d+/);
    });

    it('should allow more than one segmented to be deleted', function() {
      segments.get(0).all(by.model('segment.selected')).first().click();
      segments.get(1).all(by.model('segment.selected')).first().click();
      expect(element(by.id('track-not-found')).isDisplayed()).toBeFalsy();
      element(by.id('btn-delete')).click();
      element.all((by.css('.confirm-button'))).get(0).click();
      expect(element(by.id('track-not-found')).isDisplayed()).toBeTruthy();
    });

  });

  describe('Read only', function() {
    var segments;

    beforeEach(function() {
      browser.get('app/index.html#' + browser.privateConfig.hashPrefix + '/itinerary?id=' + testSharedItineraryId);
      element(by.id('input-track-' + testSharedTrackId)).click();
      element(by.id('btn-view-path')).click();
      segments = element.all(by.repeater('segment in data.track.segments'));
    });

    it('should display the track segment list', function() {
      // There should be two segments with the second column showing the segment ID
      expect(segments.get(1).all(by.tagName('td')).get(1).getText()).toMatch(/\d+/);
      expect(element(by.id('div-buttons')).isDisplayed()).toBeFalsy();
      expect(element(by.id('btn-delete')).isDisplayed()).toBeFalsy();
      expect(element(by.id('btn-split')).isDisplayed()).toBeFalsy();
      expect(element(by.id('btn-merge')).isDisplayed()).toBeFalsy();
    });

    describe('View points', function() {

      beforeEach(function() {
        segments.get(1).all(by.tagName('a')).get(0).click();
        expect(browser.getCurrentUrl()).toMatch(/\/itinerary-track-segment-edit\?itineraryId=\d+&trackId=\d+&segmentId=\d+&shared=true/);
      });

      it('should display the track points', function() {
        expect(element(by.id('div-buttons')).isDisplayed()).toBeFalsy();
        expect(element(by.id('btn-delete')).isDisplayed()).toBeFalsy();
        expect(element(by.id('btn-split')).isDisplayed()).toBeFalsy();
      });

    });

  });

  describe('Handling of tracks with no name', function() {

    beforeEach(function() {
      browser.get('app/index.html#' + browser.privateConfig.hashPrefix + '/itinerary?id=' + testItineraryId);
      element(by.id('input-track-' + testTrackId_01)).click();
      element(by.id('input-track-' + testTrackId_02)).click();
      element(by.id('btn-join-path')).click();
      list = element.all(by.repeater('track in tracks'));
    });

    it('should allow creation a new track with no name', function() {
      element(by.id('input-name')).clear();
      element(by.id('btn-join')).click();
      element.all((by.css('.confirm-button'))).get(0).click();
      expect(browser.getCurrentUrl()).toMatch(/\/itinerary\?id=\d+/);
    });

    describe('Display of track names', function() {
      beforeEach(function() {
        browser.get('app/index.html#' + browser.privateConfig.hashPrefix + '/itinerary?id=' + testItineraryId);
        element(by.id('input-select-all-tracks')).click();
        element(by.id('btn-join-path')).click();
        list = element.all(by.repeater('track in tracks'));
      });

      // Test expects one of the previous tests to have created a track with no name
      it('Track names should not be empty, even when track has no name', function() {
        expect(list.first().all(by.tagName('td')).get(1).getText()).toMatch(/.+/);
        expect(list.get(1).all(by.tagName('td')).get(1).getText()).toMatch(/.+/);
        expect(list.get(2).all(by.tagName('td')).get(1).getText()).toMatch(/.+/);
      });

    });

  });

  describe('Cleanup', function() {

    beforeEach(function() {
      browser.get('app/index.html#' + browser.privateConfig.hashPrefix + '/itinerary?id=' + testItineraryId);
    });

    it('should remove tracks we created during testing', function() {
      element(by.id('input-select-all-tracks')).click();
      element(by.id('input-track-' + testTrackId_01)).click();
      element(by.id('input-track-' + testTrackId_02)).click();
      element(by.id('btn-delete-gpx')).click();
      element.all((by.css('.confirm-button'))).get(1).click();
    });

  });

});
