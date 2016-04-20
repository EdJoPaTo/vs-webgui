angular.module( 'general' )
  .directive( 'routeTitle', function( $route, PAGETITLE ) {
    return {
      scope: {
        suffix: "="
      },
      link: function( scope, element, attr ) {
        function update() {
          if ( $route.current && $route.current.title && $route.current.title !== PAGETITLE ) {
            if ( scope.suffix ) {
              element.text( $route.current.title + ' - ' + PAGETITLE );
            } else {
              element.text( $route.current.title );
            }
          } else
            element.text( PAGETITLE );
        }

        scope.$on( '$locationChangeSuccess', update );
        update();
      }
    };
  } );
