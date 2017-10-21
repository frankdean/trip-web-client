# TRIP - Trip Recording and Itinerary Planner

This is the README of the TRIP web client application.  See the README of the
[trip-server][] application for details of the full application.


## Installing required packages

		$ npm install


## Production Build Procedure

1.  Run `npm run lint`
1.  Run unit tests with `npm run test-single-run`
1.  Optionally or if first time, run `npm update-webdriver`
1.  Run end-to-end tests with `npm run protractor`
1.  Update the version number in `./app/js/version/version.js`
1.  Check in the change
1.  Run `npm run build-release`
1.  Modify static file web server to serve TRIP web client files from the
	`./dist/` folder. e.g.

		$ cd trip-server
		$ ln -s ~/projects/trip-web-client/dist/app

1.  Perform a simple test with `index.html` and `index-async.html` in the
    browser
1.  Run `npm run protractor`
1.  chdir to `./dist/` and tar up the contents of the `app/` sub-folder
1.  untar to deployment target


## Running directly with trip-server

Create a symbolic link within the TRIP server application to the web client
application.

During developent, this should be to the `trip-web-client\app` folder
containing the source files:

		$ cd ./trip-server/
		$ ln -s ../trip-web-client/app/

To run with the minified application bundle, the link must be to the
`trip-web-client\dist\app` folder:

		$ cd ./trip-server/
		$ ln -s ../trip-web-client/dist/app/


## Using older versions of webdriver etc.

Use `webdriver-manager --help` for options. E.g. install version 2.19 of the
chromedriver.

	$ ./node_modules/protractor/bin/webdriver-manager --versions.chrome 2.19 update

## Known Issues

See
[Protractor Browser Support page](http://www.protractortest.org/#/browser-support)
for the latest information.

1.  Latest Firefox Protractor testing requires using
    [geckdriver](https://github.com/mozilla/geckodriver).  Seel also
    <http://www.seleniumeasy.com/selenium-tutorials/launching-firefox-browser-with-geckodriver-selenium-3>.
	Not yet tested as documentation says it doesn't yet fully support the
    webdriver standard.

1.  The Safari web browser seems to cache the last interactively used versions
    of the JavaScript, therefore runs the tests against the wrong version.
    Run Safari interactively with the application and refresh the page to
    ensure the latest version is being loaded.

1.  Safari not working -
    [Protractor bug #3588](https://github.com/angular/protractor/issues/3588).

	Also need to enable 'Allow Remote Automation' option in Safari's 'Develop'
    menu, but fails when attempting to script the login.

1.  Safari on iOS (iPad) fails when using websockets with self-signed
	certificates over HTTPS, with:
	
	`WebSocket network error: The operation couldn’t be completed. (OSStatus error -9807.)`

	See
	<http://blog.httpwatch.com/2013/12/12/five-tips-for-using-self-signed-ssl-certificates-with-ios/>.
	
	Use <https://letsencrypt.org> to create a free certificate.
	Alternatively, uncomment and enable the code in
	`./app/js/socket-factory.js` to use polling with Safari Mobile browsers.

1.  angular-pagedown 0.4.4 distribution of `angular-pagedown.js` expects the
    angular-pagedown directives to use an attribute of `ng-model` instead of
    `content`, which is inconsistent with current documentation.

    Also, `angular-pagedown.min.js` in 0.4.4 is identical to that distributed
    with 0.4.3.

    For these reasons `bower.json` configured to use 0.4.3 so that there is a
    simple consistent release that will build reliably without extra
    instructions.

    In both versions, the default help button of the editor does not work.  It
    looks like a change in AngularJS has broken angular-pagedown.  The
    workaround is set the `help` attribute to call a local function in the
    controller which performs the default action of opening up a link to
    [DaringFireball's Markdown syntax page](http://daringfireball.net/projects/markdown/syntax).

1.  Protractor 5.1.1 requires node >= 6.9.x

1.  When fetching a Geo Location, Safari desktop provides a time stamp based
    on an epoch of 01-Jan-2001 instead of 01-Jan-1970.  Workaround implemented
    to alter the timestamp by that difference if it appears to be more than 10
    years old.  See
    [Safari (Mac OS X Lion) returns wrong epochtime value to position.timestamp call](https://stackoverflow.com/questions/10870138/safari-mac-os-x-lion-returns-wrong-epochtime-value-to-position-timestamp-call)

[trip-server]: https://github.com/frankdean/trip-server

1.  iOS Safari names downloads as `unknown.gpx` - See
    [FileSaver.js issue #12](https://github.com/eligrey/FileSaver.js/issues/12)
