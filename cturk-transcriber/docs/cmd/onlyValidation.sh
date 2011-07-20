#!/bin/sh
# Publish Validation HIT, get result from MTurk, auto check, reject and republish or approve both Validation HITs and the corresponding Transcription HIT
DIRNAME=`dirname $0`;
perl $DIRNAME/perl/2/loadhits2.pl
perl $DIRNAME/perl/2/getresults2.pl
perl $DIRNAME/perl/2/autocheck2.pl
perl $DIRNAME/perl/2/approve2.pl
perl $DIRNAME/perl/2/reject2.pl
perl $DIRNAME/perl/2/loadhits2.pl

perl $DIRNAME/perl/reject.pl
perl $DIRNAME/perl/loadhits.pl
