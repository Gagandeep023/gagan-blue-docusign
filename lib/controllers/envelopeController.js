const path = require('path');
const { sendEnvelopeFromTemplate } = require('../services/SendEnvelopeServices.js');
const { createTemplate } = require('../services/createTemplateServices.js');
const logger = require('../utils/logger');

const envelopeController = exports;
const minimumBufferMin = 3;
const docsPath = path.resolve(__dirname, '../../documents');

envelopeController.createTemplateAndSendEnvelope = async (req, res) => {
  try {
    if (!req.session || !req.session.accessToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!req.body.docName || !req.body.docFile || !req.body.signers || !req.body.blocks) {
      return res.redirect('/something-went-wrong?errorMessage=Missing required parameters');
    }

    // Create template
    const templateResult = await createTemplate({
      basePath: req.session.basePath,
      accessToken: req.session.accessToken,
      accountId: req.session.accountId,
      templateName: req.body.docName,
      docName: req.body.docName,
      docFile: req.body.docFile,
      signers: req.body.signers,
      blocks: req.body.blocks
    });

    // Send envelope
    const envelopeResult = await sendEnvelopeFromTemplate({
      basePath: req.session.basePath,
      accessToken: req.session.accessToken,
      accountId: req.session.accountId,
      templateId: templateResult.templateId,
      envelopeArgs: {
        templateId: templateResult.templateId,
        signers: req.body.signers
      }
    });

    res.redirect(`/success?docName=${req.body.docName}`);
  } catch (error) {
    logger.error('Error in createTemplateAndSendEnvelope:', error);
    if (error.message.includes('template')) {
      res.redirect(`/something-went-wrong?docName=${req.body.docName}&errorMessage=Error creating template`);
    } else if (error.message.includes('envelope')) {
      res.redirect(`/something-went-wrong?docName=${req.body.docName}&errorMessage=Error sending envelope`);
    } else {
      res.redirect('/something-went-wrong?errorMessage=An unexpected error occurred');
    }
  }
};
