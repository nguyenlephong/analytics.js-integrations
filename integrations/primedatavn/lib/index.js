'use strict';

/**
 * Module dependencies.
 */

var integration = require('@segment/analytics.js-integration');
var each = require('@ndhoule/each');
var is = require('is');

/**
 * Expose `PrimeDataVN` integration.
 */

var PrimeDataVN = (module.exports = integration('PrimeDataVN')
  .global('clevertap')
  .option('clevertap_account_id', '')
  .option('region', '')
  .tag('https', '<script src="https://dev.primedata.ai/powehi/mining.js">')
  );

/**
 * Initialize.
 *
 * https://www.notion.so/primedata/Website-d718f5d5cdd542a68396456679212bd3?pvs=4
 *
 * @api public
 */

PrimeDataVN.prototype.initialize = function() {
  window.clevertap = {
    event: [],
    profile: [],
    account: [],
    onUserLogin: [],
    notifications: []
  };
  window.clevertap.enablePersonalization = true;
  window.clevertap.account.push({ id: this.options.clevertap_account_id });
  var region = this.options.region;
  if (region && is.string(region)) {
    // the hardcoded value actually returns 'in.' intentionally w the period because it is used for the direct integration
    // and since dealing with mongo is much more painful, we will strip here
    window.clevertap.region = region.replace('.', '');
  }
  this.load('https', this.ready);
};

PrimeDataVN.prototype.loaded = function() {
  return !!window.cxs && window.cxs.logout !== 'undefined';
};

/**
 * Identify.
 *
 * @api public
 * @param {Facade} identify
 *
 * this snippet should be invoked when a user logs out from your website:
    analytics.ready(function() {
      window.clevertap.logout();
    });
 */

PrimeDataVN.prototype.identify = function(identify) {
  var traitAliases = {
    id: 'Identity',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    gender: 'Gender',
    birthday: 'DOB',
    avatar: 'Photo'
  };
  var traits = identify.traits(traitAliases);
  // sdk does not accept objects
  var supportedTraits = {};
  each(function(value, key) {
    if (!is.object(value)) supportedTraits[key] = value;
  }, traits);
  window.clevertap.onUserLogin.push({
    Site: supportedTraits
  });
};

/**
 * Alias.
 *
 * @api public
 * @param {Facade} alias
 */

PrimeDataVN.prototype.alias = function(alias) {
  window.clevertap.profile.push({
    Site: { Identity: alias.to() }
  });
};

/**
 * Track.
 *
 * @api public
 * @param {Track} event
 */

PrimeDataVN.prototype.track = function(track) {
  var props = track.properties();
  // sdk does not accept any objects or arrays
  var supportedProps = {};
  each(function(value, key) {
    if (!is.object(value) && !is.array(value)) supportedProps[key] = value;
  }, props);
  window.clevertap.event.push(track.event(), supportedProps);
};