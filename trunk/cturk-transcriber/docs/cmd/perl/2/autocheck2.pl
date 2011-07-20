#!/usr/bin/perl
# Auto check user's answers by comparing with the randomly added standard answers.  (For those HITs whose status are 2)
# If auto check approves, set HIT's status in the database to 3
# else, set HIT's status in the database to 4

use strict;
use warnings;
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

sub pstr($){
    my $string = shift;
    $string =~ s/[^A-Za-z0-9\'() ]//g;
    $string =~ s/ {2,}/ /g;
    $string =~ s/^\s+//;
    $string =~ s/\s+$//;
    return $string;
}

do "$cwd/config2.pl";
my $dbh = getDBI();

my $searchSth = $dbh->prepare("SELECT id, Answers, StdAnswers FROM cturk_list2 WHERE status = 2");
$searchSth->execute();

my $ref;
while($ref = $searchSth->fetchrow_hashref()){
    my $id = $ref->{'id'};
    my $answers;
    my $stdAnswers;
    eval {
        $answers = XMLin($ref->{'Answers'}, KeepRoot => 1, ForceArray => 1);
        $stdAnswers = XMLin($ref->{'StdAnswers'}, KeepRoot => 1, ForceArray => 1);
    };
    my $isReject = 0; # 0=approve; 1=reject
    if($@){
        $isReject = 1;
    }else{
        #print Dumper($answers);

        my $answersLength = 0;
        my %answersHash;
        while ($answers->{"Answers"}[0]->{"Answer"}[$answersLength]) {
            my $key = $answers->{"Answers"}[0]->{"Answer"}[$answersLength]->{"key"}[0];
            my $value = $answers->{"Answers"}[0]->{"Answer"}[$answersLength]->{"value"}[0];
            $answersHash{$key} = $value;
            $answersLength++;
        }
        
        my $stdAnswersLength = 0;
        my %stdAnswersHash;
        while ($stdAnswers->{"QuestionFormAnswers"}[0]->{"Answer"}[$stdAnswersLength]) {
            #print $stdAnswers->{"QuestionFormAnswers"}[0]->{"Answer"}[$stdAnswersLength]->{"QuestionIdentifier"}[0];
            #print "=";
            #print $stdAnswers->{"QuestionFormAnswers"}[0]->{"Answer"}[$stdAnswersLength]->{"FreeText"}[0]."\n";
            my $key = $stdAnswers->{"QuestionFormAnswers"}[0]->{"Answer"}[$stdAnswersLength]->{"QuestionIdentifier"}[0];
            my $value = $stdAnswers->{"QuestionFormAnswers"}[0]->{"Answer"}[$stdAnswersLength]->{"FreeText"}[0];
            $stdAnswersHash{$key} = $value;
            $stdAnswersLength++;
        }
    
        #compare %stdAnswersHash with %answersHash
        # my $isReject = 0; # 0=approve; 1=reject
        my $aValue;
        foreach $aValue(keys(%stdAnswersHash)){
            #print "$aValue=$stdAnswersHash{$aValue}\n";
            #print "$aValue=$answersHash{$aValue}\n";
            #print "====\n";
            if(pstr(lc($stdAnswersHash{$aValue})) ne ""){
                if(pstr(lc($stdAnswersHash{$aValue})) ne pstr(lc($answersHash{$aValue}))){
                    $isReject = 1;
                }
            }
        }
        #print "isReject = ".$isReject;
    }
    if($isReject == 1){
        #TODO set status = 4
        my $sql = $dbh->prepare("UPDATE cturk_list2 SET status = 4 WHERE id=$id");
        $sql->execute();
    }else{
        #TODO set status = 3
        my $sql = $dbh->prepare("UPDATE cturk_list2 SET status = 3 WHERE id=$id");
        $sql->execute();
    }
}

$dbh->commit();
$dbh->disconnect();
