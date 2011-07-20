#!/usr/bin/perl5.8
# Generate standard answers for auto check Transcription HITs
# Generate autocheck.xml from reference.xml

use strict;
use warnings;
use XML::Simple;
use Data::Dumper;

#print $ARGV[0];
my $path = $ARGV[0];

my $data;
eval {
    $data = XMLin("$path/reference.xml", KeepRoot => 1, ForceArray => 1);
};
if ($@) {#error
    print "[ERROR]Read XML file error: $path/reference.xml\n";
}else{
    #print Dumper($data);

    my $turnLength = 0;
    while ($data->{"dialog"}[0]->{"turn"}[$turnLength]) {
        $turnLength++;
    }
    #print $turnLength;

    #for(my $i=0; $i<$turnLength; $i++){
    #    if($data->{"dialog"}[0]->{"turn"}[$i]->{"userturn"}[0]->{"transcription"}){
    #        my $turnIndex = $data->{"dialog"}[0]->{"turn"}[$i]->{"userturn"}[0]->{"turnnum"};
    #        print "transcription[$turnIndex]=".$data->{"dialog"}[0]->{"turn"}[$i]->{"userturn"}[0]->{"transcription"}[0]."\n";
    #    }
    #}

    my $output;
    $output->{"QuestionFormAnswers"}[0]->{"xmlns"} = "http://mechanicalturk.amazonaws.com/AWSMechanicalTurkDataSchemas/2005-10-01/QuestionFormAnswers.xsd";
    my $answerIndex = 0;
    for(my $i=0; $i<$turnLength; $i++){
        my $j = 0;
        while($data->{"dialog"}[0]->{"turn"}[$i]->{"userturn"}[$j]){
            if($data->{"dialog"}[0]->{"turn"}[$i]->{"userturn"}[$j]->{"transcription"}){
                my $turnIndex = $data->{"dialog"}[0]->{"turn"}[$i]->{"userturn"}[$j]->{"turnnum"};
                my $answer = $data->{"dialog"}[0]->{"turn"}[$i]->{"userturn"}[$j]->{"transcription"}[0];
                $output->{"QuestionFormAnswers"}[0]->{"Answer"}[$answerIndex]->{"QuestionIdentifier"}[0] = "userturn[$turnIndex]";
                $output->{"QuestionFormAnswers"}[0]->{"Answer"}[$answerIndex]->{"FreeText"}[0] = $answer;
                $answerIndex++;
            }
            $j++;
        }
    }

    #print Dumper($output);
    my $outputData = XMLout($output, XMLDecl => '<?xml version="1.0" encoding="UTF-8"?>', RootName => undef, NoEscape => 1);

    #print $outputData;
    open(OUTFILE, ">$path/autocheck.xml");
    print OUTFILE ($outputData);
}