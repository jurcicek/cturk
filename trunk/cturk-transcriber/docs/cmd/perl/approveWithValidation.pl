#!/usr/bin/perl5.8
# Record user's answers, then generate Validation HITs.
#     Record user's answers in user-transcription-all.xml, including user's answers to the 3 randomly added answers. 
#     Generate user-transcription.xml, which is in the same format as session-fix.xml, but with user's transcription answers. (without those to the 3 randomly added answers).  
#   Set HIT's status in the database to 31.

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

do "$cwd/config.pl";
my $dbh = getDBI();

my $updateSth = $dbh->prepare(qq{
    UPDATE cturk_list
    SET status = 31
    WHERE id = ?
});

my $insertSth = $dbh->prepare(qq{
    INSERT INTO cturk_list2(trans_id, trans_AssignmentId, path, status, StdQuestions, StdAnswers, audioLength)
    VALUES(?, ?, ?, 0, ?, ?, ?)
});

my $searchSth = $dbh->prepare("
	SELECT id, path, status, hitid, hittypeid, AssignmentId, AssignmentStatus, WorkerId, audioLength, Answers, StdAnswers
            FROM cturk_list
			WHERE status = 3");
$searchSth->execute();

my $ref;
while($ref = $searchSth->fetchrow_hashref()){
    my $id = $ref->{'id'};
	my $path = $ref->{'path'};
	my $hitId = $ref->{'hitid'};
	my $assignmentId = $ref->{'AssignmentId'};
    my $audioLength = $ref->{'audioLength'};
	my $answers = $ref->{'Answers'};
	my $stdAnswers = $ref->{'StdAnswers'};
	&approveAssignment($id, $path, $hitId, $assignmentId, $audioLength, $answers, $stdAnswers);
}

# the error question's index, range=[0, length-1]
my $errorQuestionIndex = 0;
my $errorQuestionKey = "";
my $rightAnswer;

sub getStdAnswers{
    my($str1) = @_;
    my $str1Length = 0;
    while ($str1->{"QuestionFormAnswers"}[0]->{"Answer"}[$str1Length]) {
        $str1Length++;
    }
    $errorQuestionIndex = int(rand($str1Length));
    $rightAnswer = $str1->{"QuestionFormAnswers"}[0]->{"Answer"}[$errorQuestionIndex]->{"FreeText"}[0];
    #do{
    #    $errorQuestionIndexReplace = int(rand($str1Length));
    #}while($errorQuestionIndex == $errorQuestionIndexReplace || $str1->{"QuestionFormAnswers"}[0]->{"Answer"}[$errorQuestionIndex]->{"FreeText"}[0] eq $str1->{"QuestionFormAnswers"}[0]->{"Answer"}[$errorQuestionIndexReplace]->{"FreeText"}[0]);
    
    #print "errorQuestionIndex=".$errorQuestionIndex."\n";
    #print "errorQuestionIndexReplace=".$errorQuestionIndexReplace."\n";
    #print "answer=".$str1->{"QuestionFormAnswers"}[0]->{"Answer"}[$errorQuestionIndex]->{"FreeText"}[0]."\n";
    my $i=0;
    while ($str1->{"QuestionFormAnswers"}[0]->{"Answer"}[$i]) {
        $str1->{"QuestionFormAnswers"}[0]->{"Answer"}[$i]->{"FreeText"}[0] = 1;
        $i++;
    }
    my $string = $str1->{"QuestionFormAnswers"}[0]->{"Answer"}[$errorQuestionIndex]->{"QuestionIdentifier"}[0];
    my $f = rindex($string, "[") + 1;
    my $t = rindex($string,"]");
    $string = substr($string, 0, $t);
    $string = substr($string, $f);
    $errorQuestionKey = $string;
    print "errorQuestionKey = $errorQuestionKey\n";
    $str1->{"QuestionFormAnswers"}[0]->{"Answer"}[$errorQuestionIndex]->{"FreeText"}[0] = 0;
    return $str1;
}


sub getStdQuestions{
    my($xml, $stdAnswers) = @_;
    my $errorQuestionIndexReplace = 0;
    my $xmlLength = 0;
    while ($xml->{"dialog"}[0]->{"turn"}[$xmlLength]) {
        $xmlLength++;
    }
    #print "xmlLength = $xmlLength\n";
    
    my $wrongAnswer;
    do{
        $errorQuestionIndexReplace = int(rand($xmlLength));
        #print "errorQuestionIndexReplace = $errorQuestionIndexReplace\n";
        if($xml->{"dialog"}[0]->{"turn"}[$errorQuestionIndexReplace]->{"userturn"}[0]->{"transcription"}[0]){
            $wrongAnswer = $xml->{"dialog"}[0]->{"turn"}[$errorQuestionIndexReplace]->{"userturn"}[0]->{"transcription"}[0];
        }else{
            $wrongAnswer = $xml->{"dialog"}[0]->{"turn"}[$errorQuestionIndexReplace]->{"userturn"}[1]->{"transcription"}[0];
        }
        #print "wrongAnswer = $wrongAnswer\n";
    }while(!$wrongAnswer || $rightAnswer eq $wrongAnswer);

    #print "errorQuestionIndex=".$errorQuestionIndex."\n";
    #print "errorQuestionIndexReplace=".$errorQuestionIndexReplace."\n";
    #print "rightAnswer = $rightAnswer\n";
    #print "wrongAnswer = $wrongAnswer\n";
    
    my $randomAnswer = $xml->{"dialog"}[0]->{"turn"}[$errorQuestionIndexReplace]->{"userturn"}[0]->{"transcription"}[0];
    # get tempIndex
    my $tempIndex = 0;
    for(my $i=0; $i<$xmlLength; $i++){
        my $tLength = 0;
        while($xml->{"dialog"}[0]->{"turn"}[$i]->{"userturn"}[$tLength]->{"turnnum"}){
            $tLength++;
        }
        if($xml->{"dialog"}[0]->{"turn"}[$i]->{"userturn"}[$tLength-1]->{"turnnum"} eq $errorQuestionKey){
            $tempIndex = $i;
        }
    }
    $xml->{"dialog"}[0]->{"turn"}[$tempIndex]->{"userturn"}[0]->{"transcription"}[0] = $randomAnswer;
    return $xml;
}

sub approveAssignment(){
    my($id, $path, $hitId, $assignmentId, $audioLength, $answers, $stdAnswers)=@_;
    $answers = XMLin($answers, KeepRoot => 1, ForceArray => 1);
    $stdAnswers = XMLin($stdAnswers, KeepRoot => 1, ForceArray => 1);
    
    #eval {
    #    $mturk->ApproveAssignment( AssignmentId => $assignmentId );
    #    printf "Approved assignment %s\n", $assignmentId;
    #};
    #print "approve $id\n";
    #if ($@) {
    #    if ($mturk->response->errorCode eq "AWS.MechanicalTurk.InvalidAssignmentState") {
    #        print "Assignment $assignmentId has already been processed.\n";
    #    }
    #    else {
    #        die $@;
    #    }
    #}else{
        # save user's result to user-transcription.xml
        my $answersLength = 0;
        my %answersHash;
        while ($answers->{"Answers"}[0]->{"Answer"}[$answersLength]) {
            my $key = $answers->{"Answers"}[0]->{"Answer"}[$answersLength]->{"key"}[0];
            my $value = $answers->{"Answers"}[0]->{"Answer"}[$answersLength]->{"value"}[0];
            $answersHash{$key} = $value;
            $answersLength++;
        }

        my $sessionFileName = getResourceRoot()."/wav".$path."/session-fixed.xml";
        my $sessionFileNameCopy = getWebappRoot()."/data/wav".$path."/reference.xml";
        my $transcriptionFileName = getResourceRoot()."/wav".$path."/user-transcription.xml";
        my $transcriptionAllFileName = getWebappRoot()."/data/wav".$path."/user-transcription-all.xml";
        #=======================================
        #print $sessionFileName;
        my $sessionFile = XMLin($sessionFileName, KeepRoot => 1, ForceArray => 1);
        #print Dumper($sessionFile->{"dialog"}[0]->{"turn"});
        my $turnLength = 0;
        while ($sessionFile->{"dialog"}[0]->{"turn"}[$turnLength]) {
            $turnLength++;
        }
        #print $turnLength;
        for(my $i=0; $i<$turnLength; $i++){
            my $userturnLength = 0;
            while($sessionFile->{"dialog"}[0]->{"turn"}[$i]->{"userturn"}[$userturnLength]){
                my $userturnIndex = $sessionFile->{"dialog"}[0]->{"turn"}[$i]->{"userturn"}[$userturnLength]->{"turnnum"};
                if($userturnIndex && $answersHash{"userturn[$userturnIndex]"}){
                    my $value = $answersHash{"userturn[$userturnIndex]"};
                    $sessionFile->{"dialog"}[0]->{"turn"}[$i]->{"userturn"}[$userturnLength]->{"transcription"}[0] = $value;
                }
                $userturnLength++;
            }
            #print "=======================\n\n";
            #print "userturnLength = $userturnLength\n\n";
            #print "=======================\n\n";
        }
        open ( my $fd, ">$transcriptionFileName" )  || die "can't open file\n";
        my $xml_out = XMLout($sessionFile, outputfile => $fd, XMLDecl => '<?xml version="1.0" encoding="ISO-8859-1"?>', RootName => undef, NoEscape => 1);
        close $fd;
        #=======================================
        my $transcriptionAllFile = XMLin($sessionFileNameCopy, KeepRoot => 1, ForceArray => 1);
        my $transcriptionAllFileTurnLength = 0;
        while ($transcriptionAllFile->{"dialog"}[0]->{"turn"}[$transcriptionAllFileTurnLength]) {
            $transcriptionAllFileTurnLength++;
        }
        for(my $i=0; $i<$transcriptionAllFileTurnLength; $i++){
            my $userturnLength = 0;
            while($transcriptionAllFile->{"dialog"}[0]->{"turn"}[$i]->{"userturn"}[$userturnLength]){
                my $userturnIndex = $transcriptionAllFile->{"dialog"}[0]->{"turn"}[$i]->{"userturn"}[$userturnLength]->{"turnnum"};
                if($userturnIndex && $answersHash{"userturn[$userturnIndex]"}){
                    my $value = $answersHash{"userturn[$userturnIndex]"};
                    $transcriptionAllFile->{"dialog"}[0]->{"turn"}[$i]->{"userturn"}[$userturnLength]->{"transcription"}[0] = $value;
                }
                $userturnLength++;
            }
            #print "=======================\n\n";
            #print "userturnLength = $userturnLength\n\n";
            #print "=======================\n\n";
        }
        open ( my $fd2, ">$transcriptionAllFileName" )  || die "can't open file\n";
        my $xml_out2 = XMLout($transcriptionAllFile, outputfile => $fd2, XMLDecl => '<?xml version="1.0" encoding="ISO-8859-1"?>', RootName => undef, NoEscape => 1);
        close $fd2;
        #=======================================

        
        # set status = 31, then create a new hit2
        $updateSth->execute($id);
        $dbh->commit;
        
        my $stdAnswers2 = XMLout(getStdAnswers($stdAnswers), XMLDecl => '<?xml version="1.0" encoding="ISO-8859-1"?>', RootName => undef, NoEscape => 1);
        #my $sessionFileCopy = XMLin($sessionFileNameCopy, KeepRoot => 1, ForceArray => 1);
        my $stdQuestions2 = XMLout(getStdQuestions($transcriptionAllFile, $stdAnswers), XMLDecl => '<?xml version="1.0" encoding="ISO-8859-1"?>', RootName => undef, NoEscape => 1);
        
        $insertSth->execute($id, $assignmentId, $path, $stdQuestions2, $stdAnswers2, $audioLength);
        $dbh->commit;
        
        #TODO exec loadhit2
    #}
}

$dbh->commit();
$dbh->disconnect();