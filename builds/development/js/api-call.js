(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

var app = require("biojs-rest-tessapi");
var api = new app.EventsApi(); // Allocate the API class we're going to use.

api.eventsJsonGet(
	{
		"q": "RNA-SEQ",
		"country[]": ["United Kingdom", "Belgium"]
	}, //see lib/api/EventsApi.js for full params options
	function(error, data, response){
		console.log(data)
	}
)

},{"biojs-rest-tessapi":6}],2:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],3:[function(require,module,exports){
(function (Buffer){
/**
 * TeSS API
 * Access, search and filter through collections of training materials, events, packages, and workflows in TeSS. As a rule of thumb - You can add .json to the end of most pages to retrieve the data in a common exchange format. e.g - https://tess.elixir-europe.org/events/software-carpentry-west-virginia-university.json - https://tess.elixir-europe.org/materials/rna-seq-de-novo-transcriptome-reconstruction-with-rna-seq.json - https://tess.elixir-europe.org/packages/biocomp-computing-skills-collection.json - https://tess.elixir-europe.org/workflows/das-internet-fur-biologen.json - https://tess.elixir-europe.org/nodes/united-kingdom.json
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['superagent'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('superagent'));
  } else {
    // Browser globals (root is window)
    if (!root.TeSsApi) {
      root.TeSsApi = {};
    }
    root.TeSsApi.ApiClient = factory(root.superagent);
  }
}(this, function(superagent) {
  'use strict';

  /**
   * @module ApiClient
   * @version 1.0.0
   */

  /**
   * Manages low level client-server communications, parameter marshalling, etc. There should not be any need for an
   * application to use this class directly - the *Api and model classes provide the public API for the service. The
   * contents of this file should be regarded as internal but are documented for completeness.
   * @alias module:ApiClient
   * @class
   */
  var exports = function() {
    /**
     * The base URL against which to resolve every API call's (relative) path.
     * @type {String}
     * @default https://tess.oerc.ox.ac.uk/
     */
    this.basePath = 'https://tess.oerc.ox.ac.uk/'.replace(/\/+$/, '');

    /**
     * The authentication methods to be included for all API calls.
     * @type {Array.<String>}
     */
    this.authentications = {
    };
    /**
     * The default HTTP headers to be included for all API calls.
     * @type {Array.<String>}
     * @default {}
     */
    this.defaultHeaders = {};

    /**
     * The default HTTP timeout for all API calls.
     * @type {Number}
     * @default 60000
     */
    this.timeout = 60000;
  };

  /**
   * Returns a string representation for an actual parameter.
   * @param param The actual parameter.
   * @returns {String} The string representation of <code>param</code>.
   */
  exports.prototype.paramToString = function(param) {
    if (param == undefined || param == null) {
      return '';
    }
    if (param instanceof Date) {
      return param.toJSON();
    }
    return param.toString();
  };

  /**
   * Builds full URL by appending the given path to the base URL and replacing path parameter place-holders with parameter values.
   * NOTE: query parameters are not handled here.
   * @param {String} path The path to append to the base URL.
   * @param {Object} pathParams The parameter values to append.
   * @returns {String} The encoded path with parameter values substituted.
   */
  exports.prototype.buildUrl = function(path, pathParams) {
    if (!path.match(/^\//)) {
      path = '/' + path;
    }
    var url = this.basePath + path;
    var _this = this;
    url = url.replace(/\{([\w-]+)\}/g, function(fullMatch, key) {
      var value;
      if (pathParams.hasOwnProperty(key)) {
        value = _this.paramToString(pathParams[key]);
      } else {
        value = fullMatch;
      }
      return encodeURIComponent(value);
    });
    return url;
  };

  /**
   * Checks whether the given content type represents JSON.<br>
   * JSON content type examples:<br>
   * <ul>
   * <li>application/json</li>
   * <li>application/json; charset=UTF8</li>
   * <li>APPLICATION/JSON</li>
   * </ul>
   * @param {String} contentType The MIME content type to check.
   * @returns {Boolean} <code>true</code> if <code>contentType</code> represents JSON, otherwise <code>false</code>.
   */
  exports.prototype.isJsonMime = function(contentType) {
    return Boolean(contentType != null && contentType.match(/^application\/json(;.*)?$/i));
  };

  /**
   * Chooses a content type from the given array, with JSON preferred; i.e. return JSON if included, otherwise return the first.
   * @param {Array.<String>} contentTypes
   * @returns {String} The chosen content type, preferring JSON.
   */
  exports.prototype.jsonPreferredMime = function(contentTypes) {
    for (var i = 0; i < contentTypes.length; i++) {
      if (this.isJsonMime(contentTypes[i])) {
        return contentTypes[i];
      }
    }
    return contentTypes[0];
  };

  /**
   * Checks whether the given parameter value represents file-like content.
   * @param param The parameter to check.
   * @returns {Boolean} <code>true</code> if <code>param</code> represents a file.
   */
  exports.prototype.isFileParam = function(param) {
    // fs.ReadStream in Node.js (but not in runtime like browserify)
    if (typeof window === 'undefined' &&
        typeof require === 'function' &&
        require('fs') &&
        param instanceof require('fs').ReadStream) {
      return true;
    }
    // Buffer in Node.js
    if (typeof Buffer === 'function' && param instanceof Buffer) {
      return true;
    }
    // Blob in browser
    if (typeof Blob === 'function' && param instanceof Blob) {
      return true;
    }
    // File in browser (it seems File object is also instance of Blob, but keep this for safe)
    if (typeof File === 'function' && param instanceof File) {
      return true;
    }
    return false;
  };

  /**
   * Normalizes parameter values:
   * <ul>
   * <li>remove nils</li>
   * <li>keep files and arrays</li>
   * <li>format to string with `paramToString` for other cases</li>
   * </ul>
   * @param {Object.<String, Object>} params The parameters as object properties.
   * @returns {Object.<String, Object>} normalized parameters.
   */
  exports.prototype.normalizeParams = function(params) {
    var newParams = {};
    for (var key in params) {
      if (params.hasOwnProperty(key) && params[key] != undefined && params[key] != null) {
        var value = params[key];
        if (this.isFileParam(value) || Array.isArray(value)) {
          newParams[key] = value;
        } else {
          newParams[key] = this.paramToString(value);
        }
      }
    }
    return newParams;
  };

  /**
   * Enumeration of collection format separator strategies.
   * @enum {String}
   * @readonly
   */
  exports.CollectionFormatEnum = {
    /**
     * Comma-separated values. Value: <code>csv</code>
     * @const
     */
    CSV: ',',
    /**
     * Space-separated values. Value: <code>ssv</code>
     * @const
     */
    SSV: ' ',
    /**
     * Tab-separated values. Value: <code>tsv</code>
     * @const
     */
    TSV: '\t',
    /**
     * Pipe(|)-separated values. Value: <code>pipes</code>
     * @const
     */
    PIPES: '|',
    /**
     * Native array. Value: <code>multi</code>
     * @const
     */
    MULTI: 'multi'
  };

  /**
   * Builds a string representation of an array-type actual parameter, according to the given collection format.
   * @param {Array} param An array parameter.
   * @param {module:ApiClient.CollectionFormatEnum} collectionFormat The array element separator strategy.
   * @returns {String|Array} A string representation of the supplied collection, using the specified delimiter. Returns
   * <code>param</code> as is if <code>collectionFormat</code> is <code>multi</code>.
   */
  exports.prototype.buildCollectionParam = function buildCollectionParam(param, collectionFormat) {
    if (param == null) {
      return null;
    }
    switch (collectionFormat) {
      case 'csv':
        return param.map(this.paramToString).join(',');
      case 'ssv':
        return param.map(this.paramToString).join(' ');
      case 'tsv':
        return param.map(this.paramToString).join('\t');
      case 'pipes':
        return param.map(this.paramToString).join('|');
      case 'multi':
        // return the array directly as SuperAgent will handle it as expected
        return param.map(this.paramToString);
      default:
        throw new Error('Unknown collection format: ' + collectionFormat);
    }
  };

  /**
   * Applies authentication headers to the request.
   * @param {Object} request The request object created by a <code>superagent()</code> call.
   * @param {Array.<String>} authNames An array of authentication method names.
   */
  exports.prototype.applyAuthToRequest = function(request, authNames) {
    var _this = this;
    authNames.forEach(function(authName) {
      var auth = _this.authentications[authName];
      switch (auth.type) {
        case 'basic':
          if (auth.username || auth.password) {
            request.auth(auth.username || '', auth.password || '');
          }
          break;
        case 'apiKey':
          if (auth.apiKey) {
            var data = {};
            if (auth.apiKeyPrefix) {
              data[auth.name] = auth.apiKeyPrefix + ' ' + auth.apiKey;
            } else {
              data[auth.name] = auth.apiKey;
            }
            if (auth['in'] === 'header') {
              request.set(data);
            } else {
              request.query(data);
            }
          }
          break;
        case 'oauth2':
          if (auth.accessToken) {
            request.set({'Authorization': 'Bearer ' + auth.accessToken});
          }
          break;
        default:
          throw new Error('Unknown authentication type: ' + auth.type);
      }
    });
  };

  /**
   * Deserializes an HTTP response body into a value of the specified type.
   * @param {Object} response A SuperAgent response object.
   * @param {(String|Array.<String>|Object.<String, Object>|Function)} returnType The type to return. Pass a string for simple types
   * or the constructor function for a complex type. Pass an array containing the type name to return an array of that type. To
   * return an object, pass an object with one property whose name is the key type and whose value is the corresponding value type:
   * all properties on <code>data<code> will be converted to this type.
   * @returns A value of the specified type.
   */
  exports.prototype.deserialize = function deserialize(response, returnType) {
    if (response == null || returnType == null) {
      return null;
    }
    // Rely on SuperAgent for parsing response body.
    // See http://visionmedia.github.io/superagent/#parsing-response-bodies
    var data = response.body;
    if (data == null) {
      // SuperAgent does not always produce a body; use the unparsed response as a fallback
      data = response.text;
    }
    return exports.convertToType(data, returnType);
  };

  /**
   * Callback function to receive the result of the operation.
   * @callback module:ApiClient~callApiCallback
   * @param {String} error Error message, if any.
   * @param data The data returned by the service call.
   * @param {String} response The complete HTTP response.
   */

  /**
   * Invokes the REST service using the supplied settings and parameters.
   * @param {String} path The base URL to invoke.
   * @param {String} httpMethod The HTTP method to use.
   * @param {Object.<String, String>} pathParams A map of path parameters and their values.
   * @param {Object.<String, Object>} queryParams A map of query parameters and their values.
   * @param {Object.<String, Object>} headerParams A map of header parameters and their values.
   * @param {Object.<String, Object>} formParams A map of form parameters and their values.
   * @param {Object} bodyParam The value to pass as the request body.
   * @param {Array.<String>} authNames An array of authentication type names.
   * @param {Array.<String>} contentTypes An array of request MIME types.
   * @param {Array.<String>} accepts An array of acceptable response MIME types.
   * @param {(String|Array|ObjectFunction)} returnType The required type to return; can be a string for simple types or the
   * constructor for a complex type.
   * @param {module:ApiClient~callApiCallback} callback The callback function.
   * @returns {Object} The SuperAgent request object.
   */
  exports.prototype.callApi = function callApi(path, httpMethod, pathParams,
      queryParams, headerParams, formParams, bodyParam, authNames, contentTypes, accepts,
      returnType, callback) {

    var _this = this;
    var url = this.buildUrl(path, pathParams);
    var request = superagent(httpMethod, url);

    // apply authentications
    this.applyAuthToRequest(request, authNames);

    // set query parameters
    request.query(this.normalizeParams(queryParams));

    // set header parameters
    request.set(this.defaultHeaders).set(this.normalizeParams(headerParams));

    // set request timeout
    request.timeout(this.timeout);

    var contentType = this.jsonPreferredMime(contentTypes);
    if (contentType) {
      // Issue with superagent and multipart/form-data (https://github.com/visionmedia/superagent/issues/746)
      if(contentType != 'multipart/form-data') {
        request.type(contentType);
      }
    } else if (!request.header['Content-Type']) {
      request.type('application/json');
    }

    if (contentType === 'application/x-www-form-urlencoded') {
      request.send(this.normalizeParams(formParams));
    } else if (contentType == 'multipart/form-data') {
      var _formParams = this.normalizeParams(formParams);
      for (var key in _formParams) {
        if (_formParams.hasOwnProperty(key)) {
          if (this.isFileParam(_formParams[key])) {
            // file field
            request.attach(key, _formParams[key]);
          } else {
            request.field(key, _formParams[key]);
          }
        }
      }
    } else if (bodyParam) {
      request.send(bodyParam);
    }

    var accept = this.jsonPreferredMime(accepts);
    if (accept) {
      request.accept(accept);
    }


    request.end(function(error, response) {
      if (callback) {
        var data = null;
        if (!error) {
          data = _this.deserialize(response, returnType);
        }
        callback(error, data, response);
      }
    });

    return request;
  };

  /**
   * Parses an ISO-8601 string representation of a date value.
   * @param {String} str The date value as a string.
   * @returns {Date} The parsed date object.
   */
  exports.parseDate = function(str) {
    return new Date(str.replace(/T/i, ' '));
  };

  /**
   * Converts a value to the specified type.
   * @param {(String|Object)} data The data to convert, as a string or object.
   * @param {(String|Array.<String>|Object.<String, Object>|Function)} type The type to return. Pass a string for simple types
   * or the constructor function for a complex type. Pass an array containing the type name to return an array of that type. To
   * return an object, pass an object with one property whose name is the key type and whose value is the corresponding value type:
   * all properties on <code>data<code> will be converted to this type.
   * @returns An instance of the specified type.
   */
  exports.convertToType = function(data, type) {
    switch (type) {
      case 'Boolean':
        return Boolean(data);
      case 'Integer':
        return parseInt(data, 10);
      case 'Number':
        return parseFloat(data);
      case 'String':
        return String(data);
      case 'Date':
        return this.parseDate(String(data));
      default:
        if (type === Object) {
          // generic object, return directly
          return data;
        } else if (typeof type === 'function') {
          // for model type like: User
          return type.constructFromObject(data);
        } else if (Array.isArray(data)) {
          // for array type like: ['String']
          var itemType = type[0];
          
          return data.map(function(item) {
            return exports.convertToType(item, itemType);
          });
        } else if (typeof type === 'object') {
          // for plain object type like: {'String': 'Integer'}
          var keyType, valueType;
          for (var k in type) {
            if (type.hasOwnProperty(k)) {
              keyType = k;
              valueType = type[k];
              break;
            }
          }
          var result = {};
          for (var k in data) {
            if (data.hasOwnProperty(k)) {
              var key = exports.convertToType(k, keyType);
              var value = exports.convertToType(data[k], valueType);
              result[key] = value;
            }
          }
          return result;
        } else {
          // for unknown type, return the data directly
          return data;
        }
    }
  };

  /**
   * Constructs a new map or array model from REST data.
   * @param data {Object|Array} The REST data.
   * @param obj {Object|Array} The target object or array.
   */
  exports.constructFromObject = function(data, obj, itemType) {
    if (Array.isArray(data)) {
      for (var i = 0; i < data.length; i++) {
        if (data.hasOwnProperty(i))
          obj[i] = exports.convertToType(data[i], itemType);
      }
    } else {
      for (var k in data) {
        if (data.hasOwnProperty(k))
          obj[k] = exports.convertToType(data[k], itemType);
      }
    }
  };

  /**
   * The default API client implementation.
   * @type {module:ApiClient}
   */
  exports.instance = new exports();

  return exports;
}));

}).call(this,require("buffer").Buffer)
},{"buffer":14,"fs":13,"superagent":18}],4:[function(require,module,exports){
/**
 * TeSS API
 * Access, search and filter through collections of training materials, events, packages, and workflows in TeSS. As a rule of thumb - You can add .json to the end of most pages to retrieve the data in a common exchange format. e.g - https://tess.elixir-europe.org/events/software-carpentry-west-virginia-university.json - https://tess.elixir-europe.org/materials/rna-seq-de-novo-transcriptome-reconstruction-with-rna-seq.json - https://tess.elixir-europe.org/packages/biocomp-computing-skills-collection.json - https://tess.elixir-europe.org/workflows/das-internet-fur-biologen.json - https://tess.elixir-europe.org/nodes/united-kingdom.json
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Event'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/Event'));
  } else {
    // Browser globals (root is window)
    if (!root.TeSsApi) {
      root.TeSsApi = {};
    }
    root.TeSsApi.EventsApi = factory(root.TeSsApi.ApiClient, root.TeSsApi.Event);
  }
}(this, function(ApiClient, Event) {
  'use strict';

  /**
   * Events service.
   * @module api/EventsApi
   * @version 1.0.0
   */

  /**
   * Constructs a new EventsApi. 
   * @alias module:api/EventsApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the eventsJsonGet operation.
     * @callback module:api/EventsApi~eventsJsonGetCallback
     * @param {String} error Error message, if any.
     * @param {Array.<module:model/Event>} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Search over the collection of events
     * The base endpoint (events.json) returns the first page of events as seen on the UI (if you just go to &lt;tess&gt;/events). To navigate through and filter by attributes; use the below parameters. The returned value is an array of JSON objects described below. 
     * @param {Object} opts Optional parameters
     * @param {String} opts.q This is the search parameter. Enter terms and the resulting events will be those that include this term in their description, name, keywords, or URL.
     * @param {Boolean} opts.includeExpired When true; the results will return include events that have already occured. By default this is false and will only return upcoming events.
     * @param {String} opts.sort Sorts the results by a particular attribute. The options are &#39;asc&#39; (Title ascending), &#39;desc&#39; (Title descending), &#39;early&#39; (Earliest first), and &#39;late&#39; (Latest first).
     * @param {Number} opts.page Selects which page of results to return (e.g. 2)
     * @param {Array.<String>} opts.eventTypes Returns all events of a categorical type. These can be &#39;Meetings and conferences&#39; and &#39;Workshops and courses&#39;
     * @param {Boolean} opts.online Filters returned events by whether or not is an online event. This can include things like telecons, webinars, and MOOCs.
     * @param {Array.<String>} opts.country Returns all the events that will be hosted in a certain country (e.g. Portugal or United Kingdom)
     * @param {Array.<String>} opts.scientificTopics Returns all events annotated with a given scientific topic from the EDAM ontology.
     * @param {String} opts.tools Returns all events that have been associated with a given tool from the ELIXIR bio.tools registry.
     * @param {String} opts.standardDatabaseOrPolicy returns all events that have been associated with a database, standard, or policy from the ELIXIR biosharing.org registry
     * @param {Array.<String>} opts.organizer Returns all events that have been created by an organizing institution. This is different to content provider in that the content provider is the website that provided the information whereas the organizer was involved in creating it.
     * @param {Array.<String>} opts.city Returns all the events that are held in a certain city (e.g. London or Daghstul)
     * @param {Array.<String>} opts.sponsor Returns all the events that have been sponsored by a given institution or organization
     * @param {Array.<String>} opts.keyword Returns all the events that have been tagged with the given free text keywords
     * @param {Array.<String>} opts.contentProvider Returns all events from the content provider that provided records to TeSS (e.g. DTLS, GOBLET, Software Carpentry)
     * @param {Array.<String>} opts.venue Returns all events that are held in a venue (e.g. University of Melbourne or Harvard)
     * @param {Array.<String>} opts.node Returns all events that are associated with a specified ELIXIR node (e.g. Belgium or United+Kingdom)
     * @param {Array.<String>} opts.targetAudience Returns all events that have a selected target audience (e.g. Graduate students, Academics, Post-Docs)
     * @param {module:api/EventsApi~eventsJsonGetCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Array.<module:model/Event>}
     */
    this.eventsJsonGet = function(opts, callback) {
      opts = opts || {};
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
        'q': opts['q'],
        'include_expired': opts['includeExpired'],
        'sort': opts['sort'],
        'page': opts['page'],
        'event_types': this.apiClient.buildCollectionParam(opts['eventTypes'], 'multi'),
        'online': opts['online'],
        'country': this.apiClient.buildCollectionParam(opts['country'], 'multi'),
        'scientific_topics': this.apiClient.buildCollectionParam(opts['scientificTopics'], 'multi'),
        'tools': opts['tools'],
        'standard_database_or_policy': opts['standardDatabaseOrPolicy'],
        'organizer': this.apiClient.buildCollectionParam(opts['organizer'], 'multi'),
        'city': this.apiClient.buildCollectionParam(opts['city'], 'multi'),
        'sponsor': this.apiClient.buildCollectionParam(opts['sponsor'], 'multi'),
        'keyword': this.apiClient.buildCollectionParam(opts['keyword'], 'multi'),
        'content_provider': this.apiClient.buildCollectionParam(opts['contentProvider'], 'multi'),
        'venue': this.apiClient.buildCollectionParam(opts['venue'], 'multi'),
        'node': this.apiClient.buildCollectionParam(opts['node'], 'multi'),
        'target_audience': this.apiClient.buildCollectionParam(opts['targetAudience'], 'multi')
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json'];
      var returnType = [Event];

      return this.apiClient.callApi(
        '/events.json', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the eventsSlugJsonGet operation.
     * @callback module:api/EventsApi~eventsSlugJsonGetCallback
     * @param {String} error Error message, if any.
     * @param {Array.<module:model/Event>} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get all the information stored about a particular event in TeSS.
     * Use the slug name of the event (lowercase hypenathed) to return a JSON object. e.g. https://tess.elixir-europe.org/events/software-carpentry-229th-aas-meeting.json - See the response schema to find out what fields are returned and what type each field is. This operation does not permit any parameters except the name as part of the URL. the name is a _slug_ of the title (lowercase + hypenated)
     * @param {String} slug The _slug_ id of an event e.g. software-carpentry-229th-aas-meeting
     * @param {module:api/EventsApi~eventsSlugJsonGetCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Array.<module:model/Event>}
     */
    this.eventsSlugJsonGet = function(slug, callback) {
      var postBody = null;

      // verify the required parameter 'slug' is set
      if (slug == undefined || slug == null) {
        throw new Error("Missing the required parameter 'slug' when calling eventsSlugJsonGet");
      }


      var pathParams = {
        'slug': slug
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json'];
      var returnType = [Event];

      return this.apiClient.callApi(
        '/events/{slug}.json', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":3,"../model/Event":7}],5:[function(require,module,exports){
/**
 * TeSS API
 * Access, search and filter through collections of training materials, events, packages, and workflows in TeSS. As a rule of thumb - You can add .json to the end of most pages to retrieve the data in a common exchange format. e.g - https://tess.elixir-europe.org/events/software-carpentry-west-virginia-university.json - https://tess.elixir-europe.org/materials/rna-seq-de-novo-transcriptome-reconstruction-with-rna-seq.json - https://tess.elixir-europe.org/packages/biocomp-computing-skills-collection.json - https://tess.elixir-europe.org/workflows/das-internet-fur-biologen.json - https://tess.elixir-europe.org/nodes/united-kingdom.json
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Material', 'model/ShortMaterial'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/Material'), require('../model/ShortMaterial'));
  } else {
    // Browser globals (root is window)
    if (!root.TeSsApi) {
      root.TeSsApi = {};
    }
    root.TeSsApi.MaterialsApi = factory(root.TeSsApi.ApiClient, root.TeSsApi.Material, root.TeSsApi.ShortMaterial);
  }
}(this, function(ApiClient, Material, ShortMaterial) {
  'use strict';

  /**
   * Materials service.
   * @module api/MaterialsApi
   * @version 1.0.0
   */

  /**
   * Constructs a new MaterialsApi. 
   * @alias module:api/MaterialsApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the materialsJsonGet operation.
     * @callback module:api/MaterialsApi~materialsJsonGetCallback
     * @param {String} error Error message, if any.
     * @param {Array.<module:model/ShortMaterial>} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Search over the collection of training materials
     * The base url (materials.json) returns the first page of materials as seen on the UI (if you just go to /materials). To navigate through and filter out; use the below parameters. The returned value is an array of JSON objects. These parameters in JSON are formed exactly the same as within the UI so it is worth experimenting by clicking filters in the website and changing /materials to /materials.json to see how to create valid JSON requests.      Combining different types of filters does a logical AND between filters, whereas combining different values from the same kind of filter does a logical OR between values.       For example (scientific topic is &#39;Bioinformatics&#39; OR &#39;Data visualisation&#39;) AND (target_audience is &#39;Life Science Researchers&#39; OR &#39;PHD Students&#39;)  
     * @param {Object} opts Optional parameters
     * @param {String} opts.q This is the search parameter. Enter terms and the resulting materials will be those that include this term in their description, name, keywords, or URL.
     * @param {String} opts.sort Sorts the results by a particular attribute. The options are &#39;asc&#39; (Title ascending), &#39;desc&#39; (Title descending), &#39;early&#39; (Earliest first), and &#39;late&#39; (Latest first). (default to desc)
     * @param {Number} opts.page Selects which page of results to return (e.g. 2) (default to 0.0)
     * @param {Array.<String>} opts.scientificTopics Returns all materials annotated with a certain scientific topic using EDAM (e.g. Alignment or Data+Visualization)
     * @param {Array.<String>} opts.contentProvider Returns all materials from the content provider that provided records to TeSS (e.g. Goblet or Erasys+App)
     * @param {Array.<String>} opts.tools Returns all materials that have been associated with a given tool from the ELIXIR bio.tools registry.
     * @param {Array.<String>} opts.standardDatabaseOrPolicy returns all materials that have been associated with a database, standard, or policy from the ELIXIR biosharing.org registry
     * @param {Array.<String>} opts.targetAudience Returns all the materials for an intended audience (e.g. PhD Student or Bench Biologist)
     * @param {Array.<String>} opts.keywords Returns all the materials that use this keyword to describe it.
     * @param {Array.<String>} opts.difficultyLevel Returns all materials with the selected difficultly level (e.g. Intermediate or Novice)
     * @param {Array.<String>} opts.authors Returns all materials by the specified author (e.g. John+Smith or Sarah+Michelle+Gellar
     * @param {Array.<String>} opts.contributors Returns all materials where a given name has contribuetd to it (e.g. John+Smith or Sarah+Michelle+Gellar
     * @param {Array.<String>} opts.licence Returns all materials that have this licence associated with it. Licences are from a set list which can be found here https://github.com/ElixirUK/TeSS/blob/master/config/dictionaries/licences.yml - The term to use is the &#39;title&#39; attribute
     * @param {Array.<String>} opts.node Returns all materials that have been developed by an ELIXIR node (e.g. Belgium or United+Kingdom)
     * @param {module:api/MaterialsApi~materialsJsonGetCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Array.<module:model/ShortMaterial>}
     */
    this.materialsJsonGet = function(opts, callback) {
      opts = opts || {};
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
        'q': opts['q'],
        'sort': opts['sort'],
        'page': opts['page'],
        'scientific_topics': this.apiClient.buildCollectionParam(opts['scientificTopics'], 'multi'),
        'content_provider': this.apiClient.buildCollectionParam(opts['contentProvider'], 'multi'),
        'tools': this.apiClient.buildCollectionParam(opts['tools'], 'multi'),
        'standard_database_or_policy': this.apiClient.buildCollectionParam(opts['standardDatabaseOrPolicy'], 'multi'),
        'target_audience': this.apiClient.buildCollectionParam(opts['targetAudience'], 'multi'),
        'keywords': this.apiClient.buildCollectionParam(opts['keywords'], 'multi'),
        'difficulty_level': this.apiClient.buildCollectionParam(opts['difficultyLevel'], 'multi'),
        'authors': this.apiClient.buildCollectionParam(opts['authors'], 'multi'),
        'contributors': this.apiClient.buildCollectionParam(opts['contributors'], 'multi'),
        'licence': this.apiClient.buildCollectionParam(opts['licence'], 'multi'),
        'node': this.apiClient.buildCollectionParam(opts['node'], 'multi')
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json'];
      var returnType = [ShortMaterial];

      return this.apiClient.callApi(
        '/materials.json', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the materialsNameJsonGet operation.
     * @callback module:api/MaterialsApi~materialsNameJsonGetCallback
     * @param {String} error Error message, if any.
     * @param {Array.<module:model/Material>} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Get all the information stored about a particular training material in TeSS.
     * Use the name of the training material to return a JSON object. e.g. https://tess.elixir-europe.org/materials/advanced-statistics-in-r.json - See the response schema to find out what fields are returned and what type each field is. This operation does not permit any parameters except the name as part of the URL. the name is a _slug_ of the title (lowercase + hypenated)
     * @param {String} name The _slug_ id of a training material e.g. advanced-statistics-in-r
     * @param {module:api/MaterialsApi~materialsNameJsonGetCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Array.<module:model/Material>}
     */
    this.materialsNameJsonGet = function(name, callback) {
      var postBody = null;

      // verify the required parameter 'name' is set
      if (name == undefined || name == null) {
        throw new Error("Missing the required parameter 'name' when calling materialsNameJsonGet");
      }


      var pathParams = {
        'name': name
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json'];
      var returnType = [Material];

      return this.apiClient.callApi(
        '/materials/{name}.json', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":3,"../model/Material":9,"../model/ShortMaterial":12}],6:[function(require,module,exports){
/**
 * TeSS API
 * Access, search and filter through collections of training materials, events, packages, and workflows in TeSS. As a rule of thumb - You can add .json to the end of most pages to retrieve the data in a common exchange format. e.g - https://tess.elixir-europe.org/events/software-carpentry-west-virginia-university.json - https://tess.elixir-europe.org/materials/rna-seq-de-novo-transcriptome-reconstruction-with-rna-seq.json - https://tess.elixir-europe.org/packages/biocomp-computing-skills-collection.json - https://tess.elixir-europe.org/workflows/das-internet-fur-biologen.json - https://tess.elixir-europe.org/nodes/united-kingdom.json
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Event', 'model/ExternalResource', 'model/Material', 'model/ScientificTopic', 'model/ShortEvent', 'model/ShortMaterial', 'api/EventsApi', 'api/MaterialsApi'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('./ApiClient'), require('./model/Event'), require('./model/ExternalResource'), require('./model/Material'), require('./model/ScientificTopic'), require('./model/ShortEvent'), require('./model/ShortMaterial'), require('./api/EventsApi'), require('./api/MaterialsApi'));
  }
}(function(ApiClient, Event, ExternalResource, Material, ScientificTopic, ShortEvent, ShortMaterial, EventsApi, MaterialsApi) {
  'use strict';

  /**
   * Access_search_and_filter_through_collections_of_training_materials_events_packages_and_workflows_in_TeSS_As_a_rule_of_thumb___You_can_add__json_to_the_end_of_most_pages_to_retrieve_the_data_in_a_common_exchange_format__e_g__httpstess_elixir_europe_orgeventssoftware_carpentry_west_virginia_university_json__httpstess_elixir_europe_orgmaterialsrna_seq_de_novo_transcriptome_reconstruction_with_rna_seq_json__httpstess_elixir_europe_orgpackagesbiocomp_computing_skills_collection_json__httpstess_elixir_europe_orgworkflowsdas_internet_fur_biologen_json__httpstess_elixir_europe_orgnodesunited_kingdom_json.<br>
   * The <code>index</code> module provides access to constructors for all the classes which comprise the public API.
   * <p>
   * An AMD (recommended!) or CommonJS application will generally do something equivalent to the following:
   * <pre>
   * var TeSsApi = require('index'); // See note below*.
   * var xxxSvc = new TeSsApi.XxxApi(); // Allocate the API class we're going to use.
   * var yyyModel = new TeSsApi.Yyy(); // Construct a model instance.
   * yyyModel.someProperty = 'someValue';
   * ...
   * var zzz = xxxSvc.doSomething(yyyModel); // Invoke the service.
   * ...
   * </pre>
   * <em>*NOTE: For a top-level AMD script, use require(['index'], function(){...})
   * and put the application logic within the callback function.</em>
   * </p>
   * <p>
   * A non-AMD browser application (discouraged) might do something like this:
   * <pre>
   * var xxxSvc = new TeSsApi.XxxApi(); // Allocate the API class we're going to use.
   * var yyy = new TeSsApi.Yyy(); // Construct a model instance.
   * yyyModel.someProperty = 'someValue';
   * ...
   * var zzz = xxxSvc.doSomething(yyyModel); // Invoke the service.
   * ...
   * </pre>
   * </p>
   * @module index
   * @version 1.0.0
   */
  var exports = {
    /**
     * The ApiClient constructor.
     * @property {module:ApiClient}
     */
    ApiClient: ApiClient,
    /**
     * The Event model constructor.
     * @property {module:model/Event}
     */
    Event: Event,
    /**
     * The ExternalResource model constructor.
     * @property {module:model/ExternalResource}
     */
    ExternalResource: ExternalResource,
    /**
     * The Material model constructor.
     * @property {module:model/Material}
     */
    Material: Material,
    /**
     * The ScientificTopic model constructor.
     * @property {module:model/ScientificTopic}
     */
    ScientificTopic: ScientificTopic,
    /**
     * The ShortEvent model constructor.
     * @property {module:model/ShortEvent}
     */
    ShortEvent: ShortEvent,
    /**
     * The ShortMaterial model constructor.
     * @property {module:model/ShortMaterial}
     */
    ShortMaterial: ShortMaterial,
    /**
     * The EventsApi service constructor.
     * @property {module:api/EventsApi}
     */
    EventsApi: EventsApi,
    /**
     * The MaterialsApi service constructor.
     * @property {module:api/MaterialsApi}
     */
    MaterialsApi: MaterialsApi
  };

  return exports;
}));

},{"./ApiClient":3,"./api/EventsApi":4,"./api/MaterialsApi":5,"./model/Event":7,"./model/ExternalResource":8,"./model/Material":9,"./model/ScientificTopic":10,"./model/ShortEvent":11,"./model/ShortMaterial":12}],7:[function(require,module,exports){
/**
 * TeSS API
 * Access, search and filter through collections of training materials, events, packages, and workflows in TeSS. As a rule of thumb - You can add .json to the end of most pages to retrieve the data in a common exchange format. e.g - https://tess.elixir-europe.org/events/software-carpentry-west-virginia-university.json - https://tess.elixir-europe.org/materials/rna-seq-de-novo-transcriptome-reconstruction-with-rna-seq.json - https://tess.elixir-europe.org/packages/biocomp-computing-skills-collection.json - https://tess.elixir-europe.org/workflows/das-internet-fur-biologen.json - https://tess.elixir-europe.org/nodes/united-kingdom.json
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/ScientificTopic'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./ScientificTopic'));
  } else {
    // Browser globals (root is window)
    if (!root.TeSsApi) {
      root.TeSsApi = {};
    }
    root.TeSsApi.Event = factory(root.TeSsApi.ApiClient, root.TeSsApi.ScientificTopic);
  }
}(this, function(ApiClient, ScientificTopic) {
  'use strict';




  /**
   * The Event model module.
   * @module model/Event
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>Event</code>.
   * @alias module:model/Event
   * @class
   */
  var exports = function() {
    var _this = this;



























  };

  /**
   * Constructs a <code>Event</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Event} obj Optional instance to populate.
   * @return {module:model/Event} The populated <code>Event</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('title')) {
        obj['title'] = ApiClient.convertToType(data['title'], 'String');
      }
      if (data.hasOwnProperty('subtitle')) {
        obj['subtitle'] = ApiClient.convertToType(data['subtitle'], 'String');
      }
      if (data.hasOwnProperty('url')) {
        obj['url'] = ApiClient.convertToType(data['url'], 'String');
      }
      if (data.hasOwnProperty('organizer')) {
        obj['organizer'] = ApiClient.convertToType(data['organizer'], 'String');
      }
      if (data.hasOwnProperty('description')) {
        obj['description'] = ApiClient.convertToType(data['description'], 'String');
      }
      if (data.hasOwnProperty('start')) {
        obj['start'] = ApiClient.convertToType(data['start'], 'Date');
      }
      if (data.hasOwnProperty('end')) {
        obj['end'] = ApiClient.convertToType(data['end'], 'Date');
      }
      if (data.hasOwnProperty('sponsor')) {
        obj['sponsor'] = ApiClient.convertToType(data['sponsor'], 'String');
      }
      if (data.hasOwnProperty('venue')) {
        obj['venue'] = ApiClient.convertToType(data['venue'], 'String');
      }
      if (data.hasOwnProperty('city')) {
        obj['city'] = ApiClient.convertToType(data['city'], 'String');
      }
      if (data.hasOwnProperty('country')) {
        obj['country'] = ApiClient.convertToType(data['country'], 'String');
      }
      if (data.hasOwnProperty('county')) {
        obj['county'] = ApiClient.convertToType(data['county'], 'String');
      }
      if (data.hasOwnProperty('postcode')) {
        obj['postcode'] = ApiClient.convertToType(data['postcode'], 'String');
      }
      if (data.hasOwnProperty('latitude')) {
        obj['latitude'] = ApiClient.convertToType(data['latitude'], 'String');
      }
      if (data.hasOwnProperty('longitude')) {
        obj['longitude'] = ApiClient.convertToType(data['longitude'], 'String');
      }
      if (data.hasOwnProperty('created_at')) {
        obj['created_at'] = ApiClient.convertToType(data['created_at'], 'Date');
      }
      if (data.hasOwnProperty('updated_at')) {
        obj['updated_at'] = ApiClient.convertToType(data['updated_at'], 'Date');
      }
      if (data.hasOwnProperty('keywords')) {
        obj['keywords'] = ApiClient.convertToType(data['keywords'], ['String']);
      }
      if (data.hasOwnProperty('event_types')) {
        obj['event_types'] = ApiClient.convertToType(data['event_types'], ['String']);
      }
      if (data.hasOwnProperty('target_audience')) {
        obj['target_audience'] = ApiClient.convertToType(data['target_audience'], ['String']);
      }
      if (data.hasOwnProperty('capacity')) {
        obj['capacity'] = ApiClient.convertToType(data['capacity'], ['String']);
      }
      if (data.hasOwnProperty('eligibility')) {
        obj['eligibility'] = ApiClient.convertToType(data['eligibility'], ['String']);
      }
      if (data.hasOwnProperty('contact')) {
        obj['contact'] = ApiClient.convertToType(data['contact'], 'String');
      }
      if (data.hasOwnProperty('host_institutions')) {
        obj['host_institutions'] = ApiClient.convertToType(data['host_institutions'], ['String']);
      }
      if (data.hasOwnProperty('scientific_topics')) {
        obj['scientific_topics'] = ApiClient.convertToType(data['scientific_topics'], [ScientificTopic]);
      }
    }
    return obj;
  }

  /**
   * Unique identifier of the event
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * The title of the event
   * @member {String} title
   */
  exports.prototype['title'] = undefined;
  /**
   * The subtitle of the event
   * @member {String} subtitle
   */
  exports.prototype['subtitle'] = undefined;
  /**
   * The URL where the actual event can be found.
   * @member {String} url
   */
  exports.prototype['url'] = undefined;
  /**
   * The organization responsible for creating the event.
   * @member {String} organizer
   */
  exports.prototype['organizer'] = undefined;
  /**
   * A succinct description of what the event is about.
   * @member {String} description
   */
  exports.prototype['description'] = undefined;
  /**
   * The date and time the event starts on
   * @member {Date} start
   */
  exports.prototype['start'] = undefined;
  /**
   * The date and time the event ends on.
   * @member {Date} end
   */
  exports.prototype['end'] = undefined;
  /**
   * The person or organization that is sponsoring the event.
   * @member {String} sponsor
   */
  exports.prototype['sponsor'] = undefined;
  /**
   * The name of the building the event will be hosted in
   * @member {String} venue
   */
  exports.prototype['venue'] = undefined;
  /**
   * The city the event will be hosted in
   * @member {String} city
   */
  exports.prototype['city'] = undefined;
  /**
   * The regional county the event will be hosted in
   * @member {String} country
   */
  exports.prototype['country'] = undefined;
  /**
   * The name of country the event will be hosted in
   * @member {String} county
   */
  exports.prototype['county'] = undefined;
  /**
   * The postcode of the venue hosting the event
   * @member {String} postcode
   */
  exports.prototype['postcode'] = undefined;
  /**
   * The latitude co-ordinate of the event.
   * @member {String} latitude
   */
  exports.prototype['latitude'] = undefined;
  /**
   * The longitude co-ordinate of the event.
   * @member {String} longitude
   */
  exports.prototype['longitude'] = undefined;
  /**
   * The date the event was first created on TeSS
   * @member {Date} created_at
   */
  exports.prototype['created_at'] = undefined;
  /**
   * The date the event was last updated on TeSS
   * @member {Date} updated_at
   */
  exports.prototype['updated_at'] = undefined;
  /**
   * A series of freetext words used to describe an event.
   * @member {Array.<String>} keywords
   */
  exports.prototype['keywords'] = undefined;
  /**
   * The category of the event. This could be a meeting or a course; or if unknown or neither, an event
   * @member {Array.<String>} event_types
   */
  exports.prototype['event_types'] = undefined;
  /**
   * The intended audience of the event. This can includes things like scientific discpline and expertise level
   * @member {Array.<String>} target_audience
   */
  exports.prototype['target_audience'] = undefined;
  /**
   * The number of people allowed to attend the event
   * @member {Array.<String>} capacity
   */
  exports.prototype['capacity'] = undefined;
  /**
   * Various criteria require to participate in the event
   * @member {Array.<String>} eligibility
   */
  exports.prototype['eligibility'] = undefined;
  /**
   * The name and/or contact details of a person or institution organizing the event
   * @member {String} contact
   */
  exports.prototype['contact'] = undefined;
  /**
   * The institution physically hosting the event
   * @member {Array.<String>} host_institutions
   */
  exports.prototype['host_institutions'] = undefined;
  /**
   * The classification of the material based on the EDAM ontologies scientific topics.
   * @member {Array.<module:model/ScientificTopic>} scientific_topics
   */
  exports.prototype['scientific_topics'] = undefined;



  return exports;
}));



},{"../ApiClient":3,"./ScientificTopic":10}],8:[function(require,module,exports){
/**
 * TeSS API
 * Access, search and filter through collections of training materials, events, packages, and workflows in TeSS. As a rule of thumb - You can add .json to the end of most pages to retrieve the data in a common exchange format. e.g - https://tess.elixir-europe.org/events/software-carpentry-west-virginia-university.json - https://tess.elixir-europe.org/materials/rna-seq-de-novo-transcriptome-reconstruction-with-rna-seq.json - https://tess.elixir-europe.org/packages/biocomp-computing-skills-collection.json - https://tess.elixir-europe.org/workflows/das-internet-fur-biologen.json - https://tess.elixir-europe.org/nodes/united-kingdom.json
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.TeSsApi) {
      root.TeSsApi = {};
    }
    root.TeSsApi.ExternalResource = factory(root.TeSsApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The ExternalResource model module.
   * @module model/ExternalResource
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>ExternalResource</code>.
   * @alias module:model/ExternalResource
   * @class
   */
  var exports = function() {
    var _this = this;







  };

  /**
   * Constructs a <code>ExternalResource</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ExternalResource} obj Optional instance to populate.
   * @return {module:model/ExternalResource} The populated <code>ExternalResource</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('title')) {
        obj['title'] = ApiClient.convertToType(data['title'], 'String');
      }
      if (data.hasOwnProperty('url')) {
        obj['url'] = ApiClient.convertToType(data['url'], 'String');
      }
      if (data.hasOwnProperty('created_at')) {
        obj['created_at'] = ApiClient.convertToType(data['created_at'], 'Date');
      }
      if (data.hasOwnProperty('updated_at')) {
        obj['updated_at'] = ApiClient.convertToType(data['updated_at'], 'Date');
      }
      if (data.hasOwnProperty('api_url')) {
        obj['api_url'] = ApiClient.convertToType(data['api_url'], 'String');
      }
      if (data.hasOwnProperty('type')) {
        obj['type'] = ApiClient.convertToType(data['type'], 'String');
      }
    }
    return obj;
  }

  /**
   * Title of the external resource
   * @member {String} title
   */
  exports.prototype['title'] = undefined;
  /**
   * A URL that resolves to a description of an external resource or the external resource itself.
   * @member {String} url
   */
  exports.prototype['url'] = undefined;
  /**
   * The date the association was created between this resource and the external resource within TeSS.
   * @member {Date} created_at
   */
  exports.prototype['created_at'] = undefined;
  /**
   * The date the association was last update between this resource and the external resource within TeSS.
   * @member {Date} updated_at
   */
  exports.prototype['updated_at'] = undefined;
  /**
   * A URL that resolves to more information about the external resource represented in a common exchange format (e.g. JSON or XML)
   * @member {String} api_url
   */
  exports.prototype['api_url'] = undefined;
  /**
   * The type of external resource. This can be 'tool', 'database, policy or standard' for bio.tools and bio.sharing respectively or any other resource type name for other external resources.
   * @member {String} type
   */
  exports.prototype['type'] = undefined;



  return exports;
}));



},{"../ApiClient":3}],9:[function(require,module,exports){
/**
 * TeSS API
 * Access, search and filter through collections of training materials, events, packages, and workflows in TeSS. As a rule of thumb - You can add .json to the end of most pages to retrieve the data in a common exchange format. e.g - https://tess.elixir-europe.org/events/software-carpentry-west-virginia-university.json - https://tess.elixir-europe.org/materials/rna-seq-de-novo-transcriptome-reconstruction-with-rna-seq.json - https://tess.elixir-europe.org/packages/biocomp-computing-skills-collection.json - https://tess.elixir-europe.org/workflows/das-internet-fur-biologen.json - https://tess.elixir-europe.org/nodes/united-kingdom.json
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/ExternalResource', 'model/ScientificTopic'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./ExternalResource'), require('./ScientificTopic'));
  } else {
    // Browser globals (root is window)
    if (!root.TeSsApi) {
      root.TeSsApi = {};
    }
    root.TeSsApi.Material = factory(root.TeSsApi.ApiClient, root.TeSsApi.ExternalResource, root.TeSsApi.ScientificTopic);
  }
}(this, function(ApiClient, ExternalResource, ScientificTopic) {
  'use strict';




  /**
   * The Material model module.
   * @module model/Material
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>Material</code>.
   * @alias module:model/Material
   * @class
   */
  var exports = function() {
    var _this = this;























  };

  /**
   * Constructs a <code>Material</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Material} obj Optional instance to populate.
   * @return {module:model/Material} The populated <code>Material</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('title')) {
        obj['title'] = ApiClient.convertToType(data['title'], 'String');
      }
      if (data.hasOwnProperty('url')) {
        obj['url'] = ApiClient.convertToType(data['url'], 'String');
      }
      if (data.hasOwnProperty('short_description')) {
        obj['short_description'] = ApiClient.convertToType(data['short_description'], 'String');
      }
      if (data.hasOwnProperty('long_description')) {
        obj['long_description'] = ApiClient.convertToType(data['long_description'], 'String');
      }
      if (data.hasOwnProperty('doi')) {
        obj['doi'] = ApiClient.convertToType(data['doi'], 'String');
      }
      if (data.hasOwnProperty('remote_updated_date')) {
        obj['remote_updated_date'] = ApiClient.convertToType(data['remote_updated_date'], 'Date');
      }
      if (data.hasOwnProperty('remote_created_date')) {
        obj['remote_created_date'] = ApiClient.convertToType(data['remote_created_date'], 'Date');
      }
      if (data.hasOwnProperty('created_at')) {
        obj['created_at'] = ApiClient.convertToType(data['created_at'], 'Date');
      }
      if (data.hasOwnProperty('updated_at')) {
        obj['updated_at'] = ApiClient.convertToType(data['updated_at'], 'Date');
      }
      if (data.hasOwnProperty('package_ids')) {
        obj['package_ids'] = ApiClient.convertToType(data['package_ids'], ['Number']);
      }
      if (data.hasOwnProperty('content_provider_id')) {
        obj['content_provider_id'] = ApiClient.convertToType(data['content_provider_id'], 'Number');
      }
      if (data.hasOwnProperty('keywords')) {
        obj['keywords'] = ApiClient.convertToType(data['keywords'], ['String']);
      }
      if (data.hasOwnProperty('scientific_topics')) {
        obj['scientific_topics'] = ApiClient.convertToType(data['scientific_topics'], [ScientificTopic]);
      }
      if (data.hasOwnProperty('licence')) {
        obj['licence'] = ApiClient.convertToType(data['licence'], 'String');
      }
      if (data.hasOwnProperty('difficulty_level')) {
        obj['difficulty_level'] = ApiClient.convertToType(data['difficulty_level'], 'String');
      }
      if (data.hasOwnProperty('authors')) {
        obj['authors'] = ApiClient.convertToType(data['authors'], ['String']);
      }
      if (data.hasOwnProperty('contributors')) {
        obj['contributors'] = ApiClient.convertToType(data['contributors'], ['String']);
      }
      if (data.hasOwnProperty('target_audience')) {
        obj['target_audience'] = ApiClient.convertToType(data['target_audience'], ['String']);
      }
      if (data.hasOwnProperty('external_resources')) {
        obj['external_resources'] = ApiClient.convertToType(data['external_resources'], [ExternalResource]);
      }
      if (data.hasOwnProperty('slug')) {
        obj['slug'] = ApiClient.convertToType(data['slug'], 'String');
      }
      if (data.hasOwnProperty('user_id')) {
        obj['user_id'] = ApiClient.convertToType(data['user_id'], 'Number');
      }
    }
    return obj;
  }

  /**
   * Unique identifier of the material
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * The title of the material
   * @member {String} title
   */
  exports.prototype['title'] = undefined;
  /**
   * The URL where the actual material can be found.
   * @member {String} url
   */
  exports.prototype['url'] = undefined;
  /**
   * A succinct description of what the training material is about.
   * @member {String} short_description
   */
  exports.prototype['short_description'] = undefined;
  /**
   * A longer, more indepth explanation of the content of the training material.
   * @member {String} long_description
   */
  exports.prototype['long_description'] = undefined;
  /**
   * The DOI of the material (if it has one).
   * @member {String} doi
   */
  exports.prototype['doi'] = undefined;
  /**
   * The date the material was last updated on it's original site
   * @member {Date} remote_updated_date
   */
  exports.prototype['remote_updated_date'] = undefined;
  /**
   * The date the material was first created on it's original site
   * @member {Date} remote_created_date
   */
  exports.prototype['remote_created_date'] = undefined;
  /**
   * The date the material was first created on TeSS
   * @member {Date} created_at
   */
  exports.prototype['created_at'] = undefined;
  /**
   * The date the material was last updated on TeSS
   * @member {Date} updated_at
   */
  exports.prototype['updated_at'] = undefined;
  /**
   * IDs of training packages this material belongs to
   * @member {Array.<Number>} package_ids
   */
  exports.prototype['package_ids'] = undefined;
  /**
   * The ID of the content provider this material was sourced from
   * @member {Number} content_provider_id
   */
  exports.prototype['content_provider_id'] = undefined;
  /**
   * A list of freetext keywords to describe the material
   * @member {Array.<String>} keywords
   */
  exports.prototype['keywords'] = undefined;
  /**
   * The classification of the material based on the EDAM ontologies scientific topics.
   * @member {Array.<module:model/ScientificTopic>} scientific_topics
   */
  exports.prototype['scientific_topics'] = undefined;
  /**
   * The licence chosed to determine how the material may be re-used.
   * @member {String} licence
   */
  exports.prototype['licence'] = undefined;
  /**
   * The difficulty level comprehension of the material requires. Can be Beginner, Intermediate, Advanced, or Not specified.
   * @member {String} difficulty_level
   */
  exports.prototype['difficulty_level'] = undefined;
  /**
   * A list of people who wrote or helped write the material
   * @member {Array.<String>} authors
   */
  exports.prototype['authors'] = undefined;
  /**
   * Any person who was not the author but contributed in some way. Maybe they produced some software used, reviewed the paper, or helped inspire the author
   * @member {Array.<String>} contributors
   */
  exports.prototype['contributors'] = undefined;
  /**
   * The audience the material was intended for.
   * @member {Array.<String>} target_audience
   */
  exports.prototype['target_audience'] = undefined;
  /**
   * A list of external resources associated with this tool. These are largely tools from bio.tools, and standards, databases, and policies from biosharing.org - but can be anything.
   * @member {Array.<module:model/ExternalResource>} external_resources
   */
  exports.prototype['external_resources'] = undefined;
  /**
   * @member {String} slug
   */
  exports.prototype['slug'] = undefined;
  /**
   * @member {Number} user_id
   */
  exports.prototype['user_id'] = undefined;



  return exports;
}));



},{"../ApiClient":3,"./ExternalResource":8,"./ScientificTopic":10}],10:[function(require,module,exports){
/**
 * TeSS API
 * Access, search and filter through collections of training materials, events, packages, and workflows in TeSS. As a rule of thumb - You can add .json to the end of most pages to retrieve the data in a common exchange format. e.g - https://tess.elixir-europe.org/events/software-carpentry-west-virginia-university.json - https://tess.elixir-europe.org/materials/rna-seq-de-novo-transcriptome-reconstruction-with-rna-seq.json - https://tess.elixir-europe.org/packages/biocomp-computing-skills-collection.json - https://tess.elixir-europe.org/workflows/das-internet-fur-biologen.json - https://tess.elixir-europe.org/nodes/united-kingdom.json
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.TeSsApi) {
      root.TeSsApi = {};
    }
    root.TeSsApi.ScientificTopic = factory(root.TeSsApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The ScientificTopic model module.
   * @module model/ScientificTopic
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>ScientificTopic</code>.
   * @alias module:model/ScientificTopic
   * @class
   */
  var exports = function() {
    var _this = this;





























  };

  /**
   * Constructs a <code>ScientificTopic</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ScientificTopic} obj Optional instance to populate.
   * @return {module:model/ScientificTopic} The populated <code>ScientificTopic</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('preferred_label')) {
        obj['preferred_label'] = ApiClient.convertToType(data['preferred_label'], 'String');
      }
      if (data.hasOwnProperty('obsolete')) {
        obj['obsolete'] = ApiClient.convertToType(data['obsolete'], 'Boolean');
      }
      if (data.hasOwnProperty('created_in')) {
        obj['created_in'] = ApiClient.convertToType(data['created_in'], 'String');
      }
      if (data.hasOwnProperty('documentation')) {
        obj['documentation'] = ApiClient.convertToType(data['documentation'], 'String');
      }
      if (data.hasOwnProperty('prefix_iri')) {
        obj['prefix_iri'] = ApiClient.convertToType(data['prefix_iri'], 'String');
      }
      if (data.hasOwnProperty('has_definition')) {
        obj['has_definition'] = ApiClient.convertToType(data['has_definition'], 'String');
      }
      if (data.hasOwnProperty('saved_by')) {
        obj['saved_by'] = ApiClient.convertToType(data['saved_by'], 'String');
      }
      if (data.hasOwnProperty('obsolete_since')) {
        obj['obsolete_since'] = ApiClient.convertToType(data['obsolete_since'], 'String');
      }
      if (data.hasOwnProperty('created_at')) {
        obj['created_at'] = ApiClient.convertToType(data['created_at'], 'Date');
      }
      if (data.hasOwnProperty('updated_at')) {
        obj['updated_at'] = ApiClient.convertToType(data['updated_at'], 'Date');
      }
      if (data.hasOwnProperty('class_id')) {
        obj['class_id'] = ApiClient.convertToType(data['class_id'], 'String');
      }
      if (data.hasOwnProperty('slug')) {
        obj['slug'] = ApiClient.convertToType(data['slug'], 'String');
      }
      if (data.hasOwnProperty('synonyms')) {
        obj['synonyms'] = ApiClient.convertToType(data['synonyms'], ['String']);
      }
      if (data.hasOwnProperty('definitions')) {
        obj['definitions'] = ApiClient.convertToType(data['definitions'], ['String']);
      }
      if (data.hasOwnProperty('parents')) {
        obj['parents'] = ApiClient.convertToType(data['parents'], ['String']);
      }
      if (data.hasOwnProperty('consider')) {
        obj['consider'] = ApiClient.convertToType(data['consider'], ['String']);
      }
      if (data.hasOwnProperty('has_alternative_id')) {
        obj['has_alternative_id'] = ApiClient.convertToType(data['has_alternative_id'], ['String']);
      }
      if (data.hasOwnProperty('has_broad_synonym')) {
        obj['has_broad_synonym'] = ApiClient.convertToType(data['has_broad_synonym'], ['String']);
      }
      if (data.hasOwnProperty('has_dbxref')) {
        obj['has_dbxref'] = ApiClient.convertToType(data['has_dbxref'], ['String']);
      }
      if (data.hasOwnProperty('has_exact_synonym')) {
        obj['has_exact_synonym'] = ApiClient.convertToType(data['has_exact_synonym'], ['String']);
      }
      if (data.hasOwnProperty('has_related_synonym')) {
        obj['has_related_synonym'] = ApiClient.convertToType(data['has_related_synonym'], ['String']);
      }
      if (data.hasOwnProperty('has_subset')) {
        obj['has_subset'] = ApiClient.convertToType(data['has_subset'], ['String']);
      }
      if (data.hasOwnProperty('replaced_by')) {
        obj['replaced_by'] = ApiClient.convertToType(data['replaced_by'], ['String']);
      }
      if (data.hasOwnProperty('subset_property')) {
        obj['subset_property'] = ApiClient.convertToType(data['subset_property'], ['String']);
      }
      if (data.hasOwnProperty('has_narrow_synonym')) {
        obj['has_narrow_synonym'] = ApiClient.convertToType(data['has_narrow_synonym'], ['String']);
      }
      if (data.hasOwnProperty('in_subset')) {
        obj['in_subset'] = ApiClient.convertToType(data['in_subset'], ['String']);
      }
      if (data.hasOwnProperty('in_cyclic')) {
        obj['in_cyclic'] = ApiClient.convertToType(data['in_cyclic'], ['String']);
      }
    }
    return obj;
  }

  /**
   * Unique ID of scientific topic as given by TeSS. Note, this is not a global persistent ID.
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * The preferred name of the scientific topic
   * @member {String} preferred_label
   */
  exports.prototype['preferred_label'] = undefined;
  /**
   * Whether or not the term has been deprecated from EDAM
   * @member {Boolean} obsolete
   */
  exports.prototype['obsolete'] = undefined;
  /**
   * When the term was introduced into EDAM e.g. \"beta12orEarlier\"
   * @member {String} created_in
   */
  exports.prototype['created_in'] = undefined;
  /**
   * A link, if any, to any documentation about the specific term.
   * @member {String} documentation
   */
  exports.prototype['documentation'] = undefined;
  /**
   * The unique ID to reference the term e.g. \"topic_0099\"
   * @member {String} prefix_iri
   */
  exports.prototype['prefix_iri'] = undefined;
  /**
   * A succinct canonical definition of the term e.g. \"RNA sequences and structures.\"
   * @member {String} has_definition
   */
  exports.prototype['has_definition'] = undefined;
  /**
   * Saved by
   * @member {String} saved_by
   */
  exports.prototype['saved_by'] = undefined;
  /**
   * Which version the term has been obsolete since if it is now obsolete
   * @member {String} obsolete_since
   */
  exports.prototype['obsolete_since'] = undefined;
  /**
   * Timestamp of when the term was introduced to TeSS e.g. \"2016-03-04T14:06:54.246Z\" (Not when it was introduced to EDAM)
   * @member {Date} created_at
   */
  exports.prototype['created_at'] = undefined;
  /**
   * Timestamp of when the term was last updated in TeSS e.g. \"2016-03-04T14:06:54.246Z\" (Not when it was last updated in EDAM)
   * @member {Date} updated_at
   */
  exports.prototype['updated_at'] = undefined;
  /**
   * full ID of ontology class. Namespaced IRI e.g. \"http://edamontology.org/topic_0099\"
   * @member {String} class_id
   */
  exports.prototype['class_id'] = undefined;
  /**
   * Short hand identifier e.g. \"rna\"
   * @member {String} slug
   */
  exports.prototype['slug'] = undefined;
  /**
   * A list of synonym terms that can be used interchangably with the preferred_label.
   * @member {Array.<String>} synonyms
   */
  exports.prototype['synonyms'] = undefined;
  /**
   * A list of definitions that can also be used to describe the term e.g. [\"RNA sequences and structures.\"]
   * @member {Array.<String>} definitions
   */
  exports.prototype['definitions'] = undefined;
  /**
   * A list of class_ids that are the parents of this term e.g. [\"http://edamontology.org/topic_0077\"]
   * @member {Array.<String>} parents
   */
  exports.prototype['parents'] = undefined;
  /**
   * @member {Array.<String>} consider
   */
  exports.prototype['consider'] = undefined;
  /**
   * @member {Array.<String>} has_alternative_id
   */
  exports.prototype['has_alternative_id'] = undefined;
  /**
   * @member {Array.<String>} has_broad_synonym
   */
  exports.prototype['has_broad_synonym'] = undefined;
  /**
   * @member {Array.<String>} has_dbxref
   */
  exports.prototype['has_dbxref'] = undefined;
  /**
   * @member {Array.<String>} has_exact_synonym
   */
  exports.prototype['has_exact_synonym'] = undefined;
  /**
   * @member {Array.<String>} has_related_synonym
   */
  exports.prototype['has_related_synonym'] = undefined;
  /**
   * @member {Array.<String>} has_subset
   */
  exports.prototype['has_subset'] = undefined;
  /**
   * @member {Array.<String>} replaced_by
   */
  exports.prototype['replaced_by'] = undefined;
  /**
   * @member {Array.<String>} subset_property
   */
  exports.prototype['subset_property'] = undefined;
  /**
   * e.g. [\"Small RNA\"]
   * @member {Array.<String>} has_narrow_synonym
   */
  exports.prototype['has_narrow_synonym'] = undefined;
  /**
   * e.g. [\"http://purl.obolibrary.org/obo/edam#edam\",\"http://purl.obolibrary.org/obo/edam#topics\"]
   * @member {Array.<String>} in_subset
   */
  exports.prototype['in_subset'] = undefined;
  /**
   * @member {Array.<String>} in_cyclic
   */
  exports.prototype['in_cyclic'] = undefined;



  return exports;
}));



},{"../ApiClient":3}],11:[function(require,module,exports){
/**
 * TeSS API
 * Access, search and filter through collections of training materials, events, packages, and workflows in TeSS. As a rule of thumb - You can add .json to the end of most pages to retrieve the data in a common exchange format. e.g - https://tess.elixir-europe.org/events/software-carpentry-west-virginia-university.json - https://tess.elixir-europe.org/materials/rna-seq-de-novo-transcriptome-reconstruction-with-rna-seq.json - https://tess.elixir-europe.org/packages/biocomp-computing-skills-collection.json - https://tess.elixir-europe.org/workflows/das-internet-fur-biologen.json - https://tess.elixir-europe.org/nodes/united-kingdom.json
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/ScientificTopic'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./ScientificTopic'));
  } else {
    // Browser globals (root is window)
    if (!root.TeSsApi) {
      root.TeSsApi = {};
    }
    root.TeSsApi.ShortEvent = factory(root.TeSsApi.ApiClient, root.TeSsApi.ScientificTopic);
  }
}(this, function(ApiClient, ScientificTopic) {
  'use strict';




  /**
   * The ShortEvent model module.
   * @module model/ShortEvent
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>ShortEvent</code>.
   * @alias module:model/ShortEvent
   * @class
   */
  var exports = function() {
    var _this = this;




































  };

  /**
   * Constructs a <code>ShortEvent</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ShortEvent} obj Optional instance to populate.
   * @return {module:model/ShortEvent} The populated <code>ShortEvent</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('external_id')) {
        obj['external_id'] = ApiClient.convertToType(data['external_id'], 'Number');
      }
      if (data.hasOwnProperty('title')) {
        obj['title'] = ApiClient.convertToType(data['title'], 'String');
      }
      if (data.hasOwnProperty('subtitle')) {
        obj['subtitle'] = ApiClient.convertToType(data['subtitle'], 'String');
      }
      if (data.hasOwnProperty('url')) {
        obj['url'] = ApiClient.convertToType(data['url'], 'String');
      }
      if (data.hasOwnProperty('organizer')) {
        obj['organizer'] = ApiClient.convertToType(data['organizer'], 'String');
      }
      if (data.hasOwnProperty('description')) {
        obj['description'] = ApiClient.convertToType(data['description'], 'String');
      }
      if (data.hasOwnProperty('start')) {
        obj['start'] = ApiClient.convertToType(data['start'], 'Date');
      }
      if (data.hasOwnProperty('end')) {
        obj['end'] = ApiClient.convertToType(data['end'], 'Date');
      }
      if (data.hasOwnProperty('sponsor')) {
        obj['sponsor'] = ApiClient.convertToType(data['sponsor'], 'String');
      }
      if (data.hasOwnProperty('venue')) {
        obj['venue'] = ApiClient.convertToType(data['venue'], 'String');
      }
      if (data.hasOwnProperty('city')) {
        obj['city'] = ApiClient.convertToType(data['city'], 'String');
      }
      if (data.hasOwnProperty('county')) {
        obj['county'] = ApiClient.convertToType(data['county'], 'String');
      }
      if (data.hasOwnProperty('country')) {
        obj['country'] = ApiClient.convertToType(data['country'], 'String');
      }
      if (data.hasOwnProperty('postcode')) {
        obj['postcode'] = ApiClient.convertToType(data['postcode'], 'String');
      }
      if (data.hasOwnProperty('latitude')) {
        obj['latitude'] = ApiClient.convertToType(data['latitude'], 'String');
      }
      if (data.hasOwnProperty('longitude')) {
        obj['longitude'] = ApiClient.convertToType(data['longitude'], 'String');
      }
      if (data.hasOwnProperty('created_at')) {
        obj['created_at'] = ApiClient.convertToType(data['created_at'], 'Date');
      }
      if (data.hasOwnProperty('updated_at')) {
        obj['updated_at'] = ApiClient.convertToType(data['updated_at'], 'Date');
      }
      if (data.hasOwnProperty('slug')) {
        obj['slug'] = ApiClient.convertToType(data['slug'], 'String');
      }
      if (data.hasOwnProperty('content_provider_id')) {
        obj['content_provider_id'] = ApiClient.convertToType(data['content_provider_id'], 'Number');
      }
      if (data.hasOwnProperty('user_id')) {
        obj['user_id'] = ApiClient.convertToType(data['user_id'], 'Number');
      }
      if (data.hasOwnProperty('online')) {
        obj['online'] = ApiClient.convertToType(data['online'], 'Boolean');
      }
      if (data.hasOwnProperty('cost')) {
        obj['cost'] = ApiClient.convertToType(data['cost'], 'String');
      }
      if (data.hasOwnProperty('for_profit')) {
        obj['for_profit'] = ApiClient.convertToType(data['for_profit'], 'Boolean');
      }
      if (data.hasOwnProperty('last_scraped')) {
        obj['last_scraped'] = ApiClient.convertToType(data['last_scraped'], 'Date');
      }
      if (data.hasOwnProperty('scraper_record')) {
        obj['scraper_record'] = ApiClient.convertToType(data['scraper_record'], 'Boolean');
      }
      if (data.hasOwnProperty('keywords')) {
        obj['keywords'] = ApiClient.convertToType(data['keywords'], ['String']);
      }
      if (data.hasOwnProperty('event_types')) {
        obj['event_types'] = ApiClient.convertToType(data['event_types'], ['String']);
      }
      if (data.hasOwnProperty('target_audience')) {
        obj['target_audience'] = ApiClient.convertToType(data['target_audience'], ['String']);
      }
      if (data.hasOwnProperty('capacity')) {
        obj['capacity'] = ApiClient.convertToType(data['capacity'], ['String']);
      }
      if (data.hasOwnProperty('eligibility')) {
        obj['eligibility'] = ApiClient.convertToType(data['eligibility'], ['String']);
      }
      if (data.hasOwnProperty('contact')) {
        obj['contact'] = ApiClient.convertToType(data['contact'], 'String');
      }
      if (data.hasOwnProperty('host_institutions')) {
        obj['host_institutions'] = ApiClient.convertToType(data['host_institutions'], ['String']);
      }
      if (data.hasOwnProperty('scientific_topics')) {
        obj['scientific_topics'] = ApiClient.convertToType(data['scientific_topics'], [ScientificTopic]);
      }
    }
    return obj;
  }

  /**
   * Unique identifier of the event
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * An ID provided by the original content provider. Unique to their website.
   * @member {Number} external_id
   */
  exports.prototype['external_id'] = undefined;
  /**
   * The title of the event
   * @member {String} title
   */
  exports.prototype['title'] = undefined;
  /**
   * The subtitle of the event
   * @member {String} subtitle
   */
  exports.prototype['subtitle'] = undefined;
  /**
   * The URL where the actual event can be found.
   * @member {String} url
   */
  exports.prototype['url'] = undefined;
  /**
   * The organization responsible for creating the event.
   * @member {String} organizer
   */
  exports.prototype['organizer'] = undefined;
  /**
   * A succinct description of what the event is about.
   * @member {String} description
   */
  exports.prototype['description'] = undefined;
  /**
   * The date and time the event starts on
   * @member {Date} start
   */
  exports.prototype['start'] = undefined;
  /**
   * The date and time the event ends on.
   * @member {Date} end
   */
  exports.prototype['end'] = undefined;
  /**
   * The person or organization that is sponsoring the event.
   * @member {String} sponsor
   */
  exports.prototype['sponsor'] = undefined;
  /**
   * The name of the building the event will be hosted in
   * @member {String} venue
   */
  exports.prototype['venue'] = undefined;
  /**
   * The city the event will be hosted in
   * @member {String} city
   */
  exports.prototype['city'] = undefined;
  /**
   * The regional county the event will be hosted in
   * @member {String} county
   */
  exports.prototype['county'] = undefined;
  /**
   * The name of country the event will be hosted in
   * @member {String} country
   */
  exports.prototype['country'] = undefined;
  /**
   * The postcode of the venue hosting the event
   * @member {String} postcode
   */
  exports.prototype['postcode'] = undefined;
  /**
   * The latitude co-ordinate of the event.
   * @member {String} latitude
   */
  exports.prototype['latitude'] = undefined;
  /**
   * The longitude co-ordinate of the event.
   * @member {String} longitude
   */
  exports.prototype['longitude'] = undefined;
  /**
   * The date the event was first created on TeSS
   * @member {Date} created_at
   */
  exports.prototype['created_at'] = undefined;
  /**
   * The date the event was last updated on TeSS
   * @member {Date} updated_at
   */
  exports.prototype['updated_at'] = undefined;
  /**
   * @member {String} slug
   */
  exports.prototype['slug'] = undefined;
  /**
   * @member {Number} content_provider_id
   */
  exports.prototype['content_provider_id'] = undefined;
  /**
   * @member {Number} user_id
   */
  exports.prototype['user_id'] = undefined;
  /**
   * @member {Boolean} online
   */
  exports.prototype['online'] = undefined;
  /**
   * @member {String} cost
   */
  exports.prototype['cost'] = undefined;
  /**
   * @member {Boolean} for_profit
   */
  exports.prototype['for_profit'] = undefined;
  /**
   * @member {Date} last_scraped
   */
  exports.prototype['last_scraped'] = undefined;
  /**
   * @member {Boolean} scraper_record
   */
  exports.prototype['scraper_record'] = undefined;
  /**
   * A series of freetext words used to describe an event.
   * @member {Array.<String>} keywords
   */
  exports.prototype['keywords'] = undefined;
  /**
   * The category of the event. This could be a meeting or a course; or if unknown or neither, an event
   * @member {Array.<String>} event_types
   */
  exports.prototype['event_types'] = undefined;
  /**
   * The intended audience of the event. This can includes things like scientific discpline and expertise level
   * @member {Array.<String>} target_audience
   */
  exports.prototype['target_audience'] = undefined;
  /**
   * The number of people allowed to attend the event
   * @member {Array.<String>} capacity
   */
  exports.prototype['capacity'] = undefined;
  /**
   * Various criteria require to participate in the event
   * @member {Array.<String>} eligibility
   */
  exports.prototype['eligibility'] = undefined;
  /**
   * The name and/or contact details of a person or institution organizing the event
   * @member {String} contact
   */
  exports.prototype['contact'] = undefined;
  /**
   * The institution physically hosting the event
   * @member {Array.<String>} host_institutions
   */
  exports.prototype['host_institutions'] = undefined;
  /**
   * The classification of the material based on the EDAM ontologies scientific topics.
   * @member {Array.<module:model/ScientificTopic>} scientific_topics
   */
  exports.prototype['scientific_topics'] = undefined;



  return exports;
}));



},{"../ApiClient":3,"./ScientificTopic":10}],12:[function(require,module,exports){
/**
 * TeSS API
 * Access, search and filter through collections of training materials, events, packages, and workflows in TeSS. As a rule of thumb - You can add .json to the end of most pages to retrieve the data in a common exchange format. e.g - https://tess.elixir-europe.org/events/software-carpentry-west-virginia-university.json - https://tess.elixir-europe.org/materials/rna-seq-de-novo-transcriptome-reconstruction-with-rna-seq.json - https://tess.elixir-europe.org/packages/biocomp-computing-skills-collection.json - https://tess.elixir-europe.org/workflows/das-internet-fur-biologen.json - https://tess.elixir-europe.org/nodes/united-kingdom.json
 *
 * OpenAPI spec version: 1.0.0
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.TeSsApi) {
      root.TeSsApi = {};
    }
    root.TeSsApi.ShortMaterial = factory(root.TeSsApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The ShortMaterial model module.
   * @module model/ShortMaterial
   * @version 1.0.0
   */

  /**
   * Constructs a new <code>ShortMaterial</code>.
   * @alias module:model/ShortMaterial
   * @class
   */
  var exports = function() {
    var _this = this;








  };

  /**
   * Constructs a <code>ShortMaterial</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ShortMaterial} obj Optional instance to populate.
   * @return {module:model/ShortMaterial} The populated <code>ShortMaterial</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('title')) {
        obj['title'] = ApiClient.convertToType(data['title'], 'String');
      }
      if (data.hasOwnProperty('url')) {
        obj['url'] = ApiClient.convertToType(data['url'], 'String');
      }
      if (data.hasOwnProperty('short_description')) {
        obj['short_description'] = ApiClient.convertToType(data['short_description'], 'String');
      }
      if (data.hasOwnProperty('doi')) {
        obj['doi'] = ApiClient.convertToType(data['doi'], 'String');
      }
      if (data.hasOwnProperty('remote_updated_date')) {
        obj['remote_updated_date'] = ApiClient.convertToType(data['remote_updated_date'], 'Date');
      }
      if (data.hasOwnProperty('remote_created_date')) {
        obj['remote_created_date'] = ApiClient.convertToType(data['remote_created_date'], 'Date');
      }
    }
    return obj;
  }

  /**
   * The ID given by TeSS to the material
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * The title of the training material.
   * @member {String} title
   */
  exports.prototype['title'] = undefined;
  /**
   * The API URL of the material within TeSS e.g. https://tess.elixir-europe.org/materials/3-day-hands-on-ngs-workshop.json - Go here to find out more about this particular material.
   * @member {String} url
   */
  exports.prototype['url'] = undefined;
  /**
   * This should be a short description of the training material. Lengths vary but on average it is around 2-3 sentences.
   * @member {String} short_description
   */
  exports.prototype['short_description'] = undefined;
  /**
   * This is the DOI of the material where it can be permanently referenced
   * @member {String} doi
   */
  exports.prototype['doi'] = undefined;
  /**
   * When it was last updated in TeSS
   * @member {Date} remote_updated_date
   */
  exports.prototype['remote_updated_date'] = undefined;
  /**
   * When it was first created in TeSS
   * @member {Date} remote_created_date
   */
  exports.prototype['remote_created_date'] = undefined;



  return exports;
}));



},{"../ApiClient":3}],13:[function(require,module,exports){

},{}],14:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
  // Detect if browser supports Typed Arrays. Supported browsers are IE 10+, Firefox 4+,
  // Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+. If the browser does not support adding
  // properties to `Uint8Array` instances, then that's the same as no `Uint8Array` support
  // because we need to be able to add all the node Buffer API methods. This is an issue
  // in Firefox 4-29. Now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // assume that object is array-like
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    for (i = 0; i < length; i++) {
      if (Buffer.isBuffer(subject))
        buf[i] = subject.readUInt8(i)
      else
        buf[i] = subject[i]
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list, [totalLength])\n' +
      'list should be an Array.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (typeof totalLength !== 'number') {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

// BUFFER INSTANCE METHODS
// =======================

function _hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  Buffer._charsWritten = i * 2
  return i
}

function _utf8Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function _asciiWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function _binaryWrite (buf, string, offset, length) {
  return _asciiWrite(buf, string, offset, length)
}

function _base64Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function _utf16leWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = _asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = _binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = _base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end !== undefined)
    ? Number(end)
    : end = self.length

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = _asciiSlice(self, start, end)
      break
    case 'binary':
      ret = _binarySlice(self, start, end)
      break
    case 'base64':
      ret = _base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !Buffer._useTypedArrays) {
    for (var i = 0; i < len; i++)
      target[i + target_start] = this[i + start]
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

function _base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function _utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function _asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++)
    ret += String.fromCharCode(buf[i])
  return ret
}

function _binarySlice (buf, start, end) {
  return _asciiSlice(buf, start, end)
}

function _hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function _utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i+1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function _readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return _readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return _readUInt16(this, offset, false, noAssert)
}

function _readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return _readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return _readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function _readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return _readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return _readInt16(this, offset, false, noAssert)
}

function _readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return _readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return _readInt32(this, offset, false, noAssert)
}

function _readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return _readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return _readFloat(this, offset, false, noAssert)
}

function _readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return _readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return _readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
}

function _writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, false, noAssert)
}

function _writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
}

function _writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, false, noAssert)
}

function _writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, false, noAssert)
}

function _writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, false, noAssert)
}

function _writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (typeof value === 'string') {
    value = value.charCodeAt(0)
  }

  assert(typeof value === 'number' && !isNaN(value), 'value is not a number')
  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  for (var i = start; i < end; i++) {
    this[i] = value
  }
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1)
        buf[i] = this[i]
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F)
      byteArray.push(str.charCodeAt(i))
    else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16))
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  var pos
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

},{"base64-js":2,"ieee754":16}],15:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

if (typeof module !== 'undefined') {
  module.exports = Emitter;
}

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks['$' + event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],16:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],17:[function(require,module,exports){

/**
 * Reduce `arr` with `fn`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Mixed} initial
 *
 * TODO: combatible error handling?
 */

module.exports = function(arr, fn, initial){  
  var idx = 0;
  var len = arr.length;
  var curr = arguments.length == 3
    ? initial
    : arr[idx++];

  while (idx < len) {
    curr = fn.call(null, curr, arr[idx], ++idx, arr);
  }
  
  return curr;
};
},{}],18:[function(require,module,exports){
/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var reduce = require('reduce');
var requestBase = require('./request-base');
var isObject = require('./is-object');

/**
 * Root reference for iframes.
 */

var root;
if (typeof window !== 'undefined') { // Browser window
  root = window;
} else if (typeof self !== 'undefined') { // Web Worker
  root = self;
} else { // Other environments
  root = this;
}

/**
 * Noop.
 */

function noop(){};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isHost(obj) {
  var str = {}.toString.call(obj);

  switch (str) {
    case '[object File]':
    case '[object Blob]':
    case '[object FormData]':
      return true;
    default:
      return false;
  }
}

/**
 * Expose `request`.
 */

var request = module.exports = require('./request').bind(null, Request);

/**
 * Determine XHR.
 */

request.getXHR = function () {
  if (root.XMLHttpRequest
      && (!root.location || 'file:' != root.location.protocol
          || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  return false;
};

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    if (null != obj[key]) {
      pushEncodedKeyValuePair(pairs, key, obj[key]);
        }
      }
  return pairs.join('&');
}

/**
 * Helps 'serialize' with serializing arrays.
 * Mutates the pairs array.
 *
 * @param {Array} pairs
 * @param {String} key
 * @param {Mixed} val
 */

function pushEncodedKeyValuePair(pairs, key, val) {
  if (Array.isArray(val)) {
    return val.forEach(function(v) {
      pushEncodedKeyValuePair(pairs, key, v);
    });
  }
  pairs.push(encodeURIComponent(key)
    + '=' + encodeURIComponent(val));
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split('=');
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Check if `mime` is json or has +json structured syntax suffix.
 *
 * @param {String} mime
 * @return {Boolean}
 * @api private
 */

function isJSON(mime) {
  return /[\/+]json\b/.test(mime);
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str){
  return reduce(str.split(/ *; */), function(obj, str){
    var parts = str.split(/ *= */)
      , key = parts.shift()
      , val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req, options) {
  options = options || {};
  this.req = req;
  this.xhr = this.req.xhr;
  // responseText is accessible only if responseType is '' or 'text' and on older browsers
  this.text = ((this.req.method !='HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text')) || typeof this.xhr.responseType === 'undefined')
     ? this.xhr.responseText
     : null;
  this.statusText = this.req.xhr.statusText;
  this.setStatusProperties(this.xhr.status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this.setHeaderProperties(this.header);
  this.body = this.req.method != 'HEAD'
    ? this.parseBody(this.text ? this.text : this.xhr.response)
    : null;
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function(field){
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype.setHeaderProperties = function(header){
  // content-type
  var ct = this.header['content-type'] || '';
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype.parseBody = function(str){
  var parse = request.parse[this.type];
  if (!parse && isJSON(this.type)) {
    parse = request.parse['application/json'];
  }
  return parse && str && (str.length || str instanceof Object)
    ? parse(str)
    : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype.setStatusProperties = function(status){
  // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
  if (status === 1223) {
    status = 204;
  }

  var type = status / 100 | 0;

  // status / class
  this.status = this.statusCode = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var url = req.url;

  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.url = url;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {}; // preserves header name case
  this._header = {}; // coerces header names to lowercase
  this.on('end', function(){
    var err = null;
    var res = null;

    try {
      res = new Response(self);
    } catch(e) {
      err = new Error('Parser is unable to parse the response');
      err.parse = true;
      err.original = e;
      // issue #675: return the raw response if the response parsing fails
      err.rawResponse = self.xhr && self.xhr.responseText ? self.xhr.responseText : null;
      // issue #876: return the http status code if the response parsing fails
      err.statusCode = self.xhr && self.xhr.status ? self.xhr.status : null;
      return self.callback(err);
    }

    self.emit('response', res);

    if (err) {
      return self.callback(err, res);
    }

    if (res.status >= 200 && res.status < 300) {
      return self.callback(err, res);
    }

    var new_err = new Error(res.statusText || 'Unsuccessful HTTP response');
    new_err.original = err;
    new_err.response = res;
    new_err.status = res.status;

    self.callback(new_err, res);
  });
}

/**
 * Mixin `Emitter` and `requestBase`.
 */

Emitter(Request.prototype);
for (var key in requestBase) {
  Request.prototype[key] = requestBase[key];
}

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */

Request.prototype.abort = function(){
  if (this.aborted) return;
  this.aborted = true;
  this.xhr && this.xhr.abort();
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set responseType to `val`. Presently valid responseTypes are 'blob' and 
 * 'arraybuffer'.
 *
 * Examples:
 *
 *      req.get('/')
 *        .responseType('blob')
 *        .end(callback);
 *
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.responseType = function(val){
  this._responseType = val;
  return this;
};

/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function(type){
  this.set('Accept', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @param {Object} options with 'type' property 'auto' or 'basic' (default 'basic')
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass, options){
  if (!options) {
    options = {
      type: 'basic'
    }
  }

  switch (options.type) {
    case 'basic':
      var str = btoa(user + ':' + pass);
      this.set('Authorization', 'Basic ' + str);
    break;

    case 'auto':
      this.username = user;
      this.password = pass;
    break;
  }
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `filename`.
 *
 * ``` js
 * request.post('/upload')
 *   .attach(new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String} filename
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.attach = function(field, file, filename){
  this._getFormData().append(field, file, filename || file.name);
  return this;
};

Request.prototype._getFormData = function(){
  if (!this._formData) {
    this._formData = new root.FormData();
  }
  return this._formData;
};

/**
 * Send `data` as the request body, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"}')
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
  *      request.post('/user')
  *        .send('name=tobi')
  *        .send('species=ferret')
  *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data){
  var obj = isObject(data);
  var type = this._header['content-type'];

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    if (!type) this.type('form');
    type = this._header['content-type'];
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj || isHost(data)) return this;
  if (!type) this.type('json');
  return this;
};

/**
 * @deprecated
 */
Response.prototype.parse = function serialize(fn){
  if (root.console) {
    console.warn("Client-side parse() method has been renamed to serialize(). This method is not compatible with superagent v2.0");
  }
  this.serialize(fn);
  return this;
};

Response.prototype.serialize = function serialize(fn){
  this._parser = fn;
  return this;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  this.clearTimeout();
  fn(err, res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.');
  err.crossDomain = true;

  err.status = this.status;
  err.method = this.method;
  err.url = this.url;

  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype.timeoutError = function(){
  var timeout = this._timeout;
  var err = new Error('timeout of ' + timeout + 'ms exceeded');
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

Request.prototype.withCredentials = function(){
  this._withCredentials = true;
  return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this;
  var xhr = this.xhr = request.getXHR();
  var query = this._query.join('&');
  var timeout = this._timeout;
  var data = this._formData || this._data;

  // store callback
  this._callback = fn || noop;

  // state change
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;

    // In IE9, reads to any property (e.g. status) off of an aborted XHR will
    // result in the error "Could not complete the operation due to error c00c023f"
    var status;
    try { status = xhr.status } catch(e) { status = 0; }

    if (0 == status) {
      if (self.timedout) return self.timeoutError();
      if (self.aborted) return;
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  var handleProgress = function(e){
    if (e.total > 0) {
      e.percent = e.loaded / e.total * 100;
    }
    e.direction = 'download';
    self.emit('progress', e);
  };
  if (this.hasListeners('progress')) {
    xhr.onprogress = handleProgress;
  }
  try {
    if (xhr.upload && this.hasListeners('progress')) {
      xhr.upload.onprogress = handleProgress;
    }
  } catch(e) {
    // Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
    // Reported here:
    // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self.timedout = true;
      self.abort();
    }, timeout);
  }

  // querystring
  if (query) {
    query = request.serializeObject(query);
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query;
  }

  // initiate request
  if (this.username && this.password) {
    xhr.open(this.method, this.url, true, this.username, this.password);
  } else {
    xhr.open(this.method, this.url, true);
  }

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
    // serialize stuff
    var contentType = this._header['content-type'];
    var serialize = this._parser || request.serialize[contentType ? contentType.split(';')[0] : ''];
    if (!serialize && isJSON(contentType)) serialize = request.serialize['application/json'];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  if (this._responseType) {
    xhr.responseType = this._responseType;
  }

  // send stuff
  this.emit('request', this);

  // IE11 xhr.send(undefined) sends 'undefined' string as POST payload (instead of nothing)
  // We need null here if data is undefined
  xhr.send(typeof data !== 'undefined' ? data : null);
  return this;
};


/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

function del(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

request['del'] = del;
request['delete'] = del;

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

},{"./is-object":19,"./request":21,"./request-base":20,"emitter":15,"reduce":17}],19:[function(require,module,exports){
/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return null != obj && 'object' == typeof obj;
}

module.exports = isObject;

},{}],20:[function(require,module,exports){
/**
 * Module of mixed-in functions shared between node and client code
 */
var isObject = require('./is-object');

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

exports.clearTimeout = function _clearTimeout(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Force given parser
 *
 * Sets the body parser no matter type.
 *
 * @param {Function}
 * @api public
 */

exports.parse = function parse(fn){
  this._parser = fn;
  return this;
};

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

exports.timeout = function timeout(ms){
  this._timeout = ms;
  return this;
};

/**
 * Faux promise support
 *
 * @param {Function} fulfill
 * @param {Function} reject
 * @return {Request}
 */

exports.then = function then(fulfill, reject) {
  return this.end(function(err, res) {
    err ? reject(err) : fulfill(res);
  });
}

/**
 * Allow for extension
 */

exports.use = function use(fn) {
  fn(this);
  return this;
}


/**
 * Get request header `field`.
 * Case-insensitive.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

exports.get = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Get case-insensitive header `field` value.
 * This is a deprecated internal API. Use `.get(field)` instead.
 *
 * (getHeader is no longer used internally by the superagent code base)
 *
 * @param {String} field
 * @return {String}
 * @api private
 * @deprecated
 */

exports.getHeader = exports.get;

/**
 * Set header `field` to `val`, or multiple fields with one object.
 * Case-insensitive.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

exports.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Remove header `field`.
 * Case-insensitive.
 *
 * Example:
 *
 *      req.get('/')
 *        .unset('User-Agent')
 *        .end(callback);
 *
 * @param {String} field
 */
exports.unset = function(field){
  delete this._header[field.toLowerCase()];
  delete this.header[field];
  return this;
};

/**
 * Write the field `name` and `val` for "multipart/form-data"
 * request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 * ```
 *
 * @param {String} name
 * @param {String|Blob|File|Buffer|fs.ReadStream} val
 * @return {Request} for chaining
 * @api public
 */
exports.field = function(name, val) {
  this._getFormData().append(name, val);
  return this;
};

},{"./is-object":19}],21:[function(require,module,exports){
// The node and browser modules expose versions of this with the
// appropriate constructor function bound as first argument
/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(RequestConstructor, method, url) {
  // callback
  if ('function' == typeof url) {
    return new RequestConstructor('GET', method).end(url);
  }

  // url first
  if (2 == arguments.length) {
    return new RequestConstructor('GET', method);
  }

  return new RequestConstructor(method, url);
}

module.exports = request;

},{}]},{},[1])