var utils   = require('./utils');
var config  = require('./config');
var extend  = require('extend');

var BigInteger = utils.jsbn.BigInteger;

var UInt = require('./uint').UInt;
var Base = require('./base').Base;

//
// UInt160 support
//

var UInt160 = extend(function() {
  // Internal form: NaN or BigInteger
  this._value  = NaN;
  this._version_byte = void(0);
  this._update();
}, UInt);

UInt160.width = 20;
UInt160.prototype = extend({}, UInt.prototype);
UInt160.prototype.constructor = UInt160;

var ACCOUNT_ZERO = UInt160.ACCOUNT_ZERO = 'xxxxxxxxxxxxxxxxxxxxxhoLvTp';
var ACCOUNT_ONE  = UInt160.ACCOUNT_ONE  = 'xxxxxxxxxxxxxxxxxxxxBZbvji';
var HEX_ZERO     = UInt160.HEX_ZERO     = '0000000000000000000000000000000000000000';
var HEX_ONE      = UInt160.HEX_ONE      = '0000000000000000000000000000000000000001';
var XPS_ZERO     = UInt160.XPS_ZERO     = utils.hexToString(HEX_ZERO);
var XPS_ONE      = UInt160.XPS_ONE      = utils.hexToString(HEX_ONE);

UInt160.prototype.set_version = function(j) {
  this._version_byte = j;
  return this;
};

UInt160.prototype.get_version = function() {
  return this._version_byte;
};

// value = NaN on error.
UInt160.prototype.parse_json = function(j) {
  // Canonicalize and validate

    // TODO: this is gross. Inject test accounts a different way
  if (config.accounts && j in config.accounts) {
    j = config.accounts[j].account;
  }

  if (typeof j !== 'string') {
    this._value = NaN;
  } else if (j[0] === 'g') {
    this._value = Base.decode_check(Base.VER_ACCOUNT_ID, j);
    this._version_byte = Base.VER_ACCOUNT_ID;
  } else {
    this.parse_hex(j);
  }

  this._update();

  return this;
};

UInt160.prototype.parse_generic = function(j) {
  UInt.prototype.parse_generic.call(this, j);

  if (isNaN(this._value)) {
    if ("string" === typeof j && j[0] === 'g') {
      this._value = Base.decode_check(Base.VER_ACCOUNT_ID, j);
    }
  }

  this._update();

  return this;
};

// XXX Json form should allow 0 and 1, C++ doesn't currently allow it.
UInt160.prototype.to_json = function(opts) {
  opts  = opts || {};

  if (this._value instanceof BigInteger) {
    // If this value has a type, return a Base58 encoded string.
    if (typeof this._version_byte === 'number') {
      var output = Base.encode_check(this._version_byte, this.to_bytes());

      if (opts.gateways && output in opts.gateways) {
        output = opts.gateways[output];
      }

      return output;
    } else {
      return this.to_hex();
    }
  }
  return NaN;
};

exports.UInt160 = UInt160;

// vim:sw=2:sts=2:ts=8:et
