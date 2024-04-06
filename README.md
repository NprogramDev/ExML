# Easy Extended HTML / Easy Extended Markup Language / Easy XML

# ALPHA Version

A easier version of XML, where you don't need the < and > all the time. \

## General Syntax

Every block starts with $ (dollar sign) followed by the TagName \
Then it can be followed by a ! (exclamation mark) \
after the first ! (exclamation mark), the classNames are Listed, separated by , (comma)
if the className does include a comma, add a \ before it \
if you add another ! (exclamation mark), you can define the Id,
and after the third you can define the name.
To end the block you just use § without anything else \
To add Attributes to a block you write over the block a line with % (percent symbol) followed by the block attribute name and a = (equal sign), and the value of the attribute without the string " (quotes) The whole line is parsed as the string then.

## Simpler

### Auto Add

&lt;DOCTYPE html&gt;
&lt;html&gt;
&lt;body&gt;
&lt;/body&gt;
&lt;/html&gt; \
This is added Automatically, those above are added automatically

### Autoresolve

Tags, that often include files, but do not have content just get the filename in them, like: \
`$scirpt index.js § => <script type="application/javascript" src="index.js" > </script> ` \
or
`$link index.css § => <link rel="stylesheet" href="index.css" />`
Currently only those two are supported but more are following, like the HTML5 Elements
The files can also be listed, just by saperating them with a , (comma).

```
$link index.css §
$timeline-detail
    $timeline-content§
    $svg!timeline-detail-svg
        $g!timeline-content-area§
        $line!timeline-detail-line§
        $g!timeline-detail-scale§

    §
§
$p Why does this Work??§
$timeline-whole
    $svg!timeline-whole-svg
        %stroke=white
        %stroke-width=2
        $line!timeline-whole-line§
$$$
        %x=0
        $text!timeline-whole-start timeline-whole-index
        StartIndex
        §

        $text!timeline-whole-end timeline-whole-index
        EndIndex
        §
$$$
        $rect!timeline-whole-cursor-box§
        $g!timeline-whole-scale§
    §
§

$script color.js;data.js;wholeTimeline.js;index.js;detailTimeline.js§
```
