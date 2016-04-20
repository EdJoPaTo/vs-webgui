angular.module( "vs-webgui" )
  .config( function( $routeProvider, PAGETITLE ) {
    $routeProvider
      .when( '/', {
        title: PAGETITLE,
        templateUrl: 'general/page/main.html'
      } )
      .when( '/doit', {
        redirectTo: '/doit/127.0.0.1/3000'
      } )
      .when( '/doit/:host/:port', {
        title: 'Master of Desaster',
        templateUrl: 'vs-webgui/page/main.html',
        controller: 'mainCtrl'
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
