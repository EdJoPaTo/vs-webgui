angular.module( "vs-webgui" )
  .config( function( $routeProvider, PAGETITLE ) {
    $routeProvider
      .when( '/', {
        title: PAGETITLE,
        templateUrl: 'general/page/main.html'
      } )
      .when( '/doit', {
        title: 'Master of Desaster',
        templateUrl: 'vs-webgui/page/main.html',
        controller: 'mainCtrl',
        reloadOnSearch: false
      } )
      .when( '/impressum', {
        title: 'Impressum',
        templateUrl: 'general/page/impressum.html'
      } )
      .when( '/about', {
        title: 'About',
        templateUrl: 'general/page/about.html'
      } )
      .otherwise( {
        redirectTo: '/'
      } );
  } );
