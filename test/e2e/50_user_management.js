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

describe('User management', function() {

  var EC = protractor.ExpectedConditions;
  var elemNickname, elemUsername, elemPassword, elemPassword2,
      elemFirstname, elemLastname, elemButtonSubmit, adminLoggedIn,
      userListElem;
  var testUserEmail = 'test@trip.test';
  var testUser1 = {
    id: 670,
    nickname: 'test',
    email: testUserEmail,
    firstname: 'John',
    lastname: 'Smith'
  };
  var testUser2 = {
    id: 670,
    nickname: 'user2',
    email: 'user2@trip.test',
    firstname: 'James',
    lastname: 'Jones'
  };
  var testUser3 = {
    id: 456,
    nickname: 'purple',
    email: 'purple@trip.test',
    firstname: 'purple',
    lastname: 'purple'
  };

  var adminLogin = function() {
    browser.get(browser.baseUrl + '/logout');
    browser.waitForAngular();
    browser.get(browser.baseUrl + '/login');
    browser.findElement(by.id('input-email')).sendKeys(browser.privateConfig.testAdminUser);
    browser.findElement(by.id('input-password')).sendKeys(browser.privateConfig.testAdminUserPassword);
    browser.findElement(by.id('btn-submit')).click();
    browser.waitForAngular();
  };

  beforeEach(function() {
    if (!adminLoggedIn) {
      adminLogin();
      adminLoggedIn = true;
    }
  });

  describe('User search page', function() {

    beforeEach(function() {
      browser.get(browser.baseUrl + '/users');
    });

    describe('Create new user', function() {

      beforeEach(function() {
        element(by.id('btn-new')).click();
        elemNickname = element(by.model('data.nickname'));
        elemUsername = element(by.model('data.username'));
        elemPassword = element(by.model('data.password'));
        elemPassword2 = element(by.model('data.password2'));
        elemFirstname = element(by.model('data.firstname'));
        elemLastname = element(by.model('data.lastname'));
        elemButtonSubmit = element(by.id('btn-submit'));
      });

      it('should show an error when the passwords do not match', function() {
        elemNickname.sendKeys('smithy');
        elemUsername.sendKeys('smithy@trip.test');
        elemPassword.sendKeys('secret');
        elemPassword2.sendKeys('Secret');
        elemFirstname.sendKeys('John');
        elemLastname.sendKeys('Smith');
        expect(element(by.id('error-password-match')).isDisplayed()).toBeFalsy();
        elemButtonSubmit.click();
        expect(element(by.id('error-password-match')).isDisplayed()).toBeTruthy();
      });

      it('should show an error when nickname is blank', function() {
        expect(element(by.id('error-nickname-required')).isDisplayed()).toBeFalsy();
        elemButtonSubmit.click();
        expect(element(by.id('error-password-match')).isDisplayed()).toBeFalsy();
        expect(element(by.id('error-nickname-required')).isDisplayed()).toBeTruthy();
      });

      it('should show an error when email is blank', function() {
        expect(element(by.id('error-email-required')).isDisplayed()).toBeFalsy();
        elemButtonSubmit.click();
        expect(element(by.id('error-email-required')).isDisplayed()).toBeTruthy();
      });

      it('should show an error when email is invalid', function() {
        expect(element(by.id('error-email-required')).isDisplayed()).toBeFalsy();
        expect(element(by.id('error-email-invalid')).isDisplayed()).toBeFalsy();
        elemUsername.sendKeys('smith');
        elemButtonSubmit.click();
        expect(element(by.id('error-email-required')).isDisplayed()).toBeFalsy();
        expect(element(by.id('error-email-invalid')).isDisplayed()).toBeTruthy();
      });

      it('should show an error when password is blank', function() {
        expect(element(by.id('error-password-required')).isDisplayed()).toBeFalsy();
        elemButtonSubmit.click();
        expect(element(by.id('error-password-required')).isDisplayed()).toBeTruthy();
      });

      it('should show an error when the password confirmation is blank', function() {
        expect(element(by.id('error-password2-required')).isDisplayed()).toBeFalsy();
        elemButtonSubmit.click();
        expect(element(by.id('error-password2-required')).isDisplayed()).toBeTruthy();
      });

      it('should show an error when firstname is blank', function() {
        expect(element(by.id('error-firstname-required')).isDisplayed()).toBeFalsy();
        elemButtonSubmit.click();
        expect(element(by.id('error-firstname-required')).isDisplayed()).toBeTruthy();
      });

      it('should show an error when lastname is blank', function() {
        expect(element(by.id('error-lastname-required')).isDisplayed()).toBeFalsy();
        elemButtonSubmit.click();
        expect(element(by.id('error-lastname-required')).isDisplayed()).toBeTruthy();
      });

      it('should display an error message if the back-end returns an error', function() {
        // chrome and safari won't let us type in the invalid character
        if (browser.privateConfig.browserName !== 'chrome' && browser.privateConfig.browserName !== 'safari' ) {
          // invalid nickname
          elemNickname.sendKeys('smi\u0007thy');
          elemUsername.sendKeys('smithy2@trip.test');
          elemPassword.sendKeys('secret');
          elemPassword2.sendKeys('secret');
          elemFirstname.sendKeys('John');
          elemLastname.sendKeys('Smith');
          elemButtonSubmit.click();
          expect(element(by.id('ajax-error')).isDisplayed()).toBeTruthy();
        }
      });

      it('should display an error message if the e-mail address exists', function() {
        elemNickname.sendKeys('qwerty-man');
        elemUsername.sendKeys('test@trip.test');
        elemPassword.sendKeys('secret');
        elemPassword2.sendKeys('secret');
        elemFirstname.sendKeys('John');
        elemLastname.sendKeys('Smith');
        elemButtonSubmit.click();
        expect(element(by.id('bad-request')).isDisplayed()).toBeTruthy();
      });

      it('should display an error message if the nickname exists', function() {
        elemNickname.sendKeys('test');
        elemUsername.sendKeys('qwerty.man@trip.test');
        elemPassword.sendKeys('secret');
        elemPassword2.sendKeys('secret');
        elemFirstname.sendKeys('John');
        elemLastname.sendKeys('Smith');
        elemButtonSubmit.click();
        expect(element(by.id('bad-request')).isDisplayed()).toBeTruthy();
      });

      it('should not allow a non-admin user to create a user', function() {
        // Logout and log back in as the test user without admin rights
        browser.get(browser.baseUrl + '/logout');
        browser.waitForAngular();
        browser.get(browser.privateConfig.baseUrl + '/login');
        browser.findElement(by.id('input-email')).sendKeys(browser.privateConfig.testUser);
        browser.findElement(by.id('input-password')).sendKeys(browser.privateConfig.testUserPassword);
        browser.findElement(by.id('btn-submit')).click();
        browser.waitForAngular();
        // Start the test
        browser.get(browser.baseUrl + '/users');
        element(by.id('btn-new')).click();
        elemNickname.sendKeys('x4g48');
        elemUsername.sendKeys('x4g48@trip.test');
        elemPassword.sendKeys('secret');
        elemPassword2.sendKeys('secret');
        elemFirstname.sendKeys('John');
        elemLastname.sendKeys('Smith');
        elemButtonSubmit.click();
        expect(element(by.id('ajax-error')).isDisplayed()).toBeTruthy();
        adminLogin();
      });

      // Note that this test relies on a delete test
      // Search comments for CREATE_AND_DELETE_USER
      it('should create a new user', function() {
        // Safari can't handle the delete method, so best not create a user
        if (browser.privateConfig.browserName !== 'safari') {
          elemNickname.sendKeys('smithy');
          elemUsername.sendKeys('smithy@trip.test');
          elemPassword.sendKeys('secret');
          elemPassword2.sendKeys('secret');
          elemFirstname.sendKeys('John');
          elemLastname.sendKeys('Smith');
          elemButtonSubmit.click();
          // waitForAngular() doesn't seem sufficient for Safari & Chrome drivers
          browser.waitForAngular();
          // so wait for search button to be visible
          browser.wait(
            EC.visibilityOf(
              element(by.id('btn-search'))),
              5000,
              'Search button should be visible within 5 seconds');
        }
      });

    });

    describe('Searching', function() {

      beforeEach(function() {
        userListElem = element.all(by.repeater('user in users.payload'));
      });

      describe('by default list all users', function() {

        it('should find all users', function() {
          element(by.id('btn-search')).click();
          // Should be more than a page full
          expect(userListElem.count()).toBe(10);
          // waitForAngular() doesn't seem sufficient for Safari driver
          browser.waitForAngular();
          // so wait for elements to be visible
          var conditionPage2LinkVisible = EC.visibilityOf(element(by.linkText('2')));
          var conditionLastPageLinkVisible = EC.visibilityOf(element(by.linkText('>>')));
          browser.wait(EC.and(conditionPage2LinkVisible, conditionLastPageLinkVisible),
                       5000,
                       'Paging elements should be visible within 5 seconds');
          expect(element(by.linkText('2')).isDisplayed()).toBeTruthy();
          element(by.linkText('2')).click();
          expect(userListElem.count()).toBeGreaterThan(1);
        });

      });

      describe('exact match', function() {

        beforeEach(function() {
          element(by.id('radio-exact-match')).click();
        });

        describe('by email', function() {

          beforeEach(function() {
            element(by.id('radio-email')).click();
          });

          it('should find the user by email with exact match', function() {
            element(by.model('search.email')).sendKeys(testUserEmail);
            element(by.id('btn-search')).click();
            expect(userListElem.count()).toBe(1);
          });

          it('should fail to find a non-existent user by email with exact match', function() {
            element(by.model('search.email')).sendKeys('zebra');
            element(by.id('btn-search')).click();
            expect(userListElem.count()).toBe(0);
            expect(element(by.id('no-users-found')).isDisplayed()).toBeTruthy();
          });

        });

        describe('by nickname', function() {

          beforeEach(function() {
            element(by.id('radio-nickname')).click();
          });

          it('should find the user by nickname with exact match', function() {
            element(by.model('search.nickname')).sendKeys('Adam');
            element(by.id('btn-search')).click();
            expect(userListElem.count()).toBe(1);
          });

          it('should fail to find a non-existent user by nickname with exact match', function() {
            element(by.model('search.nickname')).sendKeys('secr');
            element(by.id('btn-search')).click();
            expect(userListElem.count()).toBe(0);
            expect(element(by.id('no-users-found')).isDisplayed()).toBeTruthy();
          });

          it('should by nickname exact match after previously finding all users', function() {
            // This test proved a bug where the page offset was set to 10 causing the
            // the search to bring back an empty second page
            element(by.id('btn-search')).click();
            // Should be more than a page full
            expect(userListElem.count()).toBe(10);
            // waitForAngular() doesn't seem sufficient for Safari driver
            browser.waitForAngular();
            // so wait for elements to be visible
            var conditionPage2LinkVisible = EC.visibilityOf(element(by.linkText('2')));
            var conditionLastPageLinkVisible = EC.visibilityOf(element(by.linkText('>>')));
            browser.wait(EC.and(conditionPage2LinkVisible, conditionLastPageLinkVisible),
                         5000,
                         'Paging elements should be visible within 5 seconds');
            expect(element(by.linkText('2')).isDisplayed()).toBeTruthy();
            element(by.linkText('2')).click();
            expect(userListElem.count()).toBeGreaterThan(1);
            element(by.model('search.nickname')).sendKeys('Adam');
            element(by.id('btn-search')).click();
            expect(userListElem.count()).toBe(1);
          });

        });

      });

      describe('partial match', function() {

        beforeEach(function() {
          element(by.id('radio-partial-match')).click();
        });

        describe('by email', function() {

          beforeEach(function() {
            element(by.id('radio-email')).click();
          });

          it('should find the user by email with partial match', function() {
            element(by.model('search.email')).sendKeys(testUserEmail);
            element(by.id('btn-search')).click();
            expect(userListElem.count()).toBe(1);
          });

          it('should find the user by email with partial match', function() {
            element(by.model('search.email')).sendKeys('@trip');
            element(by.id('btn-search')).click();
            expect(userListElem.count()).toBeGreaterThan(1);
          });

          it('should fail to find a non-existent user by email with partial match', function() {
            element(by.model('search.email')).sendKeys('I doubt it\'ll find this');
            element(by.id('btn-search')).click();
            expect(userListElem.count()).toBe(0);
            expect(element(by.id('no-users-found')).isDisplayed()).toBeTruthy();
          });

        });

        describe('by nickname', function() {

          beforeEach(function() {
            element(by.id('radio-nickname')).click();
          });

          it('should find the user by nickname with partial match', function() {
            element(by.model('search.nickname')).sendKeys('Adam3');
            element(by.id('btn-search')).click();
            expect(userListElem.count()).toBe(1);
          });

          it('should find many users by nickname with partial match', function() {
            element(by.model('search.nickname')).sendKeys('Adam');
            element(by.id('btn-search')).click();
            expect(userListElem.count()).toBeGreaterThan(1);
          });

          it('should fail to find a non-existent user by nickname with partial match', function() {
            element(by.model('search.nickname')).sendKeys('I doubt it\'ll find this');
            element(by.id('btn-search')).click();
            expect(userListElem.count()).toBe(0);
            expect(element(by.id('no-users-found')).isDisplayed()).toBeTruthy();
          });

        });

      });

    });

    describe('Options multiple selected users', function() {

      beforeEach(function() {
        element(by.id('radio-email')).click();
        element(by.model('search.email')).sendKeys('@trip.test');
        element(by.id('radio-partial-match')).click();
        element(by.id('btn-search')).click();
        userListElem = element.all(by.repeater('user in users.payload'));
      });

      describe('Multiple users selected', function() {

        beforeEach(function() {
          userListElem.all(by.model('user.selected')).first().click();
          userListElem.all(by.model('user.selected')).get(1).click();
        });

        it('should not allow delete of multiple users', function() {
          element(by.id('btn-delete')).click();
          element.all((by.css('.confirm-button'))).get(0).click();
          expect(element(by.id('error-edit-only-one')).isDisplayed()).toBeTruthy();
        });

        it('should not allow edit of multiple users', function() {
          element(by.id('btn-edit')).click();
          expect(element(by.id('error-edit-only-one')).isDisplayed()).toBeTruthy();
        });

        it('should not allow a password reset for multiple users', function() {
          element(by.id('btn-edit-password')).click();
          expect(element(by.id('error-edit-only-one')).isDisplayed()).toBeTruthy();
        });

      });

    });

    describe('Options with one selected users', function() {

      beforeEach(function() {
        element(by.id('radio-nickname')).click();
        element(by.model('search.nickname')).sendKeys('test');
        element(by.id('radio-exact-match')).click();
        element(by.id('btn-search')).click();
        userListElem = element.all(by.repeater('user in users.payload'));
      });

      describe('Single user selected', function() {

        beforeEach(function() {
          userListElem.all(by.model('user.selected')).first().click();
        });

        it('should allow edit of a single user', function() {
          element(by.id('btn-edit')).click();
          expect(browser.getCurrentUrl()).toMatch(/\/edit-user\?id=[\d]+$/);
        });

        it('should allow a password reset for a single user', function() {
          element(by.id('btn-edit-password')).click();
          expect(browser.getCurrentUrl()).toMatch(/\/admin-password-reset\?id=[\d]+$/);
        });

      });

    });

    describe('Delete user', function() {

      beforeEach(function() {
        element(by.id('radio-nickname')).click();
        element(by.model('search.nickname')).sendKeys('smithy');
        element(by.id('radio-exact-match')).click();
        element(by.id('btn-search')).click();
        // We will have skipped creating the user in safari
        // TODO Change to test whether userListElem has any elements
        if (browser.privateConfig.browserName !== 'safari') {
          userListElem = element.all(by.repeater('user in users.payload'));
          userListElem.all(by.model('user.selected')).first().click();
        }
      });

      // Note this test relies on a create test running before this one
      // Search comments for CREATE_AND_DELETE_USER
      it('should allow deleting a single user', function() {
        if (browser.privateConfig.browserName !== 'safari') {
          element(by.id('btn-delete')).click();
          element.all((by.css('.confirm-button'))).get(0).click();
        }
      });

    });

  });

  describe('Edit user', function() {

    function clearUserEditForm() {
      element(by.model('data.nickname')).clear();
      element(by.model('data.email')).clear();
      element(by.model('data.firstname')).clear();
      element(by.model('data.lastname')).clear();
    }

    function fillInUserEditForm(user) {
      clearUserEditForm();
      element(by.model('data.nickname')).sendKeys(user.nickname);
      element(by.model('data.email')).sendKeys(user.email);
      element(by.model('data.firstname')).sendKeys(user.firstname);
      element(by.model('data.lastname')).sendKeys(user.lastname);
    }

    describe('Save changes', function() {

      beforeEach(function() {
        browser.get(browser.baseUrl + '/edit-user?id=' + testUser1.id);
        browser.wait(
          EC.visibilityOf(
            element(by.id('btn-submit'))),
          5000,
          'Save button should be visible within 5 seconds');
      });

      describe('Validation and error messages', function() {

        beforeEach(function() {
          clearUserEditForm();
          elemNickname = element(by.model('data.nickname'));
          elemUsername = element(by.model('data.email'));
          elemFirstname = element(by.model('data.firstname'));
          elemLastname = element(by.model('data.lastname'));
          elemButtonSubmit = element(by.id('btn-submit'));
        });

        it('should show an error when nickname is blank', function() {
          expect(element(by.id('error-nickname-required')).isDisplayed()).toBeFalsy();
          elemButtonSubmit.click();
          expect(element(by.id('error-nickname-required')).isDisplayed()).toBeTruthy();
        });

        it('should show an error when email is blank', function() {
          expect(element(by.id('error-email-required')).isDisplayed()).toBeFalsy();
          elemButtonSubmit.click();
          expect(element(by.id('error-email-required')).isDisplayed()).toBeTruthy();
        });

        it('should show an error when email is invalid', function() {
          expect(element(by.id('error-email-required')).isDisplayed()).toBeFalsy();
          expect(element(by.id('error-email-invalid')).isDisplayed()).toBeFalsy();
          elemUsername.sendKeys('smith');
          elemButtonSubmit.click();
          expect(element(by.id('error-email-required')).isDisplayed()).toBeFalsy();
          expect(element(by.id('error-email-invalid')).isDisplayed()).toBeTruthy();
        });

        it('should show an error when firstname is blank', function() {
          expect(element(by.id('error-firstname-required')).isDisplayed()).toBeFalsy();
          elemButtonSubmit.click();
          expect(element(by.id('error-firstname-required')).isDisplayed()).toBeTruthy();
        });

        it('should show an error when lastname is blank', function() {
          expect(element(by.id('error-lastname-required')).isDisplayed()).toBeFalsy();
          elemButtonSubmit.click();
          expect(element(by.id('error-lastname-required')).isDisplayed()).toBeTruthy();
        });

        it('should display an error message if the back-end returns an error', function() {
          // chrome and safari won't let us type in the invalid character
          if (browser.privateConfig.browserName !== 'chrome' && browser.privateConfig.browserName !== 'safari' ) {
            // invalid nickname
            elemNickname.sendKeys('smi\u0007thy');
            elemUsername.sendKeys('smithy2@trip.test');
            elemFirstname.sendKeys('John');
            elemLastname.sendKeys('Smith');
            elemButtonSubmit.click();
            expect(element(by.id('ajax-error')).isDisplayed()).toBeTruthy();
          }
        });

      });

      describe('update user details test', function() {

        beforeEach(function() {
          fillInUserEditForm(testUser2);
          element(by.id('btn-submit')).click();
        });

        it('should display the user search page', function() {
          expect(browser.getCurrentUrl()).toMatch(/\/users$/);
        });

      });

      describe('after the user details have been modified', function() {

        it('should have updated all the values', function() {
          expect(element(by.model('data.nickname')).getAttribute('value')).toEqual(testUser2.nickname);
          expect(element(by.model('data.email')).getAttribute('value')).toEqual(testUser2.email);
          expect(element(by.model('data.firstname')).getAttribute('value')).toEqual(testUser2.firstname);
          expect(element(by.model('data.lastname')).getAttribute('value')).toEqual(testUser2.lastname);
        });

      });

      describe('reverse the user detail changes', function() {

        beforeEach(function() {
          fillInUserEditForm(testUser1);
          element(by.id('btn-submit')).click();
        });

        it('should display the user search page', function() {
          expect(browser.getCurrentUrl()).toMatch(/\/users$/);
        });

      });

      describe('after the user details have been restored to the original values', function() {

        it('should have reverted all the values', function() {
          expect(element(by.model('data.nickname')).getAttribute('value')).toEqual(testUser1.nickname);
          expect(element(by.model('data.email')).getAttribute('value')).toEqual(testUser1.email);
          expect(element(by.model('data.firstname')).getAttribute('value')).toEqual(testUser1.firstname);
          expect(element(by.model('data.lastname')).getAttribute('value')).toEqual(testUser1.lastname);
        });

      });

      describe('reset changes', function() {

        it('should do nothing if the form is not dirty', function() {
          element(by.id('btn-reset')).click();
          expect(element(by.model('data.nickname')).getAttribute('value')).toEqual(testUser1.nickname);
          expect(element(by.model('data.email')).getAttribute('value')).toEqual(testUser1.email);
          expect(element(by.model('data.firstname')).getAttribute('value')).toEqual(testUser1.firstname);
          expect(element(by.model('data.lastname')).getAttribute('value')).toEqual(testUser1.lastname);
        });

        describe('form is dirty', function() {

          beforeEach(function() {
            fillInUserEditForm(testUser2);
          });

          it('should reset all the values if the alert is accepted', function() {
            if (browser.privateConfig.browserName !== 'safari') {
              element(by.id('btn-reset')).click();
              element.all((by.css('.confirm-button'))).get(1).click();
              expect(element(by.model('data.nickname')).getAttribute('value')).toEqual(testUser1.nickname);
              expect(element(by.model('data.email')).getAttribute('value')).toEqual(testUser1.email);
              expect(element(by.model('data.firstname')).getAttribute('value')).toEqual(testUser1.firstname);
              expect(element(by.model('data.lastname')).getAttribute('value')).toEqual(testUser1.lastname);
            }
          });

          it('should NOT reset all the values if the alert is dismissed', function() {
            if (browser.privateConfig.browserName !== 'safari') {
              element(by.id('btn-reset')).click();
              element.all((by.css('.cancel-button'))).get(1).click();
              expect(element(by.model('data.nickname')).getAttribute('value')).toEqual(testUser2.nickname);
              expect(element(by.model('data.email')).getAttribute('value')).toEqual(testUser2.email);
              expect(element(by.model('data.firstname')).getAttribute('value')).toEqual(testUser2.firstname);
              expect(element(by.model('data.lastname')).getAttribute('value')).toEqual(testUser2.lastname);
            }
          });

        });

      });

      describe('Admin role', function() {
        var elemAdmin;

        beforeEach(function() {
          elemAdmin = element(by.model('data.admin'));
        });

        describe('set role', function() {

          it('should set the role', function() {
            elemAdmin.isSelected().then(function(selected) {
              if (!selected) {
                elemAdmin.click();
              }
              element(by.id('btn-submit')).click();
            });
          });

          it('the role should now be set', function() {
          browser.wait(
            EC.visibilityOf(
              element(by.model('data.admin'))),
              5000,
              'Admin checkbox should be visible within 5 seconds');
            expect(elemAdmin.getAttribute('checked').isSelected()).toBeTruthy();
          });

        });

        describe('clear role', function() {

          it('should clear the role', function() {
            elemAdmin.isSelected().then(function(selected) {
              if (selected) {
                elemAdmin.click();
                element(by.id('btn-submit')).click();
              }
            });
          });

          it('the role should not now be set', function() {
            browser.wait(
              EC.visibilityOf(
                element(by.model('data.admin'))),
              5000,
              'Admin checkbox should be visible within 5 seconds');
            expect(elemAdmin.getAttribute('checked').isSelected()).toBeFalsy();
          });

        });

      });

    });

    describe('Cancel edit user', function() {

      beforeEach(function() {
        browser.get(browser.baseUrl + '/edit-user?id=' + testUser3.id);
      });

      describe('Form not altered', function() {

        beforeEach(function() {
          element(by.id('btn-cancel')).click();
          element.all((by.css('.confirm-button'))).get(0).click();
        });

        it('should display the user search page', function() {
          expect(browser.getCurrentUrl()).toMatch(/\/users$/);
        });

      });

      describe('Form altered', function() {

        beforeEach(function() {
          if (browser.privateConfig.browserName !== 'safari') {
            fillInUserEditForm(testUser2);
            element(by.id('btn-cancel')).click();
            element.all((by.css('.confirm-button'))).get(0).click();
          }
        });

        it('should display the user search page', function() {
          if (browser.privateConfig.browserName !== 'safari') {
            expect(browser.getCurrentUrl()).toMatch(/\/users$/);
          }
        });

      });

      describe('after cancelling user detail changes', function() {

        it('should NOT have changed any values', function() {
          expect(element(by.model('data.nickname')).getAttribute('value')).toEqual(testUser3.nickname);
          expect(element(by.model('data.email')).getAttribute('value')).toEqual(testUser3.email);
          expect(element(by.model('data.firstname')).getAttribute('value')).toEqual(testUser3.firstname);
          expect(element(by.model('data.lastname')).getAttribute('value')).toEqual(testUser3.lastname);
        });

      });

    });

    describe('after the update has been cancelled', function() {

      it('should NOT have changed any values', function() {
        expect(element(by.model('data.nickname')).getAttribute('value')).toEqual(testUser3.nickname);
        expect(element(by.model('data.email')).getAttribute('value')).toEqual(testUser3.email);
        expect(element(by.model('data.firstname')).getAttribute('value')).toEqual(testUser3.firstname);
        expect(element(by.model('data.lastname')).getAttribute('value')).toEqual(testUser3.lastname);
      });

    });

  });

  describe('Reset password', function() {

    beforeEach(function() {
      browser.get(browser.baseUrl + '/admin-password-reset?id=' + testUser1.id);
    });

    it('should display error messages for mandatory fields', function() {
      expect(element(by.model('data.password')).isDisplayed()).toBeTruthy();
      element(by.id('btn-submit')).click();
      expect(element(by.id('error-password-required')).isDisplayed()).toBeTruthy();
      expect(element(by.id('error-password2-required')).isDisplayed()).toBeTruthy();
    });

    it('should display an error message if the passwords do not match', function() {
      element(by.model('data.password')).sendKeys('testOne');
      element(by.model('data.password2')).sendKeys('testone');
      element(by.id('btn-submit')).click();
      expect(element(by.id('error-password-match')).isDisplayed()).toBeTruthy();
    });

    it('should display submit the form successfully if the passwords match', function() {
      element(by.model('data.password')).sendKeys('testTwo');
      element(by.model('data.password2')).sendKeys('testTwo');
      element(by.id('btn-submit')).click();
      expect(browser.getCurrentUrl()).toMatch(/\/users$/);
    });

    it('should not submit the form when cancelled', function() {
      element(by.id('btn-cancel')).click();
      element.all((by.css('.confirm-button'))).get(0).click();
      expect(browser.getCurrentUrl()).toMatch(/\/users$/);
    });

  });

  describe('System status', function() {

    beforeEach(function() {
      browser.get(browser.baseUrl + '/status');
    });

    it('should display the system status page', function() {
      expect(browser.getCurrentUrl()).toMatch(/\/status$/);
      expect(element(by.id('tile-usage')).isDisplayed()).toBeTruthy();
    });

  });

});
