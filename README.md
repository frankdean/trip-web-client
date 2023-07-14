# TRIP - Trip Recording and Itinerary Planner

This web application uses the [AngularJS][] framework, Google's support for
which, officially ended as of January 2022.  Consequently, this project is now
archived and is no longer supported.  It has been replaced with
[a C++ rewrite as Trip Server v2][trip-server-2], which supports all the use
cases of this version (Trip Server v1) and should suffer far less from the
impact of dependency changes.  See the
[README](https://www.fdsd.co.uk/trip-server-2/readme.html) for further
details.  It can be run alongside v1.

## Installing required packages

		$ export TMPDIR=/tmp
		$ npm install

Defining `TMPDIR` is a workaround to an issue that surfaces when `npm`
(seemingly unnecessarily) attempts to build PhantomJS.  See
[Phantom installation failed TypeError: Path must be a string. Received undefined #200](https://github.com/karma-runner/karma-phantomjs-launcher/issues/200)

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


## User Documentation

See the [user documentation](https://www.fdsd.co.uk/trip-web-client-docs/) for
information on using the application.

## Using older versions of webdriver etc.

Use `webdriver-manager --help` for options. E.g. install version 2.19 of the
chromedriver.

	$ ./node_modules/protractor/bin/webdriver-manager --versions.chrome 2.19 update


## Known Issues

See
[Protractor Browser Support page](http://www.protractortest.org/#/browser-support)
for the latest information.

1.  Safari tests are unreliable - WaitForAngular doesn't work, so the
    workaround is to keep adding delays at various points where the tests
    fail.

	Enable 'Allow Remote Automation' option in Safari's 'Develop' menu.

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

    In both versions, the default help button of the editor does not work.  It
    looks like a change in AngularJS has broken angular-pagedown.  The
    workaround is set the `help` attribute to call a local function in the
    controller which performs the default action of opening up a link to
    [DaringFireball's Markdown syntax page](http://daringfireball.net/projects/markdown/syntax).

1.  When fetching a Geo Location, Safari desktop provides a time stamp based
    on an epoch of 01-Jan-2001 instead of 01-Jan-1970.  Workaround implemented
    to alter the timestamp by that difference if it appears to be more than 10
    years old.  See
    [Safari (Mac OS X Lion) returns wrong epochtime value to position.timestamp call](https://stackoverflow.com/questions/10870138/safari-mac-os-x-lion-returns-wrong-epochtime-value-to-position-timestamp-call)

[trip-server]: https://www.fdsd.co.uk/trip-server/ "TRIP - Trip Recording and Itinerary Planner"

1.  Safari Karma unit tests require the user to accept opening a
    redirect file before launching the tests.  As Safari cannot be run
    headless anyway, this is less of an issue.

    See <https://github.com/karma-runner/karma-safari-launcher/issues/29>
