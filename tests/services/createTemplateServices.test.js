const { expect } = require('chai');
const sinon = require('sinon');
const docusign = require('docusign-esign');
const fs = require('fs-extra');
const { createTemplate } = require('../../lib/services/createTemplateServices');
const logger = require('../../lib/utils/logger');

describe('Create Template Services', () => {
  let mockArgs, mockTemplatesApi, mockApiClient;

  beforeEach(() => {
    // Mock arguments
    mockArgs = {
      basePath: 'https://demo.docusign.net/restapi',
      accessToken: 'test-token',
      accountId: 'test-account-id',
      templateName: 'Test Template',
      docName: 'test.pdf',
      docFile: '/path/to/test.pdf',
      signers: [
        {
          id: '1',
          name: 'Test Signer',
          email: 'test@example.com'
        }
      ],
      blocks: [
        {
          blockId: 'block1',
          blockType: 'text',
          blockLeft: 100,
          blockTop: 200,
          blockPage: 1,
          blockSignerId: '1'
        },
        {
          blockId: 'block2',
          blockType: 'signature',
          blockLeft: 300,
          blockTop: 400,
          blockPage: 1,
          blockSignerId: '1'
        }
      ]
    };

    // Mock DocuSign API client and methods
    mockApiClient = {
      setBasePath: sinon.stub(),
      addDefaultHeader: sinon.stub()
    };

    mockTemplatesApi = {
      createTemplate: sinon.stub(),
      listTemplates: sinon.stub()
    };

    // Stub DocuSign constructors
    sinon.stub(docusign, 'ApiClient').returns(mockApiClient);
    sinon.stub(docusign, 'TemplatesApi').returns(mockTemplatesApi);
    sinon.stub(docusign, 'Signer');
    sinon.stub(docusign, 'Document');
    sinon.stub(docusign, 'EnvelopeTemplate');
    sinon.stub(docusign, 'Recipients');

    // Mock fs-extra
    sinon.stub(fs, 'readFileSync').returns(Buffer.from('test-pdf-content'));

    // Mock logger
    sinon.stub(logger, 'info');
    sinon.stub(logger, 'error');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('createTemplate', () => {
    it('should create template successfully', async () => {
      // Mock successful template creation
      mockTemplatesApi.createTemplate.resolves({
        templateId: 'test-template-id',
        name: 'Test Template'
      });

      // Mock successful template listing
      mockTemplatesApi.listTemplates.resolves({
        envelopeTemplates: [{
          templateId: 'test-template-id',
          name: 'Test Template'
        }]
      });

      const result = await createTemplate(mockArgs);

      expect(result).to.deep.equal({
        templateId: 'test-template-id',
        templateName: 'Test Template',
        createdNewTemplate: true
      });

      expect(mockApiClient.setBasePath.calledWith(mockArgs.basePath)).to.be.true;
      expect(mockApiClient.addDefaultHeader.calledWith('Authorization', 'Bearer ' + mockArgs.accessToken)).to.be.true;
      expect(mockTemplatesApi.createTemplate.calledWith(mockArgs.accountId)).to.be.true;
      expect(mockTemplatesApi.listTemplates.calledWith(mockArgs.accountId, {
        searchText: mockArgs.templateName
      })).to.be.true;
      expect(logger.info.calledWith('Template created successfully.')).to.be.true;
      expect(logger.info.calledWith('Template ID: test-template-id, Template Name: Test Template')).to.be.true;
    });

    it('should handle template creation error', async () => {
      const error = new Error('Template creation failed');
      mockTemplatesApi.createTemplate.rejects(error);

      try {
        await createTemplate(mockArgs);
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err).to.equal(error);
        expect(logger.error.calledWith('Error creating template:', error)).to.be.true;
      }
    });

    it('should handle template listing error', async () => {
      // Mock successful template creation
      mockTemplatesApi.createTemplate.resolves({
        templateId: 'test-template-id',
        name: 'Test Template'
      });

      // Mock failed template listing
      const error = new Error('Template listing failed');
      mockTemplatesApi.listTemplates.rejects(error);

      try {
        await createTemplate(mockArgs);
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err).to.equal(error);
        expect(logger.error.calledWith('Error creating template:', error)).to.be.true;
      }
    });

    it('should handle missing required parameters', async () => {
      const invalidArgs = { ...mockArgs };
      delete invalidArgs.accountId;

      try {
        await createTemplate(invalidArgs);
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err).to.be.an('error');
      }
    });
  });
});
