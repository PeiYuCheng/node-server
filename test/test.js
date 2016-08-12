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
const testPort = process.env.TEST_PORT || 8888;
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
		server
			.get( basePath )
			.query( {
				setdocinfo: true,
				userid: userid,
				docid: 'docid1',
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

} );
