angular.module('inscriptionsApp.services', ['inscriptionsApp.config'])
.factory('DB', function($q, DB_CONFIG) {
	var self = this;
	self.db = null;

	self.init = function() {
		self.db = window.sqlitePlugin.openDatabase({name: 'inscriptions.db'});
	}

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
.factory('Projects', function(DB) {
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
.factory('Inscriptions', function(DB) {
	var self = this;

	self.all = function(id) {
		return DB.query('SELECT i.id as i_id, i.title as i_title, i.description as i_description, ip.thumb_url as url FROM inscription as i LEFT OUTER JOIN inscription_photo as ip ON i_id = ip.inscription_id where i.project_id = ? group by i_id order by i_id limit 100', [id])
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
})
.factory('InscriptionContent', function(DB) {
	var self = this;

	self.getById = function(id) {
		return DB.query('SELECT type,content FROM inscription_text as it where it.inscription_id = ? order by type asc', [id])
		.then(function(result){
			return DB.fetchAll(result);
		});
	};

	return self;
})
.factory('InscriptionImages', function(DB) {
	var self = this;

	self.getById = function(id) {
		return DB.query('SELECT id, thumb_url, full_url, title from inscription_photo where inscription_id = ?', [id])
		.then(function(result){
			return DB.fetchAll(result);
		});
	};

	return self;
});
