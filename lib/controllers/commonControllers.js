
const commonControllers = exports;

/**
 * Home page for this application
 */
commonControllers.indexController = async (req, res) => {
    if (req.user === undefined) {
        return res.redirect('/ds/mustAuthenticate');
    } else {
        return res.redirect('/docs-list');
    }
};

commonControllers.mustAuthenticateController = (req, res) => {
    res.render('pages/ds_must_authenticate', {title: 'Authenticate with DocuSign'});
};

commonControllers.login = (req, res, next) => {
    req.dsAuth = req.dsAuthCodeGrant;
    req.dsAuth.login(req, res, next);
};

commonControllers.logout = (req, res) => {
    req.dsAuth.logout(req, res);
};

commonControllers.logoutCallback = (req, res) => {
    req.dsAuth.logoutCallback(req, res);
};

