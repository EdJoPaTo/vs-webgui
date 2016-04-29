angular.module( 'vs-webgui' )
  .controller( 'pickIdentifierCtrl', function( $scope, $route, $location ) {
    $scope.doit = function( identifier ) {
      if ( identifier >= 100000 && identifier <= 999999 ) {
        $location.url( $location.url() + "/" + identifier );
      }
    };
  } );
