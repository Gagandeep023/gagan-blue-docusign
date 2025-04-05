const documentController = exports;
const logger = require('../utils/logger');

documentController.docsList = async (req, res) => {
  try {
    res.render('pages/docs-list');
  } catch (error) {
    logger.error('Error rendering docs list:', error);
    res.status(500).send('Internal Server Error');
  }
};

documentController.viewDoc = async (req, res) => {
  try {
    const docName = req.query.docName;
    res.render('pages/view-doc', {
      docName: docName
    });
  } catch (error) {
    logger.error('Error rendering view document:', error);
    res.status(500).send('Internal Server Error');
  }
};

documentController.editDoc = async (req, res) => {
  try {
    const docName = req.query.docName;
    res.render('pages/edit-doc', {
      docName: docName
    });
  } catch (error) {
    logger.error('Error rendering edit document:', error);
    res.status(500).send('Internal Server Error');
  }
};
