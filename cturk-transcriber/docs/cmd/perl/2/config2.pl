#!/usr/bin/perl5.8
use strict;
use warnings;
use XML::Simple;
use DBI;
use Data::Dumper;
use Text::WagnerFischer qw(distance);
use Cwd;
use File::Basename;

my $cwd;
if ($0 =~ m{^/}) {
  $cwd = dirname($0);
} else {
  my $dir = getcwd();
  $cwd = dirname("$dir/$0");
}

my $data = XMLin("$cwd/../../../config.xml", KeepRoot => 1, ForceArray => 1);

sub getDBI{
	my $dbhost = $data->{"root"}[0]->{"mysql"}[0]->{"dbHost"}[0];
	my $dbname = $data->{"root"}[0]->{"mysql"}[0]->{"dbName"}[0];
	my $username = $data->{"root"}[0]->{"mysql"}[0]->{"dbUser"}[0];
	my $password = $data->{"root"}[0]->{"mysql"}[0]->{"dbPwd"}[0];
	my $port = $data->{"root"}[0]->{"mysql"}[0]->{"dbPort"}[0];
    return DBI->connect("DBI:mysql:$dbname:$dbhost:$port","$username","$password", {
        RaiseError => 1,
        AutoCommit => 0
    });
}

sub getUsername{
    return $data->{"root"}[0]->{"username"}[0];
}

sub getPassword{
    return $data->{"root"}[0]->{"password"}[0];
}

sub getWebServiceUrl{
    return $data->{"root"}[0]->{"webServiceUrl"}[0];
}

sub getCurrencyCode{
    return $data->{"root"}[0]->{"currencyCode"}[0];
}

sub getTranscriptionPrice{
    my ($audioLength) = @_;
    my $pricebar = sprintf("%d",($audioLength - 5 ) * 0.1);
    if ($pricebar < 1) {
        $pricebar = 1;
    }
	my $n = $data->{"root"}[0]->{"transcriptionPrice"}[0];
    return $pricebar * $n; # 0.1
}

sub getValidationPrice{
    my ($audioLength) = @_;
    my $n = $data->{"root"}[0]->{"validationPrice"}[0];
    my $price = sprintf("%.2f", getTranscriptionPrice($audioLength)/$n);
    return $price;
}

# Method to compare user's transcription and the standard answer. For auto check Transcription HIT
# param $allowedErrorCount is the threashold of the number of errors a user can make.
# param $src standard transcription
# param $dst user's transcription
# return 0 means rejection, while 1 means approve
sub isApproveHit{
    my $allowedErrorCount = 2;
    my ($src, $dst) = @_;
    print "True transcription: $src\nUser transcription: $dst\n\n";
    my $errorCount = 0;
    my @stdArr = split(/ /,$src);
    my @userArr = split(/ /,$dst);
    my $stdLen = @stdArr;
    my $userLen = @userArr;
    my $isApprove = 1;
    
    chomp($src);
    chomp($dst);
    
    if($dst =~ /\d/) {
        # imediately reject as the transcription should not contain any numbers
        print "Transcription: $dst  >>> was instantly rejected.\n\n";
	$isApprove = 0;
	return 0;
    }
    
    my $d = distance([0,1,1],$src,$dst);
    my $r = $d/(length($src)+1);
    print "Edits: $d  Rel. edits: $r \n\n";
    
    if($r > 0.3){
	$isApprove = 0;
    }

    if($r > 0.88 && length($src) > 10){
        print "Transcription: $dst  >>> was instantly rejected.\n\n";
	$isApprove = 0;
	return 0;
    }
    
    if($isApprove == 0){
	my $answer;
	while (1) {
    	    print "Do you want to accept this controled transcription?\n";
            print "[y/n] ";
	    $answer = <STDIN>;
    	    chomp($answer);
            $answer = lc($answer);
	    last if ($answer =~ /^(y|n)$/);
	}
	$isApprove = ($answer eq "y");
    }

    return $isApprove;
}

# Method to auto approve Transcription HIT. 
# param $errorCount Number of errors a user has made to a Transcription HIT, this value comes from auto check of the corrresponding Validation HITs. 
# param $total Total number of transcriptions of a Transcription HIT
# return 0 means rejection, while 1 means approve
sub isApproveTransHit{
    my ($errorCount, $total) = @_;
    if($errorCount/$total>1/4 || $errorCount>2){
        return 0;
    }else{
        return 1;
    }
}

# Set targeting Amazon MTurk publishing URL
sub getServiceUrl{
    # my $serviceUrl = 'http://mechanicalturk.sandbox.amazonaws.com/?Service=AWSMechanicalTurkRequester';
    # my $serviceUrl = 'http://mechanicalturk.amazonaws.com/?Service=AWSMechanicalTurkRequester';
    return $data->{"root"}[0]->{"mturkServiceUrl"}[0];
}

sub getResourceRoot{
	return $data->{"root"}[0]->{"resourceRoot"}[0];
}

sub getWebappRoot{
	return $data->{"root"}[0]->{"webappRoot"}[0];
}

sub getWebappUrl{
	return $data->{"root"}[0]->{"webappUrl"}[0];
}