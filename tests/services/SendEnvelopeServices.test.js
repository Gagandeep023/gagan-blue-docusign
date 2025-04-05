const { expect } = require('chai');
const sinon = require('sinon');
const docusign = require('docusign-esign');
const { sendEnvelopeFromTemplate, makeEnvelope } = require('../../lib/services/SendEnvelopeServices');
const logger = require('../../lib/utils/logger');

describe('Send Envelope Services', () => {
  let mockArgs, mockEnvelopesApi, mockApiClient;

  beforeEach(() => {
    // Mock arguments
    mockArgs = {
      basePath: 'https://demo.docusign.net/restapi',
      accessToken: 'test-token',
      accountId: 'test-account-id',
      templateId: 'test-template-id',
      envelopeArgs: {
        templateId: 'test-template-id',
        signers: [
          {
            id: '1',
            name: 'Test Signer 1',
            email: 'test1@example.com'
          },
          {
            id: '2',
            name: 'Test Signer 2',
            email: 'test2@example.com'
          }
        ]
      }
    };

    // Mock DocuSign API client and methods
    mockApiClient = {
      setBasePath: sinon.stub(),
      addDefaultHeader: sinon.stub()
    };

    mockEnvelopesApi = {
      createEnvelope: sinon.stub()
    };

    // Stub DocuSign constructors
    sinon.stub(docusign, 'ApiClient').returns(mockApiClient);
    sinon.stub(docusign, 'EnvelopesApi').returns(mockEnvelopesApi);
    sinon.stub(docusign, 'EnvelopeDefinition');
    sinon.stub(docusign, 'TemplateRole');

    // Mock logger
    sinon.stub(logger, 'info');
    sinon.stub(logger, 'error');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('sendEnvelopeFromTemplate', () => {
    it('should send envelope successfully', async () => {
      // Mock successful envelope creation
      const mockResult = {
        envelopeId: 'test-envelope-id',
        status: 'sent'
      };
      mockEnvelopesApi.createEnvelope.resolves(mockResult);

      const result = await sendEnvelopeFromTemplate(mockArgs);

      expect(result).to.deep.equal(mockResult);
      expect(mockApiClient.setBasePath.calledWith(mockArgs.basePath)).to.be.true;
      expect(mockApiClient.addDefaultHeader.calledWith('Authorization', 'Bearer ' + mockArgs.accessToken)).to.be.true;
      expect(mockEnvelopesApi.createEnvelope.calledWith(mockArgs.accountId)).to.be.true;
      expect(logger.info.calledWith('Creating envelope with template ID:', mockArgs.templateId)).to.be.true;
      expect(logger.info.calledWith('Envelope created successfully:', mockResult)).to.be.true;
    });

    it('should handle envelope creation error', async () => {
      const error = new Error('Envelope creation failed');
      mockEnvelopesApi.createEnvelope.rejects(error);

      try {
        await sendEnvelopeFromTemplate(mockArgs);
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err).to.equal(error);
        expect(logger.error.calledWith('Error sending envelope from template:', error)).to.be.true;
      }
    });
  });

  describe('makeEnvelope', () => {
    it('should create envelope definition with correct template roles', () => {
      const envelope = makeEnvelope(mockArgs.envelopeArgs);

      expect(envelope.templateId).to.equal(mockArgs.envelopeArgs.templateId);
      expect(envelope.status).to.equal('sent');
      expect(envelope.templateRoles).to.be.an('array');
      expect(envelope.templateRoles).to.have.lengthOf(2);

      // Verify first signer
      expect(envelope.templateRoles[0].email).to.equal('test1@example.com');
      expect(envelope.templateRoles[0].name).to.equal('Test Signer 1');
      expect(envelope.templateRoles[0].roleName).to.equal('1');

      // Verify second signer
      expect(envelope.templateRoles[1].email).to.equal('test2@example.com');
      expect(envelope.templateRoles[1].name).to.equal('Test Signer 2');
      expect(envelope.templateRoles[1].roleName).to.equal('2');

      expect(logger.info.calledWith('Envelope definition created with template roles:', envelope.templateRoles)).to.be.true;
    });

    it('should handle empty signers array', () => {
      const args = {
        templateId: 'test-template-id',
        signers: []
      };

      const envelope = makeEnvelope(args);

      expect(envelope.templateId).to.equal(args.templateId);
      expect(envelope.status).to.equal('sent');
      expect(envelope.templateRoles).to.be.an('array');
      expect(envelope.templateRoles).to.have.lengthOf(0);
    });

    it('should handle missing templateId', () => {
      const args = {
        signers: [
          {
            id: '1',
            name: 'Test Signer',
            email: 'test@example.com'
          }
        ]
      };

      const envelope = makeEnvelope(args);

      expect(envelope.templateId).to.be.undefined;
      expect(envelope.status).to.equal('sent');
      expect(envelope.templateRoles).to.be.an('array');
      expect(envelope.templateRoles).to.have.lengthOf(1);
    });
  });
});
