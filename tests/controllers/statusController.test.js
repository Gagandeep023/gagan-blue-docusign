const { expect } = require('chai');
const sinon = require('sinon');
const statusController = require('../../lib/controllers/statusController');
const logger = require('../../lib/utils/logger');

describe('Status Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {
        docName: 'test.pdf',
        errorMessage: 'Test error message'
      }
    };

    res = {
      status: sinon.stub().returnsThis(),
      render: sinon.stub(),
      send: sinon.stub()
    };

    // Mock logger methods
    sinon.stub(logger, 'error');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('success', () => {
    it('should render success page with docName', async () => {
      await statusController.success(req, res);

      expect(res.render.calledWith('pages/success_page', {
        message: 'Envelope sent successfully!',
        docName: 'test.pdf'
      })).to.be.true;
    });

    it('should handle missing docName parameter', async () => {
      req.query.docName = undefined;

      await statusController.success(req, res);

      expect(res.render.calledWith('pages/success_page', {
        message: 'Envelope sent successfully!',
        docName: undefined
      })).to.be.true;
    });

    it('should handle rendering error', async () => {
      const error = new Error('Render error');
      res.render.throws(error);

      await statusController.success(req, res);

      expect(logger.error.calledWith('Error rendering success page:', error)).to.be.true;
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.send.calledWith('Internal Server Error')).to.be.true;
    });
  });

  describe('failure', () => {
    it('should render failure page with error message and docName', async () => {
      await statusController.failure(req, res);

      expect(res.render.calledWith('pages/failure_page', {
        errorMessage: 'Test error message',
        docName: 'test.pdf'
      })).to.be.true;
    });

    it('should use default error message when not provided', async () => {
      req.query.errorMessage = undefined;

      await statusController.failure(req, res);

      expect(res.render.calledWith('pages/failure_page', {
        errorMessage: 'An unknown error occurred.',
        docName: 'test.pdf'
      })).to.be.true;
    });

    it('should handle missing docName parameter', async () => {
      req.query.docName = undefined;

      await statusController.failure(req, res);

      expect(res.render.calledWith('pages/failure_page', {
        errorMessage: 'Test error message',
        docName: undefined
      })).to.be.true;
    });

    it('should handle rendering error', async () => {
      const error = new Error('Render error');
      res.render.throws(error);

      await statusController.failure(req, res);

      expect(logger.error.calledWith('Error rendering failure page:', error)).to.be.true;
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.send.calledWith('Internal Server Error')).to.be.true;
    });
  });

  describe('somethingWentWrong', () => {
    it('should render something went wrong page with error message and docName', async () => {
      await statusController.somethingWentWrong(req, res);

      expect(res.render.calledWith('pages/something_went_wrong_page', {
        errorMessage: 'Test error message',
        docName: 'test.pdf'
      })).to.be.true;
    });

    it('should use default error message when not provided', async () => {
      req.query.errorMessage = undefined;

      await statusController.somethingWentWrong(req, res);

      expect(res.render.calledWith('pages/something_went_wrong_page', {
        errorMessage: 'There was an error processing your request.',
        docName: 'test.pdf'
      })).to.be.true;
    });

    it('should handle missing docName parameter', async () => {
      req.query.docName = undefined;

      await statusController.somethingWentWrong(req, res);

      expect(res.render.calledWith('pages/something_went_wrong_page', {
        errorMessage: 'Test error message',
        docName: undefined
      })).to.be.true;
    });

    it('should handle rendering error', async () => {
      const error = new Error('Render error');
      res.render.throws(error);

      await statusController.somethingWentWrong(req, res);

      expect(logger.error.calledWith('Error rendering something went wrong page:', error)).to.be.true;
      expect(res.status.calledWith(500)).to.be.true;
      expect(res.send.calledWith('Internal Server Error')).to.be.true;
    });
  });
});
