Displait
========

Local storage based windowed dashboard. Nothing special.

However
-------

Provided the web page doesn't explicitly send "X-Frame-Options: SAMEORIGIN" response header, you can display any web page in any of the windows (Google does this and you can't display it).
Once the window is loaded, you can do the following:
* Move it around by dragging the collapsible handle
* Resize it by dragging the handle in the lower right corner of the window
* Rename and change its destination URL
* Force refresh every 30 seconds
* Change the render of the window

How to deploy
-------------

There is no back end (which is why I don't even call this an application) so deployment is really easy: just copy and paste it wherever you wish.

### Local deployment:
Just fetch and unpack the zip or check out the project and navigate to the index.html file from your browser.
NOTE: non http(s) protocols in Internet Explorer browsers don't provide localStorage, which is crucial for this project (hint: chose a different browser if all else fails). In our case, if we navigate to a file, the protocol will be file:// which is no good for IE.

### Web server
Copy the contents of project to your server and visit the URL you've set up.


Why no backend?
---------------

Because it's trouble for a project like this. Rationale sounds something like this: it's your dashboard, no need for anyone else to see what you see.
This doesn't mean it's impossible to add it at any point! Project is open source and JS is not that bad, so you can pretty easily locate the functions that would need to propagate the data to a backend of your choice.

### But I still need to see it on two different devices
Working on it. No worries, it will be here in a matter of days. For the time being you can use some JS skills to copy contents of the localStorage to another device.

Working on:
-----------

* Import/Export


Renders?
--------

Think custom window types. You can find a couple in this project, and they can serve as a reference, however here is a bit more detailed and a bit more technical spec of what is a render:

* Use whatever notation you wish, just make sure:
 * The render object is available on the window object
 * The render has a unique id (maybe author's custom prefix helps with possible clashes?), it's exposed publicly on the object and the value is the name of the object
 * The render registers its id into the 'displait-config' renders object in localStorage or the main app will ignore it (see example in feedburnerrender.js)
 * The render has a name that will be displayed in the dropdown when creating or modifying windows
 * The render has ready boolean property that describes whether the render has finished its initialization
 * The render has an object called options
  * Which has method 'always(windowElement, optionsElement)' that gets called every time the options get constructed
  * A field 'elements', which is a list of actions that will get added to the options menu; each has to have these fields:
   * 'selector' string (will be added to the classes of the option element)
   * 'text' string (will be displayed in the options menu)
   * 'handler' function (that will be called when user clicks on the option)
* The render object provide these methods:
 * 'constructWindowSupplements(windowObject, windowElement)' that gets ran every time the window is constructed, so that the custom behaviour can be initialized (if needed)
 * 'getContent(windowObject)' that returns html string that will hold the contents of the url (or whatever you wish, to be honest)
 * 'resize(ev, ui, windowElement)' that gets called every time user stops the resizing action, so you can update the content element(s)