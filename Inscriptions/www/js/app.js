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

    $scope.showProject = function(id) {
      $scope.ons.navigator.pushPage('showProject.html', {proj_id: id});
    };

    $scope.showInscription = function(id) {
      $scope.ons.navigator.pushPage('showInscription.html', {inscription_id: id});
    };
  });

})();

