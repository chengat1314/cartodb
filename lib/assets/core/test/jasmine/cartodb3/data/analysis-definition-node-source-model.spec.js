var ConfigModel = require('../../../../javascripts/cartodb3/data/config-model');
var AnalysisDefinitionNodesCollection = require('../../../../javascripts/cartodb3/data/analysis-definition-nodes-collection');
var UserModel = require('../../../../javascripts/cartodb3/data/user-model');

describe('cartodb3/data/analysis-definition-node-source-model', function () {
  beforeEach(function () {
    var configModel = new ConfigModel({
      base_url: '/u/pepe'
    });

    this.userModel = new UserModel({
      username: 'pericoo'
    }, {
      configModel: configModel
    });

    this.collection = new AnalysisDefinitionNodesCollection(null, {
      configModel: configModel,
      userModel: this.userModel
    });

    var analysisParams = {
      id: 'a0',
      type: 'source',
      params: {
        query: 'SELECT * FROM bar'
      },
      options: {
        table_name: 'bar',
        test: 'hello'
      }
    };

    this.model = this.collection.add(analysisParams);
  });

  describe('.getDefaultQuery', function () {
    beforeEach(function () {
      spyOn(this.userModel, 'isInsideOrg');
      spyOn(this.model.tableModel, 'getOwnerName');
    });

    it('should provide a default query without qualifing if user does not belong to an organization', function () {
      this.userModel.isInsideOrg.and.returnValue(false);
      this.model.tableModel.getOwnerName.and.returnValue('pericoo');
      expect(this.model.getDefaultQuery()).toBe('SELECT * FROM bar');
    });

    it('should provide a default query with qualifing if user does belong to an organization', function () {
      this.userModel.isInsideOrg.and.returnValue(true);
      this.model.tableModel.getOwnerName.and.returnValue('pericoo');
      expect(this.model.getDefaultQuery()).toBe('SELECT * FROM pericoo.bar');
    });

    it('should provide a default query with qualifing if user does belong to an organization and is not the owner', function () {
      this.userModel.isInsideOrg.and.returnValue(true);
      this.model.tableModel.getOwnerName.and.returnValue('hello');
      expect(this.model.getDefaultQuery()).toBe('SELECT * FROM hello.bar');
    });
  });

  describe('.isCustomQueryApplied', function () {
    /*
      It just compares two queries, not worth it to be tested.
    */
  });

  describe('.isReadOnly', function () {
    beforeEach(function () {
      spyOn(this.model.tableModel, 'isReadOnly');
      spyOn(this.model, 'isCustomQueryApplied');
    });

    it('should be true if table-model is read-only', function () {
      this.model.tableModel.isReadOnly.and.returnValue(true);
      expect(this.model.isReadOnly()).toBeTruthy();
    });

    it('should be true if table-model is read-only', function () {
      this.model.tableModel.isReadOnly.and.returnValue(false);
      this.model.isCustomQueryApplied.and.returnValue(true);
      expect(this.model.isReadOnly()).toBeTruthy();
    });

    it('should be false if table-model is not read-only and custom query is not applied', function () {
      this.model.tableModel.isReadOnly.and.returnValue(false);
      this.model.isCustomQueryApplied.and.returnValue(false);
      expect(this.model.isReadOnly()).toBeFalsy();
    });
  });
});
