module.exports = function(config){
  config.set({

    basePath : '../',

    files : [
      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-messages/angular-messages.js',
      'app/bower_components/angular-route/angular-route.js',
      'app/bower_components/angular-resource/angular-resource.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      'app/bower_components/angular-paging/dist/paging.js',
      'app/bower_components/angular-jwt/dist/angular-jwt.js',
      'app/bower_components/leaflet/dist/leaflet.js',
      'app/bower_components/leaflet-draw/dist/leaflet.draw.js',
      'app/bower_components/angular-simple-logger/dist/angular-simple-logger.min.js',
      'app/bower_components/ui-leaflet/dist/ui-leaflet.min.no-header.js',
      'app/bower_components/ui-leaflet-draw/dist/ui-leaflet-draw.js',
      'app/bower_components/angular-validation-match/dist/angular-validation-match.js',
      'app/bower_components/angular-animate/angular-animate.js',
      'app/bower_components/angular-bootstrap/ui-bootstrap.min.js',
      'app/bower_components/socket.io-client/dist/socket.io.min.js',
      'app/bower_components/angular-socket-io/socket.js',
      'app/bower_components/angular-file-saver/dist/angular-file-saver.bundle.min.js',
      'app/bower_components/pagedown/Markdown.Converter.js',
      'app/bower_components/pagedown/Markdown.Sanitizer.js',
      'app/bower_components/pagedown/Markdown.Extra.js',
      'app/bower_components/pagedown/Markdown.Editor.js',
      'app/bower_components/angular-pagedown/angular-pagedown.js',
      'app/js/**/*.js',
      'test/unit/**/*.js'
    ],

    autoWatch : true,

    frameworks: ['jasmine'],

    _browsers : ['Chrome', 'Firefox', 'Safari'],
    browsers : ['Firefox'],

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
