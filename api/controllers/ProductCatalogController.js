/**
 * ProductCatalogController
 *
 * @description :: Server-side logic for managing productcatalogs
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var vogels = require('vogels');
vogels.AWS.config.loadFromPath('credentials.json');

var ProductCatalog = vogels.define('ProductCatalog', function (schema) {
  schema.String('id', {hashKey: true});
  schema.String('category');
  schema.Number('rating');
});

ProductCatalog.config({tableName: 'ProductCatalog'});

module.exports = {

  /**
   * `ProductCatalogController.create()`
   */
  findAll: function (req, res) {
    ProductCatalog
      .scan()
      .exec(function(err, products) {
        return res.json(products);
      });
  },

  /**
   * `ProductCatalogController.create()`
   */
  create: function (req, res) {
    return res.json({
      todo: 'create() is not implemented yet!'
    });
  },


  /**
   * `ProductCatalogController.update()
   */
  update: function (req, res) {
    return res.json({
      todo: 'update() is not implemented yet!'
    });
  },

  /**
   * `ProductCatalogController.destroy()`
   */
  destroy: function (req, res) {
    return res.json({
      todo: 'destroy() is not implemented yet!'
    });
  },


  /**
   * `ProductCatalogController.findByProductId()`
   */
  findByProductId: function (req, res) {
    return res.json({
      todo: 'findByProductId() is not implemented yet!'
    });
  },


  /**
   * `ProductCatalogController.findByCategory()`
   */
  findByCategory: function (req, res) {
    return res.json({
      todo: 'findByCategory() is not implemented yet!'
    });
  },


  /**
   * `ProductCatalogController.findByRating()`
   */
  findByRating: function (req, res) {
    return res.json({
      todo: 'findByRating() is not implemented yet!'
    });
  }

};

