const docusign = require('docusign-esign');
const logger = require('../utils/logger');

const sendEnvelopeFromTemplate = async (args) => {
  try {
    let dsApiClient = new docusign.ApiClient();
    dsApiClient.setBasePath(args.basePath);
    dsApiClient.addDefaultHeader('Authorization', 'Bearer ' + args.accessToken);
    let envelopesApi = new docusign.EnvelopesApi(dsApiClient);

    let envelope = makeEnvelope(args.envelopeArgs);
    logger.info('Creating envelope with template ID:', args.templateId);

    let results = await envelopesApi.createEnvelope(args.accountId, {
      envelopeDefinition: envelope,
    });

    logger.info('Envelope created successfully:', results);
    return results;
  } catch (error) {
    logger.error('Error sending envelope from template:', error);
    throw error;
  }
};

function makeEnvelope(args) {
  let env = new docusign.EnvelopeDefinition();
  env.templateId = args.templateId;

  const signerRoles = args.signers.map(signer => {
    return docusign.TemplateRole.constructFromObject({
      email: signer.email,
      name: signer.name,
      roleName: signer.id,
    });
  });

  env.templateRoles = signerRoles;
  env.status = 'sent';

  logger.info('Envelope definition created with template roles:', signerRoles);
  return env;
}

module.exports = { sendEnvelopeFromTemplate, makeEnvelope };
