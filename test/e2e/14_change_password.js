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

describe('Change Password', function() {

  beforeEach(function() {
    browser.get(browser.baseUrl + '/change-password');
  });

  it('should display the password change form', function() {
    expect(browser.getCurrentUrl()).toMatch(/\/change-password$/);
  });

  it('should redirect to the account page when cancelled', function() {
    element(by.id('btn-cancel')).click();
    element.all((by.css('.confirm-button'))).get(0).click();
    expect(browser.getCurrentUrl()).toMatch(/\/account$/);
  });

  it('should display an error message if the current password is not entered', function() {
    element(by.id('new-password')).sendKeys('this_is_a_strong_password');
    element(by.id('btn-submit')).click();
    expect(element(by.id('error-current-password-required')).isDisplayed()).toBeTruthy();
    expect(element(by.id('error-password-required')).isDisplayed()).toBeFalsy();
    expect(element(by.id('error-password2-required')).isDisplayed()).toBeTruthy();
  });

  it('should show an error if the new passwords do not match', function() {
    element(by.id('current-password')).sendKeys('does not matter what this is');
    element(by.id('new-password')).sendKeys('this_is_a_strong_password');
    element(by.id('new-password2')).sendKeys('two');
    element(by.id('btn-submit')).click();
    expect(element(by.id('error-password-match')).isDisplayed()).toBeTruthy();
  });

  it('should redirect to the account page and show a success message', function() {
    element(by.id('current-password')).sendKeys(browser.privateConfig.testUserPassword);
    element(by.id('new-password')).sendKeys(browser.privateConfig.testUserPassword);
    element(by.id('new-password2')).sendKeys(browser.privateConfig.testUserPassword);
    element(by.id('btn-submit')).click();
    expect(browser.getCurrentUrl()).toMatch(/\/account$/);
    expect(element(by.id('info-message')).isDisplayed()).toBeTruthy();
  });

  it('should show a failure message when the current password is incorrect', function() {
    element(by.id('current-password')).sendKeys('wrong-secret');
    element(by.id('new-password')).sendKeys('this_is_a_strong_password');
    element(by.id('new-password2')).sendKeys('this_is_a_strong_password');
    element(by.id('btn-submit')).click();
    expect(browser.getCurrentUrl()).toMatch(/\/change-password$/);
    expect(element(by.id('bad-request')).isDisplayed()).toBeTruthy();
  });

});
