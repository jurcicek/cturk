#!/bin/sh
# Publish Transcription HIT, get result from MTurk, auto check, reject and republish or approve. (No Validation HIT)
DIRNAME=`dirname $0`;
perl $DIRNAME/perl/loadhits.pl
perl $DIRNAME/perl/getresults.pl
perl $DIRNAME/perl/autocheck.pl
perl $DIRNAME/perl/approve.pl
perl $DIRNAME/perl/reject.pl
perl $DIRNAME/perl/loadhits.pl
