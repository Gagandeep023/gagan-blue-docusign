'use strict';

const moment = require('moment');
const dsConfig = require('../../config/index.js').config;
const passport = require('passport');
const baseUriSuffix = '/restapi';
const tokenReplaceMinGet = 60;

let DSAuthCodeGrant = function _DSAuthCodeGrant(req) {
  this._debug_prefix = 'DSAuthCodeGrant';
  this._accessToken = req.user && req.user.accessToken;
  this._refreshToken = req.user && req.user.refreshToken;
  this._tokenExpiration = req.user && req.user.tokenExpirationTimestamp;
  this._debug = true;
  this.eg = req.session.eg;
};

DSAuthCodeGrant.prototype.Error_set_account = 'Error_set_account';
DSAuthCodeGrant.prototype.Error_account_not_found = 'Could not find account information for the user';
DSAuthCodeGrant.prototype.Error_invalid_grant = 'invalid_grant';

DSAuthCodeGrant.prototype.login = function(req, res, next) {
    this.internalLogout(req, res);
    req.session.authMethod = 'grand-auth';

    if (req.session?.pkceFailed) {
        passport.authenticate('docusign')(req, res, next);
    } else {
        passport.authenticate('docusign_pkce')(req, res, next);
    }
};

DSAuthCodeGrant.prototype.oauth_callback1 = (req, res, next) => {
    if (req.session?.pkceFailed) {
        passport.authenticate('docusign', { failureRedirect: '/ds/login' })(req, res, next);
    } else {
        passport.authenticate('docusign_pkce', { failureRedirect: '/ds/login' }, (err, user, _info) => {
            if (err || !user) { return next(); }

            req.logIn(user, function(err) {
              if (err) { return next(err); }
              return next();
            });
        })(req, res, next);
    }
};
DSAuthCodeGrant.prototype.oauth_callback2 = function _oauth_callback2(req, res, next) {
    if (!req.session.pkceFailed && !req?.user?.accessToken) {
        req.session.pkceFailed = true;
        return res.redirect('/ds/login');
    }

    this._accessToken = req.user.accessToken;
    console.log(`Received access_token: |${req.user.accessToken}|`);
    console.log(`Expires at ${req.user.tokenExpirationTimestamp.format('dddd, MMMM Do YYYY, h:mm:ss a')}`);
    req.flash('info', 'You have authenticated with DocuSign.');

    this.getDefaultAccountInfo(req);

    res.redirect('/');
};

DSAuthCodeGrant.prototype.logout = function _logout(req, res) {
  let logoutCB = encodeURIComponent(res.locals.hostUrl + '/ds/logoutCallback');
     let oauthServer = dsConfig.dsOauthServer;
     let client_id = dsConfig.dsClientId;
     let logoutURL = `${oauthServer}/logout?client_id=${client_id}&redirect_uri=${logoutCB}&response_mode=logout_redirect`;
  this.logoutCallback(req, res);
};

DSAuthCodeGrant.prototype.logoutCallback = function _logout(req, res) {
  req.logout(function(err) {
    if (err) {
      throw err;
    }
  });
  this.internalLogout(req, res);
    req.flash('info', 'You have logged out.');
    res.redirect('/');
};

DSAuthCodeGrant.prototype.internalLogout = function _internalLogout(req, res) {
  this._tokenExpiration = null;
  req.session.accountId = null;
  req.session.accountName = null;
  req.session.basePath = null;
};

DSAuthCodeGrant.prototype.getDefaultAccountInfo = function _getDefaultAccountInfo(req) {
    const targetAccountId = dsConfig.targetAccountId;
    const accounts = req.user.accounts;

    let account = null;
    if (targetAccountId) {
        account = accounts.find(a => a.account_id === targetAccountId);
        if (!account) {
            throw new Error(this.Error_account_not_found);
        }
    } else {
        account = accounts.find(a => a.is_default);
    }

    req.session.accountId = account.account_id;
    req.session.accountName = account.account_name;
    req.session.basePath = account.base_uri + baseUriSuffix;
    console.log(`Using account ${account.account_id}: ${account.account_name}`);
};

DSAuthCodeGrant.prototype.checkToken = function _checkToken(bufferMin = tokenReplaceMinGet) {
  let noToken = !this._accessToken || !this._tokenExpiration;
  let now = moment();
  let needToken = noToken || moment(this._tokenExpiration).subtract(bufferMin, 'm').isBefore(now);
  if (this._debug) {
    if (noToken) { this._debug_log('checkToken: Starting up--need a token'); }
    if (needToken && !noToken) { this._debug_log('checkToken: Replacing old token'); }
    if (!needToken) { this._debug_log('checkToken: Using current token'); }
  }

  return (!needToken);
};

DSAuthCodeGrant.prototype.setEg = function _setEg(req, eg) {
  req.session.eg = eg;
  this.eg = eg;
};

DSAuthCodeGrant.prototype._debug_log = function(m){
  if (!this._debug) { return; }
  console.log(this._debug_prefix + ': ' + m);
};

DSAuthCodeGrant.prototype._debug_log_obj = function(m, obj){
  if (!this._debug) { return; }
  console.log(this._debug_prefix + ': ' + m + '\n' + JSON.stringify(obj, null, 4));
};

module.exports = DSAuthCodeGrant;
