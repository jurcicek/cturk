#!/usr/bin/perl
# Auto approve Validation and the corresponding Transcription HITs
#   Set both Validation the the corresponding HIT's status in the database to 5.

use strict;
use warnings;
use LWP::UserAgent;
use HTTP::Request;
use DBI;
use XML::Simple;
use Data::Dumper;
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
my $approveAssignmentUrl = getWebServiceUrl()."/requesters/approveAssignment";

my $updateValidationSth = $dbh->prepare(qq{
    UPDATE cturk_list2
    SET status = 5, AssignmentStatus = 'Approved'
    WHERE id = ?
});

my $updateTranscriptionSth = $dbh->prepare(qq{
    UPDATE cturk_list
    SET status = 5, AssignmentStatus = 'Approved'
    WHERE id = ?
});

my $updateTranscriptionSth2 = $dbh->prepare(qq{
    UPDATE cturk_list
    SET status = 4
    WHERE id = ?
});

my $searchSth = $dbh->prepare("
	SELECT id, trans_id, trans_AssignmentId, path, status, hitid, hittypeid, AssignmentId, AssignmentStatus, WorkerId, Answers, StdAnswers
    FROM cturk_list2 WHERE status = 3");
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
	my $answers = $ref->{'Answers'};
	my $stdAnswers = $ref->{'StdAnswers'};
	&approveAssignment($id, $transId, $transAssignmentId, $path, $status, $hitId, $hitTypeId, $assignmentId, $assignmentStatus, $workerId, $answers, $stdAnswers);
}

sub approveAssignment(){
	my($id, $transId, $transAssignmentId, $path, $status, $hitId, $hitTypeId, $assignmentId, $assignmentStatus, $workerId, $answers, $stdAnswers)=@_;
    $answers = XMLin($answers, KeepRoot => 1, ForceArray => 1);
	
	my $arg = {
		'_username' => getUsername(),
		'_password' => getPassword(),
		'_DEFAULT_AJAX_RETURN' => 'XML',
		'assignmentId'=>$assignmentId,
		'message'=>'autoApprove'
	};
    my $resp = $ua->post($approveAssignmentUrl,$arg,'Content_Type' => 'form-data');
	if($resp->is_success){
		my $content = $resp->content;
		print $content."\n";
		
		my $xmlData = XMLin($content, KeepRoot => 1, ForceArray => 1);
		my $isSuccess = $xmlData->{"think"}[0]->{"status"}[0];
		if($isSuccess eq "1"){
			# set validation task status = 5, finish
			$updateValidationSth->execute($id);
			$dbh->commit;
		
			# approve or reject transcription hit
			my $answersLength = 0;
			my $errorCount = 0;
			while ($answers->{"Answers"}[0]->{"Answer"}[$answersLength]) {
				if($answers->{"Answers"}[0]->{"Answer"}[$answersLength]->{"key"}[0] eq 0){
					$errorCount++;
				}
				$answersLength++;
			}
			if(isApproveTransHit($errorCount-1, $answersLength-3)){#approve transcription task: $transAssignmentId
				
				my $arg2 = {
					'_username' => getUsername(),
					'_password' => getPassword(),
					'_DEFAULT_AJAX_RETURN' => 'XML',
					'assignmentId'=>$transAssignmentId,
					'message'=>'autoApprove'
				};
				my $resp2 = $ua->post($approveAssignmentUrl,$arg2,'Content_Type' => 'form-data');
				if($resp2->is_success){
					my $content2 = $resp2->content;
					print $content2."\n";
					
					my $xmlData2 = XMLin($content2, KeepRoot => 1, ForceArray => 1);
					my $isSuccess2 = $xmlData2->{"think"}[0]->{"status"}[0];
					if ($isSuccess2 eq "1") {
						# set transcription task status = 5, finish
						$updateTranscriptionSth->execute($transId);
						$dbh->commit;
						
					}else{
						print "[ERROR] approve transcription task error: id=$transId\n";
					}
				}
			
			}else{
				# set transcription task status = 4, exec reject.pl, loadhits.pl
				$updateTranscriptionSth2->execute($transId);
				$dbh->commit;
			}
		
		}else{
			print "[ERROR] approve validation task error: id=$id\n";
		}
	}
}

$dbh->commit();
$dbh->disconnect();
