module.exports = function(config){
  config.set({

    basePath : '../',

    browserDisconnectTimeout: 2000,
    browserNoActivityTimeout: 1200000,
    captureTimeout: 20000,
    listenAddress: '0.0.0.0',
    hostname: 'localhost',
    port: '9876',

    files : [
      'app/node_modules/angular/angular.js',
      'app/node_modules/angular-messages/angular-messages.js',
      'app/node_modules/angular-route/angular-route.js',
      'app/node_modules/angular-resource/angular-resource.js',
      'node_modules/angular-cookies/angular-cookies.js',
      'app/node_modules/angular-mocks/angular-mocks.js',
      'app/node_modules/angular-paging/dist/paging.js',
      'app/node_modules/angular-jwt/dist/angular-jwt.js',
      'app/node_modules/leaflet/dist/leaflet.js',
      'app/node_modules/leaflet-draw/dist/leaflet.draw.js',
      'app/node_modules/angular-simple-logger/dist/angular-simple-logger.min.js',
      'app/node_modules/ui-leaflet/dist/ui-leaflet.min.no-header.js',
      'app/node_modules/ui-leaflet-draw/dist/ui-leaflet-draw.js',
      'app/node_modules/angular-validation-match/dist/angular-validation-match.js',
      'app/node_modules/angular-animate/angular-animate.js',
      'app/node_modules/angular-sanitize/angular-sanitize.min.js',
      'app/node_modules/angular-ui-bootstrap/dist/ui-bootstrap.js',
      'app/node_modules/angular-bootstrap-confirm/dist/angular-bootstrap-confirm.min.js',
      'app/node_modules/socket.io-client/dist/socket.io.js',
      'app/node_modules/angular-socket-io/socket.js',
      'app/node_modules/angular-file-saver/dist/angular-file-saver.bundle.min.js',
      'app/node_modules/open-location-code/js/src/openlocationcode.min.js',
      'app/node_modules/proj4/dist/proj4.js',
      'app/node_modules/pagedown/Markdown.Converter.js',
      'app/node_modules/pagedown/Markdown.Sanitizer.js',
      'app/node_modules/pagedown/Markdown.Extra.js',
      'app/node_modules/pagedown/Markdown.Editor.js',
      'app/node_modules/angular-pagedown/angular-pagedown.js',
      'app/js/**/*.js',
      'test/unit/**/*.js'
    ],

    autoWatch : true,

    frameworks: ['jasmine'],

    _browsers: ['Chrome', 'Firefox', 'Safari'],
    _browsers: ['Chrome'],
    browsers: ['ChromeHeadless'],
    _browsers: ['Firefox'],
    _browsers: ['Safari'],

    logLevel: config.LOG_INFO,

    browserConsoleLogOptions: {
      level: 'debug',
      format: '%b [%T] %m',
      terminal: true
    },

    plugins : [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-safari-launcher',
            'karma-jasmine',
            'karma-junit-reporter'
            ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};
