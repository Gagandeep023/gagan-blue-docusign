const docusign = require('docusign-esign');
const fs = require('fs-extra');
const logger = require('../utils/logger');

const createTemplate = async (args) => {
  try {
    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(args.basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
    let templatesApi = new docusign.TemplatesApi(dsApiClient);

    let templateReqObject = makeTemplateForSigning(args);
    let results = await templatesApi.createTemplate(args.accountId, {
      envelopeTemplate: templateReqObject,
    });

    logger.info('Template created successfully.');

    results = await templatesApi.listTemplates(args.accountId, {
      searchText: args.templateName,
    });

    let templateId = results.envelopeTemplates[0].templateId;
    let resultsTemplateName = results.envelopeTemplates[0].name;

    logger.info(`Template ID: ${templateId}, Template Name: ${resultsTemplateName}`);

    return {
      templateId: templateId,
      templateName: resultsTemplateName,
      createdNewTemplate: true,
    };
  } catch (error) {
    logger.error('Error creating template:', error);
    throw error;
  }
};

const makeTemplateForSigning = (args) => {
  try {
    const signers = args.signers.map(signer => {
      return docusign.Signer.constructFromObject({
        email: signer.email,
        name: signer.name,
        recipientId: signer.id,
        routingOrder: '1',
        roleName: signer.id,
      });
    });

    const tabs = {};
    args.blocks.forEach(block => {
      const { blockId, blockType, blockLeft, blockTop, blockPage, blockSignerId } = block;
      if (!tabs[blockSignerId]) {
        tabs[blockSignerId] = { signHereTabs: [], textTabs: [] };
      }

      if (blockType === 'text') {
        const textTab = docusign.Text.constructFromObject({
          anchorUnits: 'pixels',
          documentId: '1',
          pageNumber: blockPage,
          xPosition: blockLeft.toString(),
          yPosition: blockTop.toString(),
          tabLabel: blockId,
          required: 'false',
          height: '23',
          width: '84',
        });
        tabs[blockSignerId].textTabs.push(textTab);
      } else if (blockType === 'signature') {
        const signHereTab = docusign.SignHere.constructFromObject({
          anchorUnits: 'pixels',
          documentId: '1',
          pageNumber: blockPage,
          xPosition: blockLeft.toString(),
          yPosition: blockTop.toString(),
          tabLabel: blockId,
        });
        tabs[blockSignerId].signHereTabs.push(signHereTab);
      }
    });

    signers.forEach(signer => {
      signer.tabs = tabs[signer.recipientId];
    });

    let docPdfBytes = fs.readFileSync(args.docFile);
    let doc = new docusign.Document();
    let docB64 = Buffer.from(docPdfBytes).toString('base64');
    doc.documentBase64 = docB64;
    doc.name = args.docName;
    doc.fileExtension = 'pdf';
    doc.documentId = '1';

    const signerTabs = signers.map(signer => {
      return docusign.Tabs.constructFromObject({
        signHereTabs: tabs[signer.recipientId]?.signHereTabs || [],
        textTabs: tabs[signer.recipientId]?.textTabs || [],
      });
    });

    signers.forEach((signer, index) => {
      signer.tabs = signerTabs[index];
    });

    let recipients = docusign.Recipients.constructFromObject({
      signers: signers,
    });

    let template = new docusign.EnvelopeTemplate.constructFromObject({
      documents: [doc],
      emailSubject: 'Please sign this document',
      description: 'Example template created via the API',
      name: args.templateName,
      shared: 'false',
      recipients: recipients,
      status: 'created',
    });

    return template;
  } catch (error) {
    logger.error('Error making template for signing:', error);
    throw error;
  }
};

module.exports = { createTemplate };
