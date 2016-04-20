angular.module( 'vs-webgui' )
  .controller( 'mainCtrl', function( $scope, $route, $routeParams ) {
    $scope.host = $routeParams.host;
    $scope.port = Number( $routeParams.port );

    $scope.connect = function() {
      $route.updateParams( {
        host: $scope.host || "127.0.0.1",
        port: $scope.port || "3000"
      } );
    };

    try {
      let addr = "ws://" + $scope.host + ":" + $scope.port + "/";
      console.log( "connect to", addr );
      var ws = new WebSocket( addr );
      ws.sendObj = function( data ) {
        ws.send( JSON.stringify( data ) );
      };
      ws.onopen = function() {
        console.log( "Socket has been opened!" );
        ws.sendObj( {
          type: "request"
        } );
      };
      ws.onmessage = function( message ) {
        try {
          let data = JSON.parse( message.data );
          handleIncomingMessage( data );
        } catch ( e ) {
          console.error( "incoming message is not a JSON string", message.data );
        }
      };
    } catch ( e ) {
      $scope.wserror = "Could not connect to Server :(";
      console.error( e );
    }

    function handleIncomingMessage( data ) {
      console.log( "incoming", data );

      if ( !data.type ) {
        console.error( "incoming message does not contain a type", data );
      }

      switch ( data.type ) {
        case "servers and more cases":
          //TODO: implement
          break;
        case "request":
        case "moveVerticalToPercent":
        case "moveHorizontalToPercent":
          // ignore
          break;
        default:
          console.warn( "unknown message type", data.type, data );
      }
    }

    $scope.$watch( 'x', function( newValue, oldValue ) {
      if ( newValue === oldValue ) return;

      ws.sendObj( {
        type: "moveHorizontalToPercent",
        value: newValue
      } );
    } );

    $scope.$watch( 'y', function( newValue, oldValue ) {
      if ( newValue === oldValue ) return;

      ws.sendObj( {
        type: "moveVerticalToPercent",
        value: newValue
      } );
    } );


  } );
