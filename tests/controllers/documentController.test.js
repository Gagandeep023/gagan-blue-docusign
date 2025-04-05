const { expect } = require('chai');
const sinon = require('sinon');
const documentController = require('../../lib/controllers/documentController');
const logger = require('../../lib/utils/logger');

describe('Document Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {
        docName: 'test.pdf'
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

  describe('docsList', () => {
    it('should render docs-list page successfully', async () => {
      await documentController.docsList(req, res);

      expect(res.render.calledWith('pages/docs-list')).to.be.true;
    });
  });

  describe('viewDoc', () => {
    it('should render view-doc page with docName', async () => {
      await documentController.viewDoc(req, res);

      expect(res.render.calledWith('pages/view-doc', {
        docName: req.query.docName
      })).to.be.true;
    });

  });

  describe('editDoc', () => {
    it('should render edit-doc page with docName', async () => {
      await documentController.editDoc(req, res);

      expect(res.render.calledWith('pages/edit-doc', {
        docName: 'test.pdf'
      })).to.be.true;
    });
  });
});
