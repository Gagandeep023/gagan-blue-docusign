const logger = require('../utils/logger');

const statusController = exports;

statusController.success = async (req, res) => {
  try {
    res.render('pages/success_page', {
      message: 'Envelope sent successfully!',
      docName: req.query.docName
    });
  } catch (error) {
    logger.error('Error rendering success page:', error);
    res.status(500).send('Internal Server Error');
  }
};

statusController.failure = async (req, res) => {
  try {
    const errorMessage = req.query.errorMessage || 'An unknown error occurred.';
    res.render('pages/failure_page', {
      errorMessage: errorMessage,
      docName: req.query.docName
    });
  } catch (error) {
    logger.error('Error rendering failure page:', error);
    res.status(500).send('Internal Server Error');
  }
};

statusController.somethingWentWrong = async (req, res) => {
  try {
    const errorMessage = req.query.errorMessage || 'There was an error processing your request.';
    res.render('pages/something_went_wrong_page', {
      errorMessage: errorMessage,
      docName: req.query.docName
    });
  } catch (error) {
    logger.error('Error rendering something went wrong page:', error);
    res.status(500).send('Internal Server Error');
  }
};
