var env = require('./environment.js'),
    helper = require('./helper.js');

exports.config = {
  allScriptsTimeout: 11000,

  specs: [
    'e2e/*.js'
  ],

  SELENIUM_PROMISE_MANAGER: true,

  getMultiCapabilities: function() {

    var chromeConfig = {
      'browserName': 'chrome',
      'chromeOptions': {
        'args': [ '--headless', '--disable-gpu', '--window-size=1024,1300' ],
        'prefs': {
          'download': {
            'prompt_for_download': false,
            'directory_upgrade': true,
            'default_directory': env.tmpDir + '/chrome'
          }
        }
      }
    };

    var firefoxConfig = {
      'browserName': 'firefox',
      'moz:firefoxOptions': {
        // 'args': [ '--headless' ],
        'prefs': {
          'browser.download.folderList': 2,
          'browser.download.manager.showWhenStarting': false,
          'browser.download.useDownloadDir': true,
          'browser.download.dir': env.tmpDir + '/firefox',
          'browser.helperApps.neverAsk.saveToDisk': 'application/octet-stream,application/gpx+xml,application/x-yaml'
        }
      }
    };

    var safariConfig = {
      'browserName': 'safari'
    };

    return [
      // safariConfig,
      // firefoxConfig,
      chromeConfig
    ];
  },

  maxSessions: 1,

  baseUrl: env.baseUrl,

  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  },

  onPrepare: function() {
    browser.privateConfig = {
      takeScreenshots: false
    };
    browser.getCapabilities().then(function (caps) {
      browser.privateConfig.tmpDir = env.tmpDir;
      browser.privateConfig.browserName = caps.get('browserName');
      // Sometimes, the above call returns the browser name with a capitalised first letter
      if (browser.privateConfig.browserName == 'Safari') {
        browser.privateConfig.browserName = 'safari';
      }
      if (browser.privateConfig.browserName == 'safari') {

        // Safari sometimes fails before logging in
        helper.wait(400);
        // See https://github.com/angular/protractor/issues/2643
        browser.waitForAngularEnabled(false);

        // See
        // - https://github.com/angular/protractor/issues/4874
        // - https://github.com/angular/protractor/issues/5364
        // - https://github.com/angular/protractor/issues/5434
        // browser.ignoreSynchronization = true;  // Doesn't seem to solve failure to WaitForAngular in Safari

        // Window needs to big enough for all items used in tests to be visible
        browser.driver.manage().window().setPosition(0, 0);
        browser.driver.manage().window().setSize(1024, 1300);
        helper.wait(800);

      }
      browser.privateConfig.baseUrl = env.baseUrl;
      browser.privateConfig.testAdminUser = env.testAdminUser;
      browser.privateConfig.testUserPassword = env.testUserPassword;
      browser.privateConfig.testUser = env.testUser;
      browser.privateConfig.testAdminUserPassword = env.testAdminUserPassword;
      browser.get(env.baseUrl + '/login');
      browser.findElement(by.id('input-email')).sendKeys(env.testUser);
      browser.findElement(by.id('input-password')).sendKeys(env.testUserPassword);
      browser.findElement(by.id('btn-submit')).click();
    });
    // See https://github.com/angular/protractor/issues/2643
    browser.waitForAngularEnabled(true);
    // Chrome fails if the following call isn't made at this point
    browser.waitForAngular();
  }

};
