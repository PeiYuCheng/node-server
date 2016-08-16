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
const os = require( 'os' );
const process = require( 'process' );
const path = require( 'path' );
const randomwords = require( "random-words" ); //to be changed to node js md5 crypto
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
				if ( err.code == 'EEXIST' ) {
					done();
				} else {
					done( err );
				}
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

//userpincreate or userpinadd, userpinactivate, addpinactivate

describe( "test through [createsession], [joinsession], [setsessiondata], [quitsession], [deletesession].", function () {
	var createdSession = randomwords();
	var userid = randomwords();
	var data = 'data for createsession';

	//this BEFORE is for PHP testing where the existence of the user folder is not checked.
	before( function ( done ) {
		var sessionInfoFolder = path.join( '.', 'data', 'users', userid, 'data' );
		mkdirp( sessionInfoFolder, '0775', ( err ) => {
			if ( err && err.code !== 'ENOENT' ) {
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
describe( "test through [preview], [setdocinfo], [getdocinfo], [publish], [load], [getlist], [deleteboard].", function () {
	var userid = randomwords();
	var previewFolder = randomwords();

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
			.expect( 200, done );

		// .end(function(err, res){
		// 	if (err) {
		// 		return done(err);
		// 	} else {
		// 		console.log(res.text); 
		// 		done();
		// 	}
		// });
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
