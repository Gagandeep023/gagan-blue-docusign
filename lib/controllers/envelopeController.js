const path = require('path');
const { sendEnvelopeFromTemplate } = require('../services/SendEnvelopeServices.js');
const { createTemplate } = require('../services/createTemplateServices.js');
const logger = require('../utils/logger');

const envelopeController = exports;
const minimumBufferMin = 3;
const docsPath = path.resolve(__dirname, '../../documents');

envelopeController.createTemplateAndSendEnvelope = async (req, res) => {
  try {

    const isTokenOK = req.dsAuth.checkToken(minimumBufferMin);
    if (!isTokenOK) {
      logger.warn('Unauthorized access attempt: Token is not valid');
      return res.status(401).send({
        title: 'Unauthorized',
        message: 'Token is not valid'
      });
    }

    const templateId = Math.random().toString(36).substring(2, 15);

    const args = {
      accessToken: req.user.accessToken,
      basePath: req.session.basePath,
      accountId: req.session.accountId,
      templateName: `${req.body.docName}-${templateId}`,
      docFile: path.resolve(docsPath, req.body.docName),
      ...req.body
    };

    const createTemplateResults = await createTemplate(args);
    req.session.templateId = createTemplateResults.templateId;

    const envelopeArgs = {
      templateId: req.session.templateId,
      ...req.body
    };
    const envelopeArgsComplete = {
      accessToken: req.user.accessToken,
      basePath: req.session.basePath,
      accountId: req.session.accountId,
      envelopeArgs: envelopeArgs
    };

    const sendEnvelopeFromTemplateResults = await sendEnvelopeFromTemplate(envelopeArgsComplete);

    return res.status(200).send({
      title: 'Success',
      message: JSON.stringify(sendEnvelopeFromTemplateResults)
    });
  } catch (error) {
    logger.error('Error in createTemplateAndSendEnvelope:', error);
    return res.status(500).send({
      title: 'Error',
      message: JSON.stringify(error)
    });
  }
};
