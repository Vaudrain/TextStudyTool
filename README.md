# Text factor investigation tool

There are a number of Requirements that must be fulfilled before the code can be ran and
utilised properly; you must own a Gamepad of some variety, the most consistently well supported
devices are Microsoft Xbox controllers, though Sony Playstation Controllers have been proven to
work too. Additionally your computer must have installations of the following:

1. MongoDB - https://www.mongodb.com
2. nodejs - https://nodejs.org
3. npm - https://www.npmjs.com
4. One or more Web Browsers, preferably Chrome based, though Firefox can work on some
Operating Systems - this is due to HTML5 Gamepad API support being poorly documented
between systems.

Please note that there may be some compatibility issues with dictionaries if your computers file
system is not case sensitive.
In order to set up the Server to host locally, do the following:
1. Run the MongoDB database (mongod in Linux terminal, mongod.exe on Windows)
  - If you have not already, run npm install to install node dependencies
2. Run node server.js - you may need to elevate privileges to do this, as the server listens on
ports 80 and 443

The server is now hosting locally (and online if you have these ports forwarded from your
machine), you can access the website by navigating to localhost in your browser. You may now
sign up, this will also allow you to view the site and take part in tests. You will not see anything
on the statistics page until a test has been completed.
In order to partake in a test you will need your controller connected to the computer, you
will receive a warning if the HTML5 Gamepad API has not been able to properly recognise your
device; if this happens, please try a different browser, device or Operating System until this is not
the case (This compatibility issue is beyond my control). Once you have completed a test, you
will need to wait for the 45th minute of the hour (e.g. 11:45,12:45), when the scheduled cron job
recalculates statistics, at which point you will be able to see single-point graphs on the statistics
page. Performing more tests will extend this graph, and performing tests on multiple accounts will
add more points at each interval. Additionally, if you wish to test the email capability of the server,
you will need to wait half a week, at which point you will receive an automated email when the
cron job fires.

## Example files

There are example token sets in `Back End/Dictionaries`, and example interface schema in `User Environment/Test Environment` to alow for a quickstart.