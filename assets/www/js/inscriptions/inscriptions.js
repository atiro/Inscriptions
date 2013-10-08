var db;
var panel_cache = {};

var inscriptions_navbar = ['Description', 'Text', 'Images', 'Links']

$.ui.autoLaunch=true;
$.ui.resetScollers=true;
$.ui.useOSThemes=true;
$.feat.nativeTouchScroll=false;

$.ui.blockPageScroll();

function myClickHandler(evt){
    evt.preventDefault();
}
     
function swipeBack() {
	$.ui.goBack();
}

var init = function () {
	window.setTimeout(function () {
		$.ui.launch();
	}, 1500);
};

document.addEventListener("DOMContentLoaded", init, false);

$.ui.ready(function () {
    	// $.ui.launch();	// https://www.html5dev-software.intel.com/viewtopic.php?f=26&t=3636
 //       setTimeout(function(){
//		$.ui.launch();
//	},50);
});

var onDeviceReady = function () {
	// AppMobi.device.setRotateOrientation("portrait");
        // AppMobi.device.setAutoRotate(false);
	webRoot=AppMobi.webRoot+"/";
	//hide splash screen
//	AppMobi.device.hideSplashScreen(); 

	$.ui.customClickHandler=myClickHandler;

	$('#project').bind("swipeRight", swipeBack);
	$('#project-wip').bind("swipeRight", swipeBack);
	$('#inscriptions').bind("swipeRight", swipeBack);
	$('#inscription').bind("swipeRight", swipeBack);
	$('#photo').bind("swipeRight", swipeBack);
	$('#saved').bind("swipeRight", swipeBack);

    	console.log("Opening database");
 	db = window.sqlitePlugin.openDatabase("inscriptions", "1.0", "inscriptions", 222222);
 	notesdb = window.sqlitePlugin.openDatabase("notebook", "1.0", "notebook", 222222);
};
	
document.addEventListener("deviceready", onDeviceReady, false);

//$(document).on('loadpanel', '#projects', showProjectSQL);

function testFront() {
	console.log("In test front function");
	$.ui.updatePanel('#panel_home', 'Simple test function');
}

function listProjectsSQL() {
    console.log("listProjectsSQL");
    if(panel_cache['listProjects']) {
    	return;
    } else {
    db.transaction(function (tx) {
        tx.executeSql("select p.id,name,complete,count(i.project_id) as num_inscriptions from project as p LEFT JOIN inscription as i ON p.id = i.project_id group by p.id order by RANDOM()", [], listProjectsUI, dbErrorHandler);
    }, dbErrorHandler);
    }
}


function listProjectsUI(tx, results) {
    console.log("listProjectsUI");
    if (results.rows.length == 0) {
        <!-- ?? -->
    } else {
        var s = "";
        var s_complete = "";
        var s_inprogress = "";
	var col_count = 0;
	var col = 1;
	s += '<div data-position="static" class="grid">';
	s_complete += '<div class="container col3" id="projcol0">';
	s_complete += '<h3>Completed Projects</h3>';
	s_inprogress += '<div class="container col3" id="projcol1">';
	s_inprogress += '<h3>Projects In Progress</h3>';
	var num_per_col = results.rows.length / 3;
        for (var i = 0; i < results.rows.length; i++) {
	    if(col_count > num_per_col) {
			col_count = 0;
			col += 1;
	    		s_inprogress += '</div>';
			s_inprogress += '<div class="container col3" id="projcol' + col + '">';
	    }
            var id = results.rows.item(i).id;
            var name = results.rows.item(i).name;
            var complete = results.rows.item(i).complete;
            var num_inscriptions = results.rows.item(i).num_inscriptions;
	    if(complete) {
		    s_complete += '<div class="project-live"><h3><a href="" onClick="$(\'#project\').data(\'num_inscriptions\', \'' + num_inscriptions + '\'); $(\'#project\').data(\'proj_id\', \'' + id + '\'); $.ui.loadContent(\'#project\', false, false, \'pop\'); return false;">' + name + '</a></h3></div>';
	    } else {
		    s_inprogress += '<div class="project-wip"><h3><a href="" onClick="$(\'#project\').data(\'proj_id\', \'' + id + '\'); $.ui.loadContent(\'#project\', false, false, \'pop\'); return false;">' + name + '</a></h3></div>';
		    col_count += 1;
	    }
	}
	s += s_complete;
	s += '</div>'; // End complete col
	s += s_inprogress;
	s += '</div>'; // End second in-progress col
	s += '</div>'; // grid

	console.log(s);

	// Research Project Banner Board

	s += '<div id="plugbar">';
	s += '<br>Powered by:<br><br>';
	s += '<div class="researchplug block0"><a href="http://epidoc.sf.net/"><h4>EpiDoc</h4></a></div>';
	s += '<div class="researchplug block2"><a href="http://pleiades.stoa.org/"><h4>Pleiades</h4></a></div>';
	s += '<div class="researchplug block3"><a href="http://pelagios-project.blogspot.co.uk/p/about-pelagios.html"><h4>Pelagios</h4></a></div>';
	s += '<div class="researchplug block4"><a href="http://www.perseus.tufts.edu/hopper/"><h4>Perseus</h4></a></div>';
	s += '<div class="researchplug block1"><a href="http://www.digitalclassicist.org/"><h4>Digital Classicist</h4></a></div>';

	// Others
	s += '</div>';

	console.log("Updating Panel: " + s);
	$.ui.updatePanel('#panel_home', s);
    	panel_cache['listProjects'] = 1;
    }
}

function showProjectSQL(proj_div) {
      console.log("ShowProjectSQL");
      var proj_id = $(proj_div).data("proj_id");
      console.log("Proj Id: " + proj_id);

      db.transaction(function (tx) {
        tx.executeSql("select p.id,p.complete,p.live,p.url,p.thumb_url,p.start_date,p.end_date,c.name as country,p.name,p.description,p.lat,p.long from project as p,country as c where p.country = c.id and p.id = " + proj_id, [], showProjectUI, dbErrorHandler);
      }, dbErrorHandler);
}

function showProjectUI(tx, results) {
    console.log("ShowProjectUI");
    if (results.rows.length == 0) {
        <!-- ?? -->
    } else {
    	var proj_id = results.rows.item(0).id;
    	var proj_name = results.rows.item(0).name;
    	var proj_url = results.rows.item(0).url;
    	var proj_country = results.rows.item(0).country;
    	var proj_start = results.rows.item(0).start_date;
    	var proj_end = results.rows.item(0).end_date;
    	var proj_thumb = results.rows.item(0).thumb_url;
    	var proj_complete = results.rows.item(0).complete;
    	var proj_live = results.rows.item(0).live;
    	var proj_desc = results.rows.item(0).description;
    	var proj_lat = results.rows.item(0).lat;
    	var proj_long = results.rows.item(0).long;
        var s = "";
	s += '<div class="grid project-info">';
	s += '<div class="col2-3">'
	s += '<div class="project-info-bg">';
	s += '<p>' + proj_desc + '</p>';
//	s += '<form id="proj-search"><input type="text" size=20 class="af-ui-forms proj-search-box" name="text" value="Search inscriptions...">\n';
//	s += '<input class="af-ui-forms" type="button" value="Search">\n';
//	s += '</form>';
	s += '</div>\n';

	s += '<div class="project-highlights">';

	if(proj_thumb) {
	  db.transaction(function(tx) {
		tx.executeSql("select id,title from inscription WHERE project_id = " + proj_id + " ORDER BY RANDOM() LIMIT 5",  [], function(tx, res) {
		        for (var i = 0; i < res.rows.length; i++) {
				var i_id = res.rows.item(i).id;
				var i_title = res.rows.item(i).title;
				var block = Math.floor(Math.random() * 4);
				s += '<a href="" onClick="$(\'#inscription\').data(\'proj_id\', \'' + proj_id + '\'); $(\'#inscription\').data(\'inscription_id\', \'' + i_id + '\'); $.ui.loadContent(\'#inscription\', false, false, \'pop\'); return false;">'; // + i_title + '</a>';
				s += '<div class="highlight_img block' + block + '">';
				db.transaction(function(tx) {
					tx.executeSql("select thumb_url from inscription_photo where inscription_id = " + i_id + " ORDER BY RANDOM() LIMIT 1", [], function(tx, res) {
		        	  for (var i = 0; i < res.rows.length; i++) {
				    if(res.rows.length > 0) {
				      var photo_url = res.rows.item(i).thumb_url;
				      s += '<img src="' + photo_url + '"/>';
				    } else {
				    	s += ''; // TODO add empty img
				    }
				  }
			         });
	  		        });

				s += i_title;
				s += '</a>';
				s += '</div>';
			}
		});
	});
	} else {
	  db.transaction(function(tx) {
		tx.executeSql("select id,title from inscription WHERE project_id = " + proj_id + " ORDER BY RANDOM() LIMIT 12",  [], function(tx, res) {
		        for (var i = 0; i < res.rows.length; i++) {
				var i_id = res.rows.item(i).id;
				var i_title = res.rows.item(i).title;
				var block = Math.floor(Math.random() * 4);
				s += '<div class="highlight_noimg block' + block + '">';
				s += '<a href="" onClick="$(\'#inscription\').data(\'proj_id\', \'' + proj_id + '\'); $(\'#inscription\').data(\'inscription_id\', \'' + i_id + '\'); $.ui.loadContent(\'#inscription\', false, false, \'pop\'); return false;">' + i_title + '</a>';
				s += '</div>';
			}
		});
	  });
	}

	s += '</div>'; <!-- project-highlights -->

	s += '</div>'; // End of 2-3 


	s += '<div class="col1-3">';

	// Map (or image if not)

	s += '<div class="project-map" id="project-map"></div>';

/*
	var map = new OpenLayers.Map({
		div: 'project-map',
		them: null,
		projection: new OpenLayers.Projection("EPSG:900913"),
		numZoomLevels: 18,
		layers: [
			new OpenLayers.Layer.OSM("OpenStreetMap", null, {
				transitionEffect: 'resize'
			})
		]
	});
	map.setCenter(new OpenLayers.LonLat(0, 0), 3);
	*/


	// s += '<div class="project-info-map">';
	// TODO - Ideally slider button would autosize to handle more than
	// on/off text but currently not happening (reported to Forum)
	// s += '<input type="checkbox" name="mapslider" id="mapslider" class="toggle"><label for="mapslider" data-on="Ancient" data-off="Modern"><span></span></label>';
	// More basic version for the moment. Removed, doesn't work well
	// s += '<form id="map-type">';
	// s += '<input type="radio" name="mapperiod" value="Ancient" id="Ancient" class="af-ui-forms"><label for="Ancient">Ancient</label>';
	// s += '<input type="radio" name="mapperiod" value="Modern" id="Modern" class="af-ui-forms"> <label for="Modern">Modern</label>';
	// s += '</form>';

	// s += '</div>';

	// Info Table

	s += '<div class="project-info-table">';

			
	s += '<b>Origin: </b> ' + proj_country + '<br/>';
      	var num_inscriptions = $('#project').data("num_inscriptions");

	s += '<b>Number of Inscriptions: </b> ';
	s += num_inscriptions + '<br/>';

	s += '<b>Project Status: </b> ';
	if(proj_complete) {
		s += 'Completed<br/>';
	} else {
		s += 'In Progress<br/>';
	}
	// TODO - Only show if valid
	//s += '<b>Project Dates: </b> ' + proj_start + '-' + proj_end + '<br/>';

	db.transaction(function(tx) {
		tx.executeSql("select i.name from institution as i, project_institution as p where p.institution_id = i.id and p.project_id = " + proj_id, [], function(tx, res) {
			s += '<b>Institution(s): </b> '
		        for (var i = 0; i < res.rows.length; i++) {
				var i_name = res.rows.item(i).name;
				if(i > 0) {
					s += ', ';
				}
				s += i_name;
			}
			s += '<br/>';
		});
	});

	if(proj_live) {
		s += '<b>Website: </b><a href="' + proj_url + '">' + proj_url + '</a><br/><br/>';

		s += '<div class="project-info-browse">';
		s += '<form id="proj-browse">';
		s += '<input class="af-ui-forms" id="browse_inscriptions" type="button" value="Browse All Inscriptions" onclick="$(\'#inscriptions\').data(\'proj_id\', \'' + proj_id + '\'); $(\'#inscriptions\').data(\'offset\', 0); $.ui.loadContent(\'#inscriptions\', false, false, \'slide\');"><br/><br/>\n';
		s += '<input class="af-ui-forms" id="view_saved" type="button" value="View Saved" onclick="$(\'#saved\').data(\'proj_id\', \'' + proj_id + '\'); $.ui.loadContent(\'#saved\', false, false, \'slide\');">\n';
		s += '</form></div>';
	}

	s += '</div>'; // End of 1-3

	s += '</div>'; // grid
	
	s += '</div>' // Project panel
	/*
	$('#projects').attr('title', proj_name);
	$('#project_title').append(proj_name);
	$('#project-desc').append(proj_desc);
	$('#project-url').append(proj_url);
	$('#project-country').append(proj_country);
	*/
	
	$.ui.updatePanel('#project', s);
	$('#project').attr('title', proj_name);

	map_init(proj_lat, proj_long);

//	$.ui.setTitle(proj_name);
    }
}

function browseInscriptionsSQL(inscriptions_div) {
    console.log("browseInscriptionsSQL");
    var proj_id = $(inscriptions_div).data("proj_id");
    var offset = parseInt($(inscriptions_div).data("offset"));
    if(offset == null) { offset = 0; }
    console.log("Proj Id: " + proj_id);
    if(db) {
      console.log("browseInscriptionsSQL");
      db.transaction(function (tx) {
            tx.executeSql("select id,title from inscription WHERE project_id = " + proj_id + " LIMIT " + offset + ",25", [], browseInscriptionsUI, dbErrorHandler);
        });
    }
}

function browseInscriptionsUI(tx, results) {
    var s = "";
    var proj_id = $('#inscriptions').data('proj_id');
    var offset = parseInt($('#inscriptions').data("offset"));
    if(offset == null) { offset = 0; }

    console.log("browseInscriptionsUI");
    if (results.rows.length == 0) {
        <!-- ?? -->
    } else {
	s += '<div class="inscriptions" data-pull-scroller="true">';
        for (var i = 0; i < results.rows.length; i++) {
    	  var i_id = results.rows.item(i).id;
    	  var i_title = results.rows.item(i).title;
	  var block = Math.floor(Math.random() * 4);
	  s += '<a href="" onClick="$(\'#inscription\').data(\'proj_id\', \'' + proj_id + '\'); $(\'#inscription\').data(\'inscription_id\', \'' + i_id + '\'); $.ui.loadContent(\'#inscription\', false, false, \'pop\'); return false;">';
	  s += '<div class="inscription block' + block + '">';
	  s += i_title;
  	  s += '</div>';
	  s += '</a>';
	}
    }


    s += '</div>';
    s += '<div id="paging">';
    s += '<form id="inscrip-browse">';
    if(offset > 0) {
    	   var back_offset = offset - 25;
 	   s += '<input class="af-ui-forms" id="prevpage" type="button" value="Prev 25" onclick="$(\'#inscriptions\').data(\'proj_id\', \'' + proj_id + '\'); $(\'#inscriptions\').data(\'offset\', ' + back_offset + '); browseInscriptionPager(); return false;">\n';
    }
    offset += 25;
    s += '<input class="af-ui-forms" id="nextpage" type="button" value="Next 25" onclick="$(\'#inscriptions\').data(\'proj_id\', \'' + proj_id + '\'); $(\'#inscriptions\').data(\'offset\', ' + offset + '); browseInscriptionsPager(); return false;">\n';

    s += '</form>';
    s += '</div>';

    //$('#project').attr('title', proj_name);
    $.ui.updatePanel('#inscriptions', s);

   // $('#inscriptions').data('proj_id', proj_id);

/*
    var inscripscroller = $('#inscriptions').scroller(
    		{'verticalScroll': true,
		 'refresh': true,
		 'scrollBars': true,
		 'horizontalScroll': false,
		 'vScrollCSS': "jqmScrollbar",
		 'hScrollCSS': "jqmScrollbar"
    });

    $.bind(inscripscroller, "refresh-release", function() {
    		console.log("Pulling to refresh");
    });

    inscripscroller.enable();
*/
}

function browseInscriptionsPager() {
    var proj_id = $('#inscriptions').data("proj_id");
    var offset = parseInt($('#inscriptions').data("offset"));
    var s = '';

    if(offset == null) { offset = 0; }

    console.log("browseInscriptionsPager");
    console.log("offset: " + offset);
    if(offset == null) { offset = 0; }
    console.log("Proj Id: " + proj_id);
    if(db) {
      db.transaction(function (tx) {
            tx.executeSql("select id,title from inscription WHERE project_id = " + proj_id + " LIMIT " + offset + ",25", [], function(tx, results) {
	     s += '<div class="inscriptions" data-pull-scroller="true">';
             for (var i = 0; i < results.rows.length; i++) {
    	      var i_id = results.rows.item(i).id;
    	      var i_title = results.rows.item(i).title;
	      var block = Math.floor(Math.random() * 4);
	      s += '<a href="" onClick="$(\'#inscription\').data(\'proj_id\', \'' + proj_id + '\'); $(\'#inscription\').data(\'inscription_id\', \'' + i_id + '\'); $.ui.loadContent(\'#inscription\', false, false, \'pop\'); return false;">';
	      s += '<div class="inscription block' + block + '">';
	      s += i_title;
  	      s += '</div>';
	      s += '</a>';
	    }

           s += '</div>';
    s += '<div id="paging">';
    s += '<form id="inscrip-browse">';
    if(offset > 0) {
    	   var back_offset = offset - 25;
 	   s += '<input class="af-ui-forms" id="prevpage" type="button" value="Prev 25" onclick="$(\'#inscriptions\').data(\'proj_id\', \'' + proj_id + '\'); $(\'#inscriptions\').data(\'offset\', ' + back_offset + '); browseInscriptionsPager(); return false;">\n';
    }
    offset += 25;
    s += '<input class="af-ui-forms" id="nextpage" type="button" value="Next 25" onclick="$(\'#inscriptions\').data(\'proj_id\', \'' + proj_id + '\'); $(\'#inscriptions\').data(\'offset\', ' + offset + '); browseInscriptionsPager(); return false;">\n';

    s += '</form>';
    s += '</div>';

    //$('#project').attr('title', proj_name);
    $.ui.updatePanel('#inscriptions', s);

	    
    }, dbErrorHandler);
        });
    }

	
}

function showInscriptionSQL(inscription_div) {
    console.log("showInscriptionSQL");
    var proj_id = $('#inscription').data("proj_id");
    var inscription_id = $('#inscription').data("inscription_id");
    console.log("Proj Id: " + proj_id);
    console.log("Inscription Id: " + inscription_id);
    if(db) {
      db.transaction(function (tx) {
            tx.executeSql("select id,project_id, title,description,location from inscription where id = " + inscription_id, [], showInscriptionUI, dbErrorHandler);
        });
    }
}

function showInscriptionUI(tx, results) {
    console.log("showInscriptionUI");
    if (results.rows.length == 0) {
        <!-- ?? -->
    } else {
    	var i_id = results.rows.item(0).id;
    	var i_projid = results.rows.item(0).project_id;
    	var i_title = results.rows.item(0).title;
    	var i_desc = results.rows.item(0).description;
    	var i_loc = results.rows.item(0).location;
	var block = Math.floor(Math.random() * 4);
        var s = "";
	var s_text = "";
	var s_trans = "";
	var s_comm = "";
	var s_biblio = "";
	s += '<div class="grid inscription-info">';
	s += '<div class="col2-3" id="infoslider">'
	db.transaction(function(tx) {
		tx.executeSql("select type,content from inscription_text where inscription_id = " + i_id, [], function(tx, res) {
		        for (var i = 0; i < res.rows.length; i++) {
				var i_type = res.rows.item(i).type;
				var i_content = res.rows.item(i).content;
				if(i_type == 0) {
				  s_text += '<div class="inscription-info">';
				  s_text += '<h3>Text</h3><br/>';
				  s_text += '<span>' + i_content + '</span>';
				  s_text += '</div>';
				} else if (i_type == 1) {
				  s_trans += '<div class="inscription-info">';
				  s_trans += '<h3>Translation</h3><br/>';
				  s_trans += '<span>' + i_content + '</span>';
				  s_trans += '</div>';
				} else if (i_type == 2) {
				  s_comm += '<div class="inscription-info">';
				  s_comm += '<h3>Commentary</h3><br/>';
				  s_comm += '<span>' + i_content + '</span>';
				  s_comm += '</div>';
				} else if (i_type == 3) {
				  s_biblio += '<div class="inscription-info">';
				  s_biblio += '<h3>Bibliography</h3><br/>';
				  s_biblio += '<span>' + i_content + '</span>';
				  s_biblio += '</div>';
				} else {
				  content.log("Type: " + i_type);
				  content.log("Content: " + i_content);
				}

			}
		});
	});
			
	if(s_text != '') {
		s += s_text + '<br/>';
	} else {
	  s_text = '<div class="inscription-info">';
	  s_text += '<h3>Text</h3><br/>'
	  s_text += '<span>No readable text</span>' + '<br/>';
	  s_text += '</div>';
	  s += s_text + '<br/>';
	}

	if(s_trans != '') {
	  s += s_trans + '<br/>';
	} else {
	  s_trans = '<div class="inscription-info">';
	  s_trans += '<h3>Translation</h3><br/>'
	  s_trans += '<span>No translation at present</span>' + '<br/>';
	  s_trans += '</div>';
	  s += s_trans + '<br/>';
	}

	if(s_comm != '') {
		s += s_comm + '<br/>';
	}

	if(i_desc != '') {
	  s += '<div class="inscription-info">';
 	  s += '<h3>Description (Material)</h3><br/>'
          s += '<span>' + i_desc + '</span>';
	  s += '</div>';
	  s += '<br/>';
	}

	if(s_biblio != '') {
		s += s_biblio + '<br/>';
	}


//	s += '<div class="inscription-info">';
//	s += 'Commentary would go here';
//	s += '</div>';

//	s += '<div class="inscription-info">';
//	s += 'Bibliography would go here';
//	s += '</div>';

	s += '</div>'; // col2-3

	s += '<div class="col1-3">';
	s += '<h3>Photographs</h3><br/><br/>';

	db.transaction(function(tx) {
		tx.executeSql("select id, thumb_url from inscription_photo where inscription_id = " + i_id, [], function(tx, res) {
		        for (var i = 0; i < res.rows.length; i++) {
				var photo_id = res.rows.item(i).id;
				var photo_url = res.rows.item(i).thumb_url;
				s += '<div class="photo">';
				s += '<a href="" onClick="$(\'#photo\').data(\'photo_id\', \'' + photo_id + '\'); $(\'#photo\').data(\'title\', \'' + 'Test Title' + '\'); $.ui.loadContent(\'#photo\', false, false, \'pop\'); return false;">';

				s += '<img src="' + photo_url + '"/></a>';
				s += '</div>';
			}
			if(res.rows.length == 0) {
				s += '<div class="photo">';
				s += '<span>No photographs currently available.</span>';
				s += '</div>';
			}
		});
	});

	// Future Functionality

	s += '<div id="inscription-buttons">';
	s += '<form id="inscription-functions">';
//	s += '<input class="af-ui-forms" type="button" value="Ask a Question">\n';
	s += '<br/><br/>';
	// TODO - website ?
	// s += '<input class="af-ui-forms" type="button" value="Discuss Inscription"><br/><br/>\n';
	s += '<input class="af-ui-forms" type="button" value="Save Inscription" id="save_button" onClick="saveInscription(' + i_projid + ',' + i_id + ',\'' + i_title.replace(/\n/gm, '') + '\'); return false;">\n';
	s += '</form>';
	s += '</div>';

	s += '</div>'; // col1-3
	s += '</div>'; //grid

        $('#inscription').attr('title', i_title);
        $.ui.updatePanel('#inscription', s);

	// var infoscroller = $('#infoslider').scroller({'scollingLocked': true, 'bubbles': false});
	var infoscroller = $('#infoslider').scroller({'bubbles': false, 'infinite': true, 'scrollSkip': true});
/*
	$.bind(infoscroller, 'scrollstart', function () {
		console.log("scroll start");
	});
	*/

	infoscroller.enable();

	//PhotoSwipe.attach(window.document.querySelectorAll('#photo a'), {});

	console.log(s);
    }

}

function removeInscription(inscription_div) {
	// Do nothing
}

function showPhotoSQL(photo_div) {
    console.log("showPhotoSQL");
    var photo_id = $('#photo').data("photo_id");
    console.log("Photo Id: " + photo_id);
    if(db) {
      db.transaction(function (tx) {
            tx.executeSql("select title,full_url from inscription_photo  where id = " + photo_id, [], showPhotoUI, dbErrorHandler);
        });
    }
}

function showPhotoUI(tx, results) {
    console.log("showPhotoUI");
    var s = '';
    var title  = $('#photo').data("title");

    if(results.rows.length > 0) {
 	   title = results.rows.item(0).title;
 	   var full_url = results.rows.item(0).full_url;
	   s += '<div class="fullphoto" id="photoscroller">';
	   s += '<img src="' + full_url + '"/>';
	   s += '</div>';
    }
    $('#inscription').attr('title', title);

    $.ui.updatePanel('#photo', s);

    var photoscroller = $('#photoscroller').scroller({'bubbles': false});
    photoscroller.enable();

}

function showSavedSQL(tx, results) {
    console.log("showSavedSQL");
    var proj_id = $('#saved').data("proj_id");
    if(db) {
      console.log("showSavedSQL");
      notesdb.transaction(function (tx) {
            tx.executeSql("select id,inscription_id,title from note WHERE project_id = " + proj_id + " LIMIT 100", [], showSavedUI, dbErrorHandler);
        });
    }
}

function showSavedUI(tx, results) {
	var s = '';

	if(results.rows.length > 0) {
          var s = "";
	  var proj_id = $('saved').data('proj_id');
	  s += '<div class="inscriptions" data-pull-scroller="true">';
          for (var i = 0; i < results.rows.length; i++) {
    	    var i_id = results.rows.item(i).inscription_id;
    	    var i_title = results.rows.item(i).title;
	    var block = Math.floor(Math.random() * 4);
	    s += '<a href="" onClick="$(\'#inscription\').data(\'proj_id\', \'' + proj_id + '\'); $(\'#inscription\').data(\'inscription_id\', \'' + i_id + '\'); $.ui.loadContent(\'#inscription\', false, false, \'pop\'); return false;">';
	    s += '<div class="inscription block' + block + '">';
	    s += i_title;
  	    s += '</div>';
	    s += '</a>';
	  }
   	  $.ui.updatePanel('#saved', s);
	} else {
	   s += '<div>';
	   s += 'No saved inscriptions currently';
	   s += '</div>';
 	   $.ui.updatePanel('#saved', s);
	}

}

// Helper Functions

function saveInscription(proj_id, inscrip_id, title) {
    if(db) {
      console.log("saveInscription");
      console.log("Proj Id: " + proj_id);
      console.log("Inscription Id: " + inscrip_id);
      notesdb.transaction(function (tx) {
        tx.executeSql("INSERT INTO note(project_id, inscription_id, title) VALUES(" + proj_id + "," + inscrip_id + ",'" + title + "')");
      });
   }
}

function dbErrorHandler(err) {
    console.log("DB Error: " + err.message + "\nCode=" + err.code);
}
