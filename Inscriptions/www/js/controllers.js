angular.module('inscriptionsApp.controllers', ['inscriptionsApp.services'])
.controller('ProjectsCtrl', function($scope, Project) {
	$scope.projects = [];
	$scope.project = null;
	// Get all the projects
	Project.all().then(function(projects) {
		$scope.projects = projects;
	});
	// Get one project
	Project.getById(2).then(function(project) {
		$scope.project = project;
	});
})
.controller('InscriptionsCtrl', function($scope, Inscription) {
	$scope.inscriptions = [];
	$scope.inscription = null;
	// Get all the project inscriptions
	Inscription.all().then(function(inscriptions) {
		$scope.inscriptions = inscriptions;
	});
	// Get one project inscription 
	Inscription.getById(2).then(function(inscription) {
		$scope.inscription = inscription;
	});
});
