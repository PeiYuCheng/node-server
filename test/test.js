/**
 * To use this test, set the constant testPort to the port that the server to be tested is listening to.
 * Similarly, set the constant testHost.
 *
 * This test uses the logic of the supertest npm module.
 **/

"use strict";

const assert = require( 'assert' );
const chai = require( 'chai' );
const supertest = require( 'supertest' );
const util = require( 'util' );
const async = require( 'async' );
const mkdirp = require( 'mkdirp' );
const fs = require( 'fs' );
const os = require( 'os' );
const process = require( 'process' );
const path = require( 'path' );
const randomwords = require( "random-words" ); //to be changed to node js md5 crypto to avoid userid collision
const rimraf = require( 'rimraf' ); //rm -Rf

/**
 * The port to listen to, provided by the TEST_PORT environment variable.
 * @type {Numeric}
 */
const testPort = process.env.TEST_PORT || 8080;
const testHost = process.env.TEST_HOST || 'http://localhost';
const testUrl = `${testHost}:${testPort}`
const server = supertest.agent( testUrl );
const basePath = '/bin/shared/query.php'; //for supertest

console.log( "testUrl is: " + testUrl );

describe( "test function [fexists]", function () {
	var testFolderPath = path.join( 'test', 'data', randomwords() );

	before( function ( done ) {
		mkdirp( testFolderPath, '0775', function ( err ) {
			if ( err ) {
				done( JSON.stringify( err ) );
			} else {
				done();
			}
		} );
	} );

	after( function ( done ) {
		rimraf( testFolderPath, ( err ) => {
			if ( err ) {
				done( JSON.stringify( err ) );
			} else {
				done();
			}
		} );
	} );

	it( "check for a folder that exists: returns status 200 and FOUND", function ( done ) {
		server
			.get( basePath )
			.query( {
				fexists: testFolderPath
			} )
			.expect( 200, 'FOUND', done );
	} );

	it( "check for a folder that doesn't exist: returns status 200 and NOT_FOUND", function ( done ) {
		server
			.get( basePath )
			.query( 'fexists=unexistingFolder' )
			.expect( 200, 'NOT_FOUND', done );
	} );
} );

describe( "test functions [setdocinfo] and [getdocinfo]", function () {
	var userid = randomwords();

	after( function ( done ) {
		var testFolderPath = path.join( '.', 'data', 'users', userid );
		rimraf( testFolderPath, ( err ) => {
			if ( err ) {
				done( JSON.stringify( err ) );
			} else {
				done();
			}
		} );
	} );

	it( "write content to a new board.info, in an unexisting folder, returns status 200", function ( done ) {
		console.log( "setdocinfo userid=" + userid );
		server
			.get( basePath )
			.query( {
				setdocinfo: true,
				userid: userid,
				docid: 'setdocinfo_docid',
				title: 'setdocinfoTitle',
				description: 'someDescription'
			} )
			.expect( 200, done );
	} );

	it( "change content of an existing board.info, returns status 200", function ( done ) {
		server
			.get( basePath )
			.query( {
				setdocinfo: true,
				userid: userid,
				docid: 'docid1',
				title: 'setdocinfoTitle',
				description: 'existingfolder'
			} )
			.expect( 200, done );
	} );

	it( "get content of an existing board.info, returns status 200", function ( done ) {
		server
			.get( basePath )
			.query( {
				getdocinfo: true,
				userid: userid,
				docid: 'docid1'
			} )
			.expect( 200, 'setdocinfoTitle~.~existingfolder~.~', done )
	} );

	it( "get content of an unexisting board.info, should return status 500", function ( done ) {
		server
			.get( basePath )
			.query( {
				getdocinfo: true,
				userid: userid,
				docid: 'unexistingDocId'
			} )
			.expect( 200, '', done )
	} );
} );

describe( "test functions [setuserinfo] and [userinfo]", function () {
	var userid = randomwords();

	after( function ( done ) {
		var testFolderPath = path.join( '.', 'data', 'users', userid );
		rimraf( testFolderPath, ( err ) => {
			if ( err ) {
				done( JSON.stringify( err ) );
			} else {
				done();
			}
		} );
	} );

	it( "setuserinfo of an unexisting user folder, returns status 200", function ( done ) {
		console.log( "setuserinfo userid=" + userid );
		server
			.get( basePath )
			.query( {
				setuserinfo: true,
				userid: userid,
				email: 'setuserinfo email',
				firstname: 'firstname',
				lastname: 'lastname'
			} )
			.expect( 200, done );
	} );

	it( "setuserinfo  of an existing user folder, returns status 200", function ( done ) {
		server
			.get( basePath )
			.query( {
				setuserinfo: true,
				userid: userid,
				email: 'setuserinfo email',
				firstname: 'firstname',
				lastname: 'lastname'
			} )
			.expect( 200, done );
	} );

	//returned data contains timestamp so it is not in the .expect()
	it( "userinfo of an existing user, returns status 200 and userinfo", function ( done ) {
		server
			.get( basePath )
			.query( {
				userinfo: true,
				userid: userid,
			} )
			.expect( 200, done )
	} );

	it( "userinfo of an non-existing user, returns status 200 and NOT_FOUND", function ( done ) {
		server
			.get( basePath )
			.query( {
				userinfo: true,
				userid: randomwords(),
			} )
			.expect( 200, 'NOT_FOUND', done )
	} );
} );

describe( "test through [createsession], [joinsession], [setsessiondata], [quitsession], [deletesession].", function () {
	var createdSession = randomwords();
	var userid = randomwords();
	var data = 'data for createsession';

	//this BEFORE is for PHP testing where the existence of the user folder is not checked.
	before( function ( done ) {
		var sessionInfoFolder = path.join( '.', 'data', 'users', userid, 'data' );
		mkdirp( sessionInfoFolder, '0775', ( err ) => {
			if ( err ) {
				done( err );
			} else {
				done();
			}
		} );
	} );

	after( function ( done ) {
		var testSessionFolderPath = path.join( '.', 'data', 'sessions', createdSession );
		rimraf( testSessionFolderPath, ( err ) => {
			if ( err ) {
				done( JSON.stringify( err ) );
			} else {

				var testUserFolderPath = path.join( '.', 'data', 'users', userid );
				rimraf( testUserFolderPath, ( err ) => {
					if ( err ) {
						done( JSON.stringify( err ) );
					} else {
						done();
					}
				} );
			}
		} );
	} );

	it( "create a session. With a user without session.info file", function ( done ) {
		console.log( "createdSession=" + createdSession + "; userid=" + userid );
		server
			.get( basePath )
			.query( {
				createsession: createdSession,
				userid: userid,
				data: 'data for createsession'
			} )
			.expect( 200, done );
	} );

	it( "create a session. With an existing user", function ( done ) {
		server
			.get( basePath )
			.query( {
				createsession: createdSession,
				userid: userid,
				data: data
			} )
			.expect( 200, done );
	} );

	it( "join an existing session.", function ( done ) {
		server
			.get( basePath )
			.query( {
				joinsession: createdSession,
				userid: userid
			} )
			.expect( 200, data, done );
	} );

	it( "join an unexisting session. Returns 200 and NOT_FOUND", function ( done ) {
		server
			.get( basePath )
			.query( {
				joinsession: 'an unexisting session',
				userid: userid
			} )
			.expect( 200, 'NOT_FOUND', done );
	} );

	it( "setsessiondata of an existing session. Returns 200", function ( done ) {
		server
			.get( basePath )
			.query( {
				setsessiondata: createdSession,
				data: data
			} )
			.expect( 200, done );
	} );

	it( "setsessiondata of an non existing session. Returns 500", function ( done ) {
		server
			.get( basePath )
			.query( {
				setsessiondata: 'an unexisting session',
				data: data
			} )
			.expect( 500, done );
	} );

	it( "quitsession from a user in a session. Returns 200", function ( done ) {
		server
			.get( basePath )
			.query( {
				quitsession: true,
				userid: userid
			} )
			.expect( 200, done );
	} );

	it( "quitsession from a non existing user or session. Returns 200", function ( done ) {
		server
			.get( basePath )
			.query( {
				quitsession: true,
				userid: randomwords()
			} )
			.expect( 200, done );
	} );

	it( "deletesession from an existing session. Returns 200", function ( done ) {
		server
			.get( basePath )
			.query( {
				deletesession: createdSession,
				userid: userid
			} )
			.expect( 200, done );
	} );

	it( "deletesession from a non existing session. Returns 200", function ( done ) {
		server
			.get( basePath )
			.query( {
				deletesession: randomwords(),
				userid: randomwords()
			} )
			.expect( 200, done );
	} );

	it( "deletesession with illigal deletesession parameter. Returns 200", function ( done ) {
		server
			.get( basePath )
			.query( {
				deletesession: '.',
				userid: userid
			} )
			.expect( 200, done );
	} );

} );

//POST preview, setdocinfo, getdocinfo, POST publish, load, getlist, deleteboard
//note: the tests for POST requests on PHP server doesn't behave as intended. 
//			However, the same tests for NodeJS server works properly.
describe( "test through [preview], [setdocinfo], [getdocinfo], [publish], [load], [getlist], [deleteboard].", function () {
	var userid = randomwords();
	var previewFolder = randomwords();

	after( function ( done ) {
		var testUserFolderPath = path.join( '.', 'data', 'users', userid );
		rimraf( testUserFolderPath, ( err ) => {
			if ( err ) {
				done( JSON.stringify( err ) );
			} else {
				done();
			}
		} );
	} );

	//preview puts base64 data into a .jpg file
	it( "preview POST request to write base64 img data to a file. Returns 200", function ( done ) {
		console.log( "preview userid is: " + userid + "; previewFolder is: " + previewFolder );
		server
			.post( basePath )
			.send( {
				userid: userid,
				preview: previewFolder,
				slide: 'previewSlide',
				data: 'data:image/gif;base64,R0lGODlhDwAPAKECAAAAzMzM/////wAAACwAAAAADwAPAAACIISPeQHsrZ5ModrLlN48CXF8m2iQ3YmmKqVlRtW4MLwWACH+H09wdGltaXplZCBieSBVbGVhZCBTbWFydFNhdmVyIQAAOw=='
			} )
			.expect( 200 )
			.end( function ( err, res ) {
				if ( err ) {
					return done( err );
				} else {
					//console.log(res.text); 
					done();
				}
			} );
	} );

	it( "setdocinfo of user's board. Returns 200", function ( done ) {
		server
			.get( basePath )
			.query( {
				setdocinfo: true,
				userid: userid,
				docid: previewFolder,
				title: 'docinfo\'s title',
				description: 'description of docinfo'
			} )
			.expect( 200, done );
	} );

	it( "getdocinfo of existing user's board. Returns data and 200", function ( done ) {
		server
			.get( basePath )
			.query( {
				getdocinfo: true,
				userid: userid,
				docid: previewFolder
			} )
			.expect( 200, 'docinfo\'s title~.~description of docinfo~.~', done );
	} );

	it( "getdocinfo of unexisting user's board. Returns '' and 200", function ( done ) {
		server
			.get( basePath )
			.query( {
				getdocinfo: true,
				userid: randomwords(),
				docid: randomwords()
			} )
			.expect( 200, '', done );
	} );

	it( "publish POST request params.part = 0 and partmax = part. Returns 200", function ( done ) {
		server
			.post( basePath )
			.send( {
				userid: userid,
				publish: previewFolder,
				part: 0,
				partmax: 0,
				data: 'params.part = 0 ~` partmax = part'
			} )
			.expect( 200, done );
	} );

	it( "publish POST request params.part = 0 but partmax != part. Returns 200", function ( done ) {
		server
			.post( basePath )
			.send( {
				userid: userid,
				publish: previewFolder,
				part: 0,
				partmax: 999,
				data: 'params.part = 0 ~` partmax != part'
			} )
			.expect( 200, done );
	} );

	it( "publish POST request params.part != 0 nor partmax != part. Returns 200", function ( done ) {
		server
			.post( basePath )
			.send( {
				userid: userid,
				publish: previewFolder,
				part: 999,
				partmax: 1,
				data: 'params.part != 0  ~` partmax != part'
			} )
			.expect( 200, done );
	} );

	it( "publish POST request params.part != 0 but partmax = part. Returns 200", function ( done ) {
		server
			.post( basePath )
			.send( {
				userid: userid,
				publish: previewFolder,
				part: 999,
				partmax: '999',
				data: 'params.part != 0  ~` partmax = part'
			} )
			.expect( 200, done );
	} );

	it( "load an existing user board data. Returns data and 200", function ( done ) {
		server
			.get( basePath )
			.query( {
				userid: userid,
				load: previewFolder
			} )
			.expect( 200 )
			.expect( 'params.part = 0 ~` partmax != partparams.part != 0  ~` partmax != partparams.part != 0  ~` partmax = part' )
			.expect( 'Content-Length', '105', done );
	} );

	it( "load an unexisting user board data. Returns 404 and Content-Length:0", function ( done ) {
		server
			.get( basePath )
			.query( {
				userid: randomwords(),
				load: previewFolder
			} )
			.expect( 404 )
			.expect( 'Content-Length', '0', done );
	} );

	it( "getlist of existing user. Returns list and 200", function ( done ) {
		server
			.get( basePath )
			.query( {
				getlist: userid,
			} )
			.expect( 200 )
			.end( function ( err, res ) {
				if ( err ) {
					return done( err );
				} else {
					console.log( 'getlist data is: ' + res.text );
					done();
				}
			} );
	} );

	it( "getlist of unexisting user. Returns 200", function ( done ) {
		server
			.get( basePath )
			.query( {
				getlist: 'unexisting user' + randomwords(),
			} )
			.expect( 200, done );
	} );

	it( "deleteboard of existing user. Returns 200", function ( done ) {
		server
			.get( basePath )
			.query( {
				authorid: userid,
				delete: previewFolder
			} )
			.expect( 200, done );
	} );

	it( "deleteboard from a non existing authorid. Returns 200", function ( done ) {
		server
			.get( basePath )
			.query( {
				authorid: randomwords(),
				delete: randomwords()
			} )
			.expect( 200, done );
	} );

	it( "deleteboard with illigal deletesession parameter. Returns 500 for nodejs; 200 for PHP", function ( done ) {
		server
			.get( basePath )
			.query( {
				authorid: '.',
				delete: '..'
			} )
			.expect( 500, done );
	} );
} );

// need Mail Exchanger configured to send the email.
describe( "Need Mail Exchanger configured for [userpinadd]. [addpinactivate].", function () {
	var userid = randomwords();
	var testFolderPath = path.join( '.', 'data', 'users', userid, 'data' );
	var email = 'user email';
	var phone = 'user phone';

	before( function ( done ) {
		console.log( "userpinadd userid is: " + userid );

		mkdirp( testFolderPath, '0775', ( err ) => {
			if ( err ) {
				return done( err );
			} else {

				fs.writeFile(
					path.join( testFolderPath, 'user.info' ),
					'LOCAL',
					function ( err ) {
						err ? done( err ) : done();
					}
				);
			}
		} );
	} );

	after( function ( done ) {
		var testUserFolder = path.join( '.', 'data', 'users', userid );

		rimraf( testUserFolder, ( err ) => {
			if ( err ) {
				return done( JSON.stringify( err ) );
			}
			done();
		} );
	} );

	it.skip( "userpinadd of a non-local user. Returns 200 and OK", function ( done ) {
		server
			.get( basePath )
			.query( {
				userpinadd: true,
				userid: userid,
				email: email,
				local: 0,
				phone: phone
			} )
			.expect( 200, 'OK', done );
	} );

	//works without MX. Creates the pending pin file for next test
	it( "userpinadd of a local user. Returns 200 and OK", function ( done ) {
		server
			.get( basePath )
			.query( {
				userpinadd: true,
				userid: userid,
				email: email,
				local: 1,
				phone: phone
			} )
			.expect( 200, 'OK', done );
	} );

	it( "userpinadd of a non-existing user. Returns 200 and NOT_FOUND", function ( done ) {
		server
			.get( basePath )
			.query( {
				userpinadd: true,
				userid: randomwords(),
				email: email,
				local: 1,
				phone: phone
			} )
			.expect( 200, 'NOT_FOUND', done );
	} );

	it( "addpinactivate of a local user or the pin is wrong. Returns 200 and WRONG", function ( done ) {
		server
			.get( basePath )
			.query( {
				addpinactivate: true,
				userid: userid,
				pin: 0
			} )
			.expect( 200, 'WRONG', done );
	} );

	it( "addpinactivate of a non-local user, the pin is right and the pin in file=LOCAL. \n Returns 200 and user info", function ( done ) {
		server
			.get( basePath )
			.query( {
				addpinactivate: true,
				userid: userid,
				pin: '0911'
			} )
			.expect( 200, 'LOCAL', done );
	} );
} );

// need Mail Exchanger configured to send the email.
describe( "Need Mail Exchanger configured for [userpincreate]. [userpinactivate].", function () {
	var existingUserid = randomwords();
	var existingFolderPath = path.join( '.', 'data', 'users', existingUserid, 'data' );
	var userid = randomwords();
	var email = 'user email';
	var phone = 'user phone';

	before( function ( done ) {
		console.log( "existingUserid is: " + existingUserid );
		console.log( "userpinadd userid is: " + userid );

		mkdirp( existingFolderPath, '0775', ( err ) => {
			if ( err ) {
				return done( err );
			} else {

				fs.writeFile(
					path.join( existingFolderPath, 'user.info' ),
					'LOCAL',
					function ( err ) {
						err ? done( err ) : done();
					}
				);
			}
		} );
	} );

	after( function ( done ) {
		var pendingUserFile = path.join( '.', 'data', 'pending', userid );
		var testUserFolder = path.join( '.', 'data', 'users', userid );
		var ExistingUserFolder = path.join( '.', 'data', 'users', existingUserid );

		rimraf( testUserFolder, ( err ) => {
			if ( err ) {
				return done( JSON.stringify( err ) );
			} else {

				rimraf( ExistingUserFolder, ( err ) => {
					if ( err ) {
						done( JSON.stringify( err ) );
					} else {

						fs.unlink( pendingUserFile, ( err ) => {
							if ( err && err.code !== 'ENOENT' ) {
								return done( JSON.stringify( err ) );
							}
							done();
						} );
					}
				} );
			}
		} );


	} );

	it( "userpincreate of an existing user. Returns 200 and EXISTS.", function ( done ) {
		server
			.get( basePath )
			.query( {
				userpincreate: true,
				userid: existingUserid,
				local: 1,
				firstname: 'userpincreate firstname',
				email: email,
				phone: phone
			} )
			.expect( 200, 'EXISTS', done );
	} );

	it( "userpincreate of an non-existing, LOCAL user. Returns 200 and OK.", function ( done ) {
		server
			.get( basePath )
			.query( {
				userpincreate: true,
				userid: userid,
				local: 1,
				firstname: 'userpincreate firstname',
				email: email,
				phone: phone
			} )
			.expect( 200, 'OK', done );
	} );

	it.skip( "userpincreate of an non-existing, non-LOCAL user. Returns 200 and OK.", function ( done ) {
		server
			.get( basePath )
			.query( {
				userpincreate: true,
				userid: userid,
				local: 0,
				firstname: 'userpincreate firstname',
				email: email,
				phone: phone
			} )
			.expect( 200, 'OK', done );
	} );

	it( "userpinactivate a pin that = LOCAL. Returns 200 and OK.", function ( done ) {
		server
			.get( basePath )
			.query( {
				userpinactivate: true,
				userid: userid,
				pin: 'LOCAL',
				firstname: 'userpinactivate pin=LOCAL firstname',
				email: email,
				phone: phone
			} )
			.expect( 200, 'OK', done );
	} );

	it( "userpinactivate a wrong pin. Returns 200 and WRONG.", function ( done ) {
		server
			.get( basePath )
			.query( {
				userpinactivate: true,
				userid: userid,
				pin: 'A WRONG PIN',
				firstname: 'userpinactivate pin=LOCAL firstname',
				email: email,
				phone: phone
			} )
			.expect( 200, 'WRONG', done );
	} );

	// this test will delete the pending/userid/ folder. so do it last.
	it( "userpinactivate a pin that is right and != LOCAL. Returns 200 and OK.", function ( done ) {
		server
			.get( basePath )
			.query( {
				userpinactivate: true,
				userid: userid,
				pin: '0911',
				firstname: 'userpinactivate pin!=LOCAL firstname',
				email: email,
				phone: phone
			} )
			.expect( 200, 'OK', done );
	} );

} );

describe( '[setdevicedata]', function () {
	var userid = randomwords();
	var deviceDataFolder = path.join( '.', 'data', 'users', userid, 'devices' );

	before( function ( done ) {
		console.log( "setdevicedata userid is: " + userid );

		mkdirp( deviceDataFolder, '0775', ( err ) => {
			if ( err ) {
				return done( err );
			} else {
				done();
			}
		} );
	} );

	var testUserFolder = path.join( '.', 'data', 'users', userid );
	after( function ( done ) {
		rimraf( testUserFolder, ( err ) => {
			if ( err ) {
				return done( JSON.stringify( err ) );
			} else {
				done();
			}
		} );
	} );

	it( "setdevicedata of an existing user. Returns 200.", ( done ) => {
		server
			.get( basePath )
			.query( {
				setdevicedata: true,
				userid: userid,
				did: 'testDid',
				data: 'someData'
			} )
			.expect( 200, done );
	} );

	it( "setdevicedata of an unexisting user. Returns 500.", ( done ) => {
		server
			.get( basePath )
			.query( {
				setdevicedata: true,
				userid: '',
				did: '',
				data: ''
			} )
			.expect( 500, done );
	} );

} );

describe( "[savegrids], [get_grids]", function () {
	var userid = randomwords();
	var gridsFolder = path.join( '.', 'data', 'users', userid, 'data' );

	before( function ( done ) {
		console.log( "savegrids userid is: " + userid );

		mkdirp( gridsFolder, '0775', ( err ) => {
			if ( err ) {
				return done( err );
			} else {
				done();
			}
		} );
	} );

	var testUserFolder = path.join( '.', 'data', 'users', userid );
	after( function ( done ) {
		rimraf( testUserFolder, ( err ) => {
			if ( err ) {
				return done( JSON.stringify( err ) );
			} else {
				done();
			}
		} );
	} );

	it( "savegrids of an existing user, returns 200.", ( done ) => {
		server
			.get( basePath )
			.query( {
				savegrids: true,
				userid: userid,
				age: 'anyage',
				grids: 'grid file content'
			} )
			.expect( 200 )
			.end( function ( err, res ) {
				if ( err ) {
					return done( err );
				} else {
					console.log( 'savegrids returned data is: ' + res.text );
					done();
				}
			} );
	} );

	it( "savegrids of an unexisting user, returns 500.", ( done ) => {
		server
			.get( basePath )
			.query( {
				savegrids: true,
				userid: '',
				age: '',
				grids: 'grid file content'
			} )
			.expect( 500, done );
	} );

	it( "get_grids of an existing grids.data file, returns 200 and file content", ( done ) => {
		server
			.get( basePath )
			.query( {
				get_grids: true,
				userid: userid,
			} )
			.expect( 200, 'grid file content', done );
	} );

	it( "get_grids of an unexisting grids.data file, returns 500", ( done ) => {
		server
			.get( basePath )
			.query( {
				get_grids: true,
				userid: randomwords()
			} )
			.expect( 500, done );
	} );
} );

describe( "[get_icons]", ( done ) => {
	var iconsDataFolder = path.join( '.', 'rsc', 'icons' );
	var iconsDataFile = path.join( '.', 'rsc', 'icons', 'icons.data' );

	before( function ( done ) {
		fs.stat( iconsDataFolder, ( err, stats ) => {
			if ( err && err.code === 'ENOENT' ) {

				mkdirp( iconsDataFolder, '0775', ( err ) => {
					if ( err ) {
						return done( err );
					} else {

						fs.writeFile(
							iconsDataFile,
							'icons data',
							function ( err ) {
								err ? done( err ) : done();
							}
						);
					}
				} );
			} else {
				done();
			}
		} );
	} );

	it( "get_icons", ( done ) => {
		server
			.get( basePath )
			.query( {
				get_icons: ''
			} )
			.expect( 200 )
			.end( function ( err, res ) {
				if ( err ) {
					return done( err );
				} else {
					//console.log( 'get_icons returned data is: ' + res.text );
					done();
				}
			} );
	} );
} );

describe( "[ping]", function () {
	var userid = randomwords();
	var pingFolder = path.join( '.', 'data', 'users', userid );
	var dataFolder = path.join( pingFolder, 'data' );
	var devicesFolder = path.join( pingFolder, 'devices' );
	var sessionInfoPath = path.join( dataFolder, 'session.info' );
	var contollerInfoPath = path.join( dataFolder, 'controller.info' );
	var controllerIdDataPath = path.join( devicesFolder, 'contollerInfo-mydeviceid.data' );
	var sidFolder = path.join( '.', 'data', 'sessions', 'ssioninfo' );
	var sessionDataPath = path.join( sidFolder, 'session.data' );

	var nonCompleteUser = randomwords();
	var nonCompleteUserFolder = path.join( '.', 'data', 'users', nonCompleteUser );

	/** making the following folder achitecture for a complete user folder:

				 				  data ----- ageFile 
				 				 /    \       
				 			users  sessions
				 		 /     				\
				   userid 			[session.info's content]
		 			/			\ 					 |							
		 		data   devices 		session.data     
		 	  /	  				\
session.info, 		[contoller.info's content].data
controller.info

	 */
	before( function ( done ) {
		console.log( "ping userid is: " + userid );

		//making an uncomplete user folder
		mkdirp( nonCompleteUserFolder, '0775', ( err ) => {
			if ( err ) {
				return done( err );
			}
		} );

		mkdirp( dataFolder, '0775', ( err ) => {
			if ( err ) {
				return done( err );
			} else {

				mkdirp( devicesFolder, '0775', ( err ) => {
					if ( err ) {
						return done( err );
					} else {

						fs.writeFile( sessionInfoPath, 'sessioninfo', ( err ) => {
							if ( err ) {
								return done( err );
							} else {

								fs.writeFile( contollerInfoPath, 'contollerInfo-mydeviceid', ( err ) => {
									if ( err ) {
										return done( err );
									} else {

										fs.writeFile( controllerIdDataPath, 'controllerId data', ( err ) => {
											if ( err ) {
												return done( err );
											} else {

												mkdirp( sidFolder, '0775', ( err ) => {
													if ( err ) {
														return done( err );
													} else {

														fs.writeFile( sessionDataPath, 'sessiondata', ( err ) => {
															if ( err ) {
																return done( err );
															} else {

																fs.writeFile( path.join( '.', 'data', '1yearold' ), '1yearoldcontent', ( err ) => {
																	if ( err ) {
																		return done( err );
																	} else {
																		done();
																	}
																} );
															}
														} );
													}
												} );
											}
										} );
									}
								} );
							}
						} );
					}
				} );
			}
		} );
	} );

	after( function ( done ) {
		rimraf( nonCompleteUserFolder, ( err ) => {
			if ( err ) {
				done( JSON.stringify( err ) );
			}
		} );

		rimraf( sidFolder, ( err ) => {
			if ( err ) {
				done( JSON.stringify( err ) );
			}
		} );

		rimraf( pingFolder, ( err ) => {
			if ( err ) {
				done( JSON.stringify( err ) );
			} else {
				done();
			}
		} );
	} );

	it( "1-ping an non existing user. Return 200 and USER_UNKNOWN", ( done ) => {
		server
			.get( basePath )
			.query( {
				ping: randomwords()
			} )
			.expect( 200, 'USER_UNKNOWN', done );
	} );

	it( "2-ping user with all the files complete, p=1, did=controller.info. Return 200 and data", ( done ) => {
		server
			.get( basePath )
			.query( {
				ping: userid,
				did: 'contollerInfo-mydeviceid',
				c: 'c for contents',
				p: 1,
				age: '1yearold'
			} )
			.expect( 200 )
			.end( function ( err, res ) {
				if ( err ) {
					return done( err );
				} else {
					console.log( 'response of ping test 2: ' + res.text );
					done();
				}
			} );
	} );

	it( "3-ping user with all the files complete, p=1, did!=controller.info. Return 200 and data", ( done ) => {
		server
			.get( basePath )
			.query( {
				ping: userid,
				did: 'some_did',
				c: 'c for contents',
				p: 1,
				age: '1yearold'
			} )
			.expect( 200 )
			.end( function ( err, res ) {
				if ( err ) {
					return done( err );
				} else {
					console.log( 'response of ping test 3: ' + res.text );
					done();
				}
			} );
	} );

	it( "4-ping user with all the files complete, p!=1, did!=controller.info content. Return 200 and data", ( done ) => {
		server
			.get( basePath )
			.query( {
				ping: userid,
				did: 'some_did',
				c: 'c for contents',
				p: 0,
				age: '1yearold'
			} )
			.expect( 200 )
			.end( function ( err, res ) {
				if ( err ) {
					return done( err );
				} else {
					console.log( 'response of ping test 4: ' + res.text );
					done();
				}
			} );
	} );

	it( "5-ping an existing user; no did; session.info file doesn't exist; age file doesn't exist. \nReturn 200 and data with NOT_FOUND!~!, age=0", ( done ) => {
		server
			.get( basePath )
			.query( {
				ping: nonCompleteUser,
				did: '',
				c: 'c for contents',
				p: 1,
				age: '1yearold'
			} )
			.expect( 200 )
			.end( function ( err, res ) {
				if ( err ) {
					return done( err );
				} else {
					console.log( 'response of ping test 5: ' + res.text );
					done();
				}
			} );
	} );
} );
