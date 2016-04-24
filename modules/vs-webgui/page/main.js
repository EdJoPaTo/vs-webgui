angular.module( 'vs-webgui' )
  .controller( 'mainCtrl', function( $scope, $route, $routeParams ) {
    $scope.host = $routeParams.host;
    $scope.port = Number( $routeParams.port );

    $scope.contextlist = [];
    $scope.context = $routeParams.context;

    $scope.orientation = $routeParams.orientation ? true : false;

    $scope.connect = function() {
      $route.updateParams( {
        host: $scope.host || "127.0.0.1",
        port: $scope.port || "3000"
      } );
    };

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
    ws.onclose = function( reason ) {
      if ( !$scope.wserror ) {
        $scope.wshint = "Connection closed.";
        $scope.$digest();
      }
      console.warn( reason );
    };
    ws.onmessage = function( message ) {
      try {
        let data = JSON.parse( message.data );
        handleIncomingMessage( data );
      } catch ( e ) {
        console.error( "incoming message is not a JSON string", message.data );
      }
    };
    ws.onerror = function( error ) {
      $scope.wshint = "";
      $scope.wserror = "Could not connect to Server :(";
      console.error( error );
      $scope.$digest();
    };

    function onlyUnique( value, index, self ) {
      return self.indexOf( value ) === index;
    }

    function handleIncomingMessage( data ) {
      console.log( "incoming", data );

      if ( !data.type ) {
        console.error( "incoming message does not contain a type", data );
      }

      switch ( data.type ) {
        case "allServices":
          $scope.contextlist = $scope.contextlist.concat( data.services ).filter( onlyUnique );
          if ( !$scope.context )
            $scope.context = $scope.contextlist[ 0 ];
          break;
        case "request":
        case "moveVerticalToPercent":
        case "moveHorizontalToPercent":
        case "openIT":
        case "closeIT":
          // ignore
          break;
        default:
          console.warn( "unknown message type", data.type, data );
      }
    }

    $scope.$watch( 'x', function( newValue, oldValue ) {
      if ( newValue === oldValue ) return;
      if ( !$scope.context ) return;

      ws.sendObj( {
        type: "moveHorizontalToPercent",
        service: $scope.context,
        percent: newValue
      } );
    } );

    $scope.$watch( 'y', function( newValue, oldValue ) {
      if ( newValue === oldValue ) return;
      if ( !$scope.context ) return;

      ws.sendObj( {
        type: "moveVerticalToPercent",
        service: $scope.context,
        percent: newValue
      } );
    } );

    $scope.$watch( 'closed', function( newValue, oldValue ) {
      if ( newValue === oldValue ) return;
      if ( !$scope.context ) return;

      ws.sendObj( {
        type: newValue ? "closeIT" : "openIT",
        service: $scope.context
      } );
    } );

    $scope.$watch( 'context', function( newValue, oldValue ) {
      if ( newValue === oldValue ) return;

      $route.updateParams( {
        context: $scope.context
      } );
    } );

    $scope.$watch( 'orientation', function( newValue, oldValue ) {
      if ( newValue === oldValue ) return;

      $route.updateParams( {
        orientation: $scope.orientation ? true : null
      } );
    } );

    function normalizeValues( min, max, value, invert ) {
      let tmp = value;
      tmp = tmp > 180 ? tmp - 360 : tmp;
      tmp = invert ? tmp * -1 : tmp;

      tmp = tmp > max ? max : tmp;
      tmp = tmp < min ? min : tmp;
      tmp = ( tmp - min ) / ( max - min ) * 100;
      return Math.round( tmp );
    }

    window.ondeviceorientation = function( event ) {
      if ( !$scope.orientation ) return;

      if ( event.gamma > 30 ) {
        $scope.closed = true;
      } else if ( event.gamma < -30 ) {
        $scope.closed = false;
      }

      $scope.y = normalizeValues( -20, 50, event.beta );
      $scope.x = normalizeValues( -40, 40, event.alpha, true );

      $scope.$apply();
    };
  } );
