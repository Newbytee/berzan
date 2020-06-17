# Berzan.js
## Introduction
Berzan.js is a specialised frontend for Novasoftware's schedule viewer and
 skolmaten.se's lunch viewer.

It is currently perpetually developed, with features being added and bugs fixed
 as I find the motivation and inspiration to. The goal is to make it work across
 as many devices as well as possible while maintaining its stability, speed, and
 features.

## Features 

* Schedule viewer
* Lunch viewer 
* Offline viewing of schedule (and soon lunch)
* Ability to set default class for schedule viewer
* User interface adapts to whatever device you're using

## Related sources

Code used for proxying API calls: https://gitlab.com/Newbyte/berzanjs-api-rs

## Guide to branches 

* master
  * Improvements/bugfixes land here first, but are not guaranteed to be of quality.
  * If you are interested in contributing to Berzan.js, this is the branch you should base your code on.
  * Hosted on [berzan.netlify.com](https://berzan.netlify.com)
    * Note that this is not recommended for daily usage, and due to Berzan.js' caching strategy you may end up only getting updates when a version bump is performed regardless. 
* gh-pages (meaning GitHub pages)
  * Code from master is merged in here when I consider it good enough. Code here should always be reliable
  * Hosted on [berzan.js.org](https://berzan.js.org) (recommended for daily usage)
* ie11-experiment
  * At one point I had the goal to get Berzan.js working in Internet Explorer 11. I didn't want to sacrifice some things code-wise, so I decided to make make a separate branch to determine how drastic the changes would have to be to support IE. Turns out Internet Explorer 11 did not only dislike my JavaScript, but also my CSS, so I gave up considering how bad this browser is overall and the limitations I would have to impose to support it. Kept for future reference.
  * Anyway, this branch contains the code that makes the JavaScript work in Internet Explorer 11. CSS does not render correctly.
* serviceworker-improvements
  * This was a branch I used when working on improving the broken hackjob that was my old service worker implementation.

## Third party code used
* Slideout.js
* Bootstrap's Reboot was used as base for the stylesheet.

## License 

Berzan.js is licensed under the Mozilla Public License Version 2. This license
 both imposes certain restrictions and gives you certain freedoms in regards to
 how you are allowed to use the code. See the file LICENSE or
 [this](https://www.mozilla.org/en-US/MPL/2.0/) for more information. 
