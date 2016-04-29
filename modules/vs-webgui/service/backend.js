angular.module( 'vs-webgui' )
  .factory( 'backendService', function( $q, $websocket, BACKEND ) {
    var service = {};
    var handlers = {
      allServices: [],
      error: [],
      close: []
    };
    let identifier = 0;
    let ignoretype = [ 'request', 'moveVerticalToPercent', 'moveHorizontalToPercent', 'openIT', 'closeIT' ];

    let addr = BACKEND;
    console.log( "connect to", addr );
    var ws = $websocket( addr );
    ws.sendObj = function( data ) {
      ws.send( JSON.stringify( data ) );
    };

    ws.onMessage( function( message ) {
      let data = JSON.parse( message.data );
      console.log( "incoming", data );

      if ( !data.type ) {
        console.error( "incoming message does not contain a type", data );
      } else if ( ignoretype.indexOf( data.type ) >= 0 ) {
        // ignore
      } else if ( data.type === 'allServices' ) {
        handlers.allServices.forEach( function( element ) {
          element( data.services );
        } );
      } else {
        console.warn( "unhandled message type", data.type, data );
      }
    } );

    function sendPercent( type, service, percent ) {
      ws.sendObj( {
        identifier: identifier,
        type: type,
        service: service,
        percent: percent
      } );
    }

    ws.onOpen( function() {
      console.log( "Socket has been opened!" );
    } );
    ws.onClose( function( reason ) {
      handlers.close.forEach( function( element ) {
        element( reason );
      } );
    } );
    ws.onError( function( error ) {
      handlers.error.forEach( function( element ) {
        element( error );
      } );
    } );

    service.onServiceList = function( callback ) {
      handlers.allServices.push( callback );
    };
    service.onClose = function( callback ) {
      handlers.close.push( callback );
    };
    service.onError = function( callback ) {
      handlers.error.push( callback );
    };

    service.setIdentifier = function( value ) {
      identifier = value;
      ws.sendObj( {
        identifier: identifier,
        type: "request"
      } );
    };

    service.sendHorizontal = function( service, percent ) {
      sendPercent( "moveHorizontalToPercent", service, percent );
    };
    service.sendVertical = function( service, percent ) {
      sendPercent( "moveVerticalToPercent", service, percent );
    };
    service.sendClosed = function( context, closed ) {
      ws.sendObj( {
        identifier: identifier,
        type: closed ? "closeIT" : "openIT",
        service: context
      } );
    };

    return service;
  } );
