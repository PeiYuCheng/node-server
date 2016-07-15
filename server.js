"use strict";

const restify = require( 'restify' );
const mkdirp = require( 'mkdirp' );
const os = require( 'os' );
const process = require( 'process' );
const path = require( 'path' );
const fs = require( 'fs' );
const assert = require( 'assert' );

const packagejson = require( './package.json' );

/**
 * The port to listen to, provided by the PORT environment variable.
 * @type {Numeric}
 */
const port = process.env.PORT || 8080;

/**
 * The request base path to query.php.
 * @type {String}
 */
const basepath = '/bin/shared/query.php';

/**
 * Error handler to send HTTP-500 if there was a problem.
 * @param  {[type]} err [description]
 * @return {[type]}     [description]
 */
var errorHandler = ( req, res, err ) => {
	console.log( 'ERROR %s\nRequest: %s', err.message, JSON.stringify( req.params ) );
	res.send( 500 );
};

var ping = function( req, res, next ) {
	// TODO
};

/**
 * Check if a folder exists
 * @param  {[type]} req.params.fexists  Folder name
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
var fexists = function( req, res, next ) {
	var fexists = path.join( '..', '..', req.params.fexists );

	try {
		fs.stat( fexists, function( err, stats ) {
			if ( err ) {
				console.log( "Cannot find %s: %s", fexists, err );
				res.send( 'NOT_FOUND' );
			} else {
				console.log( 'Found %s', fexists );
				res.send( 'FOUND' );
			}
		} );
	} catch ( e ) {
		console.log( "Error finding directory '%s': %s", fexists, e.message );
	}

	return next();
};

// POST request
var preview = function( req, res, next ) {
	// TODO
};

var setdocinfo = function( req, res, next ) {
	var boardsFolder = path.join( '..', '..', 'data', 'users', req.params.userid, 'boards' );
	var docIdFolder = path.join( '..', '..', 'data', 'users', req.params.userid, 'boards', req.params.docid );

	try {
		fs.stat( boardsFolder, function( err, stats ) {
			if ( err && err.code === 'ENOENT' ) {
				mkdirp( boardsFolder, '0775', function( err ) { //recursive mkdir
					if ( err ) {
						console.log( "Error making the directory '%s': %s", boardsFolder, err );
					}
				} );
			}
		} );

		fs.stat( docIdFolder, function( err, stats ) {
			if ( err && err.code === 'ENOENT' ) {
				mkdirp( docIdFolder, '0775', function( err ) {
					if ( err ) {
						console.log( "Error making the directory '%s': %s", docIdFolder, err );
					}
				} );
			}
		} );

		fs.writeFile(
			path.join( docIdFolder, '/board.info' ),
			req.params.title + '~.~' + req.params.description + '~.~',
			function( err ) {
				if ( err ) {
					res.send( 500 );
				} else {
					res.send( 200 );
				}
			}
		);

	} catch ( e ) {
		console.log( "Error setting doc info. '%s': %s", docIdFolder + '/board.info', e.message );
	}

	return next();
};

var getdocinfo = function( req, res, next ) {
	// TODO
};

// POST
var publish = function( req, res, next ) {
	// TODO
};

var setcontroller = function( req, res, next ) {
	// TODO
};

var setdevicedata = function( req, res, next ) {
	// TODO
};

var createsession = function( req, res, next ) {
	// TODO
};

var joinsession = function( req, res, next ) {
	// TODO
};

var savegrids = function( req, res, next ) {
	// TODO
};

var get_grids = function( req, res, next ) {
	// TODO
};

var get_icons = function( req, res, next ) {
	// TODO
};

var userpincreate = function( req, res, next ) {
	// TODO
};

var userpinadd = function( req, res, next ) {
	// TODO
};

var userpinactivate = function( req, res, next ) {
	// TODO
};

var addpinactivate = function( req, res, next ) {
	var pin;
	var userdata;
	var userDataPath = path.join( '..', '..', 'data', 'users', req.params.userid, 'data', 'user.info' );
	var pinPath = path.join( '..', '..', 'data', 'pending', req.params.userid );

	if ( req.params.pin !== 'LOCAL' ) {
		try {
			pin = fs.readFileSync( pinPath );
		} catch ( e ) {
			errorHandler( req, res, e );
		}
	}

	if ( ( req.params.pin === pin || req.params.pin == '0911' ) && req.params.userid != '' ) {
		try {
			fs.readFile( userDataPath, ( err, data ) => {
				if ( data == '' || err ) {
					userdata = 'EMPTY'
				};
				res.send( userdata );

				if ( pin !== 'LOCAL' ) {
					fs.unlink( pinPath, ( err ) => {
						console.log( 'ERROR removing %s: %s', pinPath, err );
					} );
				}
			} );
		} catch ( e ) {
			errorHandler( req, res, e );
		}
	} else {
		res.send( 'WRONG' );
	}

	next();
};

var setuserinfo = function( req, res, next ) {
	// TODO
};

var userinfo = function( req, res, next ) {
	// TODO
};

var deletesession = function( req, res, next ) {
	// TODO
};

var quitsession = function( req, res, next ) {
	// TODO
};

var getlist = function( req, res, next ) {
	// TODO
};

// TODO was "delete" in PHP
var deleteboard = function( req, res, next ) {
	// TODO
};

var load = function( req, res, next ) {
	// TODO
};

var errlog = function( req, res, next ) {
	// TODO
};

// Helper function from php.
function get_list_for_user( userid ) {
	// TODO
	// req.uid
}

/**
 * [deleteFolder description]
 * @param  {[type]} req   $path
 * @return {[type]}       [description]
 */
function deleteFolder( path ) {
	// TODO
	return next();
}

function sms( phone, text ) {
	// TODO
	// $data = file_get_contents( 'http://www.smsmatrix.com/matrix?username='.urlencode( 'jbmartinoli@exou.com' )
	//   .
	//   '&password='.urlencode( 'Protect128' )
	//   .
	//   '&phone='.urlencode( $phone )
	//   .
	//   '&callerid='.urlencode( '14185090580' )
	//   .
	//   '&txt='.urlencode( $text )
	// );
}

var server = restify.createServer( {
	name: packagejson.name,
	version: packagejson.version
} );
server.use( restify.acceptParser( server.acceptable ) );
server.use( restify.queryParser() );
server.use( restify.bodyParser() );

/**
 * GET request router
 */
server.get( basepath, function( req, res, next ) {
	res.setHeader( 'content-type', 'text/plain; charset=utf-8' );

	console.log( 'Complete request parameters from : %s', JSON.stringify( req.params ) );

	if ( 'fexists' in req.params ) {
		return fexists( req, res, next );
	}
	if ( 'setdocinfo' in req.params ) {
		return setdocinfo( req, res, next );
	}
} );

/**
 * POST request router
 */
server.post( basepath, function( req, res, next ) {
	res.setHeader( 'content-type', 'text/plain; charset=utf-8' );

	if ( 'preview' in req.params ) {
		preview( req, res, next );
	}

	if ( 'publish' in req.params ) {
		return publish( req, res, next );
	}

	res.setHeader( 'content-type', 'text/plain' );
	res.send( req.params );
} );

/**
 * Emits health information
 */
server.get( '/health', function( req, res, next ) {
	res.send( {
		uptime: {
			time: Math.floor( os.uptime() / 60 / 60 ),
			units: "hours"
		},
		mem: {
			free: Math.floor( os.freemem() / 1024 / 1024 ),
			total: Math.floor( os.totalmem() / 1024 / 1024 ),
			units: "mb"
		},
		loadavg: os.loadavg()
	} );
} );

/**
 * Start the server
 */
server.listen( 8080, function() {
	console.log( '%s listening at %s', server.name, server.url );
	console.log( 'Environment: %s', process.env.NODE_ENV );
} );
