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

describe('UtilsService', function() {

  var utilsService, coordFilter;
  var testPoints = [
    {lat: 50.685, lng: -4.01},
    {lat: 50.72727, lng: -4.0014},
    {lat: 74.009304, lng: 0.052926},
    {lat: 62.007746, lng: 46.455352},
    {lat: -31.243747, lng: -92.01151},
    {lat: 37.029022, lng: -116.767566},
    {lat: 30.015463, lng: 92.178012},
    {lat: 44.491126, lng: -148.007985},
    {lat: -12.788899, lng: -51.015577},
    {lat: -79.006769, lng: -72.022936},
    {lat: -42.009383, lng: 13.913319},
	// rounding error tests
    {lat: 54.77301, lng: 89.65054},
    {lat: -9.74517, lng: -20.34765}
  ];

  beforeEach(module('myApp'));

  beforeEach(inject(function(UtilsService, _coordFilter_) {
    utilsService = UtilsService;
    coordFilter = _coordFilter_;
  }));

  describe('GIS location formatting tests', function() {

    it('should format a latitudinal value as DMS', function() {
      expect(utilsService.formatCoordinates(50.527748, '%d\u00b0%m\u2032%s\u2033%c', 'lat')).toEqual('50\u00b031\u203239.893\u2033N');
    });

    it('should format a longitudal value as DMS', function() {
      expect(utilsService.formatCoordinates(3.903133, '%d\u00b0%m\u2032%s\u2033%c', 'lng')).toEqual('3\u00b054\u203211.279\u2033E');
    });

    it('should format a negative latitudinal value as DMS', function() {
      expect(utilsService.formatCoordinates(-50.527748, '%d\u00b0%m\u2032%s\u2033%c', 'lat')).toEqual('50\u00b031\u203239.893\u2033S');
    });

    it('should format a negative longitudinal value as DMS', function() {
      expect(utilsService.formatCoordinates(-3.903133, '%d\u00b0%m\u2032%s\u2033%c', 'lng')).toEqual('3\u00b054\u203211.279\u2033W');
    });

    it('should format a latitudinal value as DM', function() {
      expect(utilsService.formatCoordinates(50.527748, '%d\u00b0%m\u2032%c', 'lat')).toEqual('50\u00b031.66488\u2032N');
    });

    it('should format a longitudal value as DM', function() {
      expect(utilsService.formatCoordinates(3.903133, '%d\u00b0%m\u2032%c', 'lng')).toEqual('3\u00b054.18798\u2032E');
    });

    it('should format a negative latitudinal value as DM', function() {
      expect(utilsService.formatCoordinates(-50.527748, '%d\u00b0%m\u2032%c', 'lat')).toEqual('50\u00b031.66488\u2032S');
    });

    it('should format a negative longitudinal value as DM', function() {
      expect(utilsService.formatCoordinates(-3.903133, '%d\u00b0%m\u2032%c', 'lng')).toEqual('3\u00b054.18798\u2032W');
    });

    it('should format a latitudinal value as Degrees', function() {
      expect(utilsService.formatCoordinates(50.527748, '%d\u00b0%c', 'lat')).toEqual('50.527748\u00b0N');
    });

    it('should format a longitudal value as Degrees', function() {
      expect(utilsService.formatCoordinates(3.903133, '%d\u00b0%c', 'lng')).toEqual('3.903133\u00b0E');
    });

    it('should format a negative latitudinal value as Degrees', function() {
      expect(utilsService.formatCoordinates(-50.527748, '%d\u00b0%c', 'lat')).toEqual('50.527748\u00b0S');
    });

    it('should format a negative longitudinal value as Degrees', function() {
      expect(utilsService.formatCoordinates(-3.903133, '%d\u00b0%c', 'lng')).toEqual('3.903133\u00b0W');
    });

    it('should format a latitudinal value as DMS space-separated', function() {
      expect(utilsService.formatCoordinates(50.527748, '%d\u00b0 %m\u2032 %s\u2033 %c', 'lat')).toEqual('50\u00b0 31\u2032 39.893\u2033 N');
    });

    it('should format a latitudinal value as DM space-separated', function() {
      expect(utilsService.formatCoordinates(50.527748, '%d\u00b0 %m\u2032 %c', 'lat')).toEqual('50\u00b0 31.66488\u2032 N');
    });

    it('should format a latitudinal value as Degrees space-separated', function() {
      expect(utilsService.formatCoordinates(50.527748, '%d\u00b0 %c', 'lat')).toEqual('50.527748\u00b0 N');
    });

    it('should format a latitudinal value as DMS with prefixed sign', function() {
      expect(utilsService.formatCoordinates(50.527748, '%c%d\u00b0%m\u2032%s\u2033', 'lat')).toEqual('N50\u00b031\u203239.893\u2033');
    });

    it('should format a latitudinal value as DM with prefixed sign', function() {
      expect(utilsService.formatCoordinates(50.527748, '%c%d\u00b0%m\u2032', 'lat')).toEqual('N50\u00b031.66488\u2032');
    });

    it('should format a latitudinal value as Degrees with prefixed sign', function() {
      expect(utilsService.formatCoordinates(50.527748, '%c%d\u00b0', 'lat')).toEqual('N50.527748\u00b0');
    });

    it('should format a latitudinal value as DMS space-separated with prefixed sign', function() {
      expect(utilsService.formatCoordinates(50.527748, '%c %d\u00b0 %m\u2032 %s\u2033', 'lat')).toEqual('N 50\u00b0 31\u2032 39.893\u2033');
    });

    it('should format a latitudinal value as DM space-separated with prefixed sign', function() {
      expect(utilsService.formatCoordinates(50.527748, '%c %d\u00b0 %m\u2032', 'lat')).toEqual('N 50\u00b0 31.66488\u2032');
    });

    it('should format a latitudinal value as Degrees space-separated with prefixed sign', function() {
      expect(utilsService.formatCoordinates(50.527748, '%c %d\u00b0', 'lat')).toEqual('N 50.527748\u00b0');
    });

    it('should format a longitudinal value with leading zeros for minutes and seconds when less than 10', function() {
      expect(utilsService.formatCoordinates(-3.152775, '%d\u00b0%M\u2032%S\u2033%c', 'lng')).toEqual('3\u00b009\u203209.99\u2033W');
    });

    it('should format a longitudinal value with leading zeros for minutes less than 10', function() {
      expect(utilsService.formatCoordinates(-3.152775, '%d\u00b0%M\u2032%c', 'lng')).toEqual('3\u00b009.1665\u2032W');
    });

    it('should format a longitudinal value in the format used by QLandkarte GT', function() {
      expect(utilsService.formatCoordinates(-3.152775, '%c%D\u00b0 %M', 'lng')).toEqual('W03\u00b0 09.1665');
    });

    it('should format a longitudinal value with a leading minus sign', function() {
      expect(utilsService.formatCoordinates(-3.152775, '%i%d', 'lng')).toEqual('-3.152775');
    });

    it('should not format a longitudinal value with a leading plus sign', function() {
      expect(utilsService.formatCoordinates(3.152775, '%i%d', 'lng')).toEqual('3.152775');
    });

    it('should format a longitudinal value with a leading plus sign', function() {
      expect(utilsService.formatCoordinates(3.152775, '%p%d', 'lng')).toEqual('+3.152775');
    });

    it('should format a longitudinal value with a leading zero', function() {
      expect(utilsService.formatCoordinates(3.152775, '%D\u00b0%M\u2032%S\u2033%c', 'lng')).toEqual('03\u00b009\u203209.99\u2033E');
    });

    it('should format a longitudinal value in the format used by proj4', function() {
      expect(utilsService.formatCoordinates(-3.152775, '%dd%M\'%S"%c', 'lng')).toEqual('3d09\'09.99"W');
    });

    it('should format a longitudinal value that contains an format character intended for output', function() {
      expect(utilsService.formatCoordinates(-3.152775, '%%%d%%%M%%S%%%c', 'lng')).toEqual('%3%09.1665%S%W');
    });

    it('should cope with an empty format string', function() {
      expect(utilsService.formatCoordinates(-3.152775, '', 'lat')).toEqual('');
    });

    it('should cope with a format string with a single percent character', function() {
      expect(utilsService.formatCoordinates(-3.152775, '%', 'lat')).toEqual('%');
    });

    it('should cope with a format string with a double percent character', function() {
      expect(utilsService.formatCoordinates(-3.152775, '%%', 'lat')).toEqual('%');
    });

    it('should cope with a format string with a triple percent character', function() {
      expect(utilsService.formatCoordinates(-3.152775, '%%%', 'lat')).toEqual('%%');
    });

    it('should format the position as lat-lng', function() {
      expect(utilsService.formatPosition('lat', 'lng', 'lat-lng')).toEqual('lat lng');
    });

    it('should format the position as lat,lng', function() {
      expect(utilsService.formatPosition('lat', 'lng', 'lat,lng')).toEqual('lat,lng');
    });

    it('should format the position as lng-lat', function() {
      expect(utilsService.formatPosition('lat', 'lng', 'lng-lat')).toEqual('lng lat');
    });

    it('should format the position as lng,lat', function() {
      expect(utilsService.formatPosition('lat', 'lng', 'lng,lat')).toEqual('lng,lat');
    });

    it('should format a lat/lng as an Open Location Code (aka plus+code)', function() {
      // https://en.wikipedia.org/wiki/Open_Location_Code
      expect(utilsService.convertToFormat(48.8583625, 2.2944843750000024, 'plus+code')).toEqual('8FW4V75V+8QX');
    });

    it('should clip with bad values when formatting an Open Location Code (aka plus+code)', function() {
      expect(utilsService.convertToFormat(-90, -180, 'plus+code')).toEqual('22222222+222');
      expect(utilsService.convertToFormat(-110, -200, 'plus+code')).toEqual('22222222+222');
    });

    it('should clip with bad values when formatting an Open Location Code (aka plus+code)', function() {
      expect(utilsService.convertToFormat(90, 180, 'plus+code')).toEqual('C2X2X2X2+X2R');
      expect(utilsService.convertToFormat(110, 200, 'plus+code')).toEqual('C2X2X2X2+X2R');
    });

    it('should cope with bad values when formatting an Open Location Code (aka plus+code)', function() {
      expect(utilsService.convertToFormat('abc', 'xyz', 'plus+code')).toBeUndefined();
    });

    it('should convert to an OSGB 1936 format', function() {
      expect(utilsService.convertToFormat(50.54958847324303, -3.9961614650592727, 'osgb36')).toEqual('SX 58676 74106 / OSGB36 258676, 074106');
    });

    it('should convert a lat/lng the is outside OSGB 1936 area', function() {
      expect(utilsService.convertToFormat(48.85825, 2.2945, 'osgb36')).toEqual('715066, -106948');
    });

    it('should convert a lat/lng to a northerly OSGB 1936 grid reference', function() {
      expect(utilsService.convertToFormat(60.74476977561496, -0.877612332500198, 'osgb36')).toEqual('HP 61292 07379 / OSGB36 461292, 1207379');
    });

    it('should convert a lat/lng to a northerly OSGB 1936 grid reference', function() {
      expect(utilsService.convertToFormat(57.04754634,-5.29877771, 'osgb36')).toEqual('NH 00000 00000 / OSGB36 200000, 800000');
    });

    it('should', function() {
      expect(utilsService.convertToFormat(53.34972601713503, -6.2602736935201975, 'IrishGrid')).toEqual('O 15838 34688 / IG 315838, 234688');
    });

  });

  describe('GIS text parsing', function() {

    it('should parse a comma separated lat lng value', function() {
      expect(utilsService.parseGeoLocation('aaa48.85825,2.2945cccc')).toEqual({lat: {deg: 48.85825}, lng: {deg: 2.2945}});
    });

    it('should parse a comma-space separated lat lng value', function() {
      expect(utilsService.parseGeoLocation('aaa48.85825, 2.2945cccc')).toEqual({lat: {deg: 48.85825}, lng: {deg: 2.2945}});
    });

    it('should parse a negative comma-space separated lat lng value', function() {
      expect(utilsService.parseGeoLocation('aaa-48.85825, -2.2945cccc')).toEqual({lat: {deg: -48.85825}, lng: {deg: -2.2945}});
    });

    it('should parse a negative comma-space separated lat lng value', function() {
      expect(utilsService.parseGeoLocation('-48.85822222,-2.2945')).toEqual({lat: {deg: -48.85822222}, lng: {deg: -2.2945}});
    });

    it('should parse a comma separated lat lng value', function() {
      expect(utilsService.parseGeoLocation('a,b')).toEqual({lat: {}, lng: {}});
    });

    it('should parse a Google map URL', function() {
      expect(utilsService.parseGeoLocation('https://www.google.co.uk/maps/@48.85825,2.2945,16z')).toEqual({lat: {deg: 48.85825}, lng: {deg: 2.2945}});
    });

    it('should parse an Open Street Map URL', function() {
      expect(utilsService.parseGeoLocation('http://www.openstreetmap.org/?mlat=48.85825&mlon=2.2945#map=16/48.85825/2.2945')).toEqual({lat: {deg: 48.85825}, lng: {deg: 2.2945}});
    });

    it('should parse an OsmAnd Map URL', function() {
      expect(utilsService.parseGeoLocation('http://download.osmand.net/go?lat=48.85825&lon=2.2945&z=16')).toEqual({lat: {deg: 48.85825}, lng: {deg: 2.2945}});
    });

    it('should parse a DMS+ formatted position with the URL format used on Wikipedia', function() {
      expect(utilsService.parseGeoLocation('https://tools.wmflabs.org/geohack/geohack.php?pagename=Eiffel_Tower&params=48_51_29.6_N_2_17_40.2_E_region:FR-75_type:landmark')).toEqual({lat: {deg: 48, min: 51, sec: 29.6, c:'N'}, lng: {deg: 2, min: 17, sec: 40.2, c:'E'}});
    });

    it('should parse a Proj4 North reference', function() {
      expect(utilsService.parseGeoLocation('6d12\'7.38"W 57d23\'25.38"N')).toEqual({lat: {deg: 57, min: 23, sec: 25.38, c: 'N'}, lng: {deg: 6, min: 12, sec: 7.38, c: 'W'}});
    });

    it('should parse a Proj4 South reference', function() {
      expect(utilsService.parseGeoLocation('57d45\'46.44"W 51d41\'08.52"S')).toEqual({lat: {deg: 51, min: 41, sec: 8.52, c: 'S'}, lng: {deg: 57, min: 45, sec: 46.44, c: 'W'}});
    });

    it('should parse a Proj4 East reference', function() {
      expect(utilsService.parseGeoLocation('133d54\'48.78"E 23d48\'42.84"S')).toEqual({lat: {deg: 23, min: 48, sec: 42.84, c: 'S'}, lng: {deg: 133, min: 54, sec: 48.78, c: 'E'}});
    });

    it('should parse an OsmAnd shared location', function() {
      expect(utilsService.parseGeoLocation('Lat 54.77301, Lon 89.65054')).toEqual({lat: {deg: 54.77301}, lng: {deg: 89.65054}});
    });

    it('should parse a value that has caused rounding errors in the past', function() {
      expect(utilsService.parseGeoLocation('54.77301, 89.65054')).toEqual({lat: {deg: 54.77301}, lng: {deg: 89.65054}});
    });

    it('should parse a value that has caused an error in the past', function() {
      expect(utilsService.parseGeoLocation('N50\u00b041\'6" W4\u00b00\'36"')).toEqual({lat: {deg: 50, min: 41, sec: 6, c:'N'}, lng: {deg: 4, min: 0, sec: 36, c:'W'}});
    });

    it('should parse a +DMS formatted position', function() {
      expect(utilsService.parseGeoLocation('S15\u00b04\u203255\u2033 E3\u00b014\u203224\u2033')).toEqual({lat: {deg: 15, min: 4, sec: 55, c:'S'}, lng: {deg: 3, min: 14, sec: 24, c:'E'}});
    });

    it('should parse a DMS+ formatted position', function() {
      expect(utilsService.parseGeoLocation('51\u00b027\'53.82"N 0\u00b026\'04.32"W')).toEqual({lat: {deg: 51, min: 27, sec: 53.82, c:'N'}, lng: {deg: 0, min: 26, sec: 4.32, c:'W'}});
    });

    it('should parse a DM+ formatted position', function() {
      expect(utilsService.parseGeoLocation('51\u00b027.897\'N 0\u00b026.071983\'W')).toEqual({lat: {deg: 51, min: 27.897, sec: NaN, c:'N'}, lng: {deg: 0, min: 26.071983, sec: NaN, c:'W'}});
    });

    it('should parse a D+ formatted position', function() {
      expect(utilsService.parseGeoLocation('51.46495\u00b0N 0.434533\u00b0W')).toEqual({lat: {deg: 51.46495, min: NaN, sec: NaN, c:'N'}, lng: {deg: 0.434533, min: NaN, sec: NaN, c:'W'}});
    });

    it('should parse a D+ formatted position that omits the degree symbol', function() {
      expect(utilsService.parseGeoLocation('51.46495N 0.434533W')).toEqual({lat: {deg: 51.46495, min: NaN, sec: NaN, c:'N'}, lng: {deg: 0.434533, min: NaN, sec: NaN, c:'W'}});
    });

    it('should parse a D+ formatted position that uses the MASCULINE ORDINAL INDICATOR lookalike degree symbol', function() {
      expect(utilsService.parseGeoLocation('51.46495\u00baN 0.434533\u00baW')).toEqual({lat: {deg: 51.46495, min: NaN, sec: NaN, c:'N'}, lng: {deg: 0.434533, min: NaN, sec: NaN, c:'W'}});
    });

    it('should parse a D+ formatted position that uses the MODIFIER LETTER RING ABOVE (standalone) lookalike degree symbol', function() {
      expect(utilsService.parseGeoLocation('51.46495\u02daN 0.434533\u02daW')).toEqual({lat: {deg: 51.46495, min: NaN, sec: NaN, c:'N'}, lng: {deg: 0.434533, min: NaN, sec: NaN, c:'W'}});
    });

    it('should parse a D+ formatted position that uses the MODIFIER LETTER RING ABOVE lookalike degree symbol', function() {
      expect(utilsService.parseGeoLocation('51.46495\u030aN 0.434533\u030aW')).toEqual({lat: {deg: 51.46495, min: NaN, sec: NaN, c:'N'}, lng: {deg: 0.434533, min: NaN, sec: NaN, c:'W'}});
    });

    it('should parse a D+ formatted position that uses the MODIFIER LETTER RING BELOW lookalike degree symbol', function() {
      expect(utilsService.parseGeoLocation('51.46495\u0325N 0.434533\u0325W')).toEqual({lat: {deg: 51.46495, min: NaN, sec: NaN, c:'N'}, lng: {deg: 0.434533, min: NaN, sec: NaN, c:'W'}});
    });

    it('should parse a D+ formatted position that uses the KATAKANA-HIRAGANA SEMI-VOICED SOUND MARK lookalike degree symbol', function() {
      expect(utilsService.parseGeoLocation('51.46495\u309cN 0.434533\u309cW')).toEqual({lat: {deg: 51.46495, min: NaN, sec: NaN, c:'N'}, lng: {deg: 0.434533, min: NaN, sec: NaN, c:'W'}});
    });

    it('should parse a D+ formatted position that uses the COMBINING KATAKANA-HIRAGANA SEMI-VOICED SOUND MARK lookalike degree symbol', function() {
      expect(utilsService.parseGeoLocation('51.46495\u309aN 0.434533\u309aW')).toEqual({lat: {deg: 51.46495, min: NaN, sec: NaN, c:'N'}, lng: {deg: 0.434533, min: NaN, sec: NaN, c:'W'}});
    });

    it('should parse a D+ formatted position that uses the SUPERSCRIPT ZERO lookalike degree symbol', function() {
      expect(utilsService.parseGeoLocation('51.46495\u2070N 0.434533\u2070W')).toEqual({lat: {deg: 51.46495, min: NaN, sec: NaN, c:'N'}, lng: {deg: 0.434533, min: NaN, sec: NaN, c:'W'}});
    });

    it('should parse a D+ formatted position that uses the RING OPERATOR lookalike degree symbol', function() {
      expect(utilsService.parseGeoLocation('51.46495\u2218N 0.434533\u2218W')).toEqual({lat: {deg: 51.46495, min: NaN, sec: NaN, c:'N'}, lng: {deg: 0.434533, min: NaN, sec: NaN, c:'W'}});
    });

   it('should parse a DMS+ formatted position with the formal characters degree, prime and double-prime', function() {
      expect(utilsService.parseGeoLocation('51\u00b027\u203253.82\u2033N 0\u00b026\u203204.32\u2033W')).toEqual({lat: {deg: 51, min: 27, sec: 53.82, c:'N'}, lng: {deg: 0, min: 26, sec: 4.32, c:'W'}});
    });

   it('should parse a DMS+ formatted position with a reversed prime and reversed double-prime', function() {
      expect(utilsService.parseGeoLocation('51\u00b027\u203553.82\u2036N 0\u00b026\u203504.32\u2036W')).toEqual({lat: {deg: 51, min: 27, sec: 53.82, c:'N'}, lng: {deg: 0, min: 26, sec: 4.32, c:'W'}});
    });

   it('should parse a DMS+ formatted position with a MODIFIER LETTER PRIME and MODIFIER LETTER DOUBLE-PRIME', function() {
      expect(utilsService.parseGeoLocation('51\u00b027\u02b953.82\u02baN 0\u00b026\u02b904.32\u02baW')).toEqual({lat: {deg: 51, min: 27, sec: 53.82, c:'N'}, lng: {deg: 0, min: 26, sec: 4.32, c:'W'}});
    });

    it('should parse a comma separated lat/lng', function() {
      expect(utilsService.parseGeoLocation('48.858222,2.2945')).toEqual({lat: {deg: 48.858222}, lng: {deg: 2.2945}});
    });

    it('should parse a space-comma separated lat/lng', function() {
      expect(utilsService.parseGeoLocation('48.858222, 2.2945')).toEqual({lat: {deg: 48.858222}, lng: {deg: 2.2945}});
    });

    it('should parse a space-comma-space separated lat/lng', function() {
      expect(utilsService.parseGeoLocation('48.858222 , 2.2945')).toEqual({lat: {deg: 48.858222}, lng: {deg: 2.2945}});
    });

    it('should parse a space separated lat/lng', function() {
      expect(utilsService.parseGeoLocation('48.858222 2.2945')).toEqual({lat: {deg: 48.858222}, lng: {deg: 2.2945}});
    });

    it('should parse a DMS+ space separated lat/lng', function() {
      expect(utilsService.parseGeoLocation('I am here 48 51 29.599N 2 17 40.2E')).toEqual({lat: {deg: 48, min: 51, sec: 29.599, c: 'N'}, lng: {deg: 2, min: 17, sec: 40.2, c: 'E'}});
    });

    it('should parse a DMS+ space separated lat/lng with spaces between the cardinal characters', function() {
      expect(utilsService.parseGeoLocation('I am here 48 51 29.599 N 2 17 40.2 E')).toEqual({lat: {deg: 48, min: 51, sec: 29.599, c: 'N'}, lng: {deg: 2, min: 17, sec: 40.2, c: 'E'}});
    });

    it('should parse a +DMS space separated lat/lng', function() {
      expect(utilsService.parseGeoLocation('I am here N48 51 29.599 E2d17 40.2')).toEqual({lat: {deg: 48, min: 51, sec: 29.599, c: 'N'}, lng: {deg: 2, min: 17, sec: 40.2, c: 'E'}});
    });

    it('should parse a +DMS space separated lat/lng with spaces between the cardinal characters', function() {
      expect(utilsService.parseGeoLocation('I am here N 48 51 29.599 E 2d17 40.2')).toEqual({lat: {deg: 48, min: 51, sec: 29.599, c: 'N'}, lng: {deg: 2, min: 17, sec: 40.2, c: 'E'}});
    });

    it('should parse a clipboard share from GPS Status app in DM+ format', function() {
      expect(utilsService.parseGeoLocation('I am here: 48 51.49332 N 2 17.67 E http://maps.google.com/maps?q=48.858222,2.2945')).toEqual({lat: {deg: 48.858222}, lng: {deg: 2.2945}});
    });

    it('should parse a clipboard share from GPS Status app in DMS+ format', function() {
      expect(utilsService.parseGeoLocation('I am here: 48 51 29.599N 2 17 40.2E http://maps.google.com/maps?q=48.858222,2.2945')).toEqual({lat: {deg: 48.858222}, lng: {deg: 2.2945}});
    });

    it('should parse a clipboard share from GPS Status app in Ordnance Survey format', function() {
      expect(utilsService.parseGeoLocation('I am here: NN 4678 4321 http://maps.google.com/maps?q=48.858222,2.2945')).toEqual({lat: {deg: 48.858222}, lng: {deg: 2.2945}});
    });

    it('should parse a space separated code with a trailing space', function() {
      expect(utilsService.parseGeoLocation('N48 51.49332 E2 17.67 ')).toEqual({lat: {deg: 48, min: 51.49332, sec: NaN, c:'N'}, lng: {deg: 2, min: 17.67, sec: NaN, c:'E'}});
    });

    it('should parse a 10 digit Open Location Code (aka plus+code)', function() {
      // https://en.wikipedia.org/wiki/Open_Location_Code
      expect(utilsService.parseGeoLocation('8FW4V75V+8Q')).toEqual({lat: {deg: 48.8583125}, lng: {deg: 2.294437500000001}});
    });

    it('should parse an 11 digit Open Location Code (aka plus+code)', function() {
      // https://en.wikipedia.org/wiki/Open_Location_Code
      expect(utilsService.parseGeoLocation('8FW4V75V+8QX')).toEqual({lat: {deg: 48.8583625}, lng: {deg: 2.2944843750000024}});
    });

    it('should parse an Open Location Code (aka plus+code) URL', function() {
      // https://en.wikipedia.org/wiki/Open_Location_Code
      expect(utilsService.parseGeoLocation('https://plus.codes/8FW4V75V+8QX')).toEqual({lat: {deg: 48.8583625}, lng: {deg: 2.2944843750000024}});
    });

    it('should parse an Open Location Code (aka plus+code) URL allowing lower case', function() {
      // https://en.wikipedia.org/wiki/Open_Location_Code
      expect(utilsService.parseGeoLocation('https://plus.codes/8fw4v75v+8qx')).toEqual({lat: {deg: 48.8583625}, lng: {deg: 2.2944843750000024}});
    });

    it('should cope with bad values for an Open Location Code (aka plus+code)', function() {
      // https://en.wikipedia.org/wiki/Open_Location_Code
      expect(utilsService.parseGeoLocation('https://plus.codes/XXXXXXXX+XX')).toEqual({lat: {}, lng: {}});
    });

    it('should convert a valid OSGB 1936 grid reference', function() {
      expect(utilsService.parseGeoLocation('SX 58676 74106')).toEqual({lat: {deg: 50.54958847324303}, lng: {deg: -3.9961614650592727}});
    });

    it('should convert a valid OSGB 1936 grid reference with a prefix of BNG', function() {
      expect(utilsService.parseGeoLocation('BNG SX 58676 74106')).toEqual({lat: {deg: 50.54958847324303}, lng: {deg: -3.9961614650592727}});
    });

    it('should convert a valid OSGB 1936 grid reference with a prefix of OSGB36', function() {
      expect(utilsService.parseGeoLocation('OSGB36 SX 58676 74106')).toEqual({lat: {deg: 50.54958847324303}, lng: {deg: -3.9961614650592727}});
    });

    it('should convert a valid 12 digit OSGB 1936 grid reference', function() {
      expect(utilsService.parseGeoLocation('258676 074106')).toEqual({lat: {deg: 50.54958847324303}, lng: {deg: -3.9961614650592727}});
    });

    it('should convert a valid 12 digit comma-space separted OSGB 1936 grid reference', function() {
      expect(utilsService.parseGeoLocation('258676, 074106')).toEqual({lat: {deg: 50.54958847324303}, lng: {deg: -3.9961614650592727}});
    });

    it('should convert a valid 12 digit comma separated OSGB 1936 grid reference', function() {
      expect(utilsService.parseGeoLocation('258676,074106')).toEqual({lat: {deg: 50.54958847324303}, lng: {deg: -3.9961614650592727}});
    });

    it('should convert a valid 2 letter and 10 digit OSGB 1936 grid reference', function() {
      expect(utilsService.parseGeoLocation('SX5867674106')).toEqual({lat: {deg: 50.54958847324303}, lng: {deg: -3.9961614650592727}});
    });

    it('should convert a valid 2 letter and 6 digit OSGB 1936 grid reference', function() {
      expect(utilsService.parseGeoLocation('SX 587 741')).toEqual({lat: {deg: 50.54954035378619}, lng: {deg: -3.995820643785337}});
    });

    it('should convert a valid 6 digit OSGB 1936 grid reference without spaces', function() {
      expect(utilsService.parseGeoLocation('SX587741')).toEqual({lat: {deg: 50.54954035378619}, lng: {deg: -3.995820643785337}});
    });

    it('should convert a valid northerly OSGB 1936 grid reference', function() {
      expect(utilsService.parseGeoLocation('HP 61292 07379')).toEqual({lat: {deg: 60.74476977561496}, lng: {deg: -0.877612332500198}});
    });

    it('should convert a valid northerly OSGB 1936 grid reference', function() {
      expect(utilsService.parseGeoLocation('461292 1207379')).toEqual({lat: {deg: 60.74476977561496}, lng: {deg: -0.877612332500198}});
    });

    it('should convert a valid 10 digit 1 letter prefixed Irish Grid reference', function() {
      expect(utilsService.parseGeoLocation('O1583834688')).toEqual({lat: {deg: 53.34972601713503}, lng: {deg: -6.2602736935201975}});
    });

    it('should convert a valid 6 digit 1 letter prefixed Irish Grid reference', function() {
      expect(utilsService.parseGeoLocation('O189347')).toEqual({lat: {deg: 53.34915475439802}, lng: {deg: -6.21430635883986}});
    });

    it('should convert a valid 6 digit 1 letter prefixed Irish Grid reference prefixed with IG', function() {
      expect(utilsService.parseGeoLocation('IG O189347')).toEqual({lat: {deg: 53.34915475439802}, lng: {deg: -6.21430635883986}});
    });

    it('should convert a valid 12 digit Irish Grid reference', function() {
      expect(utilsService.parseGeoLocation('IG 315838, 234688')).toEqual({lat: {deg: 53.34972601713503}, lng: {deg: -6.2602736935201975}});
    });

  });

  describe('convertDmsCoordsToDegreeCoords', function() {

    it('should convert a set of DMS coordinates to simple degree cordinates', function() {
      var test = utilsService.parseGeoLocation('48d51\'29.6"N 2d17\'40.2"E');
      expect(utilsService.convertDmsCoordsToDegreeCoords(test)).toEqual({lat: 48.85822222, lng: 2.2945});
    });

    it('should convert a set of negative DMS coordinates to simple degree cordinates', function() {
      var test = utilsService.parseGeoLocation('48d51\'29.6"S 2d17\'40.2"W');
      expect(utilsService.convertDmsCoordsToDegreeCoords(test)).toEqual({lat: -48.85822222, lng: -2.2945});
    });

    it('should convert a set of negative DMS coordinates to simple degree cordinates', function() {
      var test = utilsService.parseGeoLocation('-48.85822222,-2.2945');
      expect(utilsService.convertDmsCoordsToDegreeCoords(test)).toEqual({lat: -48.85822222, lng: -2.2945});
    });

  });

  describe('Parsing a number of pre-defined formats', function() {
    var supportedFormats = [
      "%d\u00b0%M\u2032%S\u2033%c",
      "%d\u00b0%M\u2032%c",
      "%d\u00b0%c",
      "%i%d",
      "%p%d",
      "%c%D\u00b0 %M",
      "%dd%M'%S\"%c",
      "%c%d\u00b0%M\u2032%S\u2033",
      "%c%d\u00b0%M\u2032",
      "%c%d\u00b0",
      "%d\u00b0 %M\u2032 %S\u2033 %c",
      "%d\u00b0 %M\u2032 %c",
      "%d\u00b0 %c",
      "%c %d\u00b0 %M\u2032 %S\u2033",
      "%c %d\u00b0 %M\u2032",
      "%c %d\u00b0",
      "%d %m %s%c",
      "%d %m%c",
      "%d%c",
      "%c%d %m %s",
      "%c%d %m",
      "%c%d"
    ];

    it('should convert values using all supported formats across a range of test values', function() {
      for (var i = 0, n = supportedFormats.length; i < n; ++i) {
        //  var i = 21;
        // $log.debug('Format', supportedFormats[i]);
        for (var x = 0, z = testPoints.length; x < z; ++x) {
          var testLat = testPoints[x].lat, testLng = testPoints[x].lng;
          var t = utilsService.formatPosition(coordFilter(testLat, supportedFormats[i], 'lat'), coordFilter(testLng, supportedFormats[i], 'lng'));
          var dmsCoord = utilsService.parseGeoLocation(t);
          var coord  = utilsService.convertDmsCoordsToDegreeCoords(dmsCoord);
          var latResult = coord.lat;
          expect(coord.lat).toBeCloseTo(testLat, 5);
          expect(coord.lng).toBeCloseTo(testLng, 5);
        }
      }
    });

  });

  describe('convertMapAttributesToHtml', function() {
    var osmHtmlAttrs = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',

        thunderforestHtmlAttrs = 'Maps © <a href="http://www.thunderforest.com/">Thunderforest</a>, Data © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>, <a href="http://creativecommons.org/licenses/by-sa/2.0/" title="Creative Commons Attribution-Sharealike 2.0">CC-BY-SA 2.0</a>',

        attrsThunderforest = [
          {"text": "Maps © "},
          {"text": "Thunderforest", "link": "http://www.thunderforest.com/"},
          {"text": ", Data © "},
          {"text": "OpenStreetMap contributors", "link": "http://www.openstreetmap.org/copyright"},
          {"text": ", "},
          {"text": "CC-BY-SA 2.0", "link": "http://creativecommons.org/licenses/by-sa/2.0/", "title": "Creative Commons Attribution-Sharealike 2.0"}
        ],

        attrsOsm = [
          {"text": "Map data &copy; "},
          {"text": "OpenStreetMap", "link": "http://openstreetmap.org"},
          {"text": " contributors, "},
          {"text": "CC-BY-SA", "link": "http://creativecommons.org/licenses/by-sa/2.0/"}
        ];

    it('should return an HTML element formatted based on the OSM configuration', function() {
      expect(utilsService.convertMapAttributesToHtml(attrsOsm)).toEqual(osmHtmlAttrs);
    });

    it('should return an HTML element formatted based on the Thunderforest configuration', function() {
      expect(utilsService.convertMapAttributesToHtml(attrsThunderforest)).toEqual(thunderforestHtmlAttrs);
    });

  });

});
