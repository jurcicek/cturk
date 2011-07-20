#!/bin/sh

DTA=`echo ~/src/cturk-task4/cturk-transcriber/resources/wav/test1`

OLD_PWD=`pwd`
echo $OLD_PWD

cd ~/src/cturk-task4/cturk-transcriber/docs/
bash publish.sh.fj228 $DTA ~/src/cturk-task4/cturk-transcriber/resources/wav/auto-valid-refs-TownInfo

cd $OLD_PWD

