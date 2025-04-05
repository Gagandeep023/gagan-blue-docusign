#!/usr/bin/env node

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const MemoryStore = require('memorystore')(session);
const path = require('path');
const DSAuthCodeGrant = require('./lib/utils/DSAuthCodeGrant.js');
const passport = require('passport');
const DocusignStrategy = require('passport-docusign');
const dsConfig = require('./config/index.js').config;
const commonControllers = require('./lib/controllers/commonControllers.js');
const flash = require('express-flash');
const helmet = require('helmet');
const moment = require('moment');
const localStorage = require('store2');
const { getManifest } = require('./lib/utils/manifestService.js');

const documentController = require('./lib/controllers/documentController.js');
const envelopeController = require('./lib/controllers/envelopeController.js');
const statusController = require('./lib/controllers/statusController.js');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';
const max_session_min = 180;

let hostUrl = 'http://' + HOST + ':' + PORT;
if (dsConfig.appUrl !== '' && dsConfig.appUrl !== '{APP_URL}') { hostUrl = dsConfig.appUrl; }

let app = express()
  .use(helmet())
  .use(cookieParser())
  .use(session({
    secret: dsConfig.sessionSecret,
    name: 'ds-launcher-session',
    cookie: { maxAge: max_session_min * 600000 },
    saveUninitialized: true,
    resave: true,
    store: new MemoryStore({
      checkPeriod: 86400000 * 7
    })
  }))
  .use(passport.initialize())
  .use(passport.session())
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  .use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.session = req.session;
    res.locals.dsConfig = { ...dsConfig};
    res.locals.hostUrl = hostUrl;
    res.locals.localStorage = localStorage;
    next();
  })
  .use(flash())
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .use((req, res, next) => {
    req.dsAuthCodeGrant = new DSAuthCodeGrant(req);
    req.dsAuth = req.dsAuthCodeGrant;
    next();
  })
  .use(async (req, res, next) => {
    const manifest = await getManifest(dsConfig.codeManifest);
    res.locals.manifest = manifest;
    next();
  })
  .get('/', commonControllers.indexController)
  .get('/ds/login', commonControllers.login)
  .get('/ds/callback', [dsLoginCB1, dsLoginCB2])
  .get('/ds/logout', commonControllers.logout)
  .get('/ds/logoutCallback', commonControllers.logoutCallback)
  .get('/ds/mustAuthenticate', commonControllers.mustAuthenticateController)
  .use(express.static(path.join(__dirname, 'public')))
  .use('/documents', express.static(path.join(__dirname, 'documents')))
  .use('/public', express.static(path.join(__dirname, 'public')));

app.get('/docs-list', documentController.docsList);
app.get('/view-doc', documentController.viewDoc);
app.get('/edit-doc', documentController.editDoc);

app.post('/create-doc-for-signing', envelopeController.createTemplateAndSendEnvelope);
app.get('/success', statusController.success);
app.get('/failure', statusController.failure);
app.get('/something_went_wrong', statusController.somethingWentWrong);

function dsLoginCB1(req, res, next) { req.dsAuthCodeGrant.oauth_callback1(req, res, next); }
function dsLoginCB2(req, res, next) { req.dsAuthCodeGrant.oauth_callback2(req, res, next); }

if (dsConfig.dsClientId && dsConfig.dsClientId !== '{CLIENT_ID}' &&
  dsConfig.dsClientSecret && dsConfig.dsClientSecret !== '{CLIENT_SECRET}') {
  app.listen(PORT);
  console.log(`Listening on ${PORT}`);
  console.log(`Ready! Open ${hostUrl}`);
} else {
  console.error(`PROBLEM: You need to set the clientId (Integrator Key), and perhaps other settings as well.
You can set them in the configuration file config/appsettings.json or set environment variables.\n`);
  process.exit();
}

passport.serializeUser(function(user, done) { done(null, user); });
passport.deserializeUser(function(obj, done) { done(null, obj); });

const scope = [
  'organization_read', 'group_read', 'permission_read',
  'user_read', 'user_write', 'account_read',
  'domain_read', 'identity_provider_read', 'signature',
  'user_data_redact', 'asset_group_account_read', 'asset_group_account_clone_write',
  'asset_group_account_clone_read', 'organization_sub_account_write', 'organization_sub_account_read'
];

const docusignStrategyOptions = {
  production: dsConfig.production,
  clientID: dsConfig.dsClientId,
  scope: scope.join(' '),
  clientSecret: dsConfig.dsClientSecret,
  callbackURL: hostUrl + '/ds/callback',
  state: true
};

function processDsResult(accessToken, refreshToken, params, profile, done) {
  let user = profile;
  user.accessToken = accessToken;
  user.refreshToken = refreshToken;
  user.expiresIn = params.expires_in;
  user.tokenExpirationTimestamp = moment().add(user.expiresIn, 's');
  return done(null, user);
}

const docusignStrategy = new DocusignStrategy(docusignStrategyOptions, processDsResult);
const docusignStrategyPKCE = new DocusignStrategy({
    ...docusignStrategyOptions,
    pkce: true
  },
  processDsResult
);

if (!dsConfig.allowSilentAuthentication) {
  docusignStrategy.authorizationParams = function(options) {
    return { prompt: 'login' };
  };
}
passport.use('docusign', docusignStrategy);
passport.use('docusign_pkce', docusignStrategyPKCE);
