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

describe('Track Sharing page', function() {
  var sharesList, pageCount, elemNickname, elemRecentDays, elemRecentHours,
      elemRecentMinutes, elemMaxDays, elemMaxHours,
      elemMaxMinutes, elemActive, elemButtonSave;

  beforeEach(function() {
    browser.get(browser.baseUrl + '/sharing');
    sharesList = element.all(by.repeater('share in shares'));
    pageCount = sharesList.count();
    elemNickname = element(by.model('data.nickname'));
    elemRecentDays = element(by.model('data.recentDays'));
    elemRecentHours = element(by.model('data.recentHours'));
    elemRecentMinutes = element(by.model('data.recentMinutes'));
    elemMaxDays = element(by.model('data.maxDays'));
    elemMaxHours = element(by.model('data.maxHours'));
    elemMaxMinutes = element(by.model('data.maxMinutes'));
    elemActive = element(by.model('data.active'));
    elemButtonSave = element(by.id('btn-save'));
  });

  it('should create a new location share and display it in the list', function() {
    elemNickname.sendKeys('Adam');
    elemRecentDays.sendKeys('1');
    elemRecentHours.sendKeys('2');
    elemRecentMinutes.sendKeys('3');
    elemMaxDays.sendKeys('4');
    elemMaxHours.sendKeys('5');
    elemMaxMinutes.sendKeys('6');
    elemActive.click();
    element(by.id('btn-save')).click();
    expect(sharesList.all(by.tagName('td')).get(0).getText()).toEqual('Adam');
    expect(sharesList.all(by.tagName('td')).get(1).getText()).toEqual('1d 2h 3m');
    expect(sharesList.all(by.tagName('td')).get(2).getText()).toEqual('4d 5h 6m');
    expect(sharesList.all(by.tagName('td')).get(3).getText()).toEqual('\u2713');
    expect(sharesList.all(by.model('share.selected')).first().getAttribute('checked').isSelected()).toBeFalsy();
  });

  it('should update an existing location share and display it in the list', function() {
    elemNickname.sendKeys('Adam');
    elemRecentDays.sendKeys('11');
    elemRecentHours.sendKeys('12');
    elemRecentMinutes.sendKeys('13');
    elemMaxDays.sendKeys('14');
    elemMaxHours.sendKeys('15');
    elemMaxMinutes.sendKeys('16');
    elemActive.click();
    element(by.id('btn-save')).click();
    expect(sharesList.all(by.tagName('td')).get(0).getText()).toEqual('Adam');
    expect(sharesList.all(by.tagName('td')).get(1).getText()).toEqual('11d 12h 13m');
    expect(sharesList.all(by.tagName('td')).get(2).getText()).toEqual('14d 15h 16m');
    expect(sharesList.all(by.tagName('td')).get(3).getText()).toEqual('\u2713');
    expect(sharesList.all(by.model('share.selected')).first().getAttribute('checked').isSelected()).toBeFalsy();
  });

  it('should create another location share and display it in the list', function() {
    elemNickname.sendKeys('Adam2');
    element(by.id('btn-save')).click();
    expect(sharesList.all(by.tagName('td')).get(5).getText()).toEqual('Adam2');
    expect(sharesList.all(by.tagName('td')).get(6).getText()).toEqual('0d 0h 0m');
    expect(sharesList.all(by.tagName('td')).get(7).getText()).toEqual('0d 0h 0m');
    expect(sharesList.all(by.tagName('td')).get(8).getText()).toEqual('');
    expect(sharesList.all(by.model('share.selected')).first().getAttribute('checked').isSelected()).toBeFalsy();
  });

  it('should restore the initial state of the form when reset button is clicked', function() {
    sharesList.all(by.model('share.selected')).first().click();
    expect(sharesList.all(by.model('share.selected')).first().getAttribute('checked').isSelected()).toBeTruthy();
    element(by.id('btn-edit')).click();
    expect(sharesList.all(by.tagName('td')).get(0).getText()).toEqual('Adam');
    expect(sharesList.all(by.tagName('td')).get(1).getText()).toEqual('11d 12h 13m');
    expect(sharesList.all(by.tagName('td')).get(2).getText()).toEqual('14d 15h 16m');
    expect(sharesList.all(by.tagName('td')).get(3).getText()).toEqual('\u2713');
    elemRecentDays.clear();
    elemRecentHours.clear();
    elemRecentMinutes.clear();
    elemMaxDays.clear();
    elemMaxHours.clear();
    elemMaxMinutes.clear();
    elemActive.click();
    element(by.id('btn-reset')).click();
    expect(elemNickname.getAttribute('value')).toEqual('Adam');
    expect(elemRecentDays.getAttribute('value')).toEqual('11');
    expect(elemRecentHours.getAttribute('value')).toEqual('12');
    expect(elemRecentMinutes.getAttribute('value')).toEqual('13');
    expect(elemMaxDays.getAttribute('value')).toEqual('14');
    expect(elemMaxHours.getAttribute('value')).toEqual('15');
    expect(elemMaxMinutes.getAttribute('value')).toEqual('16');
    expect(elemActive.getAttribute('checked')).toEqual('true');
  });

  it('should allow edit of a selected location share ', function() {
    sharesList.all(by.model('share.selected')).first().click();
    expect(sharesList.all(by.model('share.selected')).first().getAttribute('checked').isSelected()).toBeTruthy();
    element(by.id('btn-edit')).click();
    expect(sharesList.all(by.tagName('td')).get(0).getText()).toEqual('Adam');
    expect(sharesList.all(by.tagName('td')).get(1).getText()).toEqual('11d 12h 13m');
    expect(sharesList.all(by.tagName('td')).get(2).getText()).toEqual('14d 15h 16m');
    expect(sharesList.all(by.tagName('td')).get(3).getText()).toEqual('\u2713');
    expect(elemNickname.getAttribute('disabled')).toEqual('true');
    expect(elemNickname.getAttribute('value')).toEqual('Adam');
    expect(elemRecentDays.getAttribute('value')).toEqual('11');
    expect(elemRecentHours.getAttribute('value')).toEqual('12');
    expect(elemRecentMinutes.getAttribute('value')).toEqual('13');
    expect(elemMaxDays.getAttribute('value')).toEqual('14');
    expect(elemMaxHours.getAttribute('value')).toEqual('15');
    expect(elemMaxMinutes.getAttribute('value')).toEqual('16');
    expect(elemActive.getAttribute('checked')).toEqual('true');
  });

  it('should clear the edit fields when the new button is clicked', function() {
    sharesList.all(by.model('share.selected')).first().click();
    element(by.id('btn-edit')).click();
    expect(elemNickname.getAttribute('disabled')).toEqual('true');
    element(by.id('btn-new')).click();
    expect(elemNickname.getAttribute('disabled')).toBeNull();
    expect(elemNickname.getAttribute('value')).toEqual('');
    expect(elemRecentDays.getAttribute('value')).toEqual('');
    expect(elemRecentHours.getAttribute('value')).toEqual('');
    expect(elemRecentMinutes.getAttribute('value')).toEqual('');
    expect(elemMaxDays.getAttribute('value')).toEqual('');
    expect(elemMaxHours.getAttribute('value')).toEqual('');
    expect(elemMaxMinutes.getAttribute('value')).toEqual('');
    expect(elemActive.getAttribute('checked')).toBeNull();
  });

  it('should show page navigation once the list is big enough', function() {
    var btnSave = element(by.id('btn-save')),
        btnNew = element(by.id('btn-new'));
    elemNickname.clear();
    elemNickname.sendKeys('Adam');
    btnSave.click();
    btnNew.click();
    elemNickname.sendKeys('Adam2');
    btnSave.click();
    btnNew.click();
    elemNickname.sendKeys('oswald');
    btnSave.click();
    btnNew.click();
    elemNickname.sendKeys('Fred');
    btnSave.click();
    btnNew.click();
    elemNickname.sendKeys('Jane');
    btnSave.click();
    btnNew.click();
    elemNickname.sendKeys('John');
    btnSave.click();
    btnNew.click();
    elemNickname.sendKeys('test2');
    btnSave.click();
    btnNew.click();
    elemNickname.sendKeys('Adam3');
    btnSave.click();
    btnNew.click();
    elemNickname.sendKeys('oswald4');
    btnSave.click();
    btnNew.click();
    elemNickname.sendKeys('oswald3');
    btnSave.click();
    btnNew.click();
    elemNickname.sendKeys('oswald2');
    btnSave.click();
    btnNew.click();
    elemNickname.sendKeys('oswald5');
    btnSave.click();
    browser.waitForAngular();
    // should have a full page now
    expect(sharesList.count()).toBe(10);
    expect(sharesList.first().all(by.tagName('td')).first().getText()).toEqual('Adam');
    expect(sharesList.last().all(by.tagName('td')).first().getText()).toEqual('oswald4');
    var lastPageLink = element(by.linkText('>>'));
    lastPageLink.click();
    // just one on the last page
    expect(sharesList.count()).toBe(2);
  });

  it('should select all checkboxes when the checkbox in the header is clicked', function() {
    var selectAllCheckbox = element(by.model('selectAllCheckbox'));
    selectAllCheckbox.click();
    for (var i = 0; i < pageCount; i++) {
      expect(sharesList.all(by.model('share.selected')).get(i).getAttribute('checked').isSelected()).toBeTruthy();
    }
  });

  it('should mark all selected nicknames as active when all have been selected', function() {
    element(by.id('btn-activate')).click();
    for (var i = 0; i < pageCount; i++) {
      expect(sharesList.all(by.binding('share.active')).get(i).getText()).toEqual(['true']);
    }
  });

  it('should mark all selected nicknames as inactive when all have been selected', function() {
    element(by.id('btn-deactivate')).click();
    for (var i = 0; i < pageCount; i++) {
      expect(sharesList.all(by.binding('share.active')).get(i).getText()).toEqual(['false']);
    }
  });

  it('should clear all checkboxes when the checkbox in the header is clicked again', function() {
    var selectAllCheckbox = element(by.model('selectAllCheckbox'));
    selectAllCheckbox.click();
    for (var i = 0; i < pageCount; i++) {
      expect(sharesList.all(by.model('share.selected')).get(i).getAttribute('checked').isSelected()).toBeFalsy();
    }
  });

  it('should show an error message if the nickname does not exist', function() {
    elemNickname.sendKeys('Test nickname one');
    elemButtonSave.click();
    expect(element(by.id('error-invalid-nickname')).isDisplayed()).toBeTruthy();
  });

  it('should show an error message when the nickname field is blank', function() {
    expect(element(by.id('error-nickname-required')).isDisplayed()).toBeFalsy();
    elemNickname.click();
    elemButtonSave.click();
    expect(element(by.id('error-nickname-required')).isDisplayed()).toBeTruthy();
  });

  it('should show an error message when clicking edit with more than one item selected', function() {
    element(by.model('selectAllCheckbox')).click();
    element(by.id('btn-edit')).click();
    expect(element(by.id('error-edit-only-one')).isDisplayed()).toBeTruthy();
  });

  it('should show and ', function() {
    sharesList.all(by.model('share.selected')).first().click();
  });

  it('should show an error message when invalid values are entered in the recent days field', function() {
    var elemError = element(by.id('error-recent-days-min'));
    expect(elemError.isDisplayed()).toBeFalsy();
    elemRecentDays.sendKeys('-9');
    elemButtonSave.click();
    if (browser.privateConfig.browserName !== 'safari') {
      expect(elemError.isDisplayed()).toBeTruthy();
    }
    elemRecentDays.clear();
    elemRecentDays.sendKeys('999999');
    expect(element(by.id('error-recent-days-max')).isDisplayed()).toBeTruthy();
    elemRecentDays.clear();
    elemRecentDays.sendKeys('99999');
    elemButtonSave.click();
    expect(elemError.isDisplayed()).toBeFalsy();
  });

  it('should show an error message when invalid values are entered in the recent hours field', function() {
    var elemError = element(by.id('error-recent-hours'));
    expect(elemError.isDisplayed()).toBeFalsy();
    elemRecentHours.sendKeys('-1');
    elemButtonSave.click();
    if (browser.privateConfig.browserName !== 'safari') {
      expect(elemError.isDisplayed()).toBeTruthy();
    }
    elemRecentHours.clear();
    elemRecentHours.sendKeys('0');
    expect(elemError.isDisplayed()).toBeFalsy();
    elemRecentHours.clear();
    elemRecentHours.sendKeys('23');
    expect(elemError.isDisplayed()).toBeFalsy();
    elemRecentHours.clear();
    elemRecentHours.sendKeys('24');
    elemButtonSave.click();
    expect(elemError.isDisplayed()).toBeTruthy();
  });

  it('should show an error message when invalid values are entered in the recent minutes field', function() {
    var elemError = element(by.id('error-recent-minutes'));
    expect(elemError.isDisplayed()).toBeFalsy();
    elemRecentMinutes.sendKeys('-1');
    elemButtonSave.click();
    if (browser.privateConfig.browserName !== 'safari') {
      expect(elemError.isDisplayed()).toBeTruthy();
    }
    elemRecentMinutes.clear();
    elemRecentMinutes.sendKeys('0');
    expect(elemError.isDisplayed()).toBeFalsy();
    elemRecentMinutes.clear();
    elemRecentMinutes.sendKeys('59');
    expect(elemError.isDisplayed()).toBeFalsy();
    elemRecentMinutes.clear();
    elemRecentMinutes.sendKeys('60');
    elemButtonSave.click();
    expect(elemError.isDisplayed()).toBeTruthy();
  });

  it('should show an error message when invalid values are entered in the maximum days field', function() {
    var elemError = element(by.id('error-max-days-min'));
    expect(elemError.isDisplayed()).toBeFalsy();
    elemMaxDays.sendKeys('-9');
    elemButtonSave.click();
    if (browser.privateConfig.browserName !== 'safari') {
      expect(elemError.isDisplayed()).toBeTruthy();
    }
    elemMaxDays.clear();
    elemMaxDays.sendKeys('99999');
    expect(elemError.isDisplayed()).toBeFalsy();
    elemMaxDays.clear();
    elemMaxDays.sendKeys('999999');
    expect(element(by.id('error-max-days-max')).isDisplayed()).toBeTruthy();
  });

  it('should show an error message when invalid values are entered in the maximum hours field', function() {
    var elemError = element(by.id('error-max-hours'));
    expect(elemError.isDisplayed()).toBeFalsy();
    elemMaxHours.sendKeys('-1');
    elemButtonSave.click();
    if (browser.privateConfig.browserName !== 'safari') {
      expect(elemError.isDisplayed()).toBeTruthy();
    }
    elemMaxHours.clear();
    elemMaxHours.sendKeys('0');
    expect(elemError.isDisplayed()).toBeFalsy();
    elemMaxHours.clear();
    elemMaxHours.sendKeys('23');
    expect(elemError.isDisplayed()).toBeFalsy();
    elemMaxHours.clear();
    elemMaxHours.sendKeys('24');
    elemButtonSave.click();
    expect(elemError.isDisplayed()).toBeTruthy();
  });

  it('should show an error message when invalid values are entered in the maximum minutes field', function() {
    var elemError = element(by.id('error-max-minutes'));
    expect(elemError.isDisplayed()).toBeFalsy();
    elemMaxMinutes.sendKeys('-1');
    elemButtonSave.click();
    if (browser.privateConfig.browserName !== 'safari') {
      expect(elemError.isDisplayed()).toBeTruthy();
    }
    elemMaxMinutes.clear();
    elemMaxMinutes.sendKeys('0');
    expect(elemError.isDisplayed()).toBeFalsy();
    elemMaxMinutes.clear();
    elemMaxMinutes.sendKeys('59');
    expect(elemError.isDisplayed()).toBeFalsy();
    elemMaxMinutes.clear();
    elemMaxMinutes.sendKeys('60');
    elemButtonSave.click();
    expect(elemError.isDisplayed()).toBeTruthy();
  });

  it('should delete all selected location shares when the delete button is clicked', function() {
    if (browser.privateConfig.browserName !== 'safari') {
      element(by.model('selectAllCheckbox')).click();
      element(by.id('btn-delete')).click();
      element(by.css('.confirm-button')).click();
      // element.all((by.css('.confirm-button'))).get(1).click();
      expect(sharesList.all(by.tagName('td')).first().getText()).toEqual('oswald5');
      // and just the one left
      expect(sharesList.count()).toBe(2);
      // once the list is empty...
      expect(element(by.id('div-paging')).isDisplayed()).toBeTruthy();
    }
  });

  it('should not display the location share list when there are no location shares', function() {
    if (browser.privateConfig.browserName !== 'safari') {
      expect(sharesList.count()).toBe(2);
      // sharesList.all(by.model('share.selected')).first().click();
      element(by.model('selectAllCheckbox')).click();
      element(by.id('btn-delete')).click();
      element(by.css('.confirm-button')).click();
      expect(element(by.id('div-paging')).isDisplayed()).toBeFalsy();
    }
  });

});
