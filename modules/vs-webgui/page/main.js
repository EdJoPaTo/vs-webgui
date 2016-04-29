angular.module( 'vs-webgui' )
  .controller( 'mainCtrl', function( $scope, $route, $routeParams, backendService ) {
    $scope.contextlist = [];
    $scope.context = $routeParams.context;

    $scope.orientation = $routeParams.orientation ? true : false;

    backendService.onClose( function( reason ) {
      if ( !$scope.wserror ) {
        $scope.wshint = "Connection closed.";
        $scope.$digest();
      }
      console.warn( reason );
    } );
    backendService.onError( function( error ) {
      $scope.wshint = "";
      $scope.wserror = "Could not connect to Server :(";
      console.error( error );
      $scope.$digest();
    } );

    function onlyUnique( value, index, self ) {
      return self.indexOf( value ) === index;
    }

    backendService.onServiceList( function( services ) {
      console.log( "services", services );
      $scope.contextlist = $scope.contextlist.concat( services ).filter( onlyUnique );
      if ( !$scope.context )
        $scope.context = $scope.contextlist[ 0 ];
      $scope.$apply();
    } );

    $scope.contextallowed = function( contextlist, context ) {
      if ( !context ) return false;
      if ( contextlist.indexOf( context ) < 0 ) return false;
      return true;
    };

    $scope.$watch( 'x', function( newValue, oldValue ) {
      if ( newValue === oldValue ) return;
      if ( !$scope.context ) return;

      backendService.sendHorizontal( $scope.context, newValue );
    } );

    $scope.$watch( 'y', function( newValue, oldValue ) {
      if ( newValue === oldValue ) return;
      if ( !$scope.context ) return;

      backendService.sendVertical( $scope.context, newValue );
    } );

    $scope.$watch( 'closed', function( newValue, oldValue ) {
      if ( newValue === oldValue ) return;
      if ( !$scope.context ) return;

      backendService.sendClosed( $scope.context, newValue );
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

      $scope.y = normalizeValues( -20, 50, event.beta );
      $scope.x = normalizeValues( -40, 40, event.gamma );

      $scope.$apply();
    };
  } );
