var env = require('./environment.js');
var q = require('q');
var FirefoxProfile = require('firefox-profile');

exports.getBrowserProfiles = function() {
  var deferred = q.defer();
  var firefoxProfile = new FirefoxProfile();
  firefoxProfile.setPreference("browser.download.folderList", 2);
  firefoxProfile.setPreference("browser.download.manager.showWhenStarting", false);
  firefoxProfile.setPreference("browser.download.dir", env.tmpDir + '/firefox');
  firefoxProfile.setPreference("browser.helperApps.neverAsk.saveToDisk", "application/octet-stream,application/gpx+xml");

  firefoxProfile.encoded(function(encodedProfile) {
    var multiCapabilities = [/*{
      browserName: 'safari'
    }, */{
      'browserName': 'chrome',
      'chromeOptions': {
        prefs: {
          'download': {
            'prompt_for_download': false,
            'directory_upgrade': true,
            'default_directory': env.tmpDir + '/chrome'
          }
        }
      }
    }/*, {
      browserName: 'firefox',
      firefox_profile : encodedProfile
    }*/];
    deferred.resolve(multiCapabilities);
  });
  return deferred.promise;
};

exports.config = {
  allScriptsTimeout: 11000,

  specs: [
    'e2e/*.js'
  ],

  SELENIUM_PROMISE_MANAGER: true,

  getMultiCapabilities: exports.getBrowserProfiles,

  maxSessions: 1,

  baseUrl: env.baseUrl,

  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  },

  onPrepare: function() {
    browser.privateConfig = {};
    browser.getCapabilities().then(function (caps) {
      browser.privateConfig.tmpDir = env.tmpDir;
      browser.privateConfig.browserName = caps.get('browserName');
    });
    browser.privateConfig.baseUrl = env.baseUrl;
    browser.privateConfig.testAdminUser = env.testAdminUser;
    browser.privateConfig.testUserPassword = env.testUserPassword;
    browser.privateConfig.testUser = env.testUser;
    browser.privateConfig.testAdminUserPassword = env.testAdminUserPassword;
    browser.get(env.baseUrl + '/login');
    browser.findElement(by.id('input-email')).sendKeys(env.testUser);
    browser.findElement(by.id('input-password')).sendKeys(env.testUserPassword);
    browser.findElement(by.id('btn-submit')).click();
    browser.waitForAngular();
  }

};
