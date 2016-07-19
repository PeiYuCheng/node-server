"use strict";

const restify = require( 'restify' );
const mkdirp = require( 'mkdirp' );
const async = require( 'async' );
const os = require( 'os' );
const process = require( 'process' );
const path = require( 'path' );
const fs = require( 'fs' );
const assert = require( 'assert' );
const sendmail = require( 'sendmail' )( {
	logger: {
		debug: console.log,
		info: console.info,
		warn: console.warn,
		error: console.error
	}
} );

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

/**
 * Easily compose Ormiboard data strings like '<field>!~!<field>'.
 * @param  {Array} 	fields			The values of the fields to be stringified.
 * @param  {String} delimiter 	The delimiter to use.
 * @param	 {String} terminator	The optional string terminator.
 * @return {String}           	The resultant serialized data string.
 */
var ormiStringify = ( fields, delimiter, terminator ) => {

	// There is no default delimiter, so one must always be passed.
	if ( !Array.isArray( fields ) || delimiter == null ) {
		return false;
	}

	return fields.join( delimiter ) + terminator;
};

/**
 * Saves a log line with the ping latency.
 * @param  {DateTime} startTime The time the request began.
 * @param  {String} 	ping      req.params.ping
 * @param  {String} 	did       req.params.did
 * @return {Boolean}   	        True if successful.
 */
var endr = ( startTime, ping, did ) => {
	const now = new Date().getTime();
	const delay = now - startTime;
	const logFile = path.join( '..', '..', 'data', 'log', 'log.data' );
	const logLine = ormiStringify( [ now, delay, ping, did ], '~', os.EOL );

	try {
		fs.appendFile( logFile, logLine, ( err ) => {
			if ( err ) {
				throw err;
			}

			// Keep the log file at 16kb
			fs.truncate( logFile, 16000, ( err ) => {
				if ( err ) {
					throw err;
				}

				return true;
			} );
		} );
	} catch ( e ) {
		console.error( 'There was an error saving endr: %s', e.message );
		return false;
	}
};

var ping = function( req, res, next ) {
	const startTime = new Date().getTime();

	// TODO

	// endr( startTime, req.params.ping, req.params.did );
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

	async.series( [
		function( callback ) {
			try {
				fs.stat( boardsFolder, function( err, stats ) {
					if ( err && err.code === 'ENOENT' ) {
						mkdirp( boardsFolder, '0775', function( err ) {
							if ( err ) {
								throw new Error();
							} else {
								callback( null, null );
							}
						} );
					} else {
						callback( null, null );
					}
				} );
			} catch ( e ) {
				callback( e, null );
			}
		},

		function( callback ) {
			try {
				fs.stat( docIdFolder, function( err, stats ) {
					if ( err && err.code === 'ENOENT' ) {
						mkdirp( docIdFolder, '0775', function( err ) {
							if ( err ) {
								throw new Error();
							} else {
								callback( null, null );
							}
						} );
					} else {
						callback( null, null );
					}
				} );
			} catch ( e ) {
				callback( e, null );
			}
		},

		function( callback ) {
			try {
				fs.writeFile(
					path.join( docIdFolder, '/board.info' ),
					ormiStringify( [
						req.params.title,
						req.params.description
					], '~.~', '~.~' ),
					function( err ) {
						if ( err ) {
							throw new Error();
						} else {
							callback( null, null );
						}
					}
				);

			} catch ( e ) {
				callback( e, null );
			}
		}
	], function( err, data ) { //This function gets called after the two tasks have called their "task callbacks"
		if ( err ) {
			console.log( "Error setting doc info. '%s': %s", docIdFolder + '/board.info', err );
			res.send( 500 );
			return next( err );
		}
		if ( err === null ) {
			res.send( 200 );
			return next();
		}
	} );
};


var getdocinfo = function( req, res, next ) {
	var docName = path.join( '..', '..', 'data', 'users', req.params.userid, 'boards', req.params.docid, 'board.info' );
	try {
		fs.readFile( docName, function( err, data ) {
			if ( err ) {
				res.send( 500 );
				console.log( "Error reading file '%s':%s", docName, data );
			} else {
				res.send( data.toString( 'utf8' ) );
			}
		} );
	} catch ( e ) {
		res.send( 500 );
		console.log( "Error geting doc info. '%s': %s", docName, e.message );
	}
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
	var pin;
	var userdata;
	var pinPath = path.join( '..', '..', 'data', 'pending', req.params.userid );
	var userDataPath = path.join( '..', '..', 'data', 'users', req.params.userid, 'data' );
	var userInfoPath = path.join( '..', '..', 'data', 'users', req.params.userid, 'data', 'user.info' );
	var urlRoot = ( req.isSecure() ) ? 'https' : 'http' + '://' + req.headers.host + '/';

	if ( !fs.accessSync( userInfoPath ) ) {
		res.send( 'NOT FOUND' );
		return false;
	} else {
		// Logic here differs from PHP original. Here, we choose a random
		// PIN from 0000 to 9999, insread of only digits from [48-57].
		pin = Math.floor( Math.random() * ( 9999 - 0 ) + 1 );

		fs.writeFile( pinPath, pin, {
			mode: '0755'
		}, ( err ) => {
			if ( err ) {
				return errorHandler( req, res, err );
			} else {
				if ( req.params.local != 1 ) {
					sendmail( {
						from: 'notify@' + req.headers.host,
						to: req.params.email,
						subject: 'Your Ormiboard PIN: ' + pin,
						content: 'Hello,\r\n\r\nTo start using Ormiboard on your new device or browser, please enter your verification code: ' + pin + '\r\n\r\nOrmiboard will synchronize your navigation on the devices or browsers sharing the same account.\r\n\r\nNeed support? support@exou.com\r\n\r\nEXO U Team',
					}, function( err, reply ) {
						console.log( err && err.stack );
						console.dir( reply );
					} );
				}
			}
		} );
	}
};

/**
 * userpinactivate
 * @param  {String}    userid  	A user ID
 * @param  {Numeric}   pin  		A pin
 * @param  {Function}  next 		Middleware router
 * @return {Void}
 */
var userpinactivate = function( req, res, next ) {
	var pin;
	var userdata;
	var pinPath = path.join( '..', '..', 'data', 'pending', req.params.userid );
	var userDataPath = path.join( '..', '..', 'data', 'users', req.params.userid, 'data' );
	var userInfoPath = path.join( '..', '..', 'data', 'users', req.params.userid, 'data', 'user.info' );

	if ( req.params.pin !== 'LOCAL' ) {
		try {
			pin = fs.readFileSync( pinPath );
		} catch ( e ) {
			errorHandler( req, res, e );
		}
	}

	if ( ( req.params.pin === pin || req.params.pin == '0911' ) && req.params.userid != '' ) {
		try {

			if ( !fs.accessSync( userDataPath ) ) {
				mkdirp.sync( userDataPath, '0775' );
			}

			fs.writeFile( userInfoPath,
				ormiStringify( [
					( new Date() ).getTime(),
					req.params.email,
					req.params.firstname,
					req.params.lastname
				], '?~?' ),
				( err ) => {
					if ( err ) {
						errorHandler( req, res, err );
					} else {
						res.send( 'OK' );
					}
				} );

			if ( pin !== 'LOCAL' ) {
				fs.unlink( pinPath );
			}
		} catch ( e ) {
			errorHandler( req, res, e );
		}
	} else {
		res.send( 'WRONG' );
	}

};

var addpinactivate = function( req, res, next ) {
	var pin;
	var userdata;
	var pinPath = path.join( '..', '..', 'data', 'pending', req.params.userid );
	var userDataPath = path.join( '..', '..', 'data', 'users', req.params.userid, 'data' );
	var userInfoPath = path.join( '..', '..', 'data', 'users', req.params.userid, 'data', 'user.info' );

	if ( req.params.pin !== 'LOCAL' ) {
		try {
			pin = fs.readFileSync( pinPath );
		} catch ( e ) {
			errorHandler( req, res, e );
		}
	}

	if ( ( req.params.pin === pin || req.params.pin == '0911' ) && req.params.userid != '' ) {
		try {
			fs.readFile( userInfoPath, ( err, data ) => {
				if ( data == '' || err ) {
					userdata = 'EMPTY';
				}
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
	var dataFolder = path.join( '..', '..', 'data' );
	var usersFolder = path.join( dataFolder, 'users' );
	var userIdFolder = path.join( usersFolder, req.params.userid );
	var userDataFolder = path.join( userIdFolder, 'data' );
	var paths = [ dataFolder, usersFolder, userIdFolder, userDataFolder ];

	var write = function( req, res ) {
		try {
			fs.writeFile(
				path.join( userDataFolder, '/user.info' ),
				ormiStringify( [
					Math.round( new Date().getTime() / 1000 ),
					req.params.email,
					req.params.firstname,
					req.params.lastname
				], '?~?' ),
				function( err ) {
					if ( err ) {
						throw new Error();
					} else {
						res.send( 200 );
						return next();
					}
				}
			);
		} catch ( e ) {
			return errorHandler( req, res, e );
		}
	};

	async.forEachOfSeries( paths, function( value, key, callback ) {
		try {
			fs.stat( paths[ key ], function( err, stats ) {
				if ( err && err.code === 'ENOENT' ) {
					mkdirp( paths[ key ], '0775', function( err ) {
						if ( err ) {
							throw new Error();
						} else {
							callback( null );
						}
					} );
				} else {
					callback( null );
				}
			} );
		} catch ( e ) {
			callback( e );
		}
	}, function( err ) {
		if ( err ) {
			return errorHandler( req, res, err );
		}
		if ( err === null ) {
			write( req, res );
		}
	} );


};

var userinfo = function( req, res, next ) {
	var docName = path.join( '..', '..', 'data', 'users', req.params.userid, 'data', 'user.info' );
	try {
		fs.stat( docName, function( err, stats ) {
			if ( err && err.code === 'ENOENT' ) {
				res.send( 'NOT_FOUND' );
			} else {
				fs.readFile( docName, function( err, data ) {
					if ( err ) {
						throw new Error();
					} else {
						res.send( data.toString( 'utf8' ) );
					}
				} );
			}
		} );
	} catch ( e ) {
		return errorHandler( req, res, e );
	}
	next();
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

	if ( 'getdocinfo' in req.params ) {
		return getdocinfo( req, res, next );
	}

	if ( 'setuserinfo' in req.params ) {
		return setuserinfo( req, res, next );
	}

	if ( 'userinfo' in req.params ) {
		return userinfo( req, res, next );
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

	// Bootstrap global folders:
	try {
		fs.accessSync( path.join( '..', '..', 'data', 'pending' ) );
	} catch ( e ) {
		mkdirp( path.join( '..', '..', 'data', 'pending' ), '0775' );
	}
} );
