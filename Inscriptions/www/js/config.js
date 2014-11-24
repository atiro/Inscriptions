angular.module('inscriptionsApp.config', [])
.constant('DB_CONFIG', {
	name: 'DB',
	tables: [
		{
			name: 'project',
			columns: [
			  {name: 'id', type: 'integer primary key'},
			  {name: 'guid', type: 'text'},
			  {name: 'name', type: 'text'},
			  {name: 'abbr', type: 'text'},
			  {name: 'description', type: 'text'},
			  {name: 'url', type: 'text'},
			  {name: 'start_date', type: 'text'},
			  {name: 'end_date', type: 'text'},
			  {name: 'thumb_url', type: 'text'},
			  {name: 'full_url', type: 'text'},
			  {name: 'country', type: 'integer'},
			  {name: 'long', type: 'float'},
			  {name: 'lat', type: 'float'},
			  {name: 'live', type: 'boolean'},
			  {name: 'complete', type: 'boolean'},
			  {name: 'new', type: 'boolean'},
			  {name: 'updated', type: 'boolean'}
			]
		},
		{
			name: 'inscription',
			columns: [
                          {name: 'id', type: 'integer primary key'},
                          {name: 'project_id', type: 'integer'},
                          {name: 'guid', type: 'text'},
                          {name: 'title', type: 'text'},
                          {name: 'description', type: 'text'},
                          {name: 'location', type: 'text'},
                          {name: 'lat', type: 'float'},
                          {name: 'long', type: 'float'}
			]
		}
	]

});
