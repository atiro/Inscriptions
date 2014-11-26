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
.controller('ProjectsTitleCtrl', function($scope) {
	$scope.project_title = navi.getCurrentPage().options.proj_title;
	$scope.project_orgs = navi.getCurrentPage().options.proj_orgs;
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
.controller('InscriptionTitleCtrl', function($scope) {
	$scope.inscription_title = navi.getCurrentPage().options.inscription_title;
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
	        for(var content in inscription_content) {
		  var inscrip = inscription_content[content];
		/*
		  for(var key_c in inscription_content[content]) {
		     $log.log("Key: " + key_c);
		     $log.log("Value: " + inscription_content[content][key_c]);
		}
		*/
		  if(inscrip["type"] == 0) {
			$log.log("Inscription: Text");
			$scope.text = inscrip["content"].replace(/<[^>]+>/gm, '');
		  } else if(inscrip["type"] == 1) {
			$log.log("Inscription: Translation");
			$scope.translation = inscrip["content"];
		  } else if(inscrip["type"] == 2) {
			$log.log("Inscription: Commentary");
			$scope.commentary = inscrip["content"];
		  } else if(inscrip["type"] == 3) {
			$log.log("Inscription: Bibliography");
			$scope.bibliography = inscrip["content"];
		  } else {
			$log.log("Inscription Type: " + inscrip["type"]);
			$log.log("Inscription Content: " + inscrip["content"]);
		  }
		}
	});

	$log.log("Parsing inscription content for inscription: " + id);
	$log.log("Inscription content length: : " + $scope.inscription_content.length);

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
