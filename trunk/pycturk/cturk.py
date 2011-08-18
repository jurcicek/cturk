#! /usr/bin/python

# To change this template, choose Tools | Templates
# and open the template in the editor.

__author__="Filip"
__date__ ="$23-Mar-2011 11:48:23$"

import urllib
import pprint
try:
    import json
except ImportError:
    import simplejson as json

"""

This library communicates with CTURK and enables users to:
 - publish hits
 - get info about hits
 - expire hits and groups of hits
 - accept hits
 - submit hits
 - approve hits
 - reject hits

"""

def getUserPasswordWebservice():
    f = open(".loginInfo.txt", "r")
    
    user = f.readline().strip()
    password = f.readline().strip()
    webService = f.readline().strip()
    
    return user, password, webService
    
def publish(publishedAssignementsFile, 
            username, password, webService,
            name, description, currencyCode, reward, expireDate, assignmentTime, autoApprovalTime, maxHits, url, frameHeight):
    """Publish a HIT on CTURK"""
    params = urllib.urlencode({'_username': username,
                               '_password': password,
                               'name': name,
                               'description': description,
                               'currencyCode': currencyCode,
                               'reward': reward,
                               'expireDate': expireDate,
                               'assignmentTime': assignmentTime,
                               'autoApprovalTime': autoApprovalTime,
                               'maxHits': maxHits,
                               'url': url,
                               'frameHeight': frameHeight,
                               })
    f = urllib.urlopen(webService+"/requesters/createHIT", params)
    results = json.load(f)

    print "="*80
    print 'Status:', results['status']
    print 'Info:',   results['info']
    print 'Data:'
    pprint.pprint(results['data'])

    groupId = results['data']['group_id']
    hitId = results['data']['id']
    publishedAssignementsFile.write(groupId+';'+hitId+'\n')

    return results

def getHITInfo(username, password, webService, hitId):
    """Get info about a particular assignmet from CTURK"""
    params = urllib.urlencode({'_username': username,
                               '_password': password
                               })
    f = urllib.urlopen(webService+"/requesters/getHITInfo/%s" % hitId, params)
    results = json.load(f)

    print "="*80
    print 'Status:', results['status']
    print 'Info:',   results['info']
    print 'Data:'
    pprint.pprint(results['data'])

    return results

def expireHIT(username, password, webService, hitId):
    """Expire a particular hit at CTURK"""
    params = urllib.urlencode({'_username': username,
                               '_password': password,
                               'hitId': hitId
                               })
    f = urllib.urlopen(webService+"/requesters/expireHIT", params)
    results = json.load(f)

    print "="*80
    print 'Status:', results['status']
    print 'Info:',   results['info']
    print 'Data:'
    pprint.pprint(results['data'])

    return results

def expireGroup(username, password, webService, groupId):
    """Expire a particular group at CTURK"""
    params = urllib.urlencode({'_username': username,
                               '_password': password,
                               'groupId': groupId
                               })
    f = urllib.urlopen(webService+"/requesters/expireHITGroup" , params)
    results = json.load(f)

    print "="*80
    print 'Status:', results['status']
    print 'Info:',   results['info']
    print 'Data:'
    pprint.pprint(results['data'])

    return results


def accept(username, password, webService, hitId):
    """Accept a particular hit from CTURK"""
    params = urllib.urlencode({'_username': username,
                               '_password': password,
                               'hitId': hitId
                               })
    f = urllib.urlopen(webService+"/workers/acceptHIT", params)
    results = json.load(f)

    print "="*80
    print 'Status:', results['status']
    print 'Info:',   results['info']
    print 'Data:'
    pprint.pprint(results['data'])

    return results

def submit(username, password, webService, assignmentId, data):
    """Submit a particular assignmet from CTURK"""
    data.update(  {'_username': username,
                   '_password': password,
                   'assignmentId': assignmentId,
                   })
    params = urllib.urlencode(data)
    f = urllib.urlopen(webService+"/workers/externalSubmit", params)
    results = json.load(f)

    print "="*80
    print 'Status:', results['status']
    print 'Info:',   results['info']
    print 'Data:'
    pprint.pprint(results['data'])

    return results

def getAssignments(username, password, webService, groupId = None, workerId = None, assignmentState = None):
    """Get info about a particular assignmet from CTURK
    
        assignmentState = ['Accepted', 'Submitted', 'Approved', 'Closed', 'Rejected', 'Expired']
    """
    params = urllib.urlencode({'_username': username,
                               '_password': password
                               })
    target = webService+"/requesters/getAssignmentList"
    if groupId:
        target = webService+"/requesters/getAssignmentList/%s" % groupId
    if workerId:
        target = webService+"/requesters/getAssignmentList/%s/%s" % (groupId,workerId)
    if assignmentState:
        target = webService+"/requesters/getAssignmentList/%s/%s/%s" % (groupId,workerId,assignmentState)
    f = urllib.urlopen(target, params)
    results = json.load(f)

    print "="*80
    print 'Status:', results['status']
    print 'Info:',   results['info']
    print 'Data:'
    pprint.pprint(results['data'])

    return results

def approve(username, password, webService, assignmentId, message = ""):
    """Approve a particular assignmet from CTURK"""
    params = urllib.urlencode({'_username': username,
                               '_password': password,
                               'assignmentId': assignmentId,
                               'message': message
                               })
    f = urllib.urlopen(webService+"/requesters/approveAssignment", params)
    results = json.load(f)

    print "="*80
    print 'Status:', results['status']
    print 'Info:',   results['info']
    print 'Data:'
    pprint.pprint(results['data'])

    return results

def reject(username, password, webService, assignmentId, message = ""):
    """Reject a particular assignmet from CTURK"""
    params = urllib.urlencode({'_username': username,
                               '_password': password,
                               'assignmentId': assignmentId,
                               'message': message
                               })
    f = urllib.urlopen(webService+"/requesters/rejectAssignment", params)
    results = json.load(f)

    print "="*80
    print 'Status:', results['status']
    print 'Info:',   results['info']
    print 'Data:'
    pprint.pprint(results['data'])

    return results

