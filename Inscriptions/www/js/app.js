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
    $scope.doSomething = function() {
      setTimeout(function() {
        alert('tappaed');
      }, 100);
    };

    Hammer(window, {prevent_default:true} ).on("swiperight",function(event) { 
        if (navi.getPages().length > 1) {
	        navi.popPage();
	}
    });

    $scope.showProject = function(id, title) {
      $scope.ons.navigator.pushPage('showProject.html', {proj_id: id, proj_title: title});
    };

    $scope.showInscription = function(id) {
      $scope.ons.navigator.pushPage('showInscription.html', {inscription_id: id});
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

