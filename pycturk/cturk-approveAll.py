#! /usr/bin/python

# To change this template, choose Tools | Templates
# and open the template in the editor.

__author__="Filip"
__date__ ="$23-Mar-2011 11:46:22$"

import cturk

username, password, webService = cturk.getUserPasswordWebservice()

if __name__ == "__main__":
    publishedAssignementsFile = open("publishedAssignments.txt","r")

    groupIds = set()
    for line in publishedAssignementsFile:
        groupId, hitId = line.strip().split(';')
        groupIds.add(groupId)

    assignments = set()
    for groupId in groupIds:
        results = cturk.getAssignments(username, password, webService, groupId, assignmentState = "Submitted")
        for result in results['data']:
            assignments.add(result['Assignment']['id'])

    for assignment in assignments:
        results = cturk.approve(username, password, webService, assignment)

    publishedAssignementsFile.close()
