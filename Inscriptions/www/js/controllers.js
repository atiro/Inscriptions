angular.module('inscriptionsApp.controllers', ['ngSanitize', 'inscriptionsApp.services'])
.controller('ProjectsCtrl', function($scope, Projects) {
	$scope.projects = [];
	$scope.project = null;
	// Get all the projects
	Projects.all().then(function(projects) {
		$scope.projects = projects;
	});
	// Get one project
	Projects.getById(2).then(function(project) {
		$scope.project = project;
	});
})
.controller('InscriptionsCtrl', function($scope, Inscriptions) {
	$scope.inscriptions = [];

	var proj_id = navi.getCurrentPage().options.proj_id;

	// Get all the project inscriptions
	Inscriptions.all(proj_id).then(function(inscriptions) {
		$scope.inscriptions = inscriptions;
	});
	// Get one project inscription 
	//Inscriptions.getById(2).then(function(inscription) {
	//	$scope.inscription = inscription;
	//});
})
.controller('InscriptionContentCtrl', function($scope, $sce, $log, InscriptionContent) {
	$scope.inscription_content = [];
	$scope.text = "test";
	$scope.translation = "";
	$scope.commentary = "";
	$scope.bibliography = "";

	var id = navi.getCurrentPage().options.inscription_id;

	// Get all the project inscriptions
	InscriptionContent.getById(id).then(function(inscription_content) {
		$scope.inscription_content = inscription_content;
	});

	$log.log("Parsing inscription content for inscription: " + id);
	$log.log("Inscription content length: : " + $scope.inscription_content.length);

	for(var type in $scope.inscription_content) {
		if(type == 0) {
			$log.log("Inscription: Text");
			$scope.text = $scope.inscription_content[type];
			$scope.text = $scope.text.replace(/<[^>]+>/gm, '')
		} else if(type == 1) {
			$log.log("Inscription: Translation");
			$scope.translation = $scope.inscription_content[type];
		} else if(type == 2) {
			$log.log("Inscription: Commentary");
			$scope.commentary = $scope.inscription_content[type];
		} else if(type == 3) {
			$log.log("Inscription: Bibliography");
			$scope.bibliography = $scope.inscription_content[type];
		} else {
			$log.log("Inscription Type: " + type);
		}
	}
	// Get one project inscription 
	//Inscriptions.getById(2).then(function(inscription) {
	//	$scope.inscription = inscription;
	//});
})
.controller('InscriptionImagesCtrl', function($scope, $log, InscriptionImages) {
	$scope.inscription_images = [];

	var id = navi.getCurrentPage().options.inscription_id;

	$scope.$log = $log;

	// Get all the project inscriptions
	InscriptionImages.getById(id).then(function(inscription_images) {
		$scope.inscription_images = inscription_images;
	});
	// Get one project inscription 
	//Inscriptions.getById(2).then(function(inscription) {
	//	$scope.inscription = inscription;
	//});
});
