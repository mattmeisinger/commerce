/**
* ProductCatalog.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  connection: 'dynamoDb',

  attributes: {
    id: {
      type: 'integer',
      unique: true,
      primaryKey: true,
    },
    rating: 'integer',
    category: 'string',
    shortDescription: 'string',
    longDescription: 'string',
    comments: 'array',
    imageLink: 'string'
  }
};

