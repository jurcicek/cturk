#!/usr/bin/perl5.8
# If HIT's status in the database is 0, then publish the Transcription HIT to Amazon MTurk, and then set its status in the database to 1.

use strict;
use warnings;
use LWP::UserAgent;
use HTTP::Request;
use XML::Simple;
use Data::Dumper;
use DBI;
use Cwd;
use File::Basename;

my $cwd;
if ($0 =~ m{^/}) {
  $cwd = dirname($0);
} else {
  my $dir = getcwd();
  $cwd = dirname("$dir/$0");
}

# print "Content-type: text/html\n\n";
do "$cwd/config.pl";
my $dbh = getDBI();

my $ua = LWP::UserAgent->new();
my $createHitUrl = getWebServiceUrl()."/requesters/createHIT";

my $updateSth = $dbh->prepare(qq{
    UPDATE cturk_list
    SET hitid = ?, hittypeid = ?, publishDate = ?, status = 1
    WHERE id = ?
});

sub requesterCreateHit(){
	my($id, $arg)=@_;
	my $resp = $ua->post($createHitUrl,$arg,'Content_Type' => 'form-data');
	if($resp->is_success){
		my $content = $resp->content;
		print $content;
		#hitId hitTypeId publishDate checkDate
		#id    group_id
		my $data = XMLin($content, KeepRoot => 1, ForceArray => 1);
		my $isSuccess = $data->{"think"}[0]->{"status"}[0];
		if($isSuccess eq "1"){
			my $hitId = $data->{"think"}[0]->{"data"}[0]->{"id"}[0];
			my $hitTypeId = $data->{"think"}[0]->{"data"}[0]->{"group_id"}[0];
			
			my ($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst) = localtime(time());
			$year += 1900;
			$mon = sprintf("%02d", $mon + 1);
			$mday = sprintf("%02d", $mday);
			my $publishDate = "$mday$mon$year";
			
			my $updateSth = $dbh->prepare("
				UPDATE cturk_list
				SET hitId = '$hitId', hitTypeId = '$hitTypeId', publishDate = '$publishDate', status = 1
				WHERE id = '$id'
			");
			$updateSth->execute();
		}else{
			print "[ERROR] create transcription HIT error: id=$id\n";
		}
	}
}


my $expireDate = time()*1000+1000*60*60*24*7;#=1 week
sub createHit(){
	#assignmentTime, autoApprovalTime, description, expireDate, frameHeight, name, reward, url
	my($id, $audioLength)=@_;
	my $hitArg = {
		'_username' => getUsername(),
		'_password' => getPassword(),
		'_DEFAULT_AJAX_RETURN' => 'XML',
		'assignmentTime' => 60*100, #seconds
		'autoApprovalTime' => 60*60*24*7, #seconds
		'description'=>"Listen to the below dialogue and transcribe the USER audio to text by clicking the triangle play button. The System prompt text is just to give you an idea of the context and you don't need to do anything to it. A detailed description of how to deal with digits, punctuation, noise etc. can be <a href=\"".getWebappUrl()."/howToTranscribeSpeech.html\" target=\"_blank\">found here</a>. Please read carefully before starting to transcribe the audio!",
		'expireDate'=> $expireDate, #timestamp, milliseconds
		'frameHeight'=>1200,
		'name'=>"Listen to audio and input the corresponding text. (transcription)",
		'currencyCode'=> getCurrencyCode(),
		'reward'=> getTranscriptionPrice($audioLength),
		'url'=> getWebappUrl()."/start.html?id=$id",
	};
	
	print "\nCreate HIT: id=$id\n";
	&requesterCreateHit($id, $hitArg);
}

my $searchSth = $dbh->prepare("SELECT id, audioLength FROM cturk_list WHERE status = 0 AND `StdAnswers` != ''");
$searchSth->execute();

my $ref;
while($ref = $searchSth->fetchrow_hashref()){
    my $id = $ref->{'id'};
    my $audioLength = $ref->{'audioLength'};
    
	&createHit($id, $audioLength);
}

$dbh->commit;
$dbh->disconnect;
