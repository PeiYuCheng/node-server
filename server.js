const restify = require( 'restify' );
const os = require( 'os' );
const process = require( 'process' );
const path = require('path');
const assert = require( 'assert' );

/**
 * The port to listen to, provided by the PORT environment variable.
 * @type Numeric
 */
var port = process.env.PORT || 8080;

function ping( req, res ) {
  res.setHeader('content-type', 'text/plain');
  //TODO
}

function fexists( req, res ) {
  res.setHeader('content-type', 'text/plain');
  //TODO
}

// POST request
function preview( req, res ) {
  res.setHeader('content-type', 'text/plain');
  //TODO
}

function setdocinfo( req, res ) {
  res.setHeader('content-type', 'text/plain');
  //TODO
}

function getdocinfo( req, res ) {
  res.setHeader('content-type', 'text/plain');
  //TODO
}

// POST
function publish( req, res ) {
  res.setHeader('content-type', 'text/plain');
  //TODO
}

function setcontroller( req, res ) {
  res.setHeader('content-type', 'text/plain');
  //TODO
}

function setdevicedata( req, res ) {
  res.setHeader('content-type', 'text/plain');
  //TODO
}

function createsession( req, res ) {
  res.setHeader('content-type', 'text/plain');
  //TODO
}

function joinsession( req, res ) {
  res.setHeader('content-type', 'text/plain');
  //TODO
}

function savegrids( req, res ) {
  res.setHeader('content-type', 'text/plain');
  //TODO
}

function get_grids( req, res ) {
  res.setHeader('content-type', 'text/plain');
  //TODO
}

function get_icons( req, res ) {
  res.setHeader('content-type', 'text/plain');
  //TODO
}

function userpincreate( req, res ) {
  res.setHeader('content-type', 'text/plain');
  //TODO
}

function userpinadd( req, res ) {
  res.setHeader('content-type', 'text/plain');
  //TODO
}

function userpinactivate( req, res ) {
  res.setHeader('content-type', 'text/plain');
  //TODO
}

function addpinactivate( req, res ) {
  res.setHeader('content-type', 'text/plain');
  //TODO
}

function setuserinfo( req, res ) {
  res.setHeader('content-type', 'text/plain');
  //TODO
}

function userinfo( req, res ) {
  res.setHeader('content-type', 'text/plain');
  //TODO
}

function deletesession( req, res ) {
  res.setHeader('content-type', 'text/plain');
  //TODO
}

function quitsession( req, res ) {
  res.setHeader('content-type', 'text/plain');
  //TODO
}

function getlist( req, res ) {
  res.setHeader('content-type', 'text/plain');
  //TODO
}

// TODO was "delete" in PHP
function deleteboard( req, res ) {
  res.setHeader('content-type', 'text/plain');
  //TODO
}

function load( req, res ) {
  res.setHeader('content-type', 'text/plain');
  //TODO
}

function errlog( req, res ) {
  res.setHeader('content-type', 'text/plain');
  //TODO
}

/**
 * [get_list_for_user description]
 * @param  {[type]} req $uid
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
function get_list_for_user( req, res ) {
  // req.uid
}

/**
 * [deleteFolder description]
 * @param  {[type]} req   $path
 * @return {[type]}       [description]
 */
function deleteFolder( req, res ) {
  // req.path
}

// function sms( $phone, $text ) {
//   $data = file_get_contents( 'http://www.smsmatrix.com/matrix?username='.urlencode( 'jbmartinoli@exou.com' )
//     .
//     '&password='.urlencode( 'Protect128' )
//     .
//     '&phone='.urlencode( $phone )
//     .
//     '&callerid='.urlencode( '14185090580' )
//     .
//     '&txt='.urlencode( $text )
//   );
// }

var server = restify.createServer( {
  name: 'myapp',
  version: '1.0.0'
} );
server.use( restify.acceptParser( server.acceptable ) );
server.use( restify.queryParser() );
server.use( restify.bodyParser() );

/**
 * Routers
 */

/**
 * Online Availability Monitoring
 */
server.head( '/online', function ( req, res ) {
  res.status( 200 ).end();
} );

/**
 * Emits health information
 */
server.get( '/health', function ( req, res ) {
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
  console.log( '%s listening at %s', server.name, server.url );
  console.log( 'Environment: %s', process.env.NODE_ENV );
} );
