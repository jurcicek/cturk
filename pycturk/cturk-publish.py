#! /usr/bin/python

# To change this template, choose Tools | Templates
# and open the template in the editor.

__author__="Filip"
__date__ ="$22-Mar-2011 17:51:58$"

import time
import cturk

publishNumOfDialogues = 2

username, password, webService = cturk.getUserPasswordWebservice()

name = "Test an automated tourist information service"
description = "Rate a speech enabled tourist information system."
currencyCode = "GBP"
reward = ".2"
expireDate = str(int(time.time()+60*60*24*7)*1000)
assignmentTime = "6000"
autoApprovalTime = str(int(60*60*24*2))
maxHits = "40"
url = "http://camdial.org/~fj228/ct-phone/mturk.py"
frameHeight = "1600"


if __name__ == "__main__":
    publishedAssignementsFile = open("publishedAssignments.txt","w+")

    for i in range(publishNumOfDialogues):
        results = cturk.publish(publishedAssignementsFile, username, password, webService,
                    name, description, currencyCode, reward, expireDate, assignmentTime, autoApprovalTime, maxHits, url, frameHeight)

    publishedAssignementsFile.close()
    
