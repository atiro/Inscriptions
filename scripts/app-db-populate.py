#!/usr/bin/python
# -*- coding: utf8

import sqlite3
from lxml import etree
import csv
import re
import htmlentitydefs
import glob

total_inscriptions = 0

class Inscription:
	TEXT = 0
	TRANSLATION = 1
	COMMENTARY = 2
	BIBLIOGRAPHY = 3
	FIGURE = 5
	DESCRIPTION = 1000
	DESCRIPTION_TEXT = 1001
	DESCRIPTION_LETTERS = 1002
	DESCRIPTION_MONUMENT = 1003
	DESCRIPTION_DATE = 1004
	DESCRIPTION_SITE = 1005
	DESCRIPTION_SITE_TYPE = 1006
	HISTORY = 2000
	HISTORY_FOUND = 2001
	HISTORY_ORIG_LOC = 2001
	HISTORY_LAST_REC_LOC = 2001
	HISTORY_RECORD = 2001
	METADATA = 3000
	METADATA_CAT_TEXT = 3001
	METADATA_CAT_MONUMENT = 3002

##
# Removes HTML or XML character references and entities from a text string.
#
# @param text The HTML (or XML) source text.
# @return The plain text, as a Unicode string, if necessary.
# from http://effbot.org/zone/re-sub.htm#unescape-html

def unescape(text):
    def fixup(m):
        text = m.group(0)
        if text[:2] == "&#":
            # character reference
            try:
                if text[:3] == "&#x":
                    return unichr(int(text[3:-1], 16))
                else:
                    return unichr(int(text[2:-1]))
            except ValueError:
                pass
        else:
            # named entity
            try:
	    	if text[1:-1] != 'amp' and text[1:-1] != 'lt' and text[1:-1] != 'gt' and text[1:-1] != 'quot' and text[1:-1] != 'apos':
                  text = unichr(htmlentitydefs.name2codepoint[text[1:-1]])
            except KeyError:
                pass
        return text # leave as is
    return re.sub("&#?\w+;", fixup, text)

	# Create database (TODO - or update)

	# Read files (iterate)
	# Add data to database
	# TODO read schema/guide/dialect for each project to identify right
	# bits of information (or correct variants)

con = None

try:
	con = sqlite3.connect('inscriptions.db')

	cur = con.cursor()

	# tables - project, country (anc/mod), period, language, inscription


	cur.execute("CREATE TABLE country(id INTEGER PRIMARY KEY , name TEXT, ancient BOOLEAN, modern BOOLEAN)")	# plieades link ?
	cur.execute("CREATE TABLE project(id INTEGER PRIMARY KEY, name TEXT, abbr TEXT, description TEXT, url TEXT, start_date TEXT, end_date TEXT, thumb_url TEXT, full_url TEXT, country INTEGER, long FLOAT, lat FLOAT , live BOOLEAN, complete BOOLEAN, new BOOLEAN, updated BOOLEAN)")
	cur.execute("CREATE TABLE period(id INTEGER PRIMARY KEY , name TEXT)")
	cur.execute("CREATE TABLE language(id INTEGER PRIMARY KEY , name TEXT)")
	cur.execute("CREATE TABLE name(id INTEGER PRIMARY KEY , name TEXT, type TEXT)")
	cur.execute("CREATE TABLE institution(id INTEGER PRIMARY KEY , name TEXT)")

	cur.execute("CREATE TABLE project_institution(project_id INT, institution_id INT)")
	# Need to handle having local copy in epidoc to display, or having
	# to request via webservice/website (TODO)

	cur.execute("CREATE TABLE inscription(id INTEGER PRIMARY KEY , title TEXT, description TEXT, location TEXT, lat FLOAT, long FLOAT)")
	cur.execute("CREATE TABLE inscription_text(inscription_id INT, type INT, content TEXT)")
	cur.execute("CREATE TABLE inscription_lang(lang_id INT, inscription_id INT)") 
	cur.execute("CREATE TABLE inscription_period(period_id INT, inscription_id INT)")
	cur.execute("CREATE TABLE inscription_name(name_id INT, inscription_id INT)")
	cur.execute("CREATE TABLE inscription_project(project_id INT, inscription_id INT)")
	cur.execute("CREATE TABLE inscription_country(country_id INT, inscription_id INT)")
	cur.execute("CREATE TABLE inscription_photo(id INTEGER PRIMARY KEY, inscription_id INT, thumb_url TEXT, full_url TEXT, title TEXT)")
	#cur.execute("CREATE TABLE inscription_photo_full(inscription_id INT, photo_url TEXT, title TEXT)")

except sqlite3.Error as e:
	print "DB Error: " + e.args[0]

con.commit()

# Read in projects data (currently CSV file)

with open('projects-epidoc.csv', 'rb') as csvfile:
  projreader = csv.reader(csvfile, delimiter=',', quotechar="'")
  for row in projreader:
    proj_title = unicode(row[0], 'utf-8')
    #print "Reading project: " + proj_title

    proj_abbr = unicode(row[1], 'utf-8')
    proj_desc = unicode(row[2], 'utf-8')
    proj_institution = unicode(row[3], 'utf-8')
    proj_start = unicode(row[4], 'utf-8')
    proj_end = unicode(row[5], 'utf-8')

    proj_country = unicode(row[6], 'utf-8')
    proj_long = float(row[7])
    proj_lat = float(row[8])
    print "Project country: " + proj_country

    proj_url = unicode(row[9], 'utf-8')
    print "Project url: " + proj_url
    proj_inscrip = unicode(row[10], 'utf-8')
    print "Project inscrip: " + proj_url
    proj_thumb = unicode(row[11], 'utf-8')
    proj_full = unicode(row[12], 'utf-8')

    proj_live = unicode(row[13], 'utf-8')
    print "Project live: " + proj_live
    proj_complete = unicode(row[14], 'utf-8')
    print "Project complete: " + proj_complete
    proj_new = unicode(row[15], 'utf-8')
    print "Project new: " + proj_new
    proj_updated = unicode(row[16], 'utf-8')

    print "Project inscript:" + proj_inscrip

    # Check if country already there
    cur.execute("SELECT id from country where name = ?", (proj_country,))

    country_id  = cur.fetchone()

    if(country_id == None):
    	cur.execute("INSERT into country ( name ) VALUES (?)", (proj_country,))
    	cur.execute("SELECT id from country where name = ?",  (proj_country,))
    	country_id  = cur.fetchone()[0]
    else:
    	country_id = country_id[0]

    # Check if institution(s) already there, if not add
    institution_ids = []
    for institution in proj_institution.split('|'):
        #print "Project Institution: " + str(institution)
    	cur.execute("SELECT id from institution where name = ?", (institution,))
	institution_id = cur.fetchone()
	if institution_id == None:
    		cur.execute("INSERT into institution ( name ) VALUES (?)",( institution,))
    		cur.execute("SELECT id from institution where name = ?",  (institution,))
    		institution_id  = cur.fetchone()[0]
        	print "New Institution: " + str(institution_id)
		institution_ids.append(institution_id)
	else:
		institution_ids.append(institution_id[0])
		
    cur.execute("INSERT into project ( name, abbr, description, url, start_date, end_date, thumb_url, full_url, country, long, lat, live, complete, new, updated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", (proj_title, proj_abbr, proj_desc, proj_url, proj_start, proj_end, proj_thumb, proj_full, country_id, proj_long, proj_lat, proj_live, proj_complete, proj_new, proj_updated))

    con.commit()

    proj_id = cur.lastrowid
	  	
    for institute_id in institution_ids:
    	print "Institution ID: ", institute_id
    	cur.execute("INSERT into project_institution ( project_id, institution_id ) VALUES (?, ?)", (proj_id, institute_id,))

# Create project (this should be command line, or read in from file

# Now read in XML file in current directory

    #print "Reading xml file in: " + row[1] + "/*.xml"

    inscription_count = 0

    for xml_file in sorted(glob.glob(proj_abbr + '/*.xml')):
	print "Reading file: " + xml_file
	title = None
	description = None
	rowid = None
	title_node = None
	text_nodes = None
	text_node = None
	translation_node = None
	commentary_node = None

	file = open(xml_file, 'r')
	raw_data = unicode(file.read(), 'utf-8')
	file.close()

	safe_data = unescape(raw_data) # Convert HTML entities
	
	root = etree.fromstring(safe_data.encode('utf-8'))
#	root = tree.getroot()

	if(root.tag == "TEI.2"):
	  title_node = root.findall("./teiHeader/fileDesc/titleStmt/title")[0]
	else:
	  title_node = root.findall("./xmlns:teiHeader/xmlns:fileDesc/xmlns:titleStmt/xmlns:title", namespaces={'xmlns':'http://www.tei-c.org/ns/1.0'})[0]

	title = unicode(etree.tostring(title_node, encoding="UTF-8", method="text"), 'utf-8')

	#print title
	
	try:
	  description_node = None
	
	  if(root.tag == "TEI.2"):
	    description_node = root.findall(proj_inscrip)[0]
	  else:
	    description_node = root.findall(proj_inscrip, namespaces={'xmlns':'http://www.tei-c.org/ns/1.0'})[0]

	  if description_node is not None:
		description = unicode(etree.tostring(description_node, encoding="UTF-8", method="text"), 'utf-8')
	  else:
	  	description = ''

	  #print description

	except:
	  	# Log error/notice (may be valid empty file)
	  pass

	# Text

#	try:
	if(root.tag == "TEI.2"):
	    text_nodes = root.findall("./text/body/div[@type='edition']")
	    if len(text_nodes) > 1:
	    	# only get where n=text
		for node in text_nodes:
		  if node.get("n") == "text":
		  	# Try to get rid of head node with redundent title
			if node.find("./head") is not None:
				head = node.find("./head")
				node.remove(head)
		  	text_node = unicode(etree.tostring(node, encoding="UTF-8"), 'utf-8')
			break

		if text_node == None:
			if text_nodes[0].find("./head") is not None:
				head = text_nodes[0].find("./head")
				text_nodes[0].remove(head)
		  	# Have to take first and hope !
		  	text_node = unicode(etree.tostring(text_nodes[0], encoding="UTF-8"), 'utf-8')

	    elif len(text_nodes) == 1:
		print "Single text node"
		if text_nodes[0].find("./head") is not None:
			head = text_nodes[0].find("./head")
			text_nodes[0].remove(head)
	    	text_node = unicode(etree.tostring(text_nodes[0], encoding="UTF-8"), 'utf-8')
	    else:
		print "Failed to find text node (TEI.2)"

	else:
	      text_nodes = root.findall("./xmlns:text/xmlns:body/xmlns:div[@type='edition']", namespaces={'xmlns':'http://www.tei-c.org/ns/1.0'})
	      if len(text_nodes) > 0:
		      if text_nodes[0].find("./xmlns:head", namespaces={'xmlns':'http://www.tei-c.org/ns/1.0'}) is not None:
			head = text_nodes[0].find("./xmlns:head", namespaces={'xmlns':'http://www.tei-c.org/ns/1.0'})
			text_nodes[0].remove(head)
		      text_node = unicode(etree.tostring(text_nodes[0], encoding="UTF-8"), 'utf-8')
	      else:
	      	      print "Failed to find text node (TEI)"
	
#	except:
#		print "Failed to find text node"
#		pass

	# Translation

	try:
	  if(root.tag == "TEI.2"):
	    translation_nodes = root.findall("./text/body/div[@type='translation']")
	    if len(translation_nodes) > 0:
		if translation_nodes[0].find("./head") is not None:
			head = translation_nodes[0].find("./head")
			translation_nodes[0].remove(head)
	  	translation_node = unicode(etree.tostring(translation_nodes[0], encoding="UTF-8", method="text"), 'utf-8')
	    else:
	    	translation_node = None
	  else:
	    translation_nodes = root.findall("./xmlns:text/xmlns:body/xmlns:div[@type='translation']", namespaces={'xmlns':'http://www.tei-c.org/ns/1.0'})
	    if len(translation_nodes) > 0: 
	    	# Remove head node if exists (text nodes vary)
		if translation_nodes[0].find("./xmlns:head", namespaces={'xmlns':'http://www.tei-c.org/ns/1.0'}) is not None:
			head = translation_nodes[0].find("./xmlns:head", namespaces={'xmlns':'http://www.tei-c.org/ns/1.0'})
			translation_nodes[0].remove(head)
	  	translation_node = unicode(etree.tostring(translation_nodes[0], encoding="UTF-8", method="text"), 'utf-8')
	    else:
	    	translation_node = None
	except:
	  pass

	# Bibliography

	if(root.tag == "TEI.2"):
	    bib_node = root.findall("./text/body/div[@type='bibliography']")
	    print "Bib: ", bib_node
	    if len(bib_node) > 0:
		if bib_node[0].find("./head") is not None:
		  head = bib_node[0].find("./head")
		  bib_node[0].remove(head)
	    	bib_node = unicode(etree.tostring(bib_node[0], encoding="UTF-8", method="text"), 'utf-8')
	    else:
	    	bib_node = None
	else:
	    bib_node = root.findall("./xmlns:text/xmlns:body/xmlns:div[@type='bibliography']/", namespaces={'xmlns':'http://www.tei-c.org/ns/1.0'})
	    if len(bib_node) > 0:
		if bib_node[0].find("./head") is not None:
		  head = bib_node[0].find("./head")
		  bib_node[0].remove(head)
	    	bib_node = unicode(etree.tostring(bib_node[0], encoding="UTF-8", method="text"), 'utf-8')
	    else:
	    	bib_node = None

	# Commentary

	try:
	  if(root.tag == "TEI.2"):
	    commentary_node = root.findall("./text/body/div[@type='commentary']/p")[0]
	    if len(commentary_node) > 0:
	  	commentary_node = unicode(etree.tostring(commentary_node, encoding="UTF-8", method="text"), 'utf-8')
	    else:
	    	commentary_node = None
	  else:
	    commentary_nodes = root.findall("./xmlns:text/xmlns:body/xmlns:div[@type='commetnary']", namespaces={'xmlns':'http://www.tei-c.org/ns/1.0'})
	    if len(commentary_nodes) > 0: 
	    	# Remove head node if exists (text nodes vary)
		if commentary_nodes[0].find("./xmlns:head", namespaces={'xmlns':'http://www.tei-c.org/ns/1.0'}) is not None:
			head = commentary_nodes[0].find("./xmlns:head", namespaces={'xmlns':'http://www.tei-c.org/ns/1.0'})
			commentary_nodes[0].remove(head)
	  	commentary_node = unicode(etree.tostring(commetnary_nodes[0], encoding="UTF-8", method="text"), 'utf-8')
	    else:
	    	commentary_node = None
	except:
	  pass

	if title != None:
	  #print "Inserting into db"
	  cur.execute('INSERT INTO inscription (title, description, location, lat, long) VALUES (?, ?, ?, ?, ?);', (title, description, u'', 0.0, 0.0))
	  inscription_id = cur.lastrowid
	  cur.execute('INSERT INTO inscription_project (project_id, inscription_id) VALUES (?, ?)', (proj_id, inscription_id))
	  cur.execute('INSERT INTO inscription_country (inscription_id, country_id) VALUES (?, ?)', (proj_id, country_id))

	  if translation_node is not None:
	    	print "Added translation node"
		cur.execute('INSERT INTO inscription_text (inscription_id, type, content) VALUES (?, ?, ?)', (inscription_id, Inscription.TRANSLATION, translation_node))

	  if text_node is not None:
	    	print "Added text node"
		cur.execute('INSERT INTO inscription_text (inscription_id, type, content) VALUES (?, ?, ?)', (inscription_id, Inscription.TEXT, text_node))

	  if bib_node is not None:
	    	print "Added bibliographic node"
		cur.execute('INSERT INTO inscription_text (inscription_id, type, content) VALUES (?, ?, ?)', (inscription_id, Inscription.BIBLIOGRAPHY, bib_node))

	  if commentary_node is not None:
	    	print "Added commentary node"
		cur.execute('INSERT INTO inscription_text (inscription_id, type, content) VALUES (?, ?, ?)', (inscription_id, Inscription.COMMENTARY , commentary_node))

	  con.commit()

	if proj_thumb != '':

#	 try:
	   photo_nodes = None

	   if(root.tag == "TEI.2"):
	     photo_nodes = root.findall("./text/body/div[@n='photographs']/p/figure")
	   else:
	     photo_nodes = root.findall("./xmlns:text/xmlns:body/xmlns:div[@n='photographs']/xmlns:p/xmlns:figure/xmlns:graphic", namespaces={'xmlns':'http://www.tei-c.org/ns/1.0'})

	   for photo in photo_nodes:
	      url = None
	      if(root.tag == "TEI.2"):
	   	url = photo.attrib['href']
	 	if photo.find("./figDesc"):
			node = photo.find("./figDesc")
			desc = node.text 
		else:
	      		desc = ""
	      else:
	        url = photo.attrib['url']
	 
	 	if photo.find("./head"):
			node = photo.find("./head")
			desc = node.text 
		else:
	      		desc = ""

	      cur.execute('INSERT into inscription_photo (inscription_id, thumb_url, full_url, title) VALUES (?, ?, ?, ?)', (inscription_id, proj_thumb + url + '.jpg', proj_full + url + '.jpg', desc))
	      #cur.execute('INSERT into inscription_photo_full (inscription_id, photo_url, title) VALUES (?, ?, ?)', (inscription_id, proj_full + url + '.jpg', desc)) 
	      con.commit()

	inscription_count += 1

    print "Number of Inscriptions: ", str(inscription_count)
    total_inscriptions += inscription_count
  


print "Created database with ", str(total_inscriptions), " inscriptions"

#	 except:
#		pass	
#  try:
#    name_nodes = root.findall("./text/body/div[@n='text']/ab//persName")
#    for name_node in name_nodes:
#    	print name_node.text,
#	print " (", name_node.attrib['key'], ")"
#  except:
#  	pass

con.commit()

