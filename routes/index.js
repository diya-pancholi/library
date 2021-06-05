var express = require('express');
var router = express.Router();
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var app=express();
var mysql= require('mysql');
var crypto= require('crypto');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'diyapancholi',
  database : 'users'
});
 
connection.connect();



router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/seecheckout', function(req, res, next) {
	console.log('diya');
      var book = undefined;
	  connection.query(`select * from books where availability="no" and lender=${req.session.uid} and requester=0 and approved = "yes";`, function(err, result){
		console.log(err); 
		
		res.render('viewbook', {'list':result})
	  })
	
  });

  router.get('/addbooklink', function(req, res, next) {
	res.render('addbook', { title: 'Express' });
  });

 

 
   router.get('/checkout', function(req, res, next) {
	   console.log('diya');
	connection.query(`UPDATE books SET availability = "no", requester = 1, lender = ${req.session.uid} WHERE id=${req.query.id} ;`, (error, results, fields) => {
		if (error){
		  return console.error(error.message);
		}
		console.log('Rows affected:', results.affectedRows);
		res.redirect('/home');
	  });
   }); 
   
   router.get('/checkin', function(req, res, next) {
	console.log('diya');
 connection.query(`UPDATE books SET availability = "yes", requester = NULL, lender = NULL WHERE id=${req.query.id} ;`, (error, results, fields) => {
	 if (error){
	   return console.error(error.message);
	 }
	 console.log('Rows affected:', results.affectedRows);
	 res.redirect('/seecheckout');
   });
}); 
  
   router.get('/approve', function(req, res, next) {
	connection.query(`UPDATE books SET approved = "yes", requester = 0 WHERE id= ${req.query.id}`, (error, results, fields) => {
		if (error){
		  return console.log(error);
		}
		console.log('Rows affected:', results.affectedRows);
		res.redirect('/ahome');
	  });
   });

   router.get('/disapprove', function(req, res, next) {
	connection.query(`UPDATE books SET approved = NULL, requester = NULL, lender=NULL, availability="yes" WHERE id= ${req.query.id}`, (error, results, fields) => {
		if (error){
		  return console.log(error);
		}
		console.log('Rows affected:', results.affectedRows);
		res.redirect('/ahome');
	  });
   });




router.get('/loginviaimg', function(req, res, next) {
	res.render('signin', { title: 'Express' });
  });
 
  router.get('/registerviaimg', function(req, res, next) {
	res.render('login', { title: 'Express' });
  });
router.post('/register', function(req, res, next) {
  console.log(req.body);
 
  connection.query('INSERT INTO people (email, password, role) VALUES ("'+req.body.email+'" , "'+crypto.createHash('sha256').update(req.body.pswd).digest('hex')+'", "user");', function (error, results, fields) {
    
    console.log(error);
    res.redirect('/home');
  });
  
});

router.post('/addbook', function(req, res, next) {
	console.log(req.body);
   
	connection.query('INSERT INTO books (name, genre, availability) VALUES ("'+req.body.name+'" , "'+req.body.genre+'", "yes");', function (error, results, fields) {
	  
	  console.log(error);
	  res.redirect('/ahome');
	});
	
  });

router.get('/home', function(req,res){
	var book = undefined;
	connection.query('select * from books where availability="yes";',function (err, result){
console.log(result);
		res.render('home', {'list':result})
	})
	
})

router.get('/viewrequest', function(req,res){
	var book = undefined;
	console.log(req.session.uid);
	connection.query(`select * from books where requester=1 and lender=${req.session.uid};`,function (err, result){
		console.log(result);
		res.render('viewrequest', {'list':result})
	})
	
})


router.get('/ahome', function(req,res){
	var book = undefined;
	connection.query('select * from books where availability="no" and requester="1";',function (err, result){
res.render('ahome', {'list':result})
	})
})

router.post('/auth', function(request, response) {
	var email = request.body.email;
	var pswd = crypto.createHash('sha256').update(request.body.pswd).digest('hex');
	if (email && pswd) {
		connection.query('SELECT * FROM people WHERE email = ? AND password = ?', [email, pswd], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.uid = results[0].id;
				if(results[0].role=="admin")
				response.redirect('/ahome');
				else
				response.redirect('/home');
			} else {
				response.send('Incorrect email and/or Pswd!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter email and Pswd!');
		response.end();
	}
});

app.listen(3000);

module.exports = router;
