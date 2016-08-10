"use strict";

const assert = require( 'assert' );
const chai = require( 'chai' );
const supertest = require( 'supertest' );
const util = require( 'util' );
const async = require( 'async' );
const os = require( 'os' );
const process = require( 'process' );
const path = require( 'path' );
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

describe( "test function [fexists]", function () {
	it( "check for a folder that exists: returns status 200 and FOUND", function ( done ) {
		server
			.get( basePath )
			.query( 'fexists=test' )
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
	var userid = 'unitTestUserId';
	
	after( function (done) {
		var testFolderPath = path.join('.', 'data', 'users', userid);
		rimraf( testFolderPath, ( err ) => {
			if ( err ) {
				done( JSON.stringify( err ) );
			} else {
				done();
			}
		} );
	});

	it( "write content to a new board.info, in an unexisting folder, returns status 200", function ( done ) {
		server
			.get( basePath )
			.query( 
				{setdocinfo: true,
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
			.query(
				{setdocinfo: true,
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
			.query( {getdocinfo:true, userid: userid, docid:'docid1'})
			.expect( 200, 'setdocinfoTitle~.~existingfolder~.~', done )
	} );

	it( "get content of an unexisting board.info, returns status 500", function ( done ) {
		server
			.get( basePath )
			.query( {getdocinfo:true, userid: userid, docid:'unexistingDocId'})
			.expect( 500, done )
	} );
} );
