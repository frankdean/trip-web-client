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

angular.module('myApp.utils.factory', [])

  .factory(
    'UtilsService',
    ['$log', 'ConfigService',
     function($log, ConfigService) {

       var _singleZeroPad = function(v) {
         return (v < 10 ? '0' + v : v);
       };

       var _tokenizeFormatString = function(v) {
         var r = [];
         for (var i = 0, n = v.length; i < n; ++i) {
           if (v[i] === '%' && i < n-1) {
             r.push(v[i] + v[++i]);
           } else {
             r.push(v[i]);
           }
         }
         return r;
       };

       var formatCoordinates = function(v, format, latOrLng) {
         var r = '',
             dms,
             fsa = _tokenizeFormatString(format);
         if (fsa.indexOf('%s') >= 0 || fsa.indexOf('%S') >= 0) {
           dms = _degreesToDMS(v);
         } else if (format.includes('%m') || format.includes('%M')) {
           dms = _degreesToDM(v);
         } else {
           dms = {deg: Math.abs(v)};
         }
         fsa.forEach(function(e) {
           switch(e) {
           case '%%':
             r += '%';
             break;
           case '%d':
             r += dms.deg;
             break;
           case '%D':
             r += _singleZeroPad(dms.deg);
             break;
           case '%m':
             r += dms.min;
             break;
           case '%M':
             r += _singleZeroPad(dms.min);
             break;
           case '%s':
             r += dms.sec;
             break;
           case '%S':
             r += _singleZeroPad(dms.sec);
             break;
           case '%c':
             r += _cardinalSign(v, latOrLng);
             break;
           case '%i':
             r += (v < 0 ? '-' : '');
             break;
           case '%p':
             r += (v < 0 ? '-' : '+');
             break;
           default:
             r += e;
             break;
           }
         });
         return r;
       };
       var _degreesToDM = function(v) {
         var d, m;
         v = Math.abs(v);
         d = Math.floor(v);
         m = Math.round((v-d) * 60000000) / 1000000;
         return {deg: d, min: m};
       };
       var _degreesToDMS = function(v) {
         var dm, m, s;
         dm = _degreesToDM(v);
         m = Math.floor(dm.min);
         s = Math.round((dm.min - m) * 60000) / 1000;
         return {deg: dm.deg, min: m, sec: s};
       };
       var _cardinalSign = function(v, latOrLng) {
         var r;
         switch(latOrLng) {
         case 'lat':
           r = v < 0  ? 'S' : 'N';
           break;
         case 'lng':
           r = v < 0 ? 'W' : 'E';
           break;
         default:
           r = '';
           break;
         }
         return r;
       };

       var formatPosition = function(lat, lng, positionFormat) {
         var r;
         switch(positionFormat) {
         case 'lat,lng':
           r = lat + ',' + lng;
           break;
         case 'lng-lat':
           r = lng + ' ' + lat;
           break;
         case 'lng,lat':
           r = lng + ',' + lat;
           break;
         case undefined:
         case 'lat-lng':
           r = lat + ' ' + lng;
           break;
         default:
           r = lat + lng;
           break;
         }
         return r;
       };

       var parseGeoLocation = function(text) {
         var lat = {}, lng = {}, found, coord;
         var formats = [
           {name: 'plus+code', regex: /^(?:https?:\/\/.*\/)?([23456789CFGHJMPQRVWXcfghjmpqrvwx]{8}\+[23456789CFGHJMPQRVWXcfghjmpqrvwx]{2,3})$/},
           {name: 'OsmAnd share', regex: /^[Ll]at(?:itude)? (-?[.\d]+)[\s,]+[Ll](?:on|ong|ng|ongitude?) (-?[.\d]+)$/, latd: 1, lngd: 2},
           {name: 'OSM map', regex: /m?lat=(-?[.\d]+)&m?lon=(-?[.\d]+)/, latd: 1, lngd: 2},
           {name: 'Google map', regex: /q=(?:loc:)?(-?[.\d]+),(-?[.\d]+)/, latd: 1, lngd: 2},
           {name: '+DMS', regex: /([NSns]{1})\s?([.\d]+)\s?(?:[-\sd_\u00b0\u00ba\u02da\u030a\u0325\u309c\u309a\u2070\u2218]{1}\s?(?:([.\d]+)\s?[-\s'_\u2032\u2035\u02b9]{0,1}\s?(?:([.\d]+)\s?[-\s"_\u2033\u2036\u02ba]{0,1}\s?)?)?)?[-_\s,]*([WEwe]{1})\s?([.\d]+)(?:[-\sd_\u00b0\u00ba\u02da\u030a\u0325\u309c\u309a\u2070\u2218]{1}\s?(?:([.\d]+)\s?[-\s'_\u2032\u2035\u02b9]{0,1}\s?(?:([.\d]+)\s?[-\s"_\u2033\u2036\u02ba]{0,1}\s?)?)?)?/, latc: 1, latd: 2, latm: 3, lats: 4, lngc: 5, lngd: 6, lngm: 7, lngs: 8 },
           {name: 'DMS+', regex: /([.\d]+)\s?(?:[-\sd_\u00b0\u00ba\u02da\u030a\u0325\u309c\u309a\u2070\u2218]{1}\s?(?:([.\d]+)\s?[-\s'_\u2032\u2035\u02b9]{0,1}\s?(?:([.\d]+)\s?[-\s"_\u2033\u2036\u02ba]{0,1}\s?)?)?)?([NSns]{1})[-_\s,]*([.\d]+)(?:[-\sd_\u00b0\u00ba\u02da\u030a\u0325\u309c\u309a\u2070\u2218]{1}\s?(?:([.\d]+)\s?[-\s'_\u2032\u2035\u02b9]{0,1}\s?(?:([.\d]+)\s?[-\s"_\u2033\u2036\u02ba]{0,1}\s?)?)?)?([WEwe]{1})/, latd: 1, latm: 2, lats: 3, latc: 4, lngd: 5, lngm: 6, lngs: 7, lngc: 8 },
           {name: 'QlandkartGT', regex: /([NSns]{1})([.\d]+)[d_\u00b0\u00ba\u02da\u030a\u0325\u309c\u309a\u2070\u2218]{1}\s?([.\d]+)[-\s'_\u2032\u2035\u02b9]+([WEwe]{1})([.\d]+)[d_\u00b0\u00ba\u02da\u030a\u0325\u309c\u309a\u2070\u2218]{1}\s?([.\d]+)[-\s'_\u2032\u2035\u02b9]*/, latc: 1, latd: 2, latm: 3, lngc: 4, lngd: 5, lngm: 6 },
           {name: 'Proj4', regex: /(\d+)[\u00b0°dD]{1}(\d+)['\u2032]{1}([.\d]+)"([WE]{1})\s+(\d+)[°dD]{1}(\d+)'([.\d]+)"([NS]{1})/, latd: 5, latm: 6, lats: 7, latc: 8, lngd: 1, lngm: 2, lngs: 3, lngc: 4 },
           {name: 'lat/lng', regex: /([-.+\d]+)[_,\s]{1,3}([-.+\d]+)/, latd: 1, lngd: 2}
         ];
         // $log.debug('text:', text);
         for (var i = 0, n = formats.length; i < n; ++i) {
           found = text.match(formats[i].regex);
           if (found) {
             // $log.debug('Matches with:', formats[i].name);
             // $log.debug('Matches:', found);
             if (formats[i].name === 'plus+code') {
               // $log.debug('Converting plus+code ', found[1]);
               try {
                 coord = OpenLocationCode.decode(found[1]);
               } catch(ex) {
                 $log.error(ex);
               }
               if (coord) {
                 lat.deg = coord.latitudeCenter;
                 lng.deg = coord.longitudeCenter;
               }
             } else {
               if (formats[i].latd) lat.deg = Number.parseFloat(found[formats[i].latd]);
               if (formats[i].latm) lat.min = Number.parseFloat(found[formats[i].latm]);
               if (formats[i].lats) lat.sec = Number.parseFloat(found[formats[i].lats]);
               if (formats[i].latc) lat.c = found[formats[i].latc];
               if (formats[i].lngd) lng.deg = Number.parseFloat(found[formats[i].lngd]);
               if (formats[i].lngm) lng.min = Number.parseFloat(found[formats[i].lngm]);
               if (formats[i].lngs) lng.sec = Number.parseFloat(found[formats[i].lngs]);
               if (formats[i].lngc) lng.c = found[formats[i].lngc];
             }
             break;
           }
         }
         return {lat: lat, lng: lng};
       };

       var convertDmsCoordsToDegreeCoords = function(c) {
         var lat, lng;
         // $log.debug('coord:', c);
         // lat = Math.round((c.lat.deg + (c.lat.min + (c.lat.sec / 60)) / 60) * 100000000) / 100000000;
         lat = Math.round((c.lat.deg + (isFinite(c.lat.min) ? c.lat.min / 60 : 0) + (isFinite(c.lat.sec) ? c.lat.sec / 3600 : 0)) * 100000000) / 100000000;
         lng = Math.round((c.lng.deg + (isFinite(c.lng.min) ? c.lng.min / 60 : 0) + (isFinite(c.lng.sec) ? c.lng.sec / 3600 : 0)) * 100000000) / 100000000;
         if (c.lat < 0 || (c.lat.c && 'Ss'.indexOf(c.lat.c) !== -1)) {
           lat = -lat;
         }
         if (c.lng < 0 || (c.lng.c && 'Ww'.indexOf(c.lng.c) !== -1)) {
           lng = -lng;
         }
         return {lat: lat, lng: lng};
       };

       var parseTextAsDegrees = function(text) {
         return convertDmsCoordsToDegreeCoords(parseGeoLocation(text));
       };

       var plusCodeFormat = function(latlng) {
         var retval;
         // clip illegal numeric values
         if (latlng.lng < -180) {
           latlng.lng = -180;
         } else if (latlng.lng > 180) {
           latlng.lng = 180;
         }
         if (latlng.lat < -90) {
           latlng.lat = -90;
         } else if (latlng.lat > 90) {
           latlng.lat = 90;
         }
         try {
           retval = OpenLocationCode.encode(latlng.lat, latlng.lng, OpenLocationCode.CODE_PRECISION_EXTRA);
         } catch(ex) {
           $log.error(ex);
         }
         return retval;
       };

       var convertMapAttributesToHtml = function(attrs) {
         var e, retval;
           if (attrs && Array.isArray(attrs)) {
             retval = '';
             attrs.forEach(function(v) {
               if (v.text && v.link && v.title) {
                 e = '<a href="' + v.link +'" title="' + v.title + '">' + v.text + '</a>';
                 retval += e;
               } else if (v.text && v.link) {
                 e = '<a href="' + v.link +'">' + v.text + '</a>';
                 retval += e;
               } else if (v.link) {
                 e = '<a href="' + v.link +'">' + v.link + '</a>';
                 retval += e;
               } else if (v.text) {
                 e = v.text;
                 retval += e;
               } else {
                 $log.warn('Unexpected attribution configuration encountered:', v);
               }
             });
           } else {
             $log.error('Attribution configiration is invalid');
           }
           return retval;
       };

       var createMapLayers = function(config) {
         var layer, layers = [];
         if (config && Array.isArray(config)) {
           config.forEach(function(v, k) {
             layer = {};
             layer.name = v.name;
             layer.url = ConfigService.getTileUrl(k);
             layer.type = v.type;
             layer.layerOptions = {
               attribution: convertMapAttributesToHtml(v.tileAttributions)
             };
             layers.push(layer);
           });
         } else {
           $log.error('Map attribute configuration is not an array');
         }
         return layers;
       };

       return {
         formatCoordinates: formatCoordinates,
         formatPosition: formatPosition,
         parseGeoLocation: parseGeoLocation,
         convertDmsCoordsToDegreeCoords: convertDmsCoordsToDegreeCoords,
         parseTextAsDegrees: parseTextAsDegrees,
         plusCodeFormat: plusCodeFormat,
         convertMapAttributesToHtml: convertMapAttributesToHtml,
         createMapLayers: createMapLayers
       };
     }])

  .factory(
    'modalDialog',
    ['$window', function($window) {
      return {
        confirm: function(message) {
          return $window.confirm(message);
        }
      };
    }]);
