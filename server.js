const restify = require( 'restify' );
const os = require( 'os' );
const process = require( 'process' );
const path = require( 'path' );
const fs = require( 'fs' );
const assert = require( 'assert' );

const package = require( './package.json' );

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

function ping( req, res ) {
  //TODO
}

/**
 * Check if a folder exists
 * @param  {[type]} req.params.fexists  Folder name
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
var fexists = function ( req, res ) {
  var fexists = path.join('..', '..', req.params.fexists);

  try {
    fs.stat( fexists, function ( err, stats ) {
      if ( err ) {
        console.log( "Cannot find %s: %s", fexists, err );
        res.send( 'NOT_FOUND' );
      } else {
        console.log( 'Found %s', fexists );
        res.send( 'FOUND' );
      }
    } );
  } catch ( e ) {
    console.log( "Error finding directory '%s': %s", fexists, e.message )
  }

}

// POST request
function preview( req, res ) {
  //TODO
}

function setdocinfo( req, res ) {
  //TODO
}

function getdocinfo( req, res ) {
  //TODO
}

// POST
function publish( req, res ) {
  //TODO
}

function setcontroller( req, res ) {
  //TODO
}

function setdevicedata( req, res ) {
  //TODO
}

function createsession( req, res ) {
  //TODO
}

function joinsession( req, res ) {
  //TODO
}

function savegrids( req, res ) {
  //TODO
}

function get_grids( req, res ) {
  //TODO
}

function get_icons( req, res ) {
  //TODO
}

function userpincreate( req, res ) {
  //TODO
}

function userpinadd( req, res ) {
  //TODO
}

function userpinactivate( req, res ) {
  //TODO
}

function addpinactivate( req, res ) {
  //TODO
}

function setuserinfo( req, res ) {
  //TODO
}

function userinfo( req, res ) {
  //TODO
}

function deletesession( req, res ) {
  //TODO
}

function quitsession( req, res ) {
  //TODO
}

function getlist( req, res ) {
  //TODO
}

// TODO was "delete" in PHP
function deleteboard( req, res ) {
  //TODO
}

function load( req, res ) {
  //TODO
}

function errlog( req, res ) {
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

function sms( $phone, $text ) {
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
  name: package.name,
  version: package.version
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
    return fexists( req, res );
  }

  // res.send( req.params );
} );

/**
 * POST request router
 */
server.post( basepath, function ( req, res, next ) {
  res.setHeader( 'content-type', 'text/plain; charset=utf-8' );

  if ( 'preview' in req.params ) {
    return preview( req, res );
  }

  if ( 'publish' in req.params ) {
    return publish( req, res );
  }

  res.setHeader( 'content-type', 'text/plain' );
  res.send( req.params );
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
