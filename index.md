---
layout: default
title: Web-based financial data visualisation
---

Welcome to the [Australian Greens Open Economy Project][1] – beta release. This
program offers a new way to explore government budgets and spending, and compare
them with corporations and other financial entities at various scales and time
periods. You can play around with the budget data we’ve loaded, or have a go at
creating your own models to share.

[1]: http://scott-ludlam.greensmps.org.au/openeconomy "Australian Greens Open Economy Project"

NAVIGATION
----------

When you first arrive at the Open Economy project you’ll see a couple of
pie-chart looking things sitting in space: these are financial models to scale,
in Australian dollars. You can zoom and scroll around through this imaginary
financial space using the mouse wheel or the magnifying glass icons top right.

THE FINANCIAL ENTITIES...
----------------------

These are not pie charts: they are actually an overlay of four important values
for any financial entity. On the left side is the balance sheet: the assets and
liabilities, with an indicator as to the net debt or equity. On the right side
is the budget: the revenue and expenses, again with an indicator as to the
surplus or deficit of the model. At any time you can grab a model and move it
around the place.

...AND THEIR INTERNAL WORKINGS
------------------------------

Double click on any of these quadrants to display that side of the model – the
balance sheet or the budget. Double click on one of the halves and it will
display that value alone. Double click once more and it expands to reveal its
component parts – provided the data is there. Anything with an ellipsis (...)
is telling you it contains more data. Note that as you’re clicking away on
things, the 'info' panel on the right is showing what you’ve clicked on and its
value, and maybe a hyperlink or annotation if the data is there.

At any time you can right click on a model to get some context-sensitive options
– generally reset, scale or delete. If you’ve got the balance sheet or budget
halves displayed, you can right click to 'expand both' – for example, to be able
to unfold taxes and spending at the same time.

FINANCIAL SPACE AND TIME
------------------------

These models are infinitely scalable in financial space/time – if the data is
there, you can roll backward and forward through financial years and you should
see the models change as their values change.

If you see a model go grey, it means you’ve passed out of a date range for which
there’s data. If you see a model disappear behind a white halo, it means you’ve
made it too small to see; the halo is to remind you that it’s still there.

WHAT’S ON THE MENU?
------------------

1.	Click 'Load' in the sidebar
2.	Select a model
3.	Hit the green tick
4.	Click to drop it somewhere on the screen

These are our pre-built models. If you’re inclined, you can also hit 'save' and the models will be drawn either as a vector (layered SVG format) or raster (PNG format) for fooling around with in a graphics package or pasting into a document. 

COULD THIS POSSIBLY BE MORE FUN?
--------------------------------

Yes, yes it could. We’ve pre-loaded a limited number of models to get things
started, but the fact is, they’re a drop in a deep ocean. You can very easily
register on the site and get cracking with your own models of what interests
you. There are a few [very basic rules](spreadsheet.html) of data entry into a
spreadsheet – you can download [a couple of samples](spreadsheet.html#examples)
- and then you’re away. Anything you cook up that you think others might like,
email us and we can add it to the public library.

To load your own model
1.	Register on the website
2.	Create a spreadsheet in the [Open Economy format](spreadsheet.html). You can include spending from multiple years, and/or have income and expenditure side by side, up to the four-quadrant model if you have the data.
3.	Upload the spreadsheet and take a look

The code for the model is open-source; if you’re technically minded and see
something that could use a fix or an extension, you’re overwhelmingly welcome to
[get your hands dirty](http://github.com/daxtens/finvis) and make this thing
better.

TELL OTHERS
-----------

Tell others about the [Australian Greens Open Economy Project][1]:

<div>
<a href="https://twitter.com/share" class="twitter-share-button"
data-url="http://openeconomy.org.au" data-text="See financial information in a whole new way:"
data-hashtags="openeconomy" data-size="large">Tweet</a>
<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document,'script', 'twitter-wjs');</script>
<br>
<iframe src="//www.facebook.com/plugins/like.php?href=http%3A%2F%2Fopeneconomy.org.au&amp;send=false&amp;layout=standard&amp;width=450&amp;show_faces=false&amp;font&amp;colorscheme=light&amp;action=recommend&amp;height=35&amp;appId=340738022718757" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:450px; height:35px;" allowTransparency="true">&nbsp;</iframe>
</div>

