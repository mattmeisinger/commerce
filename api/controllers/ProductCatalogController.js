/**
 * ProductCatalogController
 *
 * @description :: Server-side logic for managing productcatalogs
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var vogels = require('vogels');
vogels.AWS.config.loadFromPath('credentials.json');

var ProductCatalog = vogels.define('ProductCatalog', function (schema) {
  schema.UUID('id', {hashKey: true});
  schema.Number('rating');
  schema.String('category');
  schema.String('shortDescription');
  schema.String('longDescription');
  schema.StringSet('comments');
  schema.String('imageLink');
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
    var product = {
      id:               req.param('id'),
      rating:           req.param('rating') || 0,
      category:         req.param('category') || "No category",
      shortDescription: req.param('shortDescription') || "Empty description",
      longDescription:  req.param('longDescription') || "Empty description",
      comments:         req.param('comments') || [],
      imageLink:        req.param('imageLink')
    }

    ProductCatalog.create(product, function(err, product) {
      return err ? res.badRequest(err) : res.ok(product);
    });
  },


  /**
   * `ProductCatalogController.update()
   */
  update: function (req, res) {
    var product = {
      id:               req.param('id'),
      rating:           req.param('rating') || 0,
      category:         req.param('category') || "No category",
      shortDescription: req.param('shortDescription') || "Empty description",
      longDescription:  req.param('longDescription') || "Empty description",
      comments:         req.param('comments') || [],
      imageLink:        req.param('imageLink')
    }

    ProductCatalog.update(product, function(err, product) {
      return err ? res.badRequest(err) : res.ok(product);
    });
  },

  /**
   * `ProductCatalogController.destroy()`
   */
  destroy: function (req, res) {
    ProductCatalog.destroy(req.param('id'), function(err) {
      return err ? res.badRequest(err) : res.ok();
    });
  },


  /**
   * `ProductCatalogController.findByProductId()`
   */
  findByProductId: function (req, res) {
    ProductCatalog.get(req.param('id'), function(err, product) {
      return err ? res.badRequest(err) : res.ok(product);
    });
  },


  /**
   * `ProductCatalogController.findByCategory()`
   */
  findByCategory: function (req, res) {
    ProductCatalog
      .scan()
      .where('category').equals(req.param('category'))
      .exec(function(err, products) {
        return err ? res.badRequest(err) : res.ok(products);
      });
  },


  /**
   * `ProductCatalogController.findByRating()`
   */
  findByRating: function (req, res) {
    ProductCatalog
      .scan()
      .where('rating').equals(req.param('rating'))
      .exec(function(err, products) {
        return err ? res.badRequest(err) : res.ok(products);
      });
  }

};

