// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var mysql 	   = require("mysql");

// configure app to use bodyParser() this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

var db_con = mysql.createConnection({	// connection to mysql database
	connectionLimit : 20,
    host: "104.196.219.23",
    user: "root",
    password: "root",
    database: "owl_repair_dev",
    multipleStatements: true
});

// ROUTES FOR OUR API
// =============================================================================

var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

router.route('/campus')

	.post(function(req, res) {
	
		db_con.query('SET @campus_id = 0; CALL sp_create_campus(@campus_id, ?); SELECT @campus_id', [req.body.name], function(err,rows){
			if (err) {
                console.log(err);
                throw err;
            }

			var NEWID = rows[2][0]["@campus_id"];
			res.json({ NEWID });
		});
	});

router.route('/test')

	.get(function(req, res) {
	
        connection.query('SELECT * FROM LU_CATEGORY', function(err, result) {
            
          if (err) throw err;

          console.log(result.insertId);
        });
	});



router.route('/categories')

	.get(function(req, res) {
        
        db_con.query('CALL sp_get_categories()', function(err,rows){
			if (err) {
                console.log(err);
                throw err;
            }

			res.json({ CATEGORIES: rows[0] });
		});
    });

router.route('/request/submit')

    .post(function(req, res) {

        db_con.query('SET @request_id = 0; CALL sp_create_request(@request_id, ?, ?, ?, ?, ?, ?, ?, ?); SELECT @request_id', 
                     [req.body.userId, req.body.campusId, req.body.buildingId, req.body.locationDesc, req.body.categoryId ,req.body.desc, req.body.imagePath, req.body.public], function(err,rows){
			if (err) {
                console.log(err);
                throw err;
            }

			var NEWID = rows[2][0]["@request_id"];
			res.json({ NEWID });
		});
    
    });

router.route('/request/getAllPublic')

    .get(function(req, res) {
        
        db_con.query('CALL sp_get_all_public_requests()', function(err,rows){
			if (err) {
                console.log(err);
                throw err;
            }

			res.json({ REQUESTS: rows[0] });
		});
        
    });

router.route('/request/getAllByUser')

    .post(function(req, res) {

        db_con.query('CALL sp_get_all_requests_for_user(?)', [req.body.userId], function(err,rows){
			if (err) {
                console.log(err);
                throw err;
            }

			res.json({ USERS_REQUESTS: rows[0] });
		});
        
    });

router.route('/request/delete')

    .post(function(req, res) {

        db_con.query('CALL sp_delete_request(?)', [req.body.requestId], function(err,rows){
			if (err) {
                console.log(err);
                throw err;
            }

            res.end();
		});
        
    });
	
	
// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);