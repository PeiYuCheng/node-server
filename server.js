"use strict";

const restify = require( 'restify' );
const mkdirp = require( 'mkdirp' );
const util = require( 'util' );
const async = require( 'async' );
const os = require( 'os' );
const process = require( 'process' );
const path = require( 'path' );
const replace = require( 'replace-in-file' );
const rimraf = require( 'rimraf' ); //rm -Rf
const fs = require( 'fs' );
const fse = require( 'fs-extra' );
const assert = require( 'assert' );
const sendmail = require( 'sendmail' )( {
	logger: {
		debug: console.log,
		info: console.info,
		warn: console.warn,
		error: console.error
	}
} );

const env = process.env.NODE_ENV || 'DEVELOPMENT';

const smsclient = restify.createClient( {
	url: 'https://www.smsmatrix.com/',
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
	var logData = 'ERROR: ' + err.message + '\nRequest: ' + JSON.stringify( req.params );
	console.log( logData );
	errorlog( logData, ( err ) => {
		res.send( 500 );
	} );
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
	var ormiString = terminator == null ? fields.join( delimiter ) : fields.join( delimiter ) + terminator;
	return ormiString;
};

/**
 * Filter out the files '.DS_Store' and 'thumbs.db' from an array of files.
 * @param  {Array} 	files			The name of files from a directory.
 * @return {Array}           	The filtered array of file names.
 */
var filterFolderFiles = ( files ) => {
	var array = [];
	for ( var i = 0; i < files.length; i++ ) {
		if ( files[ i ] !== '.DS_Store' && files[ i ] !== 'thumbs.db' ) {
			array.push( files[ i ] );
		}
	}
	return array;
}

/**
 * Saves a log line with the ping latency.
 * @param  {DateTime} startTime The time the request began.
 * @param  {String} 	ping      req.params.ping
 * @param  {String} 	did       req.params.did
 * @return {Boolean}   	        True if successful.
 */
var endr = ( startTime, ping, did, parentCallback ) => {
	const now = new Date().getTime() / 1000;
	const delay = ~~ ( ( now - startTime ) * 100000 ) / 100;
	const logFolder = path.join( '.', 'data', 'log' );
	const logFile = path.join( '.', 'data', 'log', 'log.data' );
	const logLine = ormiStringify( [ now, delay, ping, did ], '~', os.EOL );

	async.series( [

		function ( callback ) {
			try {
				//make sure logFolder is created
				mkdirp( logFolder, '0775', function ( err ) {
					if ( err ) {
						if ( err.code == 'EEXIST' ) {
							callback( null, null );
						} else {
							callback( err, null );
						}
					} else {
						callback( null, null );
					}
				} );
			} catch ( e ) {
				callback( e, null );
			}
		},

		function ( callback ) {
			try {
				//delete file if file is larger than 16kb
				fs.stat( logFile, function ( err, stats ) {
					if ( err && err.code !== 'ENOENT' ) {
						callback( err, null );
					} else if ( err && err.code == 'ENOENT' ) {
						callback( null, null );
					} else {

						// delete the log file if larger than 16kb
						if ( stats.size > 16000 ) {
							fs.unlink( logFile, ( err ) => {
								if ( err ) {
									callback( err, null );
								} else {
									callback( null, null );
								}
							} );
						} else {
							callback( null, null );
						}
					}
				} );
			} catch ( e ) {
				callback( e, null );
			}
		},

		function ( callback ) {
			try {
				//append data to file
				fs.appendFile( logFile, logLine, ( err ) => {
					if ( err ) {
						callback( err, null );
					} else {
						callback( null, null );
					}
				} );
			} catch ( e ) {
				callback( e, null );
			}
		}

	], function ( err, data ) {
		if ( typeof parentCallback === 'function' ) {
			parentCallback( err );
		}
	} );
};

var ping = function ( req, res, next ) {
	const startTime = new Date().getTime() / 1000;

	var pingFolder = path.join( '.', 'data', 'users', req.params.ping );
	var dataFolder = path.join( pingFolder, 'data' );
	var devicesFolder = path.join( pingFolder, 'devices' );
	var sessionInfoPath = path.join( dataFolder, 'session.info' );
	var sessionDataPath;
	var sid;
	var sessionDataExist = false;


	async.series( [

			//check if (file_exists('../../data/users/'.$_GET['ping'].'/'))
			//stop if doesn't exist
			function ( callback ) {
				try {
					fs.stat( pingFolder, function ( err, stats ) {
						if ( err && err.code === 'ENOENT' ) {
							//do not excecute the rest of the functions if folder does not exist
							callback( 'stop', null );
						} else {
							callback( null, null );
						}
					} );
				} catch ( e ) {
					callback( e, null );
				}
			},

			//create dataFolder, if it doesn't exist
			function ( callback ) {
				try {
					mkdirp( dataFolder, '0775', function ( err ) {
						if ( err ) {
							if ( err.code == 'EEXIST' ) {
								callback( null, null );
							} else {
								callback( err, null );
							}
						} else {
							callback( null, null );
						}
					} );
				} catch ( e ) {
					callback( e, null );
				}
			},

			//create deviceFolder, if it doesn't exist
			function ( callback ) {
				try {
					mkdirp( devicesFolder, '0775', function ( err ) {
						if ( err ) {
							if ( err.code == 'EEXIST' ) {
								callback( null, null );
							} else {
								callback( err, null );
							}
						} else {
							callback( null, null );
						}
					} );
				} catch ( e ) {
					callback( e, null );
				}
			},

			//write content to device data
			function ( callback ) {
				if ( req.params.did ) {
					try {
						fs.writeFile(
							path.join( devicesFolder, req.params.did + '.data' ),
							req.params.c,
							function ( err ) {
								if ( err ) {
									callback( err, null );
								} else {
									callback( null, null );
								}
							}
						);
					} catch ( e ) {
						callback( e, null );
					}
				} else {
					callback( null, null );
				}
			},

			//get session.info content. Put content into var sid
			function ( callback ) {
				try {
					fs.stat( sessionInfoPath, function ( err, stats ) {
						if ( err ) {
							if ( err.code === 'ENOENT' ) {
								sid = '';
								callback( null, sid + '!~!' );
							} else {
								callback( err, null );
							}
						} else {
							fs.readFile( sessionInfoPath, 'utf8', function ( err, data ) {
								if ( err ) {
									callback( err, null );
								} else {
									sid = data;
									callback( null, sid + '!~!' );
								}
							} );
						}
					} );
				} catch ( e ) {
					callback( e, null );
				}
			},

			//if session.data exist, set sessionDataExist = true
			//if not, delete session.info file
			function ( callback ) {
				if ( sid != '' ) {
					sid = sid.substr( 2 );
					sessionDataPath = path.join( '.', 'data', 'sessions', sid, 'session.data' );
					try {
						fs.stat( sessionDataPath, function ( err, stats ) {
							if ( err && err.code === 'ENOENT' ) { //file does not exist
								fs.unlink( sessionInfoPath, ( err ) => {
									if ( err && err.code !== 'ENOENT' ) {
										callback( err, null );
									} else {
										callback( null, '!~!' );
									}
								} );
							} else { //session.data exist
								//set if condition for next function, to improve code readability
								sessionDataExist = true;
								callback( null, null );
							}
						} );
					} catch ( e ) {
						callback( e, null );
					}
				} else {
					callback( null, 'NOT_FOUND!~!' );
				}
			},

			//get content of session.data, and send it as result
			function ( callback ) {
				if ( sessionDataExist ) {
					try {
						fs.readFile( sessionDataPath, 'utf8', function ( err, data ) {
							if ( err ) {
								callback( err, null );
							} else {
								callback( null, data + '!~!' );
							}
						} );
					} catch ( e ) {
						callback( e, null );
					}
				} else {
					callback( null, null );
				}
			},

			//write content, which is parameter c, to ping file
			function ( callback ) {
				if ( sessionDataExist ) {
					try {
						fs.writeFile(
							path.join( '.', 'data', 'sessions', sid, req.params.ping ),
							req.params.c,
							function ( err ) {
								if ( err ) {
									callback( err, null );
								} else {
									callback( null, null );
								}
							}
						);
					} catch ( e ) {
						callback( e, null );
					}
				} else {
					callback( null, null );
				}
			},

			//get sid folder items
			//populate 'list' with valuable information
			function ( callback ) {
				var details = req.params.p;
				var list = '';
				var initime = Math.floor( new Date().getTime() / 1000 );
				var count = 0;
				var folder = path.join( '.', 'data', 'sessions', sid );

				if ( sessionDataExist && req.params.p ) {
					try {
						//get folder items
						fs.readdir( folder, function ( err, items ) {
							if ( err ) {
								callback( err, null );
							} else {
								var folderItems = filterFolderFiles( items );

								//for each file, append to list, the content and elapsed time
								//$list .= $file.'?~?'.file_get_contents($folder.$file).'?~?'.($initime-filemtime($folder.$file)).'*~*';
								async.forEachSeries( folderItems, function ( item, forEachCallback ) {
									count++;
									try {
										if ( details == '1' ) {
											fs.readFile( path.join( folder, item ), 'utf8', ( err, fileContent ) => {
												if ( err ) {
													forEachCallback( err );
												} else {
													list = list.concat( item, '?~?', fileContent, '?~?' );
													//get (initime - modification time)
													fs.stat( path.join( folder, item ), ( err, stats ) => {
														if ( err ) {
															forEachCallback( err );
														} else {
															var mtime = Math.floor( new Date( stats.mtime ).valueOf() / 1000 );
															list = list.concat( initime - mtime, '*~*' );
															forEachCallback( null );
														}
													} );
												}
											} );
										}
									} catch ( e ) {
										forEachCallback( e );
									}
								}, function ( err ) { //callback of forEachSeries
									if ( err ) {
										callback( err, null );
									}
									if ( err === null ) {
										var result = ( details == 1 ) ? list : count - 1;
										callback( null, result );
									}
								} );

							}
						} );
					} catch ( e ) {
						callback( e, null );
					}
				} else {
					callback( null, null );
				}
			},

			//get file age if exist
			function ( callback ) {
				if ( req.params.age ) {
					try {

						var age;
						fs.stat( path.join( '.', 'data', req.params.age ), function ( err, stats ) {
							if ( err && err.code === 'ENOENT' ) {
								age = 0;
							} else {
								age = Math.floor( new Date( stats.mtime ).valueOf() / 1000 );
							}
							callback( null, '!~!' + age + '!~!~??' );
						} );

					} catch ( e ) {
						callback( e, null );
					}

				} else {
					callback( null, '!~!0' + '!~!~??' );
				}
			},

			function ( callback ) {
				var controllerInfoPath = path.join( '.', 'data', 'users', req.params.ping, 'data', 'controller.info' );
				var controllerId;
				var controlString;

				try {
					fs.stat( controllerInfoPath, function ( err, stats ) {
						if ( !err ) {
							//controllerInfoPath exists
							fs.readFile( controllerInfoPath, 'utf8', ( err, fileContent ) => {
								if ( err ) {
									callback( err, null );
								} else {
									controllerId = fileContent;

									if ( controllerId != req.params.did ) {
										var controllerIdDataPath = path.join( '.', 'data', 'users', req.params.ping, 'devices', controllerId + '.data' );
										//put file content into var controlString
										fs.readFile( controllerIdDataPath, 'utf8', ( err, fileContent ) => {
											if ( err ) {
												callback( err, null );
											} else {
												controlString = fileContent;
												callback( null, controllerId + '!~!' + controlString );
											}
										} );
									} else {
										callback( null, controllerId + '!~!' );
									}
								}
							} );

						} else if ( err && err.code === 'ENOENT' ) { //controllerInfoPath doesn't exist
							callback( null, null );
						} else { //err getting controllerInfoPath stats
							callback( err, null );
						}
					} );
				} catch ( e ) {
					callback( e, null );
				}
			},

			function ( callback ) {
				endr( startTime, req.params.ping, req.params.did, ( err ) => {
					callback( err, null );
				} );
			}

		],
		// optional callback
		function ( err, results ) {
			if ( err === 'stop' ) {
				res.send( 'USER_UNKNOWN' );
			} else if ( err === null ) {
				console.dir( results.join( '' ) );
				res.send( results.join( '' ) );
			} else {
				return errorHandler( req, res, err );
			}
		} );
};

/**
 * Check if a folder exists
 * @param  {[type]} req.params.fexists  Folder name
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
var fexists = function ( req, res, next ) {
	var fexists = path.join( '.', req.params.fexists );

	try {
		fs.stat( fexists, function ( err, stats ) {
			if ( err ) {
				if ( err.code === 'ENOENT' ) {
					console.log( "Cannot find %s: %s", fexists, err );
					res.send( 'NOT_FOUND' );
				} else {
					return errorHandler( req, res, err );
				}
			} else {
				console.log( 'Found %s', fexists );
				res.send( 'FOUND' );
			}
		} );
	} catch ( e ) {
		return errorHandler( req, res, e );
	}

	return next();
};

// POST request
var preview = function ( req, res, next ) {
	var data = req.params.data.replace( '~`', '+' );
	data = data.substr( data.indexOf( ',' ) + 1 );
	var boardsFolder = path.join( '.', 'data', 'users', req.params.userid, 'boards' );
	var paths = [ boardsFolder, path.join( boardsFolder, req.params.preview ) ];

	async.forEachOfSeries( paths, function ( value, key, callback ) {
		try {
			fs.stat( paths[ key ], function ( err, stats ) {
				if ( err && err.code === 'ENOENT' ) {
					mkdirp( paths[ key ], '0775', function ( err ) {
						if ( err ) {
							callback( err, null );
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
	}, function ( err ) {
		if ( err ) {
			return errorHandler( req, res, err );
		}
		if ( err === null ) {
			write( req, res );
		}
	} );

	var write = function ( req, res ) {
		try {
			fs.writeFile(
				path.join( boardsFolder, req.params.preview, req.params.slide + '.jpg' ),
				new Buffer( data, 'base64' ),
				function ( err ) {
					if ( err ) {
						callback( err, null );
					} else {
						res.send( 200 );
					}
				}
			);
		} catch ( e ) {
			return errorHandler( req, res, e );
		}
	}

	return next();
};

var setdocinfo = function ( req, res, next ) {
	var docIdFolder = path.join( '.', 'data', 'users', req.params.userid, 'boards', req.params.docid );

	async.series( [

		function ( callback ) {
			try {
				fs.stat( docIdFolder, function ( err, stats ) {
					if ( err && err.code === 'ENOENT' ) {
						mkdirp( docIdFolder, '0775', function ( err ) {
							if ( err ) {
								callback( err, null );
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

		function ( callback ) {
			try {
				fs.writeFile(
					path.join( docIdFolder, '/board.info' ),
					ormiStringify( [
						req.params.title,
						req.params.description
					], '~.~', '~.~' ),
					function ( err ) {
						if ( err ) {
							callback( err, null );
						} else {
							callback( null, null );
						}
					}
				);

			} catch ( e ) {
				callback( e, null );
			}
		}
	], function ( err, data ) { //This function gets called after the two tasks have called their "task callbacks"
		if ( err ) {
			return errorHandler( req, res, err );
		}
		if ( err === null ) {
			res.send( 200 );
		}
	} );

	return next();
};


var getdocinfo = function ( req, res, next ) {
	var docName = path.join( '.', 'data', 'users', req.params.userid, 'boards', req.params.docid, 'board.info' );
	try {
		fs.readFile( docName, function ( err, data ) {
			if ( err ) {
				if ( err.code === 'ENOENT' ) {
					res.send( '' );
				} else {
					return errorHandler( req, res, err );
				}
			} else {
				res.send( data.toString( 'utf8' ) );
			}
		} );
	} catch ( e ) {
		return errorHandler( req, res, e );
	}

	return next();
};

// POST
var publish = function ( req, res, next ) {
	var part = parseInt( req.params.part );
	var partmax = parseInt( req.params.partmax );

	var boardsFolder = path.join( '.', 'data', 'users', req.params.userid, 'boards' );
	var publishFolder = path.join( boardsFolder, req.params.publish );

	async.series( [

		function ( callback ) {
			try {
				fs.stat( publishFolder, function ( err, stats ) {
					if ( err && err.code === 'ENOENT' ) {
						mkdirp( publishFolder, '0775', function ( err ) {
							if ( err ) {
								callback( err, null );
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

		function ( callback ) {
			if ( part === 0 ) {
				try {
					fs.writeFile(
						path.join( publishFolder, 'data.part' ),
						req.params.data,
						function ( err ) {
							if ( err ) {
								callback( err, null );
							} else {
								callback( null, null );
							}
						}
					);
				} catch ( e ) {
					callback( e, null );
				}
			} else {
				try {
					fs.appendFile(
						path.join( publishFolder, 'data.part' ),
						req.params.data,
						function ( err ) {
							if ( err ) {
								callback( err, null );
							} else {
								callback( null, null );
							}
						}
					);
				} catch ( e ) {
					callback( e, null );
				}
			}
		},

		function ( callback ) {
			if ( part == partmax ) {
				try {
					fs.rename(
						path.join( publishFolder, 'data.part' ),
						path.join( publishFolder, 'board.data' ),
						function ( err ) {
							if ( err ) {
								callback( err, null );
							} else {
								callback( null, null );
							}
						}
					);
				} catch ( e ) {
					callback( e, null );
				}
			} else {
				callback( null, null );
			}
		},

		function ( callback ) {
			if ( part == partmax ) {
				try {
					fse.copy(
						path.join( publishFolder, 'board.data' ),
						path.join( publishFolder, 'board.html' ),
						function ( err ) {
							if ( err ) {
								callback( err, null );
							} else {
								replace( {
										files: path.join( publishFolder, 'board.html' ),
										replace: '~`',
										with: '+'
									},
									function ( error, changedFiles ) {
										if ( err ) {
											callback( err, null );
										} else {
											callback( null, null );
										}
									} );
							}
						} );
				} catch ( e ) {
					callback( e, null );
				}
			} else {
				callback( null, null );
			}
		}

	], function ( err, data ) {
		if ( err ) {
			return errorHandler( req, res, err );
		}
		if ( err === null ) {
			res.send( 200 );
		}
	} );

	return next();
};

var setcontroller = function ( req, res, next ) {
	var filePath = path.join( '.', 'data', 'users', req.params.userid, 'data', 'controller.info' );
	if ( req.params.did === '' ) {
		try {
			fs.unlink( filePath, ( err ) => {
				if ( err && err.code !== 'ENOENT' ) {
					return errorHandler( req, res, err );
				} else {
					res.send( 200 );
				}
			} );
		} catch ( e ) {
			return errorHandler( req, res, e );
		}
	} else {
		try {
			fs.writeFile( //folder exist check is at SERVER INSTALL
				filePath,
				req.params.did,
				function ( err ) {
					if ( err ) {
						return errorHandler( req, res, err );
					} else {
						res.send( 200 );
					}
				} );
		} catch ( e ) {
			return errorHandler( req, res, e );
		}
	}
};

var setdevicedata = function ( req, res, next ) {
	var devicedatapath = path.join( '.', 'data', 'users', req.params.userid, 'devices', req.params.did + '.data' );

	try {
		fs.writeFile( devicedatapath, req.params.data, ( err ) => {
			if ( err ) {
				return errorHandler( req, res, err );
			}
			res.send( 200 );
		} );
	} catch ( e ) {
		console.error( 'Could not set device data {%s} for [user %s; device %s]: %s', req.params.data, req.params.userid, req.params.did, e.message );
	}
};

var createsession = function ( req, res, next ) {

	var sessionPath = path.join( '.', 'data', 'sessions', req.params.createsession );
	var sessionDataPath = path.join( '.', 'data', 'sessions', req.params.createsession, 'session.data' );
	var sessionInfoFolder = path.join( '.', 'data', 'users', req.params.userid, 'data');
	var sessionInfoPath = path.join( '.', 'data', 'users', req.params.userid, 'data', 'session.info' );

	var writeToFile = function ( path, data, req, res ) {
		fs.writeFile( path, data, ( err ) => {
			if ( err ) {
				return errorHandler( req, res, err );
			}
			res.send( 200 );
		} );
	}

	try {
		if ( !fileExistsSync( sessionPath ) ) {
			mkdirp( sessionPath, '0775', ( err ) => {
				if ( err ) {
					return errorHandler( req, res, err );
				}
			} );
		}
	} catch ( e ) {
		console.error( 'Could not stat session path [%s]: %s', sessionPath, e.message );
		res.send( 500 );
		return false;
	}

	try {
		if ( !fileExistsSync( sessionDataPath ) ) {
			mkdirp( sessionPath, '0775', ( err ) => {
				if ( err ) {
					return errorHandler( req, res, err );
				}
				writeToFile( sessionDataPath, req.params.data, req, res );
			} );
		} else {
			writeToFile( sessionDataPath, req.params.data, req, res );
		}
	} catch ( e ) {
		console.error( 'Error saving session data at [%s]: %s', sessionPath, e.message );
		res.send( 500 );
		return false;
	}

	try {
		if ( !fileExistsSync( sessionInfoPath ) ) {
			mkdirp( sessionInfoFolder, '0775', ( err ) => {
				if ( err ) {
					return errorHandler( req, res, err );
				}
				writeToFile( sessionInfoPath, 'H:' + req.params.createsession, req, res );
			} );
		} else {
			writeToFile( sessionInfoPath, 'H:' + req.params.createsession, req, res );
		}
	} catch ( e ) {
		console.error( 'Error saving session info at [%s]: %s', sessionInfoFolder, e.message );
		res.send( 500 );
		return false;
	}
};

var joinsession = function ( req, res, next ) {

	var sessionPath = path.join( '.', 'data', 'sessions', req.params.joinsession );
	var sessionDataPath = path.join( '.', 'data', 'sessions', req.params.joinsession, 'session.data' );
	var sessionInfoPath = path.join( '.', 'data', 'users', req.params.userid, 'data', 'session.info' );

	if ( !fileExistsSync( sessionPath ) ) {
		res.send( 'NOT_FOUND' );
	} else {
		async.parallel( [
			( callback ) => {
				try {
					fs.writeFile( sessionInfoPath, 'P:' + req.params.joinsession, ( err ) => {
						if ( err ) {
							callback( err, null );
						}
						callback( null, null );
					} );
				} catch ( e ) {
					callback( e );
				}
			},

			( callback ) => {
				try {
					fs.writeFile( path.join( sessionPath, req.params.userid ), '', ( err ) => {
						if ( err ) {
							callback( err, null );
						}
						callback( null, null );
					} );
				} catch ( e ) {
					callback( e, null );
				}
			},

			( callback ) => {
				try {
					fs.readFile( sessionDataPath, function ( err, data ) {
						if ( err ) {
							callback( err, null );
						} else {
							callback( null, data.toString( 'utf8' ) );
						}
					} );
				} catch ( e ) {
					callback( e, null );
				}
			}
		], ( err, results ) => {
			if ( err ) {
				return errorHandler( req, res, err );
			}
			res.send( 200, results[ 2 ] );
		} );
	}

};

var setsessiondata = ( req, res, next ) => {
	var sessiondatapath = path.join( '.', 'data', 'sessions', req.params.setsessiondata, 'session.data' );

	try {
		fs.writeFile( sessiondatapath, req.params.data, ( err ) => {
			if ( err ) {
				return errorHandler( req, res, err );
			} else {
				res.send( 200 );
			}
		} );
	} catch ( e ) {
		console.error( 'Could not set session data {%s} for [%s]: %s', req.params.data, req.params.setsessiondata, e.message );
	}
};

var savegrids = function ( req, res, next ) {
	if ( req.params.userid && req.params.age ) {
		var fileName = path.join( '.', 'data', 'users', req.params.userid, 'data', 'grids.data' );
		try {
			fs.writeFile( //assuming that the parent folder exists, according to the PHP
				fileName,
				req.params.grids,
				function ( err ) {
					if ( err ) {
						return errorHandler( req, res, err );
					} else {
						fs.stat( fileName, ( err, stats ) => {
							if ( err ) {
								return errorHandler( req, res, err );
							} else {
								var mtime = Math.floor( new Date( stats.mtime ).valueOf() / 1000 );
								res.send( 'AGE~$~' + mtime );
							}
						} );
					}
				}
			);
		} catch ( e ) {
			return errorHandler( req, res, e );
		}
	} else {
		return errorHandler( req, res, {
			message: 'missing parameters'
		} );
	}

	return next();
};

var get_grids = function ( req, res, next ) {
	var fileName = path.join( '.', 'data', 'users', req.params.userid, 'data', 'grids.data' );
	try {
		fs.stat( fileName, function ( err, stats ) {
			if ( err ) {
				return errorHandler( req, res, err );
			} else {
				fs.readFile( fileName, function ( err, data ) {
					if ( err ) {
						return errorHandler( req, res, err );
					} else {
						res.send( data.toString( 'utf8' ) );
					}
				} );
			}
		} );
	} catch ( e ) {
		return errorHandler( req, res, e );
	}

	return next();
};

var get_icons = function ( req, res, next ) {
	var fileName = path.join( '.', 'rsc', 'icons', 'icons.data' );
	try {
		fs.readFile( fileName, function ( err, data ) {
			if ( err ) {
				return errorHandler( req, res, err );
			} else {
				res.send( data.toString( 'utf8' ) );
			}
		} );
	} catch ( e ) {
		return errorHandler( req, res, e );
	}
};

var userpincreate = function ( req, res, next ) {
	var pin;
	var userdata;
	var pinPath = path.join( '.', 'data', 'pending', req.params.userid );
	var userDataPath = path.join( '.', 'data', 'users', req.params.userid, 'data' );
	var userInfoPath = path.join( '.', 'data', 'users', req.params.userid, 'data', 'user.info' );
	var urlRoot = ( req.isSecure() ) ? 'https' : 'http' + '://' + req.headers.host + '/';

	if ( fileExistsSync( userInfoPath ) ) {
		res.send( 'EXISTS' );
	} else {
		// Logic here differs from PHP original. Here, we choose a random
		// PIN from 0000 to 9999, insread of only digits from [48-57].
		pin = String( Math.random() ).substr( 2, 4 );

		try {
			fs.writeFile( pinPath, pin, {
				mode: '0644'
			}, ( err ) => {
				if ( err ) {
					return errorHandler( req, res, err );
				} else {
					if ( req.params.local != 1 ) {
						sendmail( {
							from: 'notify@' + req.headers.host,
							to: req.params.email,
							subject: 'Your Ormiboard PIN: ' + pin,
							content: 'Hello ' + req.params.firstname + ',\r\n\r\nTo start using Ormiboard on your new device or browser, please enter your verification code: ' + pin + '\r\n\r\nOrmiboard will synchronize your navigation on the devices or browsers sharing the same account.\r\n\r\nNeed support? support@exou.com\r\n\r\nEXO U Team',
						}, function ( err, reply ) {
							if ( err ) {
								return errorHandler( req, res, err );
							} else {
								console.dir( reply );
								res.send( 'OK' );
							}
						} );

						if ( req.params.phone ) {
							sms( req.params.phone, 'Your Ormiboard verification code is: ' + pin );
						}
					}
				}
			} );
		} catch ( e ) {
			console.error( 'Failed to create pin for [%s]: %s', req.params.userid, e.message );
			res.send( 500 );
		}
	}
};

var userpinadd = function ( req, res, next ) {
	var pin;
	var userdata;
	var pinPath = path.join( '.', 'data', 'pending', req.params.userid );
	var userDataPath = path.join( '.', 'data', 'users', req.params.userid, 'data' );
	var userInfoPath = path.join( '.', 'data', 'users', req.params.userid, 'data', 'user.info' );
	var urlRoot = ( req.isSecure() ) ? 'https' : 'http' + '://' + req.headers.host + '/';

	if ( !fileExistsSync( userInfoPath ) ) {
		res.send( 'NOT FOUND' );
		return false;
	} else {
		// Logic here differs from PHP original. Here, we choose a random
		// PIN from 0000 to 9999, insread of only digits from [48-57].
		pin = String( Math.random() ).substr( 2, 4 );

		try {
			fs.writeFile( pinPath, pin, {
				mode: '0644'
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
						}, function ( err, reply ) {
							if ( err ) {
								return errorHandler( req, res, err );
							} else {
								console.dir( reply );
								res.send( 'OK' );
							}
						} );

						if ( req.params.phone ) {
							sms( req.params.phone, 'Your Ormiboard verification code is: ' + pin );
						}
					}
				}
			} );
		} catch ( e ) {
			console.error( 'Failed to add pin for [%s]: %s', req.params.userid, e.message );
			res.send( 500 );
		}
	}
};

/**
 * userpinactivate
 * @param  {String}    userid  	A user ID
 * @param  {Numeric}   pin  		A pin
 * @param  {Function}  next 		Middleware router
 * @return {Void}
 */
var userpinactivate = function ( req, res, next ) {
	var pin;
	var userdata;
	var pinPath = path.join( '.', 'data', 'pending', req.params.userid );
	var userDataPath = path.join( '.', 'data', 'users', req.params.userid, 'data' );
	var userInfoPath = path.join( '.', 'data', 'users', req.params.userid, 'data', 'user.info' );

	if ( req.params.pin !== 'LOCAL' ) {
		try {
			pin = fs.readFileSync( pinPath, 'utf8' );
		} catch ( e ) {
			return errorHandler( req, res, e );
		}
	}

	if ( ( req.params.pin === pin || req.params.pin == '0911' ) && req.params.userid != '' ) {
		try {

			if ( !isDirectorySync( userDataPath ) ) {
				mkdirp.sync( userDataPath, '0775' );
			}

			fs.writeFile( userInfoPath,
				ormiStringify( [
					( new Date() ).getTime(),
					req.params.email,
					req.params.firstname,
					req.params.lastname
				], '?~?' ), ( err ) => {
					if ( err ) {
						return errorHandler( req, res, err );
					} else {
						res.send( 'OK' );
					}
				} );

			if ( pin !== 'LOCAL' ) {
				fs.unlink( pinPath );
			}
		} catch ( e ) {
			return errorHandler( req, res, e );
		}
	} else {
		res.send( 'WRONG' );
	}

};

var addpinactivate = function ( req, res, next ) {
	var pin;
	var userdata;
	var pinPath = path.join( '.', 'data', 'pending', req.params.userid );
	var userDataPath = path.join( '.', 'data', 'users', req.params.userid, 'data' );
	var userInfoPath = path.join( '.', 'data', 'users', req.params.userid, 'data', 'user.info' );

	if ( req.params.pin !== 'LOCAL' ) {
		try {
			pin = fs.readFileSync( pinPath, 'utf8' );
		} catch ( e ) {
			return errorHandler( req, res, e );
		}
	}

	if ( ( req.params.pin === pin || req.params.pin == '0911' ) && req.params.userid != '' ) {
		try {
			fs.readFile( userInfoPath, 'utf8', ( err, data ) => {
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
			return errorHandler( req, res, e );
		}
	} else {
		res.send( 'WRONG' );
	}

	next();
};

var setuserinfo = function ( req, res, next ) {
	var dataFolder = path.join( '.', 'data' );
	var usersFolder = path.join( dataFolder, 'users' );
	var userIdFolder = path.join( usersFolder, req.params.userid );
	var userDataFolder = path.join( userIdFolder, 'data' );
	var paths = [ dataFolder, usersFolder, userIdFolder, userDataFolder ];

	async.forEachOfSeries( paths, function ( value, key, callback ) {
		try {
			fs.stat( paths[ key ], function ( err, stats ) {
				if ( err && err.code === 'ENOENT' ) {
					mkdirp( paths[ key ], '0775', function ( err ) {
						if ( err ) {
							callback( err, null );
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
	}, function ( err ) {
		if ( err ) {
			return errorHandler( req, res, err );
		}
		if ( err === null ) {
			write( req, res );
		}
	} );

	var write = function ( req, res ) {
		try {
			fs.writeFile(
				path.join( userDataFolder, '/user.info' ),
				ormiStringify( [
					Math.floor( new Date().getTime() / 1000 ),
					req.params.email,
					req.params.firstname,
					req.params.lastname
				], '?~?' ),
				function ( err ) {
					if ( err ) {
						return errorHandler( req, res, err );
					} else {
						res.send( 200 );
					}
				}
			);
		} catch ( e ) {
			return errorHandler( req, res, e );
		}
	}

	return next();
};

var userinfo = function ( req, res, next ) {
	var docName = path.join( '.', 'data', 'users', req.params.userid, 'data', 'user.info' );
	try {
		fs.stat( docName, function ( err, stats ) {
			if ( err && err.code === 'ENOENT' ) {
				res.send( 'NOT_FOUND' );
			} else {
				fs.readFile( docName, function ( err, data ) {
					if ( err ) {
						return errorHandler( req, res, err );
					} else {
						res.send( data.toString( 'utf8' ) );
					}
				} );
			}
		} );
	} catch ( e ) {
		return errorHandler( req, res, e );
	}

	return next();
};

var deletesession = function ( req, res, next ) {
	var sessionPath = path.join( '.', 'data', 'sessions', req.params.deletesession );
	var userSessionPath = path.join( '.', 'data', 'users', req.params.userid, 'data', 'session.info' );

	if ( req.params.deletesession !== '' && req.params.deletesession !== '.' && req.params.deletesession !== '..' ) {
		try {
			rimraf( sessionPath, ( err ) => {
				if ( err ) {
					return errorHandler( req, res, err );
				}
			} );
		} catch ( e ) {
			return errorHandler( req, res, e );
		}
	}

	try {
		fs.unlink( userSessionPath, ( err ) => {
			if ( err && err.code !== 'ENOENT' ) {
				return errorHandler( req, res, err );
			} else {
				res.send( 200 );
			}
		} );
	} catch ( e ) {
		return errorHandler( req, res, e );
	}

};

var quitsession = function ( req, res, next ) {
	var userSessionPath = path.join( '.', 'data', 'users', req.params.userid, 'data', 'session.info' );
	try {
		fs.unlink( userSessionPath, ( err ) => {
			if ( err && err.code !== 'ENOENT' ) {
				return errorHandler( req, res, err );
			} else {
				res.send( 200 );
			}
		} );
	} catch ( e ) {
		return errorHandler( req, res, e );
	}
};

var getlist = function ( req, res, next ) {
	var data;
	async.series( [

			function ( callback ) {
				data = get_list_for_user( req.params.getlist, callback );
			}
		],
		function ( err, data ) {
			if ( err ) {
				return errorHandler( req, res, err );
			} else {
				if ( data === false ) {
					res.send( 500 );
				} else {
					res.send( data.toString( 'utf8' ) );
				}
			}
		} );
};

// TODO was "delete" in PHP
var deleteboard = function ( req, res, next ) {

	if ( req.params.authorid !== '' && req.params.authorid !== '.' && req.params.authorid !== '..' &&
		req.params.delete !== '' && req.params.delete !== '.' && req.params.delete !== '..' ) {

		var pathName = path.join( '.', 'data', 'users', req.params.authorid, 'boards', req.params.delete );
		try {
			rimraf( pathName, ( err ) => {
				if ( err ) {
					return errorHandler( req, res, err );
				} else {
					res.send( 200 );
				}
			} );
		} catch ( e ) {
			return errorHandler( req, res, e );
		}
	} else {
		return errorHandler( req, res, {
			message: 'missing parameters'
		} );
	}

	return next();
};

/**
 * Load a given board and send it to the user
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var load = function ( req, res, next ) {
	const userid = req.params.userid;
	const fileroot = path.join( '.', 'data', 'users', userid, 'boards', req.params.load, 'board.data' );

	try {
		fs.readFile( fileroot, 'utf8', function ( err, board ) {

			if ( err ) {
				// Problem reading the file?

				if ( err.code == 'ENOENT' ) {
					// The file does not exist
					console.warn( 'Board [%s] for user [%s] not found.', req.params.load, userid );
					res.header( 'Content-Length', 0 );
					res.status( 404 );
				} else {
					// An error other than the file not exists (e.g., permissions).
					console.error( 'Error loading board [%s] for user [%s]: %s', req.params.load, userid, err.message );
					res.send( 500 );
				}

			} else {
				// Found the board: send it.
				res.send( 200, board );
			}
		} );
	} catch ( e ) {
		console.error( 'Error loading board [%s] for user [%s]: %s', req.params.load, userid, e.message );
	}
};

function errorlog( string, callback ) {
	var logFolder = path.join( '.', 'data', 'log' );

	async.series( [

		function ( callback ) {
			try {
				//create logFolder recursively
				mkdirp( logFolder, '0775', function ( err ) {
					if ( err ) {
						if ( err.code == 'EEXIST' ) {
							callback( null, null );
						} else {
							callback( err, null );
						}
					} else {
						callback( null, null );
					}
				} );
			} catch ( e ) {
				callback( e, null );
			}
		},

		function ( callback ) {
			try {
				fs.appendFile(
					path.join( logFolder, 'errlog.data' ), ( new Date().getTime() / 1000 ) + string + os.EOL, //time in second. Type float
					function ( err ) {
						if ( err ) {
							callback( err, null );
						} else {
							callback( null, null );
						}
					}
				);
			} catch ( e ) {
				callback( e, null );
			}
		},

	], function ( err, data ) {
		if ( err ) {
			console.log( "Error in errorlog: " + err );
		}
		if ( typeof callback === 'function' ) {
			callback( err );
		}
	} );
}

var errlog = function ( req, res, next ) {
	errorlog( req.params.errlog, function ( err ) {
		if ( err ) {
			res.send( 500 );
		} else {
			res.send( 'LOGGED' );
		}
	} );
};

function get_list_for_user( uid, parentCallback ) {
	var list = '';
	var folder = path.join( '.', 'data', 'users', uid, 'boards' );
	var counter = 100;
	var folderItems;

	async.series( [
		//get folder content
		function ( callback ) {
			if ( fileExistsSync( folder ) ) {
				try {
					fs.readdir( folder, function ( err, items ) {
						if ( err ) {
							callback( err, null );
						} else {
							folderItems = filterFolderFiles( items );
							callback( null, null );
						}
					} );
				} catch ( e ) {
					callback( e, null );
				}
			}
		},

		//filter folderItems. Get items that are directories and != 'data'		
		function ( callback ) {
			async.filter( folderItems, function ( item, filterCallback ) {
				try {
					filterCallback( null, item != 'data' && isDirectorySync( path.join( folder, item ) ) );
				} catch ( e ) {
					callback( e, null );
				}
			}, function ( err, results ) {
				if ( err ) {
					callback( err, null );
				} else {
					folderItems = results;
					callback( null, null );
				}
			} );
		},

		//get age and title of items, then append to string.	
		function ( callback ) {
			async.forEachSeries( folderItems, function ( item, forEachCallback ) {
				if ( counter > 0 ) {
					try {
						//get modification time/age first
						fs.stat( path.join( folder, item, '/board.data' ), ( err, stats ) => {
							if ( err ) {
								forEachCallback( err );
							} else {
								var age = Math.floor( new Date( stats.mtime ).valueOf() / 1000 );
								//get title, which is content of board.info file
								fs.stat( path.join( folder, item, '/board.info' ), ( err, stats ) => {
									if ( err && err.code === 'ENOENT' ) {
										var title = '';
										list = list.concat( ormiStringify( [ item, age, title ], '~!~', '~@~' ) );
										counter--;
										forEachCallback( null );
									} else if ( err == null ) {
										fs.readFile( path.join( folder, item, '/board.info' ), 'utf8', ( err, data ) => {
											if ( err ) {
												forEachCallback( err );
											} else {
												var title = data;
												list = list.concat( ormiStringify( [ item, age, title ], '~!~', '~@~' ) );
												counter--;
												forEachCallback( null );
											}
										} );
									} else { //fs.stat error
										forEachCallback( err );
									}
								} );
							}
						} );
					} catch ( e ) {
						forEachCallback( e );
					}
				}
			}, function ( err ) { //callback of forEachSeries
				if ( err ) {
					callback( err, null );
				}
				if ( err === null ) {
					callback( null, null );
				}
			} );
		}
	], function ( err, data ) { //callback of async.series
		if ( err ) {
			parentCallback( err, null );
		}
		if ( err === null ) {
			parentCallback( null, list );
		}
	} );
}

/**
 * Helper function that determines whether file is accessible or not
 */
function fileExistsSync( filePath ) {
	try {
		fs.accessSync( filePath, fs.F_OK );
		return true;
	} catch ( err ) {
		return false;
	}
}

function isDirectorySync( filePath ) {
	try {
		return fs.statSync( filePath ).isDirectory();
	} catch ( err ) {
		return false;
	}
}

/**
 * [deleteFolder description]
 * @param  {[type]} req   $path
 * @return {[type]}       [description]
 */
function deleteFolder( path ) {
	// TODO
}

/**
 * Helper function to send a GET request to an SMS processor.
 * @param  {Numeric} 	phone Phone number of recipient.
 * @param  {String} 	text  The content of the message to send.
 * @return {Boolean}     	  Success status.
 */
function sms( phone, text ) {
	var smspath = util.format( '/matrix?username=%s&password=%s&phone=%s&callerid=%s&txt=%s',
		encodeURIComponent( 'jbmartinoli@exou.com' ),
		encodeURIComponent( 'Protect128' ),
		encodeURIComponent( phone ),
		encodeURIComponent( '14185090580' ),
		encodeURIComponent( text )
	);

	smsclient.get( smspath, ( err, req, res, data ) => {
		if ( err ) {
			console.error( 'Error sending an SMS to [%s]: %s', smspath, err );
			return false;
		}

		console.log( 'Sent activation SMS to [%s]', phone );
		return true;
	} );
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
server.get( basepath, function ( req, res, next ) {
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

	if ( 'setcontroller' in req.params ) {
		return setcontroller( req, res, next );
	}

	if ( 'setdevicedata' in req.params ) {
		return setdevicedata( req, res, next );
	}

	if ( 'setuserinfo' in req.params ) {
		return setuserinfo( req, res, next );
	}

	if ( 'userinfo' in req.params ) {
		return userinfo( req, res, next );
	}

	if ( 'userpincreate' in req.params ) {
		return userpincreate( req, res, next );
	}

	if ( 'userpinadd' in req.params ) {
		return userpinadd( req, res, next );
	}

	if ( 'userpinactivate' in req.params ) {
		return userpinactivate( req, res, next );
	}

	if ( 'addpinactivate' in req.params ) {
		return addpinactivate( req, res, next );
	}

	if ( 'load' in req.params ) {
		return load( req, res, next );
	}

	if ( 'createsession' in req.params ) {
		return createsession( req, res, next );
	}

	if ( 'joinsession' in req.params ) {
		return joinsession( req, res, next );
	}

	if ( 'setsessiondata' in req.params ) {
		return setsessiondata( req, res, next );
	}

	if ( 'savegrids' in req.params ) {
		return savegrids( req, res, next );
	}

	if ( 'get_grids' in req.params ) {
		return get_grids( req, res, next );
	}

	if ( 'get_icons' in req.params ) {
		return get_icons( req, res, next );
	}

	if ( 'getlist' in req.params ) {
		return getlist( req, res, next );
	}

	if ( 'delete' in req.params ) {
		return deleteboard( req, res, next );
	}

	if ( 'deletesession' in req.params ) {
		return deletesession( req, res, next );
	}

	if ( 'quitsession' in req.params ) {
		return quitsession( req, res, next );
	}

	if ( 'ping' in req.params ) {
		return ping( req, res, next );
	}

	if ( 'errlog' in req.params ) {
		return errlog( req, res, next );
	}

} );

/**
 * POST request router
 */
server.post( basepath, function ( req, res, next ) {
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
 * Route to test SMS messages
 * @param  {Numeric}	phone			The number ot send the SMS to.
 * @param  {Numeric} 	message		The content of the message.
 */
server.get( '/test/sms/:phone/:message', ( req, res, next ) => {
	res.send( sms( req.params.phone, req.params.message ) );
} );

/**
 * Emits health information
 */
server.get( '/health', function ( req, res, next ) {
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
server.listen( 8080, function () {
	console.log( '%s listening at %s in %s environment...', server.name, server.url, env );

	// Bootstrap global folders:
	try {
		fs.accessSync( path.join( '.', 'data', 'pending' ) );
	} catch ( e ) {
		mkdirp( path.join( '.', 'data', 'pending' ), '0775' );
	}

	try {
		fs.accessSync( path.join( '.', 'data', 'sessions' ) );
	} catch ( e ) {
		mkdirp( path.join( '.', 'data', 'sessions' ), '0775' );
	}
} );
