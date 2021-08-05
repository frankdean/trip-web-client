# TRIP - Trip Recording and Itinerary Planner

This is the README of the TRIP web client application.  See the README of the
[trip-server][] application for details of the full application.


## Installing required packages

		$ yarn install


## Production Build Procedure

1.  Run `yarn run lint`
1.  Run unit tests with `yarn run test-single-run`
1.  Optionally or if first time, run `yarn update-webdriver`
1.  Run end-to-end tests with `yarn run protractor`
1.  Update the version number in `./app/js/version/version.js`
1.  Check in the change
1.  Run `yarn run build-release`
1.  Modify static file web server to serve TRIP web client files from the
	`./dist/` folder. e.g.

		$ cd trip-server
		$ ln -s ~/projects/trip-web-client/dist/app

1.  Perform a simple test with `index.html` and `index-async.html` in the
    browser
1.  Run `yarn run protractor`
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

## Docker

It is possible to develop the application using a Docker container, by
working in the directory containing the current web source code, and
peforming a bind mount of the source folder with the `/webapp` folder
in the container.

**Note:** the container will already have the distributed copy of the
source code in the `/webapp` folder.  The bind mount will bind over
that folder, hiding its contents with the current source directory on
the host machine.

To build a new container:

	$ docker build -t trip-web .

Create a docker network and start the database container:

	$ docker network create trip-server

	$ docker run --network trip-server --network-alias postgis \
	-e POSTGRES_PASSWORD=secret -d fdean/trip-database:latest

To run the container, and mount the current directory at `/webapp`:

	$ cd trip-web-client
	$ docker run --name trip-web --network trip-server \
	-e TRIP_SIGNING_KEY=secret -e TRIP_RESOURCE_SIGNING_KEY=secret \
	-e POSTGRES_PASSWORD=secret -e CHROME_BIN=/usr/bin/chromium \
	--mount type=bind,source="$(pwd)",target=/webapp \
	--shm-size=128m --publish 8080:8080 -d trip-web

To start and connect to a Bash shell in the running container:

	$ docker exec -it -w /webapp -e LANG=en_GB.UTF-8 -e LC_ALL=en_GB.UTF-8 \
	trip-web bash -il

Then, in the container, run the tests:

	$ cd /webapp
	$ yarn
	$ yarn run lint
	$ yarn run test-single-run
	$ yarn run protractor

Alternatively, run the test directly from the host:

	$ docker exec -it -w /webapp -e LANG=en_GB.UTF-8 -e LC_ALL=en_GB.UTF-8 \
	trip-web yarn run protractor


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
