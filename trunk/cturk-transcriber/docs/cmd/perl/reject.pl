#!/usr/bin/perl5.8
# If HIT's status in the database is 4, then Reject a Transcription HIT and set its status to 5, and create another Transcription HIT (of the same data). The newly created HIT's status in the database is 0.

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

do "$cwd/config.pl";
my $dbh = getDBI();

my $ua = LWP::UserAgent->new();
my $rejectAssignmentUrl = getWebServiceUrl()."/requesters/rejectAssignment";

sub rejectAssignment(){
	my($id, $path, $status, $hitId, $hitTypeId, $assignmentId, $assignmentStatus, $workerId, $stdAnswers, $audioLength, $publishDate)=@_;
	my $arg = {
		'_username' => getUsername(),
		'_password' => getPassword(),
		'_DEFAULT_AJAX_RETURN' => 'XML',
		'assignmentId'=>$assignmentId,
		'message'=>'autoReject'
	};
	my $resp = $ua->post($rejectAssignmentUrl,$arg,'Content_Type' => 'form-data');
	if($resp->is_success){
		my $content = $resp->content;
		print $content."\n";
		
		my $xmlData = XMLin($content, KeepRoot => 1, ForceArray => 1);
		my $isSuccess = $xmlData->{"think"}[0]->{"status"}[0];
		if($isSuccess eq "1"){
			my $updateSth = $dbh->prepare("
				UPDATE cturk_list
				SET status = 1, AssignmentStatus = 'Rejected'
				WHERE id = $id");
			$updateSth->execute();
		
			#my $insertSth = $dbh->prepare(qq{
			#	INSERT INTO cturk_list(path, status, StdAnswers, audioLength)
			#	VALUES(?, ?, ?, ?)
			#});
			#$insertSth->execute($path, '0', $stdAnswers, $audioLength);
		}else{
			print "[ERROR] reject error: id=$id\n";		
		}
	}
}

my $searchSth = $dbh->prepare("
	SELECT id, path, status, hitid, hittypeid, AssignmentId, AssignmentStatus, WorkerId, StdAnswers, audioLength, publishDate
	FROM cturk_list WHERE status = 4");
$searchSth->execute();

my $ref;
while($ref = $searchSth->fetchrow_hashref()){
	my $id = $ref->{'id'};
	my $path = $ref->{'path'};
	my $status = $ref->{'status'};
	my $hitId = $ref->{'hitid'};
	my $hitTypeId = $ref->{'hittypeid'};
	my $assignmentId = $ref->{'AssignmentId'};
	my $assignmentStatus = $ref->{'AssignmentStatus'};
	my $workerId = $ref->{'WorkerId'};
	my $stdAnswers = $ref->{'StdAnswers'};
	my $audioLength = $ref->{'audioLength'};
	my $publishDate = $ref->{'publishDate'};
	&rejectAssignment($id, $path, $status, $hitId, $hitTypeId, $assignmentId, $assignmentStatus, $workerId, $stdAnswers, $audioLength, $publishDate);
}

$dbh->commit;
$dbh->disconnect;
