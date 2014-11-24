angular.module('inscriptionsApp.services', ['inscriptionsApp.config'])
.factory('DB', function($q, DB_CONFIG) {
	var self = this;
	self.db = null;

	self.init = function() {
		self.db = window.sqlitePlugin.openDatabase({name: 'inscriptions.db'});
	}
	/*
		angular.forEach(DB_CONFIG.tables, function(table) {
			var columns = [];

			angular.forEach(table.columns, function(column) {
				columns.push(column.name + ' ' + column.type);
			});

			var query = 
	*/

	self.query = function(query, bindings) {
		bindings = typeof bindings !== 'undefined' ? bindings : [];
		var deferred = $q.defer();

		self.db.transaction(function(transaction) {
			transaction.executeSql(query, bindings, function(transaction, result) {
				deferred.resolve(result);
			}, function(transaction, error) {
				deferred.reject(error);
			});
		});

		return deferred.promise;
	};

	self.fetchAll = function(result) {
		var output = [];

		for(var i = 0; i < result.rows.length; i++) {
			output.push(result.rows.item(i));
		}

		return output;
	};

	self.fetch = function(result) {
		return result.rows.item(0);
	};

	return self;
})
.factory('Project', function(DB) {
	var self = this;

	self.all = function() {
		return DB.query('SELECT * FROM project where live = 1')
		.then(function(result){
			return DB.fetchAll(result);
		});
	};

	self.getById = function(id) {
		return DB.query('SELECT * FROM project WHERE id = ?', [id])
			.then(function(result){
				return DB.fetch(result);
		});
	};

	return self;
})
.factory('Inscription', function(DB) {
	var self = this;

	self.all = function() {
		return DB.query('SELECT * FROM inscription where project_id = 12')
		.then(function(result){
			return DB.fetchAll(result);
		});
	};

	self.getById = function(id) {
		return DB.query('SELECT * FROM inscription WHERE id = ?', [id])
			.then(function(result){
				return DB.fetch(result);
		});
	};

	return self;
});
