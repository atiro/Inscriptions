(function(){
  'use strict';
  var module = angular.module('inscriptionsApp', ['onsen', 'dcbImgFallback', 'inscriptionsApp.services', 'inscriptionsApp.controllers'])
  		.run(function(DB) {
			DB.init();
		});

  document.addEventListener('deviceready', function() {
  	angular.bootstrap(document, ['inscriptionsApp']);

  }, false);

  module.controller('AppController', function($scope) {

    Hammer(window).on("swiperight",function(event) { 
        if (navi.getPages().length > 1) {
	        navi.popPage();
	}
    });

    $scope.showProject = function(id, title, orgs) {
      $scope.ons.navigator.pushPage('showProject.html', {proj_id: id, proj_title: title, proj_orgs: orgs});
    };

    $scope.showInscription = function(id, title) {
      $scope.ons.navigator.pushPage('showInscription.html', {inscription_id: id, inscription_title: title});
    };

    $scope.showImage = function(url) {
    	var url = url;
    };

    $scope.randProject = function() {
    	// TODO don't hardcode this...
    	return Math.floor((Math.random() * 5))
    };

  });

})();

