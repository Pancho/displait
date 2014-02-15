Displait
========

Local storage based windowed dashboard. Nothing special.

However
-------

Provided the web page doesn't explicitly send "X-Frame-Options: SAMEORIGIN" response header, you can display any web page in any of the windows.
One the window is loaded, you can do the following:
* Move it around by dragging the collapsible handle
* Resize it by dragging the handle in the lower right corner of the window
* Rename and change its destination URL
* Force refresh every 30 seconds
* Change the render of the window (see what I'm still working on)

How to deploy
-------------

There is no back end (which is why I don't even call this an application) so deployment is really easy: just copy and paste it wherever you wish.

### Local deployment (Windows):
Just fetch and unpack the zip or check out the project and navigate to the index.html file from your browser.
NOTE: non http(s) protocols in Internet Explorer browsers don't provide localStorage, which is crucial for this project (hint: chose a different browser if all else fails). In our case, if we navigate to a file, the protocol will fe file:// which is no good for IE. 


### Web server
Copy the contents of project to your server and visit the mapped URL


Why no backend?
---------------

Because it's trouble for a project like this. Rationale sounds something like this: it's your dashboard, no need for anyone else to see what you see.
This doesn't mean it's impossible to add it at any point! Project is open source and JS is not that bad, so you can pretty easily locate the functions that would need to propagate the data to a backend of your choice.

### But I still need to see it on two different devices
Working on it. No worries, it will be here in a matter of days. For the time being you can use some JS skills to copy contents of the localStorage to another device.

Working on:
-----------

* Renders - custom window behaviour (will document it and provide examples)
* Import/Export