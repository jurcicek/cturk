AUTHOR: FILIP JURCICEK

This directory contains a python library and scripts which uses CTURK wevservices to access CTURK.

It is based on the description of the CTURK webservice in ../docs/WEBSERVICES.TXT

This code can:
- approve HITs
- reject HITs
- publish HITs
- expire HITs


The scripts assumess that there exists a file called '.loginInfo.txt' with login information and URL of the CTURK webservices.
The user name must be on the first line and the password on the second line.


E.g.:

fj@fj.com
password1111
http://xxx/~xxxx/cturk-task4/cturk/server/webroot

