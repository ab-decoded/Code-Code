var pp=require('passport');
// var passport=require('./passport')(pp);
function isLoggedIn(req,res,next){
	if(req.isAuthenticated())
		return next;
	res.redirect('/');
}


module.exports = function(app,router,passport){

	var pauth = passport.authenticate.bind(passport);

	router.use(function(req, res, next) {
		// do logging
		console.log('Something is happening.');
		next();
	});
	
	//home route
	var home = require('../app/controllers/home');
	router.get('/',home.index);
	/////////////////////////////////
	//accounts routes///////////////
	///////////////////////////////
	var accounts = require('../app/controllers/accounts');
	router.get('/signup', accounts.signup);
	router.get('/signin',accounts.signin);
	router.get('/profile',isLoggedIn,accounts.profile);
	router.get('/logout',accounts.logout);
	//local
	router.post('/users',accounts.create);
	router.post('/users/session',pauth('local',{
		failureRedirect:'/signin',
		failureFlash:'Invalid email or password'
	}),accounts.session);
	//facebook
	router.get('/auth/facebook',
	  passport.authenticate('facebook', {
	    scope: [ 'email'],
	    failureRedirect: '/login'
	  }), accounts.signin);
	router.get('/auth/facebook/callback',
	  passport.authenticate('facebook', {
	    failureRedirect: '/login'
	  }), accounts.authCallback);

	router.param('userId',accounts.load);

	/////////////////////////////////
	//chat routes///////////////////
	///////////////////////////////
	var chat=require('../app/controllers/chat')
	router.get('/chat',chat.index);

	/////////////////////////////////
	//chat routes///////////////////
	///////////////////////////////
	var code=require('../app/controllers/code')
	router.get('/code',code.index);
};
