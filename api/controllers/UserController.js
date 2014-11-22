/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  
  //
  // Starts a new session using the username provided. For the purposes
  // of this project, it's safe to assume that the consumer of this API
  // has already authenticated the identity of the user by the time it
  // calls this method.
  //
  // url: /user/authenticate?username=exampleuser
  //
  // Params expected:
  //   username: Username of user logging in
  //
  authenticated: function (req, res) {
    var username = req.param('username');
    if (username) {
      
      // TODO: Start new session
      
      return res.json({message:'Logged in as ' + username});
    }
    else {
      res.status(400);
      return res.json({message:'"Username" parameter required.'})
    }
  },

};

