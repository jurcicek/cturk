#!/usr/bin/perl
# If HIT's status in the database is 4, then Reject a Validation HIT and set its status to 5, and create another Validation HIT (of the same data). The newly created HIT's status in the database is 0.

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

do "$cwd/config2.pl";
my $dbh = getDBI();

my $ua = LWP::UserAgent->new();
my $rejectAssignmentUrl = getWebServiceUrl()."/requesters/rejectAssignment";

sub rejectAssignment(){
	my($id, $transId, $transAssignmentId, $path, $status, $hitId, $hitTypeId, $assignmentId, $assignmentStatus, $workerId, $stdQuestions, $stdAnswers, $audioLength)=@_;
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
				UPDATE cturk_list2
				SET status = 1, AssignmentStatus = 'Rejected'
				WHERE id = $id");
			$updateSth->execute();
		
			#my $insertSth = $dbh->prepare(qq{
			#	INSERT INTO  cturk_list2(trans_id, trans_AssignmentId, path, status, StdQuestions, StdAnswers, audioLength)
			#	VALUES(?, ?, ?, ?, ?, ?, ?)
			#});
			#$insertSth->execute($transId, $transAssignmentId, $path, '0', $stdQuestions, $stdAnswers, $audioLength);
		}else{
			print "[ERROR] reject error: id=$id\n";		
		}
	}
}

my $searchSth = $dbh->prepare("
	SELECT id, trans_id, trans_AssignmentId, path, status, hitid, hittypeid, AssignmentId, AssignmentStatus, WorkerId, StdQuestions, StdAnswers, audioLength
    FROM cturk_list2 WHERE status = 4");
$searchSth->execute();

my $ref;
while($ref = $searchSth->fetchrow_hashref()){
    my $id = $ref->{'id'};
	my $transId = $ref->{'trans_id'};
	my $transAssignmentId = $ref->{'trans_AssignmentId'};
	my $path = $ref->{'path'};
	my $status = $ref->{'status'};
	my $hitId = $ref->{'hitid'};
	my $hitTypeId = $ref->{'hittypeid'};
	my $assignmentId = $ref->{'AssignmentId'};
	my $assignmentStatus = $ref->{'AssignmentStatus'};
	my $workerId = $ref->{'WorkerId'};
	my $stdQuestions = $ref->{'StdQuestions'};
	my $stdAnswers = $ref->{'StdAnswers'};
	my $audioLength = $ref->{'audioLength'};
	&rejectAssignment($id, $transId, $transAssignmentId, $path, $status, $hitId, $hitTypeId, $assignmentId, $assignmentStatus, $workerId, $stdQuestions, $stdAnswers, $audioLength);
}

$dbh->commit;
$dbh->disconnect;
