#!/bin/sh
# Publish Transcription HIT, get result from MTurk, auto check, reject and republish.
DIRNAME=`dirname $0`;
perl5.8.9 $DIRNAME/perl/loadhits.pl
perl5.8.9 $DIRNAME/perl/getresults.pl
perl5.8.9 $DIRNAME/perl/autocheck.pl
perl5.8.9 $DIRNAME/perl/approveWithValidation.pl
perl5.8.9 $DIRNAME/perl/reject.pl
perl5.8.9 $DIRNAME/perl/loadhits.pl

# Publish Validation HIT, get result from MTurk, auto check, reject and republish or approve both Validation HITs and the corresponding Transcription HIT
perl5.8.9 $DIRNAME/perl/2/loadhits2.pl
perl5.8.9 $DIRNAME/perl/2/getresults2.pl
perl5.8.9 $DIRNAME/perl/2/autocheck2.pl
perl5.8.9 $DIRNAME/perl/2/approve2.pl
perl5.8.9 $DIRNAME/perl/2/reject2.pl
perl5.8.9 $DIRNAME/perl/2/loadhits2.pl
perl5.8.9 $DIRNAME/perl/reject.pl
perl5.8.9 $DIRNAME/perl/loadhits.pl
